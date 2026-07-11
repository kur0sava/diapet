/**
 * Self-updating diabetic food catalog.
 *
 * Three layers, best available wins:
 *   1. bundled  — ALL_CAT_FOODS / ALL_DOG_FOODS compiled into the APK
 *   2. cache    — last successfully downloaded manifest (MMKV), survives offline
 *   3. remote   — foods-manifest.json on a public git repo (see runtimeConfig)
 *
 * The remote manifest lets the food list stay current for years without app
 * releases ("the app must outlive its developer"): curation happens in the
 * diapet-foods-data repo, community can send PRs, the client just pulls.
 *
 * Failure model: anything wrong with the network, the JSON, or the schema →
 * silent fallback to the previous layer. The user NEVER sees an empty
 * catalog because of a bad download.
 */
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { getFoodsManifestUrl } from '@shared/config/runtimeConfig';
import {
  ALL_CAT_FOODS,
  ALL_DOG_FOODS,
  VALID_REGIONS,
  type DiabeticCatFood,
  type Region,
} from './diabeticFoods';

/** Bump when DiabeticCatFood's shape changes incompatibly. A manifest with a
 * NEWER major schema is ignored by old clients instead of crashing them. */
export const MANIFEST_SCHEMA_VERSION = 1;

/** When the bundled data was last curated. A cached/remote manifest is only
 * accepted if it is strictly newer — an app update with fresher bundled data
 * must not be shadowed by a stale download. Update alongside data edits. */
export const BUNDLED_GENERATED_AT = '2026-07-09T22:00:00.000Z';

/** Re-fetch at most once a day; pull-to-refresh bypasses via force. */
const REFRESH_THROTTLE_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 12_000;

export interface FoodsManifest {
  schemaVersion: number;
  generatedAt: string;
  foods: {
    cat: DiabeticCatFood[];
    dog: DiabeticCatFood[];
  };
}

export interface FoodCatalogState {
  cat: DiabeticCatFood[];
  dog: DiabeticCatFood[];
  /** ISO datetime of the data currently in use. */
  generatedAt: string;
  source: 'bundled' | 'cache';
}

export type RefreshStatus = 'updated' | 'not_newer' | 'throttled' | 'offline' | 'invalid';

// ────────────────────────────────────────────────────
// Validation
// ────────────────────────────────────────────────────

const FOOD_TYPES = new Set(['dry', 'wet', 'both']);
const FOOD_CATEGORIES = new Set(['prescription', 'veterinary', 'otc_low_carb']);

function inRangeOrUndefined(v: unknown, min: number, max: number): boolean {
  return v === undefined || (typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max);
}

/** Structural check for one food entry. Unknown extra fields are fine. */
export function isValidFood(value: unknown): value is DiabeticCatFood {
  if (!value || typeof value !== 'object') return false;
  const f = value as Record<string, unknown>;
  if (typeof f.id !== 'string' || !f.id) return false;
  if (typeof f.brand !== 'string' || !f.brand) return false;
  if (typeof f.product !== 'string' || !f.product) return false;
  if (typeof f.type !== 'string' || !FOOD_TYPES.has(f.type)) return false;
  if (typeof f.category !== 'string' || !FOOD_CATEGORIES.has(f.category)) return false;
  if (typeof f.prescriptionRequired !== 'boolean') return false;
  if (!Array.isArray(f.regions) || f.regions.length === 0) return false;
  if (!f.regions.every(r => (VALID_REGIONS as readonly string[]).includes(r as string)))
    return false;
  if (f.species !== undefined && f.species !== 'cat' && f.species !== 'dog' && f.species !== 'all')
    return false;
  // B7 (audit): bound the medical numbers. The remote manifest is fetched from
  // a public, unauthenticated URL; a corrupt or malicious payload must not be
  // able to present an implausible macro (e.g. carbsDM: 2 on a high-carb food,
  // flipping its diabetic verdict to "good") as valid data. DM percentages are
  // 0–100 by definition; kcalPerKg has a generous sane ceiling.
  for (const dm of [f.proteinDM, f.fatDM, f.carbsDM, f.fiberDM]) {
    if (!inRangeOrUndefined(dm, 0, 100)) return false;
  }
  if (!inRangeOrUndefined(f.kcalPerKg, 0, 8000)) return false;
  return true;
}

