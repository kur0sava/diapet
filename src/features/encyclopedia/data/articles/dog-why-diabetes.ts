import { Article } from '../../types';

export const dogWhyDiabetes: Article = {
  id: 'dog-why-diabetes',
  titleKey: {
    ru: 'Почему моя собака заболела диабетом?',
    en: 'Why Did My Dog Get Diabetes?',
  },
  summaryKey: {
    ru: 'Многие винят себя за диагноз. Разбираем настоящие причины диабета у собак — гены, гормоны, поджелудочную — и почему это почти никогда не вина хозяина.',
    en: "Many owners blame themselves for the diagnosis. Here are the real causes of canine diabetes — genes, hormones, the pancreas — and why it is almost never the owner's fault.",
  },
  contentKey: {
    ru: `## Почему это случилось с моей собакой?

Первый вопрос многих владельцев — **«Я что-то сделал не так?»** Давайте честно: у собак диабет почти всегда связан с причинами, которые **от хозяина не зависели**. Это не про перекорм и не про «плохой уход».

### Что происходит у собак

В отличие от кошек, у собак почти всегда **диабет 1 типа**: иммунная система или воспаление разрушают бета-клетки поджелудочной железы, и та перестаёт вырабатывать инсулин. Клетки погибают безвозвратно — поэтому инсулин нужен пожизненно, а ремиссия редка.

### Главные причины и факторы риска

- **Генетическая предрасположенность.** Самоеды, тибетские и керн-терьеры, миниатюрные шнауцеры, пудели, бишон фризе болеют чаще
- **Аутоиммунное разрушение** бета-клеток — организм «атакует сам себя», это не следствие питания
- **Хронический или острый панкреатит** — воспаление поджелудочной, частая причина у собак
- **Половые гормоны у нестерилизованных сук** — прогестерон после течки вызывает инсулинорезистентность (диэструс-диабет)
- **Синдром Кушинга** и другие гормональные болезни
- **Стероидные препараты** — назначенные по показаниям при других болезнях
- **Возраст** — чаще всего 7–9 лет

### Что здесь точно НЕ ваша вина

- **Гены и порода** — вы их не выбирали
- **Аутоиммунный процесс** невозможно было предвидеть или предотвратить
- **Панкреатит и Кушинг** могли протекать скрыто
- **Стероиды** были нужны для лечения другой болезни

> **Важно знать:** у собак ожирение играет гораздо меньшую роль, чем у кошек. Собачий диабет 1 типа — это в основном про поджелудочную и гормоны, а не про лишний вес. Так что «я его перекормил» — почти всегда ложное самообвинение.

### На что вы реально можете влиять — дальше

Причину не отменить, но течение — в ваших руках:

- **Стерилизация суки** — критически важна, если собака не стерилизована (отдельная статья)
- **Стабильная диета** и режим кормления
- **Регулярный инсулин и мониторинг**
- **Контроль сопутствующих болезней** вместе с ветеринаром

### Главное

Диабет у собаки — это чаще всего сбой поджелудочной и гормонов, а не следствие вашей заботы. Самобичевание не поможет собаке — а стабильная рутина поможет.

**Правильный вопрос не «кто виноват», а «что делать дальше». И вы уже начали на него отвечать.**`,
    en: `## Why Did This Happen to My Dog?

Many owners' first question is **"Did I do something wrong?"** Let's be honest: in dogs, diabetes is almost always tied to causes that were **out of the owner's hands**. It's not about overfeeding or "bad care."

### What's Going On in Dogs

Unlike cats, dogs almost always have **type 1 diabetes**: the immune system or inflammation destroys the pancreatic beta cells, and the pancreas stops making insulin. Those cells are lost for good — which is why insulin is lifelong and remission is rare.

### The Main Causes and Risk Factors

- **Genetic predisposition.** Samoyeds, Tibetan and Cairn Terriers, Miniature Schnauzers, Poodles, and Bichon Frise are affected more often
- **Autoimmune destruction** of beta cells — the body "attacks itself"; this isn't caused by diet
- **Chronic or acute pancreatitis** — inflammation of the pancreas, a common cause in dogs
- **Sex hormones in intact females** — progesterone after heat causes insulin resistance (diestrus diabetes)
- **Cushing's disease** and other hormonal disorders
- **Steroid medications** — prescribed for other conditions
- **Age** — most often 7–9 years

### What Is Definitely NOT Your Fault

- **Genes and breed** — you didn't choose them
- The **autoimmune process** couldn't have been predicted or prevented
- **Pancreatitis and Cushing's** may have been silent
- **Steroids** were needed to treat another illness

> **Good to know:** in dogs, obesity plays a much smaller role than in cats. Canine type 1 diabetes is mostly about the pancreas and hormones, not extra weight. So "I overfed him" is almost always false self-blame.

### What You Can Actually Change — Going Forward

You can't undo the cause, but you can shape the course:

- **Spaying an intact female** — critically important if she isn't spayed (dedicated article)
- **A consistent diet** and feeding schedule
- **Regular insulin and monitoring**
- **Managing concurrent illnesses** together with your vet

### The Bottom Line

Canine diabetes is usually a failure of the pancreas and hormones, not a result of your care. Self-blame won't help your dog — a steady routine will.

**The right question isn't "who's to blame," it's "what do I do next." And you've already started answering it.**`,
  },
  category: 'basics',
  readingTimeMinutes: 5,
  order: 3,
  species: 'dog',
  relatedArticleIds: [
    'dog-diabetes-basics',
    'dog-spay-diestrus',
    'dog-pancreatitis',
    'dog-comorbidities',
  ],
  references: [
    {
      ru: 'Feldman EC, Nelson RW — Canine and Feline Endocrinology, 4th ed., 2015',
      en: 'Feldman EC, Nelson RW — Canine and Feline Endocrinology, 4th ed., 2015',
    },
    {
      ru: 'Fall T et al — Diabetes mellitus in a population of 180,000 insured dogs, JVIM, 2007',
      en: 'Fall T et al — Diabetes mellitus in a population of 180,000 insured dogs, JVIM, 2007',
    },
  ],
  tags: [
    { ru: 'причины', en: 'causes' },
    { ru: 'факторы риска', en: 'risk factors' },
    { ru: 'вина', en: 'is it my fault' },
    { ru: 'поджелудочная', en: 'pancreas' },
  ],
};
