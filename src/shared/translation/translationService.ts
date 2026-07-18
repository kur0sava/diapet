/**
 * Сервис перевода сообщений международного чата в язык пользователя (v2.6).
 *
 * Едет на уже существующем AI-прокси (Supabase Edge Function, тот же, что и
 * AI-ассистент/модерация). Пока прокси НЕ задеплоен — `isTranslationAvailable()`
 * = false, и UI показывает «перевод недоступен» (как AI-таб скрыт до деплоя).
 *
 * ВАЖНО (требование продукта): перевод «только где уместно». Названия
 * лекарств/инсулинов, числовые дозы и единицы (units/ед/IU/мл/ml/mmol/mg) НЕ
 * переводятся и не искажаются — при выборе лекарств/доз перевод не нужен и
 * опасен. Это зашито в system-prompt переводчика.
 *
 * Кэш: MMKV по (targetLang, hash) — переводим каждое сообщение максимум раз.
 */
import { storage, translationCacheKey } from '@storage/mmkv/storage';
import {
  getAiProxyUrl,
  getSupabaseAnonKey,
  isAiProxyConfigured,
} from '@shared/config/runtimeConfig';
import { detectLang, hashText, type ContentLang } from './detect';

const LANG_NAME: Record<ContentLang, string> = { ru: 'Russian', en: 'English' };

const TRANSLATE_SYSTEM_PROMPT = (target: ContentLang) =>
  `You are a translator for an international pet-diabetes community chat. ` +
  `Translate the user's message into ${LANG_NAME[target]}. ` +
  `Preserve EXACTLY, without translating, transliterating or altering: ` +
  `medication and insulin brand names (e.g. Lantus, Levemir, Caninsulin, ProZinc, Vetsulin, Humulin), ` +
  `all numeric values, dosage units (units, IU, ед, ЕД, ml, мл), and glucose values with units (mmol/L, mg/dL, ммоль/л, мг/дл). ` +
  `Keep the original tone and meaning. Do NOT add notes, disclaimers or explanations. ` +
  `Output ONLY the translated text.`;

export function isTranslationAvailable(): boolean {
  return isAiProxyConfigured();
}

/** Нужен ли перевод: контент на другом языке, чем UI пользователя. */
export function needsTranslation(text: string, userLang: ContentLang): boolean {
  return detectLang(text) !== userLang;
}

// Audit L1: кэш переводов не должен расти вечно (MMKV грузится в память на
// старте). Держим индекс ключей и подрезаем по FIFO при переполнении.
const CACHE_INDEX_KEY = 'xlt_index';
const CACHE_MAX = 500;

function readCache(targetLang: ContentLang, hash: string): string | undefined {
  return storage.getString(translationCacheKey(targetLang, hash));
}

function writeCache(targetLang: ContentLang, hash: string, value: string): void {
  const key = translationCacheKey(targetLang, hash);
  storage.set(key, value);
  try {
    const raw = storage.getString(CACHE_INDEX_KEY);
    const index: string[] = raw ? JSON.parse(raw) : [];
    if (!index.includes(key)) index.push(key);
    while (index.length > CACHE_MAX) {
      const evicted = index.shift();
      if (evicted) storage.delete(evicted);
    }
    storage.set(CACHE_INDEX_KEY, JSON.stringify(index));
  } catch {
    // индекс — best-effort; сам перевод уже записан
  }
}

export interface TranslateResult {
  text: string;
  fromCache: boolean;
}

/**
 * Перевести текст в целевой язык. Кэш → сеть. Бросает при отсутствии прокси
 * или сетевой ошибке — caller показывает «перевод недоступен».
 */
export async function translateText(
  text: string,
  targetLang: ContentLang
): Promise<TranslateResult> {
  // Audit L2: 32-битный djb2 может коллизировать — при совпадении хеша юзер
  // увидел бы ЧУЖОЙ перевод (в мед-чате скверно). Добавляем длину оригинала в
  // ключ, резко снижая шанс коллизии практически без затрат.
  const hash = `${hashText(text)}${text.length.toString(36)}`;
  const cached = readCache(targetLang, hash);
  if (cached !== undefined) return { text: cached, fromCache: true };

  const proxyUrl = getAiProxyUrl();
  if (!proxyUrl) throw new Error('translation_unavailable');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const anonKey = getSupabaseAnonKey();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (anonKey) {
      headers['Authorization'] = `Bearer ${anonKey}`;
      headers['apikey'] = anonKey;
    }
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        systemPrompt: TRANSLATE_SYSTEM_PROMPT(targetLang),
        messages: [{ role: 'user', content: text }],
        options: { maxTokens: 1200, timeoutMs: 30_000, model: 'claude-haiku-4-5-20251001' },
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`translate_error_${response.status}`);
    const data = (await response.json()) as { text?: string };
    const translated = (data.text ?? '').trim();
    if (translated) writeCache(targetLang, hash, translated);
    return { text: translated, fromCache: false };
  } finally {
    clearTimeout(timeout);
  }
}
