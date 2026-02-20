export {
  ExpenseCategory,
  Expense,
  CreateExpenseDTO,
  MonthlyStats,
} from '@storage/domain/types';

// Feature-specific UI constants stay here
import type { ExpenseCategory } from '@storage/domain/types';

export const EXPENSE_ICONS: Record<ExpenseCategory, string> = {
  insulin: '💉',
  testStrips: '🩸',
  vetVisit: '🏥',
  medication: '💊',
  food: '🥩',
  other: '📦',
};

export const EXPENSE_COLORS: Record<ExpenseCategory, string> = {
  insulin: '#4F8EF7',
  testStrips: '#FF3B30',
  vetVisit: '#34C759',
  medication: '#7C5CBF',
  food: '#FF9500',
  other: '#8E8E93',
};