/**
 * Validate a downloaded/cached manifest. Lenient per entry (bad rows are
 * dropped) but strict about the envelope and about minimum plausible sizes —
 * a truncated file must not silently replace a full catalog.
 */
export function validateManifest(raw: unknown): FoodsManifest | null {
  if (!raw || typeof raw !== 'object') return null;
  const m = raw as Record<string, unknown>;
  if (typeof m.schemaVersion !== 'number' || m.schemaVersion > MANIFEST_SCHEMA_VERSION) {
    return null;
  }
  if (typeof m.generatedAt !== 'string' || !Number.isFinite(Date.parse(m.generatedAt))) {
    return null;
  }
  const foods = m.foods as Record<string, unknown> | undefined;
  if (!foods || typeof foods !== 'object') return null;
  if (!Array.isArray(foods.cat) || !Array.isArray(foods.dog)) return null;

  const cat = foods.cat.filter(isValidFood);
  const dog = foods.dog.filter(isValidFood);
  // Plausibility floor: bundled data has 20+ cat and 10+ dog entries; a
  // manifest claiming to replace it with a handful of rows is corrupt.
  if (cat.length < 10 || dog.length < 5) return null;

  return {
    schemaVersion: m.schemaVersion,
    generatedAt: m.generatedAt,
    foods: { cat, dog },
  };
}

// ────────────────────────────────────────────────────
// Catalog state
// ────────────────────────────────────────────────────

const BUNDLED_STATE: FoodCatalogState = {
  cat: ALL_CAT_FOODS,
  dog: ALL_DOG_FOODS,
  generatedAt: BUNDLED_GENERATED_AT,
  source: 'bundled',
};

let current: FoodCatalogState | null = null;

// B6 (audit): a screen mounted BEFORE the startup background refresh resolves
// used to keep showing stale data until a manual pull-to-refresh. Consumers now
// subscribe and re-read when the live catalog is replaced.
let catalogVersion = 0;
const catalogListeners = new Set<() => void>();

/** Monotonic counter bumped whenever the live catalog is replaced. */
export function getFoodCatalogVersion(): number {
  return catalogVersion;
}

/** Subscribe to catalog replacements. Returns an unsubscribe function. */
export function subscribeFoodCatalog(listener: () => void): () => void {
  catalogListeners.add(listener);
  return () => {
    catalogListeners.delete(listener);
  };
}

function bumpCatalogVersion(): void {
  catalogVersion += 1;
  catalogListeners.forEach(l => {
    try {
      l();
    } catch {
      /* a listener error must not break the refresh */
    }
  });
}

function loadFromCache(): FoodCatalogState | null {
  try {
    const json = storage.getString(StorageKeys.FOOD_CATALOG_CACHE);
    if (!json) return null;
    const manifest = validateManifest(JSON.parse(json));
    if (!manifest) return null;
    if (Date.parse(manifest.generatedAt) <= Date.parse(BUNDLED_GENERATED_AT)) return null;
    return {
      cat: manifest.foods.cat,
      dog: manifest.foods.dog,
      generatedAt: manifest.generatedAt,
      source: 'cache',
    };
  } catch {
    return null;
  }
}

/** Current best catalog (cache if newer than bundled, else bundled). */
export function getFoodCatalog(): FoodCatalogState {
  if (!current) {
    current = loadFromCache() ?? BUNDLED_STATE;
  }
  return current;
}

/** Test hook: drop memoized state so the next call re-reads storage. */
export function __resetFoodCatalogForTests(): void {
  current = null;
}

// ────────────────────────────────────────────────────
// Species/region getters (mirror diabeticFoods helpers, but over the
// live catalog). `species` defaults to 'cat' for legacy entries.
// ────────────────────────────────────────────────────

