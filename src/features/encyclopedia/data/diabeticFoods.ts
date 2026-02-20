/**
 * Database of cat foods suitable for diabetic cats.
 * Organized by region availability and food type.
 *
 * Nutritional targets for diabetic cats:
 * - Carbs: < 12% dry matter basis (ideal < 7%)
 * - Protein: > 40% dry matter basis
 * - Fat: 15-25%
 * - Wet food preferred (higher moisture, lower carbs)
 *
 * Formula to calculate carbs from label:
 *   Carbs% = 100 - protein% - fat% - fiber% - ash% - moisture%
 *
 * Sources: Royal Canin Vet Academy, Farmina, Purina, catinfo.org,
 *          simplycatcare.com, walkervillevet.com.au, felinediabetes.com
 */

// ────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────

export type FoodType = 'dry' | 'wet' | 'both';
export type FoodCategory = 'prescription' | 'veterinary' | 'otc_low_carb';
export type Region =
  | 'RU'    // Россия
  | 'EU'    // Европа (ЕС)
  | 'UK'    // Великобритания
  | 'US'    // США
  | 'DE'    // Германия
  | 'JP'    // Япония
  | 'KR'    // Корея
  | 'BR'    // Бразилия
  | 'GLOBAL'; // Глобально

export interface DiabeticCatFood {
  id: string;
  brand: string;
  product: string;
  type: FoodType;
  category: FoodCategory;
  /** Protein % on dry matter basis */
  proteinDM?: number;
  /** Fat % on dry matter basis */
  fatDM?: number;
  /** Carbs % on dry matter basis */
  carbsDM?: number;
  /** Fiber % on dry matter basis */
  fiberDM?: number;
  /** Calories per kg */
  kcalPerKg?: number;
  /** Regions where available */
  regions: Region[];
  /** Where to buy (store names or URLs) */
  whereToBuy?: Record<Region, string[]>;
  /** Price range in local currency */
  priceHint?: string;
  /** Veterinary prescription required */
  prescriptionRequired: boolean;
  /** Key features / notes */
  notes?: string;
  /** Localized names */
  nameRu?: string;
}

// ────────────────────────────────────────────────────
// Nutritional guidelines
// ────────────────────────────────────────────────────

export const DIABETIC_NUTRITION_GUIDELINES = {
  carbsMaxPercent: 12,
  carbsIdealPercent: 7,
  proteinMinPercent: 40,
  fatRangePercent: { min: 15, max: 25 },
  sugarMaxPercent: 1,
  remissionChanceLowCarb: 68, // % cats achieving remission on low-carb diet
  remissionChanceMedCarb: 41, // % on medium-carb diet
  feedingTips: {
    ru: [
      'Влажный корм предпочтительнее сухого (меньше углеводов, больше влаги)',
      'Кормить 2-4 раза в день строго по расписанию',
      'Инъекция инсулина сразу после еды или во время',
      'Не менять корм резко — переход за 7-10 дней',
      'Контролировать вес: ожирение ухудшает диабет',
      'Избегать корма с зерновыми, кукурузой, картофелем',
      'Не давать молоко, сладости, человеческую еду',
    ],
    en: [
      'Wet food is preferred over dry (lower carbs, more moisture)',
      'Feed 2-4 times daily on strict schedule',
      'Give insulin injection right after or during meal',
      'Transition gradually over 7-10 days when changing food',
      'Monitor weight: obesity worsens diabetes',
      'Avoid foods with grains, corn, potato',
      'No milk, treats with sugar, or human food',
    ],
  },
};

// ────────────────────────────────────────────────────
// Prescription / Veterinary diets
// ────────────────────────────────────────────────────

