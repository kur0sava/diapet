import { MMKV } from 'react-native-mmkv';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const SECURE_STORE_KEY = 'diapet-mmkv-encryption-key';
// C004: deterministic fallback if SecureStore is unavailable (e.g. rooted device).
// Data persists across restarts consistently; less secure than random key but better than plaintext.
const FALLBACK_ENCRYPTION_KEY = 'diapet-fallback-enc-key-v1';

let _storage: MMKV | null = null;
let initialized = false;

export function getStorage(): MMKV {
  if (!_storage) {
    throw new Error('MMKV accessed before initStorage() completed — this is a bug. Ensure no component reads storage before the ready gate in App.tsx.');
  }
  return _storage;
}

// Lazy proxy so existing `storage.xxx()` calls keep working
export const storage = new Proxy({} as MMKV, {
  get(_target, prop) {
    const instance = getStorage();
    const value = instance[prop as keyof MMKV];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

/**
 * Initialise MMKV with a per-device encryption key stored in the
 * platform's secure enclave (Android Keystore / iOS Keychain).
 * Must be called once at app startup before any reads/writes.
 */
export async function initStorage(): Promise<void> {
  if (initialized) return;

  let encryptionKey: string;
  try {
    let storedKey = await SecureStore.getItemAsync(SECURE_STORE_KEY);
    if (!storedKey) {
      storedKey = Crypto.randomUUID();
      await SecureStore.setItemAsync(SECURE_STORE_KEY, storedKey);
    }
    encryptionKey = storedKey;
  } catch (e) {
    // C004: SecureStore unavailable (rooted device, etc.) — use deterministic fallback
    // so data persists consistently across restarts instead of silently going unencrypted
    console.error('[MMKV] SecureStore unavailable, using fallback encryption key:', e);
    encryptionKey = FALLBACK_ENCRYPTION_KEY;
  }

  _storage = new MMKV({
    id: 'diapet-storage',
    encryptionKey,
  });

  initialized = true;
}

// Helper to store JSON objects
export const storageUtils = {
  setObject: <T>(key: string, value: T): void => {
    try {
      storage.set(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to serialize object for key:', key, e);
    }
  },
  getObject: <T>(key: string): T | null => {
    const value = storage.getString(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },
  remove: (key: string): void => {
    storage.delete(key);
  },
  clear: (): void => {
    storage.clearAll();
  },
  has: (key: string): boolean => {
    return storage.contains(key);
  },
};

// Keys
export const StorageKeys = {
  LANGUAGE: 'language',
  COLOR_SCHEME: 'colorScheme',
  GLUCOSE_UNIT: 'glucoseUnit',
  ONBOARDING_COMPLETE: 'onboardingComplete',
  ACTIVE_PET_ID: 'activePetId',
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
  VET_NAME: 'vetName',
  VET_PHONE: 'vetPhone',
  LAST_BACKUP: 'lastBackup',
  BOOKMARKED_ARTICLES: 'bookmarkedArticles',
  SUBSCRIPTION_CACHED_PRO: 'subscriptionCachedPro',
  ONBOARDING_DRAFT: 'onboardingDraft',
  HINTS_REGISTRATION_DATE: 'hintsRegistrationDate',
  HINTS_SHOWN_IDS: 'hintsShownIds',
  HINTS_INJECTION_COUNT: 'hintsInjectionCount',
  HINTS_LAST_APP_OPEN_DATE: 'hintsLastAppOpenDate',
  HINTS_ACHIEVEMENT_SHOWN: 'hintsAchievementShown',
  HINTS_PUSH_SHOWN_IDS: 'hintsPushShownIds',
  HINTS_PUSH_LAST_SCHEDULED: 'hintsPushLastScheduled',
  PREDICTION_CACHE: 'predictionCache',
  PREDICTION_LAST_REQUEST: 'predictionLastRequest',
  REMISSION_CACHE: 'remissionCache',
  REMISSION_LAST_REQUEST: 'remissionLastRequest',
  AI_CHAT_DAILY_COUNT: 'aiChatDailyCount',
  AI_CHAT_DAILY_DATE: 'aiChatDailyDate',
  DEVICE_ID: 'deviceId',
  SUBSCRIPTION_EXPIRES_AT: 'subscriptionExpiresAt',
} as const;
