import { getDatabase } from '../database';
import { encodeCursor, decodeCursor } from './cursor';
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
  food_brand: string | null;
  food_product: string | null;
  protein: number | null;
  fat: number | null;
  fiber: number | null;
  ash: number | null;
  moisture: number | null;
  carbs_dm: number | null;
  verdict: string | null;
}

export const feedingRepository = {
  async create(dto: CreateFeedingDTO): Promise<FeedingLog> {
    const db = await getDatabase();
    const id = uuid.v4() as string;
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO feedings (id, pet_id, food_type, amount_grams, notes, fed_at, created_at,
        food_brand, food_product, protein, fat, fiber, ash, moisture, carbs_dm, verdict)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        dto.petId,
        dto.foodType ?? null,
        dto.amountGrams ?? null,
        dto.notes ?? null,
        dto.fedAt ?? now,
        now,
        dto.foodBrand ?? null,
        dto.foodProduct ?? null,
        dto.protein ?? null,
        dto.fat ?? null,
        dto.fiber ?? null,
        dto.ash ?? null,
        dto.moisture ?? null,
        dto.carbsDM ?? null,
        dto.verdict ?? null,
      ]
    );
    const result = await this.findById(id);
    if (!result) throw new Error(`Failed to read back feeding ${id} after insert`);
    return result;
  },

  async findById(id: string): Promise<FeedingLog | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<FeedingRow>('SELECT * FROM feedings WHERE id = ?', [id]);
    return row ? mapRow(row) : null;
  },

  async findByPetId(
    petId: string,
    limit = 50,
    cursor?: string
  ): Promise<PaginatedResult<FeedingLog>> {
    const db = await getDatabase();
    // Composite cursor — see cursor.ts (plain `< ts` drops same-timestamp rows)
    const cur = decodeCursor(cursor);
    const rows = await db.getAllAsync<FeedingRow>(
      `SELECT * FROM feedings WHERE pet_id = ?
       AND (? IS NULL OR fed_at < ? OR (fed_at = ? AND id < ?))
       ORDER BY fed_at DESC, id DESC LIMIT ?`,
      [petId, cur.ts, cur.ts, cur.ts, cur.id, limit + 1]
    );
    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;
    const data = items.map(mapRow);
    return {
      data,
      nextCursor: hasNextPage
        ? encodeCursor(data[data.length - 1].fedAt, data[data.length - 1].id)
        : null,
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

  async findAllByPetId(petId: string): Promise<FeedingLog[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<FeedingRow>(
      'SELECT * FROM feedings WHERE pet_id = ? ORDER BY fed_at ASC',
      [petId]
    );
    return rows.map(mapRow);
  },

  async findForDay(petId: string, dateStr: string): Promise<FeedingLog[]> {
    // TZ invariant: dateStr = calendar day in the CURRENT device timezone;
    // see glucoseRepository.findForDay for the full rationale.
    const dayStart = new Date(`${dateStr}T00:00:00`).toISOString();
    const dayEnd = new Date(`${dateStr}T23:59:59.999`).toISOString();
    const db = await getDatabase();
    const rows = await db.getAllAsync<FeedingRow>(
      'SELECT * FROM feedings WHERE pet_id = ? AND fed_at >= ? AND fed_at <= ? ORDER BY fed_at ASC',
      [petId, dayStart, dayEnd]
    );
    return rows.map(mapRow);
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
    foodBrand: row.food_brand ?? undefined,
    foodProduct: row.food_product ?? undefined,
    protein: row.protein ?? undefined,
    fat: row.fat ?? undefined,
    fiber: row.fiber ?? undefined,
    ash: row.ash ?? undefined,
    moisture: row.moisture ?? undefined,
    carbsDM: row.carbs_dm ?? undefined,
    verdict: row.verdict ?? undefined,
  };
}
