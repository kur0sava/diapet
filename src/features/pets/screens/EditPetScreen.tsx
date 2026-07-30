import React, { useState, useEffect, useRef } from 'react';
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
import { useMoreNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input, PetAvatar, ScreenHeader } from '@shared/components/ui';
import { pickPetPhoto, deletePetPhotoFile } from '../utils/petPhoto';
import DateTimePicker from '@react-native-community/datetimepicker';
import { petRepository, scheduleRepository, getDatabase } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@shared/utils/queryKeys';
import { MAX_SCHEDULE_TIMES } from '@storage/domain/types';
import type { PetGender, DiabetesType } from '@storage/domain/types';
import { toDateOnly, formatFullDateLocal } from '@shared/utils/dateUtils';
import { getSpeciesConfig } from '@shared/config/speciesConfig';
import { WeightUnitToggle } from '@shared/components/WeightUnitToggle';
import {
  getWeightUnit,
  setWeightUnit,
  inputToKg,
  kgToInput,
  convertInput,
  type WeightUnit,
} from '@shared/utils/weight';
import { Icon } from '@shared/components/ui/Icon';
import { storage, StorageKeys, vetNameKey, vetPhoneKey } from '@storage/mmkv/storage';
import { useUnsavedChangesGuard } from '@shared/hooks/useUnsavedChangesGuard';
import { restoreScheduleNotifications } from '@shared/hooks/useNotifications';

