import { Article } from '../../types';

export const dogInsulinExplained: Article = {
  id: 'dog-insulin-explained',
  titleKey: {
    ru: 'Как работает инсулин простыми словами',
    en: 'How Insulin Works, in Plain Language',
  },
  summaryKey: {
    ru: 'Что такое инсулин, зачем он и почему его нельзя пропускать — без медицинского жаргона, на понятных примерах. База, с которой всё становится проще.',
    en: "What insulin is, why it matters, and why you can't skip it — no medical jargon, just plain examples. The foundation that makes everything else easier.",
  },
  contentKey: {
    ru: `## Как работает инсулин — простыми словами

Когда понимаешь, что вообще делает инсулин, вся рутина уколов перестаёт быть пугающей и становится осмысленной. Давайте разберём без сложных слов.

### Инсулин — это «ключ» от клеток

Представьте, что каждая клетка тела — это дом с закрытой дверью. **Глюкоза** (сахар из еды) — это топливо, которое должно попасть внутрь дома, чтобы дать энергию. Но сама дверь не открывается.

**Инсулин — это ключ**, который открывает дверь и впускает глюкозу внутрь клетки.

У здоровой собаки поджелудочная железа сама вырабатывает этот «ключ». При диабете 1 типа она его почти не производит — двери заперты.

### Что происходит без инсулина

Без ключа получается парадокс:

- **В крови глюкозы много** — она поступает с едой, но не может войти в клетки
- **Клетки при этом голодают** — топливо рядом, но внутрь не попадает
- Организм думает, что голодает, и начинает **расщеплять жир** — образуются кетоны
- Много кетонов → **кетоацидоз**, опасное состояние

Именно поэтому собака на диабете **худеет при хорошем аппетите** и много пьёт: почки выводят лишний сахар с водой.

### Что делает инъекция инсулина

Укол даёт телу тот самый «ключ» извне. Глюкоза начинает входить в клетки, сахар в крови снижается, клетки получают энергию — и порочный круг разрывается.

> **Важно знать:** инсулин НЕ «лечит» поджелудочную и не восстанавливает её. Он замещает то, что она перестала вырабатывать. Поэтому у собак инсулин — пожизненно, и пропускать его нельзя.

### Почему время и еда так важны

- Инсулин снижает сахар, а еда его повышает — их нужно **синхронизировать**
- Обычно: покормить → сделать инъекцию. Так поступление глюкозы совпадает с работой инсулина
- **Укол без еды** может уронить сахар слишком низко → гипогликемия (опасно!)
- Поэтому режим «еда + инсулин в одно и то же время» — основа всего

### Почему нельзя «догнать» пропущенную дозу двойной

Если кажется, что доза не сработала, — **никогда не колите вторую «для верности»**. Двойная доза может вызвать тяжёлую гипогликемию. При сомнениях лучше пропустить и связаться с ветеринаром.

### Главное, что стоит запомнить

- Инсулин = ключ, впускающий сахар в клетки
- При диабете 1 типа тело само его не делает — отсюда пожизненные уколы
- Еда и инсулин работают в паре — держите режим
- Сомневаетесь в дозе — лучше меньше, чем больше

**Как только «ключ и двери» укладываются в голове, всё остальное — техника уколов, замеры, кривые — становится просто логичным продолжением.**`,
    en: `## How Insulin Works — in Plain Language

Once you understand what insulin actually does, the whole injection routine stops being scary and starts making sense. Let's break it down without the jargon.

### Insulin Is the "Key" to the Cells

Picture every cell in the body as a house with a locked door. **Glucose** (sugar from food) is the fuel that needs to get inside to provide energy. But the door won't open on its own.

**Insulin is the key** that unlocks the door and lets glucose into the cell.

In a healthy dog, the pancreas makes this "key" itself. In type 1 diabetes, it barely produces any — the doors stay locked.

### What Happens Without Insulin

Without the key, you get a paradox:

- **There's plenty of glucose in the blood** — it comes in with food but can't get into the cells
- **The cells starve anyway** — fuel is right there but can't get in
- The body thinks it's starving and starts **breaking down fat** — producing ketones
- Too many ketones → **ketoacidosis**, a dangerous state

This is exactly why a diabetic dog **loses weight despite a good appetite** and drinks a lot: the kidneys flush the excess sugar out with water.

### What an Insulin Injection Does

The shot gives the body that "key" from the outside. Glucose starts entering the cells, blood sugar comes down, the cells get energy — and the vicious cycle breaks.

> **Good to know:** insulin does NOT "heal" or restore the pancreas. It replaces what the pancreas stopped making. That's why in dogs insulin is lifelong and can't be skipped.

### Why Timing and Food Matter So Much

- Insulin lowers blood sugar, food raises it — they need to be **synchronized**
- Usually: feed → then inject. That way incoming glucose lines up with the insulin's action
- **A shot without food** can drop blood sugar too low → hypoglycemia (dangerous!)
- So "food + insulin at the same times" is the foundation of everything

### Why You Never "Make Up" a Missed Dose With a Double

If it seems like a dose didn't work, **never give a second one "to be sure."** A double dose can cause severe hypoglycemia. When in doubt, it's safer to skip and contact your vet.

### The Key Things to Remember

- Insulin = the key that lets sugar into cells
- In type 1 diabetes the body can't make it — hence lifelong shots
- Food and insulin work as a pair — keep the routine
- Unsure about a dose — less is safer than more

**Once "keys and doors" click into place, everything else — injection technique, testing, curves — becomes a logical next step.**`,
  },
  category: 'basics',
  readingTimeMinutes: 5,
  order: 4,
  species: 'dog',
  relatedArticleIds: [
    'dog-diabetes-basics',
    'dog-insulin',
    'dog-injection-technique',
    'dog-hypoglycemia',
  ],
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
    { ru: 'инсулин', en: 'insulin' },
    { ru: 'как работает', en: 'how it works' },
    { ru: 'простыми словами', en: 'plain language' },
    { ru: 'основы', en: 'basics' },
  ],
};
