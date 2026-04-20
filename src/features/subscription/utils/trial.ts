/**
 * H7 — 7-day free trial.
 * Trial starts on onboarding completion (SuccessScreen) or manually from PaywallScreen.
 * During trial, useSubscription reports Pro access. On expiry, user returns to free tier.
 */
import { storage, StorageKeys } from '@storage/mmkv/storage';

export const TRIAL_DURATION_DAYS = 7;
export const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;
export const TRIAL_REMINDER_DAYS = 2;

export function getTrialStartedAt(): number | null {
  const value = storage.getNumber(StorageKeys.TRIAL_STARTED_AT);
  return typeof value === 'number' && value > 0 ? value : null;
}

export function hasTrialStarted(): boolean {
  return getTrialStartedAt() !== null;
}

/**
 * Idempotent: does nothing if a trial has already been recorded (even if expired).
 * Each device gets exactly one trial across its lifetime.
 */
export function startTrial(): void {
  if (hasTrialStarted()) return;
  storage.set(StorageKeys.TRIAL_STARTED_AT, Date.now());
}

export function isTrialActive(): boolean {
  const startedAt = getTrialStartedAt();
  if (startedAt === null) return false;
  return Date.now() - startedAt < TRIAL_DURATION_MS;
}

export function isTrialExpired(): boolean {
  const startedAt = getTrialStartedAt();
  if (startedAt === null) return false;
  return Date.now() - startedAt >= TRIAL_DURATION_MS;
}

/**
 * Days remaining, rounded up so "<1 day left" shows as 1 until the moment it expires.
 * Returns 0 when trial is expired or not started.
 */
export function trialDaysLeft(): number {
  const startedAt = getTrialStartedAt();
  if (startedAt === null) return 0;
  const remainingMs = TRIAL_DURATION_MS - (Date.now() - startedAt);
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
}

export function trialHoursLeft(): number {
  const startedAt = getTrialStartedAt();
  if (startedAt === null) return 0;
  const remainingMs = TRIAL_DURATION_MS - (Date.now() - startedAt);
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / (60 * 60 * 1000));
}

export function trialExpiresAt(): Date | null {
  const startedAt = getTrialStartedAt();
  if (startedAt === null) return null;
  return new Date(startedAt + TRIAL_DURATION_MS);
}