type FoodSpecies = 'cat' | 'dog';

/**
 * Whether a food is available in the given region. Germany (DE) is split out
 * as its own region for local stores/brands, but it is also part of the EU
 * market — so a DE user must also see EU-tagged foods (Royal Canin Diabetic,
 * Purina DM, etc. are tagged EU, not DE). Without this, German diabetic-pet
 * owners saw only the handful of DE-tagged foods and missed every mainstream
 * prescription diet.
 */
function foodInRegion(food: DiabeticCatFood, region: Region): boolean {
  if (food.regions.includes(region)) return true;
  if (region === 'DE' && food.regions.includes('EU')) return true;
  return false;
}

export function getCatalogFoods(species: FoodSpecies): DiabeticCatFood[] {
  const state = getFoodCatalog();
  return species === 'dog' ? state.dog : state.cat;
}

/**
 * Species catalog filtered to a region — same availability logic as the
 * feed-guide screen (foodInRegion, incl. the DE→EU widening). Used by the
 * feeding log picker so a user who set region=RU doesn't see brands the app
 * itself flags as unavailable there (Hill's/Farmina left the RU market). The
 * "enter manually" fallback still covers parallel-imported/leftover stock.
 */
export function getCatalogFoodsForRegion(species: FoodSpecies, region: Region): DiabeticCatFood[] {
  return getCatalogFoods(species).filter(f => foodInRegion(f, region));
}

export function getCatalogPrescriptionFoods(
  region?: Region,
  species: FoodSpecies = 'cat'
): DiabeticCatFood[] {
  const foods = getCatalogFoods(species).filter(f => f.category === 'prescription');
  return region ? foods.filter(f => foodInRegion(f, region)) : foods;
}

/** Everything that is not first-line Rx: veterinary weight-management +
 * OTC low-carb (cat) / high-fiber (dog). */
export function getCatalogOtcFoods(
  region?: Region,
  species: FoodSpecies = 'cat'
): DiabeticCatFood[] {
  const foods = getCatalogFoods(species).filter(f => f.category !== 'prescription');
  return region ? foods.filter(f => foodInRegion(f, region)) : foods;
}

// ────────────────────────────────────────────────────
// Refresh
// ────────────────────────────────────────────────────

let refreshInFlight: Promise<RefreshStatus> | null = null;

/**
 * Pull the remote manifest if due. Never throws. Concurrent calls coalesce
 * into one request.
 *
 * @param force bypass the 24h throttle (pull-to-refresh / "Update" button)
 */
export function refreshFoodCatalog(force = false): Promise<RefreshStatus> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = doRefresh(force).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function doRefresh(force: boolean): Promise<RefreshStatus> {
  try {
    if (!force) {
      const last = storage.getString(StorageKeys.FOOD_CATALOG_FETCHED_AT);
      if (last && Date.now() - Date.parse(last) < REFRESH_THROTTLE_MS) {
        return 'throttled';
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let raw: unknown;
    try {
      const response = await fetch(getFoodsManifestUrl(), {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) return 'offline';
      raw = await response.json();
    } finally {
      clearTimeout(timeout);
    }

    const manifest = validateManifest(raw);
    if (!manifest) return 'invalid';

    // A successful, valid fetch counts for the throttle even if not newer.
    storage.set(StorageKeys.FOOD_CATALOG_FETCHED_AT, new Date().toISOString());

    const currentTs = Date.parse(getFoodCatalog().generatedAt);
    if (Date.parse(manifest.generatedAt) <= currentTs) return 'not_newer';

    storage.set(StorageKeys.FOOD_CATALOG_CACHE, JSON.stringify(manifest));
    current = {
      cat: manifest.foods.cat,
      dog: manifest.foods.dog,
      generatedAt: manifest.generatedAt,
      source: 'cache',
    };
    bumpCatalogVersion();
    return 'updated';
  } catch {
    return 'offline';
  }
}
