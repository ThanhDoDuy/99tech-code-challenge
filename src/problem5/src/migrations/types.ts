/** A single forward-only database migration. */
export interface Migration {
  /** Zero-padded, monotonically increasing id, e.g. "001". */
  id: string;
  /** Human-readable name. */
  name: string;
  /** SQL statements to apply. */
  up: string;
}
