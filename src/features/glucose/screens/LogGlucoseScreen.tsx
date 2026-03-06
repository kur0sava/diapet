import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { HomeStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input, Card } from '@shared/components/ui';
import { glucoseRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { MealRelation, GlucoseUnit, getGlucoseLevel, getGlucoseColor } from '../types';
import { useQueryClient } from '@tanstack/react-query';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUnsavedChangesGuard } from '@shared/hooks/useUnsavedChangesGuard';

const MEAL_OPTIONS: { value: MealRelation; labelKey: string; iconName: keyof typeof Ionicons.glyphMap; iconColor: string }[] = [
  { value: 'fasting', labelKey: 'glucose.fasting', iconName: 'sunny-outline', iconColor: '#FF9500' },
  { value: 'before_meal', labelKey: 'glucose.beforeMeal', iconName: 'restaurant-outline', iconColor: '#FF6B6B' },
  { value: 'after_meal', labelKey: 'glucose.afterMeal', iconName: 'checkmark-circle-outline', iconColor: '#34C759' },
  { value: 'unspecified', labelKey: 'glucose.unspecified', iconName: 'help-circle-outline', iconColor: '#8E8E93' },
];

export default function LogGlucoseScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<HomeStackParamList, 'LogGlucose'>>();
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
  const [recordedAt, setRecordedAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  // H003: prevent double-tap save
  const savingRef = useRef(false);
  // H002: track initial values to avoid false dirty-guard on edit load
  const initialValuesRef = useRef({ value: '', insulinDose: '', notes: '' });
  useUnsavedChangesGuard(
    value !== initialValuesRef.current.value ||
    insulinDose !== initialValuesRef.current.insulinDose ||
    notes !== initialValuesRef.current.notes
  );

  useEffect(() => {
    let cancelled = false;
    if (editId) {
      glucoseRepository.findById(editId).then(reading => {
        if (cancelled || !reading) return;
        const displayValue = savedUnit === 'mmol/L' ? reading.valueMmol.toFixed(1) : reading.valueMgdl.toString();
        const loadedDose = reading.insulinDose ? reading.insulinDose.toString() : '';
        const loadedNotes = reading.notes ?? '';
        setValue(displayValue);
        setMealRelation(reading.mealRelation);
        if (reading.insulinDose) setInsulinDose(loadedDose);
        if (reading.insulinType) setInsulinType(reading.insulinType);
        if (reading.notes) setNotes(loadedNotes);
        if (reading.recordedAt) setRecordedAt(new Date(reading.recordedAt));
        // H002: set baseline so guard doesn't fire immediately after load
        initialValuesRef.current = { value: displayValue, insulinDose: loadedDose, notes: loadedNotes };
      });
    }
    return () => { cancelled = true; };
  }, [editId]);

  const numValue = parseFloat(value.replace(',', '.'));
  // MM001: use consistent max — 35 mmol/L = 630 mg/dL (was 600 mg/dL, mismatched)
  const isValidValue = !isNaN(numValue) && numValue > 0 && numValue < (unit === 'mmol/L' ? 35 : 630);

  const glucosePreview = isValidValue
    ? {
        level: getGlucoseLevel(unit === 'mmol/L' ? numValue : numValue / 18.018),
        color: getGlucoseColor(unit === 'mmol/L' ? numValue : numValue / 18.018),
      }
    : null;

  // M011: doSave defined first so handleSave can include it in deps (stale closure fix)
  const doSave = useCallback(async () => {
    if (!activePet || savingRef.current) return;
    savingRef.current = true;
    setLoading(true);
    try {
      if (editId) {
        await glucoseRepository.update(editId, {
          petId: activePet.id, value: numValue, unit, mealRelation,
          // M003: replace comma so "2,5" parses correctly
          insulinDose: insulinDose ? parseFloat(insulinDose.replace(',', '.')) : undefined,
          insulinType: insulinType || undefined,
          notes: notes || undefined,
          recordedAt: recordedAt.toISOString(),
        });
      } else {
        await glucoseRepository.create({
          petId: activePet.id, value: numValue, unit, mealRelation,
          insulinDose: insulinDose ? parseFloat(insulinDose.replace(',', '.')) : undefined,
          insulinType: insulinType || undefined,
          notes: notes || undefined,
          recordedAt: recordedAt.toISOString(),
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['glucose'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (e) {
      Alert.alert(t('common.error'), t('glucose.saveError'));
    } finally {
      savingRef.current = false;
      setLoading(false);
    }
  }, [activePet, numValue, unit, mealRelation, insulinDose, insulinType, notes, recordedAt, editId, queryClient, navigation, t]);

  const handleSave = useCallback(async () => {
    if (savingRef.current) return;
    if (!activePet) { Alert.alert(t('common.error'), t('glucose.petNotFound')); return; }
    if (!isValidValue) { Alert.alert(t('common.error'), t('glucose.invalidValue')); return; }
    // MC002: Warn on unusually high insulin dose (typical cat range: 1–4 units)
    const doseNum = insulinDose ? parseFloat(insulinDose.replace(',', '.')) : 0;
    // FORM-004: Hard limit — 20 units is absolute max for cats
    if (doseNum > 20) {
      Alert.alert(t('glucose.doseAbsoluteLimit'), t('glucose.doseAbsoluteLimitDesc'));
      return;
    }
    if (doseNum > 10) {
      Alert.alert(t('glucose.veryHighDoseWarning'), t('glucose.veryHighDoseWarningDesc', { dose: doseNum }), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), style: 'destructive', onPress: () => doSave() },
      ]);
      return;
    }
    if (doseNum > 6) {
      Alert.alert(t('glucose.highDoseWarning'), t('glucose.highDoseWarningDesc', { dose: doseNum }), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), onPress: () => doSave() },
      ]);
      return;
    }
    doSave();
  }, [activePet, isValidValue, insulinDose, doSave, t]);

  const levelLabels: Record<string, string> = {
    severe_low: t('glucose.severeLow'),
    low: t('glucose.low'),
    below_target: t('glucose.belowTarget'),
    normal: t('glucose.normal'),
    high: t('glucose.high'),
    very_high: t('glucose.veryHigh'),
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View>
          <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={{ color: theme.colors.primary, fontSize: 16 }}>← {t('common.back')}</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>
              {editId ? t('glucose.editReading') : t('glucose.addReading')}
            </Text>
            <View style={{ width: 60 }} />
          </View>
          <LinearGradient colors={[...theme.gradients.primary] as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 3 }} />
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
                  onPress={() => {
                    if (u === unit) return;
                    // UX-001: Convert value when switching units
                    const num = parseFloat(value.replace(',', '.'));
                    if (!isNaN(num) && num > 0) {
                      const converted = u === 'mg/dL' ? (num * 18.018).toFixed(0) : (num / 18.018).toFixed(1);
                      setValue(converted);
                    }
                    setUnit(u);
                  }}
                >
                  <Text style={{ color: unit === u ? '#fff' : theme.colors.text, fontFamily: theme.fonts.semibold, fontSize: 13 }}>
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
              containerStyle={{ alignSelf: 'stretch' }}
              style={{ fontSize: 32, textAlign: 'center', fontFamily: theme.fonts.bold, color: theme.colors.text }}
            />

            {glucosePreview && (
              <View style={[styles.levelBadge, { backgroundColor: `${glucosePreview.color}20` }]}>
                <Text style={[styles.levelText, { color: glucosePreview.color, fontFamily: theme.fonts.bold }]}>
                  ● {levelLabels[glucosePreview.level]}
                </Text>
              </View>
            )}
          </Card>

          {/* Date & Time */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>{t('glucose.date')} & {t('glucose.time')}</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.dateTimeBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateTimeContent}>
                <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} style={{ marginRight: 6 }} />
                <Text style={{ color: theme.colors.text, fontSize: 15, fontFamily: theme.fonts.semibold }}>
                  {format(recordedAt, 'dd.MM.yyyy')}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateTimeBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.dateTimeContent}>
                <Ionicons name="time-outline" size={18} color={theme.colors.primary} style={{ marginRight: 6 }} />
                <Text style={{ color: theme.colors.text, fontSize: 15, fontFamily: theme.fonts.semibold }}>
                  {format(recordedAt, 'HH:mm')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={recordedAt}
              mode="date"
              maximumDate={new Date()}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setRecordedAt(date);
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={recordedAt}
              mode="time"
              onChange={(_, date) => {
                setShowTimePicker(false);
                if (date) setRecordedAt(date);
              }}
            />
          )}

          {/* Meal Relation */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>{t('glucose.mealRelation')}</Text>
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
                <Ionicons name={opt.iconName} size={24} color={mealRelation === opt.value ? theme.colors.primary : opt.iconColor} />
                <Text style={[styles.mealLabel, { color: mealRelation === opt.value ? theme.colors.primary : theme.colors.text, fontFamily: theme.fonts.semibold }]}>
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Insulin */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>{t('glucose.insulinOptional')}</Text>
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
              placeholder={t('glucose.insulinPlaceholder')}
              containerStyle={{ flex: 1 }}
            />
          </View>

          {/* Notes */}
          <Input
            label={t('glucose.notes')}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('glucose.notesPlaceholder')}
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
  backBtn: { width: 60, minHeight: 44, minWidth: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 17 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  mainCard: { alignItems: 'center', paddingVertical: 24 },
  mainLabel: { fontSize: 13, fontWeight: '500', marginBottom: 12 },
  unitRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  unitBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  levelBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12 },
  levelText: { fontSize: 14 },
  sectionTitle: { fontSize: 16, marginTop: 4 },
  mealGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  mealBtn: { width: '47%', padding: 14, borderRadius: 14, alignItems: 'center', gap: 6 },
  mealLabel: { fontSize: 13, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 12 },
  dateTimeBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  dateTimeContent: { flexDirection: 'row', alignItems: 'center' },
});
