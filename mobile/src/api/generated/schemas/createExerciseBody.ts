// @ts-nocheck

export type CreateExerciseBody = {
  name: string;
  bodyPart: string;
  category: string;
  weightType?: string;
  restSeconds?: number;
};
