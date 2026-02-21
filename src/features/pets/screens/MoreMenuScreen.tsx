import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMoreNavigation, useRootNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { usePetStore } from '@shared/stores/petStore';
import { Ionicons } from '@expo/vector-icons';

export default function MoreMenuScreen() {
  const navigation = useMoreNavigation();
  const rootNavigation = useRootNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { activePet } = usePetStore();

  const menuItems = [
    { icon: '🐾', label: t('pets.title'), screen: 'PetProfile' as const, color: theme.colors.primary, subtitle: activePet?.name },
    { icon: '💰', label: t('expenses.title'), screen: 'Expenses' as const, color: theme.colors.success },
    { icon: '🩺', label: t('assessment.title'), screen: 'Assessment' as const, color: theme.colors.warning },
    { icon: '🧮', label: t('feedCalculator.title'), screen: 'FeedCalculator' as const, color: theme.colors.secondary },
    { icon: '⚙️', label: t('settings.title'), screen: 'Settings' as const, color: theme.colors.textSecondary },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      {activePet && (
        <TouchableOpacity style={[styles.petCard, { backgroundColor: theme.colors.primary }]} onPress={() => navigation.navigate('PetProfile')} activeOpacity={0.9}>
          <View style={styles.petAvatar}><Text style={styles.petAvatarText}>🐱</Text></View>
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{activePet.name}</Text>
            <Text style={styles.petDetails}>
              {activePet.species === 'cat' ? t('pets.cat') : t('pets.pet')}
              {activePet.weightKg ? ` · ${activePet.weightKg} кг` : ''}
              {activePet.diabetesType !== 'unknown' ? ` · ${t('pets.diabetesType')} ${activePet.diabetesType === 'type1' ? '1' : '2'}` : ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      )}
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{t('navigation.menu')}</Text>
        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} style={[styles.menuItem, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.8}>
            <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}><Text style={styles.menuEmoji}>{item.icon}</Text></View>
            <View style={styles.menuText}>
              <Text style={[styles.menuLabel, { color: theme.colors.text }]}>{item.label}</Text>
              {item.subtitle && <Text style={[styles.menuSub, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.emergencyBtn, { marginTop: 16 }]} onPress={() => rootNavigation.navigate('Emergency')} activeOpacity={0.8}>
          <Text style={styles.emergencyText}>🚨 {t('emergency.emergencyMode')}</Text>
        </TouchableOpacity>
        <Text style={[styles.version, { color: theme.colors.textTertiary }]}>DiaPet v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  petCard: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 20, borderRadius: 20, gap: 16 },
  petAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  petAvatarText: { fontSize: 30 },
  petInfo: { flex: 1 },
  petName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  petDetails: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 10, gap: 14 },
  menuIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  menuEmoji: { fontSize: 22 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '600' },
  menuSub: { fontSize: 13, marginTop: 2 },
  emergencyBtn: { backgroundColor: '#FF3B30', padding: 18, borderRadius: 16, alignItems: 'center' },
  emergencyText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: 12, marginTop: 32, marginBottom: 20 },
});
