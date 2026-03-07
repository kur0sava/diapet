import { getDatabase } from '../database';
import { Pet, CreatePetDTO, UpdatePetDTO } from '@storage/domain/types';
import uuid from 'react-native-uuid';

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
      [id, dto.name, dto.species ?? 'cat', dto.breed ?? null, dto.gender, dto.birthYear ?? null,
       dto.weightKg ?? null, dto.diagnosisDate ?? null, dto.diabetesType ?? 'unknown',
       dto.insulinType ?? null, dto.photoUri ?? null, now, now]
    );
    return this.findById(id) as Promise<Pet>;
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
    const rows = await db.getAllAsync<PetRow>('SELECT * FROM pets WHERE is_active = 1 ORDER BY created_at ASC');
    return rows.map(mapRowToPet);
  },

  async update(id: string, dto: UpdatePetDTO): Promise<Pet | null> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const sets: string[] = [];
    const params: (string | number | null)[] = [];
    const fields: Array<[string, keyof UpdatePetDTO]> = [
      ['name', 'name'], ['breed', 'breed'], ['gender', 'gender'],
      ['birth_year', 'birthYear'], ['weight_kg', 'weightKg'],
      ['diagnosis_date', 'diagnosisDate'], ['diabetes_type', 'diabetesType'],
      ['insulin_type', 'insulinType'], ['photo_uri', 'photoUri'],
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
