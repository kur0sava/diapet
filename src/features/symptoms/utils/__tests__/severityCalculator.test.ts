import { calculateSeverity } from '../severityCalculator';

describe('symptom severity — DKA red-flag override (MC012)', () => {
  it('форсит severe при рвоте + отказе от еды, даже если сумма баллов < 6', () => {
    // vomiting(3) + lossOfAppetite(2) = 5 → раньше "moderate".
    // dka.ts прямо называет эту комбинацию поводом ехать в клинику немедленно.
    const result = calculateSeverity(['vomiting', 'lossOfAppetite']);
    expect(result.score).toBe(5);
    expect(result.severity).toBe('severe');
  });

  it('форсит severe при рвоте + вялости, даже если сумма баллов < 6', () => {
    // vomiting(3) + lethargy(2) = 5 → раньше "moderate".
    const result = calculateSeverity(['vomiting', 'lethargy']);
    expect(result.score).toBe(5);
    expect(result.severity).toBe('severe');
  });

  it('НЕ форсит severe при рвоте без сопутствующих красных флагов', () => {
    const result = calculateSeverity(['vomiting']);
    expect(result.severity).toBe('moderate');
  });

  it('НЕ форсит severe при отказе от еды и вялости без рвоты', () => {
    const result = calculateSeverity(['lossOfAppetite', 'lethargy']);
    expect(result.severity).toBe('moderate');
  });

  it('линейный порог severe (сумма >= 6) продолжает работать без красного флага', () => {
    // vomiting(3) + ataxia(3) = 6 — достигает порога и без red-flag комбинации
    const result = calculateSeverity(['vomiting', 'ataxia']);
    expect(result.score).toBe(6);
    expect(result.severity).toBe('severe');
  });

  it('mild при отсутствии значимых симптомов', () => {
    const result = calculateSeverity(['other']);
    expect(result.severity).toBe('mild');
  });
});
