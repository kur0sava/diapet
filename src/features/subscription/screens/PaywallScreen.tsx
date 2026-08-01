import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  AppState,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@shared/components/ui/Icon';
import type { IoniconName } from '@shared/components/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@shared/theme';
import { useTranslation } from 'react-i18next';
import { useSubscriptionStore, isBackendConfigured } from '@shared/stores/subscriptionStore';
import { useNavigation } from '@react-navigation/native';
import { PLANS, SubscriptionPlan, isPaymentProviderConfigured } from '@shared/api/subscriptionApi';
import * as Haptics from 'expo-haptics';
import i18n from 'i18next';
import {
  startTrial,
  hasTrialStarted,
  isTrialActive,
  isTrialExpired,
  trialDaysLeft,
  TRIAL_DURATION_DAYS,
} from '../utils/trial';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@shared/config/legal';

const PRIVACY_URL = PRIVACY_POLICY_URL;
const TERMS_URL = TERMS_OF_SERVICE_URL;

const FEATURES: { icon: IoniconName; titleKey: string; descKey: string }[] = [
  {
    icon: 'chatbubble-ellipses',
    titleKey: 'subscription.features.aiAssistant',
    descKey: 'subscription.features.aiAssistantDesc',
  },
  {
    icon: 'sparkles',
    titleKey: 'subscription.features.aiPrediction',
    descKey: 'subscription.features.aiPredictionDesc',
  },
  {
    icon: 'analytics',
    titleKey: 'subscription.features.advancedAnalytics',
    descKey: 'subscription.features.advancedAnalyticsDesc',
  },
  {
    icon: 'paw',
    titleKey: 'subscription.features.unlimitedPets',
    descKey: 'subscription.features.unlimitedPetsDesc',
  },
];

const SECONDARY_FEATURES: { icon: IoniconName; titleKey: string }[] = [
  { icon: 'document-text', titleKey: 'subscription.features.pdfExport' },
  { icon: 'calculator', titleKey: 'subscription.features.feedCalculator' },
  { icon: 'time', titleKey: 'subscription.features.extendedHistory' },
];

function getPriceDisplay(plan: SubscriptionPlan): string {
  const isRu = i18n.language?.startsWith('ru');
  return isRu ? PLANS[plan].priceDisplay : PLANS[plan].priceDisplayEn;
}

