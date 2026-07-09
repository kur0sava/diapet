/**
 * Database of cat foods suitable for diabetic cats.
 * Organized by region availability and food type.
 *
 * Nutritional targets for diabetic cats (ISFM/AAHA):
 * - Carbs: < 12% dry matter basis (ideal < 7%)
 * - Protein: > 40% dry matter basis
 * - Fat: preferred 15-25% DM for weight management; acceptable up to ~40%
 *   DM per ISFM 2023 in normal-weight cats. speciesConfig.fatDMMax=40 is
 *   the hard warn threshold; 15-25 is the preferred selection target.
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
// Region moved to the shared region profile (single source of truth for
// geo-adaptation); re-exported here so existing importers keep working.
export type { Region } from '@shared/config/regionConfig';
export { VALID_REGIONS } from '@shared/config/regionConfig';
import type { Region } from '@shared/config/regionConfig';

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
  whereToBuy?: Partial<Record<Region, string[]>>;
  /** Price range in local currency */
  priceHint?: string;
  /** Veterinary prescription required */
  prescriptionRequired: boolean;
  /** Key features / notes */
  notes?: string;
  /** Localized names */
  nameRu?: string;
  /** Species: 'cat' | 'dog' | 'all'. Defaults to 'cat' if omitted. */
  species?: import('@storage/domain/types').PetSpecies | 'all';
}

// ────────────────────────────────────────────────────
// Nutritional guidelines
// ────────────────────────────────────────────────────

