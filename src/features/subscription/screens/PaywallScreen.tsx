import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@shared/theme';
import { useTranslation } from 'react-i18next';
import { useSubscriptionStore } from '@shared/stores/subscriptionStore';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const PRIVACY_URL = 'https://kur0sava.github.io/diapet/assets/privacy-policy.html';
const TERMS_URL = 'https://kur0sava.github.io/diapet/assets/privacy-policy.html';

const FEATURES: { icon: string; titleKey: string; descKey: string }[] = [
  { icon: 'paw', titleKey: 'subscription.features.unlimitedPets', descKey: 'subscription.features.unlimitedPetsDesc' },
  { icon: 'document-text', titleKey: 'subscription.features.pdfExport', descKey: 'subscription.features.pdfExportDesc' },
  { icon: 'analytics', titleKey: 'subscription.features.advancedAnalytics', descKey: 'subscription.features.advancedAnalyticsDesc' },
  { icon: 'time', titleKey: 'subscription.features.extendedHistory', descKey: 'subscription.features.extendedHistoryDesc' },
  { icon: 'ban', titleKey: 'subscription.features.noAds', descKey: 'subscription.features.noAdsDesc' },
];

export default function PaywallScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { offerings, loadOfferings, purchase, restore, isLoadingOfferings } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!offerings) loadOfferings();
  }, []);

  const monthlyPkg = offerings?.monthly;
  const yearlyPkg = offerings?.annual;
  const hasOfferings = !!monthlyPkg || !!yearlyPkg;

  const handlePurchase = async () => {
    const pkg = selectedPlan === 'yearly' ? yearlyPkg : monthlyPkg;
    if (!pkg) {
      Alert.alert(t('common.error'), t('subscription.purchaseError'));
      return;
    }
    setPurchasing(true);
    const success = await purchase(pkg);
    setPurchasing(false);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    const success = await restore();
    setPurchasing(false);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('common.success'), t('subscription.restoreSuccess'));
      navigation.goBack();
    } else {
      Alert.alert(t('common.error'), t('subscription.restoreEmpty'));
    }
  };

  // UX-034: Don't show hardcoded fallback prices — only show real prices from store
  const monthlyPrice = monthlyPkg?.product?.priceString;
  const yearlyPrice = yearlyPkg?.product?.priceString;

  // UX-032: Subscribe button shows price
  const selectedPrice = selectedPlan === 'yearly' ? yearlyPrice : monthlyPrice;
  const subscribeBtnText = selectedPrice
    ? `${t('subscription.subscribe')} — ${selectedPrice}`
    : t('subscription.subscribe');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Close button */}
      <TouchableOpacity style={[styles.closeBtn, { top: insets.top + 8 }]} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={28} color={theme.colors.text} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={[...theme.gradients.headerRich] as [string, string, ...string[]]}
          style={styles.hero}
        >
          <Ionicons name="star" size={48} color="#FFD700" />
          <Text style={[styles.heroTitle, { fontFamily: theme.fonts.bold }]}>
            {t('subscription.title')}
          </Text>
          <Text style={styles.heroSubtitle}>
            {t('subscription.subtitle')}
          </Text>
        </LinearGradient>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
                <Ionicons name={f.icon as any} size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>
                  {t(f.titleKey)}
                </Text>
                <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                  {t(f.descKey)}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            </View>
          ))}
        </View>

        {/* Plan toggle — only show if offerings loaded */}
        {hasOfferings ? (
          <View style={styles.plans}>
            {/* Yearly */}
            {yearlyPkg && (
              <TouchableOpacity
                style={[
                  styles.planCard,
                  {
                    backgroundColor: selectedPlan === 'yearly' ? theme.colors.primaryLight : theme.colors.surface,
                    borderColor: selectedPlan === 'yearly' ? theme.colors.primary : 'transparent',
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSelectedPlan('yearly')}
              >
                <View style={styles.planHeader}>
                  <Text style={[styles.planName, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
                    {t('subscription.yearly')}
                  </Text>
                  <View style={[styles.saveBadge, { backgroundColor: '#34C759' }]}>
                    <Text style={styles.saveText}>{t('subscription.yearlySaving', { percent: '30' })}</Text>
                  </View>
                </View>
                <Text style={[styles.planPrice, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
                  {t('subscription.yearlyPrice', { price: yearlyPrice })}
                </Text>
              </TouchableOpacity>
            )}

            {/* Monthly */}
            {monthlyPkg && (
              <TouchableOpacity
                style={[
                  styles.planCard,
                  {
                    backgroundColor: selectedPlan === 'monthly' ? theme.colors.primaryLight : theme.colors.surface,
                    borderColor: selectedPlan === 'monthly' ? theme.colors.primary : 'transparent',
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <Text style={[styles.planName, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
                  {t('subscription.monthly')}
                </Text>
                <Text style={[styles.planPrice, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
                  {t('subscription.monthlyPrice', { price: monthlyPrice })}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : isLoadingOfferings ? (
          <View style={styles.loadingPrices}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              {t('common.loading')}
            </Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.loadingPrices} onPress={() => loadOfferings()}>
            <Ionicons name="refresh-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.primary }]}>
              {t('subscription.retryLoading')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Trial badge */}
        <View style={[styles.trialBadge, { backgroundColor: `${theme.colors.primary}10` }]}>
          <Ionicons name="gift-outline" size={18} color={theme.colors.primary} />
          <Text style={[styles.trialText, { color: theme.colors.primary, fontFamily: theme.fonts.semibold }]}>
            {t('subscription.freeTrial')}
          </Text>
        </View>

        {/* Subscribe button — UX-032: shows price */}
        <TouchableOpacity
          style={[styles.subscribeBtn, { opacity: purchasing || !hasOfferings ? 0.7 : 1 }]}
          onPress={handlePurchase}
          disabled={purchasing || !hasOfferings}
        >
          <LinearGradient
            colors={[...theme.gradients.primary] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.subscribeBtnInner}
          >
            {purchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.subscribeBtnText, { fontFamily: theme.fonts.bold }]}>
                {subscribeBtnText}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* UX-033: Auto-renew disclosure */}
        <Text style={[styles.autoRenewText, { color: theme.colors.textTertiary }]}>
          {t('subscription.autoRenewDisclosure', { price: selectedPrice ?? '' })}
        </Text>

        {/* Restore */}
        <TouchableOpacity onPress={handleRestore} disabled={purchasing} style={styles.restoreBtn}>
          <Text style={[styles.restoreText, { color: theme.colors.textSecondary }]}>
            {t('subscription.restore')}
          </Text>
        </TouchableOpacity>

        {/* UX-031: Legal — clickable links */}
        <View style={styles.legal}>
          <View style={styles.legalRow}>
            <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
              <Text style={[styles.legalLink, { color: theme.colors.primary }]}>
                {t('subscription.terms')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.legalText, { color: theme.colors.textTertiary }]}> • </Text>
            <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
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
  closeBtn: { position: 'absolute', right: 16, zIndex: 10, padding: 4 },
  scroll: { paddingBottom: 40 },
  hero: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20, gap: 8 },
  heroTitle: { color: '#fff', fontSize: 28 },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 15, textAlign: 'center' },
  features: { padding: 20, gap: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15 },
  featureDesc: { fontSize: 12, marginTop: 2 },
  plans: { paddingHorizontal: 20, gap: 12 },
  planCard: { padding: 16, borderRadius: 14 },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planName: { fontSize: 16 },
  planPrice: { fontSize: 20, marginTop: 4 },
  saveBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  saveText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  loadingPrices: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 24 },
  loadingText: { fontSize: 14 },
  trialBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 20 },
  trialText: { fontSize: 14 },
  subscribeBtn: { marginHorizontal: 20, marginTop: 20, borderRadius: 28, overflow: 'hidden' },
  subscribeBtnInner: { paddingVertical: 16, alignItems: 'center' },
  subscribeBtnText: { color: '#fff', fontSize: 17 },
  autoRenewText: { fontSize: 11, textAlign: 'center', marginHorizontal: 40, marginTop: 10, lineHeight: 16 },
  restoreBtn: { alignSelf: 'center', marginTop: 16, padding: 8 },
  restoreText: { fontSize: 14 },
  legal: { alignItems: 'center', marginTop: 16 },
  legalRow: { flexDirection: 'row', alignItems: 'center' },
  legalLink: { fontSize: 12, textDecorationLine: 'underline' },
  legalText: { fontSize: 12 },
});
