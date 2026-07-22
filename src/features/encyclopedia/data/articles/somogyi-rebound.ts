import { Article } from '../../types';

export const somogyiRebound: Article = {
  id: 'somogyi-rebound',
  titleKey: {
    ru: 'Эффект Сомоджи: почему высокий утренний сахар ≠ «мало инсулина»',
    en: 'The Somogyi Effect: Why High Morning Sugar ≠ "Not Enough Insulin"',
  },
  summaryKey: {
    ru: 'Иногда высокий сахар — это отскок после скрытой гипогликемии. Добавить дозу тут = опасная ошибка. Как распознать рикошет и что делать.',
    en: 'Sometimes high sugar is a rebound after a hidden hypo. Adding insulin here is a dangerous mistake. How to spot the rebound and what to do.',
  },
  contentKey: {
    ru: `## Ловушка высокого утреннего сахара

Самая логичная мысль владельца: «утром сахар высокий → инсулина мало → надо добавить дозу». В большинстве случаев это неверно, а иногда — **опасно**. Потому что высокий сахар бывает **отскоком после скрытого провала**. Это и есть **эффект Сомоджи** (Somogyi, он же рикошетная гипергликемия, rebound).

### Что происходит при эффекте Сомоджи

1. Доза инсулина оказалась **слишком большой**
2. Через несколько часов (часто ночью, во сне) сахар **резко падает** — гипогликемия
3. Организм пугается провала и **выбрасывает контринсулярные гормоны** (адреналин, кортизол, глюкагон)
4. Эти гормоны **выбрасывают сахар вверх** — к утру вы видите **высокое** число

Итог: питомец пережил опасную гипогликемию ночью, а утренний глюкометр показывает высокий сахар. Если на это добавить дозу — вы **усилите ночной провал**. Так формируется порочный круг.

> **Почему это опасно:** добавляя инсулин на «высокое утро», вы кормите не гипергликемию, а её причину — передозировку. Каждый следующий провал может быть глубже предыдущего.

## Как отличить Сомоджи от настоящей нехватки инсулина

Оба состояния выглядят одинаково по утреннему замеру — **высокий сахар**. Разница видна только внутри дня.

**Признаки, что это может быть Сомоджи (рикошет):**
- Сахар **скачет широко**: то очень низко, то очень высоко, без плавности
- Есть эпизоды поведения, похожего на гипогликемию (вялость, голод, дрожь, беспокойство, особенно вечером/ночью)
- Утренние значения **непредсказуемы** день ото дня
- Недавно **повышали** дозу, а стало «хуже»

**Признаки настоящей нехватки инсулина:**
- Сахар **высокий стабильно**, без глубоких провалов
- Кривая плавная, просто вся идёт высоко

### Единственный надёжный способ различить — увидеть надир

Утренняя точка не отвечает на вопрос. Нужно поймать **надир** — самую низкую точку в течение дня:

- **Кривая глюкозы** (замеры каждые 2 часа)
- Или **CGM-сенсор** (FreeStyle Libre), который покажет ночь — именно там прячется провал при Сомоджи

Пороги для настороженности (по анализатору DiaPet): у кошки надир ниже ~**3.3 ммоль/л** с последующим подъёмом выше ~**15**; у собаки — надир ниже ~**3.3** с отскоком выше ~**16**. Точные числа и трактовку определяет ветеринар.

## Что делать (и чего НЕ делать)

> **Главное правило:** **не увеличивайте дозу самостоятельно**, чтобы «сбить» высокое утро. Если это Сомоджи, вы сделаете хуже. При эффекте Сомоджи дозу обычно **снижают**, но решает это только ветеринар по кривой/сенсору.

**Ваши шаги:**
1. **Не меняйте дозу «на глаз».** Один высокий утренний замер — не команда добавить инсулин
2. **Соберите данные:** сделайте кривую глюкозы или поставьте CGM, чтобы увидеть надир и ночь
3. **Покажите картину ветеринару.** Обсудите, снижать ли дозу, менять ли инсулин или интервал
4. При признаках реальной гипогликемии (шатается, вялый, судороги) — **действуйте немедленно** по протоколу гипогликемии и звоните ветеринару

### Почему это встречается реже, чем кажется

Классический выраженный эффект Сомоджи в ветеринарии обсуждается активнее, чем встречается: чаще высокий утренний сахар — это всё-таки нехватка инсулина, короткое действие препарата или испорченный флакон. Но **риск не в частоте, а в цене ошибки**: добавить дозу поверх скрытого провала опасно. Поэтому золотое правило одно — **не гадать по утренней точке, а увидеть надир и решать с ветеринаром**.

> **Итог:** высокий утренний сахар — это вопрос, а не ответ. Прежде чем трогать дозу, поймайте нижнюю точку кривой или сенсором. Дозой инсулина при подозрении на рикошет управляет только ветеринар.`,
    en: `## The High-Morning-Sugar Trap

The most intuitive owner thought is: "morning sugar is high → not enough insulin → add more." Most of the time that's wrong, and sometimes it's **dangerous** — because high sugar can be a **rebound after a hidden drop**. That's the **Somogyi effect** (rebound hyperglycemia).

### What Happens in the Somogyi Effect

1. The insulin dose turns out to be **too high**
2. A few hours later (often at night, during sleep) sugar **crashes** — a hypo
3. The body panics at the drop and **releases counter-regulatory hormones** (adrenaline, cortisol, glucagon)
4. Those hormones **drive sugar upward** — by morning you see a **high** number

The result: your pet went through a dangerous overnight hypo, yet the morning meter shows high sugar. Add insulin to that and you **deepen the nighttime crash**. That's how a vicious cycle forms.

> **Why it's dangerous:** by adding insulin for a "high morning," you're feeding not the hyperglycemia but its cause — an overdose. Each next drop can be deeper than the last.

## Telling Somogyi Apart From a Real Insulin Shortage

Both look identical on the morning reading — **high sugar**. The difference only shows up inside the day.

**Signs it might be Somogyi (rebound):**
- Sugar **swings widely**: very low then very high, not smooth
- There are episodes of hypo-like behavior (lethargy, hunger, trembling, restlessness, especially evening/night)
- Morning values are **unpredictable** day to day
- You recently **raised** the dose and things got "worse"

**Signs of a genuine insulin shortage:**
- Sugar is **steadily high**, with no deep drops
- The curve is smooth, just running high all day

### The Only Reliable Way to Tell — See the Nadir

The morning dot doesn't answer the question. You need to catch the **nadir** — the lowest point of the day:

- A **glucose curve** (readings every 2 hours)
- Or a **CGM sensor** (FreeStyle Libre) that shows the night — exactly where the Somogyi drop hides

Alert thresholds (per DiaPet's analyzer): in cats a nadir below ~**3.3 mmol/L** followed by a rise above ~**15**; in dogs a nadir below ~**3.3** with a rebound above ~**16**. The exact numbers and interpretation are the vet's call.

## What to Do (and NOT Do)

> **The key rule:** **do not raise the dose on your own** to "beat down" a high morning. If it's Somogyi, you'll make it worse. In the Somogyi effect the dose is usually **lowered**, but only the vet decides that from the curve/sensor.

**Your steps:**
1. **Don't change the dose by guesswork.** One high morning reading is not a command to add insulin
2. **Gather data:** run a glucose curve or place a CGM to see the nadir and the night
3. **Show the picture to your vet.** Discuss whether to lower the dose, or change the insulin or interval
4. At signs of a real hypo (wobbly, lethargic, seizures) — **act immediately** on the hypoglycemia protocol and call your vet

### Why It's Rarer Than It Sounds

The classic, pronounced Somogyi effect gets discussed in veterinary circles more than it actually occurs: more often, high morning sugar really is a shortage of insulin, a short insulin duration, or a spoiled vial. But **the risk isn't in the frequency — it's in the cost of the mistake**: adding a dose on top of a hidden crash is dangerous. So the golden rule stands — **don't guess from the morning dot; see the nadir and decide with your vet**.

> **Bottom line:** high morning sugar is a question, not an answer. Before touching the dose, catch the low point with a curve or sensor. When a rebound is suspected, only the vet manages the insulin dose.`,
  },
  category: 'monitoring',
  species: 'all',
  readingTimeMinutes: 7,
  order: 5,
  relatedArticleIds: [
    'glucose-curves-practice',
    'dog-glucose-curves',
    'cgm-monitoring',
    'dog-cgm-monitoring',
    'hypoglycemia',
    'dog-hypoglycemia',
  ],
  references: [
    {
      ru: 'AAHA Diabetes Management Guidelines for Dogs and Cats, 2018',
      en: 'AAHA Diabetes Management Guidelines for Dogs and Cats, 2018',
    },
    {
      ru: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
      en: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
    },
    {
      ru: 'Feldman EC, Nelson RW — Canine and Feline Endocrinology, 4th ed., 2015',
      en: 'Feldman EC, Nelson RW — Canine and Feline Endocrinology, 4th ed., 2015',
    },
  ],
  tags: [
    { ru: 'эффект Сомоджи', en: 'Somogyi effect' },
    { ru: 'рикошет', en: 'rebound' },
    { ru: 'гипогликемия', en: 'hypoglycemia' },
    { ru: 'доза инсулина', en: 'insulin dose' },
  ],
};
