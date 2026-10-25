// @ts-nocheck

export type UpdateSettingsBody = {
  weightLb?: number;
  /** cut | bulk | maintain */
  mode?: string;
  cutDeficit?: number;
  bulkSurplus?: number;
  calMultiplier?: number;
  proteinMultiplier?: number;
  proteinMinMultiplier?: number;
  fatMinMultiplier?: number;
  weightUnit?: string;
  restTimerDefault?: number;
};
