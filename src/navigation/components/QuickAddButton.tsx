import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Icon } from '@shared/components/ui/Icon';
import type { MainTabParamList } from '@navigation/types';

type TabNav = BottomTabNavigationProp<MainTabParamList>;

/**
 * Y5 (design audit 2026-07-17): logging is done 2-4×/day but the dashboard's
 * Quick Actions scroll below the fold on small screens. The mySugr-style
 * central «+» makes logging one tap away from ANY tab: raised FAB in the tab
 * bar opening a bottom sheet with the four log actions.
 */
export function QuickAddButton() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TabNav>();
  const [open, setOpen] = useState(false);

  const actions = [
    {
      key: 'glucose',
      icon: 'water' as const,
      color: theme.colors.primary,
      label: t('dashboard.logGlucose'),
      go: () => navigation.navigate('Home', { screen: 'LogGlucose', params: {} }),
    },
    {
      key: 'injection',
      icon: 'medkit' as const,
      color: theme.colors.secondary,
      label: t('dashboard.logInjection'),
      go: () => navigation.navigate('Home', { screen: 'LogInjection' }),
    },
    {
      key: 'feeding',
      icon: 'restaurant' as const,
      color: theme.colors.success,
      label: t('dashboard.logFeeding'),
      go: () => navigation.navigate('Home', { screen: 'LogFeeding' }),
    },
    {
      key: 'symptom',
      icon: 'paw' as const,
      color: theme.colors.warning,
      label: t('dashboard.logSymptom'),
      go: () => navigation.navigate('Home', { screen: 'AddSymptom', params: {} }),
    },
  ];

  return (
    <View style={styles.slot} pointerEvents="box-none">
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary, ...theme.shadows.md }]}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t('dashboard.quickActions')}
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          setOpen(true);
        }}
      >
        <Icon name="add" size={30} color="#FFFFFF" strokeWidth={2.25} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}
          onPress={() => setOpen(false)}
        >
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: theme.colors.surface,
                paddingBottom: Math.max(insets.bottom, 12) + 8,
              },
            ]}
            onPress={e => e.stopPropagation()}
          >
            <View style={[styles.grabber, { backgroundColor: theme.colors.border }]} />
            <Text
              style={[
                styles.sheetTitle,
                { color: theme.colors.text, fontFamily: theme.fonts.bold },
              ]}
            >
              {t('dashboard.quickActions')}
            </Text>
            {actions.map(a => (
              <TouchableOpacity
                key={a.key}
                style={[styles.actionRow, { backgroundColor: theme.colors.surfaceSecondary }]}
                activeOpacity={0.7}
                onPress={() => {
                  setOpen(false);
                  a.go();
                }}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${a.color}18` }]}>
                  <Icon name={a.icon} size={20} color={a.color} />
                </View>
                <Text
                  style={[
                    styles.actionLabel,
                    { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                  ]}
                >
                  {a.label}
                </Text>
                <Icon name="chevron-forward" size={18} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1, alignItems: 'center' },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
  },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: 4 },
  sheetTitle: { fontSize: 17, marginBottom: 4, textAlign: 'center' },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 56,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 15, flex: 1 },
});
