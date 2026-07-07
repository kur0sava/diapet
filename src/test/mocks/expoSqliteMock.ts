/**
 * Test-only expo-sqlite adapter backed by Node's built-in `node:sqlite`
 * (in-memory). Implements the subset of the async API the app uses so
 * repositories and migrations run against a REAL SQLite engine in jest —
 * no native module, no extra dependency.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DatabaseSync } = require('node:sqlite');

type Param = string | number | null;

function normalizeParams(params?: Param[]): Param[] {
  return (params ?? []).map(p => (p === undefined ? null : p));
}

export class SQLiteDatabase {
  private db: any;

  constructor() {
    this.db = new DatabaseSync(':memory:');
  }

  async execAsync(sql: string): Promise<void> {
    this.db.exec(sql);
  }

  async runAsync(sql: string, params?: Param[]): Promise<{ changes: number }> {
    if (!params || params.length === 0) {
      // PRAGMA and DDL without params — exec handles multi-statement too
      this.db.exec(sql);
      return { changes: 0 };
    }
    const stmt = this.db.prepare(sql);
    const res = stmt.run(...normalizeParams(params));
    return { changes: Number(res.changes ?? 0) };
  }

  async getFirstAsync<T>(sql: string, params?: Param[]): Promise<T | null> {
    const stmt = this.db.prepare(sql);
    const row = stmt.get(...normalizeParams(params));
    return (row ?? null) as T | null;
  }

  async getAllAsync<T>(sql: string, params?: Param[]): Promise<T[]> {
    const stmt = this.db.prepare(sql);
    return stmt.all(...normalizeParams(params)) as T[];
  }

  async withTransactionAsync(fn: () => Promise<void>): Promise<void> {
    this.db.exec('BEGIN');
    try {
      await fn();
      this.db.exec('COMMIT');
    } catch (e) {
      try {
        this.db.exec('ROLLBACK');
      } catch {
        /* already rolled back */
      }
      throw e;
    }
  }

  async closeAsync(): Promise<void> {
    this.db.close();
  }
}

export async function openDatabaseAsync(_name: string): Promise<SQLiteDatabase> {
  return new SQLiteDatabase();
}
