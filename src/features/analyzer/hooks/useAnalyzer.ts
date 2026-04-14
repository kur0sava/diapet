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
} from '@storage/database';
import { analyzeTrends } from '../engine/trendEngine';
import { detectPatterns } from '../engine/patternDetector';
import { calculateRiskScore } from '../engine/riskScoreCalculator';
import { generateSmartAlerts, markAlertFired } from '../engine/smartAlerts';
import { sanitizePatterns, checkEmergencyThresholds } from '../engine/safetyGuard';
import { getSpeciesConfig } from '@shared/config/speciesConfig';

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
        ? detectPatterns({ readings, injections, feedings, now, config: speciesConfig })
        : [],
    [readings, injections, feedings, now, speciesConfig]
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
            injections,
            feedings,
            symptoms,
            weightKg: activePet?.weightKg,
            diagnosisDays,
            scheduledInjectionsPerDay,
            now,
            config: speciesConfig,
          })
        : null,
    [
      readings,
      injections,
      feedings,
      symptoms,
      activePet?.weightKg,
      diagnosisDays,
      scheduledInjectionsPerDay,
      now,
      speciesConfig,
    ]
  );

  const smartAlert = useMemo(() => {
    if (!trends || !riskScore) return null;
    return generateSmartAlerts(trends, riskScore, patterns, readings, now);
  }, [trends, riskScore, patterns, readings, now]);

  // Side-effect: mark alert as fired OUTSIDE of useMemo
  useEffect(() => {
    if (smartAlert) {
      markAlertFired(smartAlert.type);
    }
  }, [smartAlert]);

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
  };
}
