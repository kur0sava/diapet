/**
 * getFoodVerdict — the clinical suitability badge shown on each food.
 *
 * Cats: driven by carbs DM% (lower better). Dogs: driven by fat (pancreatitis
 * safety gate) + fibre, but honouring the two legitimate canine approaches —
 * high-fibre bulk OR low-fat + low-glycaemic starch. Guards the 2026 audit
 * finding that accurate (lower) fibre values on real Rx diets must NOT render
 * them "bad".
 */
import { getFoodVerdict } from '@features/encyclopedia/data/diabeticFoods';

describe('getFoodVerdict — cats', () => {
  it('rates by carbs DM: <=7 good, <=15 acceptable, else bad', () => {
    expect(getFoodVerdict(6, 'cat')).toBe('good');
    expect(getFoodVerdict(7, 'cat')).toBe('good');
    expect(getFoodVerdict(12, 'cat')).toBe('acceptable');
    expect(getFoodVerdict(15, 'cat')).toBe('acceptable');
    expect(getFoodVerdict(20, 'cat')).toBe('bad');
    // A grain-free "diabetic" dry at 34% carbs must read bad, not good
    expect(getFoodVerdict(34, 'cat')).toBe('bad');
  });
});

describe('getFoodVerdict — dogs', () => {
  it('high fat is a hard fail (pancreatitis), regardless of fibre', () => {
    expect(getFoodVerdict(40, 'dog', 30, 18)).toBe('bad');
  });

  it("low fat + high fibre = good (Hill's w/d, Purina DCO style)", () => {
    expect(getFoodVerdict(50, 'dog', 10, 17)).toBe('good');
    expect(getFoodVerdict(48, 'dog', 12, 15)).toBe('good');
  });

  it('legit low-fat low-GI Rx diets with moderate fibre are acceptable, NOT bad', () => {
    // Royal Canin Glycobalance Canine: fat ~13, fibre ~9
    expect(getFoodVerdict(30, 'dog', 13, 9)).toBe('acceptable');
    // Brit VD Diabetes: fat ~13, fibre ~7
    expect(getFoodVerdict(29, 'dog', 13, 7)).toBe('acceptable');
    // Trovet WRD Canine: very low fat 6.5, fibre ~9
    expect(getFoodVerdict(42, 'dog', 6.5, 9)).toBe('acceptable');
    // Purina DM Diabetes Management Canine: fat ~13, fibre ~8
    expect(getFoodVerdict(32, 'dog', 13, 8)).toBe('acceptable');
  });

  it('moderate-fat food with very low fibre and no low-fat offset = bad', () => {
    // fat within safety but not "low", fibre deficient → no clinical basis
    expect(getFoodVerdict(45, 'dog', 20, 3)).toBe('bad');
  });

  it('unknown fibre with acceptable fat stays neutral (acceptable)', () => {
    expect(getFoodVerdict(45, 'dog', 12, undefined)).toBe('acceptable');
  });
});
