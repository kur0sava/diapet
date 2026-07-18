import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Icon, ScreenHeader } from '@shared/components/ui';
import { useCommunityNavigation } from '@navigation/hooks';
import { storage } from '@storage/mmkv/storage';
import { acceptGuidelines } from '../api/communityApi';
import { useCommunityUser } from '../hooks/useCommunityUser';

export const GUIDELINES_ACCEPTED_KEY = 'communityGuidelinesAccepted';

export function areGuidelinesAccepted(): boolean {
  return storage.getBoolean(GUIDELINES_ACCEPTED_KEY) === true;
}

export default function GuidelinesScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useCommunityNavigation();
  const { uid } = useCommunityUser();

  const rules = ['rule1', 'rule2', 'rule3', 'rule4', 'rule5'];

  const onAccept = () => {
    storage.set(GUIDELINES_ACCEPTED_KEY, true);
    if (uid) void acceptGuidelines(uid).catch(() => {});
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScreenHeader title={t('community.guidelines.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.intro, { color: theme.colors.textSecondary }]}>
          {t('community.guidelines.intro')}
        </Text>
        {rules.map(r => (
          <View key={r} style={styles.ruleRow}>
            <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={[styles.ruleText, { color: theme.colors.text }]}>
              {t(`community.guidelines.${r}`)}
            </Text>
          </View>
        ))}
        <TouchableOpacity
          style={[styles.acceptBtn, { backgroundColor: theme.colors.primary }]}
          onPress={onAccept}
          accessibilityRole="button"
        >
          <Text style={styles.acceptText}>{t('community.guidelines.accept')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  intro: { fontSize: 15, lineHeight: 22 },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ruleText: { flex: 1, fontSize: 15, lineHeight: 22 },
  acceptBtn: { paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginTop: 12 },
  acceptText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
