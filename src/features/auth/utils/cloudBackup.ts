/**
 * Cloud Backup — export/import all pet data to/from Firebase Firestore.
 * Data is stored per-user (Google UID) in a single document per pet.
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

interface BackupData {
  version: number;
  createdAt: string;
  tables: Record<string, unknown[]>;
}

/**
 * Export all SQLite data to a Firestore document under users/{uid}/backup.
 */
export async function backupToCloud(uid: string): Promise<void> {
  const sqlDb = await getDatabase();
  const tables: Record<string, unknown[]> = {};

  for (const table of TABLES) {
    const rows = await sqlDb.getAllAsync(`SELECT * FROM ${table}`);
    tables[table] = rows;
  }

  const backup: BackupData = {
    version: 1,
    createdAt: new Date().toISOString(),
    tables,
  };

  // Firestore has 1MB doc limit. Split large data into chunks if needed.
  // For most users (<1000 readings) a single doc is fine.
  const ref = doc(db, 'users', uid);
  await setDoc(ref, { backup: JSON.stringify(backup) });
}

/**
 * Restore data from Firestore into local SQLite.
 * IMPORTANT: This clears existing local data before restoring.
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

  await sqlDb.withTransactionAsync(async () => {
    // Clear all tables in reverse-dependency order
    for (const table of [...TABLES].reverse()) {
      await sqlDb.execAsync(`DELETE FROM ${table}`);
    }

    // Insert all rows
    for (const table of TABLES) {
      const rows = backup.tables[table];
      if (!rows || rows.length === 0) continue;

      for (const row of rows) {
        const obj = row as Record<string, unknown>;
        const columns = Object.keys(obj);
        const placeholders = columns.map(() => '?').join(', ');
        const values = columns.map(c => obj[c] ?? null);
        await sqlDb.runAsync(
          `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
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
