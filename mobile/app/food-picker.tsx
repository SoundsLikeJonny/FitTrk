import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  ActivityIndicator, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useListFoods, useAddFoodEntry } from '@/src/api/generated/api';
import { getErrorMessage } from '@/src/api/customFetch';
import type { Food } from '@/src/api/generated/schemas';
import { Colors, Fonts, Spacing, Radius } from '@/src/theme';

export default function FoodPickerScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: foods, isLoading } = useListFoods({ q: search || undefined });
  const addMutation = useAddFoodEntry();

  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [multiplier, setMultiplier] = useState('1');
  const [adding, setAdding] = useState(false);

  const previewMacros = useMemo(() => {
    if (!selectedFood) return null;
    const m = parseFloat(multiplier) || 1;
    return {
      cal: Math.round((selectedFood?.cal ?? 0) * m),
      protein: Math.round((selectedFood?.proteinG ?? 0) * m),
      carbs: Math.round((selectedFood?.carbG ?? 0) * m),
      fat: Math.round((selectedFood?.fatG ?? 0) * m),
    };
  }, [selectedFood, multiplier]);

  const handleAdd = async () => {
    if (!selectedFood) return;
    setAdding(true);
    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      await addMutation.mutateAsync({
        data: {
          foodId: selectedFood.id,
          multiplier: parseFloat(multiplier) || 1,
          date: dateStr,
        },
      });
      setSelectedFood(null);
      setMultiplier('1');
      router.back();
    } catch (e) {
      alert(getErrorMessage(e, 'Failed to add food'));
    } finally {
      setAdding(false);
    }
  };

  const renderFood = ({ item }: { item: Food }) => (
    <Pressable
      style={({ pressed }) => [styles.foodCard, pressed && styles.foodCardPressed]}
      onPress={() => {
        setSelectedFood(item);
        setMultiplier('1');
      }}
    >
      <View style={styles.foodInfo}>
        <Text style={styles.foodName} numberOfLines={1}>{item?.name ?? 'Unknown'}</Text>
        <Text style={styles.foodMeta}>
          {item?.cal ?? 0} cal · {item?.proteinG ?? 0}p · {item?.carbG ?? 0}c · {item?.fatG ?? 0}f
        </Text>
        <Text style={styles.foodServing}>{item?.amountG ?? 0}g serving</Text>
      </View>
      <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark.foreground} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Food</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search foods"
          value={search}
          onChangeText={setSearch}
          mode="outlined"
          style={styles.searchInput}
          textColor={Colors.dark.foreground}
          outlineColor={Colors.dark.border}
          activeOutlineColor={Colors.primary}
          left={<TextInput.Icon icon="magnify" color={Colors.dark.mutedForeground} />}
          placeholderTextColor={Colors.dark.mutedForeground}
          theme={{
            colors: {
              onSurfaceVariant: Colors.dark.mutedForeground,
              background: Colors.dark.card,
            },
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={foods ?? []}
          keyExtractor={(item) => item?.id ?? Math.random().toString()}
          renderItem={renderFood}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No foods found</Text>
            </View>
          }
        />
      )}

      {/* Bottom sheet modal for selected food */}
      <Modal
        visible={!!selectedFood}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedFood(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedFood(null)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>{selectedFood?.name ?? 'Food'}</Text>
              <Text style={styles.modalServing}>
                {selectedFood?.amountG ?? 0}g per serving
              </Text>

              <TextInput
                label="Multiplier"
                value={multiplier}
                onChangeText={setMultiplier}
                keyboardType="numeric"
                mode="outlined"
                style={styles.multiplierInput}
                textColor={Colors.dark.foreground}
                outlineColor={Colors.dark.border}
                activeOutlineColor={Colors.primary}
                theme={{
                  colors: {
                    onSurfaceVariant: Colors.dark.mutedForeground,
                    background: Colors.dark.card,
                  },
                }}
              />

              {previewMacros && (
                <View style={styles.previewRow}>
                  <View style={styles.previewItem}>
                    <Text style={[styles.previewValue, { color: Colors.primary }]}>{previewMacros.cal}</Text>
                    <Text style={styles.previewLabel}>cal</Text>
                  </View>
                  <View style={styles.previewItem}>
                    <Text style={[styles.previewValue, { color: '#3b82f6' }]}>{previewMacros.protein}g</Text>
                    <Text style={styles.previewLabel}>protein</Text>
                  </View>
                  <View style={styles.previewItem}>
                    <Text style={[styles.previewValue, { color: '#f59e0b' }]}>{previewMacros.carbs}g</Text>
                    <Text style={styles.previewLabel}>carbs</Text>
                  </View>
                  <View style={styles.previewItem}>
                    <Text style={[styles.previewValue, { color: '#ef4444' }]}>{previewMacros.fat}g</Text>
                    <Text style={styles.previewLabel}>fat</Text>
                  </View>
                </View>
              )}

              <Pressable
                style={[styles.addButton, adding && styles.disabledButton]}
                onPress={handleAdd}
                disabled={adding}
              >
                {adding ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.addButtonText}>Add</Text>
                )}
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontFamily: Fonts.heading, color: Colors.dark.foreground },
  searchContainer: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  searchInput: { backgroundColor: Colors.dark.card },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  foodCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodCardPressed: { opacity: 0.8 },
  foodInfo: { flex: 1 },
  foodName: { fontSize: 16, fontFamily: Fonts.bodyMedium, color: Colors.dark.foreground },
  foodMeta: { fontSize: 13, fontFamily: Fonts.mono, color: Colors.dark.mutedForeground, marginTop: 2 },
  foodServing: { fontSize: 12, fontFamily: Fonts.body, color: Colors.dark.mutedForeground, marginTop: 2 },
  emptyContainer: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { fontSize: 14, fontFamily: Fonts.body, color: Colors.dark.mutedForeground },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.dark.card,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.dark.muted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: { fontSize: 20, fontFamily: Fonts.heading, color: Colors.dark.foreground },
  modalServing: { fontSize: 14, fontFamily: Fonts.body, color: Colors.dark.mutedForeground, marginTop: 4, marginBottom: Spacing.md },
  multiplierInput: { backgroundColor: Colors.dark.card, marginBottom: Spacing.md },
  previewRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.lg },
  previewItem: { alignItems: 'center' },
  previewValue: { fontSize: 20, fontFamily: Fonts.monoBold },
  previewLabel: { fontSize: 12, fontFamily: Fonts.body, color: Colors.dark.mutedForeground, marginTop: 2 },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.6 },
  addButtonText: { color: '#fff', fontSize: 16, fontFamily: Fonts.bodySemiBold, fontWeight: '600' },
});
