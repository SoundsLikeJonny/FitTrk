// @ts-nocheck

export type UpdateFoodBody = {
  name?: string;
  amountG?: number;
  cal?: number;
  fatG?: number;
  carbG?: number;
  proteinG?: number;
  typicalG?: number;
  presets?: number[];
  /** Set true to skip the duplicate-name check */
  force?: boolean;
};
