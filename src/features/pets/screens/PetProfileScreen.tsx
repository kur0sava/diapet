import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@shared/components/ui/Icon';
import { PetAvatar } from '@shared/components/ui/PetAvatar';
import { useMoreNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import i18n from '@shared/i18n';
import { parseDateOnly } from '@shared/utils/dateUtils';
import { useTheme } from '@shared/theme';
import { usePetStore } from '@shared/stores/petStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@shared/utils/queryKeys';
import { scheduleRepository, petRepository } from '@storage/database';
import { Card } from '@shared/components/ui';
import { restoreScheduleNotifications } from '@shared/hooks/useNotifications';

export default function PetProfileScreen() {
  const navigation = useMoreNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const pets = usePetStore(s => s.pets);
  const loadPets = usePetStore(s => s.loadPets);
  const queryClient = useQueryClient();
  const deletingRef = useRef(false);

  const handleDeletePet = () => {
    if (!activePet || deletingRef.current) return;
    // Deleting the LAST pet would leave a petless app with onboarding
    // already completed — every screen would sit on empty states with no
    // path back. Point at the full reset in Settings instead.
    if (pets.length <= 1) {
      Alert.alert(t('pets.deletePet'), t('pets.cantDeleteLastPet'));
      return;
    }
    Alert.alert(t('pets.deletePetConfirm', { name: activePet.name }), t('pets.deletePetWarning'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          Alert.alert(t('pets.deletePetFinal', { name: activePet.name }), undefined, [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('settings.deleteForever'),
              style: 'destructive',
              onPress: async () => {
                if (deletingRef.current) return;
                deletingRef.current = true;
                try {
                  // FK CASCADE removes readings/injections/feedings/symptoms/
                  // expenses/schedules; petRepository.delete also cleans the
                  // per-pet MMKV keys (vet contact, AI/prediction caches).
                  await petRepository.delete(activePet.id);
                  await loadPets(); // re-picks the first remaining pet
                  queryClient.invalidateQueries();
                  // Rebuild reminders so the deleted pet's alarms disappear
                  restoreScheduleNotifications().catch(() => {});
                  navigation.goBack();
                } catch {
                  Alert.alert(t('common.error'), t('pets.deleteError'));
                } finally {
                  deletingRef.current = false;
                }
              },
            },
          ]);
        },
      },
    ]);
  };

  const { data: injectionTimes = [] } = useQuery({
    queryKey: queryKeys.schedule.injections(activePet?.id ?? ''),
    queryFn: () => scheduleRepository.getInjectionTimes(activePet?.id ?? ''),
    enabled: !!activePet?.id,
  });

  const { data: feedingTimes = [] } = useQuery({
    queryKey: queryKeys.schedule.feedings(activePet?.id ?? ''),
    queryFn: () => scheduleRepository.getFeedingTimes(activePet?.id ?? ''),
    enabled: !!activePet?.id,
  });

  if (!activePet)
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );

  const diabetesLabels: Record<string, string> = {
    type1: t('pets.diabetesType1Short'),
    type2: t('pets.diabetesType2Short'),
    unknown: t('pets.diabetesUnknown'),
  };

  const renderInfoRow = (label: string, value: string) => (
    <View style={[styles.infoRow, { borderBottomColor: theme.colors.divider }]}>
      <Text
        style={[
          styles.infoLabel,
          { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        style={[styles.infoValue, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Icon name="chevron-back" size={22} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary, fontFamily: theme.fonts.medium }}>
            {t('common.back')}
          </Text>
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            { color: theme.colors.text, fontFamily: theme.fonts.semibold },
          ]}
          numberOfLines={1}
        >
          {t('pets.title')}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditPet')} style={styles.navBtn}>
          <Text
            style={{ color: theme.colors.primary, fontFamily: theme.fonts.medium }}
            numberOfLines={1}
          >
            {t('common.edit')}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={theme.gradients.primary as [string, string]}
            style={styles.avatar}
          >
            <PetAvatar
              photoUri={activePet.photoUri}
              species={activePet.species}
              size={96}
              faceSize={52}
            />
          </LinearGradient>
          <Text
            style={[styles.petName, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {activePet.name}
          </Text>
          {activePet.insulinType && (
            <View style={[styles.insulinBadge, { backgroundColor: theme.colors.secondaryLight }]}>
              <Icon name="fitness-outline" size={16} color={theme.colors.secondary} />
              <Text
                style={[
                  styles.insulinText,
                  { color: theme.colors.secondary, fontFamily: theme.fonts.semibold },
                ]}
              >
                {activePet.insulinType}
              </Text>
            </View>
          )}
        </View>
        <Card style={styles.card}>
          <Text
            style={[
              styles.cardTitle,
              { color: theme.colors.textSecondary, fontFamily: theme.fonts.bold },
            ]}
          >
            {t('pets.basicInfo')}
          </Text>
          {renderInfoRow(
            t('pets.species'),
            activePet.species === 'cat'
              ? t('pets.cat')
              : activePet.species === 'dog'
                ? t('pets.dog')
                : t('pets.pet')
          )}
          {/* Weight row is always shown and links to the history/chart screen
              (v2.6 batch 3.5) — even a pet without a recorded weight needs a
              path to start logging it. */}
          <TouchableOpacity
            style={[styles.infoRow, { borderBottomColor: theme.colors.divider }]}
            onPress={() => navigation.navigate('WeightHistory')}
            accessibilityRole="button"
            accessibilityLabel={t('weight.title')}
          >
            <Text
              style={[
                styles.infoLabel,
                { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular },
              ]}
              numberOfLines={1}
            >
              {t('pets.weight')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.fonts.semibold,
                    maxWidth: undefined,
                  },
                ]}
                numberOfLines={1}
              >
                {activePet.weightKg != null && activePet.weightKg > 0
                  ? `${activePet.weightKg} ${t('common.kg')}`
                  : t('weight.notSet')}
              </Text>
              <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </View>
          </TouchableOpacity>
          {activePet.birthYear != null &&
            activePet.birthYear > 0 &&
            renderInfoRow(
              t('pets.age'),
              `${new Date().getFullYear() - activePet.birthYear} ${t('pets.years')}`
            )}
          {renderInfoRow(
            t('pets.gender'),
            activePet.gender === 'male'
              ? t('common.male')
              : activePet.gender === 'female'
                ? t('common.female')
                : t('common.unknown')
          )}
          {renderInfoRow(t('pets.diabetesType'), diabetesLabels[activePet.diabetesType])}
          {activePet.diagnosisDate &&
            renderInfoRow(
              t('pets.diagnosisDate'),
              parseDateOnly(activePet.diagnosisDate).toLocaleDateString(
                i18n.language === 'ru' ? 'ru-RU' : 'en-US'
              )
            )}
        </Card>
        <Card style={styles.card}>
          <Text
            style={[
              styles.cardTitle,
              { color: theme.colors.textSecondary, fontFamily: theme.fonts.bold },
            ]}
          >
            {t('pets.schedule')}
          </Text>
          <View style={styles.scheduleLabelRow}>
            <Icon name="fitness-outline" size={18} color={theme.colors.primary} />
            <Text
              style={[
                styles.scheduleLabel,
                { color: theme.colors.text, fontFamily: theme.fonts.semibold },
              ]}
            >
              {t('pets.injections')}
            </Text>
          </View>
          <View style={styles.timeChips}>
            {injectionTimes.map(s => (
              <View
                key={s.id}
                style={[styles.timeChip, { backgroundColor: theme.colors.primaryLight }]}
              >
                <Text
                  style={[
                    styles.timeText,
                    { color: theme.colors.primary, fontFamily: theme.fonts.bold },
                  ]}
                >
                  {s.timeOfDay}
                </Text>
              </View>
            ))}
          </View>
          <View style={[styles.scheduleLabelRow, { marginTop: 12 }]}>
            <Icon name="restaurant-outline" size={18} color={theme.colors.success} />
            <Text
              style={[
                styles.scheduleLabel,
                { color: theme.colors.text, fontFamily: theme.fonts.semibold },
              ]}
            >
              {t('pets.feedings')}
            </Text>
          </View>
          <View style={styles.timeChips}>
            {feedingTimes.map(s => (
              <View
                key={s.id}
                style={[styles.timeChip, { backgroundColor: theme.colors.successLight }]}
              >
                <Text
                  style={[
                    styles.timeText,
                    { color: theme.colors.success, fontFamily: theme.fonts.bold },
                  ]}
                >
                  {s.timeOfDay}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Danger zone — the only way to remove a single pet without wiping
            the whole app (Settings → Delete all data). */}
        <TouchableOpacity
          style={[styles.deleteBtn, { borderColor: theme.colors.danger }]}
          onPress={handleDeletePet}
          accessibilityRole="button"
          accessibilityLabel={t('pets.deletePet')}
        >
          <Icon name="trash-outline" size={18} color={theme.colors.danger} />
          <Text
            style={[
              styles.deleteBtnText,
              { color: theme.colors.danger, fontFamily: theme.fonts.semibold },
            ]}
          >
            {t('pets.deletePet')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0.5,
    gap: 8,
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 44, minWidth: 44 },
  headerTitle: { fontSize: 17, flex: 1, textAlign: 'center' },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', paddingVertical: 16 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  petName: { fontSize: 28 },
  insulinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  insulinText: { fontSize: 14 },
  card: { gap: 4 },
  cardTitle: { fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  infoLabel: { fontSize: 14, flex: 1, flexShrink: 1 },
  infoValue: { fontSize: 14, maxWidth: '50%', textAlign: 'right' as const },
  scheduleLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  scheduleLabel: { fontSize: 15 },
  timeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  timeText: { fontSize: 15 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 8,
  },
  deleteBtnText: { fontSize: 15 },
});
