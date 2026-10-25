// @ts-nocheck
import type { SetLog } from './setLog';

export interface WorkoutSession {
  id: string;
  userId: string;
  /** @nullable */
  templateId?: string | null;
  name: string;
  startedAt: string;
  /** @nullable */
  finishedAt?: string | null;
  /** @nullable */
  durationSec?: number | null;
  /** @nullable */
  notes?: string | null;
  setLogs: SetLog[];
}
