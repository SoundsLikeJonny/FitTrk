import type { FoodEntry, UserSettings } from '@/src/api/generated/schemas';

export type MacroTotals = {
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export function calcEntryMacros(entry: FoodEntry): MacroTotals {
  const food = entry?.food;
  if (!food) return { cal: 0, protein: 0, carbs: 0, fat: 0 };
  const mult = entry?.multiplier ?? 1;
  return {
    cal: Math.round((food?.cal ?? 0) * mult),
    protein: Math.round((food?.proteinG ?? 0) * mult),
    carbs: Math.round((food?.carbG ?? 0) * mult),
    fat: Math.round((food?.fatG ?? 0) * mult),
  };
}

export function calcDayTotals(entries?: FoodEntry[]): MacroTotals {
  if (!entries?.length) return { cal: 0, protein: 0, carbs: 0, fat: 0 };
  return entries.reduce(
    (acc, e) => {
      const m = calcEntryMacros(e);
      return {
        cal: acc.cal + m.cal,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      };
    },
    { cal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function calcTargets(settings?: UserSettings | null): MacroTotals {
  if (!settings) return { cal: 2000, protein: 150, carbs: 250, fat: 65 };
  const w = settings?.weightLb ?? 150;
  const calMult = settings?.calMultiplier ?? 15;
  const protMult = settings?.proteinMultiplier ?? 1;
  const protMinMult = settings?.proteinMinMultiplier ?? 0.8;
  const fatMinMult = settings?.fatMinMultiplier ?? 0.3;
  const mode = settings?.mode ?? 'cut';
  const deficit = settings?.cutDeficit ?? 500;
  const surplus = settings?.bulkSurplus ?? 300;

  let baseCal = Math.round(w * calMult);
  if (mode === 'cut') baseCal -= deficit;
  else if (mode === 'bulk') baseCal += surplus;

  const protein = Math.round(Math.max(w * protMult, w * protMinMult));
  const fat = Math.round(w * fatMinMult);
  const fatCal = fat * 9;
  const proteinCal = protein * 4;
  const carbCal = Math.max(0, baseCal - fatCal - proteinCal);
  const carbs = Math.round(carbCal / 4);

  return { cal: baseCal, protein, carbs, fat };
}