export default function EditPetScreen() {
  const navigation = useMoreNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const refreshActivePet = usePetStore(s => s.refreshActivePet);
  const queryClient = useQueryClient();

  const initialWeightUnit = getWeightUnit();
  const [name, setName] = useState(activePet?.name ?? '');
  const [gender, setGender] = useState<PetGender>(activePet?.gender ?? 'unknown');
  // A3: for kg keep full stored precision (no rounding drift); lb is derived.
  const [weightKg, setWeightKg] = useState(
    initialWeightUnit === 'kg'
      ? activePet?.weightKg != null && activePet.weightKg > 0
        ? activePet.weightKg.toString()
        : ''
      : kgToInput(activePet?.weightKg, initialWeightUnit)
  );
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>(initialWeightUnit);
  const [age, setAge] = useState(
    activePet?.birthYear ? String(new Date().getFullYear() - activePet.birthYear) : ''
  );
  const [diabetesType, setDiabetesType] = useState<DiabetesType>(
    activePet?.diabetesType ?? 'unknown'
  );
  const [diagnosisDate, setDiagnosisDate] = useState<Date | null>(
    activePet?.diagnosisDate ? new Date(activePet.diagnosisDate) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [insulinType, setInsulinType] = useState(activePet?.insulinType ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(activePet?.photoUri ?? null);
  const originalPhotoUri = useRef<string | null>(activePet?.photoUri ?? null);
  const handlePhotoPicked = (uri: string | null) => {
    // A picked-but-not-yet-saved photo being replaced is an orphan file
    if (photoUri && photoUri !== originalPhotoUri.current) void deletePetPhotoFile(photoUri);
    setPhotoUri(uri);
  };
  const [vetName, setVetName] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [injectionTimes, setInjectionTimes] = useState<string[]>([]);
  const [feedingTimes, setFeedingTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const initialLoaded = useRef(false);
  const disableGuard = useUnsavedChangesGuard(isDirty);

  const handleWeightUnitChange = (u: WeightUnit) => {
    if (u === weightUnit) return;
    setWeightKg(convertInput(weightKg, weightUnit, u));
    setWeightUnitState(u);
    setWeightUnit(u);
  };

  // Track changes after initial load
  useEffect(() => {
    if (initialLoaded.current) setIsDirty(true);
  }, [
    name,
    gender,
    weightKg,
    age,
    diabetesType,
    diagnosisDate,
    insulinType,
    photoUri,
    vetName,
    vetPhone,
    injectionTimes,
    feedingTimes,
  ]);

  useEffect(() => {
    if (!activePet) return;
    let cancelled = false;
    setVetName(storage.getString(vetNameKey(activePet.id)) ?? '');
    setVetPhone(storage.getString(vetPhoneKey(activePet.id)) ?? '');
    Promise.all([
      scheduleRepository.getInjectionTimes(activePet.id),
      scheduleRepository.getFeedingTimes(activePet.id),
    ]).then(([inj, feed]) => {
      if (cancelled) return;
      setInjectionTimes(inj.map(x => x.timeOfDay));
      setFeedingTimes(feed.map(x => x.timeOfDay));
      // Mark initial load done so dirty tracking starts after this
      setTimeout(() => {
        initialLoaded.current = true;
      }, 0);
    });
    return () => {
      cancelled = true;
    };
  }, [activePet]);

  const savingRef = useRef(false);

  const isValidTime = (time: string) => /^\d{1,2}:\d{2}$/.test(time);

  /** "8:30" → "08:30" so duplicates can't slip past the Set check and
   *  string ORDER BY time_of_day sorts chronologically. */
  const normalizeTime = (time: string) => {
    const [h, m] = time.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  };

  const handleSave = async () => {
    if (savingRef.current || !activePet) return;
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('pets.enterName'));
      return;
    }
    // Validate weight: if provided (non-empty AND non-zero), must be positive.
    // BUG-M005 (audit): "0" / "0.0" was rejected silently — instead treat
    // it as "no weight provided" and clear the field, so the user isn't
    // blocked by a value they typed but don't want.
    const weightTrimmed = weightKg.trim();
    if (weightTrimmed) {
      const rawNum = parseFloat(weightTrimmed.replace(',', '.'));
      const maxWeight = getSpeciesConfig(activePet.species).validation.maxWeightKg;
      if (rawNum === 0) {
        // treat as cleared
      } else {
        // A3: validate the kg-equivalent so lb entries are checked correctly.
        const wKg = inputToKg(weightTrimmed, weightUnit);
        if (wKg == null || wKg > maxWeight) {
          Alert.alert(t('common.error'), t('pets.invalidWeight'));
          return;
        }
      }
    }
    // Validate age (optional): 0..species max
    const ageTrimmed = age.trim();
    if (ageTrimmed) {
      const parsedAge = parseInt(ageTrimmed, 10);
      const maxAge = getSpeciesConfig(activePet.species).validation.maxAgeYears;
      if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > maxAge) {
        Alert.alert(t('common.error'), t('onboarding.ageInvalid'));
        return;
      }
    }
    // Validate all time entries are complete HH:MM format
    const allTimes = [...injectionTimes, ...feedingTimes];
    if (allTimes.some(t => !isValidTime(t))) {
      Alert.alert(t('common.error'), t('pets.invalidTimeFormat'));
      return;
    }
    // Normalize BEFORE the duplicate check — "8:30" and "08:30" are the
    // same alarm and must not both be saved.
    const normInjectionTimes = injectionTimes.map(normalizeTime);
    const normFeedingTimes = feedingTimes.map(normalizeTime);
    if (
      new Set(normInjectionTimes).size !== normInjectionTimes.length ||
      new Set(normFeedingTimes).size !== normFeedingTimes.length
    ) {
      Alert.alert(t('common.error'), t('onboarding.duplicateTime'));
      return;
    }
    savingRef.current = true;
    setLoading(true);
    try {
      // A3: inputToKg returns undefined for empty/0/invalid → stored as no weight.
      const parsedWeightKg = weightTrimmed ? inputToKg(weightTrimmed, weightUnit) : undefined;
      // UX-017 + M003: profile AND schedules are both SQLite — write them in
      // ONE transaction so a mid-save failure can't leave the profile updated
      // with the old schedule (the user sees "save error" and assumes nothing
      // was saved). MMKV vet contact goes after the commit: those writes are
      // synchronous and practically infallible.
      const db = await getDatabase();
      await db.withTransactionAsync(async () => {
        await petRepository.update(activePet.id, {
          name: name.trim(),
          gender,
          weightKg: parsedWeightKg,
          birthYear: ageTrimmed ? new Date().getFullYear() - parseInt(ageTrimmed, 10) : undefined,
          diabetesType,
          diagnosisDate: diagnosisDate ? toDateOnly(diagnosisDate) : undefined,
          insulinType: insulinType || undefined,
          // Key must be present even when null-ish so removal clears the column
          photoUri: photoUri ?? undefined,
        });
        const existingInjections = await scheduleRepository.getInjectionTimes(activePet.id);
        for (const s of existingInjections) await scheduleRepository.deleteInjectionTime(s.id);
        for (const time of normInjectionTimes)
          await scheduleRepository.addInjectionTime(activePet.id, time);
        const existingFeedings = await scheduleRepository.getFeedingTimes(activePet.id);
        for (const s of existingFeedings) await scheduleRepository.deleteFeedingTime(s.id);
        for (const time of normFeedingTimes)
          await scheduleRepository.addFeedingTime(activePet.id, time);
      });
      if (vetName) {
        storage.set(vetNameKey(activePet.id), vetName);
      } else {
        storage.delete(vetNameKey(activePet.id));
      }
      if (vetPhone) {
        storage.set(vetPhoneKey(activePet.id), vetPhone);
      } else {
        storage.delete(vetPhoneKey(activePet.id));
      }
      // Reschedule notifications after schedule changes. Rebuild for ALL pets
      // via restoreScheduleNotifications: the previous cancel-all + reschedule-
      // active-only left other pets without reminders until the next app
      // foreground. Condition is === true (not !== false): a missing flag means
      // the user never enabled notifications.
      if (storage.getBoolean(StorageKeys.NOTIFICATIONS_ENABLED) === true) {
        await restoreScheduleNotifications().catch(() => {});
      }
      // Photo replaced or removed → the old file is unreferenced now
      if (originalPhotoUri.current && originalPhotoUri.current !== photoUri) {
        void deletePetPhotoFile(originalPhotoUri.current);
      }
      originalPhotoUri.current = photoUri;
      await refreshActivePet();
      await queryClient.invalidateQueries({ queryKey: queryKeys.schedule.all });
      disableGuard();
      navigation.goBack();
    } catch {
      Alert.alert(t('pets.saveError'));
    } finally {
      savingRef.current = false;
      setLoading(false);
    }
  };

  const validateTime = (value: string): string => {
    const clean = value.replace(/[^0-9:]/g, '');
    const match = clean.match(/^(\d{1,2}):?(\d{0,2})$/);
    if (!match) return clean.slice(0, 5);
    let h = match[1],
      m = match[2];
    if (parseInt(h) > 23) h = '23';
    if (m && parseInt(m) > 59) m = '59';
    return m !== undefined && m !== '' ? `${h}:${m}` : `${h}:`;
  };

  const renderTimeList = (type: string, times: string[], setTimes: (t: string[]) => void) => (
    <View style={{ gap: 8 }}>
      {times.map((time, i) => (
        <View
          key={`time-${i}-${time}`}
          style={[
            styles.timeRow,
            { backgroundColor: theme.colors.surfaceSecondary, borderRadius: 12 },
          ]}
        >
          <Input
            value={time}
            onChangeText={v => {
              const n = [...times];
              n[i] = validateTime(v);
              setTimes(n);
            }}
            placeholder="HH:MM"
            maxLength={5}
            containerStyle={{ flex: 1 }}
          />
          <TouchableOpacity
            onPress={() => {
              if (times.length <= 1) {
                Alert.alert(
                  type === 'injection'
                    ? t('onboarding.minOneInjection')
                    : t('onboarding.minOneFeeding')
                );
                return;
              }
              setTimes(times.filter((_, idx) => idx !== i));
            }}
            style={{ padding: 12 }}
          >
            <Icon name="close-circle" size={24} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        style={[styles.addBtn, { borderColor: theme.colors.primary, borderRadius: 12 }]}
        onPress={() => {
          if (times.length >= MAX_SCHEDULE_TIMES) return;
          const existingSet = new Set(times);
          let newTime = '12:00';
          for (let h = 6; h < 24; h++) {
            const candidate = `${h.toString().padStart(2, '0')}:00`;
            if (!existingSet.has(candidate)) {
              newTime = candidate;
              break;
            }
          }
          setTimes([...times, newTime]);
        }}
      >
        <Text style={{ color: theme.colors.primary, fontFamily: theme.fonts.semibold }}>
          + {type === 'injection' ? t('pets.addInjection') : t('pets.addFeeding')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader title={t('pets.editPet')} onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.content}>
          {/* Pet photo — the cheapest, strongest emotional hook in a pet app
              (design audit 2026-07-17, "чего не хватает" №1) */}
          <View style={styles.photoSection}>
            <View style={[styles.photoCircle, { backgroundColor: theme.colors.primaryLight }]}>
              <PetAvatar
                photoUri={photoUri}
                species={activePet?.species}
                size={84}
                faceSize={44}
                faceColor={theme.colors.primary}
              />
            </View>
            <View style={styles.photoButtons}>
              <TouchableOpacity
                style={[styles.photoBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
                onPress={async () => {
                  const uri = await pickPetPhoto('gallery');
                  if (uri) handlePhotoPicked(uri);
                }}
              >
                <Icon name="images-outline" size={16} color={theme.colors.primary} />
                <Text style={[styles.photoBtnText, { color: theme.colors.text }]}>
                  {t('pets.photoGallery')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.photoBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
                onPress={async () => {
                  const uri = await pickPetPhoto('camera');
                  if (uri) handlePhotoPicked(uri);
                }}
              >
                <Icon name="camera-outline" size={16} color={theme.colors.primary} />
                <Text style={[styles.photoBtnText, { color: theme.colors.text }]}>
                  {t('pets.photoCamera')}
                </Text>
              </TouchableOpacity>
              {photoUri ? (
                <TouchableOpacity
                  style={[styles.photoBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
                  onPress={() => handlePhotoPicked(null)}
                >
                  <Icon name="trash-outline" size={16} color={theme.colors.danger} />
                  <Text style={[styles.photoBtnText, { color: theme.colors.danger }]}>
                    {t('pets.photoRemove')}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          <Input
            label={t('pets.name')}
            value={name}
            onChangeText={setName}
            placeholder={
              activePet?.species === 'dog'
                ? t('onboarding.petNamePlaceholderDog')
                : t('onboarding.petNamePlaceholder')
            }
            maxLength={50}
          />
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              {t('onboarding.petGender')}
            </Text>
            <View style={styles.row}>
              {(
                [
                  { value: 'male', label: t('common.male'), icon: 'mars' },
                  { value: 'female', label: t('common.female'), icon: 'venus' },
                ] as const
              ).map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.optionBtn,
                    {
                      backgroundColor:
                        gender === opt.value ? theme.colors.primary : theme.colors.surfaceSecondary,
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 6,
                    },
                  ]}
                  onPress={() => setGender(opt.value as PetGender)}
                >
                  <Icon
                    name={opt.icon}
                    size={16}
                    color={gender === opt.value ? '#fff' : theme.colors.text}
                  />
                  <Text
                    style={{
                      color: gender === opt.value ? '#fff' : theme.colors.text,
                      fontWeight: '600',
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 8 }}>
            <WeightUnitToggle unit={weightUnit} onChange={handleWeightUnitChange} />
          </View>
          <View style={styles.rowInputs}>
            <Input
              label={`${t('pets.weight')} (${t(`common.${weightUnit}`)})`}
              value={weightKg}
              onChangeText={setWeightKg}
              placeholder={activePet?.species === 'dog' ? '15' : '4.5'}
              keyboardType="decimal-pad"
              containerStyle={{ flex: 1 }}
            />
            <Input
              label={t('onboarding.petAge')}
              value={age}
              onChangeText={setAge}
              placeholder="5"
              keyboardType="number-pad"
              containerStyle={{ flex: 1 }}
              hint={t('onboarding.petAgeHint')}
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              {t('onboarding.diagnosisDate')}
            </Text>
            <TouchableOpacity
              style={[styles.dateBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={{
                  color: diagnosisDate ? theme.colors.text : theme.colors.placeholder,
                  padding: 14,
                }}
              >
                {diagnosisDate ? formatFullDateLocal(diagnosisDate) : t('onboarding.diagnosisDate')}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={diagnosisDate ?? new Date()}
                mode="date"
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) setDiagnosisDate(date);
                }}
                maximumDate={new Date()}
              />
            )}
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              {t('onboarding.diabetesType')}
            </Text>
            {(
              [
                { value: 'type1' as const, label: t('onboarding.diabetesType1') },
                { value: 'type2' as const, label: t('onboarding.diabetesType2') },
                { value: 'unknown' as const, label: t('onboarding.diabetesUnknown') },
              ] as const
            ).map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.radioRow,
                  {
                    borderColor:
                      diabetesType === opt.value ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setDiabetesType(opt.value)}
              >
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor:
                        diabetesType === opt.value ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  {diabetesType === opt.value && (
                    <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} />
                  )}
                </View>
                <Text style={[styles.radioLabel, { color: theme.colors.text }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Input
            label={t('pets.insulinType')}
            value={insulinType}
            onChangeText={setInsulinType}
            placeholder={t('glucose.insulinPlaceholder')}
          />
          <View style={styles.sectionHeader}>
            <Icon
              name="medkit-outline"
              size={20}
              color={theme.colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.text, fontFamily: theme.fonts.bold },
              ]}
            >
              {t('pets.injectionSchedule')}
            </Text>
          </View>
          {renderTimeList('injection', injectionTimes, setInjectionTimes)}
          <View style={styles.sectionHeader}>
            <Icon
              name="restaurant-outline"
              size={20}
              color={theme.colors.warning}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.text, fontFamily: theme.fonts.bold },
              ]}
            >
              {t('pets.feedingSchedule')}
            </Text>
          </View>
          {renderTimeList('feeding', feedingTimes, setFeedingTimes)}
          <View style={styles.sectionHeader}>
            <Icon
              name="medical-outline"
              size={20}
              color={theme.colors.success}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.text, fontFamily: theme.fonts.bold },
              ]}
            >
              {t('pets.vetContact')}
            </Text>
          </View>
          <Input
            label={t('onboarding.vetName')}
            value={vetName}
            onChangeText={setVetName}
            placeholder={t('onboarding.vetNamePlaceholder')}
          />
          <Input
            label={t('onboarding.vetPhone')}
            value={vetPhone}
            onChangeText={setVetPhone}
            placeholder={t('onboarding.vetPhonePlaceholder')}
            keyboardType="phone-pad"
          />
          <Button
            title={t('common.save')}
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
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  photoSection: { alignItems: 'center', gap: 12, marginBottom: 4 },
  photoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minHeight: 36,
  },
  photoBtnText: { fontSize: 13, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  sectionTitle: { fontSize: 16 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  addBtn: { padding: 14, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center' },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '500' },
  row: { flexDirection: 'row', gap: 12 },
  rowInputs: { flexDirection: 'row', gap: 12 },
  optionBtn: { padding: 14, borderRadius: 12, alignItems: 'center' },
  dateBtn: { borderRadius: 12, overflow: 'hidden' },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 12,
    marginTop: 6,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  radioLabel: { fontSize: 15 },
});
