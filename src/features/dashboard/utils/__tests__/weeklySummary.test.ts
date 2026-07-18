import { computeWeeklySummary } from '../weeklySummary';
import type { GlucoseReading } from '@storage/domain/types';

const NOW = new Date('2026-07-18T12:00:00Z');

function reading(daysAgo: number, valueMmol: number): GlucoseReading {
  const ts = new Date(NOW.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  return {
    id: `r-${daysAgo}-${valueMmol}`,
    petId: 'p1',
    valueMmol,
    valueMgdl: Math.round(valueMmol * 18.0156),
    mealRelation: 'unspecified',
    recordedAt: ts,
    createdAt: ts,
    updatedAt: ts,
  };
}

describe('computeWeeklySummary', () => {
  it('returns empty summary when there are no readings', () => {
    const s = computeWeeklySummary([], undefined, NOW);
    expect(s.measurements).toBe(0);
    expect(s.tir).toBeNull();
    expect(s.tirDelta).toBeNull();
    expect(s.avgMmol).toBeNull();
    expect(s.avgDeltaMmol).toBeNull();
  });

  it('splits readings into current and previous week', () => {
    const readings = [
      // current week: 5 and 20 (cat TIR band ~4..9 → one in range)
      reading(1, 5),
      reading(2, 20),
      // previous week: both in range
      reading(8, 6),
      reading(9, 7),
    ];
    const s = computeWeeklySummary(readings, undefined, NOW);
    expect(s.measurements).toBe(2);
    expect(s.tir).toBeCloseTo(50);
    expect(s.tirDelta).toBeCloseTo(50 - 100);
    expect(s.avgMmol).toBeCloseTo(12.5);
    expect(s.avgDeltaMmol).toBeCloseTo(12.5 - 6.5);
  });

  it('leaves deltas null when previous week has no data', () => {
    const s = computeWeeklySummary([reading(1, 5), reading(3, 6)], undefined, NOW);
    expect(s.measurements).toBe(2);
    expect(s.tir).toBeCloseTo(100);
    expect(s.tirDelta).toBeNull();
    expect(s.avgDeltaMmol).toBeNull();
  });

  it('ignores future-dated readings (device clock change)', () => {
    const s = computeWeeklySummary([reading(-2, 5), reading(1, 6)], undefined, NOW);
    expect(s.measurements).toBe(1);
  });

  it('ignores readings older than two weeks', () => {
    const s = computeWeeklySummary([reading(20, 5), reading(1, 6)], undefined, NOW);
    expect(s.measurements).toBe(1);
    expect(s.tirDelta).toBeNull();
  });
});
