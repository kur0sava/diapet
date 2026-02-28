import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useOnboardingNavigation } from '@navigation/hooks';
import type { OnboardingStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ScheduleScreen() {
  const navigation = useOnboardingNavigation();
  const route = useRoute<RouteProp<OnboardingStackParamList, 'Schedule'>>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const petData = route.params?.petData ?? {};

  const [injectionTimes, setInjectionTimes] = useState<string[]>(['08:00', '20:00']);
  const [feedingTimes, setFeedingTimes] = useState<string[]>(['08:00', '20:00']);
  const [showPicker, setShowPicker] = useState<{ type: 'injection' | 'feeding'; index: number } | null>(null);

  const formatTime = (time: string) => time;

  const addTime = (type: 'injection' | 'feeding') => {
    if (type === 'injection') {
      setInjectionTimes([...injectionTimes, '12:00']);
    } else {
      setFeedingTimes([...feedingTimes, '12:00']);
    }
  };

  const removeTime = (type: 'injection' | 'feeding', index: number) => {
    if (type === 'injection') {
      setInjectionTimes(injectionTimes.filter((_, i) => i !== index));
    } else {
      setFeedingTimes(feedingTimes.filter((_, i) => i !== index));
    }
  };

  const handleContinue = () => {
    navigation.navigate('VetContact', {
      petData,
      injectionTimes,
      feedingTimes,
    });
  };

  const renderTimeList = (type: 'injection' | 'feeding', times: string[]) => (
    <View style={{ gap: 8 }}>
      {times.map((time, index) => (
        <View key={`${type}-${index}-${time}`} style={[styles.timeRow, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: 12 }]}>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600', padding: 14 }}>{time}</Text>
          <TouchableOpacity onPress={() => removeTime(type, index)} style={styles.removeBtn}>
            <Ionicons name="close-circle" size={24} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        style={[styles.addBtn, { borderColor: theme.colors.primary, borderRadius: 12 }]}
        onPress={() => addTime(type)}
      >
        <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
          {type === 'injection' ? t('onboarding.addInjectionTime') : t('onboarding.addFeedingTime')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: theme.colors.primary, fontSize: 16 }}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('onboarding.injectionTime')}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('onboarding.scheduleDesc')}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medkit-outline" size={22} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('onboarding.injectionTime')}</Text>
          </View>
          {renderTimeList('injection', injectionTimes)}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant-outline" size={22} color={theme.colors.warning} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('onboarding.feedingTime')}</Text>
          </View>
          {renderTimeList('feeding', feedingTimes)}
        </View>

        <Button title={t('onboarding.next')} onPress={handleContinue} fullWidth size="lg" style={{ margin: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  backBtn: { paddingHorizontal: 24, paddingTop: 16 },
  header: { padding: 24, paddingBottom: 0 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  section: { padding: 24, paddingTop: 16, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  removeBtn: { padding: 14 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderWidth: 1.5, borderStyle: 'dashed' },
});
