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
      // FIX-01: Schema uses 'feedings', not 'feeding_logs'
      `CREATE TABLE IF NOT EXISTS feedings (
        id TEXT PRIMARY KEY NOT NULL,
        pet_id TEXT NOT NULL,
        fed_at TEXT NOT NULL DEFAULT (datetime('now')),
        food_type TEXT,
        amount_grams REAL,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS idx_feeding_pet_date ON feedings(pet_id, fed_at)`,
    ],
  },
  {
    version: 3,
    name: 'add_symptom_glucose_link',
    up: [
      // FIX-02: photo_uri already exists in schema.ts CREATE TABLE, skip it
      // Only add glucose_reading_id to symptoms (not in initial schema)
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
      // Migration logged only in __DEV__
      if (__DEV__) console.log(`Migration ${migration.version}: ${migration.name}`);
      for (const sql of migration.up) {
        await db.execAsync(sql);
      }
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    }
  }
}
