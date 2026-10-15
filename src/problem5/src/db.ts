import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { config } from './config';

// Ensure the directory for the database file exists.
fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

// Open the connection. The schema is managed by migrations (see ./migrations),
// not created here.
export const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
