import { SQLiteDatabase } from 'expo-sqlite';

type Migration = {
  version: number;
  name: string;
  up: string[];
  /** Optional async callback for data migrations that require JS logic */
  afterSql?: (db: SQLiteDatabase) => Promise<void>;
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
  {
    version: 4,
    name: 'add_symptom_entry_types_junction',
    up: [
      `CREATE TABLE IF NOT EXISTS symptom_entry_types (
        id TEXT PRIMARY KEY NOT NULL,
        symptom_id TEXT NOT NULL REFERENCES symptoms(id) ON DELETE CASCADE,
        symptom_type TEXT NOT NULL,
        UNIQUE(symptom_id, symptom_type)
      )`,
      `CREATE INDEX IF NOT EXISTS idx_symptom_entry_types_symptom ON symptom_entry_types(symptom_id)`,
      `CREATE INDEX IF NOT EXISTS idx_symptom_entry_types_type ON symptom_entry_types(symptom_type)`,
    ],
    afterSql: async (db: SQLiteDatabase) => {
      // Migrate existing JSON symptom_types data into the junction table
      const rows = await db.getAllAsync<{ id: string; symptom_types: string }>(
        'SELECT id, symptom_types FROM symptoms'
      );
      for (const row of rows) {
        try {
          const types: string[] = JSON.parse(row.symptom_types);
          for (const symptomType of types) {
            const entryId = `${row.id}_${symptomType}`;
            await db.runAsync(
              'INSERT OR IGNORE INTO symptom_entry_types (id, symptom_id, symptom_type) VALUES (?, ?, ?)',
              [entryId, row.id, symptomType]
            );
          }
        } catch {
          // Skip rows with invalid JSON
          if (__DEV__) console.warn(`Skipping symptom ${row.id}: invalid symptom_types JSON`);
        }
      }
    },
  },
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  // Get current version
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  // Run outstanding migrations
  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      if (__DEV__) console.log(`Migration ${migration.version}: ${migration.name}`);
      await db.withTransactionAsync(async () => {
        for (const sql of migration.up) {
          await db.execAsync(sql);
        }
        if (migration.afterSql) {
          await migration.afterSql(db);
        }
        await db.execAsync(`PRAGMA user_version = ${migration.version}`);
      });
    }
  }
}
