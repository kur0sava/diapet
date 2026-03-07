import { getDatabase } from '../database';
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
      [id, dto.petId, dto.insulinType, dto.doseUnits, dto.notes ?? null,
       dto.administeredAt ?? now, now]
    );
    return this.findById(id) as Promise<InjectionLog>;
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

  async findByPetId(petId: string, limit = 50, cursor?: string): Promise<PaginatedResult<InjectionLog>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<InjectionRow>(
      'SELECT * FROM injections WHERE pet_id = ? AND (? IS NULL OR administered_at < ?) ORDER BY administered_at DESC LIMIT ?',
      [petId, cursor ?? null, cursor ?? null, limit + 1]
    );
    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;
    const data = items.map(mapRow);
    return {
      data,
      nextCursor: hasNextPage ? data[data.length - 1].administeredAt : null,
    };
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
