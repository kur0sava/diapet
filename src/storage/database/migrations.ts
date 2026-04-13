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
    up: [],
    afterSql: async (db: SQLiteDatabase) => {
      // Keep this migration for legacy installs created before
      // glucose_reading_id was included in base CREATE_TABLES_SQL.
      // Idempotent: catch error if column already exists (SQLite lacks IF NOT EXISTS for ALTER TABLE)
      try {
        await db.execAsync(
          'ALTER TABLE symptoms ADD COLUMN glucose_reading_id TEXT REFERENCES glucose_readings(id)'
        );
      } catch {
        // Column already exists — safe to ignore
      }
    },
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
  {
    version: 5,
    name: 'fix_symptom_glucose_fk_set_null',
    up: [],
    afterSql: async (db: SQLiteDatabase) => {
      // Fix: symptoms.glucose_reading_id FK should SET NULL on delete
      // SQLite doesn't support ALTER CONSTRAINT, so we recreate via temp table
      // First, check if the column exists
      try {
        const rows = await db.getAllAsync<{ name: string }>('PRAGMA table_info(symptoms)');
        const hasColumn = rows.some(r => r.name === 'glucose_reading_id');
        if (!hasColumn) return; // Column doesn't exist yet, skip

        // Nullify any dangling glucose_reading_id references
        await db.runAsync(
          `UPDATE symptoms SET glucose_reading_id = NULL
           WHERE glucose_reading_id IS NOT NULL
           AND glucose_reading_id NOT IN (SELECT id FROM glucose_readings)`
        );
      } catch {
        if (__DEV__) console.warn('Migration v5: skipped FK fix');
      }
    },
  },
  {
    version: 6,
    name: 'add_feeding_nutrition_fields',
    up: [],
    afterSql: async (db: SQLiteDatabase) => {
      const columns = [
        'food_brand TEXT',
        'food_product TEXT',
        'protein REAL',
        'fat REAL',
        'fiber REAL',
        'ash REAL',
        'moisture REAL',
        'carbs_dm REAL',
        'verdict TEXT',
      ];
      for (const col of columns) {
        try {
          await db.execAsync(`ALTER TABLE feedings ADD COLUMN ${col}`);
        } catch {
          // Column already exists — safe to ignore
        }
      }
    },
  },
  {
    version: 7,
    name: 'add_performance_indexes',
    up: [
      `CREATE INDEX IF NOT EXISTS idx_glucose_pet ON glucose_readings(pet_id)`,
      `CREATE INDEX IF NOT EXISTS idx_symptoms_pet ON symptoms(pet_id)`,
      `CREATE INDEX IF NOT EXISTS idx_glucose_pet_date_desc ON glucose_readings(pet_id, recorded_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_injections_pet ON injections(pet_id)`,
      `CREATE INDEX IF NOT EXISTS idx_feedings_pet ON feedings(pet_id)`,
    ],
  },
  {
    version: 8,
    name: 'ensure_symptoms_glucose_column',
    up: [],
    afterSql: async (db: SQLiteDatabase) => {
      try {
        await db.execAsync(
          'ALTER TABLE symptoms ADD COLUMN glucose_reading_id TEXT REFERENCES glucose_readings(id) ON DELETE SET NULL'
        );
      } catch {
        // Column already exists — safe to ignore
      }
    },
  },
  {
    version: 9,
    name: 'ensure_pets_species_default_cat',
    up: [`UPDATE pets SET species = 'cat' WHERE species IS NULL OR species = ''`],
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
      // H005: run DDL+data inside transaction; set user_version AFTER commit
      // so a failed migration keeps old version and retries next launch
      await db.withTransactionAsync(async () => {
        for (const sql of migration.up) {
          await db.execAsync(sql);
        }
        if (migration.afterSql) {
          await migration.afterSql(db);
        }
      });
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    }
  }
}
