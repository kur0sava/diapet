import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useMoreNavigation } from '@navigation/hooks';
import type { MoreStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input } from '@shared/components/ui';
import { expenseRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { ExpenseCategory, EXPENSE_ICON_NAMES, EXPENSE_COLORS } from '../types';
import { useQueryClient } from '@tanstack/react-query';

const CATEGORIES: ExpenseCategory[] = ['insulin','testStrips','vetVisit','medication','food','other'];

export default function AddExpenseScreen() {
  const navigation = useMoreNavigation();
  const route = useRoute<RouteProp<MoreStackParamList, 'AddExpense'>>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const queryClient = useQueryClient();
  const editId = route.params?.editId;

  const [category, setCategory] = useState<ExpenseCategory>('insulin');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [originalDate, setOriginalDate] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const savingRef = useRef(false);

  const categoryLabels: Record<ExpenseCategory, string> = {
    insulin: t('expenses.insulin'), testStrips: t('expenses.testStrips'),
    vetVisit: t('expenses.vetVisit'), medication: t('expenses.medication'),
    food: t('expenses.food'), other: t('expenses.other'),
  };

  useEffect(() => {
    let cancelled = false;
    if (editId) {
      expenseRepository.findById(editId).then(exp => {
        if (cancelled || !exp) return;
        setCategory(exp.category as ExpenseCategory);
        setAmount(exp.amount.toString());
        if (exp.description) setDescription(exp.description);
        if (exp.date) setOriginalDate(exp.date);
      });
    }
    return () => { cancelled = true; };
  }, [editId]);

  const handleSave = async () => {
    if (savingRef.current || !activePet) return;
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (!amount || isNaN(numAmount) || numAmount <= 0) { Alert.alert(t('common.error'), t('expenses.amountError')); return; }
    savingRef.current = true;
    setLoading(true);
    try {
      if (editId) {
        await expenseRepository.update(editId, { category, amount: numAmount, description: description || undefined, date: originalDate });
      } else {
        await expenseRepository.create({ petId: activePet.id, category, amount: numAmount, description: description || undefined, currency: 'RUB' });
      }
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      navigation.goBack();
    } catch { Alert.alert(t('common.error'), t('expenses.saveError')); }
    finally { savingRef.current = false; setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary }}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>{editId ? t('expenses.editExpense') : t('expenses.addExpense')}</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>{t('expenses.category')}</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat} style={[styles.categoryBtn, { backgroundColor: category === cat ? `${EXPENSE_COLORS[cat]}20` : theme.colors.surface, borderColor: category === cat ? EXPENSE_COLORS[cat] : 'transparent', borderWidth: 2, ...theme.shadows.sm }]} onPress={() => setCategory(cat)}>
                <View style={[styles.categoryIconCircle, { backgroundColor: `${EXPENSE_COLORS[cat]}15` }]}>
                  <Ionicons name={EXPENSE_ICON_NAMES[cat]} size={24} color={EXPENSE_COLORS[cat]} />
                </View>
                <Text style={[styles.categoryLabel, { color: category === cat ? EXPENSE_COLORS[cat] : theme.colors.text, fontFamily: theme.fonts.semibold }]}>{categoryLabels[cat]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Input label={`${t('expenses.amount')} (₽)`} value={amount} onChangeText={setAmount} placeholder="500" keyboardType="decimal-pad" style={{ fontSize: 24, fontWeight: '700', textAlign: 'center' }} />
          <Input label={t('expenses.notes')} value={description} onChangeText={setDescription} placeholder={t('expenses.notesPlaceholder')} multiline numberOfLines={2} />
          <Button title={t('common.save')} onPress={handleSave} fullWidth size="lg" loading={loading} style={{ marginTop: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5 },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  title: { fontSize: 17 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryBtn: { width: '30%', padding: 14, borderRadius: 14, alignItems: 'center', gap: 6 },
  categoryIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { fontSize: 12, textAlign: 'center' },
});