export const PRESCRIPTION_FOODS: DiabeticCatFood[] = [
  // ── Royal Canin ──
  {
    id: 'rc-diabetic-dry',
    brand: 'Royal Canin',
    product: 'Diabetic DS46 (Dry)',
    nameRu: 'Роял Канин Диабетик сухой',
    type: 'dry',
    category: 'prescription',
    proteinDM: 48,
    fatDM: 15,
    carbsDM: 20,
    fiberDM: 11,
    regions: ['RU', 'EU', 'UK', 'US', 'GLOBAL'],
    whereToBuy: {
      RU: ['royalcanin.ru', '4lapy.ru', 'ZooZavr', 'ZooMag', 'Ozon'],
      EU: ['zooplus.de', 'vet clinics'],
      UK: ['royalcanin.com/uk', 'Pets at Home', 'vet clinics'],
      US: ['chewy.com', 'petco.com', 'vet clinics'],
      GLOBAL: [],
      DE: [],
      JP: [],
      KR: [],
      BR: [],
    },
    priceHint: 'RU: 800-1200₽/400г, 2500-3500₽/1.5кг',
    prescriptionRequired: true,
    notes: 'Самый распространённый ветеринарный корм для диабетических кошек. Низкий гликемический индекс. Доступен повсеместно в РФ.',
  },
  {
    id: 'rc-diabetic-wet',
    brand: 'Royal Canin',
    product: 'Diabetic (Wet pouches)',
    nameRu: 'Роял Канин Диабетик влажный',
    type: 'wet',
    category: 'prescription',
    proteinDM: 40,
    fatDM: 26,
    carbsDM: 14,
    regions: ['RU', 'EU', 'UK', 'US', 'GLOBAL'],
    whereToBuy: {
      RU: ['royalcanin.ru', '4lapy.ru', 'ZooZavr'],
      EU: ['zooplus.de'],
      UK: ['royalcanin.com/uk'],
      US: ['chewy.com'],
      GLOBAL: [],
      DE: [],
      JP: [],
      KR: [],
      BR: [],
    },
    priceHint: 'RU: 120-180₽/пауч 85г',
    prescriptionRequired: true,
    notes: 'Влажные пакетики. Удобно дозировать.',
  },

  // ── Hill\'s ──
  {
    id: 'hills-md-dry',
    brand: "Hill's",
    product: 'Prescription Diet m/d GlucoSupport (Dry)',
    nameRu: "Хиллс m/d сухой",
    type: 'dry',
    category: 'prescription',
    proteinDM: 51,
    fatDM: 23,
    carbsDM: 15,
    regions: ['RU', 'EU', 'UK', 'US', 'GLOBAL'],
    whereToBuy: {
      RU: ['4lapy.ru', 'ZooMag', 'vet clinics'],
      EU: ['zooplus.de', 'vet clinics'],
      UK: ['petsathome.com', 'viovet.co.uk'],
      US: ['chewy.com', 'petco.com', 'petsmart.com'],
      GLOBAL: [],
      DE: [],
      JP: [],
      KR: [],
      BR: [],
    },
    priceHint: 'RU: 1500-2500₽/1.5кг',
    prescriptionRequired: true,
    notes: 'Высокобелковый, низкоуглеводный. Один из лучших по составу для диабета. Наличие в РФ может варьироваться.',
  },
  {
    id: 'hills-wd-dry',
    brand: "Hill's",
    product: 'Prescription Diet w/d Multi-Benefit (Dry)',
    nameRu: "Хиллс w/d сухой",
    type: 'dry',
    category: 'prescription',
    proteinDM: 38,
    fatDM: 10,
    carbsDM: 34,
    fiberDM: 8,
    regions: ['RU', 'EU', 'UK', 'US', 'GLOBAL'],
    whereToBuy: {
      RU: ['4lapy.ru', 'ZooMag'],
      EU: ['zooplus.de'],
      UK: ['petsathome.com'],
      US: ['chewy.com'],
      GLOBAL: [],
      DE: [],
      JP: [],
      KR: [],
      BR: [],
    },
    prescriptionRequired: true,
    notes: 'Менее подходит для диабета чем m/d — углеводы выше. Чаще назначают при ожирении + диабет.',
  },

  // ── Purina ──
  {
    id: 'purina-dm-dry',
    brand: 'Purina Pro Plan',
    product: 'Veterinary Diets DM Dietetic Management (Dry)',
    nameRu: 'Пурина DM сухой',
    type: 'dry',
    category: 'prescription',
    proteinDM: 55,
    fatDM: 18,
    carbsDM: 12,
    regions: ['RU', 'EU', 'UK', 'US', 'GLOBAL'],
    whereToBuy: {
      RU: ['shop.purina.ru', '4lapy.ru', 'ZooMag', 'markvet.ru'],
      EU: ['zooplus.de'],
      UK: ['purina.co.uk', 'vet clinics'],
      US: ['chewy.com', 'proplanvetdirect.com'],
      GLOBAL: [],
      DE: [],
      JP: [],
      KR: [],
      BR: [],
    },
    priceHint: 'RU: 1200-2000₽/1.5кг',
    prescriptionRequired: true,
    notes: 'Один из самых низкоуглеводных сухих кормов (12% DM). Очень высокий белок (55%).',
  },
  {
    id: 'purina-dm-wet',
    brand: 'Purina Pro Plan',
    product: 'Veterinary Diets DM ST/OX (Wet)',
    nameRu: 'Пурина DM влажный',
    type: 'wet',
    category: 'prescription',
    proteinDM: 52,
    fatDM: 30,
    carbsDM: 6,
    regions: ['RU', 'EU', 'UK', 'US', 'GLOBAL'],
    whereToBuy: {
      RU: ['shop.purina.ru', '4lapy.ru', 'markvet.ru'],
      EU: ['zooplus.de'],
      UK: ['purina.co.uk'],
      US: ['chewy.com'],
      GLOBAL: [],
      DE: [],
      JP: [],
      KR: [],
      BR: [],
    },
    priceHint: 'RU: 130-200₽/пауч 85г, 250-350₽/банка 195г',
    prescriptionRequired: true,
    notes: 'Всего 6% углеводов! Лучший показатель среди рецептурных влажных кормов. Доступен в паучах и банках.',
  },

  // ── Farmina ──
  {
    id: 'farmina-diabetic-dry',
    brand: 'Farmina',
    product: 'Vet Life Diabetic Feline (Dry)',
    nameRu: 'Фармина Вет Лайф Диабетик сухой',
    type: 'dry',
    category: 'prescription',
    proteinDM: 46,
    fatDM: 13,
    carbsDM: 11,
    fiberDM: 5,
    regions: ['RU', 'EU', 'UK', 'GLOBAL'],
    whereToBuy: {
      RU: ['4lapy.ru', 'Ozon', 'holistic-shop.ru', 'petdog.ru'],
      EU: ['zooplus.de', 'farmina.com'],
      UK: ['farmina.com'],
      US: [],
      GLOBAL: [],
      DE: [],
      JP: [],
      KR: [],
      BR: [],
    },
    priceHint: 'RU: 700-1000₽/400г, 2000-3000₽/2кг',
    prescriptionRequired: true,
    notes: 'Источник углеводов — овёс и полба (низкий ГИ). Один из лучших по углеводам (11% DM). Итальянское производство.',
  },
  {
    id: 'farmina-diabetic-wet',
    brand: 'Farmina',
    product: 'Vet Life Diabetic Feline (Wet)',
    nameRu: 'Фармина Вет Лайф Диабетик влажный',
    type: 'wet',
    category: 'prescription',
    proteinDM: 53,
    fatDM: 20,
    carbsDM: 10,
    regions: ['RU', 'EU', 'UK', 'GLOBAL'],
    whereToBuy: {
      RU: ['4lapy.ru', 'КотМатрос', 'markvet.ru', 'zoonemo.net'],
      EU: ['zooplus.de', 'farmina.com'],
      UK: ['farmina.com'],
      US: [],
      GLOBAL: [],
      DE: [],
      JP: [],
      KR: [],
      BR: [],
    },
    priceHint: 'RU: 150-220₽/банка 85г',
    prescriptionRequired: true,
    notes: 'Углеводы из семян киноа. Курица + рыба. Хороший вариант для влажного кормления.',
  },

  // ── Craftia (Россия) ──
  {
    id: 'craftia-diabetic-dry',
    brand: 'Craftia',
    product: 'Galena Cat Diabetic Care (Dry)',
    nameRu: 'Крафтиа Галена Диабетик',
    type: 'dry',
    category: 'veterinary',
    proteinDM: 42,
    carbsDM: 18,
    regions: ['RU'],
    whereToBuy: {
      RU: ['Ozon', 'Wildberries'],
      EU: [],
      UK: [],
      US: [],
      GLOBAL: [],
      DE: [],
      JP: [],
      KR: [],
      BR: [],
    },
    priceHint: 'RU: 900-1300₽/1.4кг, 2500-3500₽/4.5кг',
    prescriptionRequired: false,
    notes: 'Российский бренд. Доступен на маркетплейсах. Не требует рецепта.',
  },

  // ── Solid Natura (Россия) ──
  {
    id: 'solid-natura-diabetic',
    brand: 'Solid Natura',
    product: 'Vet Diet Diabetic (Wet)',
    nameRu: 'Солид Натура Вет Диет Диабетик',
    type: 'wet',
    category: 'veterinary',
    regions: ['RU'],
    whereToBuy: {
      RU: ['4lapy.ru', 'Ozon'],
      EU: [],
      UK: [],
      US: [],
      GLOBAL: [],
      DE: [],
      JP: [],
      KR: [],
      BR: [],
    },
    priceHint: 'RU: 100-160₽/банка 100г',
    prescriptionRequired: false,
    notes: 'Курица + лосось. Российское производство. Не всегда в наличии.',
  },
];

