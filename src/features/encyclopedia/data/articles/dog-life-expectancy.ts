import { Article } from '../../types';

export const dogLifeExpectancy: Article = {
  id: 'dog-life-expectancy',
  titleKey: {
    ru: 'Диабет у собаки — это приговор? Сколько живут',
    en: 'Is Canine Diabetes a Death Sentence? How Long Dogs Live',
  },
  summaryKey: {
    ru: 'Короткий ответ: нет. Собаки с диабетом при лечении живут полноценной жизнью столько же, сколько здоровые. Честно о прогнозе и первых неделях.',
    en: 'The short answer: no. With treatment, diabetic dogs live full lives as long as healthy dogs. An honest look at prognosis and those first weeks.',
  },
  contentKey: {
    ru: `## Диабет у собаки — это приговор?

Сразу главное: **нет, не приговор.** Собачий диабет — пожизненный, но управляемый. При лечении собаки живут полноценной, счастливой жизнью, и продолжительность её сопоставима со здоровыми собаками того же возраста.

### Сколько живут собаки с диабетом?

Честно: единой «цифры» нет — многое решают первые недели и сопутствующие болезни. Но картина обнадёживающая:

- **Первые месяцы — самые уязвимые.** Именно в это время случаются кетоацидоз, тяжёлые инфекции, осложнения. Их переживают — и дальше выходят на плато
- Собаки, которые **стабилизировались в первые 3–6 месяцев**, дальше живут годами
- Сам диабет при контроле **не укорачивает жизнь** — на неё влияют возраст и другие болезни

> **Важно знать:** прогноз у собак сильно зависит от того, как пройдёт стартовый период. Ранняя диагностика, быстрый подбор дозы и недопущение кетоацидоза — вот что реально двигает статистику в вашу пользу.

### Чем собаки отличаются от кошек

- У собак диабет почти всегда **1 типа** — инсулин нужен пожизненно
- **Ремиссия у собак редка** (в отличие от кошек) — не ждите отмены инсулина как цели
- Зато собаки хорошо предсказуемы: стабильная рутина даёт стабильный сахар
- **Катаракта** — очень частый спутник (развивается у 75–80% собак, часто уже в течение 1–2 лет), но она не смертельна и часто оперируется

### От чего зависит прогноз

- **Ранний старт лечения** и недопущение кетоацидоза
- **Стерилизация суки** — у нестерилизованных сук гормоны ломают контроль (об этом отдельная статья)
- **Стабильность** — одинаковые еда, прогулки, время инсулина
- **Контроль сопутствующих болезней** — панкреатит, инфекции, гормональные нарушения
- **Домашний мониторинг** — раннее обнаружение проблем

### Что это значит для вас

- Первые недели — самые важные: держитесь плана и связи с ветеринаром
- Пережив старт и выйдя на стабильную дозу, вы получаете годы обычной жизни
- Катаракта пугает, но это не про «конец» — слепая собака с диабетом живёт счастливо, ориентируясь по нюху и слуху

**Диабет — это режим, а не приговор. Вы и ваша собака привыкнете к нему быстрее, чем думаете.**`,
    en: `## Is Diabetes a Death Sentence for a Dog?

Let's lead with what matters: **no, it isn't.** Canine diabetes is lifelong but manageable. With treatment, dogs live full, happy lives, and their life expectancy is comparable to healthy dogs of the same age.

### How Long Do Diabetic Dogs Live?

Honestly: there's no single "number" — much is decided by the first weeks and by concurrent illnesses. But the picture is encouraging:

- **The first months are the most vulnerable.** This is when ketoacidosis, serious infections, and complications tend to strike. Dogs get through them — and then level off onto a plateau
- Dogs that **stabilize in the first 3–6 months** go on to live for years
- Diabetes itself, when controlled, **doesn't shorten life** — age and other diseases do

> **Good to know:** in dogs, prognosis depends heavily on how that opening stretch goes. Early diagnosis, prompt dose adjustment, and preventing ketoacidosis are what genuinely tilt the odds in your favor.

### How Dogs Differ From Cats

- In dogs, diabetes is almost always **type 1** — insulin is needed for life
- **Remission is rare in dogs** (unlike cats) — don't set stopping insulin as the goal
- On the plus side, dogs are predictable: a steady routine gives steady blood sugar
- **Cataracts** are a very common companion (develop in 75–80% of dogs, often within 1–2 years), but they aren't fatal and are often operable

### What Affects the Prognosis

- **Early treatment** and avoiding ketoacidosis
- **Spaying females** — in intact females, hormones wreck control (see the dedicated article)
- **Consistency** — same food, walks, and insulin timing
- **Managing concurrent disease** — pancreatitis, infections, hormonal disorders
- **Home monitoring** — catching problems early

### What This Means for You

- The first weeks matter most: stick to the plan and stay in touch with your vet
- Once you're through the start and on a stable dose, you get years of ordinary life
- Cataracts are scary, but they're not "the end" — a blind diabetic dog lives happily, navigating by smell and hearing

**Diabetes is a routine, not a death sentence. You and your dog will adjust to it faster than you expect.**`,
  },
  category: 'basics',
  readingTimeMinutes: 5,
  order: 2,
  species: 'dog',
  relatedArticleIds: [
    'dog-diabetes-basics',
    'dog-cataracts',
    'dog-first-days',
    'dog-spay-diestrus',
  ],
  references: [
    {
      ru: 'AAHA Diabetes Management Guidelines for Dogs and Cats, 2018',
      en: 'AAHA Diabetes Management Guidelines for Dogs and Cats, 2018',
    },
    {
      ru: 'Tardo A et al — Survival estimates and outcome predictors in dogs with newly diagnosed diabetes mellitus, Veterinary Record, 2019',
      en: 'Tardo A et al — Survival estimates and outcome predictors in dogs with newly diagnosed diabetes mellitus, Veterinary Record, 2019',
    },
  ],
  tags: [
    { ru: 'приговор', en: 'death sentence' },
    { ru: 'сколько живут', en: 'life expectancy' },
    { ru: 'прогноз', en: 'prognosis' },
    { ru: 'собака', en: 'dog' },
  ],
};
