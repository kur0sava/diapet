import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { CREATE_TABLES_SQL, DB_NAME } from './schema';
import { runMigrations } from './migrations';

const SQLITE_KEY_STORE = 'diapet-sqlite-key';

let db: SQLite.SQLiteDatabase | null = null;
let dbInitPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  if (dbInitPromise) return dbInitPromise;
  dbInitPromise = (async () => {
    // CFG003: retrieve or generate per-device SQLCipher key
    let sqliteKey = await SecureStore.getItemAsync(SQLITE_KEY_STORE);
    if (!sqliteKey) {
      sqliteKey = Crypto.randomUUID();
      await SecureStore.setItemAsync(SQLITE_KEY_STORE, sqliteKey);
    }
    const database = await SQLite.openDatabaseAsync(DB_NAME);
    // Must be first operation before any reads/writes
    await database.runAsync(`PRAGMA key = '${sqliteKey}'`);
    await initializeDatabase(database);
    db = database;
    return database;
  })();
  try {
    return await dbInitPromise;
  } catch (e) {
    dbInitPromise = null;
    throw e;
  }
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  // Check if this is a fresh install (user_version == 0)
  const result = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const isFreshInstall = (result?.user_version ?? 0) === 0;

  // Enable foreign keys (must be separate statement, not in batch)
  await database.runAsync('PRAGMA foreign_keys = ON');

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
    dbInitPromise = null;
  }
}
