import { Article } from '../../types';

export const dogFructosamine: Article = {
  id: 'dog-fructosamine',
  titleKey: {
    ru: 'Фруктозамин у собак: контроль за 2-3 недели',
    en: 'Fructosamine in Dogs: 2-3 Week Control Marker',
  },
  summaryKey: {
    ru: 'Фруктозамин показывает «среднюю картину» сахара за последние 2-3 недели. Полезный помощник для вас и ветеринара.',
    en: 'Fructosamine shows the "big picture" of blood sugar over the past 2-3 weeks. A helpful ally for you and your vet.',
  },
  contentKey: {
    ru: `# Фруктозамин у собак

Каждое измерение сахара — это фотография одного момента. Фруктозамин — видеозапись за последние 2-3 недели. Он показывает, насколько хорошо контролируется диабет в целом.

## Что это такое

Когда сахар в крови высокий, он «прилипает» к белкам крови (в основном к альбумину). Чем выше был сахар за 2-3 недели, тем больше таких «сладких» белков. Это и есть фруктозамин — «дневник сахара» вашей собаки за последние 2-3 недели.

## Зачем он у собак, если стресс почти не мешает замерам?

У кошек фруктозамин особенно важен, потому что стресс в клинике сильно завышает разовую глюкозу. У собак стрессовая гипергликемия выражена слабо, поэтому разовые замеры надёжнее. Но фруктозамин всё равно ценен: он усредняет и хорошие, и плохие дни, и показывает общий тренд, который не виден по одному замеру.

## Что означают цифры

Референсные интервалы **зависят от лаборатории** — всегда сверяйтесь с бланком вашей лаборатории. Ориентировочно:

| Значение (мкмоль/л) | Что значит |
|---|---|
| 225-365 | Норма у здоровой собаки |
| 350-450 | Хороший контроль диабета |
| 450-550 | Субоптимально — обсудите с ветеринаром |
| Выше 550 | Контроль недостаточный, нужна коррекция |

## Когда цифры могут обмануть

Фруктозамин может быть **ложно занижен** при низком альбумине (болезни печени, почек, потеря белка). И **ложно завышен** при гипотиреозе — частой у собак болезни. Поэтому врач всегда смотрит фруктозамин вместе с домашними замерами и симптомами.

## Когда сдавать

- **При диагнозе** — подтвердить стойкую гипергликемию
- **Подбор дозы** — каждые 2-4 недели
- **Стабильное состояние** — каждые 3-6 месяцев
- **Резкая потеря контроля** — для объективной оценки

> Фруктозамин — не замена домашним замерам и кривым, а дополнение к ним. Вместе они дают полную картину.`,
    en: `# Fructosamine in Dogs

Each blood sugar reading is a snapshot of one moment. Fructosamine is a video of the past 2-3 weeks. It shows how well diabetes is controlled overall.

## What it is

When blood sugar is high, it "sticks" to blood proteins (mainly albumin). The higher blood sugar has been over 2-3 weeks, the more of these "sugar-coated" proteins form. That's fructosamine — your dog's "blood sugar diary" for the last 2-3 weeks.

## Why it matters in dogs, if stress barely affects readings?

In cats, fructosamine is especially important because clinic stress greatly inflates a single glucose reading. In dogs, stress hyperglycemia is mild, so spot readings are more reliable. But fructosamine is still valuable: it averages both good and bad days and shows an overall trend a single reading can't.

## What the numbers mean

Reference ranges are **lab-dependent** — always check your lab's report. As a rough guide:

| Value (umol/L) | What it means |
|---|---|
| 225-365 | Normal in a healthy dog |
| 350-450 | Good diabetic control |
| 450-550 | Suboptimal — discuss with your vet |
| Above 550 | Insufficient control, adjustment needed |

## When the numbers can mislead

Fructosamine can be **falsely low** with low albumin (liver, kidney, or protein-losing disease). And **falsely high** with hypothyroidism — a common canine condition. So your vet always reads fructosamine alongside home readings and symptoms.

## When to test

- **At diagnosis** — to confirm persistent hyperglycemia
- **Dose adjustment** — every 2-4 weeks
- **Stable** — every 3-6 months
- **Sudden loss of control** — for an objective picture

> Fructosamine isn't a replacement for home readings and curves, but a complement. Together they give the full picture.`,
  },
  category: 'monitoring',
  species: 'dog',
  readingTimeMinutes: 5,
  order: 2,
  relatedArticleIds: ['dog-glucose-monitoring', 'dog-glucose-curves', 'dog-comorbidities'],
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
    { ru: 'фруктозамин', en: 'fructosamine' },
    { ru: 'мониторинг', en: 'monitoring' },
    { ru: 'анализ крови', en: 'blood test' },
    { ru: 'гликемический контроль', en: 'glycemic control' },
  ],
};
