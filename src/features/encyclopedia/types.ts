import type { Region, FoodType } from './data/diabeticFoods';

export interface BilingualText {
  ru: string;
  en: string;
}

export interface Article {
  id: string;
  titleKey: BilingualText;
  summaryKey: BilingualText;
  contentKey: BilingualText;
  category: ArticleCategory;
  readingTimeMinutes: number;
  tags: BilingualText[];
  imageSource?: string;
}

export type ArticleCategory =
  | 'basics'
  | 'treatment'
  | 'nutrition'
  | 'complications'
  | 'remission'
  | 'tips';

// ── Feed Guide types ──

export type StoreType = 'online' | 'retail' | 'vet_pharmacy' | 'marketplace';

export interface StoreEntry {
  id: string;
  name: string;
  nameRu?: string;
  url?: string;
  type: StoreType;
}

export interface RegionStoreInfo {
  region: Region;
  stores: StoreEntry[];
}

export type AlternativeFoodVerdict = 'recommended' | 'acceptable' | 'conditional';

export interface AlternativeFood {
  id: string;
  brand: string;
  product: string;
  nameRu?: string;
  type: FoodType;
  proteinDM?: number;
  fatDM?: number;
  carbsDM?: number;
  fiberDM?: number;
  verdict: AlternativeFoodVerdict;
  verdictNotes: { ru: string; en: string };
  regions: Region[];
  source?: string;
  prescriptionRequired: boolean;
}

export type NaturalFoodCategory = 'meat' | 'organ' | 'fish' | 'egg' | 'supplement';
export type NaturalFoodSuitability = 'excellent' | 'good' | 'moderate' | 'limited';
export type NaturalFoodFrequency = 'daily_base' | 'daily_addition' | 'few_times_week' | 'occasional';

export interface NaturalFood {
  id: string;
  name: { ru: string; en: string };
  category: NaturalFoodCategory;
  proteinPer100g: number;
  fatPer100g: number;
  carbsPer100g: number;
  kcalPer100g: number;
  suitability: NaturalFoodSuitability;
  preparationTips: { ru: string; en: string };
  warnings?: { ru: string; en: string };
  frequency: NaturalFoodFrequency;
  notes: { ru: string; en: string };
}

export interface NaturalFeedingGuide {
  disclaimer: { ru: string; en: string };
  dailyPortionGuide: { ru: string; en: string };
  portionBreakdown: { ru: string; en: string };
  supplements: Array<{ name: { ru: string; en: string }; desc: { ru: string; en: string } }>;
  transitionTips: { ru: string; en: string };
  sampleMenu: {
    morning: { ru: string; en: string };
    evening: { ru: string; en: string };
  };
  foods: NaturalFood[];
}
