import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ToastAndroid,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMoreNavigation, useRootNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme, ColorScheme } from '@shared/theme';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { changeLanguage } from '@shared/i18n';
import { Card, Icon, ScreenHeader } from '@shared/components/ui';
import { getDatabase } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import * as Notifications from 'expo-notifications';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@shared/utils/queryKeys';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { isAnalyticsEnabled, setAnalyticsOptOut } from '@shared/analytics/analytics';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@shared/config/legal';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  useNotifications,
  scheduleGlucoseReminders,
  cancelGlucoseReminders,
  getGlucoseReminderTimes,
  MAX_GLUCOSE_REMINDER_TIMES,
} from '@shared/hooks/useNotifications';
import {
  getAppRegion,
  setAppRegion,
  VALID_REGIONS,
  type Region,
} from '@shared/config/regionConfig';

export default function SettingsScreen() {
  const navigation = useMoreNavigation();
  const rootNavigation = useRootNavigation();
  const { t, i18n } = useTranslation();
  const { theme, colorScheme, setColorScheme } = useTheme();
  const queryClient = useQueryClient();

  // UX-M6 (audit): subscribe to i18n.language so the active-language pill
  // updates immediately when the user taps the other language. Reading from
  // MMKV at mount only would leave both pills inactive after a switch.
  const currentLanguage = i18n.language?.startsWith('ru') ? 'ru' : 'en';
  const [glucoseUnit, setGlucoseUnit] = useState(
    () => storage.getString(StorageKeys.GLUCOSE_UNIT) ?? 'mmol/L'
  );
  const [hintsEnabled, setHintsEnabled] = useState(
    () => !storage.getBoolean(StorageKeys.HINTS_DISABLED)
  );
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => isAnalyticsEnabled());
  const [region, setRegion] = useState<Region>(() => getAppRegion());
  const { requestPermissions } = useNotifications();
  const [glucoseReminderEnabled, setGlucoseReminderEnabled] = useState(
    () => storage.getBoolean(StorageKeys.GLUCOSE_REMINDER_ENABLED) === true
  );
  const [glucoseReminderTimes, setGlucoseReminderTimes] = useState<string[]>(() =>
    getGlucoseReminderTimes()
  );
  const [showReminderPicker, setShowReminderPicker] = useState(false);

  const handleGlucoseReminderToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(t('common.error'), t('settings.glucoseReminderPermission'));
        return;
      }
      storage.set(StorageKeys.GLUCOSE_REMINDER_ENABLED, true);
      setGlucoseReminderEnabled(true);
      await scheduleGlucoseReminders().catch(() => {});
    } else {
      storage.set(StorageKeys.GLUCOSE_REMINDER_ENABLED, false);
      setGlucoseReminderEnabled(false);
      await cancelGlucoseReminders().catch(() => {});
    }
  };

  const persistReminderTimes = async (times: string[]) => {
    const sorted = [...new Set(times)].sort();
    if (sorted.length === 0) return;
    setGlucoseReminderTimes(sorted);
    storage.set(StorageKeys.GLUCOSE_REMINDER_TIMES, JSON.stringify(sorted));
    if (glucoseReminderEnabled) {
      await scheduleGlucoseReminders().catch(() => {});
    }
  };

  const handleDeleteAllData = () => {
    // UX-015: First confirmation with explicit irreversibility warning
    Alert.alert(t('settings.deleteDataConfirm'), t('settings.deleteDataIrreversible'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          // UX-015: Second confirmation — double confirm for irreversible action
          Alert.alert(t('settings.deleteDataFinal'), t('settings.deleteDataFinalWarning'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('settings.deleteForever'),
              style: 'destructive',
              onPress: async () => {
                try {
                  const db = await getDatabase();
                  await db.withTransactionAsync(async () => {
                    await db.execAsync(
                      'DELETE FROM symptom_entry_types; DELETE FROM symptoms; DELETE FROM glucose_readings; DELETE FROM injections; DELETE FROM feedings; DELETE FROM expenses; DELETE FROM weight_entries; DELETE FROM injection_schedule; DELETE FROM feeding_schedule; DELETE FROM pets;'
                    );
                  });
                  // C001: delete only data keys, preserve user preferences (language, theme, glucose unit)
                  storage.delete(StorageKeys.ACTIVE_PET_ID);
                  storage.delete(StorageKeys.NOTIFICATIONS_ENABLED);
                  storage.delete(StorageKeys.GLUCOSE_REMINDER_ENABLED);
                  storage.delete(StorageKeys.GLUCOSE_REMINDER_TIMES);
                  storage.delete(StorageKeys.VET_NAME);
                  storage.delete(StorageKeys.VET_PHONE);
                  // Must clear ACTIVE_SPECIES — ThemeContext falls back to this MMKV
                  // key when petStore is empty (e.g. on cold start after reset). If
                  // it lingers, a user who resets from 'dog' then re-onboards as 'cat'
                  // would briefly see the dog (amber) theme before onboarding picks.
                  storage.delete(StorageKeys.ACTIVE_SPECIES);
                  storage.delete(StorageKeys.LAST_BACKUP);
                  storage.delete(StorageKeys.BOOKMARKED_ARTICLES);
                  storage.delete(StorageKeys.SUBSCRIPTION_CACHED_PRO);
                  storage.delete(StorageKeys.SUBSCRIPTION_EXPIRES_AT);
                  storage.delete('subscriptionCachedAt');
                  storage.delete('subscriptionPlan');
                  storage.delete(StorageKeys.ONBOARDING_DRAFT);
                  // Clean up hints-related keys so hints system resets properly
                  storage.delete(StorageKeys.HINTS_REGISTRATION_DATE);
                  // UX-C3 (audit): trial start timestamp must be wiped or
                  // re-onboarding hits the idempotent guard in startTrial()
                  // and the user appears to have an already-expired trial
                  // (or 0 days left if the install is more than a week old).
                  storage.delete(StorageKeys.TRIAL_STARTED_AT);
                  // Sweep onboarding-side counters too — first-steps badges
                  // and expense budget are anchored to the previous account.
                  storage.delete(StorageKeys.FIRST_STEPS_DISMISSED);
                  storage.delete(StorageKeys.FIRST_STEPS_COMPLETED_AT);
                  storage.delete(StorageKeys.EXPENSE_BUDGET_MONTHLY);
                  storage.delete(StorageKeys.HINTS_SHOWN_IDS);
                  storage.delete(StorageKeys.HINTS_INJECTION_COUNT);
                  storage.delete(StorageKeys.HINTS_LAST_APP_OPEN_DATE);
                  storage.delete(StorageKeys.HINTS_ACHIEVEMENT_SHOWN);
                  storage.delete(StorageKeys.HINTS_PUSH_SHOWN_IDS);
                  storage.delete(StorageKeys.HINTS_PUSH_LAST_SCHEDULED);
                  storage.delete(StorageKeys.ACHIEVEMENTS_UNLOCKED);
                  storage.delete(StorageKeys.EVENT_HINTS_SHOWN_IDS);
                  storage.delete('hintsMissedCheckDate');
                  // Smart-alert throttling must reset with the data it was
                  // computed from, or the fresh pet inherits old cooldowns
                  storage.delete('analyzer_alert_history');
                  storage.delete('analyzer_alerts_today');
                  // Clean up AI chat history, daily limits, prediction cache, and
                  // per-pet vet contacts for all pets
                  const allKeys = storage.getAllKeys();
                  for (const key of allKeys) {
                    if (
                      key.startsWith('aiChatHistory_') ||
                      key.startsWith('aiChatDaily') ||
                      key.startsWith('predictionCache_') ||
                      key.startsWith('predictionLastRequest_') ||
                      key.startsWith('remissionCache_') ||
                      key.startsWith('remissionLastRequest_') ||
                      key.startsWith('vetName_') ||
                      key.startsWith('vetPhone_') ||
                      key.startsWith('foodsSeen_') ||
                      key.startsWith('eventHintDate_')
                    ) {
                      storage.delete(key);
                    }
                  }
                  // H006: cancel all scheduled notifications for deleted pets
                  await Notifications.cancelAllScheduledNotificationsAsync();
                  // H007: clear React Query cache so stale data is not shown
                  queryClient.clear();
                  // Reset onboarding flag so user goes through setup again
                  storage.delete(StorageKeys.ONBOARDING_COMPLETE);
                  usePetStore.setState({ pets: [], activePet: null });
                  // Navigate to Onboarding, resetting the stack
                  rootNavigation.dispatch(
                    CommonActions.reset({ index: 0, routes: [{ name: 'Onboarding' }] })
                  );
                } catch {
                  Alert.alert(t('common.error'));
                }
              },
            },
          ]);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title={t('settings.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
          {t('settings.appearance')}
        </Text>
        <Card style={styles.card}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            {t('settings.theme')}
          </Text>
          <View style={styles.themeRow}>
            {(['light', 'dark', 'system'] as ColorScheme[]).map(s => {
              const labels = {
                light: t('settings.lightMode'),
                dark: t('settings.darkMode'),
                system: t('settings.systemMode'),
              };
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.themeBtn,
                    {
                      backgroundColor:
                        colorScheme === s ? theme.colors.primary : theme.colors.surfaceSecondary,
                    },
                  ]}
                  onPress={() => setColorScheme(s)}
                >
                  <Text
                    style={{
                      color: colorScheme === s ? '#fff' : theme.colors.text,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {labels[s]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
          {t('settings.languageSection')}
        </Text>
        <Card style={styles.card}>
          <View style={styles.langRow}>
            {(['ru', 'en'] as const).map(lang => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.langBtn,
                  {
                    backgroundColor:
                      currentLanguage === lang
                        ? theme.colors.primary
                        : theme.colors.surfaceSecondary,
                    flex: 1,
                  },
                ]}
                onPress={() => changeLanguage(lang)}
              >
                <Text
                  style={{
                    color: currentLanguage === lang ? '#fff' : theme.colors.text,
                    fontWeight: '600',
                  }}
                >
                  {lang === 'ru' ? '🇷🇺 Русский' : '🇬🇧 English'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
          {t('settings.glucoseUnitsSection')}
        </Text>
        <Card style={styles.card}>
          <View style={styles.langRow}>
            {(['mmol/L', 'mg/dL'] as const).map(unit => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.langBtn,
                  {
                    backgroundColor:
                      glucoseUnit === unit ? theme.colors.primary : theme.colors.surfaceSecondary,
                    flex: 1,
                  },
                ]}
                onPress={() => {
                  storage.set(StorageKeys.GLUCOSE_UNIT, unit);
                  setGlucoseUnit(unit);
                  queryClient.invalidateQueries({ queryKey: queryKeys.glucose.all });
                  // D6 (audit): confirm the change (was silent — only a highlight).
                  if (Platform.OS === 'android') {
                    ToastAndroid.show(t('settings.unitChanged', { unit }), ToastAndroid.SHORT);
                  }
                }}
              >
                <Text
                  style={{
                    color: glucoseUnit === unit ? '#fff' : theme.colors.text,
                    fontWeight: '600',
                  }}
                >
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
          {t('settings.regionSection')}
        </Text>
        <Card style={styles.card}>
          <View style={styles.regionGrid}>
            {VALID_REGIONS.map(r => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.regionBtn,
                  {
                    backgroundColor:
                      region === r ? theme.colors.primary : theme.colors.surfaceSecondary,
                  },
                ]}
                onPress={() => {
                  setAppRegion(r);
                  setRegion(r);
                  // D6 (audit): confirm the region switch (catalog/currency).
                  if (Platform.OS === 'android') {
                    ToastAndroid.show(
                      t('settings.regionChanged', { region: t(`feedGuide.regions.${r}`) }),
                      ToastAndroid.SHORT
                    );
                  }
                }}
              >
                <Text
                  style={{
                    color: region === r ? '#fff' : theme.colors.text,
                    fontSize: 13,
                    fontWeight: '600',
                  }}
                >
                  {t(`feedGuide.regions.${r}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.hintDesc, { color: theme.colors.textTertiary }]}>
            {t('settings.regionDescription')}
          </Text>
        </Card>
        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
          {t('settings.remindersSection')}
        </Text>
        <Card style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text, flex: 1 }]}>
              {t('settings.glucoseReminder')}
            </Text>
            <Switch
              value={glucoseReminderEnabled}
              onValueChange={v => {
                void handleGlucoseReminderToggle(v);
              }}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
          {glucoseReminderEnabled && (
            <View style={styles.reminderTimesRow}>
              {glucoseReminderTimes.map(time => (
                <View
                  key={time}
                  style={[styles.reminderChip, { backgroundColor: theme.colors.surfaceSecondary }]}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 14 }}>
                    {time}
                  </Text>
                  {glucoseReminderTimes.length > 1 && (
                    <TouchableOpacity
                      onPress={() => {
                        void persistReminderTimes(glucoseReminderTimes.filter(x => x !== time));
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                      accessibilityRole="button"
                      accessibilityLabel={t('settings.glucoseReminderRemove', { time })}
                    >
                      <Icon name="close-circle" size={18} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {glucoseReminderTimes.length < MAX_GLUCOSE_REMINDER_TIMES && (
                <TouchableOpacity
                  style={[
                    styles.reminderChip,
                    { borderWidth: 1, borderColor: theme.colors.primary },
                  ]}
                  onPress={() => setShowReminderPicker(true)}
                  accessibilityRole="button"
                >
                  <Text style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 14 }}>
                    {t('settings.glucoseReminderAddTime')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {showReminderPicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour
              onChange={(_, date) => {
                setShowReminderPicker(false);
                if (date) {
                  const hh = date.getHours().toString().padStart(2, '0');
                  const mm = date.getMinutes().toString().padStart(2, '0');
                  void persistReminderTimes([...glucoseReminderTimes, `${hh}:${mm}`]);
                }
              }}
            />
          )}
          <Text style={[styles.hintDesc, { color: theme.colors.textTertiary }]}>
            {t('settings.glucoseReminderDescription')}
          </Text>
        </Card>
        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
          {t('settings.hintsSection')}
        </Text>
        <Card style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text, flex: 1 }]}>
              {t('settings.showHints')}
            </Text>
            <Switch
              value={hintsEnabled}
              onValueChange={v => {
                setHintsEnabled(v);
                storage.set(StorageKeys.HINTS_DISABLED, !v);
              }}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <Text style={[styles.hintDesc, { color: theme.colors.textTertiary }]}>
            {t('settings.hintsDescription')}
          </Text>
        </Card>
        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
          {t('settings.privacySection')}
        </Text>
        <Card style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text, flex: 1 }]}>
              {t('settings.analyticsToggle')}
            </Text>
            <Switch
              value={analyticsEnabled}
              onValueChange={v => {
                setAnalyticsEnabled(v);
                setAnalyticsOptOut(!v).catch(() => {});
              }}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <Text style={[styles.hintDesc, { color: theme.colors.textTertiary }]}>
            {t('settings.analyticsDescription')}
          </Text>
          <View style={[styles.legalDivider, { backgroundColor: theme.colors.border }]} />
          <TouchableOpacity
            style={styles.legalRow}
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL).catch(() => {})}
          >
            <Icon name="shield-checkmark-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.legalLink, { color: theme.colors.primary }]}>
              {t('settings.privacyPolicy')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.legalRow}
            onPress={() => Linking.openURL(TERMS_OF_SERVICE_URL).catch(() => {})}
          >
            <Icon name="document-text-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.legalLink, { color: theme.colors.primary }]}>
              {t('settings.termsOfUse')}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.hintDesc, { color: theme.colors.textTertiary }]}>
            {t('settings.medicalDisclaimer')}
          </Text>
        </Card>
        <Text style={[styles.sectionHeader, { color: theme.colors.danger }]}>
          {t('settings.dangerZone')}
        </Text>
        <Card style={styles.card}>
          <TouchableOpacity
            style={[
              styles.dangerBtn,
              {
                borderColor: theme.colors.danger,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
              },
            ]}
            onPress={handleDeleteAllData}
          >
            <Icon name="trash-outline" size={18} color={theme.colors.danger} />
            <Text style={[styles.dangerText, { color: theme.colors.danger }]}>
              {t('settings.deleteData')}
            </Text>
          </TouchableOpacity>
        </Card>
        <Text style={[styles.version, { color: theme.colors.textTertiary }]}>
          DiaPet v{Constants.expoConfig?.version ?? '1.0.0'} · React Native + Expo
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  card: { gap: 12 },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  legalDivider: { height: StyleSheet.hairlineWidth, marginTop: 4 },
  legalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 },
  legalLink: { fontSize: 14, fontWeight: '600' },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeBtn: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center' },
  langRow: { flexDirection: 'row', gap: 10 },
  langBtn: { padding: 14, borderRadius: 12, alignItems: 'center' },
  regionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  regionBtn: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reminderTimesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reminderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  hintDesc: { fontSize: 12, lineHeight: 16 },
  dangerBtn: { padding: 14, borderRadius: 12, borderWidth: 1.5, alignItems: 'center' },
  dangerText: { fontSize: 15, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 12, marginTop: 20 },
});
