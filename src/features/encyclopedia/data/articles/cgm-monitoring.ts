import { Article } from '../../types';

export const cgmMonitoring: Article = {
  id: 'cgm-monitoring',
  titleKey: {
    ru: 'Непрерывный мониторинг глюкозы (CGM): FreeStyle Libre для кошки',
    en: 'Continuous Glucose Monitoring (CGM): FreeStyle Libre for Your Cat',
  },
  summaryKey: {
    ru: 'Сенсор на 14 дней вместо уколов в ушко: как работает FreeStyle Libre у кошки, как ставить и считывать, где он врёт и кому он реально нужен.',
    en: 'A 14-day sensor instead of ear pricks: how FreeStyle Libre works on a cat, how to place and read it, where it lies, and who actually needs one.',
  },
  contentKey: {
    ru: `## Что такое CGM

CGM (continuous glucose monitoring) — это маленький сенсор, который приклеивается на кожу и **непрерывно измеряет сахар днём и ночью**, без уколов в ушко. Самый популярный у владельцев кошек — **FreeStyle Libre** (Libre 2/3). Сенсор носится до **14 дней** и показывает не отдельные точки, а всю картину: как сахар ведёт себя ночью, между кормлениями, на пике инсулина.

Важно понимать: сенсор меряет глюкозу **не в крови, а в межклеточной жидкости** под кожей. Это близко к крови, но с задержкой и своими особенностями (об этом ниже).

### Чем это лучше уколов в ушко

- **Не больно и не стрессово** — после установки кошку не нужно колоть по 5-7 раз за день
- **Видно ночь** — самый опасный провал сахара часто случается, когда все спят
- **Виден тренд** — стрелка показывает, куда идёт сахар: вверх, вниз или стабильно
- **Меньше стресс-гипергликемии** — у кошек стресс от прокола сам по себе завышает сахар, искажая кривую; сенсор снимает эту проблему

## Как ставить сенсор

Устанавливает обычно ветеринар в первый раз, дальше многие владельцы делают сами:

1. Выбривают участок на **боку грудной клетки** или между лопаток
2. Кожу очищают, дают высохнуть
3. Аппликатором «выстреливают» сенсор — тонкая нить-электрод уходит под кожу (для кошки это почти незаметно)
4. Сверху фиксируют **клеем/пластырем и попоной или носочком** — кошки любят снимать сенсоры
5. Сканируют телефоном или ридером, чтобы активировать

> **Важно:** первые **сутки после установки** показания могут «плавать» и быть неточными — это нормальный период притирки. Не меняйте дозу инсулина на основании первого дня.

### Как считывать

- Приложение (например, LibreLink) или ридер показывает **текущее число + стрелку тренда**
- Стрелка ▲ вверх — сахар растёт, ▼ вниз — падает, → стабилен
- График за сутки показывает надир (самую низкую точку) и пики

## Где сенсор врёт: важные ограничения

CGM у животных официально **не сертифицирован** — приборы созданы для людей, поэтому относитесь к цифрам как к **тренду, а не к истине в последней инстанции**.

- **Задержка 5-15 минут.** Межклеточная жидкость отстаёт от крови. Когда сахар быстро падает, сенсор показывает выше, чем в крови на самом деле — опасно недооценить гипогликемию
- **«Компрессионные» провалы.** Если кошка лежит на сенсоре, он может показать ложно низкий сахар. Ночной провал строго в позе сна — повод перепроверить глюкометром
- **Неточность на краях.** На очень низких и очень высоких значениях расхождение с кровью больше
- **Ранние отклейки.** У активных кошек сенсор часто не доживает до 14 дней

> **Золотое правило безопасности:** при **любом подозрении на гипогликемию** (шатается, вялая, дрожит, судороги) не верьте только сенсору — **перепроверьте глюкометром по крови** и действуйте немедленно. Целевые пороги сахара у кошки те же, что и при обычном мониторинге: держать в целевой зоне, не давать падать ниже ~4 ммоль/л, экстренная гипогликемия — ниже 2.8 ммоль/л.

## Кому CGM реально нужен

- **Фаза подбора дозы** — когда важно видеть надир и не пропустить провал
- **Хрупкий, нестабильный диабет** — сахар скачет непредсказуемо
- **Кошка, которую невозможно колоть в ушко** без большого стресса
- **Подозрение на эффект Сомоджи** (рикошет после ночной гипогликемии)

### Когда можно и без него

Стабильной кошке на неизменной дозе с хорошими утренними замерами постоянный сенсор не обязателен — достаточно точечных замеров и фруктозамина. CGM — мощный инструмент на сложных этапах, а не обязанность на всю жизнь.

> **Итог:** сенсор показывает картину, которую уколы в ушко не дадут, но он не отменяет глюкометр и не заменяет ветеринара. Любые изменения дозы — только вместе с врачом на основе всей картины, а не одной цифры.`,
    en: `## What CGM Is

CGM (continuous glucose monitoring) is a small sensor that sticks to the skin and **measures sugar continuously, day and night**, with no ear pricks. The most popular one among cat owners is the **FreeStyle Libre** (Libre 2/3). The sensor is worn for up to **14 days** and shows not isolated dots but the whole picture: how sugar behaves overnight, between meals, and at the insulin peak.

One thing to understand: the sensor measures glucose **not in blood but in the interstitial fluid** under the skin. That's close to blood, but with a lag and some quirks (more below).

### Why It Beats Ear Pricks

- **Painless and low-stress** — no need to prick your cat 5-7 times a day
- **You see the night** — the most dangerous sugar drop often happens while everyone's asleep
- **You see the trend** — an arrow shows where sugar is heading: up, down, or steady
- **Less stress hyperglycemia** — in cats the stress of a prick itself inflates the reading and distorts the curve; the sensor removes that problem

## How to Place a Sensor

The first one is usually placed by a vet; after that many owners do it themselves:

1. Shave a patch on the **side of the chest** or between the shoulder blades
2. Clean the skin and let it dry
3. Use the applicator to "fire" the sensor — a thin electrode filament goes under the skin (barely noticeable for a cat)
4. Secure it on top with **adhesive/tape plus a onesie or a sock** — cats love to remove sensors
5. Scan with a phone or reader to activate it

> **Important:** for the **first day after placement** readings can drift and be inaccurate — that's a normal settling-in period. Don't change the insulin dose based on day one.

### How to Read It

- The app (e.g., LibreLink) or reader shows a **current number plus a trend arrow**
- Arrow ▲ up — sugar rising, ▼ down — falling, → steady
- The 24-hour graph shows the nadir (lowest point) and the peaks

## Where the Sensor Lies: Key Limitations

CGM in animals is officially **not validated** — these devices are built for humans, so treat the numbers as a **trend, not gospel**.

- **A 5-15 minute lag.** Interstitial fluid trails blood. When sugar is dropping fast, the sensor reads higher than actual blood — dangerous to underestimate a hypo
- **"Compression" lows.** If your cat lies on the sensor, it can read falsely low. A nighttime dip that lines up exactly with a sleeping position is worth rechecking with a meter
- **Edge inaccuracy.** At very low and very high values the gap with blood is larger
- **Early peel-off.** On active cats the sensor often doesn't survive the full 14 days

> **Golden safety rule:** at **any suspicion of hypoglycemia** (wobbly, lethargic, trembling, seizures) don't trust the sensor alone — **recheck with a blood glucometer** and act immediately. The target sugar thresholds for a cat are the same as with ordinary monitoring: keep it in the target band, don't let it fall below ~4 mmol/L, and emergency hypoglycemia is below 2.8 mmol/L.

## Who Actually Needs CGM

- **The dose-adjustment phase** — when seeing the nadir and not missing a drop matters most
- **Brittle, unstable diabetes** — sugar swings unpredictably
- **A cat that can't be ear-pricked** without major stress
- **Suspected Somogyi effect** (rebound after a nighttime hypo)

### When You Can Skip It

A stable cat on an unchanged dose with good morning readings doesn't need a permanent sensor — spot checks and fructosamine are enough. CGM is a powerful tool for the hard stretches, not a lifelong obligation.

> **Bottom line:** the sensor reveals a picture ear pricks never could, but it doesn't replace a glucometer or your vet. Any dose change happens only with your vet, based on the whole picture — not a single number.`,
  },
  category: 'monitoring',
  species: 'cat',
  readingTimeMinutes: 7,
  order: 3,
  relatedArticleIds: [
    'glucose_monitoring',
    'flexible-monitoring',
    'somogyi-rebound',
    'pet-glucometer-vs-human',
    'hypoglycemia',
  ],
  references: [
    {
      ru: '2025 iCatCare Consensus Guidelines on Diabetes Mellitus in Cats (Taylor et al., JFMS 2025)',
      en: '2025 iCatCare Consensus Guidelines on Diabetes Mellitus in Cats (Taylor et al., JFMS 2025)',
    },
    {
      ru: 'Deiting V, Mischke R — Use of a flash glucose monitoring system in cats, 2021',
      en: 'Deiting V, Mischke R — Use of a flash glucose monitoring system in cats, 2021',
    },
    {
      ru: 'Cornell Feline Health Center — Feline Diabetes, 2021',
      en: 'Cornell Feline Health Center — Feline Diabetes, 2021',
    },
  ],
  tags: [
    { ru: 'CGM', en: 'CGM' },
    { ru: 'FreeStyle Libre', en: 'FreeStyle Libre' },
    { ru: 'сенсор глюкозы', en: 'glucose sensor' },
    { ru: 'мониторинг', en: 'monitoring' },
  ],
};