export const DIABETIC_NUTRITION_GUIDELINES_CAT = {
  carbsMaxPercent: 15, // MH003: aligned with calculator (was 12, causing conflict)
  carbsIdealPercent: 7,
  proteinMinPercent: 40,
  fatRangePercent: { min: 20, max: 40 }, // MH005: ISFM guideline 20-40% DM (was 15-25)
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

/**
 * Nutritional targets for diabetic DOGS (AAHA 2018, ACVIM, Fleeman 2019).
 * Key differences from cat:
 *   - HIGH fiber is a primary goal (slows glucose absorption, improves TIR)
 *   - LOW/MODERATE fat — fat >25% DM raises pancreatitis risk, a major
 *     trigger of insulin resistance in diabetic dogs
 *   - MODERATE complex carbs (whole grains, legumes, beet pulp) are
 *     encouraged, not minimized like for cats
 *   - Protein: moderate (25–30% DM), not max
 *   - Remission is NOT a realistic goal in canine IDDM (unlike 50–90% in cats)
 */
export const DIABETIC_NUTRITION_GUIDELINES_DOG = {
  carbsMaxPercent: 50, // typical dog diabetic diet: 40–55% DM complex carbs
  carbsIdealPercent: 45,
  proteinMinPercent: 20, // AAHA 2018: ≥20% DM protein
  fatMaxPercent: 25, // pancreatitis threshold — critical for dogs
  fatIdealPercent: 12,
  fiberMinPercent: 10, // insoluble+soluble fiber, >10% DM improves glycemic control
  fiberIdealPercent: 15,
  sugarMaxPercent: 1,
  feedingTips: {
    ru: [
      'Кормить 2 раза в день СТРОГО по расписанию — обе порции одинакового размера',
      'Инъекция инсулина сразу после еды (убедись, что съедено >50%)',
      'Клетчатка (≥10% DM) обязательна — замедляет всплеск глюкозы',
      'ВАЖНО: низкий жир (<25% DM) — высокий жир повышает риск панкреатита',
      'Умеренные сложные углеводы (овёс, ячмень, свекольный жом) предпочтительны',
      'Не менять корм резко — переход 7–10 дней',
      'Контроль веса: ожирение ухудшает инсулинорезистентность',
      'Избегать сырой жирной пищи, остатков со стола, лакомств с сахаром',
    ],
    en: [
      'Feed twice daily on a STRICT schedule — equal portions',
      'Give insulin right after meal (confirm >50% eaten first)',
      'Fiber (≥10% DM) is mandatory — slows glucose absorption',
      'CRITICAL: low fat (<25% DM) — high fat triggers pancreatitis',
      'Moderate complex carbs (oats, barley, beet pulp) are preferred',
      'Transition gradually over 7–10 days when changing food',
      'Weight control: obesity worsens insulin resistance',
      'Avoid fatty raw scraps, table food, sugary treats',
    ],
  },
};

/**
 * Backwards-compat: existing code reads DIABETIC_NUTRITION_GUIDELINES as the
 * cat default. Kept as alias so we can migrate call sites incrementally.
 */
export const DIABETIC_NUTRITION_GUIDELINES = DIABETIC_NUTRITION_GUIDELINES_CAT;

// ────────────────────────────────────────────────────
// Prescription / Veterinary diets — CATS
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
    },
    priceHint: 'RU: 800-1200₽/400г, 2500-3500₽/1.5кг',
    prescriptionRequired: true,
    notes:
      'Самый распространённый ветеринарный корм для диабетических кошек. Низкий гликемический индекс. Доступен повсеместно в РФ.',
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
    nameRu: 'Хиллс m/d сухой',
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
    },
    priceHint: 'RU: 1500-2500₽/1.5кг',
    prescriptionRequired: true,
    notes:
      'Высокобелковый, низкоуглеводный. Один из лучших по составу для диабета. Наличие в РФ может варьироваться.',
  },
  // Hill's w/d Feline reclassified from 'prescription' (diabetic) to 'veterinary':
  // at 34% DM carbs it does not meet the feline diabetic diet criterion
  // (<=15% DM). It is a weight-management diet used as adjunct when obesity
  // and mild DM coexist, but should NOT sit in the primary diabetic-food list.
  {
    id: 'hills-wd-dry',
    brand: "Hill's",
    product:
      'Prescription Diet w/d Multi-Benefit (Dry) — weight management, not diabetic-first-line',
    nameRu: 'Хиллс w/d сухой — для контроля веса, НЕ первый выбор при диабете',
    type: 'dry',
    category: 'veterinary',
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
    },
    prescriptionRequired: true,
    species: 'cat',
    notes:
      "⚠️ Углеводы 34% DM — существенно выше порога для кошачьего диабета (<15% DM). НЕ рекомендуется как первая линия при сахарном диабете у кошек. Может назначаться ветеринаром при коморбидных ожирении + мягкой гипергликемии, когда контроль веса приоритетнее. Для диабета предпочтительны Purina DM, Hill's m/d, Royal Canin Diabetic или Farmina Diabetic.",
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
    },
    priceHint: 'RU: 130-200₽/пауч 85г, 250-350₽/банка 195г',
    prescriptionRequired: true,
    notes:
      'Всего 6% углеводов! Лучший показатель среди рецептурных влажных кормов. Доступен в паучах и банках.',
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
    },
    priceHint: 'RU: 700-1000₽/400г, 2000-3000₽/2кг',
    prescriptionRequired: true,
    notes:
      'Источник углеводов — овёс и полба (низкий ГИ). Один из лучших по углеводам (11% DM). Итальянское производство.',
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
    nameRu: 'Тики Кэт Афтер Дарк с курицей',
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
    notes:
      'Бюджетный вариант! Серия Classic Pate имеет ~3-7% углеводов. Рекомендуется ветеринарами как доступная альтернатива. В UK продаётся как Purina Gourmet Gold.',
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
      UK: ['Tesco', "Sainsbury's"],
      US: ['Walmart', 'Amazon'],
      GLOBAL: [],
      DE: [],
    },
    prescriptionRequired: false,
    notes:
      'Широко доступен, включая Россию. Fine Flakes популярны в UK. Углеводы ~7.5% — приемлемо.',
  },
  {
    id: 'dr-elseys-clean-protein',
    brand: "Dr. Elsey's",
    product: 'Clean Protein Chicken (Dry)',
    nameRu: 'Доктор Элси Клин Протеин с курицей',
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
    nameRu: 'Зиви Пик сублимированный с ягнёнком',
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
    nameRu: 'Нуло Фристайл утка и тунец',
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
    nameRu: 'ГранатаПет ДелиКатессен влажный',
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
    },
    prescriptionRequired: false,
    notes:
      'Немецкое производство. Высокое содержание мяса, низкие углеводы. Доступен через Zooplus.',
  },
  {
    id: 'catz-finefood',
    brand: 'Catz Finefood',
    product: 'Purrrr Collection (Wet)',
    nameRu: 'Катц Файнфуд Пурррр коллекция',
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
    },
    prescriptionRequired: false,
    notes:
      'Немецкий бренд, ДОСТУПЕН В РОССИИ. 100% мясо, без зерна, без сои. Один из лучших не-рецептурных вариантов для РФ.',
  },
  {
    id: 'macs-cat',
    brand: "MAC's",
    product: 'Cat Wet Food (various)',
    nameRu: 'Мэкс влажный корм',
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
    nameRu: 'Лилис Китчен запеканка с курицей',
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
      UK: ['Tesco', "Sainsbury's", 'ASDA'],
      US: [],
      GLOBAL: [],
      DE: [],
    },
    prescriptionRequired: false,
    notes:
      'ШИРОКО ДОСТУПЕН В РОССИИ. UK-аналог Fancy Feast. Паштетные варианты имеют ~5% углеводов. Бюджетный вариант.',
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
    },
    prescriptionRequired: false,
    notes: 'Доступен в некоторых российских магазинах. Беззерновой, высокобелковый.',
  },

  // ── DE — сухие корма ──
  {
    id: 'animonda-vom-feinsten-deluxe',
    brand: 'Animonda',
    product: 'Vom Feinsten Deluxe Grain-Free (Dry)',
    nameRu: 'Анимонда Вом Файнстен беззерновой сухой',
    type: 'dry',
    category: 'otc_low_carb',
    proteinDM: 44,
    fatDM: 22,
    carbsDM: 12,
    regions: ['DE', 'EU'],
    whereToBuy: {
      DE: ['zooplus.de', 'fressnapf.de'],
      EU: ['zooplus.de'],
    },
    prescriptionRequired: false,
    notes: 'Немецкий. Беззерновой сухой корм. Низкое содержание углеводов для сухого корма.',
  },
  {
    id: 'josera-cat-culinesse',
    brand: 'Josera',
    product: 'Nature Cat Grain-Free (Dry)',
    nameRu: 'Йозера Нэйчер Кэт беззерновой',
    type: 'dry',
    category: 'otc_low_carb',
    proteinDM: 44,
    fatDM: 22,
    carbsDM: 11,
    regions: ['DE', 'EU'],
    whereToBuy: {
      DE: ['zooplus.de', 'fressnapf.de', 'Amazon.de'],
      EU: ['zooplus.de'],
    },
    prescriptionRequired: false,
    notes:
      'Немецкий бренд. Без злаков, с мясом птицы и лосося. Один из лучших сухих для диабетиков.',
  },
  {
    id: 'applaws-dry-chicken',
    brand: 'Applaws',
    product: 'Complete Dry Chicken (Dry)',
    nameRu: 'Апплоус сухой с курицей',
    type: 'dry',
    category: 'otc_low_carb',
    proteinDM: 47,
    fatDM: 22,
    carbsDM: 10,
    regions: ['DE', 'EU', 'UK'],
    whereToBuy: {
      DE: ['zooplus.de', 'Amazon.de'],
      EU: ['zooplus.de'],
      UK: ['Amazon.co.uk', 'Pets at Home'],
    },
    prescriptionRequired: false,
    notes: '80% мяса. Один из самых низкоуглеводных сухих кормов на рынке.',
  },

  // ── MX — корма доступные в Мексике ──
  {
    id: 'royal-canin-diabetic-mx',
    brand: 'Royal Canin',
    product: 'Diabetic Feline (Wet & Dry)',
    nameRu: 'Роял Канин Диабетик',
    type: 'both',
    category: 'prescription',
    proteinDM: 48,
    fatDM: 24,
    carbsDM: 7,
    regions: ['MX', 'GLOBAL'],
    whereToBuy: {
      MX: ['PetCo México', 'Petsy.mx', 'MercadoLibre'],
    },
    prescriptionRequired: true,
    notes: 'Disponible en México. Requiere receta veterinaria. Bajo en carbohidratos.',
  },
  {
    id: 'hills-md-mx',
    brand: "Hill's",
    product: 'Prescription Diet m/d Feline',
    nameRu: 'Хиллс m/d',
    type: 'both',
    category: 'prescription',
    proteinDM: 51,
    fatDM: 24,
    carbsDM: 8,
    regions: ['MX', 'GLOBAL'],
    whereToBuy: {
      MX: ['PetCo México', 'Petsy.mx'],
    },
    prescriptionRequired: true,
    notes: 'Disponible en México. Control glucémico. Requiere prescripción.',
  },
  {
    id: 'fancy-feast-classic-mx',
    brand: 'Purina Fancy Feast',
    product: 'Classic Pate (Wet)',
    nameRu: 'Пурина Фэнси Фист классик паштет',
    type: 'wet',
    category: 'otc_low_carb',
    carbsDM: 5,
    regions: ['MX', 'US', 'GLOBAL'],
    whereToBuy: {
      MX: ['Walmart México', 'Superama', 'Amazon.com.mx'],
      US: ['Walmart', 'Target', 'chewy.com'],
    },
    prescriptionRequired: false,
    notes:
      'Ampliamente disponible en México. Paté clásico, bajo en carbohidratos. Opción económica.',
  },
];

