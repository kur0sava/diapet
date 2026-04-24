import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useOnboardingNavigation } from '@navigation/hooks';
import type { OnboardingStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button } from '@shared/components/ui';
import { Icon } from '@shared/components/ui/Icon';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { petRepository, scheduleRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { useNotifications } from '@shared/hooks/useNotifications';

export default function NotificationsScreen() {
  const navigation = useOnboardingNavigation();
  const route = useRoute<RouteProp<OnboardingStackParamList, 'Notifications'>>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { requestPermissions, scheduleInjectionReminder, scheduleFeedingReminder } =
    useNotifications();
  const [loading, setLoading] = useState(false);

  const { petData, injectionTimes, feedingTimes, vetName, vetPhone } = route.params ?? {};

  const handleFinish = async (enableNotifications: boolean) => {
    setLoading(true);
    // Step 1: persist pet + schedules. If any DB op fails, roll back the pet
    // so the next onboarding attempt doesn't leave an orphan row.
    let pet: Awaited<ReturnType<typeof petRepository.create>>;
    try {
      pet = await petRepository.create({
        name: petData.name,
        gender: petData.gender,
        weightKg: petData.weightKg,
        birthYear: petData.birthYear,
        diabetesType: petData.diabetesType,
        diagnosisDate: petData.diagnosisDate,
        species: petData.species,
      });
      try {
        for (const time of injectionTimes ?? []) {
          await scheduleRepository.addInjectionTime(pet.id, time);
        }
        for (const time of feedingTimes ?? []) {
          await scheduleRepository.addFeedingTime(pet.id, time);
        }
      } catch (scheduleErr) {
        // Rollback: orphaned pet would be picked up on next cold start AND the
        // user would redo onboarding, producing duplicate pets. Delete now.
        await petRepository.delete(pet.id).catch(() => {});
        throw scheduleErr;
      }
    } catch {
      Alert.alert(t('common.error'), t('onboarding.savingError'));
      setLoading(false);
      return;
    }

    // Step 2: commit point — after these writes, ONBOARDING_COMPLETE is true
    // and we will NEVER re-run onboarding for this install. Everything below
    // must tolerate failure without leaving onboarding in a half-done state.
    if (vetName) storage.set(StorageKeys.VET_NAME, vetName);
    if (vetPhone) storage.set(StorageKeys.VET_PHONE, vetPhone);
    storage.set(StorageKeys.ACTIVE_PET_ID, pet.id);
    storage.set(StorageKeys.ACTIVE_SPECIES, pet.species);
    storage.set(StorageKeys.NOTIFICATIONS_ENABLED, false);
    storage.set(StorageKeys.HINTS_REGISTRATION_DATE, new Date().toISOString());
    storage.set(StorageKeys.ONBOARDING_COMPLETE, true);
    storage.delete(StorageKeys.ONBOARDING_DRAFT);

    // Step 3: best-effort side effects. Notification permission / OS scheduling
    // can throw (denied, expo push quota, malformed time). Failing here must
    // NOT abort onboarding — user can re-enable notifications in Settings.
    if (enableNotifications) {
      try {
        const granted = await requestPermissions();
        storage.set(StorageKeys.NOTIFICATIONS_ENABLED, granted);
        if (granted) {
          for (const time of injectionTimes ?? []) {
            await scheduleInjectionReminder(time, pet.name);
          }
          for (const time of feedingTimes ?? []) {
            await scheduleFeedingReminder(time, pet.name);
          }
        }
      } catch {
        // Silent — user can toggle notifications in Settings later.
      }
    }

    try {
      await usePetStore.getState().loadPets();
    } catch {
      // petStore hydration failure is recoverable on next screen mount.
    }

    setLoading(false);
    navigation.navigate('Success', { petName: pet.name });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={{ color: theme.colors.primary, fontSize: 16 }}>← {t('common.back')}</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Icon
          name="notifications-outline"
          size={72}
          color={theme.colors.primary}
          style={{ marginBottom: 24 }}
        />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('onboarding.setupNotifications')}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {t('onboarding.notificationsDesc')}
        </Text>

        <View style={styles.features}>
          {[
            t('onboarding.notifInjections'),
            t('onboarding.notifFeedings'),
            t('onboarding.notifGlucose'),
          ].map(feature => (
            <View
              key={feature}
              style={[
                styles.featureRow,
                { backgroundColor: theme.colors.surface, borderRadius: 12 },
              ]}
            >
              <Text style={[styles.featureText, { color: theme.colors.text }]}>{feature}</Text>
            </View>
          ))}
        </View>

        <Button
          title={t('onboarding.allowNotifications')}
          onPress={() => handleFinish(true)}
          fullWidth
          size="lg"
          loading={loading}
          style={{ marginBottom: 12 }}
        />
        <Button
          title={t('onboarding.skip')}
          onPress={() => handleFinish(false)}
          variant="ghost"
          fullWidth
          disabled={loading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    paddingHorizontal: 24,
    paddingTop: 16,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 40 },
  features: { width: '100%', gap: 10, marginBottom: 40 },
  featureRow: { padding: 16 },
  featureText: { fontSize: 15, fontWeight: '500' },
});
