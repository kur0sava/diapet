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
import i18n from '@shared/i18n';

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
  'weight_entries',
] as const;

/** Firestore document size limit (1 MB minus safety margin). */
const FIRESTORE_MAX_BYTES = 950_000;

/** MMKV keys to include in cloud backup (user preferences that should survive device change).
 * Vet contact is per-pet (`vetName_<petId>` / `vetPhone_<petId>`) and added via prefix scan. */
const BACKUP_MMKV_KEYS = [
  StorageKeys.GLUCOSE_UNIT,
  StorageKeys.LANGUAGE,
  StorageKeys.COLOR_SCHEME,
  // Legacy globals retained for backward compatibility with backups created before v2.5.1.
  StorageKeys.VET_NAME,
  StorageKeys.VET_PHONE,
  StorageKeys.EXPENSE_BUDGET_MONTHLY,
  StorageKeys.NOTIFICATIONS_ENABLED,
  StorageKeys.HINTS_DISABLED,
  StorageKeys.REGION,
  StorageKeys.GLUCOSE_REMINDER_ENABLED,
  StorageKeys.GLUCOSE_REMINDER_TIMES,
] as const;

/** Prefixes for dynamic per-pet keys included in backup. Must match {@link vetNameKey} / {@link vetPhoneKey}. */
const DYNAMIC_BACKUP_PREFIXES = ['vetName_', 'vetPhone_'] as const;

/**
 * UUID v4 / v5 shape used by react-native-uuid for pet ids — `8-4-4-4-12` hex.
 * We accept any hex variant (case-insensitive) to leave room for the library
 * upgrading versioning. Anything else in the petId slot is rejected so a
 * tampered backup can't write arbitrary keys (e.g. `vetName_../../`).
 */
const PET_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isDynamicBackupKey(key: string): boolean {
  for (const prefix of DYNAMIC_BACKUP_PREFIXES) {
    if (key.startsWith(prefix)) {
      const petId = key.slice(prefix.length);
      return PET_ID_RE.test(petId);
    }
  }
  return false;
}

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

  // BL-10: Include user preferences from MMKV (fixed keys + per-pet vet keys)
  const settings: Record<string, string | number | boolean> = {};
  const readKey = (key: string) => {
    const str = storage.getString(key);
    if (str !== undefined) {
      settings[key] = str;
      return;
    }
    const num = storage.getNumber(key);
    if (num !== undefined) {
      settings[key] = num;
      return;
    }
    const bool = storage.getBoolean(key);
    if (bool !== undefined) {
      settings[key] = bool;
    }
  };
  for (const key of BACKUP_MMKV_KEYS) readKey(key);
  for (const key of storage.getAllKeys()) {
    if (isDynamicBackupKey(key)) readKey(key);
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

  let backup: BackupData;
  try {
    backup = JSON.parse(data.backup as string);
  } catch {
    // Corrupt/partial payload — surface a clean message instead of a raw
    // SyntaxError, and never touch the local DB (parse fails before the tx).
    throw new Error(i18n.t('auth.restoreCorrupt'));
  }
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

  // BL-10: Restore user preferences to MMKV (fixed keys + per-pet vet keys).
  //
  // Audit BUG-C002 hardening: collect the set of pet ids actually restored
  // so we only re-apply per-pet keys whose owner exists. This keeps the
  // MMKV scoped state consistent with the SQL state after a cross-device
  // restore (where backup pet ids may not match local pre-existing ones).
  const restoredPetIds = new Set<string>(
    ((backup.tables.pets ?? []) as Array<{ id?: unknown }>)
      .map(p => (typeof p.id === 'string' ? p.id : ''))
      .filter(id => id && PET_ID_RE.test(id))
  );
  const allowedFixedKeys = new Set<string>(BACKUP_MMKV_KEYS);
  if (backup.settings) {
    for (const [key, value] of Object.entries(backup.settings)) {
      if (allowedFixedKeys.has(key)) {
        if (typeof value === 'string') storage.set(key, value);
        else if (typeof value === 'number') storage.set(key, value);
        else if (typeof value === 'boolean') storage.set(key, value);
        continue;
      }
      if (isDynamicBackupKey(key)) {
        const petId = key.split('_').slice(1).join('_');
        if (!restoredPetIds.has(petId)) continue; // skip orphan
        if (typeof value === 'string') storage.set(key, value);
      }
    }
  }

  // Scrub stale per-pet keys that were on this device before the restore but
  // belong to pets that aren't in the backup — otherwise they'd shadow the
  // restored state forever. Same for ACTIVE_PET_ID: clear it so the caller's
  // petStore.loadPets() picks the first restored pet rather than chasing a
  // dangling pointer.
  for (const key of storage.getAllKeys()) {
    if (!isDynamicBackupKey(key)) continue;
    const petId = key.split('_').slice(1).join('_');
    if (!restoredPetIds.has(petId)) storage.delete(key);
  }
  storage.delete(StorageKeys.ACTIVE_PET_ID);
  storage.delete(StorageKeys.ACTIVE_SPECIES);

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
