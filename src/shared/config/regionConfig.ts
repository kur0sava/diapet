/**
 * Region profile — single source of truth for the user's geographic region.
 *
 * The region drives content adaptation across the app: default language,
 * default glucose unit (US uses mg/dL), expense currency, region blocks in
 * encyclopedia articles, the feed-guide food catalog, and insulin
 * availability notes. Detected once on first launch from the DEVICE LOCALE
 * (no GPS, no network — privacy-neutral), persisted in MMKV, changeable any
 * time in Settings.
 *
 * IMPORTANT: defaults derived from the region are applied ONLY on first run
 * (before onboarding completes) and only for settings the user has not set.
 * Changing the region later re-filters content but never silently flips the
 * user's chosen language or glucose unit — display units are a medical
 * safety issue, not a cosmetic one.
 */
import { getLocales } from 'expo-localization';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import i18n from '@shared/i18n';
import type { GlucoseUnit } from '@storage/domain/types';

/** Kept in sync with the food catalog's regions (diabeticFoods re-exports this). */
export type Region = 'RU' | 'EU' | 'UK' | 'US' | 'DE' | 'MX' | 'GLOBAL';

export const VALID_REGIONS: readonly Region[] = ['RU', 'EU', 'UK', 'US', 'DE', 'MX', 'GLOBAL'];

/** EU member states (ISO 3166-1 alpha-2) that map to the generic EU region.
 * Germany is split out because it has its own store/food entries. */
const EU_COUNTRIES = new Set([
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
  // Not EU members but the EU market (zooplus etc.) serves them the same way
  'NO',
  'CH',
  'IS',
  'LI',
]);

/** Russian-speaking market with the same distribution channels as RU
 * (Ozon/WB delivery, RU-labelled products, RinGlar availability). */
const RU_MARKET_COUNTRIES = new Set(['RU', 'BY', 'KZ', 'KG', 'AM', 'UZ', 'TJ']);

export function mapCountryToRegion(
  countryCode: string | null | undefined,
  languageCode?: string | null
): Region {
  const cc = countryCode?.toUpperCase();
  if (cc) {
    if (RU_MARKET_COUNTRIES.has(cc)) return 'RU';
    if (cc === 'DE') return 'DE';
    if (cc === 'GB' || cc === 'UK') return 'UK';
    if (cc === 'US' || cc === 'CA') return 'US'; // CA: same brands/stores as US
    if (cc === 'MX') return 'MX';
    if (EU_COUNTRIES.has(cc)) return 'EU';
  }
  // No usable country — fall back to language as a weak signal
  if (languageCode?.toLowerCase().startsWith('ru')) return 'RU';
  return 'GLOBAL';
}

/** Read the device locale and map it to an app region. Never throws. */
export function detectRegionFromDevice(): Region {
  try {
    const locale = getLocales()[0];
    return mapCountryToRegion(locale?.regionCode, locale?.languageCode);
  } catch {
    return 'GLOBAL';
  }
}

/** The user's region. Detects and persists on first call. */
export function getAppRegion(): Region {
  const saved = storage.getString(StorageKeys.REGION);
  if (saved && (VALID_REGIONS as readonly string[]).includes(saved)) {
    return saved as Region;
  }
  const detected = detectRegionFromDevice();
  storage.set(StorageKeys.REGION, detected);
  return detected;
}

export function setAppRegion(region: Region): void {
  storage.set(StorageKeys.REGION, region);
}

export interface RegionDefaults {
  language: 'ru' | 'en';
  glucoseUnit: GlucoseUnit;
  /** ISO 4217 code used for the FIRST expense row (later rows inherit it). */
  currency: string;
}

export function getRegionDefaults(region: Region): RegionDefaults {
  switch (region) {
    case 'RU':
      return { language: 'ru', glucoseUnit: 'mmol/L', currency: 'RUB' };
    case 'US':
      return { language: 'en', glucoseUnit: 'mg/dL', currency: 'USD' };
    case 'MX':
      return { language: 'en', glucoseUnit: 'mg/dL', currency: 'MXN' };
    case 'UK':
      return { language: 'en', glucoseUnit: 'mmol/L', currency: 'GBP' };
    case 'DE':
    case 'EU':
      return { language: 'en', glucoseUnit: 'mmol/L', currency: 'EUR' };
    case 'GLOBAL':
    default:
      return { language: 'en', glucoseUnit: 'mmol/L', currency: 'USD' };
  }
}

/**
 * First-run region bootstrap. Called from App.tsx after initStorage() +
 * restoreLanguage().
 *
 * - Always ensures a region is detected and persisted.
 * - Applies language/glucose-unit defaults ONLY while onboarding has not
 *   completed AND the user hasn't already set them (the i18n module boots in
 *   'ru' as a hardcoded fallback — before this existed, a US user got a
 *   Russian app until they found the language screen).
 * - Existing installs upgrading to this version get a detected region but
 *   keep their current language/units untouched.
 */
export function initRegionOnFirstRun(): void {
  try {
    const region = getAppRegion(); // detects + persists if missing
    if (storage.getBoolean(StorageKeys.ONBOARDING_COMPLETE)) return;

    const defaults = getRegionDefaults(region);
    if (!storage.getString(StorageKeys.LANGUAGE)) {
      // Don't persist LANGUAGE here: the user hasn't chosen yet. Onboarding's
      // LanguageScreen persists the explicit choice; until then every launch
      // re-derives from the (possibly changed) device locale.
      i18n.changeLanguage(defaults.language);
    }
    if (!storage.getString(StorageKeys.GLUCOSE_UNIT)) {
      storage.set(StorageKeys.GLUCOSE_UNIT, defaults.glucoseUnit);
    }
  } catch {
    /* region bootstrap must never block app startup */
  }
}
