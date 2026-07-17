import {
  getGlucoseLevel,
  getGlucoseColor,
  getGlucoseDirection,
  getGlucoseArrow,
  GLUCOSE_RANGES,
} from '../types';

describe('getGlucoseLevel', () => {
  it('returns proper levels for hypo ranges', () => {
    expect(getGlucoseLevel(2.5)).toBe('severe_low');
    expect(getGlucoseLevel(2.8)).toBe('low');
    expect(getGlucoseLevel(3.2)).toBe('low');
    expect(getGlucoseLevel(3.5)).toBe('below_target');
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
    expect(getGlucoseColor(2.0)).toBe(GLUCOSE_RANGES.severe_low.color);
    expect(getGlucoseColor(3.0)).toBe(GLUCOSE_RANGES.low.color);
  });

  it('returns green for normal glucose', () => {
    expect(getGlucoseColor(6.0)).toBe(GLUCOSE_RANGES.normal.color);
    expect(getGlucoseColor(6.0)).toBe('#34C759');
  });

  it('returns orange for high glucose', () => {
    expect(getGlucoseColor(12.0)).toBe(GLUCOSE_RANGES.high.color);
    expect(getGlucoseColor(12.0)).toBe('#FF9500');
  });

  it('returns purple for very high glucose (red is reserved for hypo)', () => {
    expect(getGlucoseColor(16.0)).toBe(GLUCOSE_RANGES.very_high.color);
    expect(getGlucoseColor(16.0)).toBe('#AF52DE');
  });

  it('never reuses a hypo colour for a hyper tier (direction encoding)', () => {
    const hypoColors = [
      GLUCOSE_RANGES.severe_low.color,
      GLUCOSE_RANGES.low.color,
      GLUCOSE_RANGES.below_target.color,
    ];
    expect(hypoColors).not.toContain(GLUCOSE_RANGES.high.color);
    expect(hypoColors).not.toContain(GLUCOSE_RANGES.very_high.color);
  });
});

describe('getGlucoseDirection / getGlucoseArrow', () => {
  it('maps hypo tiers to low / ▼', () => {
    for (const level of ['severe_low', 'low', 'below_target'] as const) {
      expect(getGlucoseDirection(level)).toBe('low');
      expect(getGlucoseArrow(level)).toBe('▼');
    }
  });

  it('maps hyper tiers to high / ▲', () => {
    for (const level of ['high', 'very_high'] as const) {
      expect(getGlucoseDirection(level)).toBe('high');
      expect(getGlucoseArrow(level)).toBe('▲');
    }
  });

  it('maps normal to normal / empty arrow', () => {
    expect(getGlucoseDirection('normal')).toBe('normal');
    expect(getGlucoseArrow('normal')).toBe('');
  });
});

describe('GLUCOSE_RANGES', () => {
  it('has correct boundary values', () => {
    expect(GLUCOSE_RANGES.severe_low.max).toBe(2.8);
    expect(GLUCOSE_RANGES.low.min).toBe(2.8);
    expect(GLUCOSE_RANGES.low.max).toBe(3.3);
    expect(GLUCOSE_RANGES.below_target.min).toBe(3.3);
    expect(GLUCOSE_RANGES.below_target.max).toBe(4.0);
    expect(GLUCOSE_RANGES.normal.min).toBe(4.0);
    expect(GLUCOSE_RANGES.normal.max).toBe(9.0);
    expect(GLUCOSE_RANGES.high.min).toBe(9.0);
    expect(GLUCOSE_RANGES.high.max).toBe(14.0);
    expect(GLUCOSE_RANGES.very_high.min).toBe(14.0);
  });
});
