export interface Article {
  id: string;
  titleKey: string;
  summaryKey: string;
  contentKey: string;
  category: ArticleCategory;
  readingTimeMinutes: number;
  tags: string[];
  imageSource?: string;
}

export type ArticleCategory =
  | 'basics'
  | 'treatment'
  | 'nutrition'
  | 'complications'
  | 'remission'
  | 'tips';
