import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@shared/components/ui/Icon';
import { useRootNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Card } from '@shared/components/ui';
import { storage } from '@storage/mmkv/storage';
import * as Haptics from 'expo-haptics';

type EmergencyType = 'hypoglycemia' | 'hyperglycemia';

export default function EmergencyScreen() {
  const navigation = useRootNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<EmergencyType>('hypoglycemia');
  const callingRef = useRef(false);

  const vetPhone = storage.getString('vetPhone');
  const vetName = storage.getString('vetName');

  const callVet = () => {
    if (callingRef.current) return;
    if (!vetPhone) {
      // Не уводим с Emergency в Settings — пользователь теряет инструкции в момент паники.
      // Предлагаем только звонок 112, добавить ветеринара можно после.
      Alert.alert(t('emergency.noVetContact'), t('emergency.addVetContact'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('emergency.call112'), onPress: () => Linking.openURL('tel:112').catch(() => Alert.alert(t('emergency.callFailed'), t('emergency.callFailedDesc'))) },
      ]);
      return;
    }
    callingRef.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Linking.openURL(`tel:${vetPhone.replace(/[^\d+\-() ]/g, '')}`)
      .catch(() => {
        Alert.alert(t('emergency.callFailed'), t('emergency.callFailedDesc'));
      });
    setTimeout(() => { callingRef.current = false; }, 2000);
  };

  const asArray = (v: unknown): string[] => Array.isArray(v) ? v : [];
  const hypoSigns = asArray(t('emergency.hypoSigns', { returnObjects: true }));
  const hypoSteps = asArray(t('emergency.hypoSteps', { returnObjects: true }));
  const hyperSigns = asArray(t('emergency.hyperSigns', { returnObjects: true }));
  const hyperSteps = asArray(t('emergency.hyperSteps', { returnObjects: true }));

  const signs = activeTab === 'hypoglycemia' ? hypoSigns : hyperSigns;
  const steps = activeTab === 'hypoglycemia' ? hypoSteps : hyperSteps;

  // UX-014: Use theme-aware colors for dark mode support
  const cardBg = theme.colors.surface;
  const cardText = theme.colors.text;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.danger }]}>
      <StatusBar barStyle="light-content" />

      {/* Header — UX-012: emoji → Ionicons */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Icon name="close" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Icon name="warning" size={28} color="#fff" style={{ marginBottom: 2 }} />
          <Text style={styles.headerTitle}>{t('emergency.title')}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* UX-011: Call Vet Button at TOP — most critical action */}
      <TouchableOpacity
        style={[styles.callButton, { marginHorizontal: 16, marginBottom: 12, backgroundColor: theme.colors.surface }]}
        onPress={callVet}
        activeOpacity={0.85}
      >
        <View style={styles.callButtonContent}>
          <View style={[styles.callIconCircle, { backgroundColor: theme.colors.dangerLight }]}>
            <Icon name="call" size={28} color={theme.colors.danger} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.callButtonTitle, { color: theme.colors.danger }]}>{t('emergency.callVet')}</Text>
            {vetName && <Text style={[styles.callButtonSub, { color: theme.colors.text }]}>{vetName}</Text>}
            {vetPhone ? (
              <Text style={[styles.callButtonPhone, { color: theme.colors.primary }]}>{vetPhone}</Text>
            ) : (
              <Text style={[styles.callButtonNoVet, { color: theme.colors.textTertiary }]}>{t('emergency.tapToAddVet')}</Text>
            )}
          </View>
          <Icon name="chevron-forward" size={20} color={theme.colors.danger} />
        </View>
      </TouchableOpacity>

      {/* Tab selector — UX-012: emoji → Ionicons */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: activeTab === 'hypoglycemia' ? 'rgba(255,255,255,0.25)' : 'transparent' },
          ]}
          onPress={() => setActiveTab('hypoglycemia')}
        >
          <Icon name="trending-down" size={16} color="#fff" style={{ marginRight: 4 }} />
          <Text style={[styles.tabText, { fontWeight: activeTab === 'hypoglycemia' ? '700' : '400' }]}>
            {t('emergency.hypoglycemia')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: activeTab === 'hyperglycemia' ? 'rgba(255,255,255,0.25)' : 'transparent' },
          ]}
          onPress={() => setActiveTab('hyperglycemia')}
        >
          <Icon name="trending-up" size={16} color="#fff" style={{ marginRight: 4 }} />
          <Text style={[styles.tabText, { fontWeight: activeTab === 'hyperglycemia' ? '700' : '400' }]}>
            {t('emergency.hyperglycemia')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Signs — UX-014: theme colors */}
        <Card style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.cardTitleRow}>
            <Icon name="alert-circle" size={20} color={theme.colors.danger} />
            <Text style={[styles.cardTitle, { color: theme.colors.danger }]}>{t('emergency.signs')}</Text>
          </View>
          {signs.map((sign, i) => (
            <View key={`sign-${i}`} style={styles.listItem}>
              <View style={[styles.bullet, { backgroundColor: theme.colors.danger }]} />
              <Text style={[styles.listText, { color: cardText }]}>{sign}</Text>
            </View>
          ))}
        </Card>

        {/* Steps — UX-014: theme colors */}
        <Card style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.cardTitleRow}>
            <Icon name="list" size={20} color={cardText} />
            <Text style={[styles.cardTitle, { color: cardText }]}>{t('emergency.steps')}</Text>
          </View>
          {steps.map((step, i) => (
            <View key={`step-${i}`} style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: theme.colors.danger }]}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: cardText }]}>{step}</Text>
            </View>
          ))}
        </Card>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          {t('emergency.disclaimer')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 44,
    height: 44,
    minHeight: 44,
    minWidth: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  tabText: { color: '#fff', fontSize: 13 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },
  card: { gap: 12, borderRadius: 16 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bullet: { width: 8, height: 8, borderRadius: 4 },
  listText: { flex: 1, fontSize: 15, lineHeight: 22 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  stepNumberText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  stepText: { flex: 1, fontSize: 15, lineHeight: 22 },
  callButton: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  callButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  callIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonTitle: { fontSize: 18, fontWeight: '800' },
  callButtonSub: { fontSize: 14, marginTop: 2 },
  callButtonPhone: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  callButtonNoVet: { fontSize: 13, marginTop: 2, fontStyle: 'italic' },
  disclaimer: { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 18 },
});
