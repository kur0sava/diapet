import { getDatabase } from '../database';
import { SymptomEntry, CreateSymptomDTO } from '@storage/domain/types';
import uuid from 'react-native-uuid';

export const symptomRepository = {
  async create(dto: CreateSymptomDTO): Promise<SymptomEntry> {
    const db = await getDatabase();
    const id = uuid.v4() as string;
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO symptoms (id, pet_id, symptom_types, severity, photo_uris, notes, recorded_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, dto.petId, JSON.stringify(dto.symptomTypes), dto.severity ?? 'mild',
       dto.photoUris ? JSON.stringify(dto.photoUris) : null,
       dto.notes ?? null, dto.recordedAt ?? now, now, now]
    );
    return this.findById(id) as Promise<SymptomEntry>;
  },

  async findById(id: string): Promise<SymptomEntry | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>('SELECT * FROM symptoms WHERE id = ?', [id]);
    return row ? mapRowToSymptom(row) : null;
  },

  async findByPetId(petId: string, limit = 100): Promise<SymptomEntry[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM symptoms WHERE pet_id = ? ORDER BY recorded_at DESC LIMIT ?',
      [petId, limit]
    );
    return rows.map(mapRowToSymptom);
  },

  async update(id: string, dto: Partial<CreateSymptomDTO>): Promise<SymptomEntry | null> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE symptoms SET symptom_types=COALESCE(?,symptom_types), severity=COALESCE(?,severity),
       photo_uris=COALESCE(?,photo_uris), notes=COALESCE(?,notes), updated_at=? WHERE id=?`,
      [dto.symptomTypes ? JSON.stringify(dto.symptomTypes) : null,
       dto.severity ?? null, dto.photoUris ? JSON.stringify(dto.photoUris) : null,
       dto.notes ?? null, now, id]
    );
    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM symptoms WHERE id = ?', [id]);
  },
};

function mapRowToSymptom(row: any): SymptomEntry {
  return {
    id: row.id,
    petId: row.pet_id,
    symptomTypes: JSON.parse(row.symptom_types),
    severity: row.severity,
    photoUris: row.photo_uris ? JSON.parse(row.photo_uris) : [],
    notes: row.notes,
    recordedAt: row.recorded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
