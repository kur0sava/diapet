import { getDatabase } from '../database';
import { Expense, CreateExpenseDTO } from '@storage/domain/types';
import { lastDayOfMonth, format } from 'date-fns';
import uuid from 'react-native-uuid';

export const expenseRepository = {
  async create(dto: CreateExpenseDTO): Promise<Expense> {
    const db = await getDatabase();
    const id = uuid.v4() as string;
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO expenses (id, pet_id, category, amount, currency, description, date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, dto.petId, dto.category, dto.amount, dto.currency ?? 'RUB',
       dto.description ?? null, dto.date ?? now.split('T')[0], now, now]
    );
    return this.findById(id) as Promise<Expense>;
  },

  async findById(id: string): Promise<Expense | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>('SELECT * FROM expenses WHERE id = ?', [id]);
    return row ? mapRowToExpense(row) : null;
  },

  async findByPetId(petId: string): Promise<Expense[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM expenses WHERE pet_id = ? ORDER BY date DESC',
      [petId]
    );
    return rows.map(mapRowToExpense);
  },

  async findByMonth(petId: string, year: number, month: number): Promise<Expense[]> {
    const db = await getDatabase();
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = format(lastDayOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM expenses WHERE pet_id = ? AND date >= ? AND date <= ? ORDER BY date DESC',
      [petId, start, end]
    );
    return rows.map(mapRowToExpense);
  },

  async getMonthlyTotal(petId: string, year: number, month: number): Promise<number> {
    const db = await getDatabase();
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = format(lastDayOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
    const row = await db.getFirstAsync<any>(
      'SELECT SUM(amount) as total FROM expenses WHERE pet_id = ? AND date >= ? AND date <= ?',
      [petId, start, end]
    );
    return row?.total ?? 0;
  },

  async update(id: string, dto: Partial<CreateExpenseDTO>): Promise<Expense | null> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE expenses SET category=COALESCE(?,category), amount=COALESCE(?,amount),
       description=COALESCE(?,description), date=COALESCE(?,date), updated_at=? WHERE id=?`,
      [dto.category ?? null, dto.amount ?? null, dto.description ?? null, dto.date ?? null, now, id]
    );
    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
  },
};

function mapRowToExpense(row: any): Expense {
  return {
    id: row.id,
    petId: row.pet_id,
    category: row.category,
    amount: row.amount,
    currency: row.currency,
    description: row.description,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