// ────────────────────────────────────────────────────
// Prescription diets — DOGS
// ────────────────────────────────────────────────────
// Sources: AAHA 2018 Diabetes Guidelines, manufacturer product pages
// (royalcanin.com, hillspet.com, purina.com, farmina.com, virbac.com, brit-petfood.com).
// Nutrient values converted to DM basis from "as-fed" labels where necessary.

export const PRESCRIPTION_DOG_FOODS: DiabeticCatFood[] = [
  // ── Royal Canin ──
  {
    id: 'rc-glycobalance-canine-dry',
    brand: 'Royal Canin',
    product: 'Veterinary Diet Glycobalance Canine (Dry)',
    nameRu: 'Роял Канин Гликобаланс для собак (сухой)',
    type: 'dry',
    category: 'prescription',
    proteinDM: 27,
    fatDM: 13,
    carbsDM: 44,
    fiberDM: 8,
    kcalPerKg: 3544,
    regions: ['RU', 'EU', 'UK', 'US', 'GLOBAL'],
    whereToBuy: {
      RU: ['royalcanin.ru', '4lapy.ru', 'markvet.ru', 'ZooZavr'],
      EU: ['zooplus.de', 'vet clinics'],
      UK: ['royalcanin.com/uk', 'viovet.co.uk', 'vet clinics'],
      US: ['royalcanin.com/us', 'chewy.com', 'vet clinics'],
      GLOBAL: [],
      DE: [],
    },
    priceHint: 'RU: 2500-3500₽/2кг, 6000-8000₽/7.5кг',
    prescriptionRequired: true,
    species: 'dog',
    notes:
      'Ранее назывался Diabetic Canine. Низкий гликемический индекс, умеренный белок, оптимизированное волокно. Один из самых назначаемых Rx для собак-диабетиков в РФ и мире.',
  },

  // ── Hill's ──
  {
    id: 'hills-wd-canine-dry',
    brand: "Hill's",
    product: 'Prescription Diet w/d Canine (Dry)',
    nameRu: 'Хиллс w/d для собак (сухой)',
    type: 'dry',
    category: 'prescription',
    proteinDM: 19,
    fatDM: 10,
    carbsDM: 50,
    fiberDM: 17,
    kcalPerKg: 3010,
    regions: ['RU', 'EU', 'UK', 'US', 'GLOBAL'],
    whereToBuy: {
      RU: ['4lapy.ru', 'ZooMag', 'markvet.ru', 'vet clinics'],
      EU: ['zooplus.de', 'vet clinics'],
      UK: ['petsathome.com', 'viovet.co.uk'],
      US: ['chewy.com', 'petco.com'],
      GLOBAL: [],
      DE: [],
    },
    priceHint: 'RU: 2500-3800₽/4кг, 5000-7500₽/12кг',
    prescriptionRequired: true,
    species: 'dog',
    notes:
      'Высокое содержание клетчатки (17% DM) — замедляет всплеск глюкозы после еды. Низкий жир (10% DM) = низкий риск панкреатита. AAHA 2018 — терапия первой линии.',
  },
  {
    id: 'hills-wd-canine-wet',
    brand: "Hill's",
    product: 'Prescription Diet w/d Canine (Wet)',
    nameRu: 'Хиллс w/d для собак (влажный)',
    type: 'wet',
    category: 'prescription',
    proteinDM: 21,
    fatDM: 11,
    carbsDM: 48,
    fiberDM: 14,
    regions: ['RU', 'EU', 'UK', 'US'],
    whereToBuy: {
      RU: ['4lapy.ru', 'markvet.ru'],
      EU: ['zooplus.de'],
      UK: ['petsathome.com'],
      US: ['chewy.com'],
      GLOBAL: [],
      DE: [],
    },
    priceHint: 'RU: 250-350₽/банка 370г',
    prescriptionRequired: true,
    species: 'dog',
    notes:
      'Влажная версия w/d. Удобна при плохом аппетите или для увеличения потребления воды у собак с сопутствующими заболеваниями.',
  },

  // ── Purina ──
  {
    id: 'purina-dco-dry',
    brand: 'Purina Pro Plan',
    product: 'Veterinary Diets DCO Dual Fiber Canine (Dry)',
    nameRu: 'Пурина DCO для собак (сухой)',
    type: 'dry',
    category: 'prescription',
    proteinDM: 24,
    fatDM: 12,
    carbsDM: 49,
    fiberDM: 14,
    kcalPerKg: 3460,
    regions: ['EU', 'UK', 'US', 'GLOBAL'],
    whereToBuy: {
      EU: ['zooplus.de', 'vet clinics'],
      UK: ['purina.co.uk', 'viovet.co.uk'],
      US: ['proplanvetdirect.com', 'chewy.com'],
      RU: [],
      GLOBAL: [],
      DE: [],
    },
    prescriptionRequired: true,
    species: 'dog',
    notes:
      "Двойное волокно (растворимое + нерастворимое) для улучшения контроля глюкозы и сытости. В РФ стабильно не поставляется — альтернатива Royal Canin Glycobalance или Hill's w/d.",
  },

  // ── Farmina ──
  {
    id: 'farmina-diabetic-canine-dry',
    brand: 'Farmina',
    product: 'Vet Life Canine Diabetic (Dry)',
    nameRu: 'Фармина Вет Лайф Диабетик для собак (сухой)',
    type: 'dry',
    category: 'prescription',
    proteinDM: 32,
    fatDM: 10,
    carbsDM: 42,
    fiberDM: 4,
    kcalPerKg: 3390,
    regions: ['RU', 'EU', 'UK', 'GLOBAL'],
    whereToBuy: {
      RU: ['4lapy.ru', 'Ozon', 'holistic-shop.ru', 'petdog.ru'],
      EU: ['zooplus.de', 'farmina.com'],
      UK: ['farmina.com'],
      US: [],
      GLOBAL: [],
      DE: [],
    },
    priceHint: 'RU: 1500-2200₽/2кг, 4500-6500₽/12кг',
    prescriptionRequired: true,
    species: 'dog',
    notes:
      "Источник углеводов — горох + овёс (низкий ГИ). Выше белок (32% DM) и ниже клетчатка (4%) чем Hill's/RC — подходит собакам с чувствительным ЖКТ, но менее выражен fiber-эффект.",
  },

  // ── Virbac ──
  {
    id: 'virbac-hpm-weight-diabetes',
    brand: 'Virbac',
    product: 'Veterinary HPM Weight Loss & Diabetes W1 Canine (Dry)',
    nameRu: 'Вирбак HPM W1 для собак',
    type: 'dry',
    category: 'prescription',
    proteinDM: 45,
    fatDM: 10,
    carbsDM: 27,
    fiberDM: 13,
    regions: ['EU', 'UK'],
    whereToBuy: {
      EU: ['zooplus.de', 'vet clinics'],
      UK: ['virbac.co.uk', 'vet clinics'],
    },
    prescriptionRequired: true,
    species: 'dog',
    notes:
      'Французский Rx. Высокий белок + низкие углеводы (редкое сочетание для собачьих диабетических диет). Хорош при коморбидном ожирении. В РФ не ввозится стабильно.',
  },

  // ── Brit ──
  {
    id: 'brit-vd-diabetes',
    brand: 'Brit',
    product: 'Veterinary Diet Dog Diabetes (Dry)',
    nameRu: 'Брит Ветеринари Диабет для собак',
    type: 'dry',
    category: 'prescription',
    proteinDM: 25,
    fatDM: 12,
    carbsDM: 45,
    fiberDM: 8,
    regions: ['RU', 'EU'],
    whereToBuy: {
      RU: ['4lapy.ru', 'Ozon', 'Wildberries', 'petshop.ru'],
      EU: ['zooplus.de', 'brit-petfood.com'],
    },
    priceHint: 'RU: 1200-1800₽/2кг, 3500-5000₽/12кг',
    prescriptionRequired: false,
    species: 'dog',
    notes:
      "Чешский бренд. Доступен в РФ без рецепта (хотя производитель позиционирует как Rx). Более бюджетная альтернатива Hill's/RC.",
  },
];

