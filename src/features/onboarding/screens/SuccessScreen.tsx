import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useRootNavigation } from '@navigation/hooks';
import type { OnboardingStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button } from '@shared/components/ui';
import { Icon } from '@shared/components/ui/Icon';
import type { IoniconName } from '@shared/components/ui';
import * as Haptics from 'expo-haptics';
import { startTrial } from '@features/subscription/utils/trial';
import { isAiConfigured } from '@features/hints/utils/aiClient';
import { isMonetizationEnabled } from '@shared/config/runtimeConfig';

type Promise = { icon: IoniconName; titleKey: string; descKey: string };

const ANALYZER_PROMISE: Promise = {
  icon: 'analytics',
  titleKey: 'onboarding.success.analyzerTitle',
  descKey: 'onboarding.success.analyzerDesc',
};
const REMINDERS_PROMISE: Promise = {
  icon: 'notifications',
  titleKey: 'onboarding.success.remindersTitle',
  descKey: 'onboarding.success.remindersDesc',
};
const AI_PROMISE: Promise = {
  icon: 'chatbubble-ellipses',
  titleKey: 'onboarding.success.aiTitle',
  descKey: 'onboarding.success.aiDesc',
};

// UX-M1 (audit): only promise the AI Assistant if the Anthropic API key is
// bundled. Otherwise the user finishes onboarding expecting an AI tab that
// can't render. The check is build-time-static; computed once outside the
// component is fine.
const PROMISES: Promise[] = isAiConfigured()
  ? [AI_PROMISE, ANALYZER_PROMISE, REMINDERS_PROMISE]
  : [ANALYZER_PROMISE, REMINDERS_PROMISE];

export default function SuccessScreen() {
  const route = useRoute<RouteProp<OnboardingStackParamList, 'Success'>>();
  const rootNavigation = useRootNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { petName } = route.params;

  const checkScale = useMemo(() => new Animated.Value(0), []);
  const contentOpacity = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Animated.sequence([
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [checkScale, contentOpacity]);

  const handleStart = () => {
    startTrial();
    rootNavigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.checkCircle,
            { backgroundColor: theme.colors.success, transform: [{ scale: checkScale }] },
          ]}
        >
          <Icon name="checkmark" size={72} color="#fff" />
        </Animated.View>

        <Animated.View style={{ opacity: contentOpacity, alignItems: 'center', width: '100%' }}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
            {t('onboarding.success.title', { name: petName })}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('onboarding.success.subtitle')}
          </Text>

          <View style={styles.promises}>
            {PROMISES.map((p, i) => (
              <View key={i} style={[styles.promiseRow, { backgroundColor: theme.colors.surface }]}>
                <View
                  style={[styles.promiseIcon, { backgroundColor: `${theme.colors.primary}15` }]}
                >
                  <Icon name={p.icon} size={22} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.promiseTitle,
                      { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                    ]}
                  >
                    {t(p.titleKey)}
                  </Text>
                  <Text style={[styles.promiseDesc, { color: theme.colors.textSecondary }]}>
                    {t(p.descKey)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* "7 days of Pro free" only makes sense when billing exists — in
              unlocked/hidden builds there is no Pro or paywall anywhere in the
              UI, so the promise would point at nothing. */}
          {isMonetizationEnabled() && (
            <View style={[styles.trialBadge, { backgroundColor: theme.colors.primaryLight }]}>
              <Icon name="gift" size={18} color={theme.colors.primary} />
              <Text
                style={[
                  styles.trialBadgeText,
                  { color: theme.colors.primary, fontFamily: theme.fonts.semibold },
                ]}
              >
                {t('onboarding.success.trialBadge')}
              </Text>
            </View>
          )}
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Button title={t('onboarding.success.cta')} onPress={handleStart} fullWidth size="lg" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 28 },
  promises: { width: '100%', gap: 10 },
  promiseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  promiseIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promiseTitle: { fontSize: 15 },
  promiseDesc: { fontSize: 12, marginTop: 2 },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 20,
  },
  trialBadgeText: { fontSize: 14, flexShrink: 1 },
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
});
