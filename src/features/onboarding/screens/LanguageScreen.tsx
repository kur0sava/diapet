import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useOnboardingNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@shared/i18n';
import { useTheme } from '@shared/theme';
import { Button } from '@shared/components/ui';

const LANGUAGES = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺', subtitle: 'Russian' },
  { code: 'en', label: 'English', flag: '🇬🇧', subtitle: 'Английский' },
];

export default function LanguageScreen() {
  const navigation = useOnboardingNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [selected, setSelected] = useState<'ru' | 'en'>('ru');

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
            <Ionicons name="paw" size={40} color="#fff" />
          </LinearGradient>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>DiaPet</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: theme.fonts.medium }]}>
            {t('onboarding.selectLanguage')}
          </Text>
        </View>

        <View style={styles.languages}>
          {LANGUAGES.map((lang) => (
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
              onPress={() => setSelected(lang.code as 'ru' | 'en')}
              activeOpacity={0.8}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <View>
                <Text style={[styles.langLabel, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>{lang.label}</Text>
                <Text style={[styles.langSub, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>{lang.subtitle}</Text>
              </View>
              {selected === lang.code && (
                <View style={[styles.check, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={t('onboarding.next')}
          onPress={handleContinue}
          fullWidth
          size="lg"
          style={{ marginTop: 32 }}
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
