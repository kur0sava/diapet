import { Article } from '../../types';

export const fructosamine: Article = {
  id: 'fructosamine',
  titleKey: {
    ru: 'Фруктозамин: контроль за 2-3 недели',
    en: 'Fructosamine: 2-3 Week Control Marker',
  },
  summaryKey: {
    ru: 'Фруктозамин — это анализ, который показывает «среднюю картину» сахара за последние 2-3 недели. Полезный помощник для вас и вашего ветеринара.',
    en: 'Fructosamine is a test that shows the "big picture" of blood sugar over the past 2-3 weeks. A helpful ally for you and your vet.',
  },
  contentKey: {
    ru: `## Фруктозамин: долгосрочный контроль диабета

Представьте, что каждое измерение сахара — это фотография одного момента. А фруктозамин — это видеозапись за последние 2-3 недели. Он показывает общую картину: как хорошо контролируется диабет в целом.

### Что такое фруктозамин?

Когда сахар в крови высокий, он «прилипает» к белкам крови (в основном к альбумину). Чем выше был сахар последние 2-3 недели, тем больше таких «сладких» белков образуется. Вот это и есть фруктозамин.

Простыми словами: фруктозамин — это «дневник сахара» вашего котика за последние 2-3 недели.

### Почему не гликированный гемоглобин (HbA1c), как у людей?

Хороший вопрос! У кошек красные клетки крови живут около 70 дней (у людей — 120), и реакция гемоглобина с сахаром другая. Поэтому HbA1c у кошек неинформативен. Для кошек стандарт — именно **фруктозамин**.

### Что означают цифры?

| Значение (мкмоль/л) | Что это значит |
|---|---|
| 170-340 | Норма для здоровой кошки |
| 340-450 | Хороший контроль диабета — вы молодец! |
| 450-550 | Субоптимально — есть куда стремиться, обсудите с ветеринаром |
| Выше 550 | Контроль недостаточный — нужна коррекция терапии |
| Выше 700 | Серьёзная ситуация — высокий риск осложнений |

### Когда цифры могут обмануть

Иногда фруктозамин может быть **ложно занижен** — то есть показывать лучшую картину, чем есть на самом деле. Это случается при:
- Проблемах с печенью или почками (мало альбумина в крови)
- Гиперактивной щитовидной железе (гипертиреоз — частая проблема у пожилых кошек)
- Если проба крови была повреждена при заборе

Поэтому ветеринар всегда смотрит на фруктозамин вместе с другими данными — домашними измерениями, симптомами, общим самочувствием.

### Когда сдавать анализ?

- **При постановке диагноза:** помогает подтвердить, что высокий сахар — это не просто стресс
- **Подбор дозы:** каждые 4-6 недель — чтобы видеть, работает ли лечение
- **Когда всё стабильно:** каждые 3-6 месяцев — для спокойствия
- **Подозрение на ремиссию или ухудшение:** для объективной оценки

### Фруктозамин и ремиссия

Когда кошка входит в ремиссию, фруктозамин возвращается в норму (170-340 мкмоль/л). А если у кошки в ремиссии фруктозамин начинает расти выше 450 — это может быть ранний сигнал, что диабет возвращается. Часто это видно ещё до появления симптомов!

> Продолжайте проверять фруктозамин каждые 3-6 месяцев даже в ремиссии. Это маленький анализ крови, который даёт большое спокойствие.`,
    en: `## Fructosamine: Long-Term Diabetes Control

Imagine that each blood sugar reading is a photograph of one single moment. Fructosamine, on the other hand, is like a video recording of the past 2-3 weeks. It shows the bigger picture: how well diabetes is being controlled overall.

### What Is Fructosamine?

When blood sugar is high, it "sticks" to blood proteins (mainly albumin). The higher blood sugar has been over the past 2-3 weeks, the more of these "sugar-coated" proteins form. That's fructosamine.

In simple terms: fructosamine is your cat's "blood sugar diary" for the last 2-3 weeks.

### Why Not HbA1c Like in Humans?

Great question! In cats, red blood cells only live about 70 days (compared to 120 in humans), and the way hemoglobin reacts with sugar is different. So HbA1c just doesn't work well for cats. The standard for cats is **fructosamine**.

### What Do the Numbers Mean?

| Value (umol/L) | What It Means |
|---|---|
| 170-340 | Normal for a healthy cat |
| 340-450 | Good diabetic control — nice work! |
| 450-550 | Suboptimal — room for improvement, discuss with your vet |
| Above 550 | Control is lacking — therapy adjustment needed |
| Above 700 | Serious situation — high risk of complications |

### When the Numbers Can Be Misleading

Sometimes fructosamine can be **falsely low** — meaning it paints a rosier picture than reality. This happens with:
- Liver or kidney problems (low albumin in the blood)
- Overactive thyroid (hyperthyroidism — common in older cats)
- A damaged blood sample

That's why your vet always looks at fructosamine alongside other data — home measurements, symptoms, and how your cat is doing overall.

### When to Get Tested?

- **At diagnosis:** helps confirm that high blood sugar isn't just from stress
- **Dose adjustment phase:** every 4-6 weeks — to see if treatment is working
- **When things are stable:** every 3-6 months — for peace of mind
- **Suspected remission or worsening:** for an objective picture

### Fructosamine and Remission

When a cat goes into remission, fructosamine returns to the healthy range (170-340 umol/L). And if fructosamine starts climbing above 450 in a cat that's in remission — it could be an early warning that diabetes is returning. Often this shows up before any symptoms do!

> Keep checking fructosamine every 3-6 months even during remission. It's a small blood test that gives great peace of mind.`,
  },
  category: 'monitoring',
  readingTimeMinutes: 5,
  order: 2,
  species: 'cat',
  relatedArticleIds: ['glucose_monitoring', 'flexible-monitoring', 'stress-hyperglycemia'],
  references: [
    {
      ru: 'Reusch CE et al — Fructosamine in cats with diabetes mellitus, JVIM 1993',
      en: 'Reusch CE et al — Fructosamine in cats with diabetes mellitus, JVIM 1993',
    },
    {
      ru: '2025 iCatCare Consensus Guidelines on Diabetes Mellitus in Cats (Taylor et al., JFMS 2025)',
      en: '2025 iCatCare Consensus Guidelines on Diabetes Mellitus in Cats (Taylor et al., JFMS 2025)',
    },
  ],
  tags: [
    { ru: 'фруктозамин', en: 'fructosamine' },
    { ru: 'мониторинг', en: 'monitoring' },
    { ru: 'анализ крови', en: 'blood test' },
    { ru: 'гликемический контроль', en: 'glycemic control' },
  ],
};
