/**
 * Subscription store — Prodamus + Supabase backend.
 * Replaces RevenueCat with web-based payment flow.
 */
import { create } from 'zustand';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import {
  checkSubscription,
  pollSubscriptionAfterPayment,
  openPaymentPage,
  isBackendConfigured,
  SubscriptionPlan,
} from '@shared/api/subscriptionApi';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_TIMESTAMP_KEY = 'subscriptionCachedAt';

interface SubscriptionStore {
  isPro: boolean;
  isLoading: boolean;
  expiresAt: string | null;
  plan: SubscriptionPlan | null;
  loadStatus: () => Promise<void>;
  openPayment: (plan: SubscriptionPlan) => void;
  checkAfterPayment: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

function getCachedStatus(): { isPro: boolean; expiresAt: string | null; plan: SubscriptionPlan | null } {
  try {
    const cachedAt = storage.getNumber(CACHE_TIMESTAMP_KEY) ?? 0;
    if (Date.now() - cachedAt > CACHE_TTL_MS) {
      return { isPro: false, expiresAt: null, plan: null };
    }
    const isPro = storage.getBoolean(StorageKeys.SUBSCRIPTION_CACHED_PRO) ?? false;
    const expiresAt = storage.getString(StorageKeys.SUBSCRIPTION_EXPIRES_AT) ?? null;
    const plan = (storage.getString(StorageKeys.SUBSCRIPTION_PLAN) as SubscriptionPlan) ?? null;
    return { isPro, expiresAt, plan };
  } catch {
    return { isPro: false, expiresAt: null, plan: null };
  }
}

function setCachedStatus(isPro: boolean, expiresAt: string | null, plan: SubscriptionPlan | null): void {
  storage.set(StorageKeys.SUBSCRIPTION_CACHED_PRO, isPro);
  storage.set(CACHE_TIMESTAMP_KEY, Date.now());
  if (expiresAt) {
    storage.set(StorageKeys.SUBSCRIPTION_EXPIRES_AT, expiresAt);
  } else {
    storage.delete(StorageKeys.SUBSCRIPTION_EXPIRES_AT);
  }
  if (plan) {
    storage.set(StorageKeys.SUBSCRIPTION_PLAN, plan);
  } else {
    storage.delete(StorageKeys.SUBSCRIPTION_PLAN);
  }
}

// Lazy init: getCachedStatus() called inside create() callback,
// which Zustand invokes on first store access — not at module import time.
export const useSubscriptionStore = create<SubscriptionStore>((set) => {
  const cached = getCachedStatus();
  return {
  isPro: cached.isPro,
  isLoading: false,
  expiresAt: cached.expiresAt,
  plan: cached.plan,

  loadStatus: async () => {
    if (!isBackendConfigured()) {
      set({ isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const status = await checkSubscription();
      setCachedStatus(status.isPro, status.expiresAt, status.plan);
      set({ isPro: status.isPro, expiresAt: status.expiresAt, plan: status.plan, isLoading: false });
    } catch (e) {
      console.error('Failed to check subscription:', e);
      const fallback = getCachedStatus();
      set({ isPro: fallback.isPro, expiresAt: fallback.expiresAt, plan: fallback.plan, isLoading: false });
    }
  },

  openPayment: (plan: SubscriptionPlan) => {
    openPaymentPage(plan);
  },

  checkAfterPayment: async () => {
    set({ isLoading: true });
    try {
      const status = await pollSubscriptionAfterPayment();
      setCachedStatus(status.isPro, status.expiresAt, status.plan);
      set({ isPro: status.isPro, expiresAt: status.expiresAt, plan: status.plan, isLoading: false });
      return status.isPro;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  refreshStatus: async () => {
    if (!isBackendConfigured()) return;
    try {
      const status = await checkSubscription();
      setCachedStatus(status.isPro, status.expiresAt, status.plan);
      set({ isPro: status.isPro, expiresAt: status.expiresAt, plan: status.plan });
    } catch {
      // silent
    }
  },
};});

/**
 * Returns true if the backend (Supabase) is configured.
 * When not configured, useSubscription grants all features (dev/bypass mode).
 */
export { isBackendConfigured } from '@shared/api/subscriptionApi';
