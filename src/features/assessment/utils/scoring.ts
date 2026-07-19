// Чистая логика скоринга анкеты диабета — вынесена из AssessmentScreen для тестируемости.

export type AnswerValue = 0 | 1 | 2;
export type Stage = 'mild' | 'moderate' | 'severe';

/**
 * Клинические red-flag комбинации, которые НЕЛЬЗЯ топить в линейной сумме баллов.
 * Пример проблемы: ацетоновый запах (2) + рвота (2) = 4 балла → раньше давало "mild"
 * («всё под контролем»), хотя это классическая картина ДКА. См. dka.ts / dog-dka.ts.
 */
export function hasRedFlag(answers: Record<string, AnswerValue>): boolean {
  const ketones = answers.ketoneSmell ?? 0;
  const vomiting = answers.vomiting ?? 0;
  const appetite = answers.appetite ?? 0;
  const energy = answers.energy ?? 0;
  // Ацетоновый/сладковатый запах + рвота = ДКА до доказательства обратного.
  if (ketones >= 1 && vomiting >= 1) return true;
  // Полный отказ от еды + постоянная вялость — тоже неотложно (риск ДКА/декомпенсации).
  if (appetite === 2 && energy === 2) return true;
  return false;
}

export function getStage(score: number, answers: Record<string, AnswerValue>): Stage {
  if (hasRedFlag(answers)) return 'severe';
  if (score <= 5) return 'mild';
  if (score <= 11) return 'moderate';
  return 'severe';
}
