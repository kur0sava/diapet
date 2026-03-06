import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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

  const vetPhone = storage.getString('vetPhone');
  const vetName = storage.getString('vetName');

  const callVet = () => {
    if (!vetPhone) {
      // UX-013: Navigate to edit pet screen to add vet contact
      Alert.alert(t('emergency.noVetContact'), t('emergency.addVetContact'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('emergency.call112'), onPress: () => Linking.openURL('tel:112') },
        { text: t('emergency.goToSettings'), onPress: () => navigation.navigate('Main', { screen: 'More', params: { screen: 'EditPet' } } as any) },
      ]);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Linking.openURL(`tel:${vetPhone}`);
  };

  const hypoSigns = t('emergency.hypoSigns', { returnObjects: true }) as string[];
  const hypoSteps = t('emergency.hypoSteps', { returnObjects: true }) as string[];
  const hyperSigns = t('emergency.hyperSigns', { returnObjects: true }) as string[];
  const hyperSteps = t('emergency.hyperSteps', { returnObjects: true }) as string[];

  const signs = activeTab === 'hypoglycemia' ? hypoSigns : hyperSigns;
  const steps = activeTab === 'hypoglycemia' ? hypoSteps : hyperSteps;

  // UX-014: Use theme-aware colors for dark mode support
  const cardBg = theme.colors.surface;
  const cardText = theme.colors.text;
  const cardTextSecondary = theme.colors.textSecondary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FF3B30' }]}>
      <StatusBar barStyle="light-content" />

      {/* Header — UX-012: emoji → Ionicons */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="warning" size={28} color="#fff" style={{ marginBottom: 2 }} />
          <Text style={styles.headerTitle}>{t('emergency.title')}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* UX-011: Call Vet Button at TOP — most critical action */}
      <TouchableOpacity
        style={[styles.callButton, { marginHorizontal: 16, marginBottom: 12 }]}
        onPress={callVet}
        activeOpacity={0.85}
      >
        <View style={styles.callButtonContent}>
          <View style={styles.callIconCircle}>
            <Ionicons name="call" size={28} color="#FF3B30" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.callButtonTitle}>{t('emergency.callVet')}</Text>
            {vetName && <Text style={styles.callButtonSub}>{vetName}</Text>}
            {vetPhone ? (
              <Text style={styles.callButtonPhone}>{vetPhone}</Text>
            ) : (
              <Text style={styles.callButtonNoVet}>{t('emergency.tapToAddVet')}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
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
          <Ionicons name="trending-down" size={16} color="#fff" style={{ marginRight: 4 }} />
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
          <Ionicons name="trending-up" size={16} color="#fff" style={{ marginRight: 4 }} />
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
            <Ionicons name="alert-circle" size={20} color="#FF3B30" />
            <Text style={[styles.cardTitle, { color: '#FF3B30' }]}>{t('emergency.signs')}</Text>
          </View>
          {signs.map((sign, i) => (
            <View key={`sign-${i}`} style={styles.listItem}>
              <View style={[styles.bullet, { backgroundColor: '#FF3B30' }]} />
              <Text style={[styles.listText, { color: cardText }]}>{sign}</Text>
            </View>
          ))}
        </Card>

        {/* Steps — UX-014: theme colors */}
        <Card style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="list" size={20} color={cardText} />
            <Text style={[styles.cardTitle, { color: cardText }]}>{t('emergency.steps')}</Text>
          </View>
          {steps.map((step, i) => (
            <View key={`step-${i}`} style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: '#FF3B30' }]}>
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
    backgroundColor: '#fff',
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
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonTitle: { fontSize: 18, fontWeight: '800', color: '#FF3B30' },
  callButtonSub: { fontSize: 14, color: '#1C1C1E', marginTop: 2 },
  callButtonPhone: { fontSize: 16, color: '#4F8EF7', fontWeight: '600', marginTop: 2 },
  callButtonNoVet: { fontSize: 13, color: '#8E8E93', marginTop: 2, fontStyle: 'italic' },
  disclaimer: { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 18 },
});
