// @ts-nocheck
import type { Exercise } from './exercise';

export interface TemplateExercise {
  id: string;
  templateId: string;
  exerciseId: string;
  order: number;
  sets: number;
  reps: number;
  weight: number;
  exercise: Exercise;
}
