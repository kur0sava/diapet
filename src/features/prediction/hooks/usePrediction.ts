/**
 * React hook for glucose prediction.
 * Manages cache, rate limiting, and manual trigger.
 */
import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePetStore } from '@shared/stores/petStore';
import i18n from '@shared/i18n';
import { collectPredictionData } from '../data/predictionDataCollector';
import { requestPrediction } from '../utils/predictionApiClient';
import {
  getCachedPrediction,
  cachePrediction,
  canRequestPrediction,
  timeUntilNextPrediction,
} from '../data/predictionStorage';
import type { PredictionResult } from '../data/predictionTypes';

export interface UsePredictionReturn {
  prediction: PredictionResult | null;
  isLoading: boolean;
  error: string | null;
  canRequestNew: boolean;
  /** Milliseconds until next request is allowed. 0 if available now. */
  nextAvailableIn: number;
  /** Manually trigger a new prediction. */
  requestNewPrediction: () => Promise<void>;
}

export function usePrediction(): UsePredictionReturn {
  const { t } = useTranslation();
  const activePet = usePetStore(s => s.activePet);
  const petId = activePet?.id ?? '';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(() => {
    if (!petId) return null;
    return getCachedPrediction(petId);
  });

  const canRequest = useMemo(() => {
    if (!petId) return false;
    return canRequestPrediction(petId);
  }, [petId, prediction]); // re-evaluate after new prediction

  const nextAvailableIn = useMemo(() => {
    if (!petId) return 0;
    return timeUntilNextPrediction(petId);
  }, [petId, prediction]);

  const requestNewPrediction = useCallback(async () => {
    if (!activePet || !petId) {
      setError(t('prediction.errorGeneral'));
      return;
    }

    if (!canRequestPrediction(petId)) {
      setError(t('prediction.rateLimited'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const language = i18n.language?.startsWith('en') ? 'en' : 'ru' as const;
      const snapshot = await collectPredictionData(petId, activePet, language);
      const result = await requestPrediction(snapshot);

      cachePrediction(petId, result);
      setPrediction(result);
    } catch (e) {
      const raw = e instanceof Error ? e.message : '';
      // Map technical errors to user-friendly localized messages
      const msg = raw.includes('API key not configured')
        ? t('prediction.errorApiNotConfigured')
        : raw.includes('API error')
          ? t('prediction.errorApiUnavailable')
          : t('prediction.errorGeneral');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [activePet, petId, t]);

  return {
    prediction,
    isLoading,
    error,
    canRequestNew: canRequest,
    nextAvailableIn,
    requestNewPrediction,
  };
}
