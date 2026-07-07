import { getDatabase } from '../database';
import { encodeCursor, decodeCursor } from './cursor';
import { InjectionLog, CreateInjectionDTO, PaginatedResult } from '@storage/domain/types';
import uuid from 'react-native-uuid';

interface InjectionRow {
  id: string;
  pet_id: string;
  insulin_type: string;
  dose_units: number;
  notes: string | null;
  administered_at: string;
  created_at: string;
}

export const injectionRepository = {
  async create(dto: CreateInjectionDTO): Promise<InjectionLog> {
    const db = await getDatabase();
    const id = uuid.v4() as string;
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO injections (id, pet_id, insulin_type, dose_units, notes, administered_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        dto.petId,
        dto.insulinType,
        dto.doseUnits,
        dto.notes ?? null,
        dto.administeredAt ?? now,
        now,
      ]
    );
    const result = await this.findById(id);
    if (!result) throw new Error(`Failed to read back injection ${id} after insert`);
    return result;
  },

  async findById(id: string): Promise<InjectionLog | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<InjectionRow>('SELECT * FROM injections WHERE id = ?', [id]);
    return row ? mapRow(row) : null;
  },

  async findLatest(petId: string): Promise<InjectionLog | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<InjectionRow>(
      'SELECT * FROM injections WHERE pet_id = ? ORDER BY administered_at DESC LIMIT 1',
      [petId]
    );
    return row ? mapRow(row) : null;
  },

  /** Find the injection closest in time to a given ISO datetime (for duplicate check). */
  async findNearestTo(petId: string, isoDateTime: string): Promise<InjectionLog | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<InjectionRow>(
      `SELECT * FROM injections WHERE pet_id = ?
       ORDER BY ABS(julianday(administered_at) - julianday(?)) ASC LIMIT 1`,
      [petId, isoDateTime]
    );
    return row ? mapRow(row) : null;
  },

  async findByPetId(
    petId: string,
    limit = 50,
    cursor?: string
  ): Promise<PaginatedResult<InjectionLog>> {
    const db = await getDatabase();
    // Composite cursor — see cursor.ts (plain `< ts` drops same-timestamp rows)
    const cur = decodeCursor(cursor);
    const rows = await db.getAllAsync<InjectionRow>(
      `SELECT * FROM injections WHERE pet_id = ?
       AND (? IS NULL OR administered_at < ? OR (administered_at = ? AND id < ?))
       ORDER BY administered_at DESC, id DESC LIMIT ?`,
      [petId, cur.ts, cur.ts, cur.ts, cur.id, limit + 1]
    );
    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;
    const data = items.map(mapRow);
    return {
      data,
      nextCursor: hasNextPage
        ? encodeCursor(data[data.length - 1].administeredAt, data[data.length - 1].id)
        : null,
    };
  },

  async findAllByPetId(petId: string): Promise<InjectionLog[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<InjectionRow>(
      'SELECT * FROM injections WHERE pet_id = ? ORDER BY administered_at ASC',
      [petId]
    );
    return rows.map(mapRow);
  },

  async findForDay(petId: string, dateStr: string): Promise<InjectionLog[]> {
    const dayStart = new Date(`${dateStr}T00:00:00`).toISOString();
    const dayEnd = new Date(`${dateStr}T23:59:59.999`).toISOString();
    const db = await getDatabase();
    const rows = await db.getAllAsync<InjectionRow>(
      'SELECT * FROM injections WHERE pet_id = ? AND administered_at >= ? AND administered_at <= ? ORDER BY administered_at ASC',
      [petId, dayStart, dayEnd]
    );
    return rows.map(mapRow);
  },

  async countByPetId(petId: string): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM injections WHERE pet_id = ?',
      [petId]
    );
    return row?.cnt ?? 0;
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM injections WHERE id = ?', [id]);
  },
};

function mapRow(row: InjectionRow): InjectionLog {
  return {
    id: row.id,
    petId: row.pet_id,
    insulinType: row.insulin_type,
    doseUnits: row.dose_units,
    notes: row.notes ?? undefined,
    administeredAt: row.administered_at,
    createdAt: row.created_at,
  };
}
