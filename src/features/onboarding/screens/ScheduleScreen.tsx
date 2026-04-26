import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useOnboardingNavigation } from '@navigation/hooks';
import type { OnboardingStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button } from '@shared/components/ui';
import { Icon } from '@shared/components/ui/Icon';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MAX_SCHEDULE_TIMES } from '@storage/domain/types';

export default function ScheduleScreen() {
  const navigation = useOnboardingNavigation();
  const route = useRoute<RouteProp<OnboardingStackParamList, 'Schedule'>>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const petData = route.params?.petData ?? {};

  const [injectionTimes, setInjectionTimes] = useState<string[]>(['08:00', '20:00']);
  const [feedingTimes, setFeedingTimes] = useState<string[]>(['08:00', '20:00']);
  const [showPicker, setShowPicker] = useState<{
    type: 'injection' | 'feeding';
    index: number;
  } | null>(null);

  const addTime = (type: 'injection' | 'feeding') => {
    const times = type === 'injection' ? injectionTimes : feedingTimes;
    if (times.length >= MAX_SCHEDULE_TIMES) return;
    // Find a unique time that doesn't collide with existing entries
    const existingSet = new Set(times);
    let newTime = '12:00';
    for (let h = 6; h < 24; h++) {
      const candidate = `${h.toString().padStart(2, '0')}:00`;
      if (!existingSet.has(candidate)) {
        newTime = candidate;
        break;
      }
    }
    const newIndex = times.length;
    if (type === 'injection') {
      setInjectionTimes([...injectionTimes, newTime]);
    } else {
      setFeedingTimes([...feedingTimes, newTime]);
    }
    // Immediately open picker for the newly added time
    setShowPicker({ type, index: newIndex });
  };

  const removeTime = (type: 'injection' | 'feeding', index: number) => {
    if (type === 'injection') {
      if (injectionTimes.length <= 1) {
        Alert.alert(t('common.error'), t('onboarding.minOneInjection'));
        return;
      }
      setInjectionTimes(injectionTimes.filter((_, i) => i !== index));
    } else {
      if (feedingTimes.length <= 1) {
        Alert.alert(t('common.error'), t('onboarding.minOneFeeding'));
        return;
      }
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
        <View
          key={`${type}-${index}-${time}`}
          style={[
            styles.timeRow,
            { backgroundColor: theme.colors.surfaceSecondary, borderRadius: 12 },
          ]}
        >
          {/* H008: tap time to edit via DateTimePicker */}
          <TouchableOpacity onPress={() => setShowPicker({ type, index })} style={{ flex: 1 }}>
            <Text
              style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600', padding: 14 }}
            >
              {time}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeTime(type, index)} style={styles.removeBtn}>
            <Icon name="close-circle" size={24} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        style={[styles.addBtn, { borderColor: theme.colors.primary, borderRadius: 12 }]}
        onPress={() => addTime(type)}
      >
        <Icon name="add-circle-outline" size={20} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
          {type === 'injection' ? t('onboarding.addInjectionTime') : t('onboarding.addFeedingTime')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: theme.colors.primary, fontSize: 16 }}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('onboarding.injectionTime')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('onboarding.scheduleDesc')}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="medkit-outline" size={22} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('onboarding.injectionTime')}
            </Text>
          </View>
          {renderTimeList('injection', injectionTimes)}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="restaurant-outline" size={22} color={theme.colors.warning} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('onboarding.feedingTime')}
            </Text>
          </View>
          {renderTimeList('feeding', feedingTimes)}
        </View>

        <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
          <Button title={t('onboarding.next')} onPress={handleContinue} fullWidth size="lg" />
        </View>
      </ScrollView>

      {/* H008: DateTimePicker for editing existing time slots */}
      {showPicker && (
        <DateTimePicker
          value={(() => {
            const list = showPicker.type === 'injection' ? injectionTimes : feedingTimes;
            const [h, m] = list[showPicker.index].split(':').map(Number);
            const d = new Date();
            d.setHours(h, m, 0, 0);
            return d;
          })()}
          mode="time"
          is24Hour={true}
          onChange={(_, date) => {
            if (date) {
              const hh = date.getHours().toString().padStart(2, '0');
              const mm = date.getMinutes().toString().padStart(2, '0');
              const newTime = `${hh}:${mm}`;
              const times = showPicker.type === 'injection' ? injectionTimes : feedingTimes;
              // Prevent duplicate times
              if (times.some((existing, i) => i !== showPicker.index && existing === newTime)) {
                Alert.alert(
                  t('common.error'),
                  t('onboarding.duplicateTime', { defaultValue: 'This time already exists' })
                );
                setShowPicker(null);
                return;
              }
              if (showPicker.type === 'injection') {
                setInjectionTimes(prev =>
                  prev.map((existing, i) => (i === showPicker.index ? newTime : existing))
                );
              } else {
                setFeedingTimes(prev =>
                  prev.map((existing, i) => (i === showPicker.index ? newTime : existing))
                );
              }
            }
            setShowPicker(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  backBtn: {
    paddingHorizontal: 24,
    paddingTop: 16,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  header: { padding: 24, paddingBottom: 0 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  section: { padding: 24, paddingTop: 16, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  removeBtn: { padding: 14 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
});
