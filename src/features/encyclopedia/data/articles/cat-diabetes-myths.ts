import { Article } from '../../types';

export const catDiabetesMyths: Article = {
  id: 'cat-diabetes-myths',
  titleKey: {
    ru: 'Мифы о диабете у кошек: что правда, а что нет',
    en: "Feline Diabetes Myths: What's True and What's Not",
  },
  summaryKey: {
    ru: 'Вокруг диабета много страшных мифов, которые пугают сильнее самой болезни. Разбираем самые частые заблуждения спокойно и по делу.',
    en: "Diabetes is surrounded by scary myths that frighten owners more than the disease itself. Let's calmly sort the most common misconceptions from fact.",
  },
  contentKey: {
    ru: `## Мифы о диабете у кошек

Много страха вокруг диабета — от мифов, а не от самой болезни. Разберём самые частые, чтобы вам стало спокойнее и понятнее.

### Миф 1: «Диабет — это конец, кошку скоро не станет»

**Неправда.** При лечении кошки с диабетом живут годами с нормальным качеством жизни. Опасны не будни с инсулином, а отсутствие лечения. Диабет — управляемое состояние.

### Миф 2: «Инсулин — это мучение, кошка будет страдать от уколов»

**Неправда.** Инсулиновая игла очень тонкая, укол в складку кожи большинство кошек почти не чувствуют. Через пару недель это станет 10-секундной рутиной, и многие кошки спокойно едят во время инъекции.

### Миф 3: «Раз назначили инсулин — это навсегда»

**Не всегда.** У кошек часто бывает **ремиссия**: при раннем лечении, низкоуглеводной диете и хорошем контроле часть кошек перестаёт нуждаться в инсулине. У собак это редко, а вот у кошек — вполне реально.

### Миф 4: «Специальный корм необязателен, лишь бы колоть инсулин»

**Неправда.** Диета — половина лечения. Низкоуглеводный влажный корм резко снижает скачки сахара и повышает шанс на ремиссию. Инсулин без правильной еды работает хуже.

### Миф 5: «Можно давать человеческие таблетки от диабета»

**Опасное заблуждение.** Человеческие сахароснижающие таблетки кошкам, как правило, не подходят и могут навредить. Любые препараты — только по назначению ветеринара.

> **Важно знать:** «мёд от диабета» — тоже миф в обычной жизни. Сладкое НЕ лечит диабет. Мёд/сироп нужен ТОЛЬКО как экстренная помощь при **гипогликемии** (слишком низком сахаре) — это противоположная ситуация. В остальное время сладкое кошке с диабетом противопоказано.

### Миф 6: «Диабет заразен для других животных и людей»

**Неправда.** Диабет не передаётся — ни другим кошкам, ни собакам, ни людям. Это обменное заболевание, а не инфекция.

### Миф 7: «Домашний глюкометр не нужен — всё сделает клиника»

**Устаревший подход.** Домашний мониторинг — золотой стандарт: он ловит гипогликемию вовремя и убирает искажения от стресса в клинике. Это безопаснее и дешевле в долгую.

### Что из этого правда

- Диабет требует режима — это правда
- Инсулин и еда должны быть регулярными — правда
- Гипогликемия опасна и требует знаний — правда, поэтому про неё есть отдельная статья

**Знание разгоняет страх. Чем больше вы понимаете, тем спокойнее вам и вашей кошке.**`,
    en: `## Feline Diabetes Myths

A lot of the fear around diabetes comes from myths, not from the disease itself. Let's clear up the most common ones so things feel calmer and clearer.

### Myth 1: "Diabetes is the end — my cat won't be around long"

**False.** With treatment, diabetic cats live for years with normal quality of life. The danger isn't the daily insulin routine — it's a lack of treatment. Diabetes is a manageable condition.

### Myth 2: "Insulin is torture — my cat will suffer from the shots"

**False.** The insulin needle is very thin, and most cats barely feel a shot into a fold of skin. Within a couple of weeks it becomes a 10-second routine, and many cats happily eat right through the injection.

### Myth 3: "Once they're on insulin, it's forever"

**Not always.** Cats often achieve **remission**: with early treatment, a low-carb diet, and good control, some cats stop needing insulin. It's rare in dogs — but in cats it's genuinely realistic.

### Myth 4: "Special food is optional as long as I give insulin"

**False.** Diet is half the treatment. Low-carbohydrate wet food sharply reduces glucose spikes and raises the odds of remission. Insulin works worse without the right food.

### Myth 5: "I can give human diabetes pills"

**A dangerous misconception.** Human oral hypoglycemic drugs generally aren't suitable for cats and can cause harm. Any medication should be given only as prescribed by your vet.

> **Good to know:** "honey cures diabetes" is a myth in everyday life too. Sweets do NOT treat diabetes. Honey or syrup is only for emergency treatment of **hypoglycemia** (blood sugar that's too low) — the opposite situation. The rest of the time, sweets are off-limits for a diabetic cat.

### Myth 6: "Diabetes is contagious to other pets and people"

**False.** Diabetes isn't transmissible — not to other cats, dogs, or humans. It's a metabolic disease, not an infection.

### Myth 7: "I don't need a home glucometer — the clinic handles it"

**Outdated thinking.** Home monitoring is the gold standard: it catches hypoglycemia in time and removes the distortion of clinic stress. It's safer and cheaper in the long run.

### What's Actually True

- Diabetes requires a routine — true
- Insulin and food need to be consistent — true
- Hypoglycemia is dangerous and calls for know-how — true, which is why it has its own article

**Knowledge burns off fear. The more you understand, the calmer it gets for both you and your cat.**`,
  },
  category: 'basics',
  readingTimeMinutes: 5,
  order: 4,
  species: 'cat',
  relatedArticleIds: ['what-is-diabetes', 'remission', 'hypoglycemia', 'common-mistakes'],
  references: [
    {
      ru: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
      en: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
    },
    {
      ru: 'Cornell Feline Health Center — Feline Diabetes',
      en: 'Cornell Feline Health Center — Feline Diabetes',
    },
  ],
  tags: [
    { ru: 'мифы', en: 'myths' },
    { ru: 'заблуждения', en: 'misconceptions' },
    { ru: 'правда о диабете', en: 'diabetes facts' },
    { ru: 'инсулин', en: 'insulin' },
  ],
};
