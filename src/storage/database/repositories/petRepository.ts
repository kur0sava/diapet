import { getDatabase } from '../database';
import { Pet, CreatePetDTO, UpdatePetDTO } from '@storage/domain/types';
import uuid from 'react-native-uuid';

export const petRepository = {
  async create(dto: CreatePetDTO): Promise<Pet> {
    const db = await getDatabase();
    const id = uuid.v4() as string;
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO pets (id, name, species, breed, gender, birth_year, weight_kg, diagnosis_date, diabetes_type, insulin_type, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [id, dto.name, dto.species ?? 'cat', dto.breed ?? null, dto.gender, dto.birthYear ?? null,
       dto.weightKg ?? null, dto.diagnosisDate ?? null, dto.diabetesType ?? 'unknown',
       dto.insulinType ?? null, now, now]
    );
    return this.findById(id) as Promise<Pet>;
  },

  async findById(id: string): Promise<Pet | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>('SELECT * FROM pets WHERE id = ?', [id]);
    return row ? mapRowToPet(row) : null;
  },

  async findAll(): Promise<Pet[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>('SELECT * FROM pets ORDER BY created_at ASC');
    return rows.map(mapRowToPet);
  },

  async findActive(): Promise<Pet[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>('SELECT * FROM pets WHERE is_active = 1 ORDER BY created_at ASC');
    return rows.map(mapRowToPet);
  },

  async update(id: string, dto: UpdatePetDTO): Promise<Pet | null> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE pets SET name=COALESCE(?,name), breed=COALESCE(?,breed), gender=COALESCE(?,gender),
       birth_year=COALESCE(?,birth_year), weight_kg=COALESCE(?,weight_kg),
       diagnosis_date=COALESCE(?,diagnosis_date), diabetes_type=COALESCE(?,diabetes_type),
       insulin_type=COALESCE(?,insulin_type), photo_uri=COALESCE(?,photo_uri), updated_at=?
       WHERE id=?`,
      [dto.name ?? null, dto.breed ?? null, dto.gender ?? null, dto.birthYear ?? null,
       dto.weightKg ?? null, dto.diagnosisDate ?? null, dto.diabetesType ?? null,
       dto.insulinType ?? null, dto.photoUri ?? null, now, id]
    );
    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM pets WHERE id = ?', [id]);
  },
};

function mapRowToPet(row: any): Pet {
  return {
    id: row.id,
    name: row.name,
    species: row.species,
    breed: row.breed,
    gender: row.gender,
    birthYear: row.birth_year,
    weightKg: row.weight_kg,
    diagnosisDate: row.diagnosis_date,
    diabetesType: row.diabetes_type,
    insulinType: row.insulin_type,
    photoUri: row.photo_uri,
    isActive: !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