// ────────────────────────────────────────────────────
// OTC low-carb foods (no prescription needed)
// ────────────────────────────────────────────────────

export const OTC_LOW_CARB_FOODS: DiabeticCatFood[] = [
  // ── Глобальные бренды ──
  {
    id: 'tiki-after-dark-chicken',
    brand: 'Tiki Cat',
    product: 'After Dark Chicken (Wet)',
    type: 'wet',
    category: 'otc_low_carb',
    carbsDM: 0.1,
    kcalPerKg: 751,
    regions: ['US'],
    prescriptionRequired: false,
    notes: 'Почти нулевые углеводы. Один из лучших для диабетиков. Только в США.',
  },
  {
    id: 'fancy-feast-pate',
    brand: 'Fancy Feast (Purina)',
    product: 'Classic Pate (various flavors)',
    nameRu: 'Фэнси Фист Классик Паштет',
    type: 'wet',
    category: 'otc_low_carb',
    carbsDM: 3,
    regions: ['US', 'UK', 'EU'],
    prescriptionRequired: false,
    notes: 'Бюджетный вариант! Серия Classic Pate имеет ~3-7% углеводов. Рекомендуется ветеринарами как доступная альтернатива. В UK продаётся как Purina Gourmet Gold.',
  },
  {
    id: 'sheba-pate',
    brand: 'Sheba',
    product: 'Perfect Portions Pate',
    nameRu: 'Шеба паштет',
    type: 'wet',
    category: 'otc_low_carb',
    carbsDM: 7.5,
    regions: ['US', 'UK', 'RU', 'EU', 'GLOBAL'],
    whereToBuy: {
      RU: ['4lapy.ru', 'Ozon', 'любой зоомагазин'],
      EU: ['любой супермаркет'],
      UK: ['Tesco', 'Sainsbury\'s'],
      US: ['Walmart', 'Amazon'],
      GLOBAL: [],
      DE: [],
      JP: [],
      KR: [],
      BR: [],
    },
    prescriptionRequired: false,
    notes: 'Широко доступен, включая Россию. Fine Flakes популярны в UK. Углеводы ~7.5% — приемлемо.',
  },
  {
    id: 'dr-elseys-clean-protein',
    brand: "Dr. Elsey's",
    product: 'Clean Protein Chicken (Dry)',
    type: 'dry',
    category: 'otc_low_carb',
    carbsDM: 0.3,
    kcalPerKg: 4030,
    regions: ['US'],
    prescriptionRequired: false,
    notes: 'Рекордно низкие углеводы для сухого корма (0.3%!). Только в США.',
  },
  {
    id: 'ziwi-peak-lamb',
    brand: 'Ziwi Peak',
    product: 'Air-Dried Lamb',
    type: 'dry',
    category: 'otc_low_carb',
    carbsDM: 4.7,
    kcalPerKg: 5600,
    regions: ['US', 'EU', 'UK'],
    prescriptionRequired: false,
    notes: 'Сублимированный корм из Новой Зеландии. Премиум, дорогой, но отличный состав.',
  },
  {
    id: 'nulo-freestyle',
    brand: 'Nulo',
    product: 'Freestyle Duck & Tuna (Wet)',
    type: 'wet',
    category: 'otc_low_carb',
    carbsDM: 5.8,
    kcalPerKg: 1225,
    regions: ['US'],
    prescriptionRequired: false,
    notes: 'Высокое качество. Без зерна, без искусственных добавок.',
  },

  // ── Немецкие бренды (доступны в Европе через Zooplus) ──
  {
    id: 'granatapet',
    brand: 'GranataPet',
    product: 'DeliCatessen (various Wet)',
    type: 'wet',
    category: 'otc_low_carb',
    carbsDM: 3,
    regions: ['DE', 'EU'],
    whereToBuy: {
      DE: ['zooplus.de', 'fressnapf.de'],
      EU: ['zooplus.de'],
      RU: [],
      UK: [],
      US: [],
      GLOBAL: [],
      JP: [],
      KR: [],
      BR: [],
    },
    prescriptionRequired: false,
    notes: 'Немецкое производство. Высокое содержание мяса, низкие углеводы. Доступен через Zooplus.',
  },
  {
    id: 'catz-finefood',
    brand: 'Catz Finefood',
    product: 'Purrrr Collection (Wet)',
    type: 'wet',
    category: 'otc_low_carb',
    carbsDM: 2,
    regions: ['DE', 'EU', 'UK'],
    whereToBuy: {
      DE: ['zooplus.de'],
      EU: ['zooplus.de'],
      UK: ['zooplus.co.uk'],
      RU: [],
      US: [],
      GLOBAL: [],
      JP: [],
      KR: [],
      BR: [],
    },
    prescriptionRequired: false,
    notes: 'Без зерна (кроме Pheasant & Chicken с рисом). Монобелковые варианты. Немецкий.',
  },
  {
    id: 'animonda-carny',
    brand: 'Animonda',
    product: 'Carny Adult (Wet)',
    nameRu: 'Анимонда Карни',
    type: 'wet',
    category: 'otc_low_carb',
    carbsDM: 3,
    regions: ['DE', 'EU', 'RU'],
    whereToBuy: {
      RU: ['Ozon', '4lapy.ru', 'зоомагазины'],
      DE: ['zooplus.de', 'fressnapf.de'],
      EU: ['zooplus.de'],
      UK: [],
      US: [],
      GLOBAL: [],
      JP: [],
      KR: [],
      BR: [],
    },
    prescriptionRequired: false,
    notes: 'Немецкий бренд, ДОСТУПЕН В РОССИИ. 100% мясо, без зерна, без сои. Один из лучших не-рецептурных вариантов для РФ.',
  },
  {
    id: 'macs-cat',
    brand: "MAC's",
    product: 'Cat Wet Food (various)',
    type: 'wet',
    category: 'otc_low_carb',
    carbsDM: 2,
    regions: ['DE', 'EU'],
    prescriptionRequired: false,
    notes: 'Немецкий. Очень высокое содержание мяса (70%+). Доступен через Zooplus.',
  },

  // ── UK-доступные ──
  {
    id: 'lilys-kitchen-chicken',
    brand: "Lily's Kitchen",
    product: 'Chicken Casserole (Wet)',
    type: 'wet',
    category: 'otc_low_carb',
    carbsDM: 8,
    regions: ['UK', 'EU'],
    prescriptionRequired: false,
    notes: '70% курица, низкий ГИ углеводы. Популярен в UK. Натуральные ингредиенты.',
  },
  {
    id: 'purina-gourmet-gold',
    brand: 'Purina Gourmet Gold',
    product: 'Pate (various)',
    nameRu: 'Пурина Гурмэ Голд паштет',
    type: 'wet',
    category: 'otc_low_carb',
    carbsDM: 5,
    regions: ['UK', 'EU', 'RU', 'GLOBAL'],
    whereToBuy: {
      RU: ['любой супермаркет', 'Ozon', '4lapy.ru'],
      EU: ['супермаркеты'],
      UK: ['Tesco', 'Sainsbury\'s', 'ASDA'],
      US: [],
      GLOBAL: [],
      DE: [],
      JP: [],
      KR: [],
      BR: [],
    },
    prescriptionRequired: false,
    notes: 'ШИРОКО ДОСТУПЕН В РОССИИ. UK-аналог Fancy Feast. Паштетные варианты имеют ~5% углеводов. Бюджетный вариант.',
  },

  // ── Доступные в России без рецепта ──
  {
    id: 'wellness-core-wet',
    brand: 'Wellness Core',
    product: 'Tiny Tasters (Wet)',
    type: 'wet',
    category: 'otc_low_carb',
    carbsDM: 3.7,
    kcalPerKg: 1291,
    regions: ['US', 'RU'],
    whereToBuy: {
      RU: ['Ozon', 'holistic-shop.ru'],
      US: ['chewy.com', 'petco.com'],
      EU: [],
      UK: [],
      GLOBAL: [],
      DE: [],
      JP: [],
      KR: [],
      BR: [],
    },
    prescriptionRequired: false,
    notes: 'Доступен в некоторых российских магазинах. Беззерновой, высокобелковый.',
  },
];

