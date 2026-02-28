import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/theme';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../hooks/useSubscription';
import { useRootNavigation } from '@navigation/hooks';

interface FeatureGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ children, fallback }: FeatureGateProps) {
  const { isPro } = useSubscription();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useRootNavigation();

  if (isPro) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Ionicons name="lock-closed" size={32} color={theme.colors.primary} />
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>
        {t('subscription.upgradeRequired')}
      </Text>
      <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>
        {t('subscription.upgradeRequiredDesc')}
      </Text>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('Paywall')}
      >
        <Text style={[styles.btnText, { fontFamily: theme.fonts.semibold }]}>
          {t('subscription.upgrade')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, borderRadius: 16, alignItems: 'center', gap: 8, margin: 16 },
  title: { fontSize: 16, marginTop: 8 },
  desc: { fontSize: 13, textAlign: 'center' },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 8 },
  btnText: { color: '#fff', fontSize: 15 },
});
