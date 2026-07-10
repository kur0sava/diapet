/**
 * Self-updating food catalog: manifest validation, 3-layer fallback
 * (bundled → cache → remote), refresh throttling and failure model.
 * The invariant under test: no network/JSON/schema failure may ever leave
 * the user with an empty or shrunken catalog.
 */
import { initStorage, storage, StorageKeys } from '@storage/mmkv/storage';
import { __resetAllMmkvStores } from '../test/mocks/mmkvMock';
import {
  getFoodCatalog,
  getCatalogFoods,
  getCatalogPrescriptionFoods,
  getCatalogOtcFoods,
  refreshFoodCatalog,
  validateManifest,
  isValidFood,
  __resetFoodCatalogForTests,
  BUNDLED_GENERATED_AT,
  MANIFEST_SCHEMA_VERSION,
  type FoodsManifest,
} from '@features/encyclopedia/data/foodCatalog';
import {
  ALL_CAT_FOODS,
  ALL_DOG_FOODS,
  localizedNote,
} from '@features/encyclopedia/data/diabeticFoods';

function makeManifest(overrides: Partial<FoodsManifest> = {}): FoodsManifest {
  return {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    generatedAt: '2030-01-01T00:00:00.000Z',
    foods: {
      cat: ALL_CAT_FOODS.map(f => ({ ...f })),
      dog: ALL_DOG_FOODS.map(f => ({ ...f })),
    },
    ...overrides,
  };
}

function mockFetchOnce(payload: unknown, ok = true): jest.Mock {
  const fn = jest.fn().mockResolvedValue({
    ok,
    json: async () => payload,
  });
  (global as { fetch: unknown }).fetch = fn;
  return fn;
}

const realFetch = global.fetch;

