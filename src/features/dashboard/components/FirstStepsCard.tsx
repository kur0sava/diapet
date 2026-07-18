import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@shared/theme';
import { Icon } from '@shared/components/ui/Icon';
import type { IoniconName } from '@shared/components/ui';
import { useHomeNavigation } from '@navigation/hooks';
import { queryKeys } from '@shared/utils/queryKeys';
import { glucoseRepository, injectionRepository, feedingRepository } from '@storage/database';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { usePetStore } from '@shared/stores/petStore';

const AUTO_HIDE_MS = 24 * 60 * 60 * 1000; // 24h after completion

type StepId = 'glucose' | 'feeding' | 'injection';
interface Step {
  id: StepId;
  icon: IoniconName;
  labelKey: string;
  done: boolean;
  onPress: () => void;
  color: string;
}

/**
 * H9 First Win — pinned card on Dashboard guiding new users through
 * their first glucose reading, feeding, and injection. Auto-hides 24h
 * after all 3 are completed, or when user dismisses manually.
 */
export function FirstStepsCard() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useHomeNavigation();
  const activePet = usePetStore(s => s.activePet);
  const petId = activePet?.id ?? '';

  const [dismissed, setDismissed] = useState(
    () => storage.getBoolean(StorageKeys.FIRST_STEPS_DISMISSED) ?? false
  );

  const { data: latestGlucose } = useQuery({
    queryKey: queryKeys.glucose.latest(petId),
    queryFn: () => glucoseRepository.findLatest(petId),
    enabled: !!petId,
  });
  const { data: lastInjection } = useQuery({
    queryKey: queryKeys.injections.latest(petId),
    queryFn: () => injectionRepository.findLatest(petId),
    enabled: !!petId,
  });
  const { data: lastFeeding } = useQuery({
    queryKey: ['feedings', 'latest', petId],
    queryFn: () => feedingRepository.findLatest(petId),
    enabled: !!petId,
  });

  const doneGlucose = !!latestGlucose;
  const doneInjection = !!lastInjection;
  const doneFeeding = !!lastFeeding;
  const doneCount = (doneGlucose ? 1 : 0) + (doneFeeding ? 1 : 0) + (doneInjection ? 1 : 0);
  const allDone = doneCount === 3;

  // completedAt read once per mount; auto-hide kicks in on the next Dashboard visit
  // after 24h have passed since completion. Storage write happens in an effect
  // without forcing a re-render (card stays visible until next mount).
  const [completedAt] = useState(
    () => storage.getNumber(StorageKeys.FIRST_STEPS_COMPLETED_AT) ?? 0
  );
  const [mountedAt] = useState(() => Date.now());

  useEffect(() => {
    if (allDone && !storage.getNumber(StorageKeys.FIRST_STEPS_COMPLETED_AT)) {
      storage.set(StorageKeys.FIRST_STEPS_COMPLETED_AT, Date.now());
    }
  }, [allDone]);

  const shouldAutoHide = allDone && completedAt > 0 && mountedAt - completedAt > AUTO_HIDE_MS;

  const handleDismiss = useCallback(() => {
    storage.set(StorageKeys.FIRST_STEPS_DISMISSED, true);
    setDismissed(true);
  }, []);

  const steps: Step[] = useMemo(
    () => [
      {
        id: 'glucose',
        icon: 'water',
        labelKey: 'firstSteps.stepGlucose',
        done: doneGlucose,
        onPress: () => navigation.navigate('LogGlucose', {}),
        color: theme.colors.primary,
      },
      {
        id: 'feeding',
        icon: 'restaurant',
        labelKey: 'firstSteps.stepFeeding',
        done: doneFeeding,
        onPress: () => navigation.navigate('LogFeeding'),
        color: theme.colors.success,
      },
      {
        id: 'injection',
        icon: 'medkit',
        labelKey: 'firstSteps.stepInjection',
        done: doneInjection,
        onPress: () => navigation.navigate('LogInjection'),
        color: theme.colors.secondary,
      },
    ],
    [doneGlucose, doneFeeding, doneInjection, navigation, theme]
  );

  if (dismissed || shouldAutoHide) return null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.primary + '30',
          ...theme.shadows.sm,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
            {allDone
              ? t('firstSteps.completed')
              : t('firstSteps.title', { name: activePet?.name ?? '' })}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {allDone ? t('firstSteps.completedDesc') : t('firstSteps.subtitle')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.closeBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('common.dismiss')}
        >
          <Icon name="close" size={18} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: theme.colors.background }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: theme.colors.primary,
              width: `${(doneCount / 3) * 100}%`,
            },
          ]}
        />
      </View>
      <Text style={[styles.progressLabel, { color: theme.colors.textTertiary }]}>
        {t('firstSteps.progress', { done: doneCount, total: 3 })}
      </Text>

      {/* Steps */}
      <View style={styles.steps}>
        {steps.map(step => (
          <TouchableOpacity
            key={step.id}
            style={[
              styles.stepRow,
              {
                backgroundColor: step.done ? theme.colors.successLight : theme.colors.background,
                opacity: step.done ? 0.7 : 1,
              },
            ]}
            onPress={step.onPress}
            disabled={step.done}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.stepIcon,
                {
                  backgroundColor: step.done ? theme.colors.success : step.color + '20',
                },
              ]}
            >
              {step.done ? (
                <Icon name="checkmark" size={18} color="#fff" />
              ) : (
                <Icon name={step.icon} size={18} color={step.color} />
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                {
                  color: step.done ? theme.colors.textSecondary : theme.colors.text,
                  fontFamily: theme.fonts.semibold,
                  textDecorationLine: step.done ? 'line-through' : 'none',
                },
              ]}
            >
              {t(step.labelKey)}
            </Text>
            {!step.done && (
              <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  title: { fontSize: 15, marginBottom: 2 },
  subtitle: { fontSize: 12, lineHeight: 16 },
  closeBtn: {
    width: 44,
    height: 44,
    marginLeft: 8,
    marginTop: -10,
    marginRight: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 11, textAlign: 'right', marginBottom: 10 },
  steps: { gap: 8 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: { flex: 1, fontSize: 13 },
});
