import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors, Fonts, Spacing, Radius } from '@/src/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthCallback() {
  const { storeToken } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const err = params.get('error');
      if (err) {
        setError(err);
      } else if (token) {
        storeToken(token).catch(() => setError('Failed to save token'));
      } else {
        setError('No token received');
      }
    } catch {
      setError('Sign in failed');
    }
  }, [storeToken]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {error ? (
          <>
            <Text style={styles.errorTitle}>Sign in failed</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Pressable style={styles.button} onPress={() => router.replace('/auth/login')}>
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Signing you in…</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark.background },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  loadingText: {
    color: Colors.dark.mutedForeground,
    fontSize: 16,
    fontFamily: Fonts.body,
    marginTop: Spacing.lg,
  },
  errorTitle: {
    color: Colors.dark.foreground,
    fontSize: 20,
    fontFamily: Fonts.heading,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    color: Colors.dark.mutedForeground,
    fontSize: 14,
    fontFamily: Fonts.body,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radius.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.bodySemiBold,
    fontWeight: '600',
  },
});
