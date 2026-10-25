export type AppUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export type MacroKey = 'cal' | 'protein' | 'carbs' | 'fat';

export type MacroInfo = {
  key: MacroKey;
  label: string;
  color: string;
  unit: string;
};

export const MACROS: MacroInfo[] = [
  { key: 'cal', label: 'Calories', color: '#22c55e', unit: 'kcal' },
  { key: 'protein', label: 'Protein', color: '#3b82f6', unit: 'g' },
  { key: 'carbs', label: 'Carbs', color: '#f59e0b', unit: 'g' },
  { key: 'fat', label: 'Fat', color: '#ef4444', unit: 'g' },
];
