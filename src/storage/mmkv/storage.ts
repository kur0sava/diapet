import { MMKV } from 'react-native-mmkv';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const SECURE_STORE_KEY = 'diapet-mmkv-encryption-key';
// MED-10: Per-device fallback key stored in a separate unencrypted MMKV instance.
// Used only when SecureStore is unavailable (e.g. rooted device).
const FALLBACK_KEY_STORE_ID = 'diapet-key-store';
const FALLBACK_KEY_NAME = 'encKey';

let _storage: MMKV | null = null;
let initialized = false;

export function getStorage(): MMKV {
  if (!_storage) {
    throw new Error(
      'MMKV accessed before initStorage() completed — this is a bug. Ensure no component reads storage before the ready gate in App.tsx.'
    );
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
    // MED-10: Per-device fallback key. New installs get a random key;
    // existing installs keep the old static key for data continuity.
    console.error('[MMKV] SecureStore unavailable, using per-device fallback key:', e);
    const keyStore = new MMKV({ id: FALLBACK_KEY_STORE_ID });
    let fallbackKey = keyStore.getString(FALLBACK_KEY_NAME);
    if (!fallbackKey) {
      // Check if main MMKV was already initialized with old static key
      const OLD_STATIC_KEY = 'diapet-fallback-enc-key-v1';
      try {
        const probe = new MMKV({ id: 'diapet-storage', encryptionKey: OLD_STATIC_KEY });
        const hasData = probe.contains('onboardingComplete') || probe.getAllKeys().length > 0;
        fallbackKey = hasData ? OLD_STATIC_KEY : Crypto.randomUUID();
      } catch {
        fallbackKey = Crypto.randomUUID();
      }
      keyStore.set(FALLBACK_KEY_NAME, fallbackKey);
    }
    encryptionKey = fallbackKey;
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
  WEIGHT_UNIT: 'weightUnit',
  GLUCOSE_DRAFT: 'glucoseEntryDraft',
  INJECTION_DRAFT: 'injectionEntryDraft',
  ONBOARDING_COMPLETE: 'onboardingComplete',
  ACTIVE_PET_ID: 'activePetId',
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
  /** Legacy global vet contact keys. Per-pet keys are `vetName_<petId>` / `vetPhone_<petId>`
   * (use {@link vetNameKey} / {@link vetPhoneKey}). These globals are kept only so the
   * one-shot migration in App.tsx can find pre-2.5.1 values and attribute them to the
   * active pet, and so cloudBackup can read legacy backups. New writes must use the
   * per-pet helpers. */
  VET_NAME: 'vetName',
  VET_PHONE: 'vetPhone',
  ACTIVE_SPECIES: 'activeSpecies',
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
  SUBSCRIPTION_PLAN: 'subscriptionPlan',
  EXPENSE_BUDGET_MONTHLY: 'expenseBudgetMonthly',
  AUTH_USER: 'authUser',
  HINTS_DISABLED: 'hintsDisabled',
  FIRST_STEPS_DISMISSED: 'firstStepsDismissed',
  FIRST_STEPS_COMPLETED_AT: 'firstStepsCompletedAt',
  TRIAL_STARTED_AT: 'trialStartedAt',
  ANALYTICS_OPT_OUT: 'analyticsOptOut',
  BATTERY_OPT_PROMPTED: 'batteryOptPrompted',
  EXACT_ALARM_PROMPTED: 'exactAlarmPrompted',
  /** User's geographic region (see @shared/config/regionConfig). Detected
   * from device locale on first launch, changeable in Settings. */
  REGION: 'appRegion',
  /** Self-updating food catalog: last downloaded manifest JSON + fetch time.
   * See @features/encyclopedia/data/foodCatalog. */
  FOOD_CATALOG_CACHE: 'foodCatalogCache',
  FOOD_CATALOG_FETCHED_AT: 'foodCatalogFetchedAt',
  /** v2.6 retention: daily glucose-measurement reminders (Settings toggle,
   * independent of the injection/feeding NOTIFICATIONS_ENABLED flag). */
  GLUCOSE_REMINDER_ENABLED: 'glucoseReminderEnabled',
  /** JSON array of "HH:mm" strings for glucose reminders. */
  GLUCOSE_REMINDER_TIMES: 'glucoseReminderTimes',
  /** v2.6 retention: JSON array of unlocked achievement ids
   * (see @features/hints/data/achievements). */
  ACHIEVEMENTS_UNLOCKED: 'achievementsUnlocked',
  /** v2.6 retention: shown ids of event-driven hints
   * (see @features/hints/data/eventHints). Per-event daily throttle lives in
   * dynamic `eventHintDate_<trigger>` keys. */
  EVENT_HINTS_SHOWN_IDS: 'eventHintsShownIds',
} as const;

/** Per-pet vet contact key. See {@link StorageKeys.VET_NAME} for legacy migration. */
export function vetNameKey(petId: string): string {
  return `vetName_${petId}`;
}

/** Per-pet vet contact key. See {@link StorageKeys.VET_PHONE} for legacy migration. */
export function vetPhoneKey(petId: string): string {
  return `vetPhone_${petId}`;
}

/** Per-pet set of food keys the pet has been fed (new-food event hints). */
export function foodsSeenKey(petId: string): string {
  return `foodsSeen_${petId}`;
}
