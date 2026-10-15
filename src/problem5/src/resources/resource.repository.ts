import { randomUUID } from 'node:crypto';
import { db } from '../db';
import type { Resource } from '../types';
import type {
  CreateResourceInput,
  ListQuery,
  UpdateResourceInput,
} from './resource.schema';

/** Shape of a row as stored in SQLite (snake_case columns). */
interface Row {
  id: string;
  name: string;
  category: string;
  description: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

const toResource = (row: Row): Resource => ({
  id: row.id,
  name: row.name,
  category: row.category,
  description: row.description,
  amount: row.amount,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Map a validated sort key to its (safe, fixed) column name.
const SORT_COLUMN: Record<ListQuery['sort'], string> = {
  name: 'name',
  amount: 'amount',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

export const resourceRepository = {
  create(input: CreateResourceInput): Resource {
    const now = new Date().toISOString();
    const row: Row = {
      id: randomUUID(),
      name: input.name,
      category: input.category,
      description: input.description,
      amount: input.amount,
      created_at: now,
      updated_at: now,
    };
    db.prepare(
      `INSERT INTO resources (id, name, category, description, amount, created_at, updated_at)
       VALUES (@id, @name, @category, @description, @amount, @created_at, @updated_at)`,
    ).run(row);
    return toResource(row);
  },

  findById(id: string): Resource | null {
    const row = db
      .prepare('SELECT * FROM resources WHERE id = ?')
      .get(id) as Row | undefined;
    return row ? toResource(row) : null;
  },

  list(query: ListQuery): { items: Resource[]; total: number } {
    const where: string[] = [];
    const params: Record<string, unknown> = {};

    if (query.q) {
      where.push('(name LIKE @q OR description LIKE @q)');
      params.q = `%${query.q}%`;
    }
    if (query.category) {
      where.push('category = @category');
      params.category = query.category;
    }
    if (query.minAmount !== undefined) {
      where.push('amount >= @minAmount');
      params.minAmount = query.minAmount;
    }
    if (query.maxAmount !== undefined) {
      where.push('amount <= @maxAmount');
      params.maxAmount = query.maxAmount;
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sortCol = SORT_COLUMN[query.sort];
    const order = query.order === 'asc' ? 'ASC' : 'DESC';

    const total = (
      db
        .prepare(`SELECT COUNT(*) AS c FROM resources ${whereSql}`)
        .get(params) as { c: number }
    ).c;

    const rows = db
      .prepare(
        `SELECT * FROM resources ${whereSql}
         ORDER BY ${sortCol} ${order}
         LIMIT @limit OFFSET @offset`,
      )
      .all({ ...params, limit: query.limit, offset: query.offset }) as Row[];

    return { items: rows.map(toResource), total };
  },

  update(id: string, input: UpdateResourceInput): Resource | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated: Resource = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    db.prepare(
      `UPDATE resources
       SET name = @name, category = @category, description = @description,
           amount = @amount, updated_at = @updatedAt
       WHERE id = @id`,
    ).run({
      id,
      name: updated.name,
      category: updated.category,
      description: updated.description,
      amount: updated.amount,
      updatedAt: updated.updatedAt,
    });
    return updated;
  },

  remove(id: string): boolean {
    const result = db.prepare('DELETE FROM resources WHERE id = ?').run(id);
    return result.changes > 0;
  },
};
