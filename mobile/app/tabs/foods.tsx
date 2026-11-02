import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  ActivityIndicator, Modal, KeyboardAvoidingView, Platform,
  ScrollView, Alert,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useListFoods, useCreateFood, useUpdateFood, useDeleteFood,
} from '@/src/api/generated/api';
import { ApiError, getErrorMessage } from '@/src/api/customFetch';
import type { Food } from '@/src/api/generated/schemas';
import { Colors, Fonts, Spacing, Radius } from '@/src/theme';

type FormState = {
  name: string;
  amountG: string;
  cal: string;
  fatG: string;
  carbG: string;
  proteinG: string;
  typicalG: string;
};

const emptyForm: FormState = {
  name: '', amountG: '100', cal: '0', fatG: '0', carbG: '0', proteinG: '0', typicalG: '100',
};

const foodToForm = (f: Food): FormState => ({
  name: f.name,
  amountG: String(f.amountG),
  cal: String(f.cal),
  fatG: String(f.fatG),
  carbG: String(f.carbG),
  proteinG: String(f.proteinG),
  typicalG: String(f.typicalG),
});

const typicalCal = (f: Food) => Math.round((f.cal / (f.amountG || 1)) * f.typicalG);
const typicalProtein = (f: Food) => Math.round((f.proteinG / (f.amountG || 1)) * f.typicalG);

