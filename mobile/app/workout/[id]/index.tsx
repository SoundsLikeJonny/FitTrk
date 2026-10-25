import React from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetWorkout, useStartSession } from '@/src/api/generated/api';
import { getErrorMessage } from '@/src/api/customFetch';
import type { TemplateExercise } from '@/src/api/generated/schemas';
import { Colors, Fonts, Spacing, Radius } from '@/src/theme';

const WEIGHT_TYPE_ICONS: Record<string, string> = {
  barbell: 'barbell',
  dumbbell: 'fitness',
  kettlebell: 'flame',
  bodyweight: 'body',
  machine: 'cog',
  cable: 'git-commit',
};

export default function WorkoutDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: workout, isLoading, error } = useGetWorkout(id, {
    query: { enabled: !!id },
  });
  const startMutation = useStartSession();

  const handleStart = async () => {
    try {
      const session = await startMutation.mutateAsync({
        data: { templateId: id, name: workout?.name },
      });
      if (session?.id) {
        router.push(`/session/${session.id}`);
      }
    } catch (e) {
      const msg = getErrorMessage(e, 'Failed to start workout');
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Error', msg);
    }
  };

  const renderExercise = ({ item }: { item: TemplateExercise }) => {
    const ex = item?.exercise;
    const iconName = WEIGHT_TYPE_ICONS[ex?.weightType ?? ''] ?? 'barbell';
    return (
      <View style={styles.exerciseCard}>
        <View style={styles.exerciseIcon}>
          <Ionicons name={iconName as 'barbell'} size={20} color={Colors.primary} />
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName} numberOfLines={1}>
            {ex?.name ?? 'Exercise'}
          </Text>
          <Text style={styles.exerciseMeta}>
            {item?.sets ?? 0} sets × {item?.reps ?? 0} reps
            {(item?.weight ?? 0) > 0 ? ` · ${item.weight} lbs` : ''}
          </Text>
          {(ex?.restSeconds ?? 0) > 0 && (
            <Text style={styles.exerciseRest}>Rest: {ex?.restSeconds}s</Text>
          )}
        </View>
        <View style={styles.weightBadge}>
          <Text style={styles.weightBadgeText}>{ex?.weightType ?? 'barbell'}</Text>
        </View>
      </View>
    );
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

  if (error || !workout) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.dark.foreground} />
          </Pressable>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Failed to load workout</Text>
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryText}>Go Back</Text>
          </Pressable>
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
        <Text style={styles.headerTitle} numberOfLines={1}>{workout?.name ?? 'Workout'}</Text>
        <View style={styles.backBtn} />
      </View>

      <FlatList
        data={workout?.exercises ?? []}
        keyExtractor={(item) => item?.id ?? Math.random().toString()}
        renderItem={renderExercise}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No exercises in this workout</Text>
          </View>
        }
      />

      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.startButton, startMutation.isPending && styles.disabledButton]}
          onPress={handleStart}
          disabled={startMutation.isPending}
        >
          {startMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.startButtonText}>Start Workout</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
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
  headerTitle: { flex: 1, fontSize: 20, fontFamily: Fonts.heading, color: Colors.dark.foreground, textAlign: 'center' },
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: 120 },
  exerciseCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 16, fontFamily: Fonts.bodyMedium, color: Colors.dark.foreground },
  exerciseMeta: { fontSize: 14, fontFamily: Fonts.mono, color: Colors.dark.mutedForeground, marginTop: 2 },
  exerciseRest: { fontSize: 12, fontFamily: Fonts.body, color: Colors.dark.mutedForeground, marginTop: 2 },
  weightBadge: {
    backgroundColor: Colors.dark.muted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  weightBadgeText: { fontSize: 11, fontFamily: Fonts.body, color: Colors.dark.mutedForeground, textTransform: 'capitalize' },
  emptyContainer: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { fontSize: 14, fontFamily: Fonts.body, color: Colors.dark.mutedForeground },
  retryButton: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  retryText: { color: '#fff', fontFamily: Fonts.bodySemiBold, fontSize: 14 },
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
  startButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 52,
  },
  disabledButton: { opacity: 0.6 },
  startButtonText: { color: '#fff', fontSize: 18, fontFamily: Fonts.bodySemiBold, fontWeight: '600', marginLeft: 8 },
});
