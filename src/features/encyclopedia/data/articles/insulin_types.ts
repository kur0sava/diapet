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
- **Начало / Пик / Длительность:** 1-4 ч / 4-8 ч / 8-14 ч
- **Важно:** единственный инсулин, одобренный FDA именно для кошек (в США)
- **Хранение:** 28 дней в холодильнике

#### Caninsulin / Vetsulin — ветеринарный

- **Концентрация:** U-40 — нужны шприцы U-40!
- **Начало / Пик / Длительность:** 1-4 ч / 2-8 ч / 8-16 ч (MSD SPC / Feldman & Nelson)
- **Где доступен:** зарегистрирован для кошек в ЕС, Австралии, Канаде
- **Хранение:** строго в холодильнике 2-8°C, 28 дней после вскрытия. Это суспензия — перекатывать флакон перед инъекцией, НЕ трясти

#### Протафан / НПХ (NPH)

- **Концентрация:** U-100
- **Длительность:** 4-12 ч — обычно слишком коротко для кошек (по Feldman & Nelson)
- **Важно:** не является препаратом первого выбора по рекомендациям ISFM (2023)

### Доступность в России

В России ветеринарные инсулины (ProZinc, Caninsulin) **не зарегистрированы**. Все ветеринары используют человеческие инсулины off-label — это общепринятая практика:

- **Лантус (Sanofi)** — доступен в аптеках, ~3000-4500 руб
- **РинГлар (Герофарм)** — российский биосимиляр гларгина, то же действующее вещество, дешевле (~1500-2500 руб). Спросите ветеринара
- **Левемир** — доступен, но глобально снимается с производства
- **Ринсулин НПХ (Герофарм)** — бюджетный NPH (~500-1000 руб), но менее эффективен для кошек

Все эти инсулины — **U-100**, поэтому в России нужны только шприцы U-100.

### U-40 и U-100 — не перепутайте!

Это критически важно, пожалуйста, запомните:

| Концентрация | Единиц на мл | Какой шприц нужен |
|---|---|---|
| U-40 | 40 единиц | Только шприц U-40 |
| U-100 | 100 единиц | Только шприц U-100 |

> **Это очень важно:** если вы используете шприц U-100 с инсулином U-40, вы введёте в 2.5 раза больше инсулина, чем нужно. Это смертельно опасно! Всегда уточняйте у ветеринара, какой именно шприц использовать.

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
- **Onset / Peak / Duration:** 1-4 h / 4-8 h / 8-14 h
- **Important:** the only FDA-approved insulin specifically for cats (in the USA)
- **Storage:** 28 days refrigerated

#### Caninsulin / Vetsulin — Veterinary

- **Concentration:** U-40 — requires U-40 syringes!
- **Onset / Peak / Duration:** 1-4 h / 2-8 h / 8-16 h (MSD SPC / Feldman & Nelson)
- **Availability:** registered for cats in the EU, Australia, and Canada
- **Storage:** strictly refrigerated at 2-8°C, 28 days after opening. It's a suspension — roll the vial before injection, do NOT shake

#### Protaphane / NPH

- **Concentration:** U-100
- **Duration:** 4-12 h — usually too short for cats (per Feldman & Nelson)
- **Important:** not a first-line choice per ISFM guidelines (2023)

### Availability in Russia

In Russia, veterinary insulins (ProZinc, Caninsulin) are **not registered**. All vets use human insulins off-label — this is standard practice:

- **Lantus (Sanofi)** — available at pharmacies, ~3,000-4,500 RUB
- **RinGlar (Geropharm)** — Russian glargine biosimilar, same active ingredient, cheaper (~1,500-2,500 RUB). Ask your vet
- **Levemir** — available, but being phased out globally
- **Rinsulin NPH (Geropharm)** — budget NPH (~500-1,000 RUB), but less effective for cats

All of these are **U-100**, so in Russia you only need U-100 syringes.

### U-40 and U-100 — Don't Mix Them Up!

This is critically important, so please remember:

| Concentration | Units per mL | Required Syringe |
|---|---|---|
| U-40 | 40 units | U-40 syringe only |
| U-100 | 100 units | U-100 syringe only |

> **This is life-or-death important:** using a U-100 syringe with U-40 insulin means giving 2.5 times more insulin than intended. This can be fatal! Always confirm with your vet which syringe to use.

### How to Store Insulin Properly

- Unopened vial: in the fridge at +2...+8°C
- Never freeze, protect from sunlight and heat
- ProZinc and Caninsulin: gently roll the vial between your palms before drawing a dose (don't shake!)
- Before injecting, hold the syringe in your hands for 1-2 minutes — cold insulin can be uncomfortable for your kitty

> **The golden rule:** never change the insulin type, dose, or schedule without talking to your vet. Even if something seems "off" — call the vet first.`,
  },
  category: 'treatment',
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
      ru: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
      en: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
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
