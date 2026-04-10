/**
 * Cloud Backup — export/import all pet data to/from Firebase Firestore.
 * Data is stored per-user (Firebase UID) in a single document.
 *
 * Security:
 * - Column names are validated against actual DB schema (PRAGMA table_info)
 * - Only known TABLES are restored; tables absent in backup are left untouched
 * - Backup payload is checked against Firestore 1MB limit before upload
 */
import { db } from './firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getDatabase } from '@storage/database';
import { storage, StorageKeys } from '@storage/mmkv/storage';

const TABLES = [
  'pets',
  'glucose_readings',
  'injections',
  'feedings',
  'symptoms',
  'symptom_entry_types',
  'expenses',
  'injection_schedule',
  'feeding_schedule',
] as const;

/** Firestore document size limit (1 MB minus safety margin). */
const FIRESTORE_MAX_BYTES = 950_000;

/** MMKV keys to include in cloud backup (user preferences that should survive device change). */
const BACKUP_MMKV_KEYS = [
  StorageKeys.GLUCOSE_UNIT,
  StorageKeys.LANGUAGE,
  StorageKeys.COLOR_SCHEME,
  StorageKeys.VET_NAME,
  StorageKeys.VET_PHONE,
  StorageKeys.EXPENSE_BUDGET_MONTHLY,
  StorageKeys.NOTIFICATIONS_ENABLED,
  StorageKeys.HINTS_DISABLED,
] as const;

interface BackupData {
  version: number;
  createdAt: string;
  tables: Record<string, unknown[]>;
  /** User preferences from MMKV (added in version 3). */
  settings?: Record<string, string | number | boolean>;
}

/** Validate column name: only alphanumeric + underscore allowed. */
const SAFE_COLUMN_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Get valid column names for a table from the actual DB schema.
 */
async function getTableColumns(
  sqlDb: Awaited<ReturnType<typeof getDatabase>>,
  table: string
): Promise<Set<string>> {
  const info = await sqlDb.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  return new Set(info.map(c => c.name));
}

/**
 * Export all SQLite data to a Firestore document under users/{uid}.
 * Throws if payload exceeds Firestore 1MB limit.
 */
export async function backupToCloud(uid: string): Promise<void> {
  const sqlDb = await getDatabase();
  const tables: Record<string, unknown[]> = {};

  for (const table of TABLES) {
    const rows = await sqlDb.getAllAsync(`SELECT * FROM ${table}`);
    tables[table] = rows;
  }

  // BL-10: Include user preferences from MMKV
  const settings: Record<string, string | number | boolean> = {};
  for (const key of BACKUP_MMKV_KEYS) {
    const str = storage.getString(key);
    if (str !== undefined) {
      settings[key] = str;
      continue;
    }
    const num = storage.getNumber(key);
    if (num !== undefined) {
      settings[key] = num;
      continue;
    }
    const bool = storage.getBoolean(key);
    if (bool !== undefined) {
      settings[key] = bool;
    }
  }

  const backup: BackupData = {
    version: 3,
    createdAt: new Date().toISOString(),
    tables,
    settings,
  };

  const payload = JSON.stringify(backup);

  if (new TextEncoder().encode(payload).length > FIRESTORE_MAX_BYTES) {
    throw new Error('BACKUP_TOO_LARGE');
  }

  const ref = doc(db, 'users', uid);
  await setDoc(ref, { backup: payload });
}

/**
 * Restore data from Firestore into local SQLite.
 * Only tables present in the backup are cleared and restored.
 * Tables absent in the backup are left untouched (safe for version upgrades).
 * Column names are validated against the actual DB schema to prevent injection.
 */
export async function restoreFromCloud(uid: string): Promise<boolean> {
  const ref = doc(db, 'users', uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return false;

  const data = snapshot.data();
  if (!data?.backup) return false;

  const backup: BackupData = JSON.parse(data.backup as string);
  if (!backup.tables) return false;

  const sqlDb = await getDatabase();

  // Pre-load valid column sets for each table
  const columnSets = new Map<string, Set<string>>();
  for (const table of TABLES) {
    columnSets.set(table, await getTableColumns(sqlDb, table));
  }

  await sqlDb.withTransactionAsync(async () => {
    // Clear tables present in the backup (even if empty — user may have deleted all records)
    const tablesInBackup = TABLES.filter(t => t in backup.tables);

    for (const table of [...tablesInBackup].reverse()) {
      await sqlDb.execAsync(`DELETE FROM ${table}`);
    }

    // Insert rows with validated column names
    const tablesToInsert = tablesInBackup.filter(t => backup.tables[t]!.length > 0);
    for (const table of tablesToInsert) {
      const validColumns = columnSets.get(table)!;
      const rows = backup.tables[table]!;

      for (const row of rows) {
        const obj = row as Record<string, unknown>;
        // Filter to only columns that: (a) exist in schema, (b) pass regex safety check
        const safeColumns = Object.keys(obj).filter(
          col => SAFE_COLUMN_RE.test(col) && validColumns.has(col)
        );
        if (safeColumns.length === 0) continue;

        const placeholders = safeColumns.map(() => '?').join(', ');
        const values = safeColumns.map(c => obj[c] ?? null);
        await sqlDb.runAsync(
          `INSERT OR REPLACE INTO ${table} (${safeColumns.join(', ')}) VALUES (${placeholders})`,
          values as (string | number | null)[]
        );
      }
    }
  });

  // BL-10: Restore user preferences to MMKV
  const allowedKeys = new Set<string>(BACKUP_MMKV_KEYS);
  if (backup.settings) {
    for (const [key, value] of Object.entries(backup.settings)) {
      if (!allowedKeys.has(key)) continue;
      if (typeof value === 'string') storage.set(key, value);
      else if (typeof value === 'number') storage.set(key, value);
      else if (typeof value === 'boolean') storage.set(key, value);
    }
  }

  return true;
}

/**
 * Check if a cloud backup exists for this user.
 */
export async function hasCloudBackup(uid: string): Promise<{ exists: boolean; date?: string }> {
  const ref = doc(db, 'users', uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return { exists: false };

  const data = snapshot.data();
  if (!data?.backup) return { exists: false };

  try {
    const backup: BackupData = JSON.parse(data.backup as string);
    return { exists: true, date: backup.createdAt };
  } catch {
    return { exists: false };
  }
}
