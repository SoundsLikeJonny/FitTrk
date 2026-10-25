import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mobileLogin, mobileSignup, getMobileAuthMe } from '@/src/api/generated/api';
import { getErrorMessage } from '@/src/api/customFetch';
import type { AppUser } from '@/src/types';

type AuthState = {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  storeToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

async function saveToken(token: string) {
  if (Platform.OS === 'web') {
    try { localStorage.setItem(TOKEN_KEY, token); } catch {}
  }
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

async function removeToken() {
  if (Platform.OS === 'web') {
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
  }
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateToken = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const res = await getMobileAuthMe() as { user?: AppUser | null };
      if (res?.user) {
        setUser({
          id: res.user?.id ?? '',
          name: res.user?.name ?? null,
          email: res.user?.email ?? null,
          image: res.user?.image ?? null,
        });
      } else {
        await removeToken();
        setUser(null);
      }
    } catch {
      await removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await mobileLogin({ email, password }) as { token?: string; user?: AppUser | null };
    if (!data?.token) {
      const msg = (data as { message?: string })?.message ?? 'Sign-in did not complete';
      throw new Error(msg);
    }
    await saveToken(data.token);
    setUser({
      id: data.user?.id ?? '',
      name: data.user?.name ?? null,
      email: data.user?.email ?? null,
      image: data.user?.image ?? null,
    });
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const data = await mobileSignup({ email, password, name }) as { token?: string; user?: AppUser | null };
    if (!data?.token) {
      const msg = (data as { message?: string })?.message ?? 'Sign-up did not complete';
      throw new Error(msg);
    }
    await saveToken(data.token);
    setUser({
      id: data.user?.id ?? '',
      name: data.user?.name ?? null,
      email: data.user?.email ?? null,
      image: data.user?.image ?? null,
    });
  }, []);

  const storeToken = useCallback(async (token: string) => {
    await saveToken(token);
    await validateToken();
  }, [validateToken]);

  const logout = useCallback(async () => {
    await removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        storeToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
