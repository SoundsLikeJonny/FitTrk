// @ts-nocheck
import type { CreateWorkoutBodyExercisesItem } from './createWorkoutBodyExercisesItem';

export type CreateWorkoutBody = {
  name: string;
  exercises?: CreateWorkoutBodyExercisesItem[];
};
