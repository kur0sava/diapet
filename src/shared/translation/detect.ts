/**
 * Лёгкое определение языка сообщения (v2.6, для международного чата).
 * Эвристика по алфавиту — достаточно для RU/EN; расширяемо под другие языки
 * при появлении аудитории. Не тянет ML-библиотеку.
 */
export type ContentLang = 'ru' | 'en';

export function detectLang(text: string): ContentLang {
  const cyrillic = (text.match(/[Ѐ-ӿ]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  // При равенстве/пустоте — латиница (en) как нейтральный дефолт.
  return cyrillic > latin ? 'ru' : 'en';
}

/** Быстрый строковый хеш (djb2) для ключа кэша перевода — без async-crypto. */
export function hashText(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) {
    h = (h * 33) ^ text.charCodeAt(i);
  }
  // >>> 0 → беззнаковое; base36 компактно
  return (h >>> 0).toString(36);
}
