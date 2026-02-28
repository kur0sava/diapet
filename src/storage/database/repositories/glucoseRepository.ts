import { getDatabase } from '../database';
import {
  GlucoseReading,
  CreateGlucoseDTO,
  PaginatedResult,
  GlucoseFilter,
  mmolToMgdl,
  mgdlToMmol,
} from '@storage/domain/types';
import uuid from 'react-native-uuid';

export const glucoseRepository = {
  async create(dto: CreateGlucoseDTO): Promise<GlucoseReading> {
    const db = await getDatabase();
    const id = uuid.v4() as string;
    const now = new Date().toISOString();
    const valueMgdl = dto.unit === 'mg/dL' ? dto.value : mmolToMgdl(dto.value);
    const valueMmol = dto.unit === 'mmol/L' ? dto.value : mgdlToMmol(dto.value);
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

  async findByPetId(petId: string, limit = 50, cursor?: string): Promise<PaginatedResult<GlucoseReading>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM glucose_readings WHERE pet_id = ? AND (? IS NULL OR recorded_at < ?) ORDER BY recorded_at DESC LIMIT ?',
      [petId, cursor ?? null, cursor ?? null, limit + 1]
    );
    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;
    const data = items.map(mapRowToReading);
    return {
      data,
      nextCursor: hasNextPage ? data[data.length - 1].recordedAt : null,
    };
  },

  async findByPetIdFiltered(
    petId: string,
    filters: GlucoseFilter,
    limit = 50,
    cursor?: string,
  ): Promise<PaginatedResult<GlucoseReading>> {
    const db = await getDatabase();
    const conditions: string[] = ['pet_id = ?'];
    const params: any[] = [petId];

    if (cursor) {
      conditions.push('recorded_at < ?');
      params.push(cursor);
    }
    if (filters.dateFrom) {
      conditions.push('recorded_at >= ?');
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push('recorded_at <= ?');
      params.push(filters.dateTo);
    }
    if (filters.levelRanges && filters.levelRanges.length > 0) {
      // Support disjoint ranges (e.g. low + veryHigh)
      const rangeConds: string[] = [];
      for (const range of filters.levelRanges) {
        const parts: string[] = [];
        if (range.min !== undefined) { parts.push('value_mmol >= ?'); params.push(range.min); }
        if (range.max !== undefined) { parts.push('value_mmol <= ?'); params.push(range.max); }
        rangeConds.push(parts.length > 0 ? `(${parts.join(' AND ')})` : '1');
      }
      conditions.push(`(${rangeConds.join(' OR ')})`);
    } else {
      if (filters.levelMin !== undefined) {
        conditions.push('value_mmol >= ?');
        params.push(filters.levelMin);
      }
      if (filters.levelMax !== undefined) {
        conditions.push('value_mmol <= ?');
        params.push(filters.levelMax);
      }
    }
    if (filters.mealRelations && filters.mealRelations.length > 0) {
      const placeholders = filters.mealRelations.map(() => '?').join(', ');
      conditions.push(`meal_relation IN (${placeholders})`);
      params.push(...filters.mealRelations);
    }

    const where = conditions.join(' AND ');
    params.push(limit + 1);

    const rows = await db.getAllAsync<any>(
      `SELECT * FROM glucose_readings WHERE ${where} ORDER BY recorded_at DESC LIMIT ?`,
      params,
    );
    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;
    const data = items.map(mapRowToReading);
    return {
      data,
      nextCursor: hasNextPage ? data[data.length - 1].recordedAt : null,
    };
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
    const sets: string[] = [];
    const params: any[] = [];

    if (dto.value !== undefined && dto.unit) {
      const valueMgdl = dto.unit === 'mg/dL' ? dto.value : mmolToMgdl(dto.value);
      const valueMmol = dto.unit === 'mmol/L' ? dto.value : mgdlToMmol(dto.value);
      sets.push('value_mmol=?', 'value_mgdl=?');
      params.push(valueMmol, valueMgdl);
    }
    if (dto.mealRelation !== undefined) { sets.push('meal_relation=?'); params.push(dto.mealRelation); }
    if (dto.insulinDose !== undefined) { sets.push('insulin_dose=?'); params.push(dto.insulinDose); }
    if (dto.insulinType !== undefined) { sets.push('insulin_type=?'); params.push(dto.insulinType); }
    if (dto.notes !== undefined) { sets.push('notes=?'); params.push(dto.notes); }
    if (dto.recordedAt !== undefined) { sets.push('recorded_at=?'); params.push(dto.recordedAt); }

    if (sets.length > 0) {
      sets.push('updated_at=?');
      params.push(now, id);
      await db.runAsync(`UPDATE glucose_readings SET ${sets.join(', ')} WHERE id=?`, params);
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
