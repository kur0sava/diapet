import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useOnboardingNavigation, useRootNavigation } from '@navigation/hooks';
import type { OnboardingStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button } from '@shared/components/ui';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { petRepository, scheduleRepository } from '@storage/database';
import { useNotifications } from '@shared/hooks/useNotifications';

export default function NotificationsScreen() {
  const navigation = useOnboardingNavigation();
  const rootNavigation = useRootNavigation();
  const route = useRoute<RouteProp<OnboardingStackParamList, 'Notifications'>>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { requestPermissions, scheduleInjectionReminder, scheduleFeedingReminder } = useNotifications();
  const [loading, setLoading] = useState(false);

  const { petData, injectionTimes, feedingTimes, vetName, vetPhone } = route.params ?? {};

  const handleFinish = async (enableNotifications: boolean) => {
    setLoading(true);
    try {
      // Create pet
      const pet = await petRepository.create({
        name: petData.name,
        gender: petData.gender,
        weightKg: petData.weightKg,
        birthYear: petData.birthYear,
        diabetesType: petData.diabetesType,
        diagnosisDate: petData.diagnosisDate,
        species: 'cat',
      });

      // Save schedules
      for (const time of (injectionTimes ?? [])) {
        await scheduleRepository.addInjectionTime(pet.id, time);
      }
      for (const time of (feedingTimes ?? [])) {
        await scheduleRepository.addFeedingTime(pet.id, time);
      }

      // Save vet contact
      if (vetName) storage.set('vetName', vetName);
      if (vetPhone) storage.set('vetPhone', vetPhone);

      // Notifications
      if (enableNotifications) {
        const granted = await requestPermissions();
        if (granted) {
          for (const time of (injectionTimes ?? [])) {
            await scheduleInjectionReminder(time, pet.name);
          }
          for (const time of (feedingTimes ?? [])) {
            await scheduleFeedingReminder(time, pet.name);
          }
        }
      }

      // Mark onboarding complete
      storage.set(StorageKeys.ACTIVE_PET_ID, pet.id);
      storage.set(StorageKeys.ONBOARDING_COMPLETE, true);

      // Navigate to main app
      rootNavigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error) {
      Alert.alert(t('common.error'), t('onboarding.savingError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🔔</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('onboarding.setupNotifications')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {t('onboarding.notificationsDesc')}
        </Text>

        <View style={styles.features}>
          {[t('onboarding.notifInjections'), t('onboarding.notifFeedings'), t('onboarding.notifGlucose')].map((feature, i) => (
            <View key={i} style={[styles.featureRow, { backgroundColor: theme.colors.surface, borderRadius: 12 }]}>
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
  content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 72, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 40 },
  features: { width: '100%', gap: 10, marginBottom: 40 },
  featureRow: { padding: 16 },
  featureText: { fontSize: 15, fontWeight: '500' },
});
