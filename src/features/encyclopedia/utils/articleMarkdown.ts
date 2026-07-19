// Чистые хелперы разбора markdown-таблиц для рендерера статей энциклопедии.
// Вынесены из ArticleDetailScreen для тестируемости без RN-зависимостей.

/**
 * Разбор строки markdown-таблицы "| a | b |" → ['a','b'].
 * Крайние пустые ячейки от ведущего/замыкающего "|" отбрасываются.
 */
export const parseTableRow = (line: string): string[] => {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map(c => c.trim());
};

/**
 * Строка-разделитель таблицы: "|---|---|"
 * (только дефисы/двоеточия/пробелы/пайпы + хотя бы один "-").
 */
export const isTableSeparator = (line: string): boolean => {
  const s = line.trim();
  return s.includes('|') && s.includes('-') && /^\|?[\s:|-]+\|?$/.test(s);
};
