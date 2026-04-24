import { readFileSync } from 'fs';
import path from 'path';

/**
 * Upgrade-path regression tests for migrations.ts.
 *
 * Background: migration v9 shipped with a plain `UPDATE pets SET species = 'cat'`
 * assuming the column existed in every install. But the column was only added to
 * `CREATE_TABLES_SQL` — which does not re-run on upgrading installs — so users on
 * v2.4.3 hit "no such column: species" on first v2.5.0 launch and got stuck.
 *
 * These tests scan the migrations source for patterns that indicate a migration
 * reads or writes a column that the legacy schema (before that migration ran) may
 * not have. A migration that touches a "new" column MUST either:
 *   - check `PRAGMA table_info(table)` and `ALTER TABLE` if missing, or
 *   - be a column-add itself (ALTER TABLE ADD COLUMN), or
 *   - operate only on rows created after the column was introduced.
 */
describe('migration upgrade paths', () => {
  const migrationsSource = readFileSync(path.resolve(__dirname, '..', 'migrations.ts'), 'utf8');

  it('v9 guards the pets.species column before UPDATE', () => {
    // The v9 block must mention both table_info(pets) inspection and an
    // ALTER TABLE ADD COLUMN species fallback. If either disappears the
    // migration regresses to the legacy-install brick.
    const v9Block = extractMigrationBlock(migrationsSource, 9);
    expect(v9Block).toMatch(/PRAGMA\s+table_info\s*\(\s*pets\s*\)/i);
    expect(v9Block).toMatch(/ALTER\s+TABLE\s+pets\s+ADD\s+COLUMN\s+species/i);
  });

  it('no migration UPDATEs a column without a nearby existence check or ALTER', () => {
    // For every migration block, collect column names used in UPDATE / WHERE
    // filters. If a migration UPDATEs pets.species-style columns that are not
    // in the legacy-install schema, it must declare a guard nearby.
    const migrationVersions = extractMigrationVersions(migrationsSource);
    for (const version of migrationVersions) {
      const block = extractMigrationBlock(migrationsSource, version);
      const updateMatches = block.matchAll(/UPDATE\s+(\w+)\s+SET\s+(\w+)\s*=/gi);
      for (const m of updateMatches) {
        const table = m[1];
        const column = m[2];
        const hasGuard =
          new RegExp(`PRAGMA\\s+table_info\\s*\\(\\s*${table}\\s*\\)`, 'i').test(block) ||
          new RegExp(`ALTER\\s+TABLE\\s+${table}\\s+ADD\\s+COLUMN\\s+${column}`, 'i').test(block);
        const isBaselineColumn = BASELINE_COLUMNS[table]?.includes(column) ?? false;
        if (!isBaselineColumn && !hasGuard) {
          throw new Error(
            `Migration v${version} UPDATEs ${table}.${column} without guarding against a legacy install that may lack the column. Add a PRAGMA table_info check + ALTER TABLE ADD COLUMN, or mark this column as pre-existing in the test's BASELINE_COLUMNS.`
          );
        }
      }
    }
  });
});

/**
 * Columns known to exist in the very first release of the app (v1.0). Migrations
 * may freely UPDATE these without a guard. Extend only when a column was truly
 * present in the initial CREATE_TABLES_SQL, not when it was added later.
 */
const BASELINE_COLUMNS: Record<string, string[]> = {
  pets: [
    'id',
    'name',
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
  symptoms: [
    'id',
    'pet_id',
    'symptom_types',
    'severity',
    'photo_uris',
    'notes',
    'recorded_at',
    'created_at',
    'updated_at',
  ],
};

function extractMigrationVersions(source: string): number[] {
  return Array.from(source.matchAll(/version:\s*(\d+)/g)).map(m => Number(m[1]));
}

function extractMigrationBlock(source: string, version: number): string {
  // Find the object literal starting at `version: <version>` and return text up
  // to the next top-level `version:` marker or end of array.
  const startRegex = new RegExp(`version:\\s*${version}\\b`);
  const startMatch = startRegex.exec(source);
  if (!startMatch) return '';
  const rest = source.slice(startMatch.index);
  // Stop at the next `version: N` marker (different version) or at the closing ];
  const nextStart = /version:\s*\d+/g;
  nextStart.lastIndex = `version: ${version}`.length;
  const nextMatch = nextStart.exec(rest);
  const terminator = rest.indexOf('\n];');
  const end = [nextMatch?.index, terminator === -1 ? undefined : terminator]
    .filter((x): x is number => typeof x === 'number')
    .reduce((min, x) => (x < min ? x : min), rest.length);
  return rest.slice(0, end);
}
