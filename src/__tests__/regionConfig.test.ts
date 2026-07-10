/**
 * Region profile: device-locale → region mapping, persistence, and the
 * first-run defaults application (language / glucose unit). Guards the
 * invariant that region changes NEVER override explicit user choices.
 */
import { initStorage, storage, StorageKeys } from '@storage/mmkv/storage';
import { __resetAllMmkvStores } from '../test/mocks/mmkvMock';
import { __setLocales } from '../test/mocks/expoLocalizationMock';
import {
  mapCountryToRegion,
  detectRegionFromDevice,
  getAppRegion,
  setAppRegion,
  getRegionDefaults,
  initRegionOnFirstRun,
} from '@shared/config/regionConfig';
import i18n from '@shared/i18n';

describe('regionConfig', () => {
  beforeAll(async () => {
    await initStorage();
  });

  beforeEach(() => {
    __resetAllMmkvStores();
    __setLocales([{ languageCode: 'ru', regionCode: 'RU' }]);
  });

  describe('mapCountryToRegion', () => {
    it.each([
      ['RU', 'RU'],
      ['BY', 'RU'],
      ['KZ', 'RU'],
      ['DE', 'DE'],
      ['GB', 'UK'],
      ['US', 'US'],
      ['CA', 'US'],
      ['MX', 'MX'],
      ['FR', 'EU'],
      ['PL', 'EU'],
      ['NO', 'EU'],
      ['BR', 'GLOBAL'],
      ['JP', 'GLOBAL'],
    ] as const)('%s → %s', (country, region) => {
      expect(mapCountryToRegion(country)).toBe(region);
    });

    it('falls back to language when country is missing', () => {
      expect(mapCountryToRegion(null, 'ru')).toBe('RU');
      expect(mapCountryToRegion(undefined, 'en')).toBe('GLOBAL');
      expect(mapCountryToRegion(null, null)).toBe('GLOBAL');
    });

    it('is case-insensitive', () => {
      expect(mapCountryToRegion('us')).toBe('US');
      expect(mapCountryToRegion(null, 'RU-ru')).toBe('RU');
    });
  });

  describe('getAppRegion', () => {
    it('detects from device locale and persists on first call', () => {
      __setLocales([{ languageCode: 'en', regionCode: 'US' }]);
      expect(getAppRegion()).toBe('US');
      expect(storage.getString(StorageKeys.REGION)).toBe('US');
      // Subsequent calls read the persisted value, not the device
      __setLocales([{ languageCode: 'de', regionCode: 'DE' }]);
      expect(getAppRegion()).toBe('US');
    });

    it('ignores a corrupted persisted value and re-detects', () => {
      storage.set(StorageKeys.REGION, 'NARNIA');
      __setLocales([{ languageCode: 'en', regionCode: 'GB' }]);
      expect(getAppRegion()).toBe('UK');
    });

    it('setAppRegion overrides detection', () => {
      setAppRegion('MX');
      __setLocales([{ languageCode: 'ru', regionCode: 'RU' }]);
      expect(getAppRegion()).toBe('MX');
    });

    it('returns GLOBAL when the locale API fails', () => {
      __setLocales([]);
      expect(detectRegionFromDevice()).toBe('GLOBAL');
    });
  });

  describe('initRegionOnFirstRun', () => {
    it('fresh install in the US: EN language + mg/dL by default', () => {
      __setLocales([{ languageCode: 'en', regionCode: 'US' }]);
      initRegionOnFirstRun();
      expect(storage.getString(StorageKeys.REGION)).toBe('US');
      expect(i18n.language).toBe('en');
      // Language itself is NOT persisted — the user hasn't chosen yet
      expect(storage.getString(StorageKeys.LANGUAGE)).toBeUndefined();
      expect(storage.getString(StorageKeys.GLUCOSE_UNIT)).toBe('mg/dL');
    });

    it('fresh install in Russia: RU language + mmol/L', () => {
      __setLocales([{ languageCode: 'ru', regionCode: 'RU' }]);
      initRegionOnFirstRun();
      expect(i18n.language).toBe('ru');
      expect(storage.getString(StorageKeys.GLUCOSE_UNIT)).toBe('mmol/L');
    });

    it('does not touch language/units the user already set', () => {
      __setLocales([{ languageCode: 'en', regionCode: 'US' }]);
      storage.set(StorageKeys.LANGUAGE, 'ru');
      storage.set(StorageKeys.GLUCOSE_UNIT, 'mmol/L');
      i18n.changeLanguage('ru');
      initRegionOnFirstRun();
      expect(i18n.language).toBe('ru');
      expect(storage.getString(StorageKeys.GLUCOSE_UNIT)).toBe('mmol/L');
    });

    it('upgraded install (onboarding complete): detects region, changes nothing else', () => {
      __setLocales([{ languageCode: 'en', regionCode: 'US' }]);
      storage.set(StorageKeys.ONBOARDING_COMPLETE, true);
      i18n.changeLanguage('ru');
      initRegionOnFirstRun();
      expect(storage.getString(StorageKeys.REGION)).toBe('US');
      expect(i18n.language).toBe('ru');
      expect(storage.getString(StorageKeys.GLUCOSE_UNIT)).toBeUndefined();
    });
  });

  describe('getRegionDefaults', () => {
    it('US → mg/dL + USD, UK → mmol/L + GBP, RU → mmol/L + RUB', () => {
      expect(getRegionDefaults('US')).toEqual({
        language: 'en',
        glucoseUnit: 'mg/dL',
        weightUnit: 'lb',
        currency: 'USD',
      });
      expect(getRegionDefaults('UK')).toEqual({
        language: 'en',
        glucoseUnit: 'mmol/L',
        weightUnit: 'kg',
        currency: 'GBP',
      });
      expect(getRegionDefaults('RU')).toEqual({
        language: 'ru',
        glucoseUnit: 'mmol/L',
        weightUnit: 'kg',
        currency: 'RUB',
      });
    });
  });
});
