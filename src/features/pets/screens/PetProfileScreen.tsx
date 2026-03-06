import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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

  const renderInfoRow = (label: string, value: string) => (
    <View style={[styles.infoRow, { borderBottomColor: theme.colors.divider }]}>
      <Text style={[styles.infoLabel, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary, fontFamily: theme.fonts.medium }}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>{t('pets.title')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditPet')}>
          <Text style={{ color: theme.colors.primary, fontFamily: theme.fonts.medium }}>{t('common.edit')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={theme.gradients.primary as [string, string]}
            style={styles.avatar}
          >
            <Ionicons name="paw" size={48} color="#fff" />
          </LinearGradient>
          <Text style={[styles.petName, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>{activePet.name}</Text>
          {activePet.insulinType && (
            <View style={[styles.insulinBadge, { backgroundColor: theme.colors.secondaryLight }]}>
              <Ionicons name="fitness-outline" size={16} color={theme.colors.secondary} />
              <Text style={[styles.insulinText, { color: theme.colors.secondary, fontFamily: theme.fonts.semibold }]}>{activePet.insulinType}</Text>
            </View>
          )}
        </View>
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.textSecondary, fontFamily: theme.fonts.bold }]}>{t('pets.basicInfo')}</Text>
          {activePet.weightKg && renderInfoRow(t('pets.weight'), `${activePet.weightKg} ${t('common.kg')}`)}
          {activePet.birthYear && renderInfoRow(t('pets.age'), `${new Date().getFullYear() - activePet.birthYear} ${t('pets.years')}`)}
          {renderInfoRow(t('pets.gender'), activePet.gender === 'male' ? t('common.male') : activePet.gender === 'female' ? t('common.female') : t('common.unknown'))}
          {renderInfoRow(t('pets.diabetesType'), diabetesLabels[activePet.diabetesType])}
          {activePet.diagnosisDate && renderInfoRow(t('pets.diagnosisDate'), new Date(activePet.diagnosisDate).toLocaleDateString('ru-RU'))}
        </Card>
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.textSecondary, fontFamily: theme.fonts.bold }]}>{t('pets.schedule')}</Text>
          <View style={styles.scheduleLabelRow}>
            <Ionicons name="fitness-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.scheduleLabel, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>{t('pets.injections')}</Text>
          </View>
          <View style={styles.timeChips}>{injectionTimes.map(s => (<View key={s.id} style={[styles.timeChip, { backgroundColor: theme.colors.primaryLight }]}><Text style={[styles.timeText, { color: theme.colors.primary, fontFamily: theme.fonts.bold }]}>{s.timeOfDay}</Text></View>))}</View>
          <View style={[styles.scheduleLabelRow, { marginTop: 12 }]}>
            <Ionicons name="restaurant-outline" size={18} color={theme.colors.success} />
            <Text style={[styles.scheduleLabel, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>{t('pets.feedings')}</Text>
          </View>
          <View style={styles.timeChips}>{feedingTimes.map(s => (<View key={s.id} style={[styles.timeChip, { backgroundColor: theme.colors.successLight }]}><Text style={[styles.timeText, { color: theme.colors.success, fontFamily: theme.fonts.bold }]}>{s.timeOfDay}</Text></View>))}</View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5 },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 44, minWidth: 44 },
  headerTitle: { fontSize: 17 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', paddingVertical: 16 },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  petName: { fontSize: 28 },
  insulinBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 8 },
  insulinText: { fontSize: 14 },
  card: { gap: 4 },
  cardTitle: { fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5 },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14 },
  scheduleLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  scheduleLabel: { fontSize: 15 },
  timeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  timeText: { fontSize: 15 },
});
