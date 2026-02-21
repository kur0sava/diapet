import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMoreNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme, ColorScheme } from '@shared/theme';
import { storage, StorageKeys, storageUtils } from '@storage/mmkv/storage';
import { changeLanguage } from '@shared/i18n';
import { Card } from '@shared/components/ui';

export default function SettingsScreen() {
  const navigation = useMoreNavigation();
  const { t } = useTranslation();
  const { theme, colorScheme, setColorScheme } = useTheme();

  const currentLanguage = storage.getString(StorageKeys.LANGUAGE) ?? 'ru';
  const glucoseUnit = storage.getString(StorageKeys.GLUCOSE_UNIT) ?? 'mmol/L';

  const handleDeleteAllData = () => {
    Alert.alert(t('settings.deleteDataConfirm'), t('settings.deleteDataWarning'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => { storageUtils.clear(); Alert.alert(t('settings.dataDeleted'), t('settings.restartApp')); }},
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ color: theme.colors.primary }}>← {t('common.back')}</Text></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('settings.title')}</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>{t('settings.appearance')}</Text>
        <Card style={styles.card}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('settings.theme')}</Text>
          <View style={styles.themeRow}>
            {(['light', 'dark', 'system'] as ColorScheme[]).map(s => {
              const labels = { light: t('settings.lightMode'), dark: t('settings.darkMode'), system: t('settings.systemMode') };
              return (
                <TouchableOpacity key={s} style={[styles.themeBtn, { backgroundColor: colorScheme === s ? theme.colors.primary : theme.colors.surfaceSecondary }]} onPress={() => setColorScheme(s)}>
                  <Text style={{ color: colorScheme === s ? '#fff' : theme.colors.text, fontSize: 12, fontWeight: '600' }}>{labels[s]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>{t('settings.languageSection')}</Text>
        <Card style={styles.card}>
          <View style={styles.langRow}>
            {(['ru', 'en'] as const).map(lang => (
              <TouchableOpacity key={lang} style={[styles.langBtn, { backgroundColor: currentLanguage === lang ? theme.colors.primary : theme.colors.surfaceSecondary, flex: 1 }]} onPress={() => changeLanguage(lang)}>
                <Text style={{ color: currentLanguage === lang ? '#fff' : theme.colors.text, fontWeight: '600' }}>{lang === 'ru' ? '🇷🇺 Русский' : '🇬🇧 English'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>{t('settings.glucoseUnitsSection')}</Text>
        <Card style={styles.card}>
          <View style={styles.langRow}>
            {(['mmol/L', 'mg/dL'] as const).map(unit => (
              <TouchableOpacity key={unit} style={[styles.langBtn, { backgroundColor: glucoseUnit === unit ? theme.colors.primary : theme.colors.surfaceSecondary, flex: 1 }]} onPress={() => storage.set(StorageKeys.GLUCOSE_UNIT, unit)}>
                <Text style={{ color: glucoseUnit === unit ? '#fff' : theme.colors.text, fontWeight: '600' }}>{unit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
        <Text style={[styles.sectionHeader, { color: theme.colors.danger }]}>{t('settings.dangerZone')}</Text>
        <Card style={styles.card}>
          <TouchableOpacity style={[styles.dangerBtn, { borderColor: theme.colors.danger }]} onPress={handleDeleteAllData}>
            <Text style={[styles.dangerText, { color: theme.colors.danger }]}>🗑 {t('settings.deleteData')}</Text>
          </TouchableOpacity>
        </Card>
        <Text style={[styles.version, { color: theme.colors.textTertiary }]}>DiaPet v1.0.0 · React Native + Expo</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  sectionHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginTop: 16, marginBottom: 6, paddingHorizontal: 4 },
  card: { gap: 12 },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeBtn: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center' },
  langRow: { flexDirection: 'row', gap: 10 },
  langBtn: { padding: 14, borderRadius: 12, alignItems: 'center' },
  dangerBtn: { padding: 14, borderRadius: 12, borderWidth: 1.5, alignItems: 'center' },
  dangerText: { fontSize: 15, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 12, marginTop: 20 },
});
