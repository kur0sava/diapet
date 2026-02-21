import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      Alert.alert(t('emergency.noVetContact'), t('emergency.addVetContact'));
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FF3B30' }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerIcon}>🚨</Text>
          <Text style={styles.headerTitle}>{t('emergency.title')}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Tab selector */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: activeTab === 'hypoglycemia' ? 'rgba(255,255,255,0.25)' : 'transparent' },
          ]}
          onPress={() => setActiveTab('hypoglycemia')}
        >
          <Text style={[styles.tabText, { fontWeight: activeTab === 'hypoglycemia' ? '700' : '400' }]}>
            📉 {t('emergency.hypoglycemia')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: activeTab === 'hyperglycemia' ? 'rgba(255,255,255,0.25)' : 'transparent' },
          ]}
          onPress={() => setActiveTab('hyperglycemia')}
        >
          <Text style={[styles.tabText, { fontWeight: activeTab === 'hyperglycemia' ? '700' : '400' }]}>
            📈 {t('emergency.hyperglycemia')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Signs */}
        <Card style={[styles.card, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
          <Text style={[styles.cardTitle, { color: '#FF3B30' }]}>⚠️ {t('emergency.signs')}</Text>
          {signs.map((sign, i) => (
            <View key={`sign-${i}`} style={styles.listItem}>
              <View style={[styles.bullet, { backgroundColor: '#FF3B30' }]} />
              <Text style={styles.listText}>{sign}</Text>
            </View>
          ))}
        </Card>

        {/* Steps */}
        <Card style={[styles.card, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
          <Text style={[styles.cardTitle, { color: '#1C1C1E' }]}>📋 {t('emergency.steps')}</Text>
          {steps.map((step, i) => (
            <View key={`step-${i}`} style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: '#FF3B30' }]}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </Card>

        {/* Call Vet Button */}
        <TouchableOpacity
          style={styles.callButton}
          onPress={callVet}
          activeOpacity={0.85}
        >
          <View style={styles.callButtonContent}>
            <Text style={styles.callButtonIcon}>📞</Text>
            <View>
              <Text style={styles.callButtonTitle}>{t('emergency.callVet')}</Text>
              {vetName && <Text style={styles.callButtonSub}>{vetName}</Text>}
              {vetPhone && <Text style={styles.callButtonPhone}>{vetPhone}</Text>}
            </View>
          </View>
        </TouchableOpacity>

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
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  headerCenter: { alignItems: 'center' },
  headerIcon: { fontSize: 28, marginBottom: 2 },
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
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabText: { color: '#fff', fontSize: 13 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },
  card: { gap: 12, borderRadius: 16 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bullet: { width: 8, height: 8, borderRadius: 4 },
  listText: { flex: 1, fontSize: 15, color: '#1C1C1E', lineHeight: 22 },
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
  stepText: { flex: 1, fontSize: 15, color: '#1C1C1E', lineHeight: 22 },
  callButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  callButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  callButtonIcon: { fontSize: 40 },
  callButtonTitle: { fontSize: 18, fontWeight: '800', color: '#FF3B30' },
  callButtonSub: { fontSize: 14, color: '#1C1C1E', marginTop: 2 },
  callButtonPhone: { fontSize: 16, color: '#4F8EF7', fontWeight: '600', marginTop: 2 },
  disclaimer: { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 18 },
});
