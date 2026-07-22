import { Article } from '../../types';

export const dogCgmMonitoring: Article = {
  id: 'dog-cgm-monitoring',
  titleKey: {
    ru: 'Непрерывный мониторинг глюкозы (CGM): FreeStyle Libre для собаки',
    en: 'Continuous Glucose Monitoring (CGM): FreeStyle Libre for Your Dog',
  },
  summaryKey: {
    ru: 'Сенсор на 14 дней вместо проколов уха: как работает FreeStyle Libre у собаки, как ставить и считывать, где он врёт и кому он реально нужен.',
    en: 'A 14-day sensor instead of ear pricks: how FreeStyle Libre works on a dog, how to place and read it, where it lies, and who actually needs one.',
  },
  contentKey: {
    ru: `## Что такое CGM

CGM (continuous glucose monitoring) — маленький сенсор, который клеится на кожу и **непрерывно измеряет сахар днём и ночью**, без проколов уха или губы. У владельцев собак популярнее всего **FreeStyle Libre** (Libre 2/3). Сенсор носится до **14 дней** и показывает не отдельные точки, а всю картину: как сахар ведёт себя ночью, между кормлениями, на пике инсулина.

Сенсор меряет глюкозу **не в крови, а в межклеточной жидкости** под кожей — это близко к крови, но с задержкой и особенностями (об этом ниже).

### Чем это лучше проколов

- **Не больно и не стрессово** — собаку не нужно колоть по 5-7 раз за день ради кривой
- **Видно ночь** — самый опасный провал сахара часто случается во сне
- **Виден тренд** — стрелка показывает, куда идёт сахар: вверх, вниз или стабильно
- **Полная кривая без визита** — не нужно везти собаку в клинику на весь день

У собак есть приятный бонус: **стресс почти не завышает сахар** (в отличие от кошек), поэтому и обычные кривые у них надёжны — но сенсор всё равно удобнее и показывает ночь.

## Как ставить сенсор

Первый раз обычно ставит ветеринар, дальше многие владельцы делают сами:

1. Выбривают участок на **боку грудной клетки** или между лопаток (у собак с густой шерстью это особенно важно для сцепления)
2. Кожу очищают, дают высохнуть
3. Аппликатором «выстреливают» сенсор — тонкая нить-электрод уходит под кожу
4. Сверху фиксируют **клеем/пластырем**, часто добавляют **попону или бандаж** — чтобы собака не сорвала и не разлизала
5. Сканируют телефоном или ридером для активации

> **Важно:** первые **сутки после установки** показания могут «плавать» — это нормальный период притирки. Не меняйте дозу инсулина по первому дню. Крупные и активные собаки чаще срывают сенсоры — следите, чтобы пёс не тёрся боком о мебель.

### Как считывать

- Приложение (например, LibreLink) или ридер показывает **текущее число + стрелку тренда**
- Стрелка ▲ вверх — сахар растёт, ▼ вниз — падает, → стабилен
- Суточный график показывает надир (самую низкую точку) и пики

## Где сенсор врёт: важные ограничения

CGM у животных официально **не сертифицирован** — приборы созданы для людей. Относитесь к цифрам как к **тренду, а не абсолютной истине**.

- **Задержка 5-15 минут.** Межклеточная жидкость отстаёт от крови. При быстром падении сахара сенсор показывает выше, чем в крови — опасно недооценить гипогликемию
- **«Компрессионные» провалы.** Если собака лежит на сенсоре, он может показать ложно низкий сахар. Ночной провал строго в позе сна — повод перепроверить глюкометром
- **Неточность на краях.** На очень низких и очень высоких значениях расхождение с кровью больше
- **Ранние отклейки.** У активных собак сенсор часто не доживает до 14 дней

> **Золотое правило безопасности:** при **любом подозрении на гипогликемию** (шатается, вялый, дрожит, дезориентация, судороги) не верьте только сенсору — **перепроверьте глюкометром по крови** и действуйте немедленно. Целевые пороги у собаки те же, что при обычном мониторинге: целевой надир примерно **5-9 ммоль/л**, не давать падать ниже ~4-5, экстренная гипогликемия — ниже 2.8 ммоль/л.

## Кому CGM реально нужен

- **Фаза подбора дозы** — когда важно видеть надир и не пропустить провал
- **Хрупкий, нестабильный диабет** — сахар скачет непредсказуемо
- **Собака, которую тяжело колоть для кривой** без стресса для всех
- **Подозрение на эффект Сомоджи** (рикошет после ночной гипогликемии)

### Когда можно и без него

Стабильной собаке на неизменной дозе с хорошими утренними замерами постоянный сенсор не обязателен — достаточно точечных замеров, периодических кривых и фруктозамина. CGM — мощный инструмент на сложных этапах, а не пожизненная обязанность.

> **Итог:** сенсор показывает картину, которую проколы уха не дадут, но он не отменяет глюкометр и не заменяет ветеринара. Любые изменения дозы — только вместе с врачом на основе всей картины, а не одной цифры.`,
    en: `## What CGM Is

CGM (continuous glucose monitoring) is a small sensor that sticks to the skin and **measures sugar continuously, day and night**, with no ear or lip pricks. Among dog owners the most popular is the **FreeStyle Libre** (Libre 2/3). The sensor is worn for up to **14 days** and shows not isolated dots but the whole picture: how sugar behaves overnight, between meals, and at the insulin peak.

The sensor measures glucose **not in blood but in the interstitial fluid** under the skin — close to blood, but with a lag and some quirks (more below).

### Why It Beats Pricks

- **Painless and low-stress** — no pricking your dog 5-7 times a day for a curve
- **You see the night** — the most dangerous sugar drop often happens during sleep
- **You see the trend** — an arrow shows where sugar is heading: up, down, or steady
- **A full curve without a visit** — no need to leave your dog at the clinic all day

Dogs get a bonus: **stress barely inflates their sugar** (unlike cats), so ordinary curves are reliable in dogs too — but a sensor is still more convenient and shows the night.

## How to Place a Sensor

The first one is usually placed by a vet; after that many owners do it themselves:

1. Shave a patch on the **side of the chest** or between the shoulder blades (especially important for thick-coated dogs so it sticks)
2. Clean the skin and let it dry
3. Use the applicator to "fire" the sensor — a thin electrode filament goes under the skin
4. Secure it on top with **adhesive/tape**, often add a **onesie or wrap** — so the dog can't tear or lick it off
5. Scan with a phone or reader to activate it

> **Important:** for the **first day after placement** readings can drift — that's a normal settling-in period. Don't change the insulin dose based on day one. Large, active dogs pull sensors off more often — keep your dog from rubbing that side against furniture.

### How to Read It

- The app (e.g., LibreLink) or reader shows a **current number plus a trend arrow**
- Arrow ▲ up — sugar rising, ▼ down — falling, → steady
- The 24-hour graph shows the nadir (lowest point) and the peaks

## Where the Sensor Lies: Key Limitations

CGM in animals is officially **not validated** — these devices are built for humans. Treat the numbers as a **trend, not absolute truth**.

- **A 5-15 minute lag.** Interstitial fluid trails blood. When sugar drops fast, the sensor reads higher than actual blood — dangerous to underestimate a hypo
- **"Compression" lows.** If your dog lies on the sensor, it can read falsely low. A nighttime dip that lines up exactly with a sleeping position is worth rechecking with a meter
- **Edge inaccuracy.** At very low and very high values the gap with blood is larger
- **Early peel-off.** On active dogs the sensor often doesn't survive the full 14 days

> **Golden safety rule:** at **any suspicion of hypoglycemia** (wobbly, lethargic, trembling, disoriented, seizures) don't trust the sensor alone — **recheck with a blood glucometer** and act immediately. The targets for a dog are the same as with ordinary monitoring: a target nadir of roughly **5-9 mmol/L**, don't let it fall below ~4-5, and emergency hypoglycemia is below 2.8 mmol/L.

## Who Actually Needs CGM

- **The dose-adjustment phase** — when seeing the nadir and not missing a drop matters most
- **Brittle, unstable diabetes** — sugar swings unpredictably
- **A dog that's hard to prick for a curve** without stress for everyone
- **Suspected Somogyi effect** (rebound after a nighttime hypo)

### When You Can Skip It

A stable dog on an unchanged dose with good morning readings doesn't need a permanent sensor — spot checks, periodic curves, and fructosamine are enough. CGM is a powerful tool for the hard stretches, not a lifelong obligation.

> **Bottom line:** the sensor reveals a picture ear pricks never could, but it doesn't replace a glucometer or your vet. Any dose change happens only with your vet, based on the whole picture — not a single number.`,
  },
  category: 'monitoring',
  species: 'dog',
  readingTimeMinutes: 7,
  order: 3,
  relatedArticleIds: [
    'dog-glucose-monitoring',
    'dog-glucose-curves',
    'somogyi-rebound',
    'pet-glucometer-vs-human',
    'dog-hypoglycemia',
  ],
  references: [
    {
      ru: 'AAHA Diabetes Management Guidelines for Dogs and Cats, 2018',
      en: 'AAHA Diabetes Management Guidelines for Dogs and Cats, 2018',
    },
    {
      ru: 'Corradini S et al. — Accuracy of a flash glucose monitoring system in diabetic dogs, JVIM 2016',
      en: 'Corradini S et al. — Accuracy of a flash glucose monitoring system in diabetic dogs, JVIM 2016',
    },
    {
      ru: 'Feldman EC, Nelson RW — Canine and Feline Endocrinology, 4th ed., 2015',
      en: 'Feldman EC, Nelson RW — Canine and Feline Endocrinology, 4th ed., 2015',
    },
  ],
  tags: [
    { ru: 'CGM', en: 'CGM' },
    { ru: 'FreeStyle Libre', en: 'FreeStyle Libre' },
    { ru: 'сенсор глюкозы', en: 'glucose sensor' },
    { ru: 'мониторинг', en: 'monitoring' },
  ],
};
