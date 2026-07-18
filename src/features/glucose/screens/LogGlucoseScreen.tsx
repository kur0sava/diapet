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
import { useRootNavigation } from '@navigation/hooks';
import type { HomeStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input, Card, ScreenHeader } from '@shared/components/ui';
import { useSuccessToast } from '@shared/components/ui/SuccessToast';
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
  getGlucoseArrow,
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
import { findRecentInsulinDose } from '../utils/recentInsulinCheck';
import { saveEntryDraft, loadEntryDraft, clearEntryDraft } from '../utils/entryDraft';
import { logEvent } from '@shared/analytics/analytics';
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
  const rootNavigation = useRootNavigation();
  const route = useRoute<RouteProp<HomeStackParamList, 'LogGlucose'>>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const queryClient = useQueryClient();
  const editId = route.params?.editId;

  // UX-C2 (audit): pin the pet id at mount. Once a multi-pet picker exists,
  // setActivePet could fire from a notification deep-link or another screen
  // mid-input — without this snapshot the save would attribute a glucose
  // reading to whichever pet was active at submit time, not at entry time.
  // Medical-safety preventive: a glucose reading filed under the wrong pet
  // skews their analytics and could mask a hypo trend.
  const petIdRef = useRef<string | undefined>(activePet?.id);

  const savedUnit = (storage.getString(StorageKeys.GLUCOSE_UNIT) ?? 'mmol/L') as GlucoseUnit;

  // C2 (audit): restore an interrupted draft for NEW entries only (edit mode
  // loads the stored reading instead). Per-pet, expires after a day.
  const initialDraft = useRef(
    editId
      ? null
      : loadEntryDraft<{
          value: string;
          unit: GlucoseUnit;
          mealRelation: MealRelation;
          insulinDose: string;
          insulinType: string;
          notes: string;
          recordedAt: string;
        }>(StorageKeys.GLUCOSE_DRAFT, activePet?.id ?? '')
  ).current;

  const [value, setValue] = useState(initialDraft?.value ?? '');
  const [unit, setUnit] = useState<GlucoseUnit>(initialDraft?.unit ?? savedUnit);
  const [mealRelation, setMealRelation] = useState<MealRelation>(
    initialDraft?.mealRelation ?? 'unspecified'
  );
  const [insulinDose, setInsulinDose] = useState(initialDraft?.insulinDose ?? '');
  const [insulinType, setInsulinType] = useState(
    initialDraft?.insulinType ?? activePet?.insulinType ?? ''
  );
  const [notes, setNotes] = useState(initialDraft?.notes ?? '');
  const [loading, setLoading] = useState(false);
  const [recordedAt, setRecordedAt] = useState(() =>
    initialDraft?.recordedAt
      ? new Date(initialDraft.recordedAt)
      : route.params?.presetDate
        ? new Date(route.params.presetDate)
        : new Date()
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
        // C5 (audit): preserve the stored precision (mmol is kept to 2 dp) so
        // re-saving an unchanged reading doesn't round-drift it (e.g. a reading
        // entered as 117 mg/dL = 6.49 mmol showed "6.5" and was rewritten as 6.5).
        const displayValue =
          savedUnit === 'mmol/L'
            ? parseFloat(reading.valueMmol.toFixed(2)).toString()
            : reading.valueMgdl.toString();
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

  // C2: persist the draft as the user types (new entries only); clear when
  // nothing meaningful remains. Cleared on successful save (see doSave).
  useEffect(() => {
    if (editId) return;
    const pid = petIdRef.current;
    if (!pid) return;
    if (!value && !insulinDose && !notes) {
      clearEntryDraft(StorageKeys.GLUCOSE_DRAFT, pid);
      return;
    }
    saveEntryDraft(StorageKeys.GLUCOSE_DRAFT, pid, {
      value,
      unit,
      mealRelation,
      insulinDose,
      insulinType,
      notes,
      recordedAt: recordedAt.toISOString(),
    });
  }, [editId, value, unit, mealRelation, insulinDose, insulinType, notes, recordedAt]);

  const numValue = parseFloat(value.replace(',', '.'));
  const isValidValue =
    !isNaN(numValue) &&
    numValue > 0 &&
    numValue < (unit === 'mmol/L' ? MAX_REASONABLE_GLUCOSE_MMOL : MAX_REASONABLE_GLUCOSE_MGDL);

  const speciesRanges = getSpeciesConfig(activePet?.species ?? 'cat').glucose.ranges;
  // Same species-curated quick-select list as LogInjection (first-line first).
  const commonInsulins = getSpeciesConfig(activePet?.species ?? 'cat').insulin.commonTypes.map(
    ct => ct.name
  );
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
    const targetPetId = petIdRef.current;
    if (!targetPetId || savingRef.current) return;
    // UX-C2 (audit): if the active pet changed mid-input, refuse to save and
    // warn — better to abort than to file the entry under the wrong pet.
    // C8 (audit): name the original pet and offer a one-tap recovery (switch
    // back to it and save) instead of leaving the entry stuck.
    if (usePetStore.getState().activePet?.id !== targetPetId) {
      const original = usePetStore.getState().pets.find(p => p.id === targetPetId);
      Alert.alert(
        t('common.error'),
        t('glucose.petChangedDuringEntry', { name: original?.name ?? '' }),
        original
          ? [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('common.switchBackAndSave', { name: original.name }),
                onPress: () => {
                  usePetStore.getState().setActivePet(original);
                  doSave();
                },
              },
            ]
          : undefined
      );
      return;
    }
    savingRef.current = true;
    setLoading(true);
    try {
      if (editId) {
        await glucoseRepository.update(editId, {
          petId: targetPetId,
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
          petId: targetPetId,
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
      clearPredictionCache(targetPetId);
      clearEntryDraft(StorageKeys.GLUCOSE_DRAFT, targetPetId);
      // Disable guard for the navigation we're about to trigger
      disableGuard();
      syncInitialValues();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const enteredMmol = unit === 'mg/dL' ? mgdlToMmol(numValue) : numValue;
      if (!editId) {
        // v2.6 (3.4): pass the value so the hint system can react to a mild
        // hypo/hyper contextually (emergencies covered by the alert below)
        triggerAfterAction('glucose', { valueMmol: enteredMmol });
        logEvent('glucose_added', { meal_relation: mealRelation, has_insulin: !!insulinDose });
      }
      // Safety: if the just-logged reading is in an emergency zone, surface it
      // immediately with a route to the first-aid guide. Previously the danger
      // was only implied by a coloured badge and never triggered any alert.
      const gcfg = getSpeciesConfig(activePet?.species ?? 'cat').glucose;
      const isHypoEmergency = enteredMmol < gcfg.emergencyLow;
      const isHyperEmergency = enteredMmol > gcfg.emergencyHigh;
      if (isHypoEmergency || isHyperEmergency) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          t(isHypoEmergency ? 'glucose.emergencyHypoTitle' : 'glucose.emergencyHyperTitle'),
          t(isHypoEmergency ? 'glucose.emergencyHypoBody' : 'glucose.emergencyHyperBody'),
          [
            {
              text: t('glucose.emergencyDismiss'),
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
            {
              text: t('glucose.openEmergency'),
              onPress: () => {
                navigation.goBack();
                rootNavigation.navigate('Emergency');
              },
            },
          ]
        );
      } else {
        // Y7: acknowledge the save — silence reads as "did it work?"
        useSuccessToast.getState().show(t('common.saved'));
        navigation.goBack();
      }
    } catch {
      Alert.alert(t('common.error'), t('glucose.saveError'));
    } finally {
      savingRef.current = false;
      setLoading(false);
    }
  }, [
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
    rootNavigation,
    activePet,
    t,
    syncInitialValues,
    triggerAfterAction,
    disableGuard,
  ]);

  // MC002: species-aware high-dose thresholds. Extracted so handleSave can
  // gate it behind the recent-insulin (double-dose) check below.
  const proceedWithDoseChecks = useCallback(
    (doseNum: number) => {
      if (!activePet) return;
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
    },
    [activePet, doSave, t]
  );

  // Dose validation + A1 duplicate-dose guard + threshold checks. Split out of
  // handleSave so the A4 extreme-value confirmation can gate the whole chain.
  const continueAfterValueChecks = useCallback(async () => {
    if (!activePet) return;
    const doseNum = insulinDose ? parseFloat(insulinDose.replace(',', '.')) : 0;
    if (insulinDose && (isNaN(doseNum) || doseNum <= 0)) {
      Alert.alert(t('common.error'), t('injection.doseError'));
      return;
    }
    // C9 (audit): match LogInjection — a dose with no insulin type produces a
    // history/PDF row with an unidentified insulin. Type is prefilled from the
    // active pet; require it whenever a dose is entered.
    if (doseNum > 0 && !insulinType.trim()) {
      Alert.alert(t('common.error'), t('injection.typeError'));
      return;
    }
    // A1 (audit): duplicate-dose safety. The dedicated injection screen warns
    // if insulin was given < 6h ago; when a dose is entered inline here we must
    // run the same guard, otherwise the "safe-looking" glucose path silently
    // skips the most important medical check. Exclude the reading being edited
    // so it doesn't match itself.
    if (doseNum > 0) {
      const recent = await findRecentInsulinDose(activePet.id, recordedAt, editId);
      if (recent) {
        Alert.alert(
          t('injection.recentInjectionWarning'),
          t('injection.recentInjectionWarningDesc', {
            hours: recent.hours,
            minutes: recent.minutes,
          }),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.confirm'),
              style: 'destructive',
              onPress: () => proceedWithDoseChecks(doseNum),
            },
          ]
        );
        return;
      }
    }
    proceedWithDoseChecks(doseNum);
  }, [activePet, insulinDose, insulinType, recordedAt, editId, proceedWithDoseChecks, t]);

  const handleSave = useCallback(() => {
    if (savingRef.current) return;
    if (!activePet) {
      Alert.alert(t('common.error'), t('glucose.petNotFound'));
      return;
    }
    if (!isValidValue) {
      Alert.alert(t('common.error'), t('glucose.invalidValue'));
      return;
    }
    // A4 (audit): a value in the emergency zone is either a real emergency or a
    // typo (e.g. 25 instead of 2.5). Confirm BEFORE persisting — previously the
    // reading was saved first, so a typo created a false emergency and lit the
    // 24h dashboard banner. On confirm we continue; the post-save emergency
    // alert in doSave still offers the first-aid guide for genuine values.
    const enteredMmol = unit === 'mg/dL' ? mgdlToMmol(numValue) : numValue;
    const gcfg = getSpeciesConfig(activePet.species).glucose;
    if (enteredMmol < gcfg.emergencyLow || enteredMmol > gcfg.emergencyHigh) {
      Alert.alert(t('glucose.extremeValueTitle'), t('glucose.extremeValueBody', { value, unit }), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), onPress: () => continueAfterValueChecks() },
      ]);
      return;
    }
    continueAfterValueChecks();
  }, [activePet, isValidValue, unit, numValue, value, continueAfterValueChecks, t]);

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
          <ScreenHeader
            title={editId ? t('glucose.editReading') : t('glucose.addReading')}
            onBack={() => navigation.goBack()}
          />
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
                    // UX-001: Convert value when switching units.
                    // UX-L4 (audit): only convert when the result rounds to
                    // a usable value — switching mmol → mg/dL with 0.001
                    // mmol would give "0", a forbidden state. Leave the
                    // input cleared in that case so the user re-types.
                    const num = parseFloat(value.replace(',', '.'));
                    if (!isNaN(num) && num > 0) {
                      const converted =
                        u === 'mg/dL'
                          ? (num * MGDL_PER_MMOLL).toFixed(0)
                          : (num / MGDL_PER_MMOLL).toFixed(1);
                      setValue(parseFloat(converted) > 0 ? converted : '');
                    }
                    // A5 (audit): this toggle is LOCAL to the entry screen only.
                    // It used to persist StorageKeys.GLUCOSE_UNIT immediately,
                    // so a tap to sanity-check a conversion silently flipped the
                    // app-wide display unit (dashboard/list/PDF) — a medical
                    // safety issue. The global unit is changed only from Settings.
                    setUnit(u);
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
                  {getGlucoseArrow(glucosePreview.level) || '●'} {levelLabels[glucosePreview.level]}
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
                  // Guard: picking a later time on today's date must not produce
                  // a future timestamp (the date picker already blocks future days).
                  const nowTs = new Date();
                  setRecordedAt(merged > nowTs ? nowTs : merged);
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
          {/* Y4 (design audit): same quick-select chips as LogInjection —
              free-typed names ("Лантус"/"lantus"/"гларгин") fragment the
              analyzer's insulin grouping and the PDF report. */}
          <View style={styles.insulinChips}>
            {commonInsulins.map(ins => (
              <TouchableOpacity
                key={ins}
                style={[
                  styles.insulinChip,
                  {
                    backgroundColor:
                      insulinType === ins ? theme.colors.primary : theme.colors.surfaceSecondary,
                  },
                ]}
                onPress={() => setInsulinType(insulinType === ins ? '' : ins)}
              >
                <Text
                  style={{
                    color: insulinType === ins ? '#fff' : theme.colors.text,
                    fontSize: 13,
                    fontWeight: '500',
                  }}
                >
                  {ins}
                </Text>
              </TouchableOpacity>
            ))}
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
  insulinChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  insulinChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
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
