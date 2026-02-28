import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Linking, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@shared/theme';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../hooks/useSubscription';
import { useSubscriptionStore } from '@shared/stores/subscriptionStore';
import { useMoreNavigation, useRootNavigation } from '@navigation/hooks';
import { Card } from '@shared/components/ui';

export default function SubscriptionScreen() {
  const navigation = useMoreNavigation();
  const rootNavigation = useRootNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isPro } = useSubscription();
  const restore = useSubscriptionStore(s => s.restore);

  const handleManage = () => {
    if (Platform.OS === 'android') {
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    } else {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    }
  };

  const handleRestore = async () => {
    const success = await restore();
    if (success) {
      Alert.alert(t('common.success'), t('subscription.restoreSuccess'));
    } else {
      Alert.alert(t('common.error'), t('subscription.restoreEmpty'));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.colors.primary }}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>
          {t('subscription.title')}
        </Text>
        <View style={{ width: 60 }} />
      </View>
      <LinearGradient colors={[...theme.gradients.primary] as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 3 }} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Current plan */}
        <Card style={styles.planCard}>
          <Ionicons name={isPro ? 'star' : 'star-outline'} size={40} color={isPro ? '#FFD700' : theme.colors.textSecondary} />
          <Text style={[styles.planTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
            {isPro ? t('subscription.pro') : t('subscription.free')}
          </Text>
          <Text style={[styles.planDesc, { color: theme.colors.textSecondary }]}>
            {t('subscription.currentPlan')}
          </Text>
        </Card>

        {isPro ? (
          <>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.surface }]} onPress={handleManage}>
              <Ionicons name="settings-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>
                {t('subscription.manageSubscription')}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => rootNavigation.navigate('Paywall')}
            >
              <LinearGradient
                colors={[...theme.gradients.primary] as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.upgradeBtnInner}
              >
                <Ionicons name="star" size={20} color="#fff" />
                <Text style={[styles.upgradeBtnText, { fontFamily: theme.fonts.bold }]}>
                  {t('subscription.upgrade')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.surface }]} onPress={handleRestore}>
              <Ionicons name="refresh-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>
                {t('subscription.restore')}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5 },
  title: { fontSize: 17 },
  content: { padding: 20, gap: 16 },
  planCard: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  planTitle: { fontSize: 24 },
  planDesc: { fontSize: 13 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, gap: 12 },
  actionText: { flex: 1, fontSize: 15 },
  upgradeBtn: { borderRadius: 28, overflow: 'hidden' },
  upgradeBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  upgradeBtnText: { color: '#fff', fontSize: 17 },
});
