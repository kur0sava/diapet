import { parseTableRow, isTableSeparator } from '../articleMarkdown';

describe('parseTableRow', () => {
  it('разбирает строку с ведущим/замыкающим пайпом', () => {
    expect(parseTableRow('| Вес кошки | Мёд / сироп | Как |')).toEqual([
      'Вес кошки',
      'Мёд / сироп',
      'Как',
    ]);
  });

  it('обрезает пробелы в ячейках', () => {
    expect(parseTableRow('|  до 3 кг |0.25-0.5 ч.л.  | На дёсны|')).toEqual([
      'до 3 кг',
      '0.25-0.5 ч.л.',
      'На дёсны',
    ]);
  });

  it('работает без замыкающего пайпа', () => {
    expect(parseTableRow('| a | b')).toEqual(['a', 'b']);
  });
});

describe('isTableSeparator', () => {
  it('распознаёт разделитель |---|---|', () => {
    expect(isTableSeparator('|---------|--------|------------|')).toBe(true);
    expect(isTableSeparator('|:---|:---:|---:|')).toBe(true);
  });

  it('НЕ считает разделителем обычную строку данных', () => {
    expect(isTableSeparator('| до 3 кг | 0.25 ч.л. | На дёсны |')).toBe(false);
    expect(isTableSeparator('| Позиция | Россия |')).toBe(false);
  });

  it('НЕ считает разделителем строку без пайпов', () => {
    expect(isTableSeparator('----')).toBe(false);
  });
});
