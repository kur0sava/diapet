import { analyzeTrends } from '../trendEngine';
import { GlucoseReading } from '@storage/domain/types';

function makeReading(valueMmol: number, daysAgo: number, hour = 12): GlucoseReading {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return {
    id: `r-${daysAgo}-${hour}`,
    petId: 'pet1',
    valueMmol,
    valueMgdl: Math.round(valueMmol * 18),
    recordedAt: date.toISOString(),
    mealRelation: 'before_meal' as const,
    createdAt: date.toISOString(),
    updatedAt: date.toISOString(),
  };
}

describe('analyzeTrends', () => {
  it('returns nulls for empty readings', () => {
    const result = analyzeTrends([]);
    expect(result.movingAverage3d).toBeNull();
    expect(result.movingAverage7d).toBeNull();
    expect(result.direction).toBeNull();
    expect(result.cv).toBeNull();
    expect(result.timeInRange).toBeNull();
    expect(result.totalReadings).toBe(0);
  });

  it('calculates moving averages for sufficient data', () => {
    // 10 readings over 10 days, all at 7.0 mmol/L
    const readings = Array.from({ length: 10 }, (_, i) => makeReading(7.0, 10 - i));
    const result = analyzeTrends(readings);
    expect(result.movingAverage3d).toBeCloseTo(7.0, 1);
    expect(result.movingAverage7d).toBeCloseTo(7.0, 1);
    expect(result.totalReadings).toBe(10);
  });

  it('detects improving trend (values decreasing toward normal)', () => {
    // Glucose going from high to normal over 14 days
    const readings = [
      makeReading(15, 14),
      makeReading(14, 12),
      makeReading(13, 10),
      makeReading(11, 8),
      makeReading(9, 6),
      makeReading(8, 4),
      makeReading(7, 2),
      makeReading(6, 0),
    ];
    const result = analyzeTrends(readings);
    expect(result.direction).toBe('improving');
  });

  it('detects worsening trend (values increasing away from normal)', () => {
    const readings = [
      makeReading(6, 14),
      makeReading(7, 12),
      makeReading(9, 10),
      makeReading(11, 8),
      makeReading(13, 6),
      makeReading(15, 4),
      makeReading(17, 2),
      makeReading(19, 0),
    ];
    const result = analyzeTrends(readings);
    expect(result.direction).toBe('worsening');
  });

  it('calculates timeInRange correctly', () => {
    // 4 in range (4-12), 1 out of range
    const readings = [
      makeReading(5, 4),
      makeReading(7, 3),
      makeReading(10, 2),
      makeReading(6, 1),
      makeReading(15, 0), // out of range
    ];
    const result = analyzeTrends(readings);
    expect(result.timeInRange).toBe(80); // 4/5 = 80%
  });

  it('calculates CV as a percentage', () => {
    // Varied readings
    const readings = [
      makeReading(5, 5),
      makeReading(10, 4),
      makeReading(5, 3),
      makeReading(10, 2),
      makeReading(5, 1),
      makeReading(10, 0),
    ];
    const result = analyzeTrends(readings);
    expect(result.cv).not.toBeNull();
    expect(result.cv!).toBeGreaterThan(0);
    expect(result.cv!).toBeLessThan(100);
  });
});
