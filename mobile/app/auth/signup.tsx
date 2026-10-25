import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { getErrorMessage } from '@/src/api/customFetch';
import { Colors, Fonts, Spacing, Radius } from '@/src/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
    } catch (e) {
      setError(getErrorMessage(e, 'Could not create account'));
    } finally {
      setLoading(false);
    }
  };

  const inputTheme = {
    colors: {
      onSurfaceVariant: Colors.dark.mutedForeground,
      background: Colors.dark.card,
    },
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.heading}>Create Account</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            mode="outlined"
            style={styles.input}
            textColor={Colors.dark.foreground}
            outlineColor={Colors.dark.border}
            activeOutlineColor={Colors.primary}
            theme={inputTheme}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            mode="outlined"
            style={styles.input}
            textColor={Colors.dark.foreground}
            outlineColor={Colors.dark.border}
            activeOutlineColor={Colors.primary}
            theme={inputTheme}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
            textColor={Colors.dark.foreground}
            outlineColor={Colors.dark.border}
            activeOutlineColor={Colors.primary}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
                color={Colors.dark.mutedForeground}
              />
            }
            theme={inputTheme}
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
            textColor={Colors.dark.foreground}
            outlineColor={Colors.dark.border}
            activeOutlineColor={Colors.primary}
            theme={inputTheme}
          />

          <Pressable
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Create Account</Text>
            )}
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.linkText}>Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.background },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  logoContainer: { alignItems: 'center', marginBottom: Spacing.lg },
  logo: { width: 72, height: 72, borderRadius: Radius.lg },
  heading: {
    fontSize: 24,
    fontFamily: Fonts.heading,
    color: Colors.dark.foreground,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  input: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.dark.card,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    minHeight: 48,
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.bodySemiBold,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    color: Colors.dark.mutedForeground,
    fontSize: 14,
    fontFamily: Fonts.body,
  },
  linkText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: Fonts.bodySemiBold,
    fontWeight: '600',
  },
  errorText: {
    color: Colors.destructive,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontFamily: Fonts.body,
  },
});
