import type { Migration } from './types';
import { migration as m001 } from './001_create_resources';

/**
 * All migrations, in the order they must be applied.
 * Add new migrations here (e.g. `002_...`) — never edit an already-applied one.
 */
export const migrations: Migration[] = [m001];

export type { Migration };
