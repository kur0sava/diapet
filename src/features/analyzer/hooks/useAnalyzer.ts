/**
 * useAnalyzer — hook that runs the full local analyzer pipeline.
 * Fetches data from repositories and produces trends, patterns, risk score, and alerts.
 */
import { useMemo, useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { queryKeys } from '@shared/utils/queryKeys';
import { usePetStore } from '@shared/stores/petStore';
import {
  glucoseRepository,
  injectionRepository,
  feedingRepository,
  symptomRepository,
  scheduleRepository,
  weightRepository,
} from '@storage/database';
import { analyzeTrends } from '../engine/trendEngine';
import { detectPatterns } from '../engine/patternDetector';
import { calculateRiskScore } from '../engine/riskScoreCalculator';
import { generateSmartAlerts, markAlertFired } from '../engine/smartAlerts';
import { sanitizePatterns, checkEmergencyThresholds } from '../engine/safetyGuard';
import { getSpeciesConfig } from '@shared/config/speciesConfig';
import type { InjectionLog } from '@storage/domain/types';

export function useAnalyzer() {
  const activePet = usePetStore(s => s.activePet);
  const petId = activePet?.id ?? '';
  const speciesConfig = useMemo(
    () => getSpeciesConfig(activePet?.species ?? 'cat'),
    [activePet?.species]
  );

  const { data: readings = [] } = useQuery({
    queryKey: [...queryKeys.glucose.all, 'analyzer', petId],
    queryFn: () => glucoseRepository.findAllByPetId(petId),
    enabled: !!petId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: injections = [] } = useQuery({
    queryKey: [...queryKeys.injections.all, 'analyzer', petId],
    queryFn: () => injectionRepository.findAllByPetId(petId),
    enabled: !!petId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: feedings = [] } = useQuery({
    queryKey: [...queryKeys.feedings.all, 'analyzer', petId],
    queryFn: () => feedingRepository.findAllByPetId(petId),
    enabled: !!petId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: symptoms = [] } = useQuery({
    queryKey: [...queryKeys.symptoms.all, 'analyzer', petId],
    queryFn: () => symptomRepository.findAllByPetId(petId),
    enabled: !!petId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: injectionSchedule = [] } = useQuery({
    queryKey: [...queryKeys.schedule.injections(petId), 'analyzer'],
    queryFn: () => scheduleRepository.getInjectionTimes(petId),
    enabled: !!petId,
    staleTime: 10 * 60 * 1000,
  });

  const scheduledInjectionsPerDay = injectionSchedule.length || 2;

  // v2.6 (batch 3.5): weight history feeds the analyzer's weight_trend factor —
  // previously previousWeightKg was never supplied and the factor sat at
  // neutral for everyone.
  const { data: previousWeightEntry } = useQuery({
    queryKey: [...queryKeys.weight.list(petId), 'previous'],
    queryFn: () => weightRepository.findPrevious(petId),
    enabled: !!petId,
    staleTime: 5 * 60 * 1000,
  });

  // Insulin logged inline on a glucose reading (LogGlucoseScreen) is not saved
  // as a separate InjectionLog, so adherence/dose-response/missed-injection
  // logic would otherwise treat those doses as "never given" — inflating the
  // risk score and firing false "missed injection" patterns. Merge them in as
  // synthetic injections for analysis only (no DB write, no UI duplication).
  const mergedInjections = useMemo<InjectionLog[]>(() => {
    const fromReadings: InjectionLog[] = readings
      .filter(r => typeof r.insulinDose === 'number' && r.insulinDose > 0)
      .map(r => ({
        id: `glc-${r.id}`,
        petId,
        insulinType: r.insulinType ?? '',
        doseUnits: r.insulinDose as number,
        administeredAt: r.recordedAt,
        createdAt: r.recordedAt,
      }));
    return fromReadings.length > 0 ? [...injections, ...fromReadings] : injections;
  }, [injections, readings, petId]);

  // Refresh `now` on every screen focus so alerts don't use stale time
  const [now, setNow] = useState(() => new Date());
  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
    }, [])
  );

  const trends = useMemo(
    () => (readings.length > 0 ? analyzeTrends(readings, now, speciesConfig) : null),
    [readings, now, speciesConfig]
  );

  const rawPatterns = useMemo(
    () =>
      readings.length > 0
        ? detectPatterns({
            readings,
            injections: mergedInjections,
            feedings,
            now,
            config: speciesConfig,
          })
        : [],
    [readings, mergedInjections, feedings, now, speciesConfig]
  );

  const patterns = useMemo(() => sanitizePatterns(rawPatterns), [rawPatterns]);

  const diagnosisDate = activePet?.diagnosisDate;
  const diagnosisDays = useMemo(() => {
    if (!diagnosisDate) return undefined;
    return Math.floor((now.getTime() - new Date(diagnosisDate).getTime()) / (24 * 60 * 60 * 1000));
  }, [diagnosisDate, now]);

  const riskScore = useMemo(
    () =>
      readings.length > 0
        ? calculateRiskScore({
            readings,
            injections: mergedInjections,
            feedings,
            symptoms,
            weightKg: activePet?.weightKg,
            previousWeightKg: previousWeightEntry?.weightKg,
            diagnosisDays,
            scheduledInjectionsPerDay,
            now,
            config: speciesConfig,
          })
        : null,
    [
      readings,
      mergedInjections,
      feedings,
      symptoms,
      activePet?.weightKg,
      previousWeightEntry?.weightKg,
      diagnosisDays,
      scheduledInjectionsPerDay,
      now,
      speciesConfig,
    ]
  );

  const smartAlert = useMemo(() => {
    if (!trends || !riskScore) return null;
    return generateSmartAlerts(trends, riskScore, patterns, readings, now, speciesConfig);
  }, [trends, riskScore, patterns, readings, now, speciesConfig]);

  // Side-effect: mark alert as fired OUTSIDE of useMemo
  useEffect(() => {
    if (smartAlert) {
      markAlertFired(smartAlert.type, now);
    }
  }, [smartAlert, now]);

  const emergencyAlerts = useMemo(
    () => checkEmergencyThresholds(readings, speciesConfig),
    [readings, speciesConfig]
  );

  const hasEnoughData = readings.length >= 3;

  return {
    trends,
    patterns,
    riskScore,
    smartAlert,
    emergencyAlerts,
    hasEnoughData,
    readingsCount: readings.length,
    /** Raw readings (ASC) — reused by the dashboard weekly summary card */
    readings,
  };
}
