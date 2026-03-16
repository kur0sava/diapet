/**
 * MMKV-based cache for prediction results.
 * Handles caching, expiration, and rate limiting.
 */
import { storage, StorageKeys, storageUtils } from '@storage/mmkv/storage';
import type { PredictionResult, RemissionReport } from './predictionTypes';

const PREDICTION_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const REMISSION_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Cache Keys ───

function predictionCacheKey(petId: string): string {
  return `${StorageKeys.PREDICTION_CACHE}_${petId}`;
}

function predictionTimestampKey(petId: string): string {
  return `${StorageKeys.PREDICTION_LAST_REQUEST}_${petId}`;
}

function remissionCacheKey(petId: string): string {
  return `${StorageKeys.REMISSION_CACHE}_${petId}`;
}

function remissionTimestampKey(petId: string): string {
  return `${StorageKeys.REMISSION_LAST_REQUEST}_${petId}`;
}

// ─── Prediction Cache ───

export function getCachedPrediction(petId: string): PredictionResult | null {
  try {
    const cached = storageUtils.getObject<PredictionResult>(predictionCacheKey(petId));
    if (!cached) return null;

    const timestamp = storage.getNumber(predictionTimestampKey(petId)) ?? 0;
    if (Date.now() - timestamp > PREDICTION_CACHE_TTL_MS) {
      // Expired
      clearPredictionCache(petId);
      return null;
    }

    return cached;
  } catch {
    return null;
  }
}

export function cachePrediction(petId: string, result: PredictionResult): void {
  try {
    storageUtils.setObject(predictionCacheKey(petId), result);
    storage.set(predictionTimestampKey(petId), Date.now());
  } catch {
    // Silently fail — cache is non-critical
  }
}

export function clearPredictionCache(petId: string): void {
  try {
    storageUtils.remove(predictionCacheKey(petId));
    storageUtils.remove(predictionTimestampKey(petId));
  } catch {
    // noop
  }
}

// ─── Remission Cache ───

export function getCachedRemission(petId: string): RemissionReport | null {
  try {
    const cached = storageUtils.getObject<RemissionReport>(remissionCacheKey(petId));
    if (!cached) return null;

    const timestamp = storage.getNumber(remissionTimestampKey(petId)) ?? 0;
    if (Date.now() - timestamp > REMISSION_CACHE_TTL_MS) {
      clearRemissionCache(petId);
      return null;
    }

    return cached;
  } catch {
    return null;
  }
}

export function cacheRemission(petId: string, report: RemissionReport): void {
  try {
    storageUtils.setObject(remissionCacheKey(petId), report);
    storage.set(remissionTimestampKey(petId), Date.now());
  } catch {
    // noop
  }
}

export function clearRemissionCache(petId: string): void {
  try {
    storageUtils.remove(remissionCacheKey(petId));
    storageUtils.remove(remissionTimestampKey(petId));
  } catch {
    // noop
  }
}

// ─── Rate Limiting ───

export function canRequestPrediction(petId: string): boolean {
  try {
    const lastRequest = storage.getNumber(predictionTimestampKey(petId)) ?? 0;
    return Date.now() - lastRequest >= PREDICTION_CACHE_TTL_MS;
  } catch {
    return true; // Allow if storage fails
  }
}

export function canRequestRemission(petId: string): boolean {
  try {
    const lastRequest = storage.getNumber(remissionTimestampKey(petId)) ?? 0;
    return Date.now() - lastRequest >= REMISSION_CACHE_TTL_MS;
  } catch {
    return true;
  }
}

/** Returns ms until next prediction is available. 0 if available now. */
export function timeUntilNextPrediction(petId: string): number {
  try {
    const lastRequest = storage.getNumber(predictionTimestampKey(petId)) ?? 0;
    const elapsed = Date.now() - lastRequest;
    return Math.max(0, PREDICTION_CACHE_TTL_MS - elapsed);
  } catch {
    return 0;
  }
}

/** Returns ms until next remission report is available. 0 if available now. */
export function timeUntilNextRemission(petId: string): number {
  try {
    const lastRequest = storage.getNumber(remissionTimestampKey(petId)) ?? 0;
    const elapsed = Date.now() - lastRequest;
    return Math.max(0, REMISSION_CACHE_TTL_MS - elapsed);
  } catch {
    return 0;
  }
}
