import { readFileSync } from 'fs';
import path from 'path';
import { CREATE_TABLES_SQL, CURRENT_SCHEMA_VERSION } from '../schema';

function parseSchemaColumns(sql: string): Map<string, Set<string>> {
  const tableColumns = new Map<string, Set<string>>();
  const createTableRegex = /CREATE TABLE IF NOT EXISTS\s+(\w+)\s*\(([\s\S]*?)\);/g;
  let match: RegExpExecArray | null = createTableRegex.exec(sql);

  while (match) {
    const tableName = match[1];
    const body = match[2];
    const columns = new Set<string>();

    for (const line of body.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('FOREIGN KEY')) continue;
      const columnMatch = /^([a-zA-Z_][a-zA-Z0-9_]*)\s+/u.exec(trimmed);
      if (columnMatch) {
        columns.add(columnMatch[1]);
      }
    }

    tableColumns.set(tableName, columns);
    match = createTableRegex.exec(sql);
  }

  return tableColumns;
}

describe('database schema consistency', () => {
  it('includes symptoms.glucose_reading_id in base schema for fresh installs', () => {
    expect(CREATE_TABLES_SQL).toContain(
      'glucose_reading_id TEXT REFERENCES glucose_readings(id) ON DELETE SET NULL'
    );
  });

  it('keeps CURRENT_SCHEMA_VERSION in sync with the latest migration', () => {
    const migrationsPath = path.resolve(__dirname, '..', 'migrations.ts');
    const migrationsSource = readFileSync(migrationsPath, 'utf8');
    const versions = Array.from(migrationsSource.matchAll(/version:\s*(\d+)/g)).map(match =>
      Number(match[1])
    );

    expect(versions.length).toBeGreaterThan(0);
    expect(CURRENT_SCHEMA_VERSION).toBe(Math.max(...versions));
  });

  it('keeps repository-required columns present in base schema', () => {
    const schemaColumns = parseSchemaColumns(CREATE_TABLES_SQL);
    const requiredColumnsByTable: Record<string, string[]> = {
      pets: [
        'id',
        'name',
        'species',
        'gender',
        'birth_year',
        'weight_kg',
        'diagnosis_date',
        'diabetes_type',
        'insulin_type',
        'photo_uri',
        'is_active',
        'created_at',
        'updated_at',
      ],
      injection_schedule: [
        'id',
        'pet_id',
        'time_of_day',
        'days_of_week',
        'is_active',
        'created_at',
      ],
      feeding_schedule: ['id', 'pet_id', 'time_of_day', 'days_of_week', 'is_active', 'created_at'],
      glucose_readings: [
        'id',
        'pet_id',
        'value_mmol',
        'value_mgdl',
        'meal_relation',
        'insulin_dose',
        'insulin_type',
        'notes',
        'recorded_at',
        'created_at',
        'updated_at',
      ],
      injections: [
        'id',
        'pet_id',
        'insulin_type',
        'dose_units',
        'notes',
        'administered_at',
        'created_at',
      ],
      feedings: [
        'id',
        'pet_id',
        'food_type',
        'amount_grams',
        'notes',
        'fed_at',
        'created_at',
        'food_brand',
        'food_product',
        'protein',
        'fat',
        'fiber',
        'ash',
        'moisture',
        'carbs_dm',
        'verdict',
      ],
      symptoms: [
        'id',
        'pet_id',
        'symptom_types',
        'severity',
        'photo_uris',
        'notes',
        'glucose_reading_id',
        'recorded_at',
        'created_at',
        'updated_at',
      ],
      expenses: [
        'id',
        'pet_id',
        'category',
        'amount',
        'currency',
        'description',
        'date',
        'created_at',
        'updated_at',
      ],
      symptom_entry_types: ['id', 'symptom_id', 'symptom_type'],
    };

    for (const [tableName, requiredColumns] of Object.entries(requiredColumnsByTable)) {
      const existingColumns = schemaColumns.get(tableName);
      expect(existingColumns).toBeDefined();
      for (const column of requiredColumns) {
        expect(existingColumns?.has(column)).toBe(true);
      }
    }
  });
});
