import { Article } from '../../types';

export const dogCataracts: Article = {
  id: 'dog-cataracts',
  titleKey: {
    ru: 'Диабетическая катаракта у собак',
    en: 'Diabetic Cataracts in Dogs',
  },
  summaryKey: {
    ru: 'Катаракта — главное осложнение диабета у собак. Она развивается у 75–80% пациентов, часто уже в первые месяцы. Раннее обнаружение даёт больше вариантов.',
    en: 'Cataracts are the main complication of diabetes in dogs. They develop in 75–80% of patients, often within the first months. Early detection gives more options.',
  },
  contentKey: {
    ru: `# Диабетическая катаракта у собак

## Почему это происходит?

Когда глюкоза в крови повышена, избыточный сахар попадает в хрусталик глаза. Там он превращается в сорбитол (через фермент альдозоредуктазу), который тянет воду внутрь хрусталика, вызывая его набухание и помутнение.

**Факты:**
- Развивается у **75–80%** диабетических собак
- Может появиться уже через **несколько недель** после начала гипергликемии
- Часто поражает **оба глаза** одновременно
- Скорость развития не зависит от тяжести диабета — даже при хорошем контроле катаракта может прогрессировать

## На что обращать внимание

- **Помутнение зрачка** — голубоватая или белая дымка в глазу
- **Столкновение с предметами** — собака задевает мебель, особенно в незнакомой обстановке
- **Нежелание прыгать** или спускаться по лестнице
- **Покраснение глаз** — может указывать на увеит (воспаление внутри глаза), частый спутник катаракты

## Что делать?

### 1. Регулярный осмотр глаз
Проверяй глаза собаки каждый день. Если заметил помутнение — запиши к ветеринарному офтальмологу как можно скорее.

### 2. Хирургия (факоэмульсификация)
- **Единственный способ** вернуть зрение
- Успешность: **85–90%** при ранней операции
- Лучший момент: **до развития осложнений** (увеита, отслойки сетчатки)
- После операции: глазные капли 4–6 недель

### 3. Если операция невозможна
- Собаки хорошо адаптируются к слепоте, особенно в знакомой обстановке
- Не переставляй мебель
- Используй запахи и звуки как ориентиры
- Консистентность маршрутов прогулок

## Профилактика

К сожалению, полностью предотвратить диабетическую катаракту невозможно. Но **хороший контроль глюкозы** может замедлить её развитие. Чем стабильнее показатели — тем медленнее прогрессия.

**Совет:** при постановке диагноза «диабет» сразу запишитесь к ветеринарному офтальмологу для базового осмотра. Это даёт точку отсчёта для мониторинга.`,
    en: `# Diabetic Cataracts in Dogs

## Why does this happen?

When blood glucose is elevated, excess sugar enters the lens of the eye. There it's converted to sorbitol (via the enzyme aldose reductase), which draws water into the lens, causing it to swell and become cloudy.

**Facts:**
- Develops in **75–80%** of diabetic dogs
- Can appear within **just a few weeks** of hyperglycemia onset
- Often affects **both eyes** simultaneously
- Rate of development doesn't depend on diabetes severity — cataracts can progress even with good control

## What to watch for

- **Cloudy pupils** — a bluish or white haze in the eye
- **Bumping into objects** — the dog hits furniture, especially in unfamiliar settings
- **Reluctance to jump** or go down stairs
- **Red eyes** — may indicate uveitis (inflammation inside the eye), a common companion to cataracts

## What to do?

### 1. Regular eye checks
Check your dog's eyes daily. If you notice cloudiness — book a veterinary ophthalmologist appointment as soon as possible.

### 2. Surgery (phacoemulsification)
- **The only way** to restore vision
- Success rate: **85–90%** with early surgery
- Best timing: **before complications** develop (uveitis, retinal detachment)
- Post-surgery: eye drops for 4–6 weeks

### 3. If surgery isn't possible
- Dogs adapt well to blindness, especially in familiar surroundings
- Don't rearrange furniture
- Use scents and sounds as guides
- Keep walking routes consistent

## Prevention

Unfortunately, completely preventing diabetic cataracts isn't possible. But **good glucose control** can slow their development. The more stable the readings — the slower the progression.

**Tip:** when diabetes is diagnosed, book a veterinary ophthalmologist visit right away for a baseline exam. This gives a reference point for monitoring.`,
  },
  category: 'complications',
  species: 'dog',
  readingTimeMinutes: 5,
  order: 2,
  relatedArticleIds: ['dog-diabetes-basics', 'dog-insulin'],
  references: [
    {
      ru: 'Beam S et al — A retrospective-cohort study on the development of cataracts in dogs with diabetes mellitus, Vet Ophthalmol, 1999',
      en: 'Beam S et al — A retrospective-cohort study on the development of cataracts in dogs with diabetes mellitus, Vet Ophthalmol, 1999',
    },
    {
      ru: 'AAHA Diabetes Management Guidelines, 2018',
      en: 'AAHA Diabetes Management Guidelines, 2018',
    },
  ],
  tags: [
    { ru: 'катаракта', en: 'cataracts' },
    { ru: 'осложнения', en: 'complications' },
    { ru: 'глаза', en: 'eyes' },
    { ru: 'хирургия', en: 'surgery' },
  ],
};
