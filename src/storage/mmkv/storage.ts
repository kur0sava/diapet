import { MMKV } from 'react-native-mmkv';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const SECURE_STORE_KEY = 'diapet-mmkv-encryption-key';

let _storage: MMKV | null = null;
let initialized = false;

export function getStorage(): MMKV {
  if (!_storage) {
    // Will be re-created with encryption in initStorage()
    console.warn('MMKV accessed before initStorage — using unencrypted fallback');
    _storage = new MMKV({ id: 'diapet-storage' });
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

  let encryptionKey = await SecureStore.getItemAsync(SECURE_STORE_KEY);

  if (!encryptionKey) {
    encryptionKey = Crypto.randomUUID();
    await SecureStore.setItemAsync(SECURE_STORE_KEY, encryptionKey);
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
} as const;
