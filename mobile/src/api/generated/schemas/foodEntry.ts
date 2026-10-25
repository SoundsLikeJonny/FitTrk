// @ts-nocheck
import type { Food } from './food';

export interface FoodEntry {
  id: string;
  dailyLogId: string;
  foodId: string;
  multiplier: number;
  /** @nullable */
  amountG?: number | null;
  order: number;
  food: Food;
}
