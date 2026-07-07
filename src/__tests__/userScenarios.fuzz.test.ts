/**
 * User-scenario fuzz ("робот-пользователь").
 *
 * Runs seeded random sequences of real user actions against the REAL
 * repository + migration code on a real in-memory SQLite (node:sqlite via
 * the expo-sqlite jest mock) and real MMKV-shaped storage, checking
 * cross-cutting invariants after every step:
 *   - referential integrity (no orphans, FK SET NULL honored)
 *   - mmol/mgdl consistency on every stored reading
 *   - pagination completeness (pages == full scan, no loss/dup)
 *   - stats vs raw rows
 *   - day queries return only that local day
 *   - analyzer pipeline never throws and stays in-range on arbitrary data
 *   - pet deletion leaves no rows or per-pet MMKV keys behind
 *
 * On failure the seed and the tail of the action log are printed —
 * re-running with that seed reproduces the exact scenario.
 */
import {
  petRepository,
  glucoseRepository,
  injectionRepository,
  feedingRepository,
  symptomRepository,
  scheduleRepository,
  expenseRepository,
  getDatabase,
} from '@storage/database';
import { closeDatabase } from '@storage/database/database';
import { initStorage, storage, vetNameKey, vetPhoneKey } from '@storage/mmkv/storage';
import { __resetAllMmkvStores } from '../test/mocks/mmkvMock';
import { analyzeTrends } from '@features/analyzer/engine/trendEngine';
import { detectPatterns } from '@features/analyzer/engine/patternDetector';
import { calculateRiskScore } from '@features/analyzer/engine/riskScoreCalculator';
import { generateSmartAlerts } from '@features/analyzer/engine/smartAlerts';
import { sanitizePatterns, checkEmergencyThresholds } from '@features/analyzer/engine/safetyGuard';
import { getSpeciesConfig } from '@shared/config/speciesConfig';
import { MGDL_PER_MMOLL, toDateOnlySafe } from '../test/fuzzUtils';
import type { Pet, SymptomType, ExpenseCategory, MealRelation } from '@storage/domain/types';

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32) — deterministic, reproducible failures
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;
const int = (rng: Rng, min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const float = (rng: Rng, min: number, max: number) => rng() * (max - min) + min;
const pick = <T>(rng: Rng, arr: readonly T[]): T => arr[int(rng, 0, arr.length - 1)];
const chance = (rng: Rng, p: number) => rng() < p;

const MEALS: MealRelation[] = ['before_meal', 'after_meal', 'fasting', 'unspecified'];
const CATEGORIES: ExpenseCategory[] = [
  'insulin',
  'testStrips',
  'vetVisit',
  'medication',
  'food',
  'other',
];
const WEIRD_NOTES = [
  'обычная заметка',
  'o\'quote "double" `tick`',
  '🐱🐶💉 emoji + \n newline',
  'x'.repeat(500),
  '   ',
  'DROP TABLE pets; --',
];

function randomPastIso(rng: Rng, maxDaysBack = 45): string {
  const back = rng() * maxDaysBack * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - back).toISOString();
}

