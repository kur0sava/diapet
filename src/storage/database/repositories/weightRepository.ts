import { getDatabase } from '../database';
import { WeightEntry, CreateWeightDTO } from '@storage/domain/types';
import uuid from 'react-native-uuid';

interface WeightRow {
  id: string;
  pet_id: string;
  weight_kg: number;
  notes: string | null;
  recorded_at: string;
  created_at: string;
}

export const weightRepository = {
  /** Insert a weight entry. Does NOT touch pets.weight_kg — use logWeight()
   *  for the user-facing "record new weight" flow. */
  async create(dto: CreateWeightDTO): Promise<WeightEntry> {
    const db = await getDatabase();
    const id = uuid.v4() as string;
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO weight_entries (id, pet_id, weight_kg, notes, recorded_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, dto.petId, dto.weightKg, dto.notes ?? null, dto.recordedAt ?? now, now]
    );
    const row = await db.getFirstAsync<WeightRow>('SELECT * FROM weight_entries WHERE id = ?', [
      id,
    ]);
    if (!row) throw new Error(`Failed to read back weight entry ${id} after insert`);
    return mapRow(row);
  },

  /**
   * The user-facing "record new weight" flow: always inserts a history entry
   * (even when the value hasn't changed — a stable monthly weigh-in is data)
   * and syncs pets.weight_kg so every screen shows the latest weight.
   * Uses a raw UPDATE instead of petRepository.update to avoid the
   * changed-weight auto-history hook there double-inserting.
   */
  async logWeight(petId: string, weightKg: number, notes?: string): Promise<WeightEntry> {
    const entry = await this.create({ petId, weightKg, notes });
    const db = await getDatabase();
    await db.runAsync('UPDATE pets SET weight_kg = ?, updated_at = ? WHERE id = ?', [
      weightKg,
      new Date().toISOString(),
      petId,
    ]);
    return entry;
  },

  async findAllByPetId(petId: string): Promise<WeightEntry[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<WeightRow>(
      'SELECT * FROM weight_entries WHERE pet_id = ? ORDER BY recorded_at ASC, id ASC',
      [petId]
    );
    return rows.map(mapRow);
  },

  async findLatest(petId: string): Promise<WeightEntry | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<WeightRow>(
      'SELECT * FROM weight_entries WHERE pet_id = ? ORDER BY recorded_at DESC, id DESC LIMIT 1',
      [petId]
    );
    return row ? mapRow(row) : null;
  },

  /** Second-latest entry — the analyzer's previousWeightKg signal. */
  async findPrevious(petId: string): Promise<WeightEntry | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<WeightRow>(
      `SELECT * FROM weight_entries WHERE pet_id = ?
       ORDER BY recorded_at DESC, id DESC LIMIT 1 OFFSET 1`,
      [petId]
    );
    return row ? mapRow(row) : null;
  },

  /**
   * Delete an entry. When the deleted entry was the latest one, pets.weight_kg
   * is re-synced to the new latest entry so the profile doesn't keep showing a
   * weight the user just removed as erroneous.
   */
  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<WeightRow>('SELECT * FROM weight_entries WHERE id = ?', [
      id,
    ]);
    if (!row) return;
    await db.runAsync('DELETE FROM weight_entries WHERE id = ?', [id]);
    const latest = await this.findLatest(row.pet_id);
    // Audit H2: NEVER null pets.weight_kg. A null weight silently drops the
    // dog per-kg insulin-overdose guard (getInsulinThresholds falls back to a
    // flat absoluteMaxDose=20 IU), so deleting the pet's only weight entry
    // would remove a medical safety limit. If nothing remains, keep the last
    // known weight on the pet; only re-sync DOWN to a real earlier entry.
    if (!latest) return;
    if (latest.recordedAt >= row.recorded_at) return; // deleted entry wasn't the latest
    await db.runAsync('UPDATE pets SET weight_kg = ?, updated_at = ? WHERE id = ?', [
      latest.weightKg,
      new Date().toISOString(),
      row.pet_id,
    ]);
  },
};

function mapRow(row: WeightRow): WeightEntry {
  return {
    id: row.id,
    petId: row.pet_id,
    weightKg: row.weight_kg,
    notes: row.notes ?? undefined,
    recordedAt: row.recorded_at,
    createdAt: row.created_at,
  };
}
