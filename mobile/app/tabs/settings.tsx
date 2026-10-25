import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { TextInput, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useGetSettings, useUpdateSettings, useGetMobileAuthMe } from '@/src/api/generated/api';
import { getErrorMessage } from '@/src/api/customFetch';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors, Fonts, Spacing, Radius } from '@/src/theme';
import type { UserSettings } from '@/src/api/generated/schemas';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { data: settings, isLoading, refetch } = useGetSettings();
  const updateMutation = useUpdateSettings();

  const [mode, setMode] = useState('cut');
  const [weightLb, setWeightLb] = useState('');
  const [cutDeficit, setCutDeficit] = useState('');
  const [bulkSurplus, setBulkSurplus] = useState('');
  const [calMultiplier, setCalMultiplier] = useState('');
  const [proteinMultiplier, setProteinMultiplier] = useState('');
  const [proteinMinMultiplier, setProteinMinMultiplier] = useState('');
  const [fatMinMultiplier, setFatMinMultiplier] = useState('');
  const [restTimerDefault, setRestTimerDefault] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    if (settings) {
      setMode(settings?.mode ?? 'cut');
      setWeightLb(String(settings?.weightLb ?? 150));
      setCutDeficit(String(settings?.cutDeficit ?? 500));
      setBulkSurplus(String(settings?.bulkSurplus ?? 300));
      setCalMultiplier(String(settings?.calMultiplier ?? 15));
      setProteinMultiplier(String(settings?.proteinMultiplier ?? 1));
      setProteinMinMultiplier(String(settings?.proteinMinMultiplier ?? 0.8));
      setFatMinMultiplier(String(settings?.fatMinMultiplier ?? 0.3));
      setRestTimerDefault(String(settings?.restTimerDefault ?? 90));
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMutation.mutateAsync({
        data: {
          mode,
          weightLb: parseFloat(weightLb) || 150,
          cutDeficit: parseFloat(cutDeficit) || 500,
          bulkSurplus: parseFloat(bulkSurplus) || 300,
          calMultiplier: parseFloat(calMultiplier) || 15,
          proteinMultiplier: parseFloat(proteinMultiplier) || 1,
          proteinMinMultiplier: parseFloat(proteinMinMultiplier) || 0.8,
          fatMinMultiplier: parseFloat(fatMinMultiplier) || 0.3,
          restTimerDefault: parseInt(restTimerDefault, 10) || 90,
        },
      });
      if (Platform.OS === 'web') alert('Settings saved');
      else Alert.alert('Settings saved');
    } catch (e) {
      const msg = getErrorMessage(e, 'Failed to save settings');
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    const doLogout = () => logout();
    if (Platform.OS === 'web') {
      doLogout();
    } else {
      Alert.alert('Sign Out', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: doLogout },
      ]);
    }
  };

  const inputTheme = {
    colors: {
      onSurfaceVariant: Colors.dark.mutedForeground,
      background: Colors.dark.card,
    },
  };

  if (isLoading && !settings) {
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
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.headerTitle}>Settings</Text>

          <View style={styles.userCard}>
            <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
          </View>

          <Text style={styles.sectionTitle}>Mode</Text>
          <SegmentedButtons
            value={mode}
            onValueChange={setMode}
            buttons={[
              { value: 'cut', label: 'Cut', checkedColor: Colors.primary },
              { value: 'bulk', label: 'Bulk', checkedColor: Colors.primary },
              { value: 'maintain', label: 'Maintain', checkedColor: Colors.primary },
            ]}
            style={styles.segmented}
            theme={{
              colors: {
                secondaryContainer: Colors.dark.muted,
                onSecondaryContainer: Colors.primary,
                onSurface: Colors.dark.foreground,
                outline: Colors.dark.border,
              },
            }}
          />

          <TextInput
            label="Weight (lb)"
            value={weightLb}
            onChangeText={setWeightLb}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            textColor={Colors.dark.foreground}
            outlineColor={Colors.dark.border}
            activeOutlineColor={Colors.primary}
            theme={inputTheme}
          />

          {mode === 'cut' && (
            <TextInput
              label="Cut Deficit"
              value={cutDeficit}
              onChangeText={setCutDeficit}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              textColor={Colors.dark.foreground}
              outlineColor={Colors.dark.border}
              activeOutlineColor={Colors.primary}
              theme={inputTheme}
            />
          )}

          {mode === 'bulk' && (
            <TextInput
              label="Bulk Surplus"
              value={bulkSurplus}
              onChangeText={setBulkSurplus}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              textColor={Colors.dark.foreground}
              outlineColor={Colors.dark.border}
              activeOutlineColor={Colors.primary}
              theme={inputTheme}
            />
          )}

          <Text style={styles.sectionTitle}>Macro Targets</Text>

          <TextInput
            label="Calorie Multiplier"
            value={calMultiplier}
            onChangeText={setCalMultiplier}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            textColor={Colors.dark.foreground}
            outlineColor={Colors.dark.border}
            activeOutlineColor={Colors.primary}
            theme={inputTheme}
          />

          <TextInput
            label="Protein Multiplier"
            value={proteinMultiplier}
            onChangeText={setProteinMultiplier}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            textColor={Colors.dark.foreground}
            outlineColor={Colors.dark.border}
            activeOutlineColor={Colors.primary}
            theme={inputTheme}
          />

          <TextInput
            label="Protein Min Multiplier"
            value={proteinMinMultiplier}
            onChangeText={setProteinMinMultiplier}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            textColor={Colors.dark.foreground}
            outlineColor={Colors.dark.border}
            activeOutlineColor={Colors.primary}
            theme={inputTheme}
          />

          <TextInput
            label="Fat Min Multiplier"
            value={fatMinMultiplier}
            onChangeText={setFatMinMultiplier}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            textColor={Colors.dark.foreground}
            outlineColor={Colors.dark.border}
            activeOutlineColor={Colors.primary}
            theme={inputTheme}
          />

          <Text style={styles.sectionTitle}>Timer</Text>

          <TextInput
            label="Rest Timer Default (seconds)"
            value={restTimerDefault}
            onChangeText={setRestTimerDefault}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            textColor={Colors.dark.foreground}
            outlineColor={Colors.dark.border}
            activeOutlineColor={Colors.primary}
            theme={inputTheme}
          />

          <Pressable
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </Pressable>

          <Pressable style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.background },
  flex: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl, paddingTop: Spacing.md },
  headerTitle: { fontSize: 28, fontFamily: Fonts.display, color: Colors.dark.foreground, letterSpacing: -0.5, marginBottom: Spacing.lg },
  userCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  userName: { fontSize: 18, fontFamily: Fonts.heading, color: Colors.dark.foreground },
  userEmail: { fontSize: 14, fontFamily: Fonts.body, color: Colors.dark.mutedForeground, marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.heading,
    color: Colors.dark.foreground,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  segmented: { marginBottom: Spacing.md },
  input: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.dark.card,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
    minHeight: 48,
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontFamily: Fonts.bodySemiBold, fontWeight: '600' },
  signOutButton: {
    marginTop: Spacing.lg,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.destructive,
    minHeight: 48,
    justifyContent: 'center',
  },
  signOutText: { color: Colors.destructive, fontSize: 16, fontFamily: Fonts.bodySemiBold, fontWeight: '600' },
});
