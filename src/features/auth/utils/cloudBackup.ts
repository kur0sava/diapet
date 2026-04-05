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

interface BackupData {
  version: number;
  createdAt: string;
  tables: Record<string, unknown[]>;
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

  const backup: BackupData = {
    version: 2,
    createdAt: new Date().toISOString(),
    tables,
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
    // Only clear tables that exist in the backup (preserves newer tables)
    const tablesToRestore = TABLES.filter(t => {
      const rows = backup.tables[t];
      return rows && rows.length > 0;
    });

    for (const table of [...tablesToRestore].reverse()) {
      await sqlDb.execAsync(`DELETE FROM ${table}`);
    }

    // Insert rows with validated column names
    for (const table of tablesToRestore) {
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
