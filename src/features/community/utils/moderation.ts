/**
 * Клиентская эвристика-модерация (v2.6) — ПЕРВЫЙ дешёвый слой перед отправкой.
 * Не заменяет серверный AI-модератор (деплоится отдельно, работает по флагам/
 * очереди), а отсекает очевидное локально и мгновенно, без сетевого вызова.
 *
 * Возвращает verdict: 'ok' | 'warn' | 'block'.
 *  - block: очевидный абьюз/спам — не даём отправить.
 *  - warn: подозрительное (совет по дозам, ссылка, контакты) — отправляем,
 *    но помечаем flagged для серверной проверки и показываем мягкое
 *    предупреждение автору.
 *  - ok: чисто.
 *
 * Причины — i18n-ключи community.moderation.reasons.<reason>.
 */
import type { RoomDef } from '../types';

export type ModerationLevel = 'ok' | 'warn' | 'block';

export interface ModerationResult {
  level: ModerationLevel;
  /** i18n-ключи причин (для UI). */
  reasons: string[];
}

// Базовый словарь оскорблений RU+EN (умышленно короткий — тонкую работу
// делает серверный AI). Матчим по границам слова, регистронезависимо.
const ABUSE_WORDS = [
  'идиот',
  'дебил',
  'тупой',
  'сдохни',
  'ненавижу тебя',
  'заткнись',
  'idiot',
  'stupid',
  'moron',
  'kill yourself',
  'shut up',
];

const LINK_RE = /(https?:\/\/|www\.)|\b[a-z0-9-]+\.(com|ru|net|org|io|рф)\b/i;
// Телефоны: 7+ цифр подряд (с разделителями) — попытка увести контакт наружу.
const PHONE_RE = /(?:\+?\d[\s()-]?){7,}/;
// Дозы — главная мед-угроза домена, но НЕ всякое упоминание дозы опасно.
// Развели (logic+UX аудит): ИМПЕРАТИВНЫЙ совет («колите 5», «give 3») — это
// опасная инструкция «сделай так» → block в комнатах high/max. ОПИСАТЕЛЬНОЕ
// упоминание («врач назначил 2 ед», «5 единиц») — обмен опытом → только warn,
// иначе комната «Инсулин» блокировала бы ровно ту тему, ради которой создана.
// Unicode-флаг + \p{L}-границы: обычный \b не работает вокруг кириллицы.
const IMPERATIVE_DOSE_RE =
  /(?<![\p{L}])(колот[иь]|коли|уколи[а-яё]*|вколи[а-яё]*|inject|give)\s+\d+/iu;
const DESCRIPTIVE_DOSE_RE = /\d+([.,]\d+)?\s*(единиц[а-яё]*|ед|units?|iu|мл|ml)(?![\p{L}])/iu;
// Флуд: один символ ≥6 раз подряд ИЛИ строка почти вся в верхнем регистре.
const FLOOD_RE = /(.)\1{5,}/;

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isMostlyUppercase(text: string): boolean {
  const letters = text.replace(/[^\p{L}]/gu, '');
  if (letters.length < 12) return false;
  const upper = letters.replace(/[^\p{Lu}]/gu, '').length;
  return upper / letters.length > 0.7;
}

/**
 * Прогнать текст сообщения через эвристики. `room` влияет на строгость:
 * совет по дозам в комнатах high/max — warn; в low/medium — тоже warn, но
 * это единственное отличие мы держим явным для будущей тонкой настройки.
 */
export function moderateText(text: string, room?: RoomDef): ModerationResult {
  const reasons: string[] = [];
  let level: ModerationLevel = 'ok';

  const escalate = (next: ModerationLevel) => {
    const rank = { ok: 0, warn: 1, block: 2 } as const;
    if (rank[next] > rank[level]) level = next;
  };

  for (const w of ABUSE_WORDS) {
    // \p{L}-границы: подстрочный includes ловил ложные срабатывания внутри
    // слов; матчим слово целиком (учёт кириллицы через unicode-класс).
    const re = new RegExp(`(?<![\\p{L}])${escapeRe(w)}(?![\\p{L}])`, 'iu');
    if (re.test(text)) {
      reasons.push('abuse');
      escalate('block');
      break;
    }
  }

  if (LINK_RE.test(text)) {
    reasons.push('link');
    escalate('warn');
  }
  if (PHONE_RE.test(text)) {
    reasons.push('contact');
    escalate('warn');
  }
  const highOrMax = room?.moderation === 'high' || room?.moderation === 'max';
  if (IMPERATIVE_DOSE_RE.test(text)) {
    // Императивный совет по дозе — опасная инструкция. Блок в комнатах, где
    // сидят паникующие новички и обсуждается инсулин (high/max); в офтоп-
    // комнатах — warn.
    reasons.push('dose_advice');
    escalate(highOrMax ? 'block' : 'warn');
  } else if (DESCRIPTIVE_DOSE_RE.test(text)) {
    // Описательное упоминание дозы — обмен опытом, видно как flagged, не блок.
    reasons.push('dose_advice');
    escalate('warn');
  }
  if (FLOOD_RE.test(text) || isMostlyUppercase(text)) {
    reasons.push('flood');
    escalate('warn');
  }

  return { level, reasons: [...new Set(reasons)] };
}

/** Пустой/слишком короткий/слишком длинный ввод. */
export function validateMessageText(text: string): 'empty' | 'too_long' | 'ok' {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 'empty';
  if (trimmed.length > 4000) return 'too_long';
  return 'ok';
}
