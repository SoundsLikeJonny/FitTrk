import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, Alert, Platform, TextInput as RNTextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useGetSession, useAddSessionSet, useUpdateSessionSet,
  useUpdateSession, useGetSettings,
} from '@/src/api/generated/api';
import { getErrorMessage } from '@/src/api/customFetch';
import type { SetLog } from '@/src/api/generated/schemas';
import { Colors, Fonts, Spacing, Radius } from '@/src/theme';
import { formatDuration } from '@/src/utils/format';

export default function ActiveSessionScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isLoading, refetch } = useGetSession(id, {
    query: { enabled: !!id },
  });
  const { data: settings } = useGetSettings();
  const addSetMutation = useAddSessionSet();
  const updateSetMutation = useUpdateSessionSet();
  const updateSessionMutation = useUpdateSession();

  const isFinished = !!session?.finishedAt;

  // Elapsed timer
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!session?.startedAt || isFinished) return;
    startTimeRef.current = new Date(session.startedAt);
    const interval = setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.startedAt, isFinished]);

  // Rest timer
  const [restTime, setRestTime] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRestTimer = useCallback(() => {
    const defaultRest = settings?.restTimerDefault ?? 90;
    setRestTime(defaultRest);
    setShowRestTimer(true);
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    restIntervalRef.current = setInterval(() => {
      setRestTime((prev) => {
        if (prev <= 1) {
          if (restIntervalRef.current) clearInterval(restIntervalRef.current);
          setShowRestTimer(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [settings?.restTimerDefault]);

  const skipRest = () => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setShowRestTimer(false);
    setRestTime(0);
  };

  useEffect(() => {
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, []);

  // Group sets by exercise
  const setLogs = session?.setLogs ?? [];
  const exerciseGroups = React.useMemo(() => {
    const map = new Map<string, { name: string; weightType: string; sets: SetLog[] }>();
    for (const s of setLogs) {
      const exId = s?.exerciseId ?? '';
      if (!map.has(exId)) {
        map.set(exId, {
          name: s?.exercise?.name ?? 'Exercise',
          weightType: s?.exercise?.weightType ?? '',
          sets: [],
        });
      }
      map.get(exId)?.sets?.push(s);
    }
    return Array.from(map.entries());
  }, [setLogs]);

  const handleToggleSet = async (set: SetLog) => {
    if (isFinished) return;
    try {
      await updateSetMutation.mutateAsync({
        id,
        data: {
          setId: set.id,
          completed: !set.completed,
          weight: set.weight,
          reps: set.reps,
        },
      });
      if (!set.completed) startRestTimer();
      refetch();
    } catch (e) {
      // silently fail
    }
  };

  const handleAddSet = async (exerciseId: string) => {
    if (isFinished) return;
    const exerciseSets = setLogs.filter((s) => s?.exerciseId === exerciseId);
    const lastSet = exerciseSets?.[exerciseSets.length - 1];
    try {
      await addSetMutation.mutateAsync({
        id,
        data: {
          exerciseId,
          setNumber: (exerciseSets?.length ?? 0) + 1,
          weight: lastSet?.weight ?? 0,
          reps: lastSet?.reps ?? 0,
        },
      });
      refetch();
    } catch (e) {
      // silently fail
    }
  };

  const handleFinish = async () => {
    const doFinish = async () => {
      try {
        await updateSessionMutation.mutateAsync({
          id,
          data: {
            finishedAt: new Date().toISOString(),
            durationSec: elapsed,
          },
        });
        router.back();
      } catch (e) {
        const msg = getErrorMessage(e, 'Failed to finish workout');
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Error', msg);
      }
    };
    if (Platform.OS === 'web') {
      if (confirm('Finish this workout?')) doFinish();
    } else {
      Alert.alert('Finish Workout', 'Are you sure you want to finish?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Finish', onPress: doFinish },
      ]);
    }
  };

  if (!id || isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {session?.name ?? 'Session'}
          </Text>
          {!isFinished && (
            <Text style={styles.elapsedText}>{formatDuration(elapsed)}</Text>
          )}
          {isFinished && (
            <Text style={styles.finishedBadge}>Completed</Text>
          )}
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* Rest timer overlay */}
      {showRestTimer && (
        <View style={styles.restTimerBar}>
          <Ionicons name="timer" size={18} color="#fff" />
          <Text style={styles.restTimerText}>Rest: {restTime}s</Text>
          <Pressable onPress={skipRest} hitSlop={8}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {exerciseGroups.map(([exId, group]) => (
          <View key={exId} style={styles.exerciseSection}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{group.name}</Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{group.weightType}</Text>
              </View>
            </View>

            <View style={styles.setTableHeader}>
              <Text style={[styles.setHeaderText, { flex: 0.5 }]}>Set</Text>
              <Text style={[styles.setHeaderText, { flex: 1 }]}>Weight</Text>
              <Text style={[styles.setHeaderText, { flex: 1 }]}>Reps</Text>
              <Text style={[styles.setHeaderText, { flex: 0.5 }]}>Done</Text>
            </View>

            {group.sets.map((s) => (
              <SetRow
                key={s.id}
                set={s}
                onToggle={() => handleToggleSet(s)}
                onUpdate={(weight, reps) => {
                  if (isFinished) return;
                  updateSetMutation.mutate(
                    { id, data: { setId: s.id, weight, reps, completed: s.completed } },
                    { onSuccess: () => refetch() },
                  );
                }}
                disabled={isFinished}
              />
            ))}

            {!isFinished && (
              <Pressable style={styles.addSetButton} onPress={() => handleAddSet(exId)}>
                <Ionicons name="add" size={18} color={Colors.primary} />
                <Text style={styles.addSetText}>Add Set</Text>
              </Pressable>
            )}
          </View>
        ))}

        {exerciseGroups.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No exercises logged yet</Text>
          </View>
        )}
      </ScrollView>

      {!isFinished && (
        <View style={styles.bottomBar}>
          <Pressable
            style={[styles.finishButton, updateSessionMutation.isPending && styles.disabledButton]}
            onPress={handleFinish}
            disabled={updateSessionMutation.isPending}
          >
            {updateSessionMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.finishButtonText}>Finish Workout</Text>
            )}
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

function SetRow({
  set,
  onToggle,
  onUpdate,
  disabled,
}: {
  set: SetLog;
  onToggle: () => void;
  onUpdate: (weight: number, reps: number) => void;
  disabled: boolean;
}) {
  const [weight, setWeight] = useState(String(set?.weight ?? 0));
  const [reps, setReps] = useState(String(set?.reps ?? 0));

  return (
    <View style={[styles.setRow, set?.completed && styles.setRowCompleted]}>
      <Text style={[styles.setNumber, { flex: 0.5 }]}>{set?.setNumber ?? 0}</Text>
      <View style={{ flex: 1, paddingHorizontal: 4 }}>
        <RNTextInput
          style={styles.setInput}
          value={weight}
          onChangeText={setWeight}
          onBlur={() => onUpdate(parseFloat(weight) || 0, parseFloat(reps) || 0)}
          keyboardType="numeric"
          editable={!disabled}
          placeholderTextColor={Colors.dark.mutedForeground}
        />
      </View>
      <View style={{ flex: 1, paddingHorizontal: 4 }}>
        <RNTextInput
          style={styles.setInput}
          value={reps}
          onChangeText={setReps}
          onBlur={() => onUpdate(parseFloat(weight) || 0, parseFloat(reps) || 0)}
          keyboardType="numeric"
          editable={!disabled}
          placeholderTextColor={Colors.dark.mutedForeground}
        />
      </View>
      <Pressable
        style={[styles.checkBox, set?.completed && styles.checkBoxChecked, { flex: 0.5 }]}
        onPress={onToggle}
        disabled={disabled}
        hitSlop={8}
      >
        {set?.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: Fonts.heading, color: Colors.dark.foreground },
  elapsedText: { fontSize: 14, fontFamily: Fonts.mono, color: Colors.primary, marginTop: 2 },
  finishedBadge: {
    fontSize: 12,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.primary,
    backgroundColor: Colors.dark.muted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginTop: 4,
    overflow: 'hidden',
  },
  restTimerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  restTimerText: { flex: 1, fontSize: 16, fontFamily: Fonts.monoBold, color: '#fff' },
  skipText: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: '#fff', fontWeight: '600' },
  scrollContent: { paddingHorizontal: Spacing.md, paddingBottom: 120 },
  exerciseSection: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  exerciseName: { flex: 1, fontSize: 16, fontFamily: Fonts.bodyMedium, color: Colors.dark.foreground },
  typeBadge: { backgroundColor: Colors.dark.muted, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.sm },
  typeBadgeText: { fontSize: 11, fontFamily: Fonts.body, color: Colors.dark.mutedForeground, textTransform: 'capitalize' },
  setTableHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, paddingHorizontal: 4 },
  setHeaderText: { fontSize: 12, fontFamily: Fonts.body, color: Colors.dark.mutedForeground, textAlign: 'center' },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: Radius.sm,
    marginBottom: 2,
  },
  setRowCompleted: { backgroundColor: 'rgba(34, 197, 94, 0.08)' },
  setNumber: { fontSize: 14, fontFamily: Fonts.mono, color: Colors.dark.mutedForeground, textAlign: 'center' },
  setInput: {
    backgroundColor: Colors.dark.muted,
    borderRadius: Radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 8,
    color: Colors.dark.foreground,
    fontSize: 14,
    fontFamily: Fonts.mono,
    textAlign: 'center',
  },
  checkBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  checkBoxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  addSetText: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: Colors.primary, marginLeft: 4 },
  emptyContainer: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { fontSize: 14, fontFamily: Fonts.body, color: Colors.dark.mutedForeground },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.dark.background,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  finishButton: {
    backgroundColor: Colors.destructive,
    paddingVertical: 16,
    borderRadius: Radius.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.6 },
  finishButtonText: { color: '#fff', fontSize: 18, fontFamily: Fonts.bodySemiBold, fontWeight: '600' },
});
