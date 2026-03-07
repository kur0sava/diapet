import { getDatabase } from '../database';
import { FeedingLog, CreateFeedingDTO, PaginatedResult } from '@storage/domain/types';
import uuid from 'react-native-uuid';

interface FeedingRow {
  id: string;
  pet_id: string;
  food_type: string | null;
  amount_grams: number | null;
  notes: string | null;
  fed_at: string;
  created_at: string;
}

export const feedingRepository = {
  async create(dto: CreateFeedingDTO): Promise<FeedingLog> {
    const db = await getDatabase();
    const id = uuid.v4() as string;
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO feedings (id, pet_id, food_type, amount_grams, notes, fed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, dto.petId, dto.foodType ?? null, dto.amountGrams ?? null,
       dto.notes ?? null, dto.fedAt ?? now, now]
    );
    return this.findById(id) as Promise<FeedingLog>;
  },

  async findById(id: string): Promise<FeedingLog | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<FeedingRow>('SELECT * FROM feedings WHERE id = ?', [id]);
    return row ? mapRow(row) : null;
  },

  async findByPetId(petId: string, limit = 50, cursor?: string): Promise<PaginatedResult<FeedingLog>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<FeedingRow>(
      'SELECT * FROM feedings WHERE pet_id = ? AND (? IS NULL OR fed_at < ?) ORDER BY fed_at DESC LIMIT ?',
      [petId, cursor ?? null, cursor ?? null, limit + 1]
    );
    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;
    const data = items.map(mapRow);
    return {
      data,
      nextCursor: hasNextPage ? data[data.length - 1].fedAt : null,
    };
  },

  async findLatest(petId: string): Promise<FeedingLog | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<FeedingRow>(
      'SELECT * FROM feedings WHERE pet_id = ? ORDER BY fed_at DESC LIMIT 1',
      [petId]
    );
    return row ? mapRow(row) : null;
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM feedings WHERE id = ?', [id]);
  },
};

function mapRow(row: FeedingRow): FeedingLog {
  return {
    id: row.id,
    petId: row.pet_id,
    foodType: row.food_type ?? undefined,
    amountGrams: row.amount_grams ?? undefined,
    notes: row.notes ?? undefined,
    fedAt: row.fed_at,
    createdAt: row.created_at,
  };
}
