// @ts-nocheck
import type { TemplateExercise } from './templateExercise';

export interface WorkoutTemplate {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  exercises: TemplateExercise[];
}
