import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useHomeNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input, Card } from '@shared/components/ui';
import { glucoseRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { MealRelation, GlucoseUnit, getGlucoseLevel, getGlucoseColor } from '../types';
import { useQueryClient } from '@tanstack/react-query';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import * as Haptics from 'expo-haptics';

const MEAL_OPTIONS: { value: MealRelation; labelKey: string; icon: string }[] = [
  { value: 'fasting', labelKey: 'glucose.fasting', icon: '☀️' },
  { value: 'before_meal', labelKey: 'glucose.beforeMeal', icon: '🍽️' },
  { value: 'after_meal', labelKey: 'glucose.afterMeal', icon: '✅' },
  { value: 'unspecified', labelKey: 'glucose.unspecified', icon: '❓' },
];

export default function LogGlucoseScreen() {
  const navigation = useHomeNavigation();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const queryClient = useQueryClient();
  const editId = route.params?.editId;

  const savedUnit = (storage.getString(StorageKeys.GLUCOSE_UNIT) ?? 'mmol/L') as GlucoseUnit;

  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<GlucoseUnit>(savedUnit);
  const [mealRelation, setMealRelation] = useState<MealRelation>('unspecified');
  const [insulinDose, setInsulinDose] = useState('');
  const [insulinType, setInsulinType] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editId) {
      glucoseRepository.findById(editId).then(reading => {
        if (!reading) return;
        const displayValue = unit === 'mmol/L' ? reading.valueMmol.toFixed(1) : reading.valueMgdl.toString();
        setValue(displayValue);
        setMealRelation(reading.mealRelation);
        if (reading.insulinDose) setInsulinDose(reading.insulinDose.toString());
        if (reading.insulinType) setInsulinType(reading.insulinType);
        if (reading.notes) setNotes(reading.notes);
      });
    }
  }, [editId, unit]);

  const numValue = parseFloat(value.replace(',', '.'));
  const isValidValue = !isNaN(numValue) && numValue > 0 && numValue < (unit === 'mmol/L' ? 50 : 900);

  const glucosePreview = isValidValue
    ? {
        level: getGlucoseLevel(unit === 'mmol/L' ? numValue : numValue / 18.018),
        color: getGlucoseColor(unit === 'mmol/L' ? numValue : numValue / 18.018),
      }
    : null;

  const handleSave = async () => {
    if (!activePet) { Alert.alert('Ошибка', 'Питомец не найден'); return; }
    if (!isValidValue) { Alert.alert('Ошибка', 'Введите корректное значение глюкозы'); return; }

    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      if (editId) {
        await glucoseRepository.update(editId, {
          petId: activePet.id, value: numValue, unit, mealRelation,
          insulinDose: insulinDose ? parseFloat(insulinDose) : undefined,
          insulinType: insulinType || undefined,
          notes: notes || undefined,
        });
      } else {
        await glucoseRepository.create({
          petId: activePet.id, value: numValue, unit, mealRelation,
          insulinDose: insulinDose ? parseFloat(insulinDose) : undefined,
          insulinType: insulinType || undefined,
          notes: notes || undefined,
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['glucose'] });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить данные');
    } finally {
      setLoading(false);
    }
  };

  const levelLabels: Record<string, string> = {
    low: t('glucose.low'), normal: t('glucose.normal'),
    high: t('glucose.high'), very_high: t('glucose.veryHigh'),
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
            {editId ? t('glucose.editReading') : t('glucose.addReading')}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Main Input */}
          <Card style={styles.mainCard}>
            <Text style={[styles.mainLabel, { color: theme.colors.textSecondary }]}>
              {t('glucose.value')}
            </Text>

            {/* Unit toggle */}
            <View style={styles.unitRow}>
              {(['mmol/L', 'mg/dL'] as GlucoseUnit[]).map(u => (
                <TouchableOpacity
                  key={u}
                  style={[
                    styles.unitBtn,
                    { backgroundColor: unit === u ? theme.colors.primary : theme.colors.surfaceSecondary },
                  ]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={{ color: unit === u ? '#fff' : theme.colors.text, fontWeight: '600', fontSize: 13 }}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              value={value}
              onChangeText={setValue}
              placeholder={unit === 'mmol/L' ? '6.5' : '117'}
              keyboardType="decimal-pad"
              style={{ fontSize: 32, textAlign: 'center', fontWeight: '700' }}
            />

            {glucosePreview && (
              <View style={[styles.levelBadge, { backgroundColor: `${glucosePreview.color}20` }]}>
                <Text style={[styles.levelText, { color: glucosePreview.color }]}>
                  ● {levelLabels[glucosePreview.level]}
                </Text>
              </View>
            )}
          </Card>

          {/* Meal Relation */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('glucose.mealRelation')}</Text>
          <View style={styles.mealGrid}>
            {MEAL_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.mealBtn,
                  {
                    backgroundColor: mealRelation === opt.value ? theme.colors.primaryLight : theme.colors.surface,
                    borderColor: mealRelation === opt.value ? theme.colors.primary : 'transparent',
                    borderWidth: 2,
                    ...theme.shadows.sm,
                  },
                ]}
                onPress={() => setMealRelation(opt.value)}
              >
                <Text style={styles.mealIcon}>{opt.icon}</Text>
                <Text style={[styles.mealLabel, { color: mealRelation === opt.value ? theme.colors.primary : theme.colors.text }]}>
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Insulin */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('glucose.insulinOptional')}</Text>
          <View style={styles.row}>
            <Input
              label={t('glucose.insulinDose')}
              value={insulinDose}
              onChangeText={setInsulinDose}
              placeholder="2.0"
              keyboardType="decimal-pad"
              containerStyle={{ flex: 1 }}
            />
            <Input
              label={t('glucose.insulinType')}
              value={insulinType}
              onChangeText={setInsulinType}
              placeholder="Протафан"
              containerStyle={{ flex: 1 }}
            />
          </View>

          {/* Notes */}
          <Input
            label={t('glucose.notes')}
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
  mainCard: { alignItems: 'center', paddingVertical: 24 },
  mainLabel: { fontSize: 13, fontWeight: '500', marginBottom: 12 },
  unitRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  unitBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  levelBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12 },
  levelText: { fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  mealGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  mealBtn: { width: '47%', padding: 14, borderRadius: 14, alignItems: 'center', gap: 6 },
  mealIcon: { fontSize: 24 },
  mealLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  row: { flexDirection: 'row', gap: 12 },
});
