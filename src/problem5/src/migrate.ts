import { db } from './db';
import { migrations } from './migrations';

/**
 * Apply any migrations that haven't run yet, tracked in a `_migrations` table.
 * Idempotent: running it again when everything is applied is a no-op.
 */
export function runMigrations(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = new Set(
    (db.prepare('SELECT id FROM _migrations').all() as { id: string }[]).map(
      (row) => row.id,
    ),
  );

  const pending = migrations.filter((m) => !applied.has(m.id));
  if (pending.length === 0) {
    console.log('[migrate] database is up to date');
    return;
  }

  const record = db.prepare(
    'INSERT INTO _migrations (id, name, applied_at) VALUES (?, ?, ?)',
  );

  // Apply all pending migrations atomically.
  const apply = db.transaction(() => {
    for (const m of pending) {
      db.exec(m.up);
      record.run(m.id, m.name, new Date().toISOString());
      console.log(`[migrate] applied ${m.id}_${m.name}`);
    }
  });
  apply();

  console.log(`[migrate] done (${pending.length} applied)`);
}

// Allow running as a standalone CLI: `tsx src/migrate.ts` / `node dist/migrate.js`.
if (require.main === module) {
  runMigrations();
  db.close();
}