// ---------------------------------------------------------------------------
// Invariants
// ---------------------------------------------------------------------------
async function checkInvariants(pets: Pet[]) {
  const db = await getDatabase();

  // 1. No orphaned children
  const childTables: Array<[string, string]> = [
    ['glucose_readings', 'pet_id'],
    ['injections', 'pet_id'],
    ['feedings', 'pet_id'],
    ['symptoms', 'pet_id'],
    ['expenses', 'pet_id'],
    ['injection_schedule', 'pet_id'],
    ['feeding_schedule', 'pet_id'],
  ];
  for (const [table, col] of childTables) {
    const row = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM ${table} WHERE ${col} NOT IN (SELECT id FROM pets)`
    );
    if ((row?.cnt ?? 0) > 0) throw new Error(`orphan rows in ${table}: ${row?.cnt}`);
  }
  const badSymptomFk = await db.getFirstAsync<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM symptoms
     WHERE glucose_reading_id IS NOT NULL
       AND glucose_reading_id NOT IN (SELECT id FROM glucose_readings)`
  );
  if ((badSymptomFk?.cnt ?? 0) > 0) {
    throw new Error(`symptoms.glucose_reading_id dangling: ${badSymptomFk?.cnt}`);
  }

  // 2. Numeric sanity + mmol/mgdl consistency for every stored reading
  const badNumeric = await db.getFirstAsync<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM glucose_readings
     WHERE value_mmol IS NULL OR value_mgdl IS NULL
        OR value_mmol <= 0 OR value_mgdl <= 0
        OR ABS(value_mgdl - value_mmol * ${MGDL_PER_MMOLL}) > 0.6`
  );
  if ((badNumeric?.cnt ?? 0) > 0) {
    const sample = await db.getFirstAsync<{ value_mmol: number; value_mgdl: number }>(
      `SELECT value_mmol, value_mgdl FROM glucose_readings
       WHERE ABS(value_mgdl - value_mmol * ${MGDL_PER_MMOLL}) > 0.6 LIMIT 1`
    );
    throw new Error(
      `mmol/mgdl inconsistent rows: ${badNumeric?.cnt}, sample=${JSON.stringify(sample)}`
    );
  }

  for (const pet of pets) {
    const all = await glucoseRepository.findAllByPetId(pet.id);

    // 3. Pagination completeness: walking pages must equal a full scan
    const paged: string[] = [];
    let cursor: string | undefined;
    for (let guard = 0; guard < 200; guard++) {
      const page = await glucoseRepository.findByPetId(pet.id, 7, cursor);
      paged.push(...page.data.map(r => r.id));
      if (!page.nextCursor) break;
      cursor = page.nextCursor;
    }
    const pagedSet = new Set(paged);
    if (pagedSet.size !== paged.length) {
      throw new Error(`pagination returned duplicates for pet ${pet.name}`);
    }
    if (pagedSet.size !== all.length) {
      throw new Error(
        `pagination lost rows for pet ${pet.name}: paged=${pagedSet.size} full=${all.length}`
      );
    }

    // 4. Stats vs raw rows
    const stats = await glucoseRepository.getStats(pet.id, 36500);
    if (stats.count !== all.length) {
      throw new Error(`stats.count=${stats.count} != rows=${all.length} for pet ${pet.name}`);
    }
    if (all.length > 0 && (stats.avg < stats.min - 1e-9 || stats.avg > stats.max + 1e-9)) {
      throw new Error(`stats avg outside [min,max] for pet ${pet.name}`);
    }

    // 5. findForDay returns only that local day
    const today = toDateOnlySafe(new Date());
    const dayRows = await glucoseRepository.findForDay(pet.id, today);
    for (const r of dayRows) {
      if (toDateOnlySafe(new Date(r.recordedAt)) !== today) {
        throw new Error(`findForDay(${today}) returned ${r.recordedAt}`);
      }
    }

    // 6. Analyzer pipeline: never throws, always in-range on arbitrary data
    const config = getSpeciesConfig(pet.species);
    const injections = await injectionRepository.findAllByPetId(pet.id);
    const feedings = await feedingRepository.findAllByPetId(pet.id);
    const symptoms = await symptomRepository.findAllByPetId(pet.id);
    const now = new Date();

    const trends = analyzeTrends(all, now, config);
    if (trends.timeInRange !== null && (trends.timeInRange < 0 || trends.timeInRange > 100)) {
      throw new Error(`TIR out of range: ${trends.timeInRange}`);
    }
    if (trends.cv !== null && !isFinite(trends.cv)) throw new Error(`CV not finite: ${trends.cv}`);

    const patterns = sanitizePatterns(
      detectPatterns({ readings: all, injections, feedings, now, config })
    );
    if (all.length > 0) {
      const risk = calculateRiskScore({
        readings: all,
        injections,
        feedings,
        symptoms,
        weightKg: pet.weightKg,
        diagnosisDays: 30,
        scheduledInjectionsPerDay: 2,
        now,
        config,
      });
      if (risk.totalScore < 0 || risk.totalScore > 100 || !isFinite(risk.totalScore)) {
        throw new Error(`risk score out of range: ${risk.totalScore}`);
      }
      // must not throw (uses mocked MMKV for throttling)
      generateSmartAlerts(trends, risk, patterns, all, now, config);
    }
    checkEmergencyThresholds(all, config);
  }
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
interface World {
  rng: Rng;
  pets: Pet[];
  log: string[];
}

async function actCreatePet(w: World) {
  if (w.pets.length >= 4) return;
  const species = pick(w.rng, ['cat', 'dog'] as const);
  const pet = await petRepository.create({
    name: pick(w.rng, ['Барсик', 'Rex', '🐾', 'Ли', 'Very Long Pet Name Indeed 12345']),
    species,
    gender: pick(w.rng, ['male', 'female'] as const),
    weightKg: chance(w.rng, 0.8) ? float(w.rng, 0.5, species === 'dog' ? 60 : 12) : undefined,
    birthYear: chance(w.rng, 0.7) ? int(w.rng, 2010, 2025) : undefined,
    diabetesType: pick(w.rng, ['type1', 'type2', 'unknown'] as const),
    diagnosisDate: chance(w.rng, 0.5) ? toDateOnlySafe(new Date()) : undefined,
  });
  if (chance(w.rng, 0.5)) storage.set(vetNameKey(pet.id), 'Dr. Fuzz');
  if (chance(w.rng, 0.5)) storage.set(vetPhoneKey(pet.id), '+7 000');
  await scheduleRepository.addInjectionTime(pet.id, '08:00');
  await scheduleRepository.addFeedingTime(pet.id, '08:00');
  w.pets.push(pet);
  w.log.push(`createPet(${pet.species} ${pet.name})`);
}

async function actDeletePet(w: World) {
  if (w.pets.length <= 1) return; // UI forbids deleting the last pet
  const idx = int(w.rng, 0, w.pets.length - 1);
  const pet = w.pets[idx];
  await petRepository.delete(pet.id);
  w.pets.splice(idx, 1);
  w.log.push(`deletePet(${pet.name})`);
  // Immediate post-conditions of deletion
  if (storage.contains(vetNameKey(pet.id)) || storage.contains(vetPhoneKey(pet.id))) {
    throw new Error('per-pet MMKV keys survived pet deletion');
  }
}

async function actAddGlucose(w: World) {
  const pet = pick(w.rng, w.pets);
  const useMgdl = chance(w.rng, 0.3);
  const mmol = float(w.rng, 0.6, 34.9);
  const existing = chance(w.rng, 0.1)
    ? (await glucoseRepository.findAllByPetId(pet.id))[0]
    : undefined;
  await glucoseRepository.create({
    petId: pet.id,
    value: useMgdl ? Math.round(mmol * MGDL_PER_MMOLL) : Math.round(mmol * 10) / 10,
    unit: useMgdl ? 'mg/dL' : 'mmol/L',
    mealRelation: pick(w.rng, MEALS),
    insulinDose: chance(w.rng, 0.3) ? float(w.rng, 0.5, 8) : undefined,
    insulinType: chance(w.rng, 0.3) ? pick(w.rng, ['Lantus', 'Левемир', '💉']) : undefined,
    notes: chance(w.rng, 0.3) ? pick(w.rng, WEIRD_NOTES) : undefined,
    // 10% of readings share an EXACT timestamp with an existing one —
    // pagination cursors must survive ties
    recordedAt: existing ? existing.recordedAt : randomPastIso(w.rng),
  });
  w.log.push(`addGlucose(${pet.name}${existing ? ', tied-ts' : ''})`);
}

async function actUpdateGlucose(w: World) {
  const pet = pick(w.rng, w.pets);
  const all = await glucoseRepository.findAllByPetId(pet.id);
  if (all.length === 0) return;
  const target = pick(w.rng, all);
  await glucoseRepository.update(target.id, {
    value: float(w.rng, 1, 30),
    unit: pick(w.rng, ['mmol/L', 'mg/dL'] as const),
    notes: chance(w.rng, 0.5) ? pick(w.rng, WEIRD_NOTES) : undefined,
    recordedAt: chance(w.rng, 0.5) ? randomPastIso(w.rng) : undefined,
  });
  w.log.push(`updateGlucose(${pet.name})`);
}

async function actDeleteGlucose(w: World) {
  const pet = pick(w.rng, w.pets);
  const all = await glucoseRepository.findAllByPetId(pet.id);
  if (all.length === 0) return;
  await glucoseRepository.delete(pick(w.rng, all).id);
  w.log.push(`deleteGlucose(${pet.name})`);
}

async function actAddInjection(w: World) {
  const pet = pick(w.rng, w.pets);
  await injectionRepository.create({
    petId: pet.id,
    insulinType: pick(w.rng, ['Caninsulin', 'Гларгин', 'NPH 💉', "O'Insulin"]),
    doseUnits: float(w.rng, 0.25, 20),
    notes: chance(w.rng, 0.2) ? pick(w.rng, WEIRD_NOTES) : undefined,
    administeredAt: randomPastIso(w.rng),
  });
  w.log.push(`addInjection(${pet.name})`);
}

async function actAddFeeding(w: World) {
  const pet = pick(w.rng, w.pets);
  const withNutrition = chance(w.rng, 0.4);
  const moisture = float(w.rng, 3, 82);
  const protein = float(w.rng, 5, 45);
  const fat = float(w.rng, 2, 25);
  await feedingRepository.create({
    petId: pet.id,
    foodType: pick(w.rng, ['dry', 'wet', 'medical', 'natural', 'other'] as const),
    amountGrams: chance(w.rng, 0.8) ? float(w.rng, 1, 1999) : undefined,
    fedAt: randomPastIso(w.rng),
    ...(withNutrition
      ? {
          protein,
          fat,
          fiber: float(w.rng, 0, 8),
          ash: float(w.rng, 0, 8),
          moisture,
          carbsDM: float(w.rng, 0, 50),
          verdict: pick(w.rng, ['good', 'acceptable', 'bad']),
        }
      : {}),
  });
  w.log.push(`addFeeding(${pet.name})`);
}

async function actAddSymptom(w: World) {
  const pet = pick(w.rng, w.pets);
  const available = getSpeciesConfig(pet.species).symptoms.available;
  const count = int(w.rng, 1, Math.min(4, available.length));
  const types = [...available].sort(() => w.rng() - 0.5).slice(0, count) as SymptomType[];
  const readings = await glucoseRepository.findAllByPetId(pet.id);
  const linked = readings.length > 0 && chance(w.rng, 0.4) ? pick(w.rng, readings) : undefined;
  await symptomRepository.create({
    petId: pet.id,
    symptomTypes: types,
    severity: pick(w.rng, ['mild', 'moderate', 'severe'] as const),
    glucoseReadingId: linked?.id,
    recordedAt: randomPastIso(w.rng),
  });
  w.log.push(`addSymptom(${pet.name}${linked ? ', linked' : ''})`);
  // FK SET NULL path: sometimes delete the linked reading right away
  if (linked && chance(w.rng, 0.5)) {
    await glucoseRepository.delete(linked.id);
    w.log.push(`deleteLinkedReading(${pet.name})`);
  }
}

async function actAddExpense(w: World) {
  const pet = pick(w.rng, w.pets);
  await expenseRepository.create({
    petId: pet.id,
    category: pick(w.rng, CATEGORIES),
    amount: float(w.rng, 1, 50000),
    currency: pick(w.rng, ['RUB', 'USD']),
    date: toDateOnlySafe(new Date(Date.now() - w.rng() * 300 * 86400000)),
  });
  w.log.push(`addExpense(${pet.name})`);
}

async function actEditSchedule(w: World) {
  const pet = pick(w.rng, w.pets);
  const existing = await scheduleRepository.getInjectionTimes(pet.id);
  for (const s of existing) await scheduleRepository.deleteInjectionTime(s.id);
  const n = int(w.rng, 1, 4);
  for (let i = 0; i < n; i++) {
    const hh = String(int(w.rng, 0, 23)).padStart(2, '0');
    const mm = String(int(w.rng, 0, 59)).padStart(2, '0');
    await scheduleRepository.addInjectionTime(pet.id, `${hh}:${mm}`);
  }
  w.log.push(`editSchedule(${pet.name}, ${n} times)`);
}

const ACTIONS: Array<[number, (w: World) => Promise<void>]> = [
  [8, actAddGlucose],
  [4, actAddInjection],
  [4, actAddFeeding],
  [3, actAddSymptom],
  [2, actAddExpense],
  [2, actUpdateGlucose],
  [2, actDeleteGlucose],
  [2, actEditSchedule],
  [1.5, actCreatePet],
  [1, actDeletePet],
];
const TOTAL_WEIGHT = ACTIONS.reduce((s, [wgt]) => s + wgt, 0);

function pickAction(rng: Rng) {
  let roll = rng() * TOTAL_WEIGHT;
  for (const [wgt, fn] of ACTIONS) {
    roll -= wgt;
    if (roll <= 0) return fn;
  }
  return ACTIONS[0][1];
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------
const SCENARIOS = Number(process.env.FUZZ_SCENARIOS ?? 20);
const ACTIONS_PER_SCENARIO = Number(process.env.FUZZ_ACTIONS ?? 50);
const BASE_SEED = Number(process.env.FUZZ_SEED ?? 20260707);

async function runScenario(seed: number) {
  await closeDatabase();
  __resetAllMmkvStores();
  const rng = mulberry32(seed);
  const w: World = { rng, pets: [], log: [] };
  try {
    await actCreatePet(w); // always start with one pet (post-onboarding state)
    for (let step = 0; step < ACTIONS_PER_SCENARIO; step++) {
      await pickAction(rng)(w);
      if (step % 8 === 0 || step === ACTIONS_PER_SCENARIO - 1) {
        await checkInvariants(w.pets);
      }
    }
    await checkInvariants(w.pets);
  } catch (e) {
    throw new Error(
      `seed=${seed} failed: ${(e as Error).message}\nlast actions:\n  ${w.log.slice(-15).join('\n  ')}`
    );
  }
}

describe('user scenario fuzz (робот-пользователь)', () => {
  beforeAll(async () => {
    await initStorage();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it(`survives ${SCENARIOS} random scenarios × ${ACTIONS_PER_SCENARIO} actions`, async () => {
    for (let i = 0; i < SCENARIOS; i++) {
      await runScenario(BASE_SEED + i);
    }
  }, 120_000);

  it('regression: pagination survives many identical timestamps', async () => {
    await closeDatabase();
    __resetAllMmkvStores();
    const pet = await petRepository.create({ name: 'Tie', species: 'cat', gender: 'male' });
    const ts = new Date(Date.now() - 3600_000).toISOString();
    for (let i = 0; i < 20; i++) {
      await glucoseRepository.create({
        petId: pet.id,
        value: 5 + i * 0.1,
        unit: 'mmol/L',
        recordedAt: ts,
      });
    }
    const all = await glucoseRepository.findAllByPetId(pet.id);
    const seen = new Set<string>();
    let cursor: string | undefined;
    for (let guard = 0; guard < 50; guard++) {
      const page = await glucoseRepository.findByPetId(pet.id, 7, cursor);
      page.data.forEach(r => seen.add(r.id));
      if (!page.nextCursor) break;
      cursor = page.nextCursor;
    }
    expect(seen.size).toBe(all.length);
  });
});
