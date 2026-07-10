import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import i18n from '@shared/i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@shared/components/ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useHomeNavigation } from '@navigation/hooks';
import { useRoute, RouteProp } from '@react-navigation/native';
import type { HomeStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input, Card } from '@shared/components/ui';
import { injectionRepository } from '@storage/database';
import { StorageKeys } from '@storage/mmkv/storage';
import { findRecentInsulinDose } from '../utils/recentInsulinCheck';
import { saveEntryDraft, loadEntryDraft, clearEntryDraft } from '../utils/entryDraft';
import { usePetStore } from '@shared/stores/petStore';
import { getInsulinThresholds, getSpeciesConfig } from '@shared/config/speciesConfig';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@shared/utils/queryKeys';
import * as Haptics from 'expo-haptics';
import { useUnsavedChangesGuard } from '@shared/hooks/useUnsavedChangesGuard';
import { useHintTrigger } from '@features/hints/hooks/useHintTrigger';

// Insulin list is now i18n-driven, see below

export default function LogInjectionScreen() {
  const navigation = useHomeNavigation();
  const route = useRoute<RouteProp<HomeStackParamList, 'LogInjection'>>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const queryClient = useQueryClient();
  // UX-C2 (audit): pin pet at mount — see LogGlucoseScreen for rationale.
  // Misattributed insulin doses are dangerous in multi-pet households.
  const petIdRef = useRef<string | undefined>(activePet?.id);

  // C2 (audit): restore an interrupted draft (per-pet, expires after a day).
  const initialDraft = useRef(
    loadEntryDraft<{ dose: string; insulinType: string; notes: string; administeredAt: string }>(
      StorageKeys.INJECTION_DRAFT,
      activePet?.id ?? ''
    )
  ).current;

  const [dose, setDose] = useState(initialDraft?.dose ?? '');
  const [insulinType, setInsulinType] = useState(
    initialDraft?.insulinType ?? activePet?.insulinType ?? ''
  );
  const [notes, setNotes] = useState(initialDraft?.notes ?? '');
  const [administeredAt, setAdministeredAt] = useState(() =>
    initialDraft?.administeredAt
      ? new Date(initialDraft.administeredAt)
      : route.params?.presetDate
        ? new Date(route.params.presetDate)
        : new Date()
  );

  // C2: persist the draft as the user types; clear it once nothing meaningful
  // remains. Cleared on successful save (see doSaveInjection).
  useEffect(() => {
    const pid = petIdRef.current;
    if (!pid) return;
    if (!dose && !notes) {
      clearEntryDraft(StorageKeys.INJECTION_DRAFT);
      return;
    }
    saveEntryDraft(StorageKeys.INJECTION_DRAFT, pid, {
      dose,
      insulinType,
      notes,
      administeredAt: administeredAt.toISOString(),
    });
  }, [dose, insulinType, notes, administeredAt]);
  const initialAdministeredAt = useRef(administeredAt.getTime());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { triggerAfterAction } = useHintTrigger();
  // Quick-select from speciesConfig — the old i18n list was one shared set
  // for both species, offering cat-first insulins to dog owners and vice
  // versa. commonTypes is already curated per species (first-line first).
  const commonInsulins = getSpeciesConfig(activePet?.species ?? 'cat').insulin.commonTypes.map(
    ct => ct.name
  );
  // ARCH005: prevent duplicate injection on double-tap
  const savingRef = useRef(false);
  const dateChanged = administeredAt.getTime() !== initialAdministeredAt.current;
  const disableGuard = useUnsavedChangesGuard(
    !!dose || !!notes || dateChanged || insulinType !== (activePet?.insulinType ?? '')
  );

  const doSaveInjection = useCallback(async () => {
    const targetPetId = petIdRef.current;
    if (!targetPetId || savingRef.current) return;
    // C8 (audit): name the original pet and offer a one-tap recovery instead of
    // a dead-end error when the active pet changed mid-entry.
    if (usePetStore.getState().activePet?.id !== targetPetId) {
      const original = usePetStore.getState().pets.find(p => p.id === targetPetId);
      Alert.alert(
        t('common.error'),
        t('injection.petChangedDuringEntry', { name: original?.name ?? '' }),
        original
          ? [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('common.switchBackAndSave', { name: original.name }),
                onPress: () => {
                  usePetStore.getState().setActivePet(original);
                  doSaveInjection();
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
      await injectionRepository.create({
        petId: targetPetId,
        insulinType: insulinType.trim(),
        doseUnits: parseFloat(dose.replace(',', '.')),
        notes: notes || undefined,
        administeredAt: administeredAt.toISOString(),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.injections.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.diary.all });
      clearEntryDraft(StorageKeys.INJECTION_DRAFT);
      disableGuard();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      triggerAfterAction('injection');
      navigation.goBack();
    } catch {
      Alert.alert(t('common.error'), t('injection.saveError'));
    } finally {
      savingRef.current = false;
      setLoading(false);
    }
  }, [
    dose,
    insulinType,
    notes,
    administeredAt,
    queryClient,
    navigation,
    t,
    triggerAfterAction,
    disableGuard,
  ]);

  const proceedWithDoseChecks = useCallback(
    (doseNum: number) => {
      const species = activePet?.species ?? 'cat';
      const thresholds = getInsulinThresholds(species, activePet?.weightKg);
      if (doseNum > thresholds.absoluteMax) {
        Alert.alert(
          t('glucose.doseAbsoluteLimit'),
          t('glucose.doseAbsoluteLimitDesc', { context: species })
        );
        return;
      }
      if (doseNum > thresholds.danger) {
        Alert.alert(
          t('glucose.veryHighDoseWarning'),
          t('glucose.veryHighDoseWarningDesc', { dose: doseNum, context: species }),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.confirm'), style: 'destructive', onPress: () => doSaveInjection() },
          ]
        );
        return;
      }
      if (doseNum > thresholds.warning) {
        Alert.alert(
          t('glucose.highDoseWarning'),
          t('glucose.highDoseWarningDesc', { dose: doseNum, context: species }),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.confirm'), onPress: () => doSaveInjection() },
          ]
        );
        return;
      }
      doSaveInjection();
    },
    [t, doSaveInjection, activePet?.species, activePet?.weightKg]
  );

  const handleSave = useCallback(async () => {
    if (savingRef.current || !activePet) return;
    const doseNum = parseFloat(dose.replace(',', '.'));
    if (!dose || isNaN(doseNum) || doseNum <= 0) {
      Alert.alert(t('common.error'), t('injection.doseError'));
      return;
    }
    if (!insulinType.trim()) {
      Alert.alert(t('common.error'), t('injection.typeError'));
      return;
    }

    // X.8: Duplicate injection safety — warn if another insulin dose (a
    // standalone injection OR an inline dose on a glucose reading) was logged
    // < 6h ago. Shared with LogGlucoseScreen via findRecentInsulinDose so both
    // dose-entry paths run the same guard.
    const recent = await findRecentInsulinDose(activePet.id, administeredAt);
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

    proceedWithDoseChecks(doseNum);
  }, [activePet, dose, insulinType, administeredAt, t, proceedWithDoseChecks]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View>
          <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}
            >
              <Text style={{ color: theme.colors.primary }}>
                {'\u2190 '}
                {t('common.back')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
              {t('injection.title')}
            </Text>
            <View style={{ width: 60 }} />
          </View>
          <LinearGradient
            colors={[...theme.gradients.secondary] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 3 }}
          />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.mainCard}>
            <Icon
              name="medkit-outline"
              size={48}
              color={theme.colors.primary}
              style={{ marginBottom: 8 }}
            />
            <Input
              label={t('injection.dose')}
              value={dose}
              onChangeText={setDose}
              placeholder="2.0"
              keyboardType="decimal-pad"
              containerStyle={{ width: '100%' }}
              style={{ fontSize: 28, textAlign: 'center', fontWeight: '700' }}
              rightElement={
                <Text
                  style={{ fontSize: 18, color: theme.colors.textSecondary, fontWeight: '600' }}
                >
                  {t('common.units')}
                </Text>
              }
            />
          </Card>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('injection.insulinType')}
          </Text>
          <Input
            value={insulinType}
            onChangeText={setInsulinType}
            placeholder={t('glucose.insulinPlaceholder')}
          />

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('injection.quickSelect')}
          </Text>
          <View style={styles.chips}>
            {commonInsulins.map(ins => (
              <TouchableOpacity
                key={ins}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      insulinType === ins ? theme.colors.primary : theme.colors.surfaceSecondary,
                  },
                ]}
                onPress={() => setInsulinType(ins)}
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

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
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
                  {format(administeredAt, i18n.language === 'ru' ? 'dd.MM.yyyy' : 'MM/dd/yyyy')}
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
                  {format(administeredAt, 'HH:mm')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={administeredAt}
              mode="date"
              maximumDate={new Date()}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) {
                  const merged = new Date(date);
                  merged.setHours(
                    administeredAt.getHours(),
                    administeredAt.getMinutes(),
                    administeredAt.getSeconds()
                  );
                  setAdministeredAt(merged);
                }
              }}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={administeredAt}
              mode="time"
              onChange={(_, date) => {
                setShowTimePicker(false);
                if (date) {
                  const merged = new Date(administeredAt);
                  merged.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
                  // Guard: don't allow a future time on today's date.
                  const nowTs = new Date();
                  setAdministeredAt(merged > nowTs ? nowTs : merged);
                }
              }}
            />
          )}

          <Input
            label={t('glucose.notes')}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('injection.notesPlaceholder')}
            multiline
            numberOfLines={2}
          />

          <Button
            title={loading ? t('injection.saving') : t('injection.save')}
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
    padding: 16,
    borderBottomWidth: 0.5,
    gap: 8,
  },
  title: { fontSize: 17, fontWeight: '600', flex: 1, textAlign: 'center' },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  mainCard: { alignItems: 'center', paddingVertical: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  row: { flexDirection: 'row', gap: 10 },
  dateTimeBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  dateTimeContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
