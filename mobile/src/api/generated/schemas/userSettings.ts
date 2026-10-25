// @ts-nocheck

export interface UserSettings {
  id: string;
  userId: string;
  weightLb: number;
  /** cut | bulk | maintain */
  mode: string;
  cutDeficit: number;
  bulkSurplus: number;
  calMultiplier: number;
  proteinMultiplier: number;
  proteinMinMultiplier: number;
  fatMinMultiplier: number;
  weightUnit: string;
  restTimerDefault: number;
}
