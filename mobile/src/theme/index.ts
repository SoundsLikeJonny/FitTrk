import { Platform } from 'react-native';

export const Colors = {
  primary: '#22c55e',
  primaryLight: '#4ade80',
  primaryDark: '#16a34a',
  destructive: '#ef4444',
  destructiveDark: '#7f1d1d',
  light: {
    background: '#ffffff',
    card: '#ffffff',
    foreground: '#0f172a',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    border: '#e2e8f0',
  },
  dark: {
    background: '#0a0e1a',
    card: '#111827',
    foreground: '#f8fafc',
    muted: '#1e293b',
    mutedForeground: '#94a3b8',
    border: '#1e293b',
  },
} as const;

const fallbackSans = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'Arial',
});

const fallbackMono = Platform.select({
  ios: 'Courier',
  android: 'monospace',
  default: 'monospace',
});

export const Fonts = {
  display: 'PlusJakartaSans_700Bold',
  displayFallback: fallbackSans,
  heading: 'PlusJakartaSans_600SemiBold',
  headingFallback: fallbackSans,
  body: 'DMSans_400Regular',
  bodyFallback: fallbackSans,
  bodyMedium: 'DMSans_500Medium',
  bodyMediumFallback: fallbackSans,
  bodySemiBold: 'DMSans_600SemiBold',
  bodySemiBoldFallback: fallbackSans,
  mono: 'JetBrainsMono_400Regular',
  monoFallback: fallbackMono,
  monoBold: 'JetBrainsMono_700Bold',
  monoBoldFallback: fallbackMono,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export function useAppTheme() {
  // Dark mode default
  return {
    colors: Colors.dark,
    fonts: Fonts,
    spacing: Spacing,
    radius: Radius,
    isDark: true,
  };
}
