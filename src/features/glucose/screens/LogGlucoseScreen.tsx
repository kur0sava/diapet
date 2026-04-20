import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { HomeStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input, Card } from '@shared/components/ui';
import { glucoseRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { MealRelation, GlucoseUnit } from '../types';
import {
  MGDL_PER_MMOLL,
  MAX_REASONABLE_GLUCOSE_MMOL,
  MAX_REASONABLE_GLUCOSE_MGDL,
  mgdlToMmol,
  getGlucoseLevelFromRanges,
  getGlucoseColorFromRanges,
} from '@storage/domain/types';
import { getInsulinThresholds, getSpeciesConfig } from '@shared/config/speciesConfig';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@shared/utils/queryKeys';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import i18n from '@shared/i18n';
import { Icon } from '@shared/components/ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useUnsavedChangesGuard } from '@shared/hooks/useUnsavedChangesGuard';
import { useHintTrigger } from '@features/hints/hooks/useHintTrigger';
import { clearPredictionCache } from '@features/prediction/data/predictionStorage';
import type { IoniconName } from '@shared/components/ui';

const MEAL_OPTIONS: {
  value: MealRelation;
  labelKey: string;
  iconName: IoniconName;
  iconColor: string;
}[] = [
  {
    value: 'fasting',
    labelKey: 'glucose.fasting',
    iconName: 'sunny-outline',
    iconColor: '#FF9500',
  },
  {
    value: 'before_meal',
    labelKey: 'glucose.beforeMeal',
    iconName: 'restaurant-outline',
    iconColor: '#FF6B6B',
  },
  {
    value: 'after_meal',
    labelKey: 'glucose.afterMeal',
    iconName: 'checkmark-circle-outline',
    iconColor: '#34C759',
  },
  {
    value: 'unspecified',
    labelKey: 'glucose.unspecified',
    iconName: 'help-circle-outline',
    iconColor: '#8E8E93',
  },
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
  const [insulinType, setInsulinType] = useState(activePet?.insulinType ?? '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [recordedAt, setRecordedAt] = useState(() =>
    route.params?.presetDate ? new Date(route.params.presetDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { triggerAfterAction } = useHintTrigger();
  // H003: prevent double-tap save
  const savingRef = useRef(false);
  // H002: track initial values to avoid false dirty-guard on edit load
  const initialValuesRef = useRef({
    value: '',
    insulinDose: '',
    insulinType: '',
    notes: '',
    mealRelation: 'unspecified' as MealRelation,
    unit: savedUnit as GlucoseUnit,
    recordedAt: new Date(recordedAt).getTime(),
  });
  const disableGuard = useUnsavedChangesGuard(
    value !== initialValuesRef.current.value ||
      insulinDose !== initialValuesRef.current.insulinDose ||
      insulinType !== initialValuesRef.current.insulinType ||
      notes !== initialValuesRef.current.notes ||
      mealRelation !== initialValuesRef.current.mealRelation ||
      unit !== initialValuesRef.current.unit ||
      recordedAt.getTime() !== initialValuesRef.current.recordedAt
  );

  useEffect(() => {
    let cancelled = false;
    if (editId) {
      glucoseRepository.findById(editId).then(reading => {
        if (cancelled || !reading) return;
        const displayValue =
          savedUnit === 'mmol/L' ? reading.valueMmol.toFixed(1) : reading.valueMgdl.toString();
        const loadedDose = reading.insulinDose ? reading.insulinDose.toString() : '';
        const loadedNotes = reading.notes ?? '';
        setValue(displayValue);
        setMealRelation(reading.mealRelation);
        if (reading.insulinDose) setInsulinDose(loadedDose);
        if (reading.insulinType) setInsulinType(reading.insulinType);
        if (reading.notes) setNotes(loadedNotes);
        if (reading.recordedAt) setRecordedAt(new Date(reading.recordedAt));
        // H002: set baseline so guard doesn't fire immediately after load
        initialValuesRef.current = {
          value: displayValue,
          insulinDose: loadedDose,
          insulinType: reading.insulinType ?? '',
          notes: loadedNotes,
          mealRelation: reading.mealRelation,
          unit: savedUnit,
          recordedAt: reading.recordedAt
            ? new Date(reading.recordedAt).getTime()
            : new Date().getTime(),
        };
      });
    }
    return () => {
      cancelled = true;
    };
  }, [editId, savedUnit]);

  const numValue = parseFloat(value.replace(',', '.'));
  const isValidValue =
    !isNaN(numValue) &&
    numValue > 0 &&
    numValue < (unit === 'mmol/L' ? MAX_REASONABLE_GLUCOSE_MMOL : MAX_REASONABLE_GLUCOSE_MGDL);

  const speciesRanges = getSpeciesConfig(activePet?.species ?? 'cat').glucose.ranges;
  const glucosePreview = isValidValue
    ? {
        level: getGlucoseLevelFromRanges(
          unit === 'mmol/L' ? numValue : mgdlToMmol(numValue),
          speciesRanges
        ),
        color: getGlucoseColorFromRanges(
          unit === 'mmol/L' ? numValue : mgdlToMmol(numValue),
          speciesRanges
        ),
      }
    : null;

  const syncInitialValues = useCallback(() => {
    initialValuesRef.current = {
      value,
      insulinDose,
      insulinType,
      notes,
      mealRelation,
      unit,
      recordedAt: recordedAt.getTime(),
    };
  }, [value, insulinDose, insulinType, notes, mealRelation, unit, recordedAt]);

  // M011: doSave defined first so handleSave can include it in deps (stale closure fix)
  const doSave = useCallback(async () => {
    if (!activePet || savingRef.current) return;
    savingRef.current = true;
    setLoading(true);
    try {
      if (editId) {
        await glucoseRepository.update(editId, {
          petId: activePet.id,
          value: numValue,
          unit,
          mealRelation,
          // M003: replace comma so "2,5" parses correctly
          insulinDose: insulinDose ? parseFloat(insulinDose.replace(',', '.')) : undefined,
          insulinType: insulinType || undefined,
          notes: notes || undefined,
          recordedAt: recordedAt.toISOString(),
        });
      } else {
        await glucoseRepository.create({
          petId: activePet.id,
          value: numValue,
          unit,
          mealRelation,
          insulinDose: insulinDose ? parseFloat(insulinDose.replace(',', '.')) : undefined,
          insulinType: insulinType || undefined,
          notes: notes || undefined,
          recordedAt: recordedAt.toISOString(),
        });
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.glucose.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.diary.all });
      if (activePet) clearPredictionCache(activePet.id);
      // Disable guard for the navigation we're about to trigger
      disableGuard();
      syncInitialValues();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (!editId) {
        triggerAfterAction('glucose');
      }
      navigation.goBack();
    } catch {
      Alert.alert(t('common.error'), t('glucose.saveError'));
    } finally {
      savingRef.current = false;
      setLoading(false);
    }
  }, [
    activePet,
    numValue,
    unit,
    mealRelation,
    insulinDose,
    insulinType,
    notes,
    recordedAt,
    editId,
    queryClient,
    navigation,
    t,
    syncInitialValues,
    triggerAfterAction,
    disableGuard,
  ]);

  const handleSave = useCallback(async () => {
    if (savingRef.current) return;
    if (!activePet) {
      Alert.alert(t('common.error'), t('glucose.petNotFound'));
      return;
    }
    if (!isValidValue) {
      Alert.alert(t('common.error'), t('glucose.invalidValue'));
      return;
    }
    // MC002: Warn on unusually high insulin dose — species-aware thresholds
    const doseNum = insulinDose ? parseFloat(insulinDose.replace(',', '.')) : 0;
    if (insulinDose && (isNaN(doseNum) || doseNum <= 0)) {
      Alert.alert(t('common.error'), t('injection.doseError'));
      return;
    }
    const doseThresholds = getInsulinThresholds(activePet.species, activePet.weightKg);
    if (doseNum > doseThresholds.absoluteMax) {
      Alert.alert(
        t('glucose.doseAbsoluteLimit'),
        t('glucose.doseAbsoluteLimitDesc', { context: activePet.species })
      );
      return;
    }
    if (doseNum > doseThresholds.danger) {
      Alert.alert(
        t('glucose.veryHighDoseWarning'),
        t('glucose.veryHighDoseWarningDesc', { dose: doseNum, context: activePet.species }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.confirm'), style: 'destructive', onPress: () => doSave() },
        ]
      );
      return;
    }
    if (doseNum > doseThresholds.warning) {
      Alert.alert(
        t('glucose.highDoseWarning'),
        t('glucose.highDoseWarningDesc', { dose: doseNum, context: activePet.species }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.confirm'), onPress: () => doSave() },
        ]
      );
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View>
          <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={{ color: theme.colors.primary, fontSize: 16 }}>
                ← {t('common.back')}
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.headerTitle,
                { color: theme.colors.text, fontFamily: theme.fonts.semibold },
              ]}
            >
              {editId ? t('glucose.editReading') : t('glucose.addReading')}
            </Text>
            <View style={{ width: 60 }} />
          </View>
          <LinearGradient
            colors={[...theme.gradients.primary] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 3 }}
          />
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
                    {
                      backgroundColor:
                        unit === u ? theme.colors.primary : theme.colors.surfaceSecondary,
                    },
                  ]}
                  onPress={() => {
                    if (u === unit) return;
                    // UX-001: Convert value when switching units
                    const num = parseFloat(value.replace(',', '.'));
                    if (!isNaN(num) && num > 0) {
                      const converted =
                        u === 'mg/dL'
                          ? (num * MGDL_PER_MMOLL).toFixed(0)
                          : (num / MGDL_PER_MMOLL).toFixed(1);
                      setValue(converted);
                    }
                    setUnit(u);
                    storage.set(StorageKeys.GLUCOSE_UNIT, u);
                  }}
                >
                  <Text
                    style={{
                      color: unit === u ? '#fff' : theme.colors.text,
                      fontFamily: theme.fonts.semibold,
                      fontSize: 13,
                    }}
                  >
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
              style={{
                fontSize: 32,
                textAlign: 'center',
                fontFamily: theme.fonts.bold,
                color: theme.colors.text,
              }}
            />

            {glucosePreview && (
              <View style={[styles.levelBadge, { backgroundColor: `${glucosePreview.color}20` }]}>
                <Text
                  style={[
                    styles.levelText,
                    { color: glucosePreview.color, fontFamily: theme.fonts.bold },
                  ]}
                >
                  ● {levelLabels[glucosePreview.level]}
                </Text>
              </View>
            )}
          </Card>

          {/* Date & Time */}
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.text, fontFamily: theme.fonts.bold },
            ]}
          >
            {t('glucose.date')} & {t('glucose.time')}
          </Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.dateTimeBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateTimeContent}>
                <Icon
                  name="calendar-outline"
                  size={18}
                  color={theme.colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 15,
                    fontFamily: theme.fonts.semibold,
                  }}
                >
                  {format(recordedAt, i18n.language === 'ru' ? 'dd.MM.yyyy' : 'MM/dd/yyyy')}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateTimeBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.dateTimeContent}>
                <Icon
                  name="time-outline"
                  size={18}
                  color={theme.colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 15,
                    fontFamily: theme.fonts.semibold,
                  }}
                >
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
                if (date) {
                  const merged = new Date(date);
                  merged.setHours(
                    recordedAt.getHours(),
                    recordedAt.getMinutes(),
                    recordedAt.getSeconds()
                  );
                  setRecordedAt(merged);
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={recordedAt}
              mode="time"
              onChange={(_, date) => {
                setShowTimePicker(false);
                if (date) {
                  const merged = new Date(recordedAt);
                  merged.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
                  setRecordedAt(merged);
                }
              }}
            />
          )}

          {/* Meal Relation */}
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.text, fontFamily: theme.fonts.bold },
            ]}
          >
            {t('glucose.mealRelation')}
          </Text>
          <View style={styles.mealGrid}>
            {MEAL_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.mealBtn,
                  {
                    backgroundColor:
                      mealRelation === opt.value ? theme.colors.primaryLight : theme.colors.surface,
                    borderColor: mealRelation === opt.value ? theme.colors.primary : 'transparent',
                    borderWidth: 2,
                    ...theme.shadows.sm,
                  },
                ]}
                onPress={() => setMealRelation(opt.value)}
              >
                <Icon
                  name={opt.iconName}
                  size={24}
                  color={mealRelation === opt.value ? theme.colors.primary : opt.iconColor}
                />
                <Text
                  style={[
                    styles.mealLabel,
                    {
                      color: mealRelation === opt.value ? theme.colors.primary : theme.colors.text,
                      fontFamily: theme.fonts.semibold,
                    },
                  ]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Insulin */}
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.text, fontFamily: theme.fonts.bold },
            ]}
          >
            {t('glucose.insulinOptional')}
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 8,
  },
  backBtn: { width: 60, minHeight: 44, minWidth: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 17, flex: 1, textAlign: 'center' },
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
