import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useMoreNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { expenseRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { Expense, EXPENSE_ICONS, EXPENSE_COLORS, ExpenseCategory } from '../types';
import { Card, EmptyState } from '@shared/components/ui';

export default function ExpensesScreen() {
  const navigation = useMoreNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const queryClient = useQueryClient();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', activePet?.id, year, month],
    queryFn: () => activePet ? expenseRepository.findByMonth(activePet.id, year, month) : Promise.resolve([]),
    enabled: !!activePet?.id,
  });

  const { data: total = 0 } = useQuery({
    queryKey: ['expenses', 'total', activePet?.id, year, month],
    queryFn: () => activePet ? expenseRepository.getMonthlyTotal(activePet.id, year, month) : Promise.resolve(0),
    enabled: !!activePet?.id,
  });

  const byCategory = React.useMemo(
    () => expenses.reduce<Record<ExpenseCategory, number>>((acc, exp) => {
      const cat = exp.category as ExpenseCategory;
      acc[cat] = (acc[cat] ?? 0) + exp.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>),
    [expenses]
  );

  const monthKeys = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

  const handleDelete = (id: string) => {
    Alert.alert(t('expenses.deleteConfirm'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => {
        await expenseRepository.delete(id);
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
      }},
    ]);
  };

  const categoryLabels: Record<ExpenseCategory, string> = {
    insulin: t('expenses.insulin'), testStrips: t('expenses.testStrips'),
    vetVisit: t('expenses.vetVisit'), medication: t('expenses.medication'),
    food: t('expenses.food'), other: t('expenses.other'),
  };

  const renderExpense = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('AddExpense', { editId: item.id })}
      onLongPress={() => handleDelete(item.id)}
      activeOpacity={0.8}
    >
      <Card style={styles.expenseCard}>
        <View style={[styles.expenseIcon, { backgroundColor: `${EXPENSE_COLORS[item.category as ExpenseCategory]}20` }]}>
          <Text style={styles.expenseEmoji}>{EXPENSE_ICONS[item.category as ExpenseCategory]}</Text>
        </View>
        <View style={styles.expenseInfo}>
          <Text style={[styles.expenseCategory, { color: theme.colors.text }]}>{categoryLabels[item.category as ExpenseCategory]}</Text>
          {item.description && <Text style={[styles.expenseDesc, { color: theme.colors.textSecondary }]} numberOfLines={1}>{item.description}</Text>}
          <Text style={[styles.expenseDate, { color: theme.colors.textTertiary }]}>{item.date}</Text>
        </View>
        <Text style={[styles.expenseAmount, { color: theme.colors.text }]}>{item.amount.toLocaleString('ru-RU')} ₽</Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.monthRow, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => { if (month === 1) { setMonth(12); setYear(y => y-1); } else setMonth(m => m-1); }} style={styles.monthBtn}>
          <Text style={{ color: theme.colors.primary, fontSize: 20 }}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: theme.colors.text }]}>{t(`expenses.months.${monthKeys[month-1]}`)} {year}</Text>
        <TouchableOpacity onPress={() => { if (month === 12) { setMonth(1); setYear(y => y+1); } else setMonth(m => m+1); }} style={styles.monthBtn}>
          <Text style={{ color: theme.colors.primary, fontSize: 20 }}>›</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={item => item.id}
        renderItem={renderExpense}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Card style={[styles.totalCard, { backgroundColor: theme.colors.primary }]} shadow={false}>
              <Text style={styles.totalLabel}>{t('expenses.totalForMonth')}</Text>
              <Text style={styles.totalAmount}>{total.toLocaleString('ru-RU')} ₽</Text>
            </Card>
            {Object.entries(byCategory).length > 0 && (
              <View style={styles.categoryStats}>
                {Object.entries(byCategory).map(([cat, amount]) => (
                  <View key={cat} style={[styles.categoryStat, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
                    <Text style={styles.catEmoji}>{EXPENSE_ICONS[cat as ExpenseCategory]}</Text>
                    <Text style={[styles.catLabel, { color: theme.colors.textSecondary }]} numberOfLines={1}>{categoryLabels[cat as ExpenseCategory]}</Text>
                    <Text style={[styles.catAmount, { color: theme.colors.text }]}>{amount.toLocaleString('ru-RU')} ₽</Text>
                  </View>
                ))}
              </View>
            )}
            {expenses.length > 0 && <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('expenses.history')}</Text>}
          </>
        }
        ListEmptyComponent={
          <EmptyState icon="💰" title={t('expenses.title')} subtitle={t('expenses.noExpenses')}
            actionLabel={t('expenses.addExpense')} onAction={() => navigation.navigate('AddExpense', {})} />
        }
      />
      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.colors.primary }]} onPress={() => navigation.navigate('AddExpense', {})}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5 },
  monthBtn: { padding: 12, paddingHorizontal: 20 },
  monthTitle: { fontSize: 17, fontWeight: '700' },
  list: { padding: 16, gap: 10, paddingBottom: 100 },
  totalCard: { padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 8 },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' },
  totalAmount: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 4 },
  categoryStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoryStat: { width: '47%', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, gap: 8 },
  catEmoji: { fontSize: 20 },
  catLabel: { fontSize: 12, flex: 1 },
  catAmount: { fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  expenseCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expenseIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  expenseEmoji: { fontSize: 22 },
  expenseInfo: { flex: 1, gap: 2 },
  expenseCategory: { fontSize: 15, fontWeight: '600' },
  expenseDesc: { fontSize: 13 },
  expenseDate: { fontSize: 12 },
  expenseAmount: { fontSize: 16, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabIcon: { color: '#fff', fontSize: 28, fontWeight: '300' },
});
