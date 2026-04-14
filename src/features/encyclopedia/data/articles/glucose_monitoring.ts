import { Article } from '../../types';

export const glucoseMonitoring: Article = {
  id: 'glucose_monitoring',
  titleKey: {
    ru: 'Мониторинг глюкозы дома',
    en: 'Home Glucose Monitoring',
  },
  summaryKey: {
    ru: 'Домашние измерения сахара — ваш суперинструмент в борьбе с диабетом. Разбираемся, как это делать, что такое кривая глюкозы и надир.',
    en: "Home blood sugar testing is your superpower in managing diabetes. Let's learn how to do it, what a glucose curve is, and what nadir means.",
  },
  contentKey: {
    ru: `## Мониторинг глюкозы дома

Если есть что-то, что делает вас настоящим суперменом для вашего котика — это домашние измерения сахара. Да, поначалу это кажется страшным. Но поверьте — это проще, чем вы думаете, и это даёт бесценную информацию.

Почему дома лучше, чем в клинике? Потому что стресс от поездки может поднять сахар до 15-17 ммоль/л даже у здоровой кошки! Дома котик спокоен, и цифры отражают реальность.

### Какой глюкометр выбрать?

#### AlphaTRAK 2 — создан для животных

- Специально откалиброван для кошек и собак
- Выбирайте **код 7 для кошек** (это важно — код влияет на точность!)
- Нужна крошечная капелька крови — 0.3-0.5 мкл
- Полоски подходят только для AlphaTRAK 2

#### Человеческий глюкометр (Contour Plus, OneTouch, Accu-Chek)

В России AlphaTRAK 2 недоступен (Zoetis ушёл с рынка). Хорошие альтернативы:
- **Contour Plus** — оптимальное качество/цена (~500-1000 руб, полоски ~600-900/50 шт)
- **OneTouch Select** — аналогичное качество
- **Сателлит Экспресс** — самый дешёвый (полоски ~400-600/50 шт), но точность ниже

**Важно:** человеческие глюкометры показывают у кошек на **10-15% ниже** реальной глюкозы. У собак разница меньше (~5-8%). Учитывайте это при интерпретации результатов!

#### FreeStyle Libre — непрерывный мониторинг

- Это человеческий прибор, но его адаптируют для кошек
- Маленький сенсор крепится на кожу (обычно на холку или бок)
- Измеряет сахар непрерывно, но с задержкой 10-15 минут и погрешностью 10-20%
- В России: ~5000-7000 руб за сенсор (14 дней). Доступен в аптеках, на Ozon/WB
- Устанавливать и интерпретировать данные лучше вместе с ветеринаром

### Как брать кровь — это проще, чем кажется

**Ушко — самый удобный способ:**
1. Согрейте ухо котика, подержав его пару секунд
2. Быстрый лёгкий укол ланцетом в краевую вену на ухе
3. Не сжимайте ухо — пусть капелька появится сама
4. Приложите полоску к капле, затем прижмите ватку к месту укола на 30 секунд

С практикой это занимает буквально минуту. Большинство кошек привыкают и даже не сопротивляются.

### Кривая глюкозы — ваша карта сахара за день

Это серия измерений в течение 12-часового цикла, которая показывает, как работает инсулин:

**Полный протокол:** 0 ч, 2 ч, 4 ч, 6 ч, 8 ч, 10 ч, 12 ч
**Минимальный (если полный не получается):** 0 ч, 4 ч, 6-8 ч, 12 ч

Не переживайте, если не всегда получается сделать полную кривую — даже минимальная даёт ветеринару ценную информацию.

### Надир — самое важное число

Надир — это **самая низкая точка** сахара в течение цикла. Именно по этому числу ветеринар решает, правильная ли доза инсулина.

**Целевой надир для кошек:** 4.0-8.0 ммоль/л (72-144 мг/дл) по ISFM 2022/2023. Низкий надир в этом диапазоне при отсутствии признаков гипогликемии — признак хорошего контроля и повышает шансы на ремиссию.

| Надир | Что это значит | Что делать |
|---|---|---|
| Ниже 3.0 ммоль/л | Гипогликемия — опасно! | Снизить дозу, позвонить врачу |
| 3.0-4.0 | Пограничная зона | Наблюдать, обсудить с врачом |
| **4.0-5.4** | **Отлично** (оптимально для ремиссии по Roomp & Rand) | Продолжать как есть |
| 5.5-8.0 | Хорошо | Доза подобрана правильно |
| 8.0-14.0 | Выше цели | Обсудить повышение дозы с врачом |
| Выше 14.0 | Контроль недостаточный | Нужна консультация ветеринара |

### Эффект Сомоджи — хитрая ловушка

Иногда случается так: сахар падает слишком низко, организм пугается и выбрасывает гормоны стресса, из-за чего сахар резко взлетает.

**Выглядит как:** «сахар очень высокий — надо увеличить дозу!»
**На самом деле:** причина — слишком МНОГО инсулина.
**Решение:** снизить дозу (не повысить!).

Вот почему самостоятельно менять дозу опасно — без полной кривой глюкозы легко попасть в эту ловушку.

### Как часто измерять?

- **Подбор дозы:** кривая каждые 1-2 недели
- **Когда всё стабильно:** кривая раз в 1-3 месяца + ежедневные проверочные измерения
- **Котик нездоров:** измерьте прямо сейчас

> Помните: дозу корректирует только ветеринар. Ваша задача — собирать данные и делиться ими. И вы отлично с этим справляетесь!`,
    en: `## Home Glucose Monitoring

If there's one thing that makes you a true superhero for your cat, it's home blood sugar monitoring. Yes, it feels scary at first. But trust us — it's easier than you think, and it provides invaluable information.

Why is home better than the clinic? Because travel stress alone can raise blood sugar to 15-17 mmol/L even in a healthy cat! At home, your kitty is calm, and the numbers reflect reality.

### Which Glucometer to Choose?

#### AlphaTRAK 2 — Built for Pets

- Specifically calibrated for cats and dogs
- Select **code 7 for cats** (this matters — the code affects accuracy!)
- Needs a tiny drop of blood — just 0.3-0.5 uL
- Strips are specific to AlphaTRAK 2

#### Human Glucometers (Contour Plus, OneTouch, Accu-Chek)

In some countries, AlphaTRAK 2 may be unavailable. Good alternatives:
- **Contour Plus** — excellent quality-to-price ratio
- **OneTouch Select** — similar quality
- **FreeStyle** — widely available

**Important:** human glucometers read **10-15% lower** than actual glucose in cats. In dogs, the difference is smaller (~5-8%). Keep this in mind when interpreting results!

#### FreeStyle Libre — Continuous Monitoring

- This is a human device adapted for cats
- A small sensor is attached to the skin (usually the scruff or flank)
- Measures blood sugar continuously, but with a 10-15 minute delay and 10-20% variance
- Best to set up and interpret results with your vet

### How to Collect Blood — It's Easier Than You Think

**The ear — the most convenient spot:**
1. Warm your cat's ear by holding it gently for a couple of seconds
2. Quick, light lancet prick on the ear's marginal vein
3. Don't squeeze — let the droplet form on its own
4. Touch the strip to the drop, then press a cotton pad against the spot for 30 seconds

With practice, this takes literally a minute. Most cats get used to it and don't even fuss.

### The Glucose Curve — Your Blood Sugar Map

This is a series of measurements over a 12-hour cycle that shows how insulin is working:

**Full protocol:** 0 h, 2 h, 4 h, 6 h, 8 h, 10 h, 12 h
**Minimal (when the full version isn't possible):** 0 h, 4 h, 6-8 h, 12 h

Don't stress if you can't always do a full curve — even a minimal one gives your vet valuable information.

### Nadir — The Most Important Number

The nadir is the **lowest blood sugar point** during the cycle. This is the number your vet uses to decide if the insulin dose is right.

**Target nadir for cats:** 4.0-8.0 mmol/L (72-144 mg/dL) per ISFM 2022/2023. A low nadir within this range, with no hypoglycemia signs, indicates good control and improves the chance of remission.

| Nadir | What It Means | What to Do |
|---|---|---|
| Below 3.0 mmol/L | Hypoglycemia — dangerous! | Reduce dose, call the vet |
| 3.0-4.0 | Borderline zone | Watch, discuss with vet |
| **4.0-5.4** | **Excellent** (optimal for remission per Roomp & Rand) | Continue as is |
| 5.5-8.0 | Good | Dose is well adjusted |
| 8.0-14.0 | Above target | Discuss dose increase with vet |
| Above 14.0 | Insufficient control | Vet consultation needed |

### The Somogyi Effect — A Tricky Trap

Sometimes this happens: blood sugar drops too low, the body panics and releases stress hormones, causing blood sugar to spike.

**It looks like:** "blood sugar is really high — we need more insulin!"
**In reality:** the cause is TOO MUCH insulin.
**The fix:** reduce the dose (not increase it!).

This is exactly why changing the dose on your own is risky — without a full glucose curve, it's easy to fall into this trap.

### How Often Should You Monitor?

- **Dose adjustment phase:** glucose curve every 1-2 weeks
- **When things are stable:** curve every 1-3 months + daily spot checks
- **Your cat seems unwell:** measure right now

> Remember: dose adjustments are always your vet's call. Your job is to collect the data and share it. And you're doing a wonderful job at that!`,
  },
  category: 'monitoring',
  readingTimeMinutes: 7,
  order: 1,
  relatedArticleIds: [
    'flexible-monitoring',
    'fructosamine',
    'glucose-curves-practice',
    'stress-hyperglycemia',
  ],
  references: [
    {
      ru: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
      en: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
    },
    {
      ru: 'Cornell Feline Health Center — Feline Diabetes, 2021',
      en: 'Cornell Feline Health Center — Feline Diabetes, 2021',
    },
  ],
  tags: [
    { ru: 'мониторинг', en: 'monitoring' },
    { ru: 'глюкоза', en: 'glucose' },
    { ru: 'кривая глюкозы', en: 'glucose curve' },
    { ru: 'надир', en: 'nadir' },
  ],
};
