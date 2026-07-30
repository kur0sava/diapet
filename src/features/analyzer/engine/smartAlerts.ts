/**
 * Smart Alerts — contextual notifications based on analyzer data.
 * Throttled: max 1 alert/day, no repeat of same type for 7 days.
 */
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { GlucoseReading, mmolToMgdl } from '@storage/domain/types';
import { todayLocal, toDateOnly } from '@shared/utils/dateUtils';
import type { SpeciesConfig } from '@shared/config/speciesConfig';
import { TrendResult } from './trendEngine';
import { RiskScoreResult } from './riskScoreCalculator';
import { DetectedPattern } from './patternDetector';

const ALERT_COOLDOWN_DAYS = 7;
const MAX_ALERTS_PER_DAY = 1;
const STORAGE_KEY = 'analyzer_alert_history';

export type AlertType =
  | 'glucose_low_streak'
  | 'food_insight'
  | 'no_readings'
  | 'remission_possible'
  | 'risk_increased'
  | 'glucose_improving';

export interface SmartAlert {
  type: AlertType;
  titleRu: string;
  titleEn: string;
  bodyRu: string;
  bodyEn: string;
  priority: 'low' | 'medium' | 'high';
}

interface AlertHistory {
  [alertType: string]: string; // ISO date of last trigger
}

interface AlertsShownToday {
  date: string;
  count: number;
}

