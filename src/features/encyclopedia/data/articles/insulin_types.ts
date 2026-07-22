import { Article } from '../../types';

export const insulinTypes: Article = {
  id: 'insulin_types',
  titleKey: {
    ru: 'Инсулины для кошек',
    en: 'Insulin Types for Cats',
  },
  summaryKey: {
    ru: 'Разбираемся в инсулинах вместе: какие бывают, чем отличаются и как их правильно хранить. Без паники — всё проще, чем кажется.',
    en: "Let's understand insulins together: what types exist, how they differ, and how to store them properly. No panic — it's simpler than it seems.",
  },
  contentKey: {
    ru: `## Инсулины для кошек

Тема инсулинов может казаться запутанной — столько названий, цифр и концентраций. Но не волнуйтесь, давайте разберёмся вместе. Помните: выбор инсулина — это всегда решение вашего ветеринара. Ваша задача — понимать основы.

У кошек инсулины работают не так, как у людей. Скорость начала действия, пик и длительность — всё отличается. Поэтому важно использовать именно тот инсулин, который назначил врач.

### Основные инсулины

#### Гларгин (Lantus) — часто первый выбор

- **Концентрация:** U-100 (100 единиц на мл)
- **Начало / Пик / Длительность:** 1-3 ч / 4-8 ч / 10-16 ч
- **Как часто:** 2 раза в день, каждые 12 часов
- **Почему его любят:** самый высокий процент ремиссии в сочетании с низкоуглеводной диетой
- **Хранение:** открытый флакон — 28 дней при комнатной температуре

#### Детемир (Levemir)

- **Концентрация:** U-100
- **Начало / Пик / Длительность:** 0.5-2 ч / 3-6 ч / 10-16 ч
- **Важно:** это мощный инсулин, начинают с очень маленьких доз
- **Хранение:** открытый флакон — 42 дня

#### ProZinc (PZI) — специально для животных

- **Концентрация:** U-40 (40 единиц на мл) — нужны специальные шприцы U-40!
- **Начало / Пик / Длительность:** 1-4 ч / 4-8 ч / 8-16 ч
- **Важно:** одобрен FDA для кошек в США; для него нужны шприцы U-40
- **Хранение:** в холодильнике; флакон обычно используют в течение 60 дней после первого прокола (уточните срок в инструкции к вашей упаковке)

#### Caninsulin / Vetsulin — ветеринарный

- **Концентрация:** U-40 — нужны шприцы U-40!
- **Начало / Пик / Длительность:** 1-4 ч / 2-8 ч / 8-16 ч (MSD SPC / Feldman & Nelson)
- **Где доступен:** зарегистрирован для кошек в ЕС, Австралии, Канаде
- **Хранение:** 42 дня после первого использования. Caninsulin/Vetsulin — суспензия; инструкция производителя (MSD) требует хранения в холодильнике (2–8°C) и до, и **после** вскрытия. Не храните вскрытый флакон при комнатной температуре — расслаивается кристаллическая фракция и искажается доза. Перекатывать флакон перед инъекцией, НЕ трясти

#### Протафан / НПХ (NPH)

- **Концентрация:** U-100
- **Длительность:** 4-12 ч — обычно слишком коротко для кошек (по Feldman & Nelson)
- **Важно:** не является препаратом первого выбора по рекомендациям ISFM (2023)

### Доступность и правила по регионам

Регистрация, рецептурный статус и цены инсулинов сильно зависят от страны. Ниже — общая картина; конкретный выбор всегда за вашим ветеринаром и местными правилами отпуска.

#### Россия

В России ветеринарные инсулины (ProZinc, Caninsulin) **не зарегистрированы**. Все ветеринары используют человеческие инсулины off-label — это общепринятая практика:

- **Лантус (Sanofi)** — доступен в аптеках, ~3000-4500 руб
- **РинГлар (Герофарм)** — российский биосимиляр гларгина, то же действующее вещество, дешевле (~1500-2500 руб). Спросите ветеринара
- **Левемир** — доступен, но глобально снимается с производства
- **Ринсулин НПХ (Герофарм)** — бюджетный NPH (~500-1000 руб), но менее эффективен для кошек

Все эти инсулины — **U-100**, поэтому в России нужны только шприцы U-100.

#### США

- **ProZinc** и **Vetsulin** одобрены FDA для кошек и отпускаются по рецепту ветеринара
- Человеческие инсулины (гларгин, детемир) назначаются off-label — это законно при назначении ветеринаром (правила AMDUCA)
- Обратите внимание: ветеринарные инсулины здесь **U-40**, человеческие — U-100. Шприц должен соответствовать препарату

#### ЕС и Великобритания

- **Caninsulin** и **ProZinc** зарегистрированы как ветеринарные препараты
- По правилу «каскада» ветеринар обязан в первую очередь рассматривать зарегистрированный ветеринарный препарат; человеческие инсулины — только когда ветпрепарат не подходит, по назначению врача

> Цены и наличие меняются; не заказывайте инсулин из-за рубежа и не заменяйте препарат самостоятельно — концентрация (U-40/U-100) и профиль действия могут отличаться.

### U-40 и U-100 — не перепутайте!

Это критически важно, пожалуйста, запомните:

| Концентрация | Единиц на мл | Какой шприц нужен |
|---|---|---|
| U-40 | 40 единиц | Только шприц U-40 |
| U-100 | 100 единиц | Только шприц U-100 |

> **Это очень важно — ошибка опасна в ОБЕ стороны:**
>
> - Инсулин **U-40 набран шприцем U-100** → питомец получит примерно в **2.5 раза меньше** инсулина. Это недодозировка: сахар не снижается, срыв контроля.
> - Инсулин **U-100 набран шприцем U-40** → питомец получит примерно в **2.5 раза больше** инсулина. Это **опаснее**: передозировка вызывает тяжёлую гипогликемию, которая может быть смертельной (см. статью «Гипогликемия»).
>
> Правило простое: **шприц должен соответствовать концентрации инсулина** (U-40 → шприц U-40, U-100 → шприц U-100). Всегда уточняйте у ветеринара, какой именно шприц использовать, и не смешивайте шкалы.

### Как правильно хранить инсулин

- Невскрытый флакон: в холодильнике при +2...+8°C
- Никогда не замораживайте, берегите от солнца и тепла
- ProZinc и Caninsulin: перед набором дозы аккуратно покатайте флакон между ладонями (не трясите!)
- Перед уколом подержите шприц в руках 1-2 минуты — холодный инсулин может быть неприятен котику

> **Главное правило:** никогда не меняйте тип инсулина, дозу или расписание без согласования с ветеринаром. Даже если кажется, что «что-то не так» — сначала звонок врачу.`,
    en: `## Insulin Types for Cats

The topic of insulin can feel confusing — so many names, numbers, and concentrations. But don't worry, let's figure it out together. Remember: choosing the insulin is always your vet's decision. Your job is to understand the basics.

Insulin works differently in cats than in humans. The onset, peak, and duration are all different. That's why it's important to use exactly the insulin your vet prescribed.

### Main Insulins

#### Glargine (Lantus) — Often the First Choice

- **Concentration:** U-100 (100 units per mL)
- **Onset / Peak / Duration:** 1-3 h / 4-8 h / 10-16 h
- **How often:** twice daily, every 12 hours
- **Why it's popular:** highest remission rates when combined with a low-carb diet
- **Storage:** opened vial — 28 days at room temperature

#### Detemir (Levemir)

- **Concentration:** U-100
- **Onset / Peak / Duration:** 0.5-2 h / 3-6 h / 10-16 h
- **Important:** this is a potent insulin — start with very low doses
- **Storage:** opened vial — 42 days

#### ProZinc (PZI) — Made for Pets

- **Concentration:** U-40 (40 units per mL) — requires special U-40 syringes!
- **Onset / Peak / Duration:** 1-4 h / 4-8 h / 8-16 h
- **Important:** FDA-approved for cats in the USA and requires U-40 syringes
- **Storage:** refrigerated; the vial is usually used within 60 days after first puncture (check the shelf life on your package insert)

#### Caninsulin / Vetsulin — Veterinary

- **Concentration:** U-40 — requires U-40 syringes!
- **Onset / Peak / Duration:** 1-4 h / 2-8 h / 8-16 h (MSD SPC / Feldman & Nelson)
- **Availability:** registered for cats in the EU, Australia, and Canada
- **Storage:** 42 days after first use. Caninsulin/Vetsulin is a suspension; the manufacturer (MSD) label requires refrigeration (2–8°C) both before **and after** opening. Don't store an opened vial at room temperature — the crystalline fraction settles and the dose becomes inaccurate. Roll the vial before injection, do NOT shake

#### Protaphane / NPH

- **Concentration:** U-100
- **Duration:** 4-12 h — usually too short for cats (per Feldman & Nelson)
- **Important:** not a first-line choice per ISFM guidelines (2023)

### Availability and Regulations by Region

Registration, prescription rules, and prices vary a lot between countries. Below is the general picture; the actual choice is always up to your vet and local dispensing rules.

#### United States

- **ProZinc** and **Vetsulin** are FDA-approved for cats and dispensed with a veterinary prescription
- Human insulins (glargine, detemir) are prescribed off-label — legal when directed by your vet (AMDUCA extra-label rules)
- Note: the veterinary insulins here are **U-40**, human insulins are U-100 — the syringe must match the product

#### EU & UK

- **Caninsulin** and **ProZinc** are registered veterinary medicines
- Under the prescribing "cascade", vets must consider the authorised veterinary product first; human insulins are used only when the veterinary product isn't suitable, under veterinary direction

#### Russia

Veterinary insulins (ProZinc, Caninsulin) are **not registered**. All vets use human insulins off-label — this is standard practice:

- **Lantus (Sanofi)** — available at pharmacies, ~3,000-4,500 RUB
- **RinGlar (Geropharm)** — Russian glargine biosimilar, same active ingredient, cheaper (~1,500-2,500 RUB). Ask your vet
- **Levemir** — available, but being phased out globally
- **Rinsulin NPH (Geropharm)** — budget NPH (~500-1,000 RUB), but less effective for cats

All of these are **U-100**, so in Russia you only need U-100 syringes.

> Prices and availability change; don't order insulin from abroad or switch products on your own — concentration (U-40/U-100) and action profiles can differ.

### U-40 and U-100 — Don't Mix Them Up!

This is critically important, so please remember:

| Concentration | Units per mL | Required Syringe |
|---|---|---|
| U-40 | 40 units | U-40 syringe only |
| U-100 | 100 units | U-100 syringe only |

> **This is critically important — a mismatch is dangerous in BOTH directions:**
>
> - **U-40 insulin drawn with a U-100 syringe** → gives about **2.5 times less** insulin than intended. Under-dosing: glucose stays high, control breaks down.
> - **U-100 insulin drawn with a U-40 syringe** → gives about **2.5 times more** insulin than intended. This is **more dangerous**: an overdose causes severe hypoglycemia, which can be fatal (see the "Hypoglycemia" article).
>
> The rule is simple: **the syringe must match the insulin concentration** (U-40 → U-40 syringe, U-100 → U-100 syringe). Always confirm with your vet which syringe to use, and never mix the scales.

### How to Store Insulin Properly

- Unopened vial: in the fridge at +2...+8°C
- Never freeze, protect from sunlight and heat
- ProZinc and Caninsulin: gently roll the vial between your palms before drawing a dose (don't shake!)
- Before injecting, hold the syringe in your hands for 1-2 minutes — cold insulin can be uncomfortable for your kitty

> **The golden rule:** never change the insulin type, dose, or schedule without talking to your vet. Even if something seems "off" — call the vet first.`,
  },
  category: 'treatment',
  // Feline-specific (feline dosing, ISFM remission). Dogs have dog-insulin.
  species: 'cat',
  readingTimeMinutes: 6,
  order: 1,
  relatedArticleIds: [
    'injection-technique',
    'glucose_monitoring',
    'glucose-curves-practice',
    'cost-planning',
  ],
  references: [
    {
      ru: '2025 iCatCare Consensus Guidelines on Diabetes Mellitus in Cats (Taylor et al., JFMS 2025)',
      en: '2025 iCatCare Consensus Guidelines on Diabetes Mellitus in Cats (Taylor et al., JFMS 2025)',
    },
    {
      ru: 'Rand J. — Feline Diabetes Mellitus, Veterinary Clinics, 2012',
      en: 'Rand J. — Feline Diabetes Mellitus, Veterinary Clinics, 2012',
    },
  ],
  tags: [
    { ru: 'инсулин', en: 'insulin' },
    { ru: 'лечение', en: 'treatment' },
    { ru: 'дозировка', en: 'dosage' },
    { ru: 'шприц', en: 'syringe' },
  ],
};
