// @ts-nocheck
import type { UpdateSessionBodySetsItem } from './updateSessionBodySetsItem';

export type UpdateSessionBody = {
  finishedAt?: string;
  durationSec?: number;
  notes?: string;
  sets?: UpdateSessionBodySetsItem[];
};