describe('food catalog', () => {
  beforeAll(async () => {
    await initStorage();
  });

  beforeEach(() => {
    __resetAllMmkvStores();
    __resetFoodCatalogForTests();
  });

  afterAll(() => {
    (global as { fetch: unknown }).fetch = realFetch;
  });

  describe('validation', () => {
    it('bundled data itself passes the food validator', () => {
      for (const f of [...ALL_CAT_FOODS, ...ALL_DOG_FOODS]) {
        expect(isValidFood(f)).toBe(true);
      }
    });

    it('accepts a well-formed manifest', () => {
      const m = validateManifest(makeManifest());
      expect(m).not.toBeNull();
      expect(m!.foods.cat.length).toBe(ALL_CAT_FOODS.length);
    });

    it('rejects garbage envelopes', () => {
      expect(validateManifest(null)).toBeNull();
      expect(validateManifest('hi')).toBeNull();
      expect(validateManifest({})).toBeNull();
      expect(validateManifest({ schemaVersion: 1, generatedAt: 'not-a-date' })).toBeNull();
      expect(
        validateManifest({ schemaVersion: 1, generatedAt: '2030-01-01', foods: { cat: [] } })
      ).toBeNull();
    });

    it('rejects a manifest from a NEWER schema (old client must not parse it)', () => {
      expect(
        validateManifest(makeManifest({ schemaVersion: MANIFEST_SCHEMA_VERSION + 1 }))
      ).toBeNull();
    });

    it('drops invalid rows but rejects an implausibly small catalog', () => {
      const m = makeManifest();
      // One broken row → dropped, manifest still valid
      const withBroken = {
        ...m,
        foods: { cat: [...m.foods.cat, { id: 42 }], dog: m.foods.dog },
      };
      const validated = validateManifest(withBroken);
      expect(validated).not.toBeNull();
      expect(validated!.foods.cat.length).toBe(m.foods.cat.length);
      // Truncated file → rejected wholesale
      expect(
        validateManifest({ ...m, foods: { cat: m.foods.cat.slice(0, 3), dog: [] } })
      ).toBeNull();
    });

    it('rejects foods with unknown regions or bad numbers', () => {
      const good = { ...ALL_CAT_FOODS[0] };
      expect(isValidFood({ ...good, regions: ['ATLANTIS'] })).toBe(false);
      expect(isValidFood({ ...good, regions: [] })).toBe(false);
      expect(isValidFood({ ...good, carbsDM: NaN })).toBe(false);
      expect(isValidFood({ ...good, prescriptionRequired: 'yes' })).toBe(false);
    });

    it('B7: rejects out-of-range macros / kcal (implausible manifest data)', () => {
      const good = { ...ALL_CAT_FOODS[0] };
      expect(isValidFood({ ...good, carbsDM: -1 })).toBe(false);
      expect(isValidFood({ ...good, carbsDM: 150 })).toBe(false);
      expect(isValidFood({ ...good, fatDM: 101 })).toBe(false);
      expect(isValidFood({ ...good, fiberDM: -0.5 })).toBe(false);
      expect(isValidFood({ ...good, kcalPerKg: 99999 })).toBe(false);
      // In-range values remain valid.
      expect(isValidFood({ ...good, carbsDM: 7, fatDM: 12, kcalPerKg: 4000 })).toBe(true);
    });
  });

  describe('localizedNote (B3)', () => {
    it('picks the language, falls back en→ru, and passes through legacy strings', () => {
      expect(localizedNote({ ru: 'привет', en: 'hello' }, true)).toBe('привет');
      expect(localizedNote({ ru: 'привет', en: 'hello' }, false)).toBe('hello');
      // en missing → fall back to ru so the note is never hidden.
      expect(localizedNote({ ru: 'только рус' }, false)).toBe('только рус');
      // legacy bare string (e.g. old remote manifest row) shows as-is.
      expect(localizedNote('legacy', false)).toBe('legacy');
      expect(localizedNote(undefined, true)).toBeUndefined();
    });

    it('every bundled food note is now the localized {ru,en} shape', () => {
      for (const f of [...ALL_CAT_FOODS, ...ALL_DOG_FOODS]) {
        if (f.notes == null) continue;
        expect(typeof f.notes).toBe('object');
        expect(typeof (f.notes as { ru: string }).ru).toBe('string');
        expect(typeof (f.notes as { en?: string }).en).toBe('string');
      }
    });
  });

  describe('layering', () => {
    it('serves bundled data when there is no cache', () => {
      const state = getFoodCatalog();
      expect(state.source).toBe('bundled');
      expect(state.generatedAt).toBe(BUNDLED_GENERATED_AT);
      expect(getCatalogFoods('cat').length).toBeGreaterThan(10);
      expect(getCatalogFoods('dog').length).toBeGreaterThan(5);
    });

    it('serves cached manifest when it is newer than bundled', () => {
      storage.set(StorageKeys.FOOD_CATALOG_CACHE, JSON.stringify(makeManifest()));
      expect(getFoodCatalog().source).toBe('cache');
      expect(getFoodCatalog().generatedAt).toBe('2030-01-01T00:00:00.000Z');
    });

    it('ignores a cached manifest OLDER than bundled (app update wins)', () => {
      storage.set(
        StorageKeys.FOOD_CATALOG_CACHE,
        JSON.stringify(makeManifest({ generatedAt: '2020-01-01T00:00:00.000Z' }))
      );
      expect(getFoodCatalog().source).toBe('bundled');
    });

    it('ignores a corrupted cache', () => {
      storage.set(StorageKeys.FOOD_CATALOG_CACHE, '{not json');
      expect(getFoodCatalog().source).toBe('bundled');
    });

    it('prescription/OTC getters split by category and filter by region', () => {
      const rx = getCatalogPrescriptionFoods('RU', 'cat');
      expect(rx.length).toBeGreaterThan(0);
      expect(rx.every(f => f.category === 'prescription' && f.regions.includes('RU'))).toBe(true);
      const otc = getCatalogOtcFoods('RU', 'dog');
      expect(otc.every(f => f.category !== 'prescription' && f.regions.includes('RU'))).toBe(true);
    });

    it("RU catalog excludes Hill's and Farmina (unavailable since 2023-24 sanctions)", () => {
      const ruCat = [
        ...getCatalogPrescriptionFoods('RU', 'cat'),
        ...getCatalogOtcFoods('RU', 'cat'),
      ];
      const ruDog = [
        ...getCatalogPrescriptionFoods('RU', 'dog'),
        ...getCatalogOtcFoods('RU', 'dog'),
      ];
      expect(ruCat.some(f => f.brand === "Hill's")).toBe(false);
      expect(ruCat.some(f => f.brand === 'Farmina')).toBe(false);
      expect(ruDog.some(f => f.brand === "Hill's")).toBe(false);
      expect(ruDog.some(f => f.brand === 'Farmina')).toBe(false);
      // But Royal Canin + Purina (locally produced) stay available
      expect(ruCat.some(f => f.brand === 'Royal Canin')).toBe(true);
      expect(ruCat.some(f => f.brand === 'Purina Pro Plan')).toBe(true);
    });

    it('DE users see EU-market prescription foods (DE→EU visibility)', () => {
      const de = getCatalogPrescriptionFoods('DE', 'cat');
      // Royal Canin Diabetic is tagged EU, not DE — must still surface for DE
      expect(de.some(f => f.brand === 'Royal Canin')).toBe(true);
      expect(de.some(f => f.brand === "Hill's")).toBe(true);
    });
  });

  describe('refresh', () => {
    it('stores a newer manifest and switches to it', async () => {
      mockFetchOnce(makeManifest());
      await expect(refreshFoodCatalog(true)).resolves.toBe('updated');
      expect(getFoodCatalog().source).toBe('cache');
      expect(storage.getString(StorageKeys.FOOD_CATALOG_CACHE)).toBeTruthy();
      expect(storage.getString(StorageKeys.FOOD_CATALOG_FETCHED_AT)).toBeTruthy();
    });

    it('keeps current data when remote is not newer', async () => {
      mockFetchOnce(makeManifest({ generatedAt: BUNDLED_GENERATED_AT }));
      await expect(refreshFoodCatalog(true)).resolves.toBe('not_newer');
      expect(getFoodCatalog().source).toBe('bundled');
    });

    it('keeps current data on invalid payload / HTTP error / network throw', async () => {
      mockFetchOnce({ hello: 'world' });
      await expect(refreshFoodCatalog(true)).resolves.toBe('invalid');
      mockFetchOnce(makeManifest(), false);
      await expect(refreshFoodCatalog(true)).resolves.toBe('offline');
      (global as { fetch: unknown }).fetch = jest.fn().mockRejectedValue(new Error('boom'));
      await expect(refreshFoodCatalog(true)).resolves.toBe('offline');
      expect(getFoodCatalog().source).toBe('bundled');
    });

    it('throttles background refreshes to once a day, force bypasses', async () => {
      storage.set(StorageKeys.FOOD_CATALOG_FETCHED_AT, new Date().toISOString());
      const fn = mockFetchOnce(makeManifest());
      await expect(refreshFoodCatalog()).resolves.toBe('throttled');
      expect(fn).not.toHaveBeenCalled();
      await expect(refreshFoodCatalog(true)).resolves.toBe('updated');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
