// @ts-nocheck

export interface Food {
  id: string;
  name: string;
  amountG: number;
  cal: number;
  fatG: number;
  carbG: number;
  proteinG: number;
  typicalG: number;
  isCustom: boolean;
  /** @nullable */
  userId?: string | null;
  /**
     * JSON-encoded array of multipliers, e.g. "[0.5, 1, 2]"
     * @nullable
     */
  presets?: string | null;
}
