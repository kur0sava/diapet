import { mmolToMgdl, mgdlToMmol, convertGlucoseValue } from '../types';

describe('mmolToMgdl', () => {
  it('converts 5.5 mmol/L to ~99 mg/dL', () => {
    expect(mmolToMgdl(5.5)).toBe(99);
  });

  it('converts 10 mmol/L to 180 mg/dL', () => {
    expect(mmolToMgdl(10)).toBe(180);
  });

  it('converts 0 to 0', () => {
    expect(mmolToMgdl(0)).toBe(0);
  });

  it('converts boundary hypo value (2.8) correctly', () => {
    expect(mmolToMgdl(2.8)).toBe(50);
  });
});

describe('mgdlToMmol', () => {
  it('converts 100 mg/dL to ~5.55 mmol/L', () => {
    expect(mgdlToMmol(100)).toBe(5.55);
  });

  it('converts 180 mg/dL to ~9.99 mmol/L', () => {
    expect(mgdlToMmol(180)).toBe(9.99);
  });

  it('converts 0 to 0', () => {
    expect(mgdlToMmol(0)).toBe(0);
  });

  it('round-trips preserve 2 decimal precision', () => {
    const original = 7.5;
    const mgdl = mmolToMgdl(original);
    const backToMmol = mgdlToMmol(mgdl);
    expect(Math.abs(backToMmol - original)).toBeLessThan(0.1);
  });
});

describe('convertGlucoseValue', () => {
  it('returns same value when units match', () => {
    expect(convertGlucoseValue(5.5, 'mmol/L', 'mmol/L')).toBe(5.5);
    expect(convertGlucoseValue(100, 'mg/dL', 'mg/dL')).toBe(100);
  });
});
