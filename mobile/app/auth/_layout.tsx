import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { LoadingSplash } from '@/src/components/LoadingSplash';
import { Colors } from '@/src/theme';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingSplash />;
  if (isAuthenticated) return <Redirect href="/tabs" />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.dark.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
