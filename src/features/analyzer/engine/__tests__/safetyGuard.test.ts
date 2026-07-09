import {
  sanitizeRecommendation,
  checkEmergencyThresholds,
  getAnalyzerDisclaimer,
} from '../safetyGuard';

describe('sanitizeRecommendation', () => {
  it('passes safe text unchanged', () => {
    const result = sanitizeRecommendation('Glucose is trending down, consult your vet.');
    expect(result.isSafe).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.sanitizedText).toBe('Glucose is trending down, consult your vet.');
  });

  it('catches English dose recommendations', () => {
    const result = sanitizeRecommendation('You should increase the dose to 3 units');
    expect(result.isSafe).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.sanitizedText).not.toContain('increase the dose');
  });

  it('catches Russian dose recommendations', () => {
    const result = sanitizeRecommendation('Увеличьте дозу инсулина на 0.5 единицы');
    expect(result.isSafe).toBe(false);
    expect(result.sanitizedText).not.toContain('Увеличьте дозу');
  });

  it('catches inject + number pattern', () => {
    const result = sanitizeRecommendation('inject 2 units twice daily');
    expect(result.isSafe).toBe(false);
  });

  it('replaces forbidden text with vet disclaimer', () => {
    const result = sanitizeRecommendation('increase dose gradually');
    expect(result.sanitizedText).toContain('discuss with your vet');
  });

  it('M002: replaces EVERY occurrence of a repeated forbidden phrase', () => {
    const result = sanitizeRecommendation(
      'In the morning increase the dose. If glucose stays high in the evening, increase the dose again.'
    );
    expect(result.isSafe).toBe(false);
    expect(result.sanitizedText).not.toMatch(/increase\s+(the\s+)?dose/i);
  });

  it('M002: sanitizes mixed RU/EN repeated violations', () => {
    const result = sanitizeRecommendation(
      'Увеличьте дозу утром. Вечером снова увеличьте дозу. Also inject 3 units now and inject 2 units later.'
    );
    expect(result.isSafe).toBe(false);
    expect(result.sanitizedText).not.toMatch(/увеличь/i);
    expect(result.sanitizedText).not.toMatch(/inject\s+\d/i);
  });
});

describe('checkEmergencyThresholds', () => {
  const now = new Date().toISOString();
  const oldDate = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(); // 48h ago

  it('detects hypoglycemia (< 2.8 mmol/L)', () => {
    const readings = [
      {
        id: '1',
        petId: 'p1',
        valueMmol: 2.5,
        valueMgdl: 45,
        recordedAt: now,
        mealRelation: 'before_meal' as const,
        createdAt: now,
        updatedAt: now,
      },
    ];
    const alerts = checkEmergencyThresholds(readings);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('hypoglycemia');
    expect(alerts[0].value).toBe(2.5);
  });

  it('detects severe hyperglycemia (> 30 mmol/L)', () => {
    const readings = [
      {
        id: '2',
        petId: 'p1',
        valueMmol: 33,
        valueMgdl: 594,
        recordedAt: now,
        mealRelation: 'before_meal' as const,
        createdAt: now,
        updatedAt: now,
      },
    ];
    const alerts = checkEmergencyThresholds(readings);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('severe_hyperglycemia');
  });

  it('ignores readings older than 24h', () => {
    const readings = [
      {
        id: '3',
        petId: 'p1',
        valueMmol: 2.0,
        valueMgdl: 36,
        recordedAt: oldDate,
        mealRelation: 'before_meal' as const,
        createdAt: oldDate,
        updatedAt: oldDate,
      },
    ];
    const alerts = checkEmergencyThresholds(readings);
    expect(alerts).toHaveLength(0);
  });

  it('returns empty for normal readings', () => {
    const readings = [
      {
        id: '4',
        petId: 'p1',
        valueMmol: 7.0,
        valueMgdl: 126,
        recordedAt: now,
        mealRelation: 'before_meal' as const,
        createdAt: now,
        updatedAt: now,
      },
    ];
    const alerts = checkEmergencyThresholds(readings);
    expect(alerts).toHaveLength(0);
  });
});

describe('getAnalyzerDisclaimer', () => {
  it('returns Russian disclaimer', () => {
    const text = getAnalyzerDisclaimer('ru');
    expect(text).toContain('ветеринарным врачом');
  });

  it('returns English disclaimer', () => {
    const text = getAnalyzerDisclaimer('en');
    expect(text).toContain('veterinarian');
  });
});
