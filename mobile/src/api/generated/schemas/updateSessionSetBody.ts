// @ts-nocheck

export type UpdateSessionSetBody = {
  setId: string;
  weight?: number;
  reps?: number;
  completed?: boolean;
  /** @nullable */
  rpe?: number | null;
};