function getAlertHistory(): AlertHistory {
  try {
    const raw = storage.getString(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAlertHistory(history: AlertHistory): void {
  storage.set(STORAGE_KEY, JSON.stringify(history));
}

function getTodayCount(): AlertsShownToday {
  try {
    const raw = storage.getString('analyzer_alerts_today');
    if (raw) {
      const parsed = JSON.parse(raw) as AlertsShownToday;
      if (parsed.date === todayLocal()) return parsed;
    }
  } catch {
    /* corrupt storage — reset */
  }
  return { date: todayLocal(), count: 0 };
}

function incrementTodayCount(): void {
  const today = getTodayCount();
  storage.set(
    'analyzer_alerts_today',
    JSON.stringify({
      date: todayLocal(),
      count: today.count + 1,
    })
  );
}

function firedToday(type: AlertType): boolean {
  const lastFired = getAlertHistory()[type];
  return !!lastFired && toDateOnly(new Date(lastFired)) === todayLocal();
}

/**
 * C22: Check if an alert type can fire (throttling).
 */
function canFireAlert(type: AlertType, now: Date): boolean {
  // An alert that already fired today keeps showing for the rest of the day.
  // Without this, the next recompute (screen refocus updates `now`) hit the
  // daily cap and the card vanished before the user could read it.
  if (firedToday(type)) return true;

  // Max 1 per day
  if (getTodayCount().count >= MAX_ALERTS_PER_DAY) return false;

  // Same type cooldown
  const history = getAlertHistory();
  const lastFired = history[type];
  if (lastFired) {
    const daysSince = (now.getTime() - new Date(lastFired).getTime()) / (24 * 60 * 60 * 1000);
    if (daysSince < ALERT_COOLDOWN_DAYS) return false;
  }

  return true;
}

function markFired(type: AlertType, now: Date): void {
  // Idempotent per day: useAnalyzer runs in two screens (Dashboard and
  // AnalyzerDashboard), each firing markAlertFired for the same alert —
  // without this guard one alert consumed the daily quota twice and reset
  // its cooldown on every recompute.
  if (firedToday(type)) return;
  const history = getAlertHistory();
  // D3 (audit): stamp with the injected `now` (not wall-clock) so the cooldown
  // is time-consistent with canFireAlert and testable.
  history[type] = now.toISOString();
  saveAlertHistory(history);
  incrementTodayCount();
}

/**
 * Render a mmol/L threshold in the unit the user actually reads.
 *
 * Thresholds live in mmol/L internally, but the alert text used to print
 * "below 4.4 mmol/L" even for a mg/dL user (the US region default) — every
 * other number on their screen is mg/dL, so the threshold read like a data
 * error and could be misjudged against their own readings.
 */
function formatThreshold(valueMmol: number, lang: 'ru' | 'en'): string {
  const isMgdl = storage.getString(StorageKeys.GLUCOSE_UNIT) === 'mg/dL';
  if (isMgdl) {
    return `${mmolToMgdl(valueMmol)} ${lang === 'ru' ? 'мг/дл' : 'mg/dL'}`;
  }
  return `${valueMmol} ${lang === 'ru' ? 'ммоль/л' : 'mmol/L'}`;
}

/**
 * C21: Generate contextual alerts based on analyzer results.
 */
export function generateSmartAlerts(
  trends: TrendResult,
  riskScore: RiskScoreResult,
  patterns: DetectedPattern[],
  readings: GlucoseReading[],
  now = new Date(),
  config?: SpeciesConfig
): SmartAlert | null {
  // Priority-ordered alert candidates
  const candidates: SmartAlert[] = [];

  // Species-aware low-streak threshold: trips just below the lower target,
  // not arbitrarily 6 mmol/L. Cat target 4-9 → trips at <4.0; dog target
  // 4.4-8 → trips at <4.4. Hardcoded 6 produced false-positive "dose too
  // high" alerts at well-controlled dog values (avg ~5 mmol/L).
  const lowStreakThreshold = config?.glucose.targetLow ?? 4.0;
  if (
    trends.movingAverage3d !== null &&
    trends.movingAverage3d < lowStreakThreshold &&
    trends.totalReadings >= 5
  ) {
    candidates.push({
      type: 'glucose_low_streak',
      titleRu: 'Низкий уровень глюкозы',
      titleEn: 'Low glucose level',
      bodyRu: `Средняя глюкоза за 3 дня ниже ${formatThreshold(lowStreakThreshold, 'ru')} — возможно, доза высока. Обсудите с ветеринаром.`,
      bodyEn: `3-day glucose average below ${formatThreshold(lowStreakThreshold, 'en')} — dose may be too high. Discuss with your vet.`,
      priority: 'high',
    });
  }

  // Remission possible
  if (patterns.some(p => p.type === 'remission_candidate')) {
    candidates.push({
      type: 'remission_possible',
      titleRu: 'Возможная ремиссия!',
      titleEn: 'Possible remission!',
      bodyRu: '14 дней стабильного сахара — обсудите с ветеринаром возможность снижения дозы.',
      bodyEn: '14 days of stable glucose — discuss possible dose reduction with your vet.',
      priority: 'high',
    });
  }

  // Risk increased
  if (riskScore.level === 'danger') {
    candidates.push({
      type: 'risk_increased',
      titleRu: 'Повышенный риск',
      titleEn: 'Elevated risk',
      bodyRu: 'Показатели ухудшились. Рекомендуем показать питомца ветеринару.',
      bodyEn: 'Health indicators have worsened. We recommend visiting your vet.',
      priority: 'high',
    });
  }

  // Food insight
  const foodPattern = patterns.find(p => p.type === 'food_correlation');
  if (foodPattern) {
    candidates.push({
      type: 'food_insight',
      titleRu: 'Подсказка по питанию',
      titleEn: 'Feeding insight',
      bodyRu: `Обнаружена разница в контроле глюкозы между кормами. Посмотрите раздел аналитики.`,
      bodyEn: `Different foods show different glucose control. Check the analytics section.`,
      priority: 'medium',
    });
  }

  // No readings for 5+ days
  if (readings.length > 0) {
    // C11 (audit): don't assume the array is sorted ASC (positional access to
    // "the last reading"). Compute the true latest timestamp so a DESC-ordered
    // caller can't mis-fire (or suppress) this alert.
    const latestTs = readings.reduce((max, r) => Math.max(max, Date.parse(r.recordedAt)), 0);
    const daysSince = (now.getTime() - latestTs) / (24 * 60 * 60 * 1000);
    if (daysSince >= 5) {
      candidates.push({
        type: 'no_readings',
        titleRu: 'Нет замеров',
        titleEn: 'No recent readings',
        bodyRu: `Нет замеров ${Math.round(daysSince)} дней. Утренний замер поможет отследить тренд.`,
        bodyEn: `No readings for ${Math.round(daysSince)} days. A morning reading helps track trends.`,
        priority: 'medium',
      });
    }
  }

  // Glucose improving.
  // SAFETY: "improving" in trendEngine just means the average is falling. If the
  // 7-day average is already at/below the lower target, a further drop is sliding
  // toward hypoglycemia, not good control — never surface "keep up the good work"
  // there (the high-priority low_streak alert may be suppressed by throttling).
  // The 7-day average lags; also gate on the faster 3-day average so a recent
  // slide below target isn't praised while the 7-day figure is still catching up.
  const improvingFloor = config?.glucose.targetLow ?? 4.0;
  if (
    trends.direction === 'improving' &&
    trends.movingAverage7d !== null &&
    trends.movingAverage7d >= improvingFloor &&
    !(trends.movingAverage3d !== null && trends.movingAverage3d < improvingFloor)
  ) {
    candidates.push({
      type: 'glucose_improving',
      titleRu: 'Глюкоза улучшается',
      titleEn: 'Glucose improving',
      bodyRu: 'Средний уровень глюкозы снижается. Продолжайте в том же режиме!',
      bodyEn: 'Average glucose is decreasing. Keep up the good work!',
      priority: 'low',
    });
  }

  // Find first candidate that passes throttling (pure — no side-effects)
  for (const alert of candidates) {
    if (canFireAlert(alert.type, now)) {
      return alert;
    }
  }

  return null;
}

/**
 * Mark an alert as fired. Call this from useEffect, NOT from render/useMemo.
 */
export function markAlertFired(type: AlertType, now: Date = new Date()): void {
  markFired(type, now);
}
