import { getDatabase } from '../database';
import { encodeCursor, decodeCursor } from './cursor';
import {
  GlucoseReading,
  CreateGlucoseDTO,
  PaginatedResult,
  GlucoseFilter,
  mmolToMgdl,
  mgdlToMmol,
} from '@storage/domain/types';
import uuid from 'react-native-uuid';

interface GlucoseRow {
  id: string;
  pet_id: string;
  value_mmol: number;
  value_mgdl: number;
  meal_relation: string;
  insulin_dose: number | null;
  insulin_type: string | null;
  notes: string | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

interface GlucoseStatsRow {
  avg: number | null;
  min: number | null;
  max: number | null;
  count: number;
}

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
      [
        id,
        dto.petId,
        valueMmol,
        valueMgdl,
        dto.mealRelation ?? 'unspecified',
        dto.insulinDose ?? null,
        dto.insulinType ?? null,
        dto.notes ?? null,
        dto.recordedAt ?? now,
        now,
        now,
      ]
    );
    const result = await this.findById(id);
    if (!result) throw new Error(`Failed to read back glucose reading ${id} after insert`);
    return result;
  },

  async findById(id: string): Promise<GlucoseReading | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<GlucoseRow>('SELECT * FROM glucose_readings WHERE id = ?', [
      id,
    ]);
    return row ? mapRowToReading(row) : null;
  },

  async findByPetId(
    petId: string,
    limit = 50,
    cursor?: string
  ): Promise<PaginatedResult<GlucoseReading>> {
    const db = await getDatabase();
    // Composite (recorded_at, id) cursor: a plain `recorded_at < ?` cursor
    // silently drops every row that shares a timestamp with the page
    // boundary (caught by the scenario fuzz — 20 same-second readings
    // paginated down to 7).
    const cur = decodeCursor(cursor);
    const rows = await db.getAllAsync<GlucoseRow>(
      `SELECT * FROM glucose_readings WHERE pet_id = ?
       AND (? IS NULL OR recorded_at < ? OR (recorded_at = ? AND id < ?))
       ORDER BY recorded_at DESC, id DESC LIMIT ?`,
      [petId, cur.ts, cur.ts, cur.ts, cur.id, limit + 1]
    );
    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;
    const data = items.map(mapRowToReading);
    return {
      data,
      nextCursor: hasNextPage
        ? encodeCursor(data[data.length - 1].recordedAt, data[data.length - 1].id)
        : null,
    };
  },

  async findByPetIdFiltered(
    petId: string,
    filters: GlucoseFilter,
    limit = 50,
    cursor?: string
  ): Promise<PaginatedResult<GlucoseReading>> {
    const db = await getDatabase();
    const conditions: string[] = ['pet_id = ?'];
    const params: (string | number | null)[] = [petId];

    if (cursor) {
      const cur = decodeCursor(cursor);
      conditions.push('(recorded_at < ? OR (recorded_at = ? AND id < ?))');
      params.push(cur.ts, cur.ts, cur.id);
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
        if (range.min !== undefined) {
          parts.push('value_mmol >= ?');
          params.push(range.min);
        }
        if (range.max !== undefined) {
          parts.push(range.maxExclusive ? 'value_mmol < ?' : 'value_mmol <= ?');
          params.push(range.max);
        }
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

    const rows = await db.getAllAsync<GlucoseRow>(
      `SELECT * FROM glucose_readings WHERE ${where} ORDER BY recorded_at DESC, id DESC LIMIT ?`,
      params
    );
    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;
    const data = items.map(mapRowToReading);
    return {
      data,
      nextCursor: hasNextPage
        ? encodeCursor(data[data.length - 1].recordedAt, data[data.length - 1].id)
        : null,
    };
  },

  async findForDay(petId: string, dateStr: string): Promise<GlucoseReading[]> {
    // BL-05: Convert local day boundaries to UTC ISO for comparison with stored UTC timestamps.
    // TZ invariant: `dateStr` is a calendar day in the CURRENT device timezone
    // (Date parses "T00:00:00" as local time). Same rule in injection/feeding
    // repositories — all "day" views group by the device's present timezone.
    // After a timezone change, records near midnight may regroup to the
    // neighboring day; that is accepted behavior (diary always answers "what
    // happened this day where I am now"), not data loss — don't "fix" one
    // repository alone or day views will disagree with each other.
    const dayStart = new Date(`${dateStr}T00:00:00`).toISOString();
    const dayEnd = new Date(`${dateStr}T23:59:59.999`).toISOString();
    const db = await getDatabase();
    const rows = await db.getAllAsync<GlucoseRow>(
      'SELECT * FROM glucose_readings WHERE pet_id = ? AND recorded_at >= ? AND recorded_at <= ? ORDER BY recorded_at ASC',
      [petId, dayStart, dayEnd]
    );
    return rows.map(mapRowToReading);
  },

  async findAllByPetId(petId: string): Promise<GlucoseReading[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<GlucoseRow>(
      'SELECT * FROM glucose_readings WHERE pet_id = ? ORDER BY recorded_at ASC',
      [petId]
    );
    return rows.map(mapRowToReading);
  },

  async findLast7Days(petId: string): Promise<GlucoseReading[]> {
    const db = await getDatabase();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const rows = await db.getAllAsync<GlucoseRow>(
      'SELECT * FROM glucose_readings WHERE pet_id = ? AND recorded_at >= ? ORDER BY recorded_at ASC',
      [petId, sevenDaysAgo]
    );
    return rows.map(mapRowToReading);
  },

  async findLatest(petId: string): Promise<GlucoseReading | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<GlucoseRow>(
      'SELECT * FROM glucose_readings WHERE pet_id = ? ORDER BY recorded_at DESC LIMIT 1',
      [petId]
    );
    return row ? mapRowToReading(row) : null;
  },

  /** Latest reading that carries an inline insulin dose (logged via LogGlucoseScreen). */
  async findLatestWithInsulin(petId: string): Promise<GlucoseReading | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<GlucoseRow>(
      'SELECT * FROM glucose_readings WHERE pet_id = ? AND insulin_dose > 0 ORDER BY recorded_at DESC LIMIT 1',
      [petId]
    );
    return row ? mapRowToReading(row) : null;
  },

  /** Reading with an inline insulin dose closest in time to a given ISO datetime
   *  (duplicate-injection safety check — mirrors injectionRepository.findNearestTo). */
  async findNearestInsulinTo(
    petId: string,
    isoDateTime: string,
    excludeId?: string
  ): Promise<GlucoseReading | null> {
    const db = await getDatabase();
    // audit L1: exclude the reading being edited in SQL, not in JS — otherwise
    // the edited reading itself is the nearest match (distance 0) and the true
    // second-nearest inline dose is never returned, skipping its double-dose warn.
    const row = await db.getFirstAsync<GlucoseRow>(
      `SELECT * FROM glucose_readings WHERE pet_id = ? AND insulin_dose > 0
       AND (? IS NULL OR id != ?)
       ORDER BY ABS(julianday(recorded_at) - julianday(?)) ASC LIMIT 1`,
      [petId, excludeId ?? null, excludeId ?? null, isoDateTime]
    );
    return row ? mapRowToReading(row) : null;
  },

  async update(id: string, dto: Partial<CreateGlucoseDTO>): Promise<GlucoseReading | null> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const sets: string[] = [];
    const params: (string | number | null)[] = [];

    if (dto.value !== undefined) {
      const unit = dto.unit ?? 'mmol/L';
      const valueMgdl = unit === 'mg/dL' ? dto.value : mmolToMgdl(dto.value);
      const valueMmol = unit === 'mmol/L' ? dto.value : mgdlToMmol(dto.value);
      sets.push('value_mmol=?', 'value_mgdl=?');
      params.push(valueMmol, valueMgdl);
    }
    if (dto.mealRelation !== undefined) {
      sets.push('meal_relation=?');
      params.push(dto.mealRelation);
    }
    if ('insulinDose' in dto) {
      sets.push('insulin_dose=?');
      params.push(dto.insulinDose ?? null);
    }
    if ('insulinType' in dto) {
      sets.push('insulin_type=?');
      params.push(dto.insulinType ?? null);
    }
    if ('notes' in dto) {
      sets.push('notes=?');
      params.push(dto.notes ?? null);
    }
    if (dto.recordedAt !== undefined) {
      sets.push('recorded_at=?');
      params.push(dto.recordedAt);
    }

    if (sets.length > 0) {
      sets.push('updated_at=?');
      params.push(now, id);
      await db.runAsync(`UPDATE glucose_readings SET ${sets.join(', ')} WHERE id=?`, params);
    }
    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    // Wrap in transaction: nullify symptom FK then delete reading atomically
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        'UPDATE symptoms SET glucose_reading_id = NULL WHERE glucose_reading_id = ?',
        [id]
      );
      await db.runAsync('DELETE FROM glucose_readings WHERE id = ?', [id]);
    });
  },

  async getStats(
    petId: string,
    days = 30
  ): Promise<{ avg: number; min: number; max: number; count: number }> {
    const db = await getDatabase();
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const row = await db.getFirstAsync<GlucoseStatsRow>(
      'SELECT AVG(value_mmol) as avg, MIN(value_mmol) as min, MAX(value_mmol) as max, COUNT(*) as count FROM glucose_readings WHERE pet_id = ? AND recorded_at >= ?',
      [petId, since]
    );
    return { avg: row?.avg ?? 0, min: row?.min ?? 0, max: row?.max ?? 0, count: row?.count ?? 0 };
  },
};

function mapRowToReading(row: GlucoseRow): GlucoseReading {
  return {
    id: row.id,
    petId: row.pet_id,
    valueMmol: row.value_mmol,
    valueMgdl: row.value_mgdl,
    mealRelation: row.meal_relation as GlucoseReading['mealRelation'],
    insulinDose: row.insulin_dose ?? undefined,
    insulinType: row.insulin_type ?? undefined,
    notes: row.notes ?? undefined,
    recordedAt: row.recorded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
