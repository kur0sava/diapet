import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@shared/components/ui/Icon';
import { useMoreNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@shared/utils/queryKeys';
import { expenseRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { Expense, EXPENSE_ICON_NAMES, EXPENSE_COLORS, ExpenseCategory } from '../types';
import { Card, EmptyState } from '@shared/components/ui';
import { getStorage, StorageKeys } from '@storage/mmkv/storage';

type ViewMode = 'month' | 'year';

export default function ExpensesScreen() {
  const navigation = useMoreNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const queryClient = useQueryClient();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showBudgetInput, setShowBudgetInput] = useState(false);
  const [budgetText, setBudgetText] = useState('');

  const storage = getStorage();
  const savedBudget = storage.getNumber(StorageKeys.EXPENSE_BUDGET_MONTHLY) ?? 0;

  // Monthly queries
  const { data: monthExpenses = [] } = useQuery({
    queryKey: queryKeys.expenses.list(activePet?.id ?? '', year, month),
    queryFn: () =>
      activePet ? expenseRepository.findByMonth(activePet.id, year, month) : Promise.resolve([]),
    enabled: !!activePet?.id && viewMode === 'month',
  });

  const { data: monthTotal = 0 } = useQuery({
    queryKey: queryKeys.expenses.total(activePet?.id ?? '', year, month),
    queryFn: () =>
      activePet ? expenseRepository.getMonthlyTotal(activePet.id, year, month) : Promise.resolve(0),
    enabled: !!activePet?.id && viewMode === 'month',
  });

  // Yearly queries
  const { data: yearExpenses = [] } = useQuery({
    queryKey: queryKeys.expenses.listYear(activePet?.id ?? '', year),
    queryFn: () =>
      activePet ? expenseRepository.findByYear(activePet.id, year) : Promise.resolve([]),
    enabled: !!activePet?.id && viewMode === 'year',
  });

  const { data: yearTotal = 0 } = useQuery({
    queryKey: queryKeys.expenses.totalYear(activePet?.id ?? '', year),
    queryFn: () =>
      activePet ? expenseRepository.getYearlyTotal(activePet.id, year) : Promise.resolve(0),
    enabled: !!activePet?.id && viewMode === 'year',
  });

  const expenses = viewMode === 'month' ? monthExpenses : yearExpenses;
  const total = viewMode === 'month' ? monthTotal : yearTotal;

  const byCategory = React.useMemo(
    () =>
      expenses.reduce<Record<ExpenseCategory, number>>(
        (acc, exp) => {
          const cat = exp.category as ExpenseCategory;
          acc[cat] = (acc[cat] ?? 0) + exp.amount;
          return acc;
        },
        {} as Record<ExpenseCategory, number>
      ),
    [expenses]
  );

  // Monthly breakdown for yearly view
  const byMonth = React.useMemo(() => {
    if (viewMode !== 'year') return [];
    const map = new Map<number, number>();
    for (const exp of yearExpenses) {
      const m = parseInt(exp.date.split('-')[1], 10);
      map.set(m, (map.get(m) ?? 0) + exp.amount);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([m, amount]) => ({ month: m, amount }));
  }, [viewMode, yearExpenses]);

  const monthKeys = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ];

  const categoryLabels: Record<ExpenseCategory, string> = {
    insulin: t('expenses.insulin'),
    testStrips: t('expenses.testStrips'),
    vetVisit: t('expenses.vetVisit'),
    medication: t('expenses.medication'),
    food: t('expenses.food'),
    other: t('expenses.other'),
  };

  const handleDelete = (id: string) => {
    const item = expenses.find(e => e.id === id);
    const info = item
      ? `${item.date} — ${categoryLabels[item.category as ExpenseCategory]}, ${item.amount.toLocaleString()} ${t('expenses.currency')}`
      : '';
    Alert.alert(t('expenses.deleteConfirm'), info || undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await expenseRepository.delete(id);
            await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
          } catch {
            /* swallow — row may already be deleted */
          }
        },
      },
    ]);
  };

  const handleSaveBudget = () => {
    const num = parseFloat(budgetText);
    if (!budgetText.trim() || isNaN(num) || num < 0) {
      storage.set(StorageKeys.EXPENSE_BUDGET_MONTHLY, 0);
    } else {
      storage.set(StorageKeys.EXPENSE_BUDGET_MONTHLY, num);
    }
    setShowBudgetInput(false);
    setBudgetText('');
  };

  const navigatePrev = () => {
    if (viewMode === 'year') {
      setYear(y => y - 1);
    } else {
      if (month === 1) {
        setMonth(12);
        setYear(y => y - 1);
      } else setMonth(m => m - 1);
    }
  };

  const navigateNext = () => {
    if (viewMode === 'year') {
      setYear(y => y + 1);
    } else {
      if (month === 12) {
        setMonth(1);
        setYear(y => y + 1);
      } else setMonth(m => m + 1);
    }
  };

  const budgetRatio =
    savedBudget > 0 && viewMode === 'month' ? Math.min(monthTotal / savedBudget, 1) : 0;
  const overBudget = savedBudget > 0 && viewMode === 'month' && monthTotal > savedBudget;

  const renderExpense = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('AddExpense', { editId: item.id })}
      onLongPress={() => handleDelete(item.id)}
      activeOpacity={0.8}
    >
      <Card style={styles.expenseCard}>
        <View
          style={[
            styles.expenseIcon,
            { backgroundColor: `${EXPENSE_COLORS[item.category as ExpenseCategory]}20` },
          ]}
        >
          <Icon
            name={EXPENSE_ICON_NAMES[item.category as ExpenseCategory]}
            size={22}
            color={EXPENSE_COLORS[item.category as ExpenseCategory]}
          />
        </View>
        <View style={styles.expenseInfo}>
          <Text
            style={[
              styles.expenseCategory,
              { color: theme.colors.text, fontFamily: theme.fonts.semibold },
            ]}
          >
            {categoryLabels[item.category as ExpenseCategory]}
          </Text>
          {item.description && (
            <Text
              style={[styles.expenseDesc, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.description}
            </Text>
          )}
          <Text style={[styles.expenseDate, { color: theme.colors.textTertiary }]}>
            {item.date}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8, maxWidth: '40%', flexShrink: 0 }}>
          <Text
            style={[
              styles.expenseAmount,
              { color: theme.colors.text, fontFamily: theme.fonts.bold },
            ]}
            numberOfLines={1}
          >
            {item.amount.toLocaleString()} {t('expenses.currency')}
          </Text>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon name="trash-outline" size={18} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const headerTitle =
    viewMode === 'month' ? `${t(`expenses.months.${monthKeys[month - 1]}`)} ${year}` : `${year}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* View mode toggle */}
      <View style={[styles.toggleRow, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            viewMode === 'month' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setViewMode('month')}
        >
          <Text
            style={[
              styles.toggleText,
              {
                color: viewMode === 'month' ? '#fff' : theme.colors.textSecondary,
                fontFamily: theme.fonts.semibold,
              },
            ]}
          >
            {t('expenses.monthly')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            viewMode === 'year' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setViewMode('year')}
        >
          <Text
            style={[
              styles.toggleText,
              {
                color: viewMode === 'year' ? '#fff' : theme.colors.textSecondary,
                fontFamily: theme.fonts.semibold,
              },
            ]}
          >
            {t('expenses.yearly')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Period navigation */}
      <View
        style={[
          styles.monthRow,
          { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border },
        ]}
      >
        <TouchableOpacity onPress={navigatePrev} style={styles.monthBtn}>
          <Icon name="chevron-back" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text
          style={[styles.monthTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}
        >
          {headerTitle}
        </Text>
        <TouchableOpacity onPress={navigateNext} style={styles.monthBtn}>
          <Icon name="chevron-forward" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={item => item.id}
        renderItem={renderExpense}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {/* Total card */}
            <Card
              style={[styles.totalCard, { backgroundColor: theme.colors.primary }]}
              shadow={false}
            >
              <Text style={styles.totalLabel}>
                {viewMode === 'month' ? t('expenses.totalForMonth') : t('expenses.totalForYear')}
              </Text>
              <Text style={styles.totalAmount}>
                {total.toLocaleString()} {t('expenses.currency')}
              </Text>
            </Card>

            {/* Budget bar (month view only) */}
            {viewMode === 'month' && (
              <TouchableOpacity
                onPress={() => {
                  setBudgetText(savedBudget > 0 ? String(savedBudget) : '');
                  setShowBudgetInput(true);
                }}
                activeOpacity={0.8}
              >
                <Card style={styles.budgetCard}>
                  <View style={styles.budgetHeader}>
                    <Text
                      style={[
                        styles.budgetTitle,
                        { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                      ]}
                    >
                      {t('expenses.budget')}
                    </Text>
                    {savedBudget > 0 ? (
                      <Text
                        style={[
                          styles.budgetValues,
                          { color: overBudget ? theme.colors.danger : theme.colors.textSecondary },
                        ]}
                      >
                        {monthTotal.toLocaleString()} / {savedBudget.toLocaleString()}{' '}
                        {t('expenses.currency')}
                      </Text>
                    ) : (
                      <Text style={[styles.budgetValues, { color: theme.colors.textTertiary }]}>
                        {t('expenses.setBudget')}
                      </Text>
                    )}
                  </View>
                  {savedBudget > 0 && (
                    <View
                      style={[
                        styles.budgetBarBg,
                        { backgroundColor: theme.colors.surfaceSecondary },
                      ]}
                    >
                      <View
                        style={[
                          styles.budgetBarFill,
                          {
                            width: `${budgetRatio * 100}%`,
                            backgroundColor: overBudget
                              ? theme.colors.danger
                              : theme.colors.primary,
                          },
                        ]}
                      />
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            )}

            {/* Budget input modal */}
            {showBudgetInput && (
              <Card style={styles.budgetInputCard}>
                <Text
                  style={[
                    styles.budgetInputLabel,
                    { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                  ]}
                >
                  {t('expenses.monthlyBudgetLimit')}
                </Text>
                <View style={styles.budgetInputRow}>
                  <TextInput
                    style={[
                      styles.budgetInput,
                      {
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surfaceSecondary,
                      },
                    ]}
                    value={budgetText}
                    onChangeText={setBudgetText}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={[styles.budgetSaveBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={handleSaveBudget}
                  >
                    <Icon name="checkmark" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.budgetCancelBtn,
                      { backgroundColor: theme.colors.surfaceSecondary },
                    ]}
                    onPress={() => setShowBudgetInput(false)}
                  >
                    <Icon name="close" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </Card>
            )}

            {/* Monthly breakdown (year view) */}
            {viewMode === 'year' && byMonth.length > 0 && (
              <View style={styles.monthBreakdown}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.text, fontFamily: theme.fonts.bold },
                  ]}
                >
                  {t('expenses.byMonth')}
                </Text>
                {byMonth.map(({ month: m, amount }) => {
                  const maxAmount = Math.max(...byMonth.map(b => b.amount));
                  const barWidth = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                  return (
                    <View key={m} style={styles.monthBarRow}>
                      <Text
                        style={[
                          styles.monthBarLabel,
                          { color: theme.colors.textSecondary, fontFamily: theme.fonts.medium },
                        ]}
                      >
                        {t(`expenses.months.${monthKeys[m - 1]}`)}
                      </Text>
                      <View
                        style={[
                          styles.monthBarBg,
                          { backgroundColor: theme.colors.surfaceSecondary },
                        ]}
                      >
                        <View
                          style={[
                            styles.monthBarFill,
                            { width: `${barWidth}%`, backgroundColor: theme.colors.primary },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.monthBarAmount,
                          { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                        ]}
                        numberOfLines={1}
                      >
                        {amount.toLocaleString()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Category stats */}
            {Object.entries(byCategory).length > 0 && (
              <View style={styles.categoryStats}>
                {Object.entries(byCategory).map(([cat, amount]) => (
                  <View
                    key={cat}
                    style={[
                      styles.categoryStat,
                      { backgroundColor: theme.colors.surface, ...theme.shadows.sm },
                    ]}
                  >
                    <Icon
                      name={EXPENSE_ICON_NAMES[cat as ExpenseCategory]}
                      size={20}
                      color={EXPENSE_COLORS[cat as ExpenseCategory]}
                    />
                    <Text
                      style={[styles.catLabel, { color: theme.colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {categoryLabels[cat as ExpenseCategory]}
                    </Text>
                    <Text
                      style={[
                        styles.catAmount,
                        { color: theme.colors.text, fontFamily: theme.fonts.bold },
                      ]}
                      numberOfLines={1}
                    >
                      {amount.toLocaleString()} {t('expenses.currency')}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            {expenses.length > 0 && (
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.text, fontFamily: theme.fonts.bold },
                ]}
              >
                {t('expenses.history')}
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          <EmptyState
            iconName="wallet-outline"
            iconColor={theme.colors.primary}
            title={t('expenses.title')}
            subtitle={
              viewMode === 'month' ? t('expenses.noExpenses') : t('expenses.noExpensesYear')
            }
            actionLabel={t('expenses.addExpense')}
            onAction={() => navigation.navigate('AddExpense', {})}
          />
        }
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddExpense', {})}
        accessibilityLabel={t('expenses.addExpense')}
        accessibilityRole="button"
      >
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toggleRow: { flexDirection: 'row', padding: 6, gap: 4, justifyContent: 'center' },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  toggleText: { fontSize: 14 },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  monthBtn: { padding: 12, paddingHorizontal: 20 },
  monthTitle: { fontSize: 17 },
  list: { padding: 16, gap: 10, paddingBottom: 100 },
  totalCard: { padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 8 },
  totalLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500' },
  totalAmount: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', marginTop: 4 },
  budgetCard: { marginBottom: 8, padding: 14, gap: 10 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetTitle: { fontSize: 14 },
  budgetValues: { fontSize: 13 },
  budgetBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  budgetBarFill: { height: '100%', borderRadius: 4 },
  budgetInputCard: { marginBottom: 8, padding: 14, gap: 10 },
  budgetInputLabel: { fontSize: 14 },
  budgetInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  budgetInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  budgetSaveBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetCancelBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthBreakdown: { marginBottom: 16, gap: 6 },
  monthBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthBarLabel: { width: 36, fontSize: 12, textAlign: 'right' },
  monthBarBg: { flex: 1, height: 16, borderRadius: 4, overflow: 'hidden' },
  monthBarFill: { height: '100%', borderRadius: 4 },
  monthBarAmount: { width: 70, fontSize: 12, textAlign: 'right' },
  categoryStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoryStat: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  catLabel: { fontSize: 12, flex: 1 },
  catAmount: { fontSize: 13, flexShrink: 1 },
  sectionTitle: { fontSize: 16, marginBottom: 4 },
  expenseCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseInfo: { flex: 1, gap: 2 },
  expenseCategory: { fontSize: 15 },
  expenseDesc: { fontSize: 13 },
  expenseDate: { fontSize: 12 },
  expenseAmount: { fontSize: 16 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});
