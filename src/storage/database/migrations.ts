import { SQLiteDatabase } from 'expo-sqlite';

type Migration = {
  version: number;
  name: string;
  up: string[];
};

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: [], // Initial schema is handled by CREATE_TABLES_SQL
  },
  {
    version: 2,
    name: 'add_feeding_logs',
    up: [
      `CREATE TABLE IF NOT EXISTS feeding_logs (
        id TEXT PRIMARY KEY NOT NULL,
        pet_id TEXT NOT NULL,
        fed_at TEXT NOT NULL DEFAULT (datetime('now')),
        food_type TEXT,
        amount_grams REAL,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS idx_feeding_pet_date ON feeding_logs(pet_id, fed_at)`,
    ],
  },
  {
    version: 3,
    name: 'add_pet_photo_and_symptom_glucose_link',
    up: [
      `ALTER TABLE pets ADD COLUMN photo_uri TEXT`,
      `ALTER TABLE symptoms ADD COLUMN glucose_reading_id TEXT REFERENCES glucose_readings(id)`,
    ],
  },
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  // Get current version
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  // Run outstanding migrations
  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      console.log(`Running migration ${migration.version}: ${migration.name}`);
      for (const sql of migration.up) {
        await db.execAsync(sql);
      }
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    }
  }
}
