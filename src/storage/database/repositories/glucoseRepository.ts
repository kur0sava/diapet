import { getDatabase } from '../database';
import { GlucoseReading, CreateGlucoseDTO } from '@storage/domain/types';
import uuid from 'react-native-uuid';

const mmolToMgdl = (mmol: number) => Math.round(mmol * 18.018);

export const glucoseRepository = {
  async create(dto: CreateGlucoseDTO): Promise<GlucoseReading> {
    const db = await getDatabase();
    const id = uuid.v4() as string;
    const now = new Date().toISOString();
    const valueMgdl = dto.unit === 'mg/dL' ? dto.value : mmolToMgdl(dto.value);
    const valueMmol = dto.unit === 'mmol/L' ? dto.value : dto.value / 18.018;
    await db.runAsync(
      `INSERT INTO glucose_readings (id, pet_id, value_mmol, value_mgdl, meal_relation, insulin_dose, insulin_type, notes, recorded_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, dto.petId, valueMmol, valueMgdl, dto.mealRelation ?? 'unspecified',
       dto.insulinDose ?? null, dto.insulinType ?? null, dto.notes ?? null,
       dto.recordedAt ?? now, now, now]
    );
    return this.findById(id) as Promise<GlucoseReading>;
  },

  async findById(id: string): Promise<GlucoseReading | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>('SELECT * FROM glucose_readings WHERE id = ?', [id]);
    return row ? mapRowToReading(row) : null;
  },

  async findByPetId(petId: string, limit = 100): Promise<GlucoseReading[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM glucose_readings WHERE pet_id = ? ORDER BY recorded_at DESC LIMIT ?',
      [petId, limit]
    );
    return rows.map(mapRowToReading);
  },

  async findLast7Days(petId: string): Promise<GlucoseReading[]> {
    const db = await getDatabase();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM glucose_readings WHERE pet_id = ? AND recorded_at >= ? ORDER BY recorded_at ASC',
      [petId, sevenDaysAgo]
    );
    return rows.map(mapRowToReading);
  },

  async findLatest(petId: string): Promise<GlucoseReading | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM glucose_readings WHERE pet_id = ? ORDER BY recorded_at DESC LIMIT 1',
      [petId]
    );
    return row ? mapRowToReading(row) : null;
  },

  async update(id: string, dto: Partial<CreateGlucoseDTO>): Promise<GlucoseReading | null> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    if (dto.value !== undefined && dto.unit) {
      const valueMgdl = dto.unit === 'mg/dL' ? dto.value : mmolToMgdl(dto.value);
      const valueMmol = dto.unit === 'mmol/L' ? dto.value : dto.value / 18.018;
      await db.runAsync(
        'UPDATE glucose_readings SET value_mmol=?, value_mgdl=?, meal_relation=COALESCE(?,meal_relation), insulin_dose=COALESCE(?,insulin_dose), notes=COALESCE(?,notes), updated_at=? WHERE id=?',
        [valueMmol, valueMgdl, dto.mealRelation ?? null, dto.insulinDose ?? null, dto.notes ?? null, now, id]
      );
    }
    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM glucose_readings WHERE id = ?', [id]);
  },

  async getStats(petId: string, days = 30): Promise<{ avg: number; min: number; max: number; count: number }> {
    const db = await getDatabase();
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const row = await db.getFirstAsync<any>(
      'SELECT AVG(value_mmol) as avg, MIN(value_mmol) as min, MAX(value_mmol) as max, COUNT(*) as count FROM glucose_readings WHERE pet_id = ? AND recorded_at >= ?',
      [petId, since]
    );
    return { avg: row?.avg ?? 0, min: row?.min ?? 0, max: row?.max ?? 0, count: row?.count ?? 0 };
  },
};

function mapRowToReading(row: any): GlucoseReading {
  return {
    id: row.id,
    petId: row.pet_id,
    valueMmol: row.value_mmol,
    valueMgdl: row.value_mgdl,
    mealRelation: row.meal_relation,
    insulinDose: row.insulin_dose,
    insulinType: row.insulin_type,
    notes: row.notes,
    recordedAt: row.recorded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
