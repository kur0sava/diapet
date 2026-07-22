import { Article } from '../../types';

export const glucoseCurvesPractice: Article = {
  id: 'glucose-curves-practice',
  titleKey: {
    ru: 'Кривые глюкозы на практике',
    en: 'Glucose Curves in Practice',
  },
  summaryKey: {
    ru: '5 реальных примеров кривых глюкозы с объяснениями — от идеальной до опасной.',
    en: '5 real-life glucose curve examples with explanations — from ideal to dangerous.',
  },
  contentKey: {
    ru: `## Кривые глюкозы: 5 реальных сценариев

Кривая глюкозы — это серия замеров каждые 2 часа в течение 12 часов. Она показывает, как инсулин работает в течение дня. Вот 5 типичных сценариев, которые вы можете увидеть.

### Как делать кривую

1. Утренний замер (перед инъекцией и кормлением)
2. Инъекция + кормление
3. Замер каждые 2 часа в течение 12 часов
4. Всего 7 точек: 0ч, 2ч, 4ч, 6ч, 8ч, 10ч, 12ч

### Кривая 1: Идеальная

**Замеры:** 14 → 10 → 7 → 5.5 → 6 → 8 → 12 ммоль/л

- Стартовый сахар: 14 (умеренно повышен)
- Надир (минимум): 5.5 на 6-м часу
- Плавное снижение и подъём
- Сахар не падает ниже 4

**Вывод:** отличный контроль. Доза инсулина подобрана правильно. Не менять ничего.

### Кривая 2: Доза слишком мала

**Замеры:** 22 → 19 → 16 → 14 → 15 → 18 → 21 ммоль/л

- Стартовый: 22 (высокий)
- Надир: 14 на 6-м часу — недостаточное снижение
- Сахар почти не реагирует на инсулин

**Вывод:** инсулин работает, но доза недостаточна. Обсудите с ветеринаром увеличение на 0.25-0.5 ед.

### Кривая 3: Доза слишком велика (гипогликемия)

**Замеры:** 16 → 10 → 5 → 2.8 → 3.5 → 8 → 15 ммоль/л

- Стартовый: 16
- Надир: **2.8** на 6-м часу — опасно низкий!
- Резкий отскок (эффект Сомоджи)

**Вывод:** доза слишком высокая. Падение ниже 4 — риск гипогликемии. Ветеринар должен снизить дозу. Высокий вечерний сахар — это рикошет, НЕ повод повышать дозу.

### Кривая 4: Короткое действие инсулина

**Замеры:** 18 → 11 → 6 → 5 → 9 → 15 → 20 ммоль/л

- Надир: 5 на 6-м часу — хороший
- Но к 10-12 часу сахар уже высокий
- Инсулин «закончился» раньше времени

**Вывод:** инсулин действует недостаточно долго. Варианты: перейти на инсулин с более длительным действием (например, с Канинсулина на Лантус), или сократить интервал между инъекциями (с 12 до 10 часов). Решает ветеринар.

### Кривая 5: Плоская (инсулинорезистентность)

**Замеры:** 24 → 23 → 22 → 21 → 22 → 23 → 25 ммоль/л

- Сахар практически не снижается
- Инсулин как будто не работает

**Возможные причины:**
- Инсулин испорчен (проверьте хранение — не замерзал? не перегрелся?)
- Инъекция не попала подкожно (в шерсть)
- Инсулинорезистентность: гипертиреоз, инфекция, стероиды, акромегалия
- Неправильный шприц (U-40 вместо U-100 или наоборот)

**Вывод:** срочно к ветеринару для обследования.

### Что изменилось в 2025 году

По обновлённым рекомендациям **2025 iCatCare** (в одном ключе с AAHA) **стационарная 12-часовая кривая в клинике больше не считается основным инструментом** контроля. Причина — поездка и сама клиника вызывают стрессовую гипергликемию, которая искажает картину. Акцент сместился на **клинические признаки** (жажда, мочеиспускание, вес, аппетит) плюс **тренды CGM и домашних замеров**. Точечная кривая остаётся полезным, но **вспомогательным** инструментом.

> Хорошая новость: наши кривые изначально **домашние** — это как раз то, что рекомендуют. Спокойная кошка даёт реальные цифры без стрессового скачка. А непрерывный мониторинг (CGM) и тренд утренних замеров рисуют ещё более полную картину, чем одна отдельная кривая.

### Когда НЕ нужна кривая

- Стабильная кошка с хорошими утренними замерами
- Кошка в сильном стрессе (результаты будут искажены)
- Если это мучение для вас и кошки — обсудите с ветеринаром альтернативы (фруктозамин, точечные замеры)

> **Помните:** одна кривая — это снимок одного дня. Тренд утренних замеров за 2 недели часто информативнее, чем одна «идеальная» кривая.`,
    en: `## Glucose Curves: 5 Real-Life Scenarios

A glucose curve is a series of readings every 2 hours over 12 hours. It shows how insulin works throughout the day. Here are 5 typical scenarios you might see.

### How to Do a Curve

1. Morning reading (before injection and feeding)
2. Injection + feeding
3. Reading every 2 hours for 12 hours
4. Total of 7 data points: 0h, 2h, 4h, 6h, 8h, 10h, 12h

### Curve 1: Ideal

**Readings:** 14 → 10 → 7 → 5.5 → 6 → 8 → 12 mmol/L

- Starting sugar: 14 (moderately elevated)
- Nadir (minimum): 5.5 at hour 6
- Smooth decline and rise
- Sugar doesn't drop below 4

**Conclusion:** excellent control. Insulin dose is correct. Change nothing.

### Curve 2: Dose Too Low

**Readings:** 22 → 19 → 16 → 14 → 15 → 18 → 21 mmol/L

- Starting: 22 (high)
- Nadir: 14 at hour 6 — insufficient reduction
- Sugar barely responds to insulin

**Conclusion:** insulin is working, but the dose is insufficient. Discuss increasing by 0.25-0.5 units with your vet.

### Curve 3: Dose Too High (Hypoglycemia)

**Readings:** 16 → 10 → 5 → 2.8 → 3.5 → 8 → 15 mmol/L

- Starting: 16
- Nadir: **2.8** at hour 6 — dangerously low!
- Sharp rebound (Somogyi effect)

**Conclusion:** dose too high. Dropping below 4 is a hypoglycemia risk. The vet must reduce the dose. High evening sugar is a rebound, NOT a reason to increase the dose.

### Curve 4: Short Insulin Duration

**Readings:** 18 → 11 → 6 → 5 → 9 → 15 → 20 mmol/L

- Nadir: 5 at hour 6 — good
- But by hours 10-12, sugar is already high
- Insulin "ran out" too early

**Conclusion:** insulin doesn't last long enough. Options: switch to longer-acting insulin (e.g., from Caninsulin to Lantus), or shorten the interval between injections (from 12 to 10 hours). Vet decides.

### Curve 5: Flat (Insulin Resistance)

**Readings:** 24 → 23 → 22 → 21 → 22 → 23 → 25 mmol/L

- Sugar barely drops
- Insulin seems ineffective

**Possible causes:**
- Insulin is spoiled (check storage — was it frozen? overheated?)
- Injection didn't go subcutaneously (went into fur)
- Insulin resistance: hyperthyroidism, infection, steroids, acromegaly
- Wrong syringe (U-40 instead of U-100 or vice versa)

**Conclusion:** urgent vet visit for investigation.

### What Changed in 2025

Under the updated **2025 iCatCare** guidelines (aligned with AAHA), an **in-clinic 12-hour curve is no longer considered the primary monitoring tool**. The reason: the trip and the clinic itself trigger stress hyperglycemia that distorts the picture. The emphasis has shifted to **clinical signs** (thirst, urination, weight, appetite) plus **CGM and home-reading trends**. A spot curve remains useful, but as an **auxiliary** tool.

> Good news: our curves are home-based by design — exactly what's recommended. A calm cat gives real numbers without the stress spike. And continuous monitoring (CGM) plus a trend of morning readings paint an even fuller picture than a single curve.

### When You DON'T Need a Curve

- Stable cat with good morning readings
- Cat under severe stress (results will be distorted)
- If it's torture for you and the cat — discuss alternatives with your vet (fructosamine, spot checks)

> **Remember:** one curve is a snapshot of one day. A trend of morning readings over 2 weeks is often more informative than one "perfect" curve.`,
  },
  category: 'medical',
  readingTimeMinutes: 8,
  order: 14,
  species: 'cat',
  relatedArticleIds: [
    'glucose_monitoring',
    'flexible-monitoring',
    'insulin_types',
    'hypoglycemia',
    'somogyi-rebound',
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
    {
      ru: 'AAHA Diabetes Management Guidelines for Dogs and Cats, 2018',
      en: 'AAHA Diabetes Management Guidelines for Dogs and Cats, 2018',
    },
  ],
  tags: [
    { ru: 'кривая глюкозы', en: 'glucose curve' },
    { ru: 'мониторинг', en: 'monitoring' },
    { ru: 'примеры', en: 'examples' },
    { ru: 'надир', en: 'nadir' },
  ],
};
