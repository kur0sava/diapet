import { getStage, hasRedFlag, type AnswerValue } from '../scoring';

const empty: Record<string, AnswerValue> = {};

describe('assessment scoring — red-flag override (C1)', () => {
  it('форсит severe при ацетоновом запахе + рвоте даже при низкой сумме', () => {
    // 2+2 = 4 балла → раньше "mild". Теперь ДКА-комбинация → severe.
    const answers: Record<string, AnswerValue> = { ketoneSmell: 2, vomiting: 2 };
    expect(getStage(4, answers)).toBe('severe');
    expect(hasRedFlag(answers)).toBe(true);
  });

  it('форсит severe даже при "иногда" (значение 1) обоих признаков ДКА', () => {
    const answers: Record<string, AnswerValue> = { ketoneSmell: 1, vomiting: 1 };
    expect(getStage(2, answers)).toBe('severe');
  });

  it('форсит severe при полном отказе от еды + постоянной вялости', () => {
    const answers: Record<string, AnswerValue> = { appetite: 2, energy: 2 };
    expect(getStage(4, answers)).toBe('severe');
  });

  it('НЕ форсит severe при одном лишь ацетоновом запахе без рвоты', () => {
    const answers: Record<string, AnswerValue> = { ketoneSmell: 2 };
    expect(hasRedFlag(answers)).toBe(false);
    expect(getStage(2, answers)).toBe('mild');
  });

  it('НЕ форсит severe при "иногда" аппетит/вялость (шум)', () => {
    const answers: Record<string, AnswerValue> = { appetite: 1, energy: 1 };
    expect(hasRedFlag(answers)).toBe(false);
  });
});

describe('assessment scoring — линейные пороги', () => {
  it('mild при сумме ≤ 5', () => {
    expect(getStage(0, empty)).toBe('mild');
    expect(getStage(5, empty)).toBe('mild');
  });
  it('moderate при 6..11', () => {
    expect(getStage(6, empty)).toBe('moderate');
    expect(getStage(11, empty)).toBe('moderate');
  });
  it('severe при ≥ 12', () => {
    expect(getStage(12, empty)).toBe('severe');
  });
});
