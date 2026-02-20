import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useHomeNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input, Card } from '@shared/components/ui';
import { feedingRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';

const FOOD_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'dry', label: 'Сухой корм' },
  { value: 'wet', label: 'Влажный корм' },
  { value: 'medical', label: 'Лечебный корм' },
  { value: 'other', label: 'Другое' },
];

export default function LogFeedingScreen() {
  const navigation = useHomeNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { activePet } = usePetStore();
  const queryClient = useQueryClient();

  const [foodType, setFoodType] = useState<string>('dry');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!activePet) {
      Alert.alert('Ошибка', 'Питомец не найден');
      return;
    }

    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await feedingRepository.create({
        petId: activePet.id,
        foodType: foodType || undefined,
        amountGrams: amount ? parseFloat(amount.replace(',', '.')) : undefined,
        notes: notes || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['feeding'] });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить данные');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ color: theme.colors.primary, fontSize: 16 }}>← {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Кормление
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Food Type */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Тип корма</Text>
          <View style={styles.chipGrid}>
            {FOOD_TYPE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.chip,
                  {
                    backgroundColor: foodType === opt.value ? theme.colors.primaryLight : theme.colors.surface,
                    borderColor: foodType === opt.value ? theme.colors.primary : 'transparent',
                    borderWidth: 2,
                    ...theme.shadows.sm,
                  },
                ]}
                onPress={() => setFoodType(opt.value)}
              >
                <Text style={[
                  styles.chipLabel,
                  { color: foodType === opt.value ? theme.colors.primary : theme.colors.text },
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <Card style={styles.amountCard}>
            <Text style={[styles.amountLabel, { color: theme.colors.textSecondary }]}>
              Количество (г)
            </Text>
            <Input
              value={amount}
              onChangeText={setAmount}
              placeholder="50"
              keyboardType="decimal-pad"
              style={{ fontSize: 28, textAlign: 'center', fontWeight: '700' }}
            />
            <Text style={[styles.optionalHint, { color: theme.colors.textTertiary }]}>
              Необязательно
            </Text>
          </Card>

          {/* Notes */}
          <Input
            label="Заметки"
            value={notes}
            onChangeText={setNotes}
            placeholder="Дополнительные заметки..."
            multiline
            numberOfLines={3}
            style={{ height: 80, paddingTop: 12 }}
          />

          <Button
            title={loading ? t('common.loading') : t('common.save')}
            onPress={handleSave}
            fullWidth
            size="lg"
            loading={loading}
            style={{ marginTop: 24 }}
          />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5,
  },
  backBtn: { width: 60 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 20, alignItems: 'center' },
  chipLabel: { fontSize: 14, fontWeight: '600' },
  amountCard: { alignItems: 'center', paddingVertical: 24 },
  amountLabel: { fontSize: 13, fontWeight: '500', marginBottom: 12 },
  optionalHint: { fontSize: 12, marginTop: 4 },
});
