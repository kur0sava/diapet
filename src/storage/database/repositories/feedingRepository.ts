import { getDatabase } from '../database';
import { FeedingLog, CreateFeedingDTO } from '@storage/domain/types';
import uuid from 'react-native-uuid';

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
    const row = await db.getFirstAsync<any>('SELECT * FROM feedings WHERE id = ?', [id]);
    return row ? mapRow(row) : null;
  },

  async findByPetId(petId: string, limit = 50): Promise<FeedingLog[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM feedings WHERE pet_id = ? ORDER BY fed_at DESC LIMIT ?',
      [petId, limit]
    );
    return rows.map(mapRow);
  },

  async findLatest(petId: string): Promise<FeedingLog | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
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

function mapRow(row: any): FeedingLog {
  return {
    id: row.id,
    petId: row.pet_id,
    foodType: row.food_type,
    amountGrams: row.amount_grams,
    notes: row.notes,
    fedAt: row.fed_at,
    createdAt: row.created_at,
  };
}
