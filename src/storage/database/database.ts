import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL, DB_NAME } from './schema';
import { runMigrations } from './migrations';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await initializeDatabase(db);
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  // Check if this is a fresh install (user_version == 0)
  const result = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const isFreshInstall = (result?.user_version ?? 0) === 0;

  // Create initial schema tables
  await database.execAsync(CREATE_TABLES_SQL);

  // Mark version 1 for fresh installs so migrations start from version 2
  if (isFreshInstall) {
    await database.execAsync('PRAGMA user_version = 1');
  }

  // Run any outstanding migrations
  await runMigrations(database);
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
