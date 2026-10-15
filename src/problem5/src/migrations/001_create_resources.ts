import type { Migration } from './types';

/** Initial schema: the `resources` table and a category index. */
export const migration: Migration = {
  id: '001',
  name: 'create_resources',
  up: `
    CREATE TABLE IF NOT EXISTS resources (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      category    TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      amount      REAL NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
  `,
};
