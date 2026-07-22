import { Article } from '../../types';

export const catLifeExpectancy: Article = {
  id: 'cat-life-expectancy',
  titleKey: {
    ru: 'Диабет у кошки — это приговор? Сколько живут',
    en: 'Is Feline Diabetes a Death Sentence? How Long Cats Live',
  },
  summaryKey: {
    ru: 'Короткий ответ: нет, не приговор. При лечении кошки с диабетом живут годами и сохраняют качество жизни. Разбираем честно, без прикрас.',
    en: 'The short answer: no, it is not. With treatment, diabetic cats live for years with good quality of life. An honest look, no sugar-coating.',
  },
  contentKey: {
    ru: `## Диабет — это приговор?

Давайте сразу главное: **нет, диабет — не приговор.** Это хроническое, но управляемое заболевание. При лечении и заботе кошки с диабетом живут годами и остаются такими же родными и любимыми.

Первый шок от диагноза проходит у всех. Дальше начинается обычная жизнь — просто с новой рутиной.

### Сколько живут кошки с диабетом?

Честно: точной «цифры срока» не существует — слишком многое зависит от конкретной кошки. Но общая картина обнадёживает:

- При хорошем контроле продолжительность жизни **сопоставима со здоровыми кошками того же возраста**
- Многие кошки живут с диабетом **несколько лет** и умирают в итоге от других, возрастных причин
- Часть кошек выходит в **ремиссию** и вовсе перестаёт нуждаться в инсулине (об этом — отдельные статьи)

> **Важно знать:** сам по себе диабет при контроле не «съедает» годы жизни. Опасны не будни с инсулином, а декомпенсация — запущенный кетоацидоз и тяжёлая гипогликемия. Именно их и предотвращает лечение.

### От чего зависит прогноз

На то, как сложится жизнь вашей кошки, влияет:

- **Раннее начало лечения** — чем раньше взяли сахар под контроль, тем лучше
- **Стабильность рутины** — инсулин и еда в одно и то же время
- **Диета** — низкоуглеводный влажный корм
- **Сопутствующие болезни** — панкреатит, болезни почек, гипертиреоз влияют на течение
- **Домашний мониторинг** — он ловит проблемы раньше, чем они станут опасными

### А без лечения?

Здесь важно быть честными. **Без лечения** диабет прогрессирует: обезвоживание, потеря веса, кетоацидоз — и тогда счёт идёт на недели, иногда дни. Поэтому лечить нужно, и это реально посильно.

Но вы уже читаете эту статью — значит, вы в лечащей, а не в бросающей команде. Это и есть главный фактор хорошего прогноза.

### Что это значит для вас

- Диагноз — не конец, а начало нового режима, к которому привыкают
- Ваша забота напрямую влияет на то, сколько и как проживёт кошка
- Не гонитесь за «сроком» — стройте хорошие, стабильные дни. Из них и складываются годы

**Тысячи владельцев прошли этот путь. Вы справитесь, и ваш котик — тоже.**`,
    en: `## Is Diabetes a Death Sentence?

Let's lead with what matters most: **no, diabetes is not a death sentence.** It's a chronic but manageable condition. With treatment and care, diabetic cats live for years and stay every bit as dear and loved.

The initial shock of the diagnosis fades for everyone. What follows is ordinary life — just with a new routine.

### How Long Do Diabetic Cats Live?

Honestly: there's no exact "number of years" — too much depends on the individual cat. But the overall picture is reassuring:

- With good control, life expectancy is **comparable to healthy cats of the same age**
- Many cats live with diabetes for **several years** and ultimately pass from other, age-related causes
- Some cats reach **remission** and stop needing insulin entirely (covered in separate articles)

> **Good to know:** diabetes itself, when controlled, doesn't "eat away" years of life. The danger isn't the daily insulin routine — it's decompensation: advanced ketoacidosis and severe hypoglycemia. Treatment is precisely what prevents those.

### What Affects the Prognosis

How your cat's journey unfolds depends on:

- **Early treatment** — the sooner blood sugar is controlled, the better
- **A steady routine** — insulin and food at the same times each day
- **Diet** — low-carbohydrate wet food
- **Concurrent illnesses** — pancreatitis, kidney disease, and hyperthyroidism affect the course
- **Home monitoring** — it catches problems before they become dangerous

### And Without Treatment?

Here we need to be honest. **Without treatment**, diabetes progresses: dehydration, weight loss, ketoacidosis — and then the timeline shrinks to weeks, sometimes days. That's why treatment matters, and it's genuinely doable.

But you're already reading this article — which means you're on the treating team, not the giving-up team. That, in itself, is the biggest factor in a good outcome.

### What This Means for You

- The diagnosis isn't an ending — it's the start of a new routine you'll get used to
- Your care directly shapes how long and how well your cat lives
- Don't chase a "number" — build good, steady days. Years are made of those

**Thousands of owners have walked this path. You can do this, and so can your kitty.**`,
  },
  category: 'basics',
  readingTimeMinutes: 5,
  order: 2,
  species: 'cat',
  relatedArticleIds: ['what-is-diabetes', 'remission', 'first-days', 'diet'],
  references: [
    {
      ru: '2025 iCatCare Consensus Guidelines on Diabetes Mellitus in Cats (Taylor et al., JFMS 2025)',
      en: '2025 iCatCare Consensus Guidelines on Diabetes Mellitus in Cats (Taylor et al., JFMS 2025)',
    },
    {
      ru: 'Rand J. — Feline Diabetes Mellitus, Veterinary Clinics of North America, 2012',
      en: 'Rand J. — Feline Diabetes Mellitus, Veterinary Clinics of North America, 2012',
    },
  ],
  tags: [
    { ru: 'приговор', en: 'death sentence' },
    { ru: 'сколько живут', en: 'life expectancy' },
    { ru: 'прогноз', en: 'prognosis' },
    { ru: 'надежда', en: 'hope' },
  ],
};