// ────────────────────────────────────────────────────
// OTC options for diabetic DOGS
// ────────────────────────────────────────────────────
// Note: true OTC diabetic diets for dogs are rare. These are adult
// weight-management / high-fiber products used with explicit vet approval
// when Rx options are unavailable or cost-prohibitive.

export const OTC_DOG_FOODS: DiabeticCatFood[] = [
  {
    id: 'rc-satiety-canine',
    brand: 'Royal Canin',
    product: 'Veterinary Diet Satiety Weight Management Canine (Dry)',
    nameRu: 'Роял Канин Сатиети для собак',
    type: 'dry',
    category: 'veterinary',
    proteinDM: 33,
    fatDM: 10,
    carbsDM: 40,
    fiberDM: 16,
    regions: ['RU', 'EU', 'UK', 'US', 'GLOBAL'],
    whereToBuy: {
      RU: ['royalcanin.ru', '4lapy.ru', 'markvet.ru'],
      EU: ['zooplus.de'],
      UK: ['royalcanin.com/uk'],
      US: ['chewy.com'],
      GLOBAL: [],
      DE: [],
    },
    priceHint: 'RU: 2200-3200₽/1.5кг, 6500-9000₽/12кг',
    prescriptionRequired: false,
    species: 'dog',
    notes:
      'Не помечен как "диабетический", но профиль (низкий жир 10%, волокно 16%) близок к Rx для диабета. Используется, когда Glycobalance недоступен. Обсуди с ветеринаром.',
  },
  {
    id: 'hills-science-plan-perfect-weight',
    brand: "Hill's",
    product: 'Science Plan Perfect Weight Canine Adult (Dry)',
    nameRu: 'Хиллс Perfect Weight для собак',
    type: 'dry',
    category: 'otc_low_carb',
    proteinDM: 29,
    fatDM: 10,
    carbsDM: 46,
    fiberDM: 13,
    regions: ['RU', 'EU', 'UK', 'US'],
    whereToBuy: {
      RU: ['4lapy.ru', 'Ozon'],
      EU: ['zooplus.de'],
      UK: ['petsathome.com'],
      US: ['chewy.com'],
    },
    priceHint: 'RU: 1800-2800₽/2кг',
    prescriptionRequired: false,
    species: 'dog',
    notes:
      'OTC без рецепта. Профиль ближе к диабетическим Rx, чем стандартный adult-корм. При лёгкой гипергликемии + ожирении — приемлемая опция при согласовании с врачом.',
  },
  {
    id: 'purina-pro-plan-overweight',
    brand: 'Purina Pro Plan',
    product: 'Adult Light / OPTIWEIGHT (Dry)',
    nameRu: 'Пурина Про План для собак с избыточным весом',
    type: 'dry',
    category: 'otc_low_carb',
    proteinDM: 33,
    fatDM: 10,
    carbsDM: 48,
    fiberDM: 9,
    regions: ['RU', 'EU', 'UK', 'US'],
    whereToBuy: {
      RU: ['shop.purina.ru', '4lapy.ru', 'Ozon', 'Wildberries'],
      EU: ['zooplus.de'],
      UK: ['purina.co.uk'],
      US: ['proplan.com'],
    },
    priceHint: 'RU: 900-1400₽/1.5кг, 3500-5000₽/14кг',
    prescriptionRequired: false,
    species: 'dog',
    notes:
      '⚠ Клетчатка 9% DM — на границе (≥10% DM желательно). Бюджетный OTC вариант, но НЕ замена рецептурной диабетической диете. Только при одобрении ветеринаром.',
  },
  {
    id: 'acana-light-fit',
    brand: 'Acana',
    product: 'Light & Fit Recipe (Dry)',
    nameRu: 'Акана Light & Fit',
    type: 'dry',
    category: 'otc_low_carb',
    proteinDM: 34,
    fatDM: 12,
    carbsDM: 38,
    fiberDM: 9,
    regions: ['RU', 'EU', 'UK', 'US'],
    whereToBuy: {
      RU: ['4lapy.ru', 'Ozon', 'holistic-shop.ru'],
      EU: ['zooplus.de'],
      UK: ['acana.com'],
      US: ['chewy.com'],
    },
    priceHint: 'RU: 2500-3500₽/2кг, 6500-9000₽/11.4кг',
    prescriptionRequired: false,
    species: 'dog',
    notes:
      'Канадский холистик. Беззерновой, с мясом. Углеводы из бобовых — ниже ГИ, чем у кукурузы/пшеницы. При отсутствии Rx — одна из лучших OTC опций для собак.',
  },
];