// ────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────

export const ALL_FOODS = [...PRESCRIPTION_FOODS, ...OTC_LOW_CARB_FOODS];

/** Get foods available in a specific region */
export function getFoodsByRegion(region: Region): DiabeticCatFood[] {
  return ALL_FOODS.filter(f => f.regions.includes(region) || f.regions.includes('GLOBAL'));
}

/** Get foods sorted by carbs (lowest first) */
export function getFoodsByCarbs(foods: DiabeticCatFood[]): DiabeticCatFood[] {
  return [...foods].sort((a, b) => (a.carbsDM ?? 100) - (b.carbsDM ?? 100));
}

/** Get prescription foods only */
export function getPrescriptionFoods(region?: Region): DiabeticCatFood[] {
  const foods = PRESCRIPTION_FOODS;
  return region ? foods.filter(f => f.regions.includes(region)) : foods;
}

/** Get OTC low-carb foods */
export function getOtcFoods(region?: Region): DiabeticCatFood[] {
  const foods = OTC_LOW_CARB_FOODS;
  return region ? foods.filter(f => f.regions.includes(region)) : foods;
}

// ────────────────────────────────────────────────────
// Quick summary for Russia
// ────────────────────────────────────────────────────

/**
 * ДОСТУПНОСТЬ В РОССИИ (краткая сводка):
 *
 * РЕЦЕПТУРНЫЕ (нужна рекомендация ветеринара):
 * 1. Royal Canin Diabetic DS46      — ЛЕГКО найти (royalcanin.ru, 4lapy, Ozon)
 * 2. Purina DM                       — ЛЕГКО найти (purina.ru, 4lapy, markvet)
 * 3. Farmina Vet Life Diabetic       — СРЕДНЕ (4lapy, Ozon, holistic-shop)
 * 4. Hill's m/d                      — СЛОЖНЕЕ (наличие нестабильное после 2022)
 * 5. Craftia Galena Diabetic Care    — ЛЕГКО (Ozon, WB) — российский бренд
 * 6. Solid Natura Vet Diet Diabetic  — СРЕДНЕ (бывает нет в наличии)
 *
 * БЕЗ РЕЦЕПТА (низкоуглеводные):
 * 1. Purina Gourmet Gold паштет      — ВЕЗДЕ (любой супермаркет)
 * 2. Sheba паштет                    — ВЕЗДЕ
 * 3. Animonda Carny                  — СРЕДНЕ (Ozon, 4lapy)
 * 4. Wellness Core                   — СЛОЖНЕЕ (Ozon, holistic-shop)
 *
 * МАГАЗИНЫ:
 * - 4lapy.ru — крупнейшая сеть, доставка по РФ
 * - Ozon / Wildberries — маркетплейсы
 * - ZooMag.ru, ZooZavr.ru — онлайн зоомагазины
 * - royalcanin.ru — официальный магазин
 * - shop.purina.ru — официальный магазин
 * - holistic-shop.ru — холистик и ветеринарные корма
 * - markvet.ru — ветеринарная аптека
 */
