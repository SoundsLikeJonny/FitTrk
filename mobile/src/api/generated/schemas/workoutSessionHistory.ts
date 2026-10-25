// @ts-nocheck
import type { WorkoutSession } from './workoutSession';
import type { WorkoutTemplateBase } from './workoutTemplateBase';

export type WorkoutSessionHistory = WorkoutSession & ({
  template?: WorkoutTemplateBase | null;
});
