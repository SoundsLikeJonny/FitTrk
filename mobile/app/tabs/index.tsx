import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  ActivityIndicator, RefreshControl, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetDailyLog, useDeleteFoodEntry, useGetSettings } from '@/src/api/generated/api';
import { getErrorMessage } from '@/src/api/customFetch';
import type { FoodEntry } from '@/src/api/generated/schemas';
import { Colors, Fonts, Spacing, Radius } from '@/src/theme';
import { calcEntryMacros, calcDayTotals, calcTargets } from '@/src/utils/macros';
import { MACROS } from '@/src/types';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function TodayScreen() {
  const router = useRouter();
  const dateStr = todayStr();
  const { data: dailyLog, isLoading, refetch, error: logError } = useGetDailyLog({ date: dateStr });
  const { data: settings } = useGetSettings();
  const deleteMutation = useDeleteFoodEntry();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const entries = dailyLog?.entries ?? [];
  const totals = calcDayTotals(entries);
  const targets = calcTargets(settings);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    const doDelete = () => {
      deleteMutation.mutate(
        { id },
        { onSuccess: () => refetch(), onError: (e) => {
          if (Platform.OS === 'web') alert(getErrorMessage(e));
          else Alert.alert('Error', getErrorMessage(e));
        }},
      );
    };
    if (Platform.OS === 'web') {
      if (confirm('Remove this entry?')) doDelete();
    } else {
      Alert.alert('Remove Entry', 'Remove this food entry?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const renderEntry = ({ item }: { item: FoodEntry }) => {
    const macros = calcEntryMacros(item);
    return (
      <View style={styles.entryCard}>
        <View style={styles.entryContent}>
          <Text style={styles.entryName} numberOfLines={1}>
            {item?.food?.name ?? 'Unknown'}
          </Text>
          <Text style={styles.entryMacros}>
            {macros.cal} cal · {macros.protein}p · {macros.carbs}c · {macros.fat}f
          </Text>
          <Text style={styles.entryMultiplier}>
            ×{item?.multiplier?.toFixed?.(1) ?? '1.0'}
          </Text>
        </View>
        <Pressable
          style={styles.deleteButton}
          onPress={() => handleDelete(item?.id)}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.destructive} />
        </Pressable>
      </View>
    );
  };

  if (isLoading && !dailyLog) {
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
        <Text style={styles.headerTitle}>Today</Text>
        <Text style={styles.headerDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item?.id ?? Math.random().toString()}
        renderItem={renderEntry}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.summaryCard}>
            <View style={styles.calRow}>
              <Text style={styles.calNumber}>{totals.cal}</Text>
              <Text style={styles.calLabel}> / {targets.cal} kcal</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, targets.cal > 0 ? (totals.cal / targets.cal) * 100 : 0)}%` },
                ]}
              />
            </View>
            <View style={styles.macroRow}>
              {MACROS.filter((m) => m.key !== 'cal').map((m) => (
                <View key={m.key} style={styles.macroItem}>
                  <Text style={styles.macroLabel}>{m.label}</Text>
                  <Text style={[styles.macroValue, { color: m.color }]}>
                    {totals[m.key]}g
                  </Text>
                  <Text style={styles.macroTarget}>/ {targets[m.key]}g</Text>
                  <View style={styles.macroBar}>
                    <View
                      style={[
                        styles.macroBarFill,
                        {
                          backgroundColor: m.color,
                          width: `${Math.min(100, targets[m.key] > 0 ? (totals[m.key] / targets[m.key]) * 100 : 0)}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          logError ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Failed to load food log</Text>
              <Pressable style={styles.retryButton} onPress={() => refetch()}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={48} color={Colors.dark.mutedForeground} />
              <Text style={styles.emptyTitle}>No food logged today</Text>
              <Text style={styles.emptyText}>Add your first meal</Text>
            </View>
          )
        }
      />

      <Pressable
        style={styles.fab}
        onPress={() => router.push('/food-picker')}
      >
        <Ionicons name="add" size={28} color="#fff" />
        <Text style={styles.fabText}>Add Food</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  headerTitle: { fontSize: 28, fontFamily: Fonts.display, color: Colors.dark.foreground, letterSpacing: -0.5 },
  headerDate: { fontSize: 14, fontFamily: Fonts.body, color: Colors.dark.mutedForeground, marginTop: 2 },
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  summaryCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  calRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: Spacing.sm },
  calNumber: { fontSize: 36, fontFamily: Fonts.monoBold, color: Colors.primary },
  calLabel: { fontSize: 16, fontFamily: Fonts.mono, color: Colors.dark.mutedForeground },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.dark.muted,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macroItem: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  macroLabel: { fontSize: 12, fontFamily: Fonts.body, color: Colors.dark.mutedForeground, marginBottom: 4 },
  macroValue: { fontSize: 18, fontFamily: Fonts.monoBold },
  macroTarget: { fontSize: 12, fontFamily: Fonts.mono, color: Colors.dark.mutedForeground, marginBottom: 6 },
  macroBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.dark.muted,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  macroBarFill: { height: '100%', borderRadius: Radius.full },
  entryCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryContent: { flex: 1 },
  entryName: { fontSize: 16, fontFamily: Fonts.bodyMedium, color: Colors.dark.foreground },
  entryMacros: { fontSize: 13, fontFamily: Fonts.mono, color: Colors.dark.mutedForeground, marginTop: 2 },
  entryMultiplier: { fontSize: 12, fontFamily: Fonts.mono, color: Colors.primary, marginTop: 2 },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: Radius.full,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: { color: '#fff', fontFamily: Fonts.bodySemiBold, fontSize: 16, marginLeft: 8 },
});
