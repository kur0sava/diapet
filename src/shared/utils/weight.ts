/**
 * Pet-weight units. Weight is ALWAYS stored canonically in kilograms
 * (pet.weightKg); the unit here only controls how the user enters and reads
 * it. US owners think in pounds — entering "66" in a kg-only field silently
 * broke the per-kg insulin dose-warning thresholds (audit A3), so the entry
 * screens now let the user pick the unit and we convert to kg before storing.
 */
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { getAppRegion, getRegionDefaults } from '@shared/config/regionConfig';

export type WeightUnit = 'kg' | 'lb';

export const LB_PER_KG = 2.20462;

export const kgToLb = (kg: number): number => kg * LB_PER_KG;
export const lbToKg = (lb: number): number => lb / LB_PER_KG;

/** The user's chosen weight unit. Falls back to the region default when unset. */
export function getWeightUnit(): WeightUnit {
  const saved = storage.getString(StorageKeys.WEIGHT_UNIT);
  if (saved === 'kg' || saved === 'lb') return saved;
  return getRegionDefaults(getAppRegion()).weightUnit;
}

export function setWeightUnit(unit: WeightUnit): void {
  storage.set(StorageKeys.WEIGHT_UNIT, unit);
}

/** Canonical kg → input string in `unit` (1 decimal). '' when no weight. */
export function kgToInput(kg: number | undefined | null, unit: WeightUnit): string {
  if (kg == null || !(kg > 0)) return '';
  const v = unit === 'lb' ? kgToLb(kg) : kg;
  return (Math.round(v * 10) / 10).toString();
}

/** Input string in `unit` → canonical kg, or undefined when empty/invalid. */
export function inputToKg(input: string, unit: WeightUnit): number | undefined {
  const n = parseFloat(input.replace(',', '.'));
  if (!(n > 0)) return undefined;
  return unit === 'lb' ? lbToKg(n) : n;
}

/** Convert a displayed input string from one unit to another (1 decimal),
 *  preserving '' / invalid as ''. Used by the in-screen kg/lb toggle. */
export function convertInput(input: string, from: WeightUnit, to: WeightUnit): string {
  if (from === to) return input;
  const kg = inputToKg(input, from);
  if (kg == null) return '';
  return kgToInput(kg, to);
}
