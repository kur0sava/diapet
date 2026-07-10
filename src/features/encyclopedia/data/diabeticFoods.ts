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

/**
 * A note shown on a food card. Historically a bare (Russian) string, which
 * meant EN users never saw it (B3 audit — safety caveats like "Monge is ~35%
 * DM carbs, NOT recommended" were invisible to the whole English market). New
 * entries use `{ ru, en }`; a bare string is still accepted (treated as ru,
 * e.g. legacy remote-manifest rows) and resolved via `localizedNote`.
 */
export type LocalizedNote = string | { ru: string; en?: string };

/** Pick the note text for the current language, falling back ru→en→ru. */
export function localizedNote(note: LocalizedNote | undefined, isRu: boolean): string | undefined {
  if (note == null) return undefined;
  if (typeof note === 'string') return note; // legacy single-language (ru)
  return isRu ? note.ru : (note.en ?? note.ru);
}

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
  /** Key features / notes (localized; see LocalizedNote) */
  notes?: LocalizedNote;
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
    // 2026 audit: recomputed on DM basis from official analytical constituents
    // (protein 46% min, fat 12% min, crude ash 7.9%, crude fibre 4.1%,
    // starch 19%, total sugars 1.5% — Royal Canin AU/zooplus product pages).
    // Moisture not published for the dry SKU; assumed 8% (typical RC dry).
    // Previous entry (48/15/20/11) understated carbs and overstated fibre.
    proteinDM: 50,
    fatDM: 13,
    carbsDM: 24,
    fiberDM: 5,
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
    notes: {
      ru: 'Самый распространённый ветеринарный корм для диабетических кошек. Низкий гликемический индекс. Доступен повсеместно в РФ. Углеводы ~24% DM (пересчитано из этикетки 2026) — выше идеала ISFM (<7%), но в пределах допустимого (<15% для DS46 не выполняется строго; продукт традиционно позиционируется как приемлемый благодаря низкому ГИ источников крахмала, а не абсолютно низкому проценту).',
      en: 'The most widely used veterinary food for diabetic cats. Low glycemic index. Available everywhere in Russia. Carbs ~24% DM (recalculated from the 2026 label) — above the ISFM ideal (<7%), and does not strictly meet the acceptable range either (<15% for DS46 is not strictly met); the product is traditionally positioned as acceptable due to the low GI of its starch sources rather than an absolutely low carb percentage.',
    },
  },
  {
    id: 'rc-diabetic-wet',
    brand: 'Royal Canin',
    product: 'Diabetic (Wet pouches)',
    nameRu: 'Роял Канин Диабетик влажный',
    type: 'wet',
    category: 'prescription',
    // 2026 audit: recomputed from official GA ("Diabetic Thin Slices in
    // Gravy" — RC UK/RS/AU): protein 8.9%, fat 3.2%, moisture 82.5%,
    // ash 1.7%, fibre 1.1%, sugars 1.3%, starch 1.2% (as-fed).
    // Previous fatDM (26) was overstated; carbsDM (14) closely matched.
    proteinDM: 51,
    fatDM: 18,
    carbsDM: 15,
    fiberDM: 6,
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
    notes: {
      ru: 'Влажные пакетики. Удобно дозировать.',
      en: 'Wet pouches. Convenient for portioning.',
    },
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
    // Not available in RU since 2023-24: Rosselkhoznadzor suspended Hill's
    // Netherlands factory (Aug 2023) and paused the Italian one (Feb 2024).
    regions: ['EU', 'UK', 'US'],
    whereToBuy: {
      EU: ['zooplus.de', 'vet clinics'],
      UK: ['petsathome.com', 'viovet.co.uk'],
      US: ['chewy.com', 'petco.com', 'petsmart.com'],
    },
    prescriptionRequired: true,
    notes: {
      ru: "Высокобелковый, низкоуглеводный. Один из лучших по составу для диабета. ⚠️ В РФ недоступен с 2023-24 (поставки Hill's приостановлены). Российская альтернатива: Purina DM или Royal Canin Diabetic.",
      en: "High-protein, low-carb. One of the best formulations for diabetes management. ⚠️ Unavailable in Russia since 2023-24 (Hill's supply suspended). Russian alternative: Purina DM or Royal Canin Diabetic.",
    },
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
    // Hill's unavailable in RU since 2023-24 (see hills-md-dry).
    regions: ['EU', 'UK', 'US'],
    whereToBuy: {
      EU: ['zooplus.de'],
      UK: ['petsathome.com'],
      US: ['chewy.com'],
    },
    prescriptionRequired: true,
    species: 'cat',
    notes: {
      ru: '⚠️ Углеводы 34% DM — существенно выше порога для кошачьего диабета (<15% DM). НЕ рекомендуется как первая линия при сахарном диабете у кошек. Может назначаться ветеринаром при коморбидных ожирении + мягкой гипергликемии, когда контроль веса приоритетнее. Для диабета предпочтительны Purina DM, Royal Canin Diabetic или Farmina Diabetic.',
      en: '⚠️ Carbs 34% DM — significantly above the threshold for feline diabetes (<15% DM). NOT recommended as first-line therapy for diabetes mellitus in cats. May be prescribed by a vet for comorbid obesity + mild hyperglycemia, when weight control takes priority. For diabetes, Purina DM, Royal Canin Diabetic, or Farmina Diabetic are preferred.',
    },
  },

  // ── Purina ──
  {
    id: 'purina-dm-dry',
    brand: 'Purina Pro Plan',
    product: 'Veterinary Diets DM Dietetic Management (Dry)',
    nameRu: 'Пурина DM сухой',
    type: 'dry',
    category: 'prescription',
    // 2026 audit: recomputed from official GA (protein 51% min, fat 15% min,
    // fibre 3% max, ash 7.7% max, moisture 12% max — proplanvetdirect.com/
    // Petco/Chewy label). Close to previous figures; minor refinement.
    proteinDM: 58,
    fatDM: 17,
    carbsDM: 13,
    fiberDM: 3,
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
    notes: {
      ru: 'Один из самых низкоуглеводных сухих кормов (13% DM). Очень высокий белок (58%).',
      en: 'One of the lowest-carb dry foods (13% DM). Very high protein (58%).',
    },
  },
  {
    id: 'purina-dm-wet',
    brand: 'Purina Pro Plan',
    product: 'Veterinary Diets DM Dietetic Management (Wet, Loaf in Sauce)',
    nameRu: 'Пурина DM влажный',
    type: 'wet',
    category: 'prescription',
    // 2026 audit: "ST/OX" branding is outdated; current label reads "DM
    // Dietetic Management". Recomputed from official GA, standard loaf
    // variant: protein 12% min, fat 4.5% min, fibre 2% max, ash 3.1% max,
    // moisture 78% max (valleyvet.com label PDF / Petco). Previous fatDM
    // (30) was substantially overstated; actual fat is closer to 20% DM.
    proteinDM: 55,
    fatDM: 20,
    carbsDM: 2,
    fiberDM: 9,
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
    notes: {
      ru: 'Всего ~2% углеводов на сухое вещество! Лучший показатель среди рецептурных влажных кормов. Доступен в паучах и банках. (Savory Selects — другая линейка с похожим, но не идентичным составом.)',
      en: 'Only ~2% carbs on a dry matter basis! The best figure among prescription wet foods. Available in pouches and cans. (Savory Selects is a different line with a similar but not identical formulation.)',
    },
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
    // Farmina dry banned in RU (Rosselkhoznadzor, 2024) + Italian import
    // restricted. Available in EU/UK.
    regions: ['EU', 'UK'],
    whereToBuy: {
      EU: ['zooplus.de', 'farmina.com'],
      UK: ['farmina.com'],
    },
    prescriptionRequired: true,
    // 2026 audit: verified against official GA (protein 46%, fat 13%, fibre
    // 4.6%, starch 10.5%, total sugar 0.33%, moisture ~6.5%) — figures
    // confirmed accurate, no change. carbsDM here reflects starch+sugar
    // (rapidly-available carbohydrate), which is lower than a strict NFE
    // subtraction would give because Farmina's fibre blend (oat/spelt/
    // flaxseed/chicory) contributes non-starch polysaccharides not captured
    // by the crude-fibre assay.
    notes: {
      ru: 'Источник углеводов — овёс и полба (низкий ГИ). Один из лучших по углеводам (11% DM). Итальянское производство. ⚠️ В РФ сухие корма Farmina под запретом ввоза с 2024 — недоступны.',
      en: 'Carb source — oats and spelt (low GI). One of the best in terms of carb content (11% DM). Made in Italy. ⚠️ Farmina dry foods have been banned from import into Russia since 2024 — unavailable.',
    },
  },
  {
    id: 'farmina-diabetic-wet',
    brand: 'Farmina',
    product: 'Vet Life Diabetic Feline (Wet)',
    nameRu: 'Фармина Вет Лайф Диабетик влажный',
    type: 'wet',
    category: 'prescription',
    // 2026 SECOND-PASS audit: re-verified against farmina.com official
    // product page (Malta store, item 971) — GA: crude protein 15.00%,
    // crude fat 5.70%, crude fibre 2.60%, crude ash 2.60%, moisture 71.50%,
    // starch 2.00%, total sugar 0.80%. DM = 100-71.5 = 28.5%.
    // proteinDM = 15/28.5*100 = 52.6 ≈ 53 (confirmed, no change).
    // fatDM = 5.7/28.5*100 = 20.0 (confirmed, no change).
    // fiberDM = 2.6/28.5*100 = 9.1 → added below (previously missing).
    // carbsDM via starch+sugar = 2.8/28.5*100 = 9.8 ≈ 10 (confirmed).
    proteinDM: 53,
    fatDM: 20,
    carbsDM: 10,
    fiberDM: 9,
    // Italian import restricted to RU; available in EU/UK.
    regions: ['EU', 'UK'],
    whereToBuy: {
      EU: ['zooplus.de', 'farmina.com'],
      UK: ['farmina.com'],
    },
    prescriptionRequired: true,
    notes: {
      ru: 'Углеводы из семян киноа. Курица + рыба. Хороший вариант для влажного кормления. ⚠️ Ввоз в РФ ограничен.',
      en: 'Carbs from quinoa seeds. Chicken + fish. A good option for wet feeding. ⚠️ Import into Russia is restricted.',
    },
  },

  // ── Craftia (Россия) ──
  {
    id: 'craftia-diabetic-dry',
    brand: 'Craftia',
    product: 'Galena Cat Diabetic Care (Dry)',
    nameRu: 'Крафтиа Галена Диабетик',
    type: 'dry',
    category: 'veterinary',
    // 2026 audit: recomputed from official GA (zoomag.ru product page):
    // protein 43%, fat 12%, fibre 5%, ash 7.3%, starch 17%, total sugar
    // 1.3%, "calculated moisture" 6%. Previous entry only had proteinDM/
    // carbsDM and understated carbs (18 → actual ~28% DM).
    proteinDM: 46,
    fatDM: 13,
    carbsDM: 28,
    fiberDM: 5,
    kcalPerKg: 3808,
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
    notes: {
      ru: 'Российский бренд. Доступен на маркетплейсах. Не требует рецепта. ⚠️ Углеводы ~28% DM — выше порога ISFM для диабетической диеты (<15% DM); использовать как бюджетный вариант только под контролем ветеринара, не как основной низкоуглеводный корм.',
      en: 'Russian brand. Available on marketplaces. No prescription required. ⚠️ Carbs ~28% DM — above the ISFM threshold for a diabetic diet (<15% DM); use only as a budget option under veterinary supervision, not as the primary low-carb food.',
    },
  },

  // ── Solid Natura (Россия) ──
  {
    id: 'solid-natura-diabetic',
    brand: 'Solid Natura',
    product: 'Vet Diet Diabetic (Wet)',
    nameRu: 'Солид Натура Вет Диет Диабетик',
    type: 'wet',
    category: 'veterinary',
    // 2026 SECOND-PASS audit: re-verified directly against the official
    // product page (zaisy.ru/155538) — GA is byte-for-byte identical to the
    // first-pass figures: protein 13%, fat 5%, fibre 2.6%, ash 2.6%,
    // moisture 80%, starch 2%, total sugar 0.8% (per 100g). CONFIRMED, no
    // change. NOTE: protein(min)+fat(min)+fibre(max)+ash(max)+moisture(max)
    // sums to 103.2% — guaranteed-analysis mins/maxes are not additive, so a
    // straight NFE subtraction goes negative. carbsDM below uses the
    // starch+sugar figures instead (2.8% as-fed / 20% DM fraction ≈ 14% DM)
    // as the more defensible estimate; still the best available proxy for
    // rapidly-available carbohydrate on this label.
    proteinDM: 65,
    fatDM: 25,
    carbsDM: 14,
    fiberDM: 13,
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
    notes: {
      ru: 'Курица + лосось. Российское производство. Не всегда в наличии. Углеводы (~14% DM) — оценка по крахмалу+сахару из этикетки, требует уточнения у производителя.',
      en: 'Chicken + salmon. Made in Russia. Not always in stock. Carbs (~14% DM) — estimate based on starch+sugar from the label, needs confirmation from the manufacturer.',
    },
  },

  // ── Monge (Italy, EU) — added 2026 audit ──
  {
    id: 'monge-vetsolution-diabetic-feline',
    brand: 'Monge',
    product: 'VetSolution Diabetic Feline (Dry)',
    nameRu: 'Монж ВетСолюшн Диабетик для кошек',
    type: 'dry',
    category: 'veterinary', // see honesty note below — real carbs too high for a diabetic-first-line diet
    // Sourced from monge.it official product PDF/pages: protein 35%,
    // fat 10%, fibre 8%, ash 7%, starch 25%, total sugars 6.2% (as-fed).
    // Moisture not published for this dry SKU; assumed 8% (typical dry).
    proteinDM: 38,
    fatDM: 11,
    carbsDM: 35,
    fiberDM: 9,
    regions: ['EU'],
    whereToBuy: {
      EU: ['zooplus.de', 'monge.it', 'vet clinics'],
    },
    prescriptionRequired: true,
    notes: {
      ru: '⚠️ ЧЕСТНАЯ ОЦЕНКА: несмотря на название "Diabetic", реальные углеводы ~35% DM (крахмал 25% + сахар 6.2% как есть) — это существенно ВЫШЕ порога ISFM для диабетической диеты кошек (<15% DM), сопоставимо с обычным беззерновым кормом для здоровых кошек. Механизм действия у Monge основан на замедлении гликемического ответа (мелонный концентрат, пажитник, XOS), а не на низком содержании углеводов. НЕ рекомендуется как основная низкоуглеводная диета для инсулинозависимых кошек; Purina DM, Royal Canin Diabetic или Farmina Vet Life Diabetic предпочтительнее. Доступность в РФ не подтверждена — не указывать регион RU без дополнительной проверки.',
      en: '⚠️ HONEST ASSESSMENT: despite the name "Diabetic", actual carbs are ~35% DM (starch 25% + sugar 6.2% as-fed) — this is significantly ABOVE the ISFM threshold for a feline diabetic diet (<15% DM), comparable to an ordinary grain-free food for healthy cats. Monge\'s mechanism of action is based on slowing the glycemic response (melon concentrate, fenugreek, XOS) rather than on low carb content. NOT recommended as the primary low-carb diet for insulin-dependent cats; Purina DM, Royal Canin Diabetic, or Farmina Vet Life Diabetic are preferable. Availability in Russia is not confirmed — do not list the RU region without further verification.',
    },
  },
  // ── Ortipo (Russia) — added 2026 audit ──
  {
    id: 'ortipo-vetdiet-diabetic-glucose-control',
    brand: 'Ortipo',
    product: 'VetDiet Diabetic Glucose Control (Dry)',
    nameRu: 'Ортипо ВетДиет Диабетик Глюкоз Контроль',
    type: 'dry',
    category: 'veterinary',
    // Sourced from ortipo.ru official GA table: protein 46.5%, fat 12%,
    // ash 6.8%, fibre 4%. Moisture not published; assumed 7% (typical dry).
    proteinDM: 50,
    fatDM: 13,
    carbsDM: 25,
    fiberDM: 4,
    regions: ['RU'],
    whereToBuy: {
      RU: ['ortipo.ru'],
    },
    priceHint: 'RU: см. ortipo.ru (0.5кг/1.5кг/6кг фасовки)',
    prescriptionRequired: false,
    notes: {
      ru: 'Российский холистик-бренд, продаётся напрямую через ortipo.ru без рецепта. ⚠️ Углеводы ~25% DM — выше порога ISFM (<15% DM) для диабетической диеты; рассматривать как бюджетный дополнительный вариант, не как основной выбор при инсулинозависимом диабете. Обсудить с ветеринаром.',
      en: 'Russian holistic brand, sold directly through ortipo.ru without a prescription. ⚠️ Carbs ~25% DM — above the ISFM threshold (<15% DM) for a diabetic diet; consider it a budget supplementary option, not the primary choice for insulin-dependent diabetes. Discuss with your veterinarian.',
    },
  },
  // ── Trovet (Netherlands) — added 2026 audit ──
  {
    id: 'trovet-wrd-feline',
    brand: 'Trovet',
    product: 'Weight & Diabetic WRD (Dry)',
    nameRu: 'Тровет Вейт энд Диабетик для кошек',
    type: 'dry',
    category: 'veterinary', // see honesty note — real carbs too high for feline diabetic-first-line
    // Sourced from trovet.com official GA: protein 36%, fat 8.5%,
    // fibre 4.5%, ash 7%, moisture 8%.
    proteinDM: 39,
    fatDM: 9,
    carbsDM: 39,
    fiberDM: 5,
    regions: ['EU', 'UK'],
    whereToBuy: {
      EU: ['zooplus.de', 'vet clinics'],
      UK: ['petfoodwarehouse.co.uk', 'vet clinics'],
    },
    prescriptionRequired: true,
    notes: {
      ru: 'Нидерландский Rx-бренд, продукт совмещает "снижение веса" и "диабет" в одном названии (WRD). ⚠️ ЧЕСТНАЯ ОЦЕНКА: углеводы ~39% DM — высокие для кошки, НЕ соответствует низкоуглеводному подходу ISFM/Rand. Ориентирован скорее на кошек с лёгкой гипергликемией на фоне ожирения, чем на строгий контроль инсулинозависимого диабета. Не первый выбор — Purina DM, Royal Canin Diabetic или Farmina Vet Life Diabetic предпочтительнее.',
      en: 'Dutch prescription brand; the product combines "weight loss" and "diabetic" in one name (WRD). ⚠️ HONEST ASSESSMENT: carbs ~39% DM — high for a cat, does NOT meet the ISFM/Rand low-carb approach. Aimed more at cats with mild hyperglycemia secondary to obesity than at strict control of insulin-dependent diabetes. Not the first choice — Purina DM, Royal Canin Diabetic, or Farmina Vet Life Diabetic are preferable.',
    },
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
    // 2026 audit: previous carbsDM (0.1) was the as-fed value, not DM basis.
    // Recomputed from official GA (chicken recipe: protein 12% min, fat
    // 2.2% min, fibre 0.7% max, moisture 83% max); ash not published,
    // assumed ~2% (typical for meat-heavy formulas) — flagged for
    // re-verification against the physical label.
    proteinDM: 71,
    fatDM: 13,
    carbsDM: 1,
    fiberDM: 4,
    kcalPerKg: 751,
    regions: ['US'],
    prescriptionRequired: false,
    notes: {
      ru: 'Почти нулевые углеводы. Один из лучших для диабетиков. Только в США.',
      en: 'Almost zero carbs. One of the best options for diabetics. US only.',
    },
  },
  {
    id: 'fancy-feast-pate',
    brand: 'Fancy Feast (Purina)',
    product: 'Classic Pate (various flavors)',
    nameRu: 'Фэнси Фист Классик Паштет',
    type: 'wet',
    category: 'otc_low_carb',
    // 2026 audit: recomputed from official Purina label PDF (Chicken Feast:
    // protein 10% min, fat 5% min, fibre 1.5% max, ash 3.25% max,
    // moisture 78% max). Previous carbsDM (3) understated actual value.
    proteinDM: 46,
    fatDM: 23,
    carbsDM: 10,
    fiberDM: 7,
    regions: ['US', 'UK', 'EU'],
    prescriptionRequired: false,
    notes: {
      ru: 'Бюджетный вариант! Серия Classic Pate имеет ~10% углеводов DM (варьируется по вкусу). Рекомендуется ветеринарами как доступная альтернатива. В UK продаётся как Purina Gourmet Gold.',
      en: 'Budget option! The Classic Pate line has ~10% carbs DM (varies by flavor). Recommended by vets as an affordable alternative. In the UK it is sold as Purina Gourmet Gold.',
    },
  },
  {
    id: 'sheba-pate',
    brand: 'Sheba',
    product: 'Perfect Portions Pate',
    nameRu: 'Шеба паштет',
    type: 'wet',
    category: 'otc_low_carb',
    // 2026 audit: verified against official GA (Savory Chicken Entree:
    // protein 9% min, fat 5% min, fibre 1.5% max, ash 3% max, moisture 80%
    // max) — carbsDM confirmed accurate, added full macro breakdown.
    proteinDM: 45,
    fatDM: 25,
    carbsDM: 7.5,
    fiberDM: 7.5,
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
    notes: {
      ru: 'Широко доступен, включая Россию. Fine Flakes популярны в UK. Углеводы ~7.5% — приемлемо.',
      en: 'Widely available, including in Russia. Fine Flakes is popular in the UK. Carbs ~7.5% — acceptable.',
    },
  },
  {
    id: 'dr-elseys-clean-protein',
    brand: "Dr. Elsey's",
    product: 'Clean Protein Chicken (Dry)',
    nameRu: 'Доктор Элси Клин Протеин с курицей',
    type: 'dry',
    category: 'otc_low_carb',
    // 2026 audit: previous carbsDM (0.3) was the as-fed value, not DM basis.
    // Recomputed from official GA (protein 59% min, fat 17% min, fibre 4%
    // max, moisture 12% max); ash not published, assumed ~6% (typical dry
    // cat food) — flagged for re-verification against the physical label.
    proteinDM: 67,
    fatDM: 19,
    carbsDM: 2,
    fiberDM: 5,
    kcalPerKg: 4030,
    regions: ['US'],
    prescriptionRequired: false,
    notes: {
      ru: 'Рекордно низкие углеводы для сухого корма (~2% DM). Только в США.',
      en: 'Record-low carbs for a dry food (~2% DM). US only.',
    },
  },
  {
    id: 'ziwi-peak-lamb',
    brand: 'Ziwi Peak',
    product: 'Air-Dried Lamb',
    nameRu: 'Зиви Пик сублимированный с ягнёнком',
    type: 'dry',
    category: 'otc_low_carb',
    // 2026 audit: recomputed from official ZIWI GA (protein 38% min, fat
    // 30% min, fibre 3% max, ash 12% max, moisture 14% max) and corrected
    // energy value (4950 kcal ME/kg per us.ziwipets.com, not 5600).
    proteinDM: 44,
    fatDM: 35,
    carbsDM: 4,
    fiberDM: 3.5,
    kcalPerKg: 4950,
    regions: ['US', 'EU', 'UK'],
    prescriptionRequired: false,
    notes: {
      ru: 'Сублимированный корм из Новой Зеландии. Премиум, дорогой, но отличный состав.',
      en: 'Air-dried food from New Zealand. Premium, expensive, but excellent composition.',
    },
  },
  {
    id: 'nulo-freestyle',
    brand: 'Nulo',
    product: 'Freestyle Duck & Tuna (Wet)',
    nameRu: 'Нуло Фристайл утка и тунец',
    type: 'wet',
    category: 'otc_low_carb',
    // 2026 SECOND-PASS audit: re-verified against nulo.com official product
    // page (live-fetched): crude protein 11.0% min, crude fat 8.0% min,
    // crude fiber 0.75% max, moisture 78.0% max. Ash not published on the
    // AAFCO label; assumed ~2% (typical for a meat-heavy pate) — LOW
    // CONFIDENCE for the ash figure specifically, flagged for
    // re-verification against a physical can label.
    // DM=22%: proteinDM=50.0, fatDM=36.4, fiberDM=3.4,
    // carbsDM(NFE, assumed ash 2%)=100-50.0-36.4-3.4-9.1=1.1.
    // Previous carbsDM (5.8) was in the same ballpark and did not change the
    // verdict — both land well within the "good" (<=7% DM) band for cats.
    proteinDM: 50,
    fatDM: 36,
    carbsDM: 2,
    fiberDM: 3.4,
    kcalPerKg: 1225,
    regions: ['US'],
    prescriptionRequired: false,
    notes: {
      ru: 'Высокое качество. Без зерна, без искусственных добавок. Углеводы крайне низкие (~1-2% DM, зола на этикетке не указана — оценка приблизительная).',
      en: 'High quality. Grain-free, no artificial additives. Carbs extremely low (~1-2% DM; ash is not listed on the label — estimate is approximate).',
    },
  },

  // ── Немецкие бренды (доступны в Европе через Zooplus) ──
  {
    id: 'granatapet',
    brand: 'GranataPet',
    product: 'DeliCatessen (various Wet)',
    nameRu: 'ГранатаПет ДелиКатессен влажный',
    type: 'wet',
    category: 'otc_low_carb',
    // 2026 SECOND-PASS audit — MAJOR CORRECTION: previous carbsDM (3) had no
    // sourced macro breakdown at all. Recomputed from official GA (Chicken
    // PUR variant, petfoodau.com product page / mczoo.de, cross-confirmed):
    // crude protein 10.2%, crude fat 5.3%, crude ash 2.2%, crude fibre 0.5%,
    // moisture 80%. DM=20%: proteinDM=51.0, fatDM=26.5, fiberDM=2.5,
    // ashDM=11.0, carbsDM(NFE)=100-51.0-26.5-2.5-11.0=9.0.
    // VERDICT CHANGE: 3% DM was 'good' (<=7 ideal); 9% DM is 'acceptable'
    // (<=15) — still a solid low-carb option, just not top-tier.
    proteinDM: 51,
    fatDM: 27,
    carbsDM: 9,
    fiberDM: 3,
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
    notes: {
      ru: 'Немецкое производство. Высокое содержание мяса. Углеводы ~9% DM (уточнено 2026, было ошибочно занижено до 3%) — хороший, но не идеальный показатель. Доступен через Zooplus.',
      en: 'Made in Germany. High meat content. Carbs ~9% DM (updated 2026, was previously misstated as low as 3%) — a good but not ideal figure. Available through Zooplus.',
    },
  },
  {
    id: 'catz-finefood',
    brand: 'Catz Finefood',
    product: 'Purrrr Collection (Wet)',
    nameRu: 'Катц Файнфуд Пурррр коллекция',
    type: 'wet',
    category: 'otc_low_carb',
    // 2026 SECOND-PASS audit — MAJOR CORRECTION: previous carbsDM (2) had no
    // sourced macro breakdown. Recomputed from official GA for the No.103
    // Chicken variant (fuettern-mit-spass.de / wirfuerstier.com label,
    // representative of the "Purrrr" mono-protein line): crude protein
    // 10.2%, fat 5.6%, crude ash 2.4%, crude fibre 0.3%, moisture 80%.
    // DM=20%: proteinDM=51.0, fatDM=28.0, fiberDM=1.5, ashDM=12.0,
    // carbsDM(NFE)=100-51.0-28.0-1.5-12.0=7.5.
    // NOTE: other flavors vary (e.g. Kangaroo ~14% DM carbs, Salmon runs
    // higher-fat/lower-carb) — Chicken used as the representative SKU.
    // VERDICT CHANGE: 2% DM was 'good' (<=7 ideal); 7.5% DM is just over the
    // ideal cutoff → 'acceptable' (still well under the 15% ceiling).
    proteinDM: 51,
    fatDM: 28,
    carbsDM: 7.5,
    fiberDM: 1.5,
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
    notes: {
      ru: 'Без зерна (кроме Pheasant & Chicken с рисом). Монобелковые варианты. Немецкий. Углеводы ~7.5% DM для варианта с курицей (уточнено 2026, было ошибочно занижено до 2%) — у других вкусов состав заметно варьируется.',
      en: 'Grain-free (except Pheasant & Chicken with rice). Mono-protein variants. German brand. Carbs ~7.5% DM for the chicken variant (updated 2026, was previously misstated as low as 2%) — composition varies noticeably between other flavors.',
    },
  },
  {
    id: 'animonda-carny',
    brand: 'Animonda',
    product: 'Carny Adult (Wet)',
    nameRu: 'Анимонда Карни',
    type: 'wet',
    category: 'otc_low_carb',
    // 2026 audit: recomputed from official analytische Bestandteile
    // (representative variant: protein 10.5% min, fat 6% min, fibre 0.5%
    // max, ash 2% max, moisture 79% max — animonda.de). Previous carbsDM
    // (3) understated actual value; still well within the "good" range.
    proteinDM: 50,
    fatDM: 29,
    carbsDM: 9,
    fiberDM: 2.4,
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
    notes: {
      ru: 'Немецкий бренд, ДОСТУПЕН В РОССИИ. 100% мясо, без зерна, без сои. Один из лучших не-рецептурных вариантов для РФ.',
      en: 'German brand, AVAILABLE IN RUSSIA. 100% meat, grain-free, soy-free. One of the best over-the-counter options for Russia.',
    },
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
    notes: {
      ru: 'Немецкий. Очень высокое содержание мяса (70%+). Доступен через Zooplus.',
      en: 'German brand. Very high meat content (70%+). Available through Zooplus.',
    },
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
    notes: {
      ru: '70% курица, низкий ГИ углеводы. Популярен в UK. Натуральные ингредиенты.',
      en: '70% chicken, low-GI carbs. Popular in the UK. Natural ingredients.',
    },
  },
  {
    id: 'purina-gourmet-gold',
    brand: 'Purina Gourmet Gold',
    product: 'Pate (various)',
    nameRu: 'Пурина Гурмэ Голд паштет',
    type: 'wet',
    category: 'otc_low_carb',
    // 2026 audit: recomputed from official Purina UK analytical constituents
    // (Chicken variant: moisture 78%, protein 12%, fat 5%, ash 2.9%,
    // fibre 0.05%). Previous carbsDM (5) understated actual value slightly.
    proteinDM: 55,
    fatDM: 23,
    carbsDM: 9,
    fiberDM: 0.2,
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
    notes: {
      ru: 'ШИРОКО ДОСТУПЕН В РОССИИ. UK-аналог Fancy Feast. Паштетные варианты имеют ~5% углеводов. Бюджетный вариант.',
      en: 'WIDELY AVAILABLE IN RUSSIA. The UK equivalent of Fancy Feast. Pate variants have ~5% carbs. A budget option.',
    },
  },

  // ── Доступные в России без рецепта ──
  {
    id: 'wellness-core-wet',
    brand: 'Wellness Core',
    product: 'Tiny Tasters (Wet)',
    type: 'wet',
    category: 'otc_low_carb',
    // 2026 SECOND-PASS audit — MAJOR CORRECTION: previous carbsDM (3.7) had
    // no sourced macro breakdown. Recomputed from official AAFCO GA
    // (wellnesspetfood.com product-catalog pages), averaged across pate
    // variants: protein ~10.7% (range 10.0-12.0), fat ~6.5% (range 3.5-8.0),
    // fibre 1.0% max, moisture 78% max. Ash is not published on AAFCO wet
    // labels; assumed ~2.2% (typical for meat-heavy pate) — LOW CONFIDENCE,
    // flagged for re-verification against a physical can/pouch label.
    // DM=22%: proteinDM=48.6, fatDM=29.5, fiberDM=4.5, ashDM(assumed)=10.0,
    // carbsDM(NFE)=100-48.6-29.5-4.5-10.0=7.4.
    // VERDICT CHANGE: 3.7% DM was 'good' (<=7 ideal); ~7.4% DM lands just
    // over the ideal cutoff → 'acceptable' (still well under 15% ceiling).
    proteinDM: 49,
    fatDM: 30,
    carbsDM: 7.4,
    fiberDM: 4.5,
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
    notes: {
      ru: 'Доступен в некоторых российских магазинах. Беззерновой, высокобелковый.',
      en: 'Available in some Russian stores. Grain-free, high-protein.',
    },
  },

  // ── DE — сухие корма ──
  {
    id: 'animonda-vom-feinsten-deluxe',
    brand: 'Animonda',
    product: 'Vom Feinsten Deluxe Grain-Free (Dry)',
    nameRu: 'Анимонда Вом Файнстен беззерновой сухой',
    type: 'dry',
    category: 'otc_low_carb',
    // 2026 audit — MAJOR CORRECTION: previous entry (proteinDM 44/fatDM 22/
    // carbsDM 12) was not supported by the label. Recomputed from official
    // analytische Bestandteile (Adult/kastriert variant, closest match to
    // "Deluxe Grain-Free Adult"): protein 34%, fat 12%, fibre 3.5%,
    // ash 6%, moisture 8% (animonda.de / zooundco.de / globus-baumarkt.de).
    proteinDM: 37,
    fatDM: 13,
    carbsDM: 40,
    fiberDM: 4,
    regions: ['DE', 'EU'],
    whereToBuy: {
      DE: ['zooplus.de', 'fressnapf.de'],
      EU: ['zooplus.de'],
    },
    prescriptionRequired: false,
    notes: {
      ru: '⚠️ ЧЕСТНАЯ ОЦЕНКА (обновлено 2026): реальные углеводы ~40% DM, а не заявленные ранее 12%. "Беззерновой" ≠ "низкоуглеводный" — сухие гранулы требуют крахмалистого связующего (в данном случае картофель/горох) независимо от отсутствия зерна. НЕ подходит для диабетических кошек, несмотря на позиционирование как премиум-корм. Не рекомендовать как вариант для диабетика.',
      en: '⚠️ HONEST ASSESSMENT (updated 2026): actual carbs are ~40% DM, not the previously stated 12%. "Grain-free" ≠ "low-carb" — dry kibble requires a starchy binder (in this case potato/pea) regardless of the absence of grain. NOT suitable for diabetic cats, despite being positioned as a premium food. Do not recommend it as an option for a diabetic cat.',
    },
  },
  {
    id: 'josera-cat-culinesse',
    brand: 'Josera',
    product: 'Nature Cat Grain-Free (Dry)',
    nameRu: 'Йозера Нэйчер Кэт беззерновой',
    type: 'dry',
    category: 'otc_low_carb',
    // 2026 audit — MAJOR CORRECTION: previous entry (44/22/11) was not
    // supported by the label. Recomputed from official analytische
    // Bestandteile (josera.de datasheet): protein 33%, fat 20%, fibre 2%,
    // ash 7.1%; moisture not published, assumed 8% (typical dry).
    proteinDM: 36,
    fatDM: 22,
    carbsDM: 33,
    fiberDM: 2,
    regions: ['DE', 'EU'],
    whereToBuy: {
      DE: ['zooplus.de', 'fressnapf.de', 'Amazon.de'],
      EU: ['zooplus.de'],
    },
    prescriptionRequired: false,
    notes: {
      ru: '⚠️ ЧЕСТНАЯ ОЦЕНКА (обновлено 2026): реальные углеводы ~33% DM, а не заявленные ранее 11%. Беззерновой состав не означает низкоуглеводный — крахмал даёт горох/картофель. НЕ рекомендовать как вариант для диабетика, несмотря на прежнюю формулировку "один из лучших".',
      en: '⚠️ HONEST ASSESSMENT (updated 2026): actual carbs are ~33% DM, not the previously stated 11%. A grain-free formulation does not mean low-carb — starch comes from peas/potato. Do NOT recommend it as an option for a diabetic cat, despite the previous "one of the best" description.',
    },
  },
  {
    id: 'applaws-dry-chicken',
    brand: 'Applaws',
    product: 'Complete Dry Chicken (Dry)',
    nameRu: 'Апплоус сухой с курицей',
    type: 'dry',
    category: 'otc_low_carb',
    // 2026 audit — MAJOR CORRECTION: previous entry (47/22/10) was not
    // supported by the label. Recomputed from official GA (UK: protein 37%,
    // fibre 2%, fat 16.5%, ash 8%, 4046 kcal/kg; US moisture 9% used since
    // UK page doesn't publish it — applaws.com).
    proteinDM: 41,
    fatDM: 18,
    carbsDM: 30,
    fiberDM: 2,
    kcalPerKg: 4046,
    regions: ['DE', 'EU', 'UK'],
    whereToBuy: {
      DE: ['zooplus.de', 'Amazon.de'],
      EU: ['zooplus.de'],
      UK: ['Amazon.co.uk', 'Pets at Home'],
    },
    prescriptionRequired: false,
    notes: {
      ru: '⚠️ ЧЕСТНАЯ ОЦЕНКА (обновлено 2026): реальные углеводы ~30% DM, а не заявленные ранее 10%. "80% мяса" в маркетинге не отменяет того, что оставшиеся 20% в основном крахмал, необходимый для формирования гранулы. НЕ подходит как низкоуглеводный корм для диабетической кошки.',
      en: '⚠️ HONEST ASSESSMENT (updated 2026): actual carbs are ~30% DM, not the previously stated 10%. Marketing "80% meat" does not change the fact that the remaining 20% is mostly starch needed to bind the kibble. NOT suitable as a low-carb food for a diabetic cat.',
    },
  },

  // ── MX — корма доступные в Мексике ──
  {
    id: 'royal-canin-diabetic-mx',
    brand: 'Royal Canin',
    product: 'Diabetic Feline (Wet & Dry)',
    nameRu: 'Роял Канин Диабетик',
    type: 'both',
    category: 'prescription',
    // 2026 audit: aligned with the sourced RC Diabetic DS46 dry (24% DM
    // carbs) / Thin Slices wet (15% DM carbs) entries above rather than the
    // previous unsourced placeholder (7% DM); value here is a dry/wet
    // average since this MX entry bundles both formats.
    proteinDM: 50,
    fatDM: 15,
    carbsDM: 20,
    fiberDM: 5,
    regions: ['MX', 'GLOBAL'],
    whereToBuy: {
      MX: ['PetCo México', 'Petsy.mx', 'MercadoLibre'],
    },
    prescriptionRequired: true,
    notes: {
      ru: 'Disponible en México. Requiere receta veterinaria. Ver ficha "rc-diabetic-dry"/"rc-diabetic-wet" para el desglose por formato (seco ~24% DM, húmedo ~15% DM).',
      en: 'Available in Mexico. Requires a veterinary prescription. See the "rc-diabetic-dry"/"rc-diabetic-wet" entries for the breakdown by format (dry ~24% DM, wet ~15% DM).',
    },
  },
  {
    id: 'hills-md-mx',
    brand: "Hill's",
    product: 'Prescription Diet m/d Feline',
    nameRu: 'Хиллс m/d',
    type: 'both',
    category: 'prescription',
    // 2026 audit: this MX entry used unsourced placeholder values that
    // diverged from the main hills-md-dry entry (51/23/15). Aligned here;
    // not independently re-verified for the MX-specific SKU this session.
    proteinDM: 51,
    fatDM: 23,
    carbsDM: 15,
    regions: ['MX', 'GLOBAL'],
    whereToBuy: {
      MX: ['PetCo México', 'Petsy.mx'],
    },
    prescriptionRequired: true,
    notes: {
      ru: 'Disponible en México. Control glucémico. Requiere prescripción.',
      en: 'Available in Mexico. Glycemic control. Requires a prescription.',
    },
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
    notes: {
      ru: 'Ampliamente disponible en México. Paté clásico, bajo en carbohidratos. Opción económica.',
      en: 'Widely available in Mexico. Classic pate, low in carbohydrates. An economical option.',
    },
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
    // 2026 SECOND-PASS audit: re-fetched both regional labels directly.
    //  EU/UK (royalcanin.com/uk, live-fetched): protein 37.0%, fat 12.0%,
    //    crude fibre 7.2%, crude ash 5.4%, starch 20.2%, total sugars 1%,
    //    ME 3380 kcal/kg. Moisture not published on the EU page; assumed
    //    10% (typical RC dry, matches US max below). DM=90%:
    //    proteinDM=41.1, fatDM=13.3, fiberDM=8.0, carbsDM(NFE)=31.6.
    //  US (royalcanin.com/us via Petco/Chewy labels): crude protein 35% min,
    //    crude fat 10-14% (midpoint 12), crude fiber 10% max, moisture 10%
    //    max, starch 25% max, sugars 5.7% max. Ash not published on AAFCO
    //    label; assumed ~6% DM (comparable to EU) for NFE. DM=90%:
    //    proteinDM=38.9, fatDM=13.3, fiberDM=11.1, carbsDM(NFE)=30.7.
    // getFoodVerdict for dogs depends only on fatDM/fiberDM (not carbsDM):
    //   EU fiberDM=8.0 → lowFat(13.3<=14) && fiberDM>=6 → 'acceptable'.
    //   US fiberDM=11.1 → fiberHigh(>=10) → 'acceptable'.
    // Same verdict both regions → KEPT AS ONE ENTRY with midpoint values
    // (decision: do not split, per audit instructions — a split is only
    // warranted when the regional gap flips the badge, which it doesn't here).
    proteinDM: 40,
    fatDM: 13,
    carbsDM: 31,
    fiberDM: 10,
    kcalPerKg: 3380,
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
    notes: {
      ru: "Ранее назывался Diabetic Canine. Низкий гликемический индекс, умеренный белок, оптимизированное волокно. Один из самых назначаемых Rx для собак-диабетиков в РФ и мире. ⚠️ Клетчатка (~9% DM) ниже идеала (15% DM) — механизм контроля глюкозы у RC основан на низком ГИ крахмала, а не на объёме клетчатки, в отличие от Hill's w/d.",
      en: "Previously named Diabetic Canine. Low glycemic index, moderate protein, optimized fiber. One of the most commonly prescribed Rx diets for diabetic dogs in Russia and worldwide. ⚠️ Fiber (~9% DM) is below the ideal (15% DM) — RC's glucose-control mechanism relies on low-GI starch rather than fiber volume, unlike Hill's w/d.",
    },
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
    // Hill's unavailable in RU since 2023-24 (factory suspensions).
    regions: ['EU', 'UK', 'US'],
    whereToBuy: {
      EU: ['zooplus.de', 'vet clinics'],
      UK: ['petsathome.com', 'viovet.co.uk'],
      US: ['chewy.com', 'petco.com'],
    },
    prescriptionRequired: true,
    species: 'dog',
    notes: {
      ru: 'Высокое содержание клетчатки (17% DM) — замедляет всплеск глюкозы после еды. Низкий жир (10% DM) = низкий риск панкреатита. AAHA 2018 — терапия первой линии. ⚠️ В РФ недоступен с 2023-24 — альтернатива Royal Canin Diabetic.',
      en: 'High fiber content (17% DM) — slows the post-meal glucose spike. Low fat (10% DM) = low pancreatitis risk. AAHA 2018 — first-line therapy. ⚠️ Unavailable in Russia since 2023-24 — alternative: Royal Canin Diabetic.',
    },
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
    regions: ['EU', 'UK', 'US'],
    whereToBuy: {
      EU: ['zooplus.de'],
      UK: ['petsathome.com'],
      US: ['chewy.com'],
    },
    prescriptionRequired: true,
    species: 'dog',
    notes: {
      ru: 'Влажная версия w/d. Удобна при плохом аппетите или для увеличения потребления воды у собак с сопутствующими заболеваниями. ⚠️ В РФ недоступен с 2023-24.',
      en: 'Wet version of w/d. Convenient for poor appetite or to increase water intake in dogs with comorbid conditions. ⚠️ Unavailable in Russia since 2023-24.',
    },
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
    notes: {
      ru: "Двойное волокно (растворимое + нерастворимое) для улучшения контроля глюкозы и сытости. В РФ стабильно не поставляется — альтернатива Royal Canin Glycobalance или Hill's w/d.",
      en: "Dual fiber (soluble + insoluble) to improve glucose control and satiety. Not reliably supplied in Russia — alternative: Royal Canin Glycobalance or Hill's w/d.",
    },
  },

  // ── Farmina ──
  {
    id: 'farmina-diabetic-canine-dry',
    brand: 'Farmina',
    product: 'Vet Life Canine Diabetic (Dry)',
    nameRu: 'Фармина Вет Лайф Диабетик для собак (сухой)',
    type: 'dry',
    category: 'prescription',
    // 2026 audit: recomputed from official GA (farmina.com/vivapets.com):
    // protein 33% min, fat 10.5% min, fibre 7.9% max, ash 7.9% max,
    // moisture 7.5% max, starch 17.5% max. Previous fiberDM (4) was
    // substantially understated — actual fibre is much closer to the
    // canine diabetic-diet target (≥10% DM ideal) than previously shown.
    proteinDM: 36,
    fatDM: 11,
    carbsDM: 36,
    fiberDM: 9,
    kcalPerKg: 3390,
    // Farmina dry banned in RU (2024) + Italian import restricted.
    regions: ['EU', 'UK'],
    whereToBuy: {
      EU: ['zooplus.de', 'farmina.com'],
      UK: ['farmina.com'],
    },
    prescriptionRequired: true,
    species: 'dog',
    notes: {
      ru: 'Источник углеводов — горох + овёс (низкий ГИ). Белок 36% DM, клетчатка ~9% DM (ближе к идеалу, чем считалось ранее) — подходит собакам с чувствительным ЖКТ. ⚠️ В РФ сухие Farmina под запретом ввоза с 2024.',
      en: 'Carb source — peas + oats (low GI). Protein 36% DM, fiber ~9% DM (closer to the ideal than previously thought) — suitable for dogs with a sensitive GI tract. ⚠️ Farmina dry foods have been banned from import into Russia since 2024.',
    },
  },

  // ── Virbac ──
  {
    id: 'virbac-hpm-weight-diabetes',
    brand: 'Virbac',
    product: 'Veterinary HPM Weight Loss & Diabetes W1 Canine (Dry)',
    nameRu: 'Вирбак HPM W1 для собак',
    type: 'dry',
    category: 'prescription',
    // 2026 audit: recomputed from official GA (produits-veto.com/
    // farmaciasdirect.eu): moisture 9%, protein 34%, fat 11.5%, ash 7.5%,
    // fibre 15%, carbohydrates (ELN) 23%, starch 14%, total sugars 1%.
    // Fibre (~16.5% DM) is notably HIGHER than previously listed (13%) —
    // crosses the canine ideal-fibre threshold (≥15% DM).
    proteinDM: 37,
    fatDM: 13,
    carbsDM: 25,
    fiberDM: 16,
    regions: ['EU', 'UK'],
    whereToBuy: {
      EU: ['zooplus.de', 'vet clinics'],
      UK: ['virbac.co.uk', 'vet clinics'],
    },
    prescriptionRequired: true,
    species: 'dog',
    notes: {
      ru: 'Французский Rx. Высокая клетчатка (~16% DM) + умеренные углеводы. Хорош при коморбидном ожирении (94% животного белка). В РФ не ввозится стабильно.',
      en: 'French prescription diet. High fiber (~16% DM) + moderate carbs. Good for comorbid obesity (94% animal protein). Not reliably imported into Russia.',
    },
  },

  // ── Brit ──
  {
    id: 'brit-vd-diabetes',
    brand: 'Brit',
    product: 'Veterinary Diet Dog Diabetes (Dry)',
    nameRu: 'Брит Ветеринари Диабет для собак',
    type: 'dry',
    category: 'prescription',
    // 2026 audit — MAJOR CORRECTION: previous entry (25/12/45/8) substantially
    // understated protein and overstated carbs. Recomputed from official GA
    // (britvetdiets.com/vetsend.co.uk): protein 37%, fat 12%, fibre 6.5%,
    // ash 8%, moisture 10%, starch 16%, total sugars 1.5%.
    proteinDM: 41,
    fatDM: 13,
    carbsDM: 29,
    fiberDM: 7,
    regions: ['RU', 'EU'],
    whereToBuy: {
      RU: ['4lapy.ru', 'Ozon', 'Wildberries', 'petshop.ru'],
      EU: ['zooplus.de', 'brit-petfood.com'],
    },
    priceHint: 'RU: 1200-1800₽/2кг, 3500-5000₽/12кг',
    prescriptionRequired: false,
    species: 'dog',
    notes: {
      ru: "Чешский бренд. Доступен в РФ без рецепта (хотя производитель позиционирует как Rx). Более бюджетная альтернатива Hill's/RC. Клетчатка (~7% DM) ниже целевого порога (≥10% DM).",
      en: "Czech brand. Available in Russia without a prescription (although the manufacturer positions it as Rx). A more budget-friendly alternative to Hill's/RC. Fiber (~7% DM) is below the target threshold (≥10% DM).",
    },
  },

  // ── Purina (UK-branded twin of DCO) — added 2026 audit ──
  {
    id: 'purina-dm-diabetes-management-canine-dry',
    brand: 'Purina Pro Plan',
    product: 'Veterinary Diets DM Diabetes Management Canine (Dry)',
    nameRu: 'Пурина DM Diabetes Management для собак (сухой)',
    type: 'dry',
    category: 'prescription',
    // Sourced from purina.co.uk official product page: protein 37%, fat
    // 12%, ash 7%, fibre 7%, carbohydrate 29.5% (moisture back-calculated
    // ≈7.5%). This is a UK-specific product name, distinct from the
    // "DCO Dual Fiber Control" branding used in the US/EU — same clinical
    // purpose (diabetes management), different regional SKU/formulation.
    proteinDM: 40,
    fatDM: 13,
    carbsDM: 32,
    fiberDM: 8,
    kcalPerKg: 3699, // 342 kcal/100g as-fed, per label
    regions: ['UK'],
    whereToBuy: {
      UK: ['purina.co.uk', 'vet clinics'],
    },
    prescriptionRequired: true,
    species: 'dog',
    notes: {
      ru: 'UK-специфичное название линейки Purina для собак-диабетиков (не путать с DCO Dual Fiber Control — другой рецептурой). Содержит экстракт белой фасоли (ингибитор амилазы) для снижения постпрандиальной гипергликемии.',
      en: 'UK-specific name for the Purina line for diabetic dogs (not to be confused with DCO Dual Fiber Control — a different formulation). Contains white kidney bean extract (an amylase inhibitor) to reduce postprandial hyperglycemia.',
    },
  },
  // ── Trovet (Netherlands) — added 2026 audit ──
  {
    id: 'trovet-wrd-canine',
    brand: 'Trovet',
    product: 'Weight & Diabetic WRD (Dry)',
    nameRu: 'Тровет Вейт энд Диабетик для собак',
    type: 'dry',
    category: 'prescription',
    // Sourced from trovet.com official GA: protein 32%, fat 6%, fibre 8.5%,
    // ash 6.5%, moisture 8%. Notably low fat (excellent for pancreatitis
    // risk in diabetic dogs) though fibre sits just under the "ideal" 15%
    // DM canine threshold.
    proteinDM: 35,
    fatDM: 6.5,
    carbsDM: 42,
    fiberDM: 9,
    regions: ['EU', 'UK'],
    whereToBuy: {
      EU: ['zooplus.de', 'vet clinics'],
      UK: ['petfoodwarehouse.co.uk', 'vet clinics'],
    },
    prescriptionRequired: true,
    species: 'dog',
    notes: {
      ru: 'Нидерландский Rx-бренд, совмещает "снижение веса" и "диабет" в одном названии (WRD). Жир исключительно низкий (~6.5% DM) — существенно ниже порога риска панкреатита (25% DM), что особенно ценно для собак с диабетом на фоне панкреатита. Рекомендуется распределять корм на 3-5 приёмов в день для стабилизации гликемии.',
      en: 'Dutch prescription brand; combines "weight loss" and "diabetic" in one name (WRD). Fat is exceptionally low (~6.5% DM) — well below the pancreatitis risk threshold (25% DM), which is especially valuable for dogs with diabetes secondary to pancreatitis. It is recommended to split the food into 3-5 meals per day to stabilize glycemia.',
    },
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
    // 2026 SECOND-PASS audit: re-verified against royalcanin.com/uk official
    // page (live-fetched): protein 30%, fat 9.5%, crude ash 5.8%, crude
    // fibre 17%. Moisture not published; assumed 10.5% (matches US AAFCO
    // max — petsmart.com label). DM=89.5%: proteinDM=33.5, fatDM=10.6,
    // fiberDM=19.0, ashDM=6.5, carbsDM(NFE)=100-33.5-10.6-19.0-6.5=30.4.
    // Fibre corrected upward (16→19) and carbs corrected downward (40→30);
    // fat/protein essentially unchanged. getFoodVerdict unaffected either
    // way — fiberDM was already ≥15 (fiberIdeal) before and after → 'good'.
    proteinDM: 33,
    fatDM: 11,
    carbsDM: 30,
    fiberDM: 19,
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
    notes: {
      ru: 'Не помечен как "диабетический", но профиль (низкий жир ~11% DM, высокая клетчатка ~19% DM — уточнено 2026) близок к Rx для диабета. Используется, когда Glycobalance недоступен. Обсуди с ветеринаром.',
      en: 'Not labeled as "diabetic", but its profile (low fat ~11% DM, high fiber ~19% DM — updated 2026) is close to a diabetic Rx diet. Used when Glycobalance is unavailable. Discuss with your veterinarian.',
    },
  },
  {
    id: 'hills-science-plan-perfect-weight',
    brand: "Hill's",
    product: 'Science Plan Perfect Weight Canine Adult (Dry)',
    nameRu: 'Хиллс Perfect Weight для собак',
    type: 'dry',
    category: 'otc_low_carb',
    // 2026 SECOND-PASS audit: re-verified against hillspet.com official
    // product page, which publishes nutrient content directly on a DRY
    // MATTER basis (no as-fed→DM conversion needed): protein 28.8% DM,
    // fat 11.2% DM, crude fiber 10.3% DM (Chicken & Brown Rice Recipe).
    // Ash not published on this page; assumed ~8% DM (typical dry dog food)
    // for the NFE estimate: carbsDM=100-28.8-11.2-10.3-8=41.7.
    // Fiber corrected substantially downward (13→10) — still clears the
    // fiberHigh threshold (≥10% DM) so getFoodVerdict stays 'acceptable'
    // both before and after.
    proteinDM: 29,
    fatDM: 11,
    carbsDM: 42,
    fiberDM: 10,
    // Hill's (incl. retail Science Plan) unavailable in RU since 2023-24.
    regions: ['EU', 'UK', 'US'],
    whereToBuy: {
      EU: ['zooplus.de'],
      UK: ['petsathome.com'],
      US: ['chewy.com'],
    },
    prescriptionRequired: false,
    species: 'dog',
    notes: {
      ru: 'OTC без рецепта. Профиль ближе к диабетическим Rx, чем стандартный adult-корм (клетчатка ~10% DM — уточнено 2026, было завышено до 13%). При лёгкой гипергликемии + ожирении — приемлемая опция при согласовании с врачом. ⚠️ В РФ недоступен с 2023-24.',
      en: 'Over-the-counter, no prescription needed. Profile is closer to diabetic Rx diets than a standard adult food (fiber ~10% DM — updated 2026, was previously overstated at 13%). For mild hyperglycemia + obesity — an acceptable option when agreed with your veterinarian. ⚠️ Unavailable in Russia since 2023-24.',
    },
  },
  {
    id: 'purina-pro-plan-overweight',
    brand: 'Purina Pro Plan',
    product: 'Adult Light / OPTIWEIGHT (Dry)',
    nameRu: 'Пурина Про План для собак с избыточным весом',
    type: 'dry',
    category: 'otc_low_carb',
    // 2026 SECOND-PASS audit — VERDICT-FLIPPING CORRECTION: re-verified
    // against zooplus.com official Purina Pro Plan Adult Light/Sterilised
    // with OPTIWEIGHT label (live-fetched): protein 27.0%, fat 9.0%,
    // fibre 3.5%, ash 7.5%. Moisture not published; assumed 9% (typical dry).
    // DM=91%: proteinDM=29.7, fatDM=9.9, fiberDM=3.85, ashDM=8.2,
    // carbsDM(NFE)=100-29.7-9.9-3.85-8.2=48.35.
    // Previous fiberDM (9) was substantially overstated — actual fibre is
    // only ~3.85% DM, well below the ≥10% DM "acceptable" threshold and far
    // below the ≥15% DM ideal. getFoodVerdict FLIPS from 'acceptable' to
    // 'bad': lowFat is true (9.9<=14) but fiberDM(3.85) < 6, so the
    // "lowFat && fiber>=6" fallback no longer applies. This diet does not
    // meet either canine diabetic-diet pathway (high-fibre OR low-fat+fibre)
    // — demote from the diabetic-adjacent list in owner guidance.
    proteinDM: 30,
    fatDM: 10,
    carbsDM: 48,
    fiberDM: 4,
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
    notes: {
      ru: "⚠️ ЧЕСТНАЯ ОЦЕНКА (обновлено 2026): клетчатка всего ~4% DM (было ошибочно указано 9%) — существенно ниже целевого порога (≥10% DM) для контроля гликемии у собак. Бюджетный OTC вариант для контроля веса, но НЕ рекомендуется как диабетическая диета — ни по клетчатке, ни по низкому жиру не даёт клинического преимущества. Обсуди с ветеринаром альтернативы (Royal Canin Satiety, Hill's Perfect Weight).",
      en: "⚠️ HONEST ASSESSMENT (updated 2026): fiber is only ~4% DM (was previously misstated as 9%) — significantly below the target threshold (≥10% DM) for glycemic control in dogs. A budget OTC weight-control option, but NOT recommended as a diabetic diet — it offers no clinical advantage in either fiber or low fat. Discuss alternatives with your veterinarian (Royal Canin Satiety, Hill's Perfect Weight).",
    },
  },
  {
    id: 'acana-light-fit',
    brand: 'Acana',
    product: 'Light & Fit Recipe (Dry)',
    nameRu: 'Акана Light & Fit',
    type: 'dry',
    category: 'otc_low_carb',
    // 2026 SECOND-PASS audit: re-verified against acana.com official product
    // page (live-fetched): crude protein 33% min, crude fat 10-12% (midpoint
    // 11), crude fiber 8% max, moisture 12% max, ash 7% max (from
    // acana.com GA table). DM=88%: proteinDM=37.5, fatDM=12.5, fiberDM=9.1,
    // ashDM=8.0, carbsDM(NFE)=100-37.5-12.5-9.1-8.0=32.9.
    // Protein corrected upward (34→38) and carbs corrected downward (38→33);
    // fat/fiber essentially unchanged. getFoodVerdict unaffected — fiberDM
    // stays in the 6-10% band ("lowFat && fiber>=6" → 'acceptable') both
    // before and after.
    proteinDM: 38,
    fatDM: 13,
    carbsDM: 33,
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
    notes: {
      ru: 'Канадский холистик. Беззерновой, с мясом. Углеводы из бобовых — ниже ГИ, чем у кукурузы/пшеницы. При отсутствии Rx — одна из лучших OTC опций для собак.',
      en: 'Canadian holistic brand. Grain-free, meat-based. Carbs from legumes — lower GI than corn/wheat. When an Rx diet is unavailable — one of the best OTC options for dogs.',
    },
  },
];

