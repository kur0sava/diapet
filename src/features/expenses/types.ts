export {
  ExpenseCategory,
  Expense,
  CreateExpenseDTO,
  MonthlyStats,
} from '@storage/domain/types';

// Feature-specific UI constants stay here
import type { ExpenseCategory } from '@storage/domain/types';
import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type IonIconName = ComponentProps<typeof Ionicons>['name'];

export const EXPENSE_ICON_NAMES: Record<ExpenseCategory, IonIconName> = {
  insulin: 'fitness-outline',
  testStrips: 'water-outline',
  vetVisit: 'medkit-outline',
  medication: 'medical-outline',
  food: 'fast-food-outline',
  other: 'cube-outline',
};

export const EXPENSE_COLORS: Record<ExpenseCategory, string> = {
  insulin: '#4F8EF7',
  testStrips: '#FF3B30',
  vetVisit: '#34C759',
  medication: '#7C5CBF',
  food: '#FF9500',
  other: '#8E8E93',
};
