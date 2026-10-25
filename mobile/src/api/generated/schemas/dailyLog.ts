// @ts-nocheck
import type { FoodEntry } from './foodEntry';

export interface DailyLog {
  id: string;
  userId: string;
  date: string;
  entries: FoodEntry[];
}
