import { getDatabase } from '../database';
import { Pet, CreatePetDTO, UpdatePetDTO } from '@storage/domain/types';
import uuid from 'react-native-uuid';
import { getStorage } from '@storage/mmkv/storage';

interface PetRow {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  gender: string;
  birth_year: number | null;
  weight_kg: number | null;
  diagnosis_date: string | null;
  diabetes_type: string;
  insulin_type: string | null;
  photo_uri: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export const petRepository = {
  async create(dto: CreatePetDTO): Promise<Pet> {
    const db = await getDatabase();
    const id = uuid.v4() as string;
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO pets (id, name, species, breed, gender, birth_year, weight_kg, diagnosis_date, diabetes_type, insulin_type, photo_uri, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        id,
        dto.name,
        dto.species ?? 'cat',
        dto.breed ?? null,
        dto.gender,
        dto.birthYear ?? null,
        dto.weightKg ?? null,
        dto.diagnosisDate ?? null,
        dto.diabetesType ?? 'unknown',
        dto.insulinType ?? null,
        dto.photoUri ?? null,
        now,
        now,
      ]
    );
    // v2.6: weight history baseline — a pet created with a weight gets its
    // first history entry here, covering AddPet AND onboarding call sites.
    if (dto.weightKg != null && dto.weightKg > 0) {
      await db.runAsync(
        `INSERT INTO weight_entries (id, pet_id, weight_kg, recorded_at, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [uuid.v4() as string, id, dto.weightKg, now, now]
      );
    }
    const result = await this.findById(id);
    if (!result) throw new Error(`Failed to read back pet ${id} after insert`);
    return result;
  },

  async findById(id: string): Promise<Pet | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<PetRow>('SELECT * FROM pets WHERE id = ?', [id]);
    return row ? mapRowToPet(row) : null;
  },

  async findAll(): Promise<Pet[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<PetRow>('SELECT * FROM pets ORDER BY created_at ASC');
    return rows.map(mapRowToPet);
  },

  async findActive(): Promise<Pet[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<PetRow>(
      'SELECT * FROM pets WHERE is_active = 1 ORDER BY created_at ASC'
    );
    return rows.map(mapRowToPet);
  },

  async update(id: string, dto: UpdatePetDTO): Promise<Pet | null> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    // v2.6: weight history — an edited weight (EditPet) becomes a history
    // entry, but only when it actually changed; photo/name edits and re-saves
    // of the same weight must not spam the chart. The explicit "record new
    // weight" flow goes through weightRepository.logWeight instead.
    if ('weightKg' in dto && dto.weightKg != null && dto.weightKg > 0) {
      const current = await db.getFirstAsync<{ weight_kg: number | null }>(
        'SELECT weight_kg FROM pets WHERE id = ?',
        [id]
      );
      if (current && current.weight_kg !== dto.weightKg) {
        await db.runAsync(
          `INSERT INTO weight_entries (id, pet_id, weight_kg, recorded_at, created_at)
           VALUES (?, ?, ?, ?, ?)`,
          [uuid.v4() as string, id, dto.weightKg, now, now]
        );
      }
    }
    const sets: string[] = [];
    const params: (string | number | null)[] = [];
    const fields: Array<[string, keyof UpdatePetDTO]> = [
      ['name', 'name'],
      ['species', 'species'],
      ['breed', 'breed'],
      ['gender', 'gender'],
      ['birth_year', 'birthYear'],
      ['weight_kg', 'weightKg'],
      ['diagnosis_date', 'diagnosisDate'],
      ['diabetes_type', 'diabetesType'],
      ['insulin_type', 'insulinType'],
      ['photo_uri', 'photoUri'],
    ];
    for (const [col, key] of fields) {
      if (key in dto) {
        sets.push(`${col}=?`);
        params.push(dto[key] ?? null);
      }
    }
    if (sets.length > 0) {
      sets.push('updated_at=?');
      params.push(now, id);
      await db.runAsync(`UPDATE pets SET ${sets.join(', ')} WHERE id=?`, params);
    }
    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM pets WHERE id = ?', [id]);
    // BL-01: Clean up MMKV data tied to this pet
    try {
      const mmkv = getStorage();
      const petPrefixes = [
        `predictionCache_${id}`,
        `predictionLastRequest_${id}`,
        `remissionCache_${id}`,
        `remissionLastRequest_${id}`,
        `aiChatHistory_${id}`,
        // v2.5.1: per-pet vet contact (commit fed6ee8) — must clean up here
        // too, otherwise MMKV leaks one entry per deleted pet forever and
        // EmergencyScreen could surface a stale contact if a future UUID
        // ever collides.
        `vetName_${id}`,
        `vetPhone_${id}`,
      ];
      for (const key of petPrefixes) {
        mmkv.delete(key);
      }
    } catch {
      /* MMKV cleanup is best-effort */
    }
  },
};

function mapRowToPet(row: PetRow): Pet {
  return {
    id: row.id,
    name: row.name,
    species: row.species as Pet['species'],
    breed: row.breed ?? undefined,
    gender: row.gender as Pet['gender'],
    birthYear: row.birth_year ?? undefined,
    weightKg: row.weight_kg ?? undefined,
    diagnosisDate: row.diagnosis_date ?? undefined,
    diabetesType: row.diabetes_type as Pet['diabetesType'],
    insulinType: row.insulin_type ?? undefined,
    photoUri: row.photo_uri ?? undefined,
    isActive: !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