export default function PaywallScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { openPayment, checkAfterPayment, refreshStatus, isLoading } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('yearly');
  const [waitingForPayment, setWaitingForPayment] = useState(false);
  const [trialStartedTick, setTrialStartedTick] = useState(0);

  const trialStarted = hasTrialStarted();
  const trialActive = isTrialActive();
  const trialExpired = isTrialExpired();
  const daysLeft = trialDaysLeft();
  const providerReady = isPaymentProviderConfigured();
  const showRealCheckout = isBackendConfigured() && providerReady;

  const handleStartTrial = () => {
    if (trialStarted) return;
    Alert.alert(
      t('subscription.trial.confirmTitle', {
        days: TRIAL_DURATION_DAYS,
        defaultValue: `Start ${TRIAL_DURATION_DAYS}-day free trial?`,
      }),
      t('subscription.trial.confirmBody', {
        days: TRIAL_DURATION_DAYS,
        defaultValue: `You'll get ${TRIAL_DURATION_DAYS} days of full Pro access. The trial starts now and can't be paused.`,
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('subscription.trial.confirmCta', { defaultValue: 'Start trial' }),
          onPress: () => {
            startTrial();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            setTrialStartedTick(t => t + 1);
          },
        },
      ]
    );
  };

  void trialStartedTick;

  useEffect(() => {
    if (!waitingForPayment) return;
    const sub = AppState.addEventListener('change', async state => {
      if (state === 'active' && waitingForPayment) {
        setWaitingForPayment(false);
        const success = await checkAfterPayment();
        if (success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert(t('common.success'), t('subscription.purchaseSuccess'));
          navigation.goBack();
        }
      }
    });
    return () => sub.remove();
  }, [waitingForPayment, checkAfterPayment, navigation, t]);

  const handlePurchase = () => {
    if (!showRealCheckout) {
      Alert.alert(t('common.info'), t('subscription.notAvailable'));
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setWaitingForPayment(true);
    openPayment(selectedPlan);
  };

  const handleRefresh = async () => {
    await refreshStatus();
    const { isPro } = useSubscriptionStore.getState();
    if (isPro) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('common.success'), t('subscription.restoreSuccess'));
      navigation.goBack();
    } else {
      Alert.alert(t('common.info'), t('subscription.noActiveSubscription'));
    }
  };

  const monthlyPrice = getPriceDisplay('monthly');
  const yearlyPrice = getPriceDisplay('yearly');
  const selectedPrice = selectedPlan === 'yearly' ? yearlyPrice : monthlyPrice;
  const subscribeBtnText = `${t('subscription.subscribe')} — ${selectedPrice}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + 8 }]}
        onPress={() => navigation.goBack()}
      >
        <Icon name="close" size={28} color={theme.colors.text} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <LinearGradient
          colors={
            [...(theme.isDark ? theme.gradients.headerRichDark : theme.gradients.headerRich)] as [
              string,
              string,
              ...string[],
            ]
          }
          style={styles.hero}
        >
          <Icon name="star" size={48} color="#FFD700" />
          <Text style={[styles.heroTitle, { fontFamily: theme.fonts.bold }]}>
            {t('subscription.title')}
          </Text>
          <Text style={styles.heroSubtitle}>{t('subscription.subtitle')}</Text>
        </LinearGradient>

        {trialActive && (
          <View style={[styles.trialCard, { backgroundColor: theme.colors.success + '15' }]}>
            <Icon name="gift" size={22} color={theme.colors.success} />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.trialCardTitle,
                  { color: theme.colors.success, fontFamily: theme.fonts.bold },
                ]}
              >
                {t('subscription.trial.activeTitle')}
              </Text>
              <Text style={[styles.trialCardDesc, { color: theme.colors.textSecondary }]}>
                {t('subscription.trial.activeDesc', { count: daysLeft })}
              </Text>
            </View>
          </View>
        )}
        {!trialStarted && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleStartTrial}
            style={[styles.trialCard, { backgroundColor: theme.colors.primaryLight }]}
          >
            <Icon name="gift" size={22} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.trialCardTitle,
                  { color: theme.colors.primary, fontFamily: theme.fonts.bold },
                ]}
              >
                {t('subscription.trial.ctaTitle', { days: TRIAL_DURATION_DAYS })}
              </Text>
              <Text style={[styles.trialCardDesc, { color: theme.colors.textSecondary }]}>
                {t('subscription.trial.ctaDesc')}
              </Text>
            </View>
            <Icon name="chevron-forward" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        {/* "Trial expired" badge would terrify a free-Pro user. Show only when
            real checkout is wired and the trial window has actually closed. */}
        {trialExpired && showRealCheckout && (
          <View style={[styles.trialCard, { backgroundColor: theme.colors.warning + '15' }]}>
            <Icon name="time" size={22} color={theme.colors.warning} />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.trialCardTitle,
                  { color: theme.colors.warning, fontFamily: theme.fonts.bold },
                ]}
              >
                {t('subscription.trial.expiredTitle')}
              </Text>
              <Text style={[styles.trialCardDesc, { color: theme.colors.textSecondary }]}>
                {t('subscription.trial.expiredDesc')}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
                <Icon name={f.icon} size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text
                  style={[
                    styles.featureTitle,
                    { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                  ]}
                >
                  {t(f.titleKey)}
                </Text>
                <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                  {t(f.descKey)}
                </Text>
              </View>
              <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
            </View>
          ))}
        </View>

        <View style={styles.secondaryStrip}>
          <Text style={[styles.secondaryLabel, { color: theme.colors.textTertiary }]}>
            {t('subscription.alsoIncluded')}
          </Text>
          <View style={styles.secondaryRow}>
            {SECONDARY_FEATURES.map((f, i) => (
              <View key={i} style={styles.secondaryItem}>
                <Icon name={f.icon} size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.secondaryText, { color: theme.colors.textSecondary }]}>
                  {t(f.titleKey)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {!showRealCheckout ? (
          <View style={styles.comingSoonBlock}>
            <View style={[styles.comingSoonBadge, { backgroundColor: theme.colors.primary }]}>
              <Icon name="time-outline" size={16} color="#fff" />
              <Text style={[styles.comingSoonBadgeText, { fontFamily: theme.fonts.bold }]}>
                {t('subscription.comingSoon')}
              </Text>
            </View>
            <View style={[styles.comingSoonCard, { backgroundColor: theme.colors.surface }]}>
              <Icon name="gift-outline" size={32} color={theme.colors.success} />
              <Text
                style={[
                  styles.comingSoonTitle,
                  { color: theme.colors.success, fontFamily: theme.fonts.semibold },
                ]}
              >
                {t('subscription.allFeaturesUnlocked')}
              </Text>
              <Text style={[styles.comingSoonDesc, { color: theme.colors.textSecondary }]}>
                {t('subscription.comingSoonDesc')}
              </Text>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.plans}>
              <TouchableOpacity
                style={[
                  styles.planCard,
                  {
                    backgroundColor:
                      selectedPlan === 'yearly' ? theme.colors.primaryLight : theme.colors.surface,
                    borderColor: selectedPlan === 'yearly' ? theme.colors.primary : 'transparent',
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSelectedPlan('yearly')}
              >
                <View style={styles.planHeader}>
                  <Text
                    style={[
                      styles.planName,
                      { color: theme.colors.text, fontFamily: theme.fonts.bold },
                    ]}
                  >
                    {t('subscription.yearly')}
                  </Text>
                  <View style={[styles.saveBadge, { backgroundColor: theme.colors.success }]}>
                    <Text style={styles.saveText}>
                      {t('subscription.yearlySaving', { percent: '29' })}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.planPrice,
                    { color: theme.colors.text, fontFamily: theme.fonts.bold },
                  ]}
                >
                  {t('subscription.yearlyPrice', { price: yearlyPrice })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.planCard,
                  {
                    backgroundColor:
                      selectedPlan === 'monthly' ? theme.colors.primaryLight : theme.colors.surface,
                    borderColor: selectedPlan === 'monthly' ? theme.colors.primary : 'transparent',
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <Text
                  style={[
                    styles.planName,
                    { color: theme.colors.text, fontFamily: theme.fonts.bold },
                  ]}
                >
                  {t('subscription.monthly')}
                </Text>
                <Text
                  style={[
                    styles.planPrice,
                    { color: theme.colors.text, fontFamily: theme.fonts.bold },
                  ]}
                >
                  {t('subscription.monthlyPrice', { price: monthlyPrice })}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.subscribeBtn, { opacity: isLoading || waitingForPayment ? 0.7 : 1 }]}
              onPress={handlePurchase}
              disabled={isLoading || waitingForPayment}
            >
              <LinearGradient
                colors={[...theme.gradients.primary] as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.subscribeBtnInner}
              >
                {isLoading || waitingForPayment ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.subscribeBtnText, { fontFamily: theme.fonts.bold }]}>
                    {subscribeBtnText}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={[styles.autoRenewText, { color: theme.colors.textTertiary }]}>
              {t('subscription.autoRenewDisclosure', { price: selectedPrice })}
            </Text>

            <TouchableOpacity
              onPress={handleRefresh}
              disabled={isLoading}
              style={styles.restoreBtn}
            >
              <Text style={[styles.restoreText, { color: theme.colors.textSecondary }]}>
                {t('subscription.checkStatus')}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.legal}>
          <View style={styles.legalRow}>
            <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL).catch(() => {})}>
              <Text style={[styles.legalLink, { color: theme.colors.primary }]}>
                {t('subscription.terms')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.legalText, { color: theme.colors.textTertiary }]}> • </Text>
            <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL).catch(() => {})}>
              <Text style={[styles.legalLink, { color: theme.colors.primary }]}>
                {t('subscription.privacy')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    padding: 4,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { paddingBottom: 40 },
  hero: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20, gap: 8 },
  heroTitle: { color: '#fff', fontSize: 28 },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 15, textAlign: 'center' },
  features: { padding: 20, gap: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15 },
  featureDesc: { fontSize: 12, marginTop: 2 },
  trialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
  },
  trialCardTitle: { fontSize: 15 },
  trialCardDesc: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  secondaryStrip: { paddingHorizontal: 20, paddingBottom: 8, gap: 6 },
  secondaryLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  secondaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  secondaryItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  secondaryText: { fontSize: 12 },
  plans: { paddingHorizontal: 20, gap: 12 },
  planCard: { padding: 16, borderRadius: 14 },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planName: { fontSize: 16 },
  planPrice: { fontSize: 20, marginTop: 4 },
  saveBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  saveText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  comingSoonBlock: { alignItems: 'center', paddingHorizontal: 20, gap: 12, marginBottom: 8 },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  comingSoonBadgeText: { color: '#fff', fontSize: 14 },
  comingSoonCard: { width: '100%', alignItems: 'center', padding: 24, borderRadius: 16, gap: 8 },
  comingSoonTitle: { fontSize: 16, textAlign: 'center' },
  comingSoonDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  subscribeBtn: { marginHorizontal: 20, marginTop: 20, borderRadius: 28, overflow: 'hidden' },
  subscribeBtnInner: { paddingVertical: 16, alignItems: 'center' },
  subscribeBtnText: { color: '#fff', fontSize: 17 },
  autoRenewText: {
    fontSize: 11,
    textAlign: 'center',
    marginHorizontal: 40,
    marginTop: 10,
    lineHeight: 16,
  },
  restoreBtn: { alignSelf: 'center', marginTop: 16, padding: 8 },
  restoreText: { fontSize: 14 },
  legal: { alignItems: 'center', marginTop: 16 },
  legalRow: { flexDirection: 'row', alignItems: 'center' },
  legalLink: { fontSize: 12, textDecorationLine: 'underline' },
  legalText: { fontSize: 12 },
});