export default function FoodsScreen() {
  const [search, setSearch] = useState('');
  const { data: foods, isLoading, refetch } = useListFoods({ q: search || undefined });
  const createMutation = useCreateFood();
  const updateMutation = useUpdateFood();
  const deleteMutation = useDeleteFood();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Food | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [duplicates, setDuplicates] = useState<Food[]>([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const setField = (key: keyof FormState) => (value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const notify = (msg: string) => {
    if (Platform.OS === 'web') alert(msg);
    else Alert.alert(msg);
  };

  const toPayload = (force: boolean) => ({
    name: form.name.trim(),
    amountG: parseFloat(form.amountG) || 100,
    cal: parseFloat(form.cal) || 0,
    fatG: parseFloat(form.fatG) || 0,
    carbG: parseFloat(form.carbG) || 0,
    proteinG: parseFloat(form.proteinG) || 0,
    typicalG: parseFloat(form.typicalG) || 100,
    force,
  });

  const handleSave = async (force = false) => {
    if (!form.name.trim()) {
      notify('Name required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: toPayload(force) });
      } else {
        await createMutation.mutateAsync({ data: toPayload(force) });
      }
      setOpen(false);
      setDuplicates([]);
      refetch();
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        const body = e.body as { foods?: Food[] };
        setDuplicates(body?.foods ?? []);
      } else {
        notify(getErrorMessage(e, 'Failed to save food'));
      }
    } finally {
      setSaving(false);
    }
  };

  const useExisting = (food: Food) => {
    setEditing(food);
    setForm(foodToForm(food));
    setDuplicates([]);
  };

  const handleDelete = (food: Food) => {
    const doDelete = async () => {
      setDeletingId(food.id);
      try {
        await deleteMutation.mutateAsync({ id: food.id });
        refetch();
      } catch (e) {
        notify(getErrorMessage(e, 'Failed to delete food'));
      } finally {
        setDeletingId(null);
      }
    };
    Alert.alert('Delete Food', `Delete "${food.name}" from the database?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doDelete },
    ]);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDuplicates([]);
    setOpen(true);
  };

  const openEdit = (food: Food) => {
    setEditing(food);
    setForm(foodToForm(food));
    setDuplicates([]);
    setOpen(true);
  };

  const close = () => {
    if (saving) return;
    setOpen(false);
    setDuplicates([]);
  };

  const renderFood = ({ item }: { item: Food }) => (
    <View style={styles.foodCard}>
      <View style={styles.foodInfo}>
        <View style={styles.foodNameRow}>
          <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.badge, item.isCustom ? styles.badgeCustom : styles.badgeDatabase]}>
            <Text style={[styles.badgeText, item.isCustom ? styles.badgeTextCustom : styles.badgeTextDatabase]}>
              {item.isCustom ? 'Custom' : 'Database'}
            </Text>
          </View>
        </View>
        <Text style={styles.foodMeta}>{item.typicalG}g · {typicalCal(item)} cal · {typicalProtein(item)}g P</Text>
      </View>
      <Pressable onPress={() => openEdit(item)} hitSlop={8} style={styles.iconButton}>
        <Ionicons name="pencil" size={18} color={Colors.dark.mutedForeground} />
      </Pressable>
      <Pressable onPress={() => handleDelete(item)} hitSlop={8} style={styles.iconButton}>
        {deletingId === item.id ? (
          <ActivityIndicator size="small" color={Colors.destructive} />
        ) : (
          <Ionicons name="trash-outline" size={18} color={Colors.destructive} />
        )}
      </Pressable>
    </View>
  );

  const field = (label: string, key: keyof FormState, numeric = true) => (
    <TextInput
      label={label}
      value={form[key]}
      onChangeText={setField(key)}
      keyboardType={numeric ? 'numeric' : 'default'}
      mode="outlined"
      style={styles.input}
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
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Foods</Text>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          onPress={openAdd}
          hitSlop={8}
        >
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
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
          keyExtractor={(item) => item.id}
          renderItem={renderFood}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No foods found</Text>
            </View>
          }
        />
      )}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={close}
      >
        <Pressable style={styles.modalOverlay} onPress={close}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <ScrollView keyboardShouldPersistTaps="handled">
                <View style={styles.modalHandle} />
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{editing ? 'Edit Food' : 'Add Food'}</Text>
                  <Pressable onPress={close} hitSlop={8}>
                    <Ionicons name="close" size={24} color={Colors.dark.mutedForeground} />
                  </Pressable>
                </View>

                {duplicates.length > 0 && (
                  <View style={styles.duplicatePanel}>
                    <Text style={styles.duplicateTitle}>Already in database</Text>
                    <Text style={styles.duplicateHint}>
                      A food named "{form.name}" already exists. Use the existing one or save anyway.
                    </Text>
                    {duplicates.map((d) => (
                      <Pressable
                        key={d.id}
                        style={({ pressed }) => [styles.duplicateItem, pressed && styles.pressed]}
                        onPress={() => useExisting(d)}
                      >
                        <View style={styles.foodInfo}>
                          <Text style={styles.foodName} numberOfLines={1}>{d.name}</Text>
                          <Text style={styles.foodMeta}>{d.typicalG}g · {typicalCal(d)} cal · {typicalProtein(d)}g P</Text>
                        </View>
                        <Text style={styles.duplicateUse}>Use this</Text>
                      </Pressable>
                    ))}
                    <Pressable
                      style={[styles.saveAnywayButton, saving && styles.disabledButton]}
                      onPress={() => handleSave(true)}
                      disabled={saving}
                    >
                      <Text style={styles.saveAnywayText}>Save anyway</Text>
                    </Pressable>
                  </View>
                )}

                {field('Name', 'name', false)}
                <View style={styles.fieldRow}>
                  <View style={styles.fieldHalf}>{field('Calories', 'cal')}</View>
                  <View style={styles.fieldHalf}>{field('Protein (g)', 'proteinG')}</View>
                </View>
                <View style={styles.fieldRow}>
                  <View style={styles.fieldHalf}>{field('Fat (g)', 'fatG')}</View>
                  <View style={styles.fieldHalf}>{field('Carbs (g)', 'carbG')}</View>
                </View>
                <View style={styles.fieldRow}>
                  <View style={styles.fieldHalf}>{field('Per (g)', 'amountG')}</View>
                  <View style={styles.fieldHalf}>{field('Typical (g)', 'typicalG')}</View>
                </View>

                <Pressable
                  style={[styles.saveButton, saving && styles.disabledButton]}
                  onPress={() => handleSave()}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editing ? 'Save Changes' : 'Add to Database'}
                    </Text>
                  )}
                </Pressable>
              </ScrollView>
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: Fonts.display,
    color: Colors.dark.foreground,
    letterSpacing: -0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
    gap: 4,
  },
  addButtonText: { color: '#fff', fontSize: 14, fontFamily: Fonts.bodySemiBold, fontWeight: '600' },
  pressed: { opacity: 0.8 },
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
  foodInfo: { flex: 1 },
  foodNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  foodName: { fontSize: 16, fontFamily: Fonts.bodyMedium, color: Colors.dark.foreground, flexShrink: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  badgeCustom: { backgroundColor: Colors.dark.muted },
  badgeDatabase: { backgroundColor: 'rgba(34,197,94,0.15)' },
  badgeText: { fontSize: 10, fontFamily: Fonts.bodyMedium },
  badgeTextCustom: { color: Colors.dark.mutedForeground },
  badgeTextDatabase: { color: Colors.primary },
  foodMeta: { fontSize: 13, fontFamily: Fonts.mono, color: Colors.dark.mutedForeground, marginTop: 4 },
  iconButton: { padding: 8 },
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.dark.muted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: { fontSize: 20, fontFamily: Fonts.heading, color: Colors.dark.foreground },
  input: { backgroundColor: Colors.dark.card, marginBottom: Spacing.sm },
  fieldRow: { flexDirection: 'row', gap: Spacing.sm },
  fieldHalf: { flex: 1 },
  duplicatePanel: {
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  duplicateTitle: { fontSize: 15, fontFamily: Fonts.bodySemiBold, fontWeight: '600', color: Colors.primary },
  duplicateHint: {
    fontSize: 12,
    fontFamily: Fonts.body,
    color: Colors.dark.mutedForeground,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  duplicateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  duplicateUse: { fontSize: 13, fontFamily: Fonts.bodySemiBold, fontWeight: '600', color: Colors.primary },
  saveAnywayButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    alignItems: 'center',
    marginTop: Spacing.xs,
    minHeight: 40,
    justifyContent: 'center',
  },
  saveAnywayText: { color: '#fff', fontSize: 14, fontFamily: Fonts.bodySemiBold, fontWeight: '600' },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    minHeight: 48,
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontFamily: Fonts.bodySemiBold, fontWeight: '600' },
});