// ────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────

export const ALL_CAT_FOODS = [...PRESCRIPTION_FOODS, ...OTC_LOW_CARB_FOODS];
export const ALL_DOG_FOODS = [...PRESCRIPTION_DOG_FOODS, ...OTC_DOG_FOODS];
export const ALL_FOODS = [...ALL_CAT_FOODS, ...ALL_DOG_FOODS];

type FoodSpecies = 'cat' | 'dog';

// audit L2: region/prescription/OTC filters that duplicated the catalog logic
// (getFoodsByRegion / getPrescriptionFoods / getOtcFoods) were removed — they
// were dead (the UI uses getCatalog* from foodCatalog.ts) and had drifted out of
// sync (no DE→EU inheritance), a latent re-introduction of the B4 region leak.

/** Get foods sorted by carbs (lowest first) */
export function getFoodsByCarbs(foods: DiabeticCatFood[]): DiabeticCatFood[] {
  return [...foods].sort((a, b) => (a.carbsDM ?? 100) - (b.carbsDM ?? 100));
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
    const G = DIABETIC_NUTRITION_GUIDELINES_DOG;
    // Fat is the hard safety gate: high fat drives pancreatitis, a major
    // trigger of insulin resistance in diabetic dogs.
    if (fatDM != null && fatDM > G.fatMaxPercent) return 'bad';
    const lowFat = fatDM == null || fatDM <= G.fatIdealPercent + 2; // ≈≤14% DM
    const fiberIdeal = fiberDM != null && fiberDM >= G.fiberIdealPercent; // ≥15%
    const fiberHigh = fiberDM != null && fiberDM >= G.fiberMinPercent; // ≥10%
    // Two legitimate clinical approaches to canine diabetic control (AAHA 2018):
    //   (a) high-fibre bulk — Hill's w/d, Purina DCO: fibre ≥10–15% DM
    //   (b) low-fat + low-glycaemic starch — Royal Canin Glycobalance, Trovet,
    //       Brit VD: fibre sits at ~7–9% because glucose control comes from the
    //       starch source, not fibre volume. A pure fibre gate wrongly fails
    //       these first-line Rx diets (2026 audit finding).
    if (lowFat && fiberIdeal) return 'good';
    if (fiberHigh) return 'acceptable';
    if (lowFat && fiberDM != null && fiberDM >= 6) return 'acceptable';
    if (fiberDM == null) return 'acceptable'; // fibre unknown, fat ok → neutral
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
 * ДОСТУПНОСТЬ В РОССИИ (краткая dev-сводка). Источник истины — поле `regions`
 * у каждой записи; этот блок лишь ориентир.
 *
 * D8 (audit): обновлено под санкц-реальность 2023-24. Hill's (заводы NL/IT
 * ушли из РФ) и сухие Farmina (запрет Россельхознадзора) БОЛЬШЕ НЕ считаются
 * доступными в РФ — RU снят с их записей. Не возвращать их в RU без проверки.
 *
 * РЕЦЕПТУРНЫЕ (локально производимые / ввозимые, RU-доступные):
 * 1. Royal Canin Diabetic DS46      — завод Дмитров (royalcanin.ru, 4lapy, Ozon)
 * 2. Purina DM                       — завод Калуга (purina.ru, 4lapy, markvet)
 * 3. Craftia Galena Diabetic Care    — российский бренд (Ozon, WB)
 * 4. Solid Natura Vet Diet Diabetic  — российский бренд (бывает нет в наличии)
 * 5. Ortipo Vet Diet                 — российский бренд
 *   ⚠️ Hill's m/d и Farmina Vet Life Diabetic — НЕ доступны в РФ (санкции).
 *
 * БЕЗ РЕЦЕПТА (низкоуглеводные):
 * 1. Purina Gourmet Gold паштет      — ВЕЗДЕ (любой супермаркет)
 * 2. Sheba паштет                    — ВЕЗДЕ
 * 3. Animonda Carny                  — СРЕДНЕ (Ozon, 4lapy)
 *
 * МАГАЗИНЫ:
 * - 4lapy.ru — крупнейшая сеть, доставка по РФ
 * - Ozon / Wildberries — маркетплейсы
 * - ZooMag.ru, ZooZavr.ru — онлайн зоомагазины
 * - royalcanin.ru / shop.purina.ru — официальные магазины
 * - markvet.ru — ветеринарная аптека
 */
