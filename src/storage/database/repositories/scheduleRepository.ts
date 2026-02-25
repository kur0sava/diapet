import { getDatabase } from '../database';
import { Schedule } from '@storage/domain/types';
import uuid from 'react-native-uuid';

export type { Schedule };

export const scheduleRepository = {
  async addInjectionTime(petId: string, timeOfDay: string): Promise<Schedule> {
    const db = await getDatabase();
    const id = uuid.v4() as string;
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO injection_schedule (id, pet_id, time_of_day, days_of_week, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)',
      [id, petId, timeOfDay, '0,1,2,3,4,5,6', now]
    );
    return { id, petId, timeOfDay, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: now };
  },

  async addFeedingTime(petId: string, timeOfDay: string): Promise<Schedule> {
    const db = await getDatabase();
    const id = uuid.v4() as string;
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO feeding_schedule (id, pet_id, time_of_day, days_of_week, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)',
      [id, petId, timeOfDay, '0,1,2,3,4,5,6', now]
    );
    return { id, petId, timeOfDay, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: now };
  },

  async getInjectionTimes(petId: string): Promise<Schedule[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM injection_schedule WHERE pet_id = ? AND is_active = 1 ORDER BY time_of_day',
      [petId]
    );
    return rows.map(mapRow);
  },

  async getFeedingTimes(petId: string): Promise<Schedule[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM feeding_schedule WHERE pet_id = ? AND is_active = 1 ORDER BY time_of_day',
      [petId]
    );
    return rows.map(mapRow);
  },

  async deleteInjectionTime(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM injection_schedule WHERE id = ?', [id]);
  },

  async deleteFeedingTime(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM feeding_schedule WHERE id = ?', [id]);
  },
};

function mapRow(row: any): Schedule {
  return {
    id: row.id,
    petId: row.pet_id,
    timeOfDay: row.time_of_day,
    daysOfWeek: row.days_of_week ? row.days_of_week.split(',').map(Number) : [0,1,2,3,4,5,6],
    isActive: !!row.is_active,
    createdAt: row.created_at,
  };
}
