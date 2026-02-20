import { getGlucoseLevel, getGlucoseColor, GLUCOSE_RANGES } from '../types';

describe('getGlucoseLevel', () => {
  it('returns "low" when value is below 4.0', () => {
    expect(getGlucoseLevel(2.5)).toBe('low');
    expect(getGlucoseLevel(3.9)).toBe('low');
    expect(getGlucoseLevel(0)).toBe('low');
  });

  it('returns "normal" when value is between 4.0 and 9.0 (inclusive)', () => {
    expect(getGlucoseLevel(4.0)).toBe('normal');
    expect(getGlucoseLevel(6.5)).toBe('normal');
    expect(getGlucoseLevel(9.0)).toBe('normal');
  });

  it('returns "high" when value is between 9.0 (exclusive) and 14.0 (inclusive)', () => {
    expect(getGlucoseLevel(9.1)).toBe('high');
    expect(getGlucoseLevel(12.0)).toBe('high');
    expect(getGlucoseLevel(14.0)).toBe('high');
  });

  it('returns "very_high" when value is above 14.0', () => {
    expect(getGlucoseLevel(14.1)).toBe('very_high');
    expect(getGlucoseLevel(20.0)).toBe('very_high');
    expect(getGlucoseLevel(30.0)).toBe('very_high');
  });
});

describe('getGlucoseColor', () => {
  it('returns red for low glucose', () => {
    expect(getGlucoseColor(2.0)).toBe(GLUCOSE_RANGES.low.color);
    expect(getGlucoseColor(2.0)).toBe('#FF3B30');
  });

  it('returns green for normal glucose', () => {
    expect(getGlucoseColor(6.0)).toBe(GLUCOSE_RANGES.normal.color);
    expect(getGlucoseColor(6.0)).toBe('#34C759');
  });

  it('returns orange for high glucose', () => {
    expect(getGlucoseColor(12.0)).toBe(GLUCOSE_RANGES.high.color);
    expect(getGlucoseColor(12.0)).toBe('#FF9500');
  });

  it('returns red for very high glucose', () => {
    expect(getGlucoseColor(16.0)).toBe(GLUCOSE_RANGES.very_high.color);
    expect(getGlucoseColor(16.0)).toBe('#FF3B30');
  });
});

describe('GLUCOSE_RANGES', () => {
  it('has correct boundary values', () => {
    expect(GLUCOSE_RANGES.low.max).toBe(4.0);
    expect(GLUCOSE_RANGES.normal.min).toBe(4.0);
    expect(GLUCOSE_RANGES.normal.max).toBe(9.0);
    expect(GLUCOSE_RANGES.high.min).toBe(9.0);
    expect(GLUCOSE_RANGES.high.max).toBe(14.0);
    expect(GLUCOSE_RANGES.very_high.min).toBe(14.0);
  });
});
