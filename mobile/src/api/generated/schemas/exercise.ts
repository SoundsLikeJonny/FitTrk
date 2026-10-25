// @ts-nocheck

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  category: string;
  weightType: string;
  isCustom: boolean;
  /** @nullable */
  userId?: string | null;
  restSeconds: number;
}