// ────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────

export const ALL_CAT_FOODS = [...PRESCRIPTION_FOODS, ...OTC_LOW_CARB_FOODS];
export const ALL_DOG_FOODS = [...PRESCRIPTION_DOG_FOODS, ...OTC_DOG_FOODS];
export const ALL_FOODS = [...ALL_CAT_FOODS, ...ALL_DOG_FOODS];

type FoodSpecies = 'cat' | 'dog';

/** Records without explicit species default to 'cat' for backwards compat. */
function foodSpecies(food: DiabeticCatFood): FoodSpecies {
  return food.species === 'dog' ? 'dog' : 'cat';
}

/** Get foods available in a specific region */
export function getFoodsByRegion(region: Region, species: FoodSpecies = 'cat'): DiabeticCatFood[] {
  const source = species === 'dog' ? ALL_DOG_FOODS : ALL_CAT_FOODS;
  return source.filter(f => f.regions.includes(region) || f.regions.includes('GLOBAL'));
}

/** Get foods sorted by carbs (lowest first) */
export function getFoodsByCarbs(foods: DiabeticCatFood[]): DiabeticCatFood[] {
  return [...foods].sort((a, b) => (a.carbsDM ?? 100) - (b.carbsDM ?? 100));
}

/** Get prescription foods only — species-aware */
export function getPrescriptionFoods(
  region?: Region,
  species: FoodSpecies = 'cat'
): DiabeticCatFood[] {
  const source = species === 'dog' ? PRESCRIPTION_DOG_FOODS : PRESCRIPTION_FOODS;
  // Filter: only true diabetic-first-line prescriptions (category='prescription').
  // Weight-management 'veterinary' entries (e.g. Hill's w/d Feline) are shown
  // in the OTC-adjacent list, not as primary diabetic Rx.
  const filtered = source.filter(f => f.category === 'prescription' && foodSpecies(f) === species);
  return region ? filtered.filter(f => f.regions.includes(region)) : filtered;
}

