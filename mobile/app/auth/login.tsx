import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useAuth } from '@/src/contexts/AuthContext';
import { getErrorMessage } from '@/src/api/customFetch';
import { Colors, Fonts, Spacing, Radius } from '@/src/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

export default function LoginScreen() {
  const { login, storeToken } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(getErrorMessage(e, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSSO = async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({ path: 'auth/callback' });
      const authUrl = `${BASE_URL}/api/mobile-auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;

      if (Platform.OS === 'web') {
        window.location.href = authUrl;
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      if (result?.type === 'success' && result?.url) {
        const url = new URL(result.url);
        const token = url.searchParams.get('token');
        const err = url.searchParams.get('error');
        if (err) {
          setError(err);
        } else if (token) {
          await storeToken(token);
        }
      }
    } catch (e) {
      setError(getErrorMessage(e, 'Google sign-in failed'));
    }
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
            <Text style={styles.appName}>FitTracker</Text>
          </View>

          <Text style={styles.heading}>Sign In</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
            theme={{
              colors: {
                onSurfaceVariant: Colors.dark.mutedForeground,
                background: Colors.dark.card,
              },
            }}
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
            theme={{
              colors: {
                onSurfaceVariant: Colors.dark.mutedForeground,
                background: Colors.dark.card,
              },
            }}
          />

          <Pressable
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In</Text>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable style={styles.googleButton} onPress={handleGoogleSSO}>
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => router.push('/auth/signup')}>
              <Text style={styles.linkText}>Sign Up</Text>
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
  logoContainer: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: { width: 80, height: 80, borderRadius: Radius.lg },
  appName: {
    fontSize: 28,
    fontFamily: Fonts.display,
    color: Colors.dark.foreground,
    marginTop: Spacing.sm,
    letterSpacing: -0.5,
  },
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.dark.border },
  dividerText: {
    color: Colors.dark.mutedForeground,
    marginHorizontal: Spacing.md,
    fontSize: 14,
    fontFamily: Fonts.body,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  googleButtonText: {
    color: Colors.dark.foreground,
    fontSize: 16,
    fontFamily: Fonts.bodyMedium,
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
