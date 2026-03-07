import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useMoreNavigation, useRootNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { usePetStore } from '@shared/stores/petStore';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '@features/subscription/hooks/useSubscription';
import { ProBadge } from '@features/subscription/components/ProBadge';
import Constants from 'expo-constants';

export default function MoreMenuScreen() {
  const navigation = useMoreNavigation();
  const rootNavigation = useRootNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const { isPro, canAccessAdvanced } = useSubscription();

  type MenuScreen = 'Subscription' | 'PetProfile' | 'Expenses' | 'FeedCalculator' | 'Settings';
  interface MenuItem {
    iconName: string;
    label: string;
    screen: MenuScreen;
    iconColor: string;
    badge?: string;
    subtitle?: string;
    proGated?: boolean;
  }

  const handleProScreen = (screen: MenuScreen) => {
    if (canAccessAdvanced()) {
      navigation.navigate(screen);
    } else {
      rootNavigation.navigate('Paywall');
    }
  };

  const menuItems: MenuItem[] = [
    { iconName: 'star-outline', label: t('subscription.title'), screen: 'Subscription', iconColor: '#FFB340', badge: !isPro ? 'upgrade' : 'active' },
    { iconName: 'paw-outline', label: t('pets.title'), screen: 'PetProfile', iconColor: theme.colors.primary, subtitle: activePet?.name },
    { iconName: 'wallet-outline', label: t('expenses.title'), screen: 'Expenses', iconColor: theme.colors.warning },
    { iconName: 'calculator-outline', label: t('feedCalculator.title'), screen: 'FeedCalculator', iconColor: theme.colors.secondary, proGated: true },
    { iconName: 'settings-outline', label: t('settings.title'), screen: 'Settings', iconColor: theme.colors.textSecondary },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      {activePet && (
        <TouchableOpacity onPress={() => navigation.navigate('PetProfile')} activeOpacity={0.9}>
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.petCard}
          >
            <View style={styles.petAvatar}>
              <Ionicons name="paw" size={28} color="#fff" />
            </View>
            <View style={styles.petInfo}>
              <Text style={[styles.petName, { fontFamily: theme.fonts.bold }]}>{activePet.name}</Text>
              <Text style={styles.petDetails}>
                {activePet.species === 'cat' ? t('pets.cat') : t('pets.pet')}
                {activePet.weightKg ? ` · ${activePet.weightKg} ${t('common.kg')}` : ''}
                {activePet.diabetesType !== 'unknown' ? ` · ${t('pets.diabetesType')} ${activePet.diabetesType === 'type1' ? '1' : '2'}` : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>
      )}
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary, fontFamily: theme.fonts.semibold }]}>{t('navigation.menu')}</Text>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={[styles.menuItem, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}
            onPress={() => item.proGated ? handleProScreen(item.screen) : navigation.navigate(item.screen)}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIcon, { backgroundColor: `${item.iconColor}20` }]}>
              <Ionicons name={item.iconName} size={22} color={item.iconColor ?? theme.colors.primary} />
            </View>
            <View style={styles.menuText}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.menuLabel, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>{item.label}</Text>
                {item.proGated && !isPro && <ProBadge />}
                {item.badge === 'upgrade' && !isPro && (
                  <View style={[styles.upgradePill, { backgroundColor: `${theme.colors.primary}15` }]}>
                    <Text style={{ color: theme.colors.primary, fontSize: 11, fontWeight: '600' }}>{t('subscription.upgrade')}</Text>
                  </View>
                )}
              </View>
              {item.subtitle && <Text style={[styles.menuSub, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.emergencyBtn, { marginTop: 16 }]} onPress={() => rootNavigation.navigate('Emergency')} activeOpacity={0.8}>
          <Ionicons name="warning" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={[styles.emergencyText, { fontFamily: theme.fonts.bold }]}>{t('emergency.emergencyMode')}</Text>
        </TouchableOpacity>
        <Text style={[styles.version, { color: theme.colors.textTertiary }]}>DiaPet v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  petCard: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 20, borderRadius: 20, gap: 16 },
  petAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  petInfo: { flex: 1 },
  petName: { color: '#fff', fontSize: 20 },
  petDetails: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 12, letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 10, gap: 14 },
  menuIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 16 },
  menuSub: { fontSize: 13, marginTop: 2 },
  emergencyBtn: { backgroundColor: '#FF3B30', padding: 18, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  emergencyText: { color: '#fff', fontSize: 16 },
  version: { textAlign: 'center', fontSize: 12, marginTop: 32, marginBottom: 20 },
  upgradePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
});
