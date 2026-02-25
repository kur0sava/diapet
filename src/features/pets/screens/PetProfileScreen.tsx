import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMoreNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { usePetStore } from '@shared/stores/petStore';
import { useQuery } from '@tanstack/react-query';
import { scheduleRepository } from '@storage/database';
import { Card } from '@shared/components/ui';

export default function PetProfileScreen() {
  const navigation = useMoreNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);

  const { data: injectionTimes = [] } = useQuery({
    queryKey: ['schedule', 'injections', activePet?.id],
    queryFn: () => scheduleRepository.getInjectionTimes(activePet!.id),
    enabled: !!activePet?.id,
  });

  const { data: feedingTimes = [] } = useQuery({
    queryKey: ['schedule', 'feedings', activePet?.id],
    queryFn: () => scheduleRepository.getFeedingTimes(activePet!.id),
    enabled: !!activePet?.id,
  });

  if (!activePet) return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    </SafeAreaView>
  );

  const diabetesLabels: Record<string, string> = { type1: t('pets.diabetesType1Short'), type2: t('pets.diabetesType2Short'), unknown: t('pets.diabetesUnknown') };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={[styles.infoRow, { borderBottomColor: theme.colors.divider }]}>
      <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ color: theme.colors.primary }}>← {t('common.back')}</Text></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('pets.title')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditPet')}><Text style={{ color: theme.colors.primary }}>{t('common.edit')}</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight }]}><Text style={styles.avatarEmoji}>🐱</Text></View>
          <Text style={[styles.petName, { color: theme.colors.text }]}>{activePet.name}</Text>
          {activePet.insulinType && (
            <View style={[styles.insulinBadge, { backgroundColor: theme.colors.secondaryLight }]}>
              <Text style={[styles.insulinText, { color: theme.colors.secondary }]}>💉 {activePet.insulinType}</Text>
            </View>
          )}
        </View>
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>{t('pets.basicInfo')}</Text>
          {activePet.weightKg && <InfoRow label={t('pets.weight')} value={`${activePet.weightKg} ${t('common.kg')}`} />}
          {activePet.birthYear && <InfoRow label={t('pets.age')} value={`${new Date().getFullYear() - activePet.birthYear} ${t('pets.years')}`} />}
          <InfoRow label={t('pets.gender')} value={activePet.gender === 'male' ? t('common.male') : activePet.gender === 'female' ? t('common.female') : t('common.unknown')} />
          <InfoRow label={t('pets.diabetesType')} value={diabetesLabels[activePet.diabetesType]} />
          {activePet.diagnosisDate && <InfoRow label={t('pets.diagnosisDate')} value={new Date(activePet.diagnosisDate).toLocaleDateString('ru-RU')} />}
        </Card>
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>{t('pets.schedule')}</Text>
          <Text style={[styles.scheduleLabel, { color: theme.colors.text }]}>💉 {t('pets.injections')}</Text>
          <View style={styles.timeChips}>{injectionTimes.map(s => (<View key={s.id} style={[styles.timeChip, { backgroundColor: theme.colors.primaryLight }]}><Text style={[styles.timeText, { color: theme.colors.primary }]}>{s.timeOfDay}</Text></View>))}</View>
          <Text style={[styles.scheduleLabel, { color: theme.colors.text, marginTop: 12 }]}>🍽️ {t('pets.feedings')}</Text>
          <View style={styles.timeChips}>{feedingTimes.map(s => (<View key={s.id} style={[styles.timeChip, { backgroundColor: theme.colors.successLight }]}><Text style={[styles.timeText, { color: theme.colors.success }]}>{s.timeOfDay}</Text></View>))}</View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', paddingVertical: 16 },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarEmoji: { fontSize: 52 },
  petName: { fontSize: 28, fontWeight: '800' },
  insulinBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 8 },
  insulinText: { fontSize: 14, fontWeight: '600' },
  card: { gap: 4 },
  cardTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5 },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  scheduleLabel: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  timeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  timeText: { fontSize: 15, fontWeight: '700' },
});
