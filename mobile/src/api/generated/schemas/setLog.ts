// @ts-nocheck
import type { Exercise } from './exercise';

export interface SetLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  /** @nullable */
  rpe?: number | null;
  exercise: Exercise;
}
