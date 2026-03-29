/**
 * Safety Guard — validates all analyzer output before presenting to user.
 * RULE: NEVER recommend a specific insulin dose. ALWAYS direct to vet.
 */
import { GlucoseReading } from '@storage/domain/types';
import { DetectedPattern } from './patternDetector';

const EMERGENCY_GLUCOSE_LOW = 2.8; // mmol/L — hypoglycemia emergency
const EMERGENCY_GLUCOSE_HIGH = 30; // mmol/L — severe hyperglycemia

/** Forbidden phrases that must never appear in user-facing text */
const FORBIDDEN_PATTERNS = [
  /увеличь(те)?\s+(дозу|инсулин)/i,
  /уменьши(те)?\s+(дозу|инсулин)/i,
  /increase\s+(the\s+)?dose/i,
  /decrease\s+(the\s+)?dose/i,
  /inject\s+\d+/i,
  /колите?\s+\d+/i,
  /рекоменд(ую|уем)\s+\d+\s*(ед|unit)/i,
  /recommend\s+\d+\s*unit/i,
];

export interface EmergencyAlert {
  type: 'hypoglycemia' | 'severe_hyperglycemia';
  value: number;
  readingId: string;
  recordedAt: string;
}

export interface SafetyCheckResult {
  /** Whether the text passed safety checks */
  isSafe: boolean;
  /** Sanitized text (with forbidden content removed) */
  sanitizedText: string;
  /** List of violations found */
  violations: string[];
}

/**
 * C17+C18: Validate and sanitize recommendation text.
 * Removes dose recommendations, adds vet disclaimers.
 */
export function sanitizeRecommendation(text: string): SafetyCheckResult {
  const violations: string[] = [];
  let sanitized = text;

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(sanitized)) {
      violations.push(`Forbidden phrase matched: ${pattern.source}`);
      sanitized = sanitized.replace(pattern, '(обсудите с ветеринаром / discuss with your vet)');
    }
  }

  return {
    isSafe: violations.length === 0,
    sanitizedText: sanitized,
    violations,
  };
}

/**
 * C19: Emergency threshold detection.
 * Returns alerts for dangerous glucose values.
 */
export function checkEmergencyThresholds(readings: GlucoseReading[]): EmergencyAlert[] {
  const alerts: EmergencyAlert[] = [];

  // Check only last 24 hours
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;

  for (const reading of readings) {
    if (new Date(reading.recordedAt).getTime() < cutoff) continue;

    if (reading.valueMmol < EMERGENCY_GLUCOSE_LOW) {
      alerts.push({
        type: 'hypoglycemia',
        value: reading.valueMmol,
        readingId: reading.id,
        recordedAt: reading.recordedAt,
      });
    }

    if (reading.valueMmol > EMERGENCY_GLUCOSE_HIGH) {
      alerts.push({
        type: 'severe_hyperglycemia',
        value: reading.valueMmol,
        readingId: reading.id,
        recordedAt: reading.recordedAt,
      });
    }
  }

  return alerts;
}

/**
 * C20: Generate disclaimer text for analyzer screens.
 */
export function getAnalyzerDisclaimer(lang: 'ru' | 'en'): string {
  if (lang === 'ru') {
    return 'Данные анализа носят информационный характер и не являются медицинской рекомендацией. ' +
      'Все решения об изменении лечения принимайте только совместно с ветеринарным врачом.';
  }
  return 'This analysis is for informational purposes only and does not constitute medical advice. ' +
    'All treatment decisions should be made in consultation with your veterinarian.';
}

/**
 * Validate pattern descriptions before displaying.
 */
export function sanitizePatterns(patterns: DetectedPattern[]): DetectedPattern[] {
  return patterns.map(p => {
    const checked = sanitizeRecommendation(p.description);
    return { ...p, description: checked.sanitizedText };
  });
}
