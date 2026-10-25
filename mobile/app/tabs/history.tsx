import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useListSessions } from '@/src/api/generated/api';
import type { WorkoutSessionHistory } from '@/src/api/generated/schemas';
import { Colors, Fonts, Spacing, Radius } from '@/src/theme';
import { formatDate, formatDuration } from '@/src/utils/format';

export default function HistoryScreen() {
  const router = useRouter();
  const { data: sessions, isLoading, refetch, error } = useListSessions({ limit: 50, offset: 0 });
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderSession = ({ item }: { item: WorkoutSessionHistory }) => {
    const session = item as WorkoutSessionHistory & {
      name?: string;
      startedAt?: string;
      durationSec?: number | null;
      setLogs?: unknown[];
      template?: { name?: string } | null;
    };
    const name = session?.name || session?.template?.name || 'Workout';
    const setsCount = (session?.setLogs as unknown[])?.length ?? 0;
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => router.push(`/session/${session?.id}`)}
      >
        <View style={styles.cardLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="fitness" size={20} color={Colors.primary} />
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{name}</Text>
          <Text style={styles.cardSubtitle}>
            {formatDate(session?.startedAt)} · {formatDuration(session?.durationSec)} · {setsCount} set{setsCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.dark.mutedForeground} />
      </Pressable>
    );
  };

  if (isLoading && !sessions) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
      </View>
      <FlatList
        data={sessions ?? []}
        keyExtractor={(item) => (item as unknown as { id: string })?.id ?? Math.random().toString()}
        renderItem={renderSession}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Failed to load history</Text>
              <Pressable style={styles.retryButton} onPress={() => refetch()}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={48} color={Colors.dark.mutedForeground} />
              <Text style={styles.emptyTitle}>No workouts yet</Text>
              <Text style={styles.emptyText}>Start your first workout</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md },
  headerTitle: { fontSize: 28, fontFamily: Fonts.display, color: Colors.dark.foreground, letterSpacing: -0.5 },
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  cardLeft: { marginRight: Spacing.md },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontFamily: Fonts.bodyMedium, color: Colors.dark.foreground },
  cardSubtitle: { fontSize: 13, fontFamily: Fonts.body, color: Colors.dark.mutedForeground, marginTop: 2 },
  emptyContainer: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyTitle: { fontSize: 18, fontFamily: Fonts.heading, color: Colors.dark.foreground, marginTop: Spacing.md },
  emptyText: { fontSize: 14, fontFamily: Fonts.body, color: Colors.dark.mutedForeground, marginTop: Spacing.xs },
  retryButton: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  retryText: { color: '#fff', fontFamily: Fonts.bodySemiBold, fontSize: 14 },
});
