import { create } from 'zustand';
import Purchases, { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { storage, StorageKeys } from '@storage/mmkv/storage';

const ENTITLEMENT_ID = 'pro';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const CACHE_TIMESTAMP_KEY = 'subscriptionCachedAt';

interface SubscriptionStore {
  isPro: boolean;
  isLoading: boolean;
  isLoadingOfferings: boolean;
  offerings: PurchasesOffering | null;
  loadStatus: () => Promise<void>;
  loadOfferings: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
}

function checkPro(info: CustomerInfo): boolean {
  return typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
}

function getCachedPro(): boolean {
  const cached = storage.getBoolean(StorageKeys.SUBSCRIPTION_CACHED_PRO) ?? false;
  if (!cached) return false;
  // If cache is stale (>24h), don't trust it
  const cachedAt = storage.getNumber(CACHE_TIMESTAMP_KEY) ?? 0;
  if (Date.now() - cachedAt > CACHE_TTL_MS) return false;
  return true;
}

function setCachedPro(isPro: boolean): void {
  storage.set(StorageKeys.SUBSCRIPTION_CACHED_PRO, isPro);
  storage.set(CACHE_TIMESTAMP_KEY, Date.now());
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  isPro: getCachedPro(),
  isLoading: false,
  isLoadingOfferings: false,
  offerings: null,

  loadStatus: async () => {
    set({ isLoading: true });
    try {
      const info = await Purchases.getCustomerInfo();
      const isPro = checkPro(info);
      setCachedPro(isPro);
      set({ isPro, isLoading: false });
    } catch (e) {
      console.error('Failed to load subscription status:', e);
      // On failure, if cache is stale, default to false
      set({ isPro: getCachedPro(), isLoading: false });
    }
  },

  loadOfferings: async () => {
    set({ isLoadingOfferings: true });
    try {
      const offerings = await Purchases.getOfferings();
      set({ offerings: offerings.current, isLoadingOfferings: false });
    } catch (e) {
      console.error('Failed to load offerings:', e);
      set({ isLoadingOfferings: false });
    }
  },

  purchase: async (pkg: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isPro = checkPro(customerInfo);
      setCachedPro(isPro);
      set({ isPro });
      return isPro;
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error('Purchase error:', e);
      }
      return false;
    }
  },

  restore: async () => {
    try {
      const info = await Purchases.restorePurchases();
      const isPro = checkPro(info);
      setCachedPro(isPro);
      set({ isPro });
      return isPro;
    } catch (e) {
      console.error('Restore error:', e);
      return false;
    }
  },
}));
