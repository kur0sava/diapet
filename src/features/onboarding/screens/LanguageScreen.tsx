import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@shared/components/ui/Icon';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useOnboardingNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@shared/i18n';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { useTheme } from '@shared/theme';
import { Button } from '@shared/components/ui';
import {
  getAppRegion,
  setAppRegion,
  getRegionDefaults,
  VALID_REGIONS,
  type Region,
} from '@shared/config/regionConfig';

const LANGUAGES = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺', subtitle: 'Russian' },
  { code: 'en', label: 'English', flag: '🇬🇧', subtitle: 'Английский' },
];

export default function LanguageScreen() {
  const navigation = useOnboardingNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [selected, setSelected] = useState<'ru' | 'en'>(
    storage.getString(StorageKeys.LANGUAGE) === 'en' ? 'en' : 'ru'
  );
  // C4 (audit): region was silently auto-detected from locale and only
  // changeable deep in Settings — yet it drives the DEFAULT glucose unit and
  // food catalog. Surface it here (pre-filled from the device) so a user on a
  // mismatched locale (e.g. RU speaker on an en-US phone) can correct it before
  // it quietly sets mg/dL. Language stays the user's explicit choice above.
  const [region, setRegion] = useState<Region>(getAppRegion());

  const handleRegionChange = (r: Region) => {
    setRegion(r);
    setAppRegion(r);
    // Onboarding isn't complete yet → these are still defaults, safe to update.
    const d = getRegionDefaults(r);
    storage.set(StorageKeys.GLUCOSE_UNIT, d.glucoseUnit);
    storage.set(StorageKeys.WEIGHT_UNIT, d.weightUnit);
  };

  const handleContinue = () => {
    changeLanguage(selected);
    navigation.navigate('PetInfo');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      <Animated.View entering={FadeInDown.duration(600)} style={styles.content}>
        <View style={styles.header}>
          <LinearGradient
            colors={theme.gradients.primary as [string, string]}
            style={styles.logoGradient}
          >
            <Icon name="paw" size={40} color="#fff" />
          </LinearGradient>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
            DiaPet
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary, fontFamily: theme.fonts.medium },
            ]}
          >
            {t('onboarding.selectLanguage')}
          </Text>
        </View>

        <View style={styles.languages}>
          {LANGUAGES.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: selected === lang.code ? theme.colors.primary : 'transparent',
                  borderWidth: 2,
                  ...theme.shadows.md,
                },
              ]}
              onPress={() => {
                const code = lang.code as 'ru' | 'en';
                setSelected(code);
                // Apply immediately so the screen (and the Next button) switch
                // language on tap, not only after Continue.
                changeLanguage(code);
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={lang.label}
              accessibilityState={{ selected: selected === lang.code }}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <View>
                <Text
                  style={[
                    styles.langLabel,
                    { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                  ]}
                >
                  {lang.label}
                </Text>
                <Text
                  style={[
                    styles.langSub,
                    { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular },
                  ]}
                >
                  {lang.subtitle}
                </Text>
              </View>
              {selected === lang.code && (
                <View style={[styles.check, { backgroundColor: theme.colors.primary }]}>
                  <Icon name="checkmark" size={18} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text
          style={[
            styles.regionTitle,
            { color: theme.colors.textSecondary, fontFamily: theme.fonts.medium },
          ]}
        >
          {t('onboarding.selectRegion')}
        </Text>
        <View style={styles.regions}>
          {VALID_REGIONS.map(r => (
            <TouchableOpacity
              key={r}
              onPress={() => handleRegionChange(r)}
              style={[
                styles.regionChip,
                {
                  backgroundColor: region === r ? theme.colors.primary : theme.colors.surface,
                  borderColor: region === r ? theme.colors.primary : theme.colors.border,
                },
              ]}
              activeOpacity={0.8}
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

        <Button
          title={t('onboarding.next')}
          onPress={handleContinue}
          fullWidth
          size="lg"
          style={{ marginTop: 24 }}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 48 },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 32, marginBottom: 8 },
  subtitle: { fontSize: 18 },
  languages: { gap: 12 },
  regionTitle: { fontSize: 14, marginTop: 28, marginBottom: 10, textAlign: 'center' },
  regions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  regionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1 },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  flag: { fontSize: 36 },
  langLabel: { fontSize: 18 },
  langSub: { fontSize: 13, marginTop: 2 },
  check: {
    marginLeft: 'auto',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
