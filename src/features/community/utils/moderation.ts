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
// Совет по дозам — главная мед-угроза домена. «5 единиц», «10 ед», «2 units»,
// «уколи 3», «N мл/ml». Ловим число рядом с дозовым словом. Unicode-флаг +
// \p{L}-границы: обычный \b не работает вокруг кириллицы (ц/л — не \w), из-за
// чего «5 единиц» раньше не ловилось.
const DOSE_RE =
  /\d+([.,]\d+)?\s*(единиц[а-яё]*|ед|units?|iu|мл|ml)(?![\p{L}])|(?<![\p{L}])(колот[иь]|уколи[а-яё]*|вколи[а-яё]*|inject|give)\s+\d+/iu;
// Флуд: один символ ≥6 раз подряд ИЛИ строка почти вся в верхнем регистре.
const FLOOD_RE = /(.)\1{5,}/;

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
  const lower = text.toLowerCase();

  const escalate = (next: ModerationLevel) => {
    const rank = { ok: 0, warn: 1, block: 2 } as const;
    if (rank[next] > rank[level]) level = next;
  };

  for (const w of ABUSE_WORDS) {
    if (lower.includes(w)) {
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
  if (DOSE_RE.test(text)) {
    // Audit M3: в max-модерации комнатах (инсулин/осложнения) конкретный
    // дозовый совет — главная мед-угроза, и серверного AI-модератора пока нет.
    // Здесь блокируем на клиенте (не даём отправить число дозы); в остальных
    // комнатах — warn (сообщение помечается flagged для серверной проверки).
    reasons.push('dose_advice');
    escalate(room?.moderation === 'max' ? 'block' : 'warn');
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
