import { Article } from '../../types';

export const dogGlucoseCurves: Article = {
  id: 'dog-glucose-curves',
  titleKey: {
    ru: 'Кривые глюкозы у собак на практике',
    en: 'Glucose Curves in Dogs in Practice',
  },
  summaryKey: {
    ru: '5 реальных примеров кривых глюкозы у собаки с объяснениями — от идеальной до опасной.',
    en: '5 real-life canine glucose curve examples with explanations — from ideal to dangerous.',
  },
  contentKey: {
    ru: `# Кривые глюкозы у собак: 5 сценариев

Кривая глюкозы — это серия замеров каждые 2 часа в течение 12 часов. Она показывает, как инсулин работает в течение дня. Целевой надир у собак — **5-9 ммоль/л**; он не должен падать ниже 4-5.

## Как делать кривую

1. Утренний замер (перед инъекцией и кормлением)
2. Инъекция + кормление
3. Замер каждые 2 часа в течение 12 часов
4. Всего 7 точек: 0, 2, 4, 6, 8, 10, 12 ч

## Кривая 1: Идеальная

**Замеры:** 15 → 11 → 8 → 6.5 → 7 → 9 → 13 ммоль/л

- Старт: 15 (умеренно повышен)
- Надир: 6.5 на 6-м часу — в целевой зоне
- Плавное снижение и подъём, не ниже 5

**Вывод:** отличный контроль. Доза верна. Ничего не менять.

## Кривая 2: Доза слишком мала

**Замеры:** 24 → 21 → 18 → 16 → 17 → 20 → 23 ммоль/л

- Надир: 16 на 6-м часу — недостаточное снижение
- Сахар почти не реагирует

**Вывод:** доза недостаточна. Обсудите с ветеринаром повышение.

## Кривая 3: Доза слишком велика (гипогликемия)

**Замеры:** 17 → 10 → 5 → 3 → 4 → 9 → 16 ммоль/л

- Надир: **3** на 6-м часу — опасно низкий!
- Резкий отскок вверх (эффект Сомоджи)

**Вывод:** доза слишком высокая. Высокий вечерний сахар — это рикошет после гипогликемии, **не** повод повышать дозу. Ветеринар должен дозу снизить.

## Кривая 4: Короткое действие инсулина

**Замеры:** 18 → 11 → 7 → 6 → 10 → 15 → 21 ммоль/л

- Надир: 6 на 6-м часу — хороший
- Но к 10-12 часу сахар уже высокий — инсулин «закончился» рано

**Вывод:** инсулин действует недостаточно долго. Это частая проблема Канинсулина/NPH у некоторых собак. Варианты: сместить на инсулин с более длительным действием или скорректировать интервал. Решает ветеринар.

## Кривая 5: Плоская (инсулинорезистентность)

**Замеры:** 25 → 24 → 23 → 22 → 23 → 24 → 26 ммоль/л

- Сахар практически не снижается

**Возможные причины:**
- Инсулин испорчен (замерзал/перегрелся) или не перемешан (суспензии!)
- Инъекция не попала подкожно
- Неправильный шприц (U-40 вместо U-100 или наоборот)
- **Инсулинорезистентность:** Кушинг, гипотиреоз, инфекция, панкреатит, течка у суки

**Вывод:** срочно к ветеринару для обследования на сопутствующую болезнь.

## Когда НЕ нужна кривая

- Стабильная собака с хорошими утренними замерами
- Если это большой стресс — обсудите с ветеринаром альтернативы (фруктозамин, точечные замеры, непрерывный сенсор)

> Одна кривая — снимок одного дня. Тренд утренних замеров за 2 недели часто информативнее одной «идеальной» кривой. И помните: у собак стресс мало искажает результат, поэтому кривые надёжнее, чем у кошек.`,
    en: `# Glucose Curves in Dogs: 5 Scenarios

A glucose curve is a series of readings every 2 hours over 12 hours. It shows how insulin works across the day. The target nadir in dogs is **5-9 mmol/L**; it should not fall below 4-5.

## How to do a curve

1. Morning reading (before injection and feeding)
2. Injection + feeding
3. Reading every 2 hours for 12 hours
4. Total of 7 points: 0, 2, 4, 6, 8, 10, 12 h

## Curve 1: Ideal

**Readings:** 15 → 11 → 8 → 6.5 → 7 → 9 → 13 mmol/L

- Start: 15 (moderately elevated)
- Nadir: 6.5 at hour 6 — in the target zone
- Smooth fall and rise, never below 5

**Conclusion:** excellent control. Dose is correct. Change nothing.

## Curve 2: Dose Too Low

**Readings:** 24 → 21 → 18 → 16 → 17 → 20 → 23 mmol/L

- Nadir: 16 at hour 6 — insufficient reduction
- Sugar barely responds

**Conclusion:** dose is insufficient. Discuss an increase with your vet.

## Curve 3: Dose Too High (Hypoglycemia)

**Readings:** 17 → 10 → 5 → 3 → 4 → 9 → 16 mmol/L

- Nadir: **3** at hour 6 — dangerously low!
- Sharp rebound upward (Somogyi effect)

**Conclusion:** dose is too high. High evening sugar is a rebound after hypoglycemia, **not** a reason to increase the dose. The vet must reduce it.

## Curve 4: Short Insulin Duration

**Readings:** 18 → 11 → 7 → 6 → 10 → 15 → 21 mmol/L

- Nadir: 6 at hour 6 — good
- But by hours 10-12 sugar is already high — insulin "ran out" early

**Conclusion:** insulin doesn't last long enough. This is a common issue with Caninsulin/NPH in some dogs. Options: switch to a longer-acting insulin or adjust the interval. The vet decides.

## Curve 5: Flat (Insulin Resistance)

**Readings:** 25 → 24 → 23 → 22 → 23 → 24 → 26 mmol/L

- Sugar barely drops

**Possible causes:**
- Insulin spoiled (frozen/overheated) or not mixed (suspensions!)
- Injection didn't go subcutaneously
- Wrong syringe (U-40 instead of U-100 or vice versa)
- **Insulin resistance:** Cushing's, hypothyroidism, infection, pancreatitis, a female's heat

**Conclusion:** urgent vet visit to investigate a concurrent illness.

## When You DON'T Need a Curve

- A stable dog with good morning readings
- If it's very stressful — discuss alternatives with your vet (fructosamine, spot checks, continuous sensor)

> One curve is a snapshot of a single day. A trend of morning readings over 2 weeks is often more informative than one "perfect" curve. And remember: in dogs stress barely distorts results, so curves are more reliable than in cats.`,
  },
  category: 'medical',
  species: 'dog',
  readingTimeMinutes: 7,
  order: 2,
  relatedArticleIds: ['dog-glucose-monitoring', 'dog-insulin', 'dog-hypoglycemia'],
  references: [
    {
      ru: 'AAHA Diabetes Management Guidelines for Dogs and Cats, 2018',
      en: 'AAHA Diabetes Management Guidelines for Dogs and Cats, 2018',
    },
    {
      ru: 'Feldman EC, Nelson RW — Canine and Feline Endocrinology, 4th ed., 2015',
      en: 'Feldman EC, Nelson RW — Canine and Feline Endocrinology, 4th ed., 2015',
    },
  ],
  tags: [
    { ru: 'кривая глюкозы', en: 'glucose curve' },
    { ru: 'мониторинг', en: 'monitoring' },
    { ru: 'примеры', en: 'examples' },
    { ru: 'надир', en: 'nadir' },
  ],
};
