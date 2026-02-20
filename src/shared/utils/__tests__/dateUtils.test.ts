import { formatTime, formatCountdown, hoursSince, getNextOccurrence } from '../dateUtils';

// Mock the i18n module to avoid import issues in tests
jest.mock('@shared/i18n', () => ({
  __esModule: true,
  default: {
    language: 'ru',
    t: (key: string) => key,
  },
}));

describe('formatTime', () => {
  it('returns a string in HH:mm format', () => {
    // Use a local date to avoid timezone issues
    const date = new Date(2025, 5, 15, 14, 30, 0); // June 15, 14:30 local
    const result = formatTime(date.toISOString());
    expect(result).toBe('14:30');
  });

  it('pads single-digit hours and minutes', () => {
    const date = new Date(2025, 0, 1, 8, 5, 0); // Jan 1, 08:05 local
    const result = formatTime(date.toISOString());
    expect(result).toBe('08:05');
  });
});

describe('formatCountdown', () => {
  it('formats minutes under 60 as "N min"', () => {
    expect(formatCountdown(5)).toBe('5 мин');
    expect(formatCountdown(45)).toBe('45 мин');
    expect(formatCountdown(59)).toBe('59 мин');
  });

  it('formats 60+ minutes as hours and minutes', () => {
    expect(formatCountdown(60)).toBe('1ч');
    expect(formatCountdown(90)).toBe('1ч 30мин');
    expect(formatCountdown(125)).toBe('2ч 5мин');
  });

  it('omits minutes part when evenly divisible by 60', () => {
    expect(formatCountdown(120)).toBe('2ч');
    expect(formatCountdown(180)).toBe('3ч');
  });
});

describe('hoursSince', () => {
  it('returns the number of hours since the given date', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(hoursSince(twoHoursAgo)).toBe(2);
  });

  it('returns 0 for a very recent date', () => {
    const justNow = new Date().toISOString();
    expect(hoursSince(justNow)).toBe(0);
  });
});

describe('getNextOccurrence', () => {
  it('returns a Date object', () => {
    const result = getNextOccurrence('14:00');
    expect(result).toBeInstanceOf(Date);
  });

  it('returns a future date', () => {
    // Use a time far in the future today or tomorrow
    const result = getNextOccurrence('23:59');
    expect(result.getTime()).toBeGreaterThanOrEqual(Date.now());
  });
});
