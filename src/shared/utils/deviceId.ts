/**
 * Stable device ID for subscription binding.
 * Generated once on first launch, persisted in MMKV + SecureStore.
 */
import { storage, StorageKeys } from '@storage/mmkv/storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const SECURE_STORE_KEY = 'diapet_device_id';

let cachedDeviceId: string | null = null;

/**
 * Returns a stable device UUID. Generates one if none exists.
 * Priority: memory cache → MMKV → SecureStore → generate new.
 */
export function getDeviceId(): string {
  if (cachedDeviceId) return cachedDeviceId;

  // Try MMKV first (fast)
  const mmkvId = storage.getString(StorageKeys.DEVICE_ID);
  if (mmkvId) {
    cachedDeviceId = mmkvId;
    return mmkvId;
  }

  // Try SecureStore (survives reinstall on some devices)
  try {
    const secureId = SecureStore.getItem(SECURE_STORE_KEY);
    if (secureId) {
      storage.set(StorageKeys.DEVICE_ID, secureId);
      cachedDeviceId = secureId;
      return secureId;
    }
  } catch {
    // SecureStore may fail on some devices
  }

  // Generate new UUID
  const newId = Crypto.randomUUID();
  storage.set(StorageKeys.DEVICE_ID, newId);
  try {
    SecureStore.setItem(SECURE_STORE_KEY, newId);
  } catch {
    // Non-critical
  }
  cachedDeviceId = newId;
  return newId;
}
