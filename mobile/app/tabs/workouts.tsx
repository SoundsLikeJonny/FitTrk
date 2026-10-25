import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useListWorkouts } from '@/src/api/generated/api';
import type { WorkoutTemplate } from '@/src/api/generated/schemas';
import { Colors, Fonts, Spacing, Radius } from '@/src/theme';

export default function WorkoutsScreen() {
  const router = useRouter();
  const { data: workouts, isLoading, refetch, error } = useListWorkouts();
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

  const renderWorkout = ({ item }: { item: WorkoutTemplate }) => {
    const exerciseCount = item?.exercises?.length ?? 0;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() => router.push(`/workout/${item?.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="barbell" size={20} color={Colors.primary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item?.name ?? 'Untitled'}
            </Text>
            <Text style={styles.cardSubtitle}>
              {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.dark.mutedForeground} />
        </View>
      </Pressable>
    );
  };

  if (isLoading && !workouts) {
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
        <Text style={styles.headerTitle}>Workouts</Text>
      </View>
      <FlatList
        data={workouts ?? []}
        keyExtractor={(item) => item?.id ?? Math.random().toString()}
        renderItem={renderWorkout}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Failed to load workouts</Text>
              <Pressable style={styles.retryButton} onPress={() => refetch()}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="barbell-outline" size={48} color={Colors.dark.mutedForeground} />
              <Text style={styles.emptyTitle}>No workouts yet</Text>
              <Text style={styles.emptyText}>Create your first workout</Text>
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
  },
  cardPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: { flex: 1, marginLeft: Spacing.md },
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
