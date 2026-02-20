import { MMKV } from 'react-native-mmkv';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const SECURE_STORE_KEY = 'diapet-mmkv-encryption-key';

// Start with an unencrypted instance so static imports don't crash.
// initStorage() will replace this with an encrypted instance.
export let storage = new MMKV({ id: 'diapet-storage' });

let initialized = false;

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

  storage = new MMKV({
    id: 'diapet-storage',
    encryptionKey,
  });

  initialized = true;
}

// Helper to store JSON objects
export const storageUtils = {
  setObject: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
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
} as const;
