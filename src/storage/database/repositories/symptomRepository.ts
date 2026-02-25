import { getDatabase } from '../database';
import { SymptomEntry, SymptomType, CreateSymptomDTO, PaginatedResult } from '@storage/domain/types';
import uuid from 'react-native-uuid';

export const symptomRepository = {
  async create(dto: CreateSymptomDTO): Promise<SymptomEntry> {
    const db = await getDatabase();
    const id = uuid.v4() as string;
    const now = new Date().toISOString();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO symptoms (id, pet_id, symptom_types, severity, photo_uris, notes, glucose_reading_id, recorded_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, dto.petId, JSON.stringify(dto.symptomTypes), dto.severity ?? 'mild',
         dto.photoUris ? JSON.stringify(dto.photoUris) : null,
         dto.notes ?? null, dto.glucoseReadingId ?? null, dto.recordedAt ?? now, now, now]
      );
      for (const symptomType of dto.symptomTypes) {
        const entryId = uuid.v4() as string;
        await db.runAsync(
          'INSERT INTO symptom_entry_types (id, symptom_id, symptom_type) VALUES (?, ?, ?)',
          [entryId, id, symptomType]
        );
      }
    });
    return this.findById(id) as Promise<SymptomEntry>;
  },

  async findById(id: string): Promise<SymptomEntry | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>('SELECT * FROM symptoms WHERE id = ?', [id]);
    if (!row) return null;
    const types = await db.getAllAsync<{ symptom_type: string }>(
      'SELECT symptom_type FROM symptom_entry_types WHERE symptom_id = ?',
      [id]
    );
    return mapRowToSymptom(row, types.length > 0 ? types.map(t => t.symptom_type as SymptomType) : undefined);
  },

  async findByPetId(petId: string, limit = 50, cursor?: string): Promise<PaginatedResult<SymptomEntry>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM symptoms WHERE pet_id = ? AND (? IS NULL OR recorded_at < ?) ORDER BY recorded_at DESC LIMIT ?',
      [petId, cursor ?? null, cursor ?? null, limit + 1]
    );
    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;

    if (items.length === 0) {
      return { data: [], nextCursor: null };
    }

    // Batch-load all symptom types for the returned symptom IDs
    const ids = items.map((r: any) => r.id as string);
    const placeholders = ids.map(() => '?').join(',');
    const typeRows = await db.getAllAsync<{ symptom_id: string; symptom_type: string }>(
      `SELECT symptom_id, symptom_type FROM symptom_entry_types WHERE symptom_id IN (${placeholders})`,
      ids
    );
    // Group types by symptom_id
    const typesBySymptomId = new Map<string, SymptomType[]>();
    for (const tr of typeRows) {
      const arr = typesBySymptomId.get(tr.symptom_id) ?? [];
      arr.push(tr.symptom_type as SymptomType);
      typesBySymptomId.set(tr.symptom_id, arr);
    }

    const data = items.map((row: any) => {
      const junctionTypes = typesBySymptomId.get(row.id);
      return mapRowToSymptom(row, junctionTypes && junctionTypes.length > 0 ? junctionTypes : undefined);
    });

    return {
      data,
      nextCursor: hasNextPage ? data[data.length - 1].recordedAt : null,
    };
  },

  async update(id: string, dto: Partial<CreateSymptomDTO>): Promise<SymptomEntry | null> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `UPDATE symptoms SET symptom_types=COALESCE(?,symptom_types), severity=COALESCE(?,severity),
         photo_uris=COALESCE(?,photo_uris), notes=COALESCE(?,notes),
         glucose_reading_id=COALESCE(?,glucose_reading_id), updated_at=? WHERE id=?`,
        [dto.symptomTypes ? JSON.stringify(dto.symptomTypes) : null,
         dto.severity ?? null, dto.photoUris ? JSON.stringify(dto.photoUris) : null,
         dto.notes ?? null, dto.glucoseReadingId ?? null, now, id]
      );
      if (dto.symptomTypes) {
        await db.runAsync('DELETE FROM symptom_entry_types WHERE symptom_id = ?', [id]);
        for (const symptomType of dto.symptomTypes) {
          const entryId = uuid.v4() as string;
          await db.runAsync(
            'INSERT INTO symptom_entry_types (id, symptom_id, symptom_type) VALUES (?, ?, ?)',
            [entryId, id, symptomType]
          );
        }
      }
    });
    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    // CASCADE handles symptom_entry_types cleanup
    await db.runAsync('DELETE FROM symptoms WHERE id = ?', [id]);
  },
};

function mapRowToSymptom(row: any, types?: SymptomType[]): SymptomEntry {
  return {
    id: row.id,
    petId: row.pet_id,
    symptomTypes: types ?? JSON.parse(row.symptom_types),
    severity: row.severity,
    photoUris: row.photo_uris ? JSON.parse(row.photo_uris) : [],
    notes: row.notes,
    glucoseReadingId: row.glucose_reading_id ?? undefined,
    recordedAt: row.recorded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
