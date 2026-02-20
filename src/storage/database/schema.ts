export const DB_NAME = 'diapet.db';
export const DB_VERSION = 1;

export const CREATE_TABLES_SQL = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS pets (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL DEFAULT 'cat',
    breed TEXT,
    gender TEXT NOT NULL DEFAULT 'unknown',
    birth_year INTEGER,
    weight_kg REAL,
    diagnosis_date TEXT,
    diabetes_type TEXT DEFAULT 'unknown',
    insulin_type TEXT,
    photo_uri TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS injection_schedule (
    id TEXT PRIMARY KEY NOT NULL,
    pet_id TEXT NOT NULL,
    time_of_day TEXT NOT NULL,
    days_of_week TEXT NOT NULL DEFAULT '0,1,2,3,4,5,6',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS feeding_schedule (
    id TEXT PRIMARY KEY NOT NULL,
    pet_id TEXT NOT NULL,
    time_of_day TEXT NOT NULL,
    days_of_week TEXT NOT NULL DEFAULT '0,1,2,3,4,5,6',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS glucose_readings (
    id TEXT PRIMARY KEY NOT NULL,
    pet_id TEXT NOT NULL,
    value_mmol REAL NOT NULL,
    value_mgdl REAL NOT NULL,
    meal_relation TEXT NOT NULL DEFAULT 'unspecified',
    insulin_dose REAL,
    insulin_type TEXT,
    notes TEXT,
    recorded_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS injections (
    id TEXT PRIMARY KEY NOT NULL,
    pet_id TEXT NOT NULL,
    insulin_type TEXT NOT NULL,
    dose_units REAL NOT NULL,
    notes TEXT,
    administered_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS feedings (
    id TEXT PRIMARY KEY NOT NULL,
    pet_id TEXT NOT NULL,
    food_type TEXT,
    amount_grams REAL,
    notes TEXT,
    fed_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS symptoms (
    id TEXT PRIMARY KEY NOT NULL,
    pet_id TEXT NOT NULL,
    symptom_types TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'mild',
    photo_uris TEXT,
    notes TEXT,
    recorded_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY NOT NULL,
    pet_id TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'RUB',
    description TEXT,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS vet_contacts (
    id TEXT PRIMARY KEY NOT NULL,
    pet_id TEXT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    clinic TEXT,
    is_primary INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_glucose_pet_date ON glucose_readings(pet_id, recorded_at);
  CREATE INDEX IF NOT EXISTS idx_symptoms_pet_date ON symptoms(pet_id, recorded_at);
  CREATE INDEX IF NOT EXISTS idx_expenses_pet_date ON expenses(pet_id, date);
  CREATE INDEX IF NOT EXISTS idx_injections_pet_date ON injections(pet_id, administered_at);
`;