/** Get OTC low-carb (cat) / high-fiber (dog) foods — species-aware */
export function getOtcFoods(region?: Region, species: FoodSpecies = 'cat'): DiabeticCatFood[] {
  const source = species === 'dog' ? OTC_DOG_FOODS : OTC_LOW_CARB_FOODS;
  const filtered = source.filter(f => foodSpecies(f) === species);
  return region ? filtered.filter(f => f.regions.includes(region)) : filtered;
}

/**
 * Evaluate food suitability based on macros.
 *
 * For cats: driven by carbs DM% (lower = better, <7% good, <15% acceptable).
 * For dogs: driven by fat DM% + fiber DM% (low fat to avoid pancreatitis,
 * high fiber for glycemic control); carbs are less important and moderate
 * is expected.
 */
export function getFoodVerdict(
  carbsDM: number,
  species: FoodSpecies = 'cat',
  fatDM?: number,
  fiberDM?: number
): 'good' | 'acceptable' | 'bad' {
  if (species === 'dog') {
    const fatOk = fatDM == null || fatDM <= DIABETIC_NUTRITION_GUIDELINES_DOG.fatMaxPercent;
    const fatIdeal =
      fatDM != null && fatDM <= DIABETIC_NUTRITION_GUIDELINES_DOG.fatIdealPercent + 2;
    const fiberOk = fiberDM == null || fiberDM >= DIABETIC_NUTRITION_GUIDELINES_DOG.fiberMinPercent;
    const fiberIdeal =
      fiberDM != null && fiberDM >= DIABETIC_NUTRITION_GUIDELINES_DOG.fiberIdealPercent;
    if (!fatOk) return 'bad'; // pancreatitis risk trumps everything
    if (fatIdeal && fiberIdeal) return 'good';
    if (fiberOk) return 'acceptable';
    return 'bad';
  }
  // cat (default)
  if (carbsDM <= DIABETIC_NUTRITION_GUIDELINES_CAT.carbsIdealPercent) return 'good';
  if (carbsDM <= DIABETIC_NUTRITION_GUIDELINES_CAT.carbsMaxPercent) return 'acceptable';
  return 'bad';
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
