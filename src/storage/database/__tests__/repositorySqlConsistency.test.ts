import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import { CREATE_TABLES_SQL } from '../schema';

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
      if (columnMatch) columns.add(columnMatch[1]);
    }

    tableColumns.set(tableName, columns);
    match = createTableRegex.exec(sql);
  }

  return tableColumns;
}

describe('repository SQL consistency', () => {
  it('uses only existing columns in INSERT statements', () => {
    const schemaColumns = parseSchemaColumns(CREATE_TABLES_SQL);
    const repositoriesDir = path.resolve(__dirname, '..', 'repositories');
    const repoFiles = readdirSync(repositoriesDir).filter(f => f.endsWith('.ts'));
    const insertRegex = /INSERT INTO\s+(\w+)\s*\(([\s\S]*?)\)\s*VALUES/g;

    for (const fileName of repoFiles) {
      const source = readFileSync(path.join(repositoriesDir, fileName), 'utf8');
      let match: RegExpExecArray | null = insertRegex.exec(source);

      while (match) {
        const tableName = match[1];
        const columnsRaw = match[2];
        const insertColumns = columnsRaw
          .split(',')
          .map(col => col.replace(/\s+/g, ' ').trim())
          .filter(Boolean);

        const existingColumns = schemaColumns.get(tableName);
        expect(existingColumns).toBeDefined();

        for (const column of insertColumns) {
          expect(existingColumns?.has(column)).toBe(true);
        }

        match = insertRegex.exec(source);
      }
    }
  });
});
