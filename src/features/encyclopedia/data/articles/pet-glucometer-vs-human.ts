import { Article } from '../../types';

export const petGlucometerVsHuman: Article = {
  id: 'pet-glucometer-vs-human',
  titleKey: {
    ru: 'Глюкометр для животных vs человеческий: в чём разница',
    en: 'Pet Glucometer vs Human Meter: What Actually Differs',
  },
  summaryKey: {
    ru: 'Человеческий глюкометр обычно занижает сахар у кошки и собаки. Почему так, насколько это опасно и когда стоит купить ветеринарный AlphaTRAK.',
    en: 'A human meter usually reads low on cats and dogs. Why that happens, how risky it is, and when a veterinary AlphaTRAK is worth buying.',
  },
  contentKey: {
    ru: `## Можно ли мерить сахар питомцу человеческим глюкометром

Короткий ответ: **да, можно, но с поправкой.** Человеческий глюкометр покажет цифру, и для отслеживания тренда этого часто достаточно. Но у кошек и собак кровь устроена иначе, чем у человека, поэтому обычный прибор системно **занижает** результат. Разберём, почему.

### Причина 1: сахар «сидит» в разных местах крови

Глюкоза распределена между **плазмой** (жидкая часть) и **эритроцитами** (клетками крови) по-разному у человека и у животных.

- У человека заметная доля глюкозы находится **внутри эритроцитов**
- У кошек и собак глюкоза почти вся в **плазме**, а внутри клеток её мало

Человеческий глюкометр откалиброван под человеческое распределение и «ожидает» найти часть сахара в клетках. У животного он там её не находит — и выдаёт **заниженное** число.

### Причина 2: гематокрит

Гематокрит — это доля клеток в крови. Он у кошек, собак и людей разный, а от него зависит точность прибора. Человеческий глюкометр рассчитан на человеческий гематокрит, поэтому на крови животного погрешность растёт.

## Насколько велика ошибка

- Обычно человеческий глюкометр **занижает** сахар у кошки/собаки — иногда на **10-30%**, а по некоторым парам «прибор + животное» и сильнее
- Ошибка **не постоянная**: она разная на низком и высоком сахаре, поэтому нельзя просто «прибавлять фиксированные 2 единицы»

> **Чем это опасно:** если прибор занижает, вы можете увидеть «нормальные» 4 ммоль/л, тогда как в крови уже опасные ~3. Недооценка гипогликемии — самый серьёзный риск человеческого глюкометра.

## Ветеринарный глюкометр (AlphaTRAK и аналоги)

**AlphaTRAK** (сейчас AlphaTRAK 3) — самый известный глюкометр для животных. Есть и другие ветеринарные модели. Их отличие:

- **Откалиброваны под кровь кошек и собак** — учитывают распределение глюкозы и гематокрит
- У части приборов есть **переключатель «кошка/собака»** (разные коэффициенты для видов)
- Дают результат **ближе к лабораторному**, особенно в опасной нижней зоне

Минус — **тест-полоски дороже и их сложнее купить**, чем к человеческим приборам.

## Практические правила

- **Выбрали прибор — не меняйте его.** Отслеживайте тренд одним и тем же глюкометром: даже если он немного врёт, врёт он стабильно, и динамика видна
- **Не сравнивайте цифры с разных приборов** напрямую — это собьёт вас с толку
- **Показания глюкометра ≠ лаборатория.** Домашние приборы (любые) могут расходиться с венозным анализом; для точных решений о дозе ветеринар опирается на лабораторию и кривую
- **Капля крови из уха** (кошка) или **из внутренней губы/мозоли лапы** (собака) — техника одинаковая для любого прибора

> **Важно про дозу:** какой бы глюкометр вы ни использовали, **не корректируйте дозу инсулина самостоятельно** по одному значению. Особенно если увидели низкий сахар на человеческом приборе — реальное число может быть ещё ниже. Сначала действуйте по гипогликемии, потом связывайтесь с ветеринаром.

### Что выбрать

- **Только начинаете и бюджет ограничен?** Человеческий глюкометр для тренда — лучше, чем ничего. Просто помните про занижение и перепроверяйте любые «пограничные» низкие значения
- **Подбор дозы, нестабильный диабет, важна точность у нижней границы?** Ветеринарный AlphaTRAK стоит своих денег

> **Итог:** человеческий прибор годится для наблюдения за трендом, но склонен занижать сахар. Для решений на грани гипогликемии и для точности выбирайте ветеринарный глюкометр — и в любом случае обсуждайте цифры с ветеринаром.`,
    en: `## Can You Use a Human Meter on a Pet

Short answer: **yes, but with a caveat.** A human meter will give you a number, and for tracking a trend that's often enough. But cats and dogs have blood that differs from ours, so a standard meter **systematically reads low**. Here's why.

### Reason 1: Sugar Sits in Different Parts of the Blood

Glucose is split between the **plasma** (the liquid part) and the **red blood cells** differently in humans versus animals.

- In humans a meaningful share of glucose sits **inside the red cells**
- In cats and dogs almost all the glucose is in the **plasma**, with little inside the cells

A human meter is calibrated for the human split and "expects" to find some sugar in the cells. In an animal it doesn't find it there — and returns a **falsely low** number.

### Reason 2: Hematocrit

Hematocrit is the fraction of cells in blood. It differs between cats, dogs, and humans, and it affects meter accuracy. A human meter is built for human hematocrit, so on animal blood the error grows.

## How Big Is the Error

- A human meter usually **reads low** on a cat/dog — sometimes by **10-30%**, and for some meter-animal pairs even more
- The error is **not constant**: it differs at low versus high sugar, so you can't just "add a fixed 2 units"

> **Why that's dangerous:** if the meter reads low, you might see a "normal" 4 mmol/L when the blood is already at a dangerous ~3. Underestimating a hypo is the most serious risk of a human meter.

## Veterinary Glucometers (AlphaTRAK and Others)

The **AlphaTRAK** (now AlphaTRAK 3) is the best-known animal glucometer. Other veterinary models exist too. What sets them apart:

- **Calibrated for cat and dog blood** — they account for the glucose split and hematocrit
- Some have a **cat/dog switch** (different coefficients per species)
- They read **closer to the lab**, especially in the dangerous low range

The downside — **test strips cost more and are harder to find** than for human meters.

## Practical Rules

- **Pick one meter and stick with it.** Track the trend on the same device: even if it's slightly off, it's off consistently, so the pattern still shows
- **Don't compare numbers across different meters** directly — it will just confuse you
- **A meter reading ≠ the lab.** Any home device can disagree with a venous lab test; for precise dose decisions your vet relies on the lab and the curve
- **A drop of blood from the ear** (cat) or **the inner lip / paw callus** (dog) — the technique is the same for any meter

> **Important on dosing:** whatever meter you use, **don't adjust the insulin dose on your own** off a single value. Especially if you see a low reading on a human meter — the real number could be even lower. Treat the hypo first, then contact your vet.

### What to Choose

- **Just starting and on a budget?** A human meter for the trend beats nothing. Just remember the low bias and recheck any "borderline" low readings
- **Dose-tuning, unstable diabetes, accuracy near the low end matters?** A veterinary AlphaTRAK is worth the money

> **Bottom line:** a human meter is fine for watching the trend but tends to read low. For decisions near a hypo and for accuracy, choose a veterinary glucometer — and either way, discuss the numbers with your vet.`,
  },
  category: 'monitoring',
  species: 'all',
  readingTimeMinutes: 6,
  order: 4,
  relatedArticleIds: [
    'glucose_monitoring',
    'dog-glucose-monitoring',
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
      ru: 'Zeugswetter FK et al. — Point-of-care glucose meters in dogs and cats (portable meter validation studies)',
      en: 'Zeugswetter FK et al. — Point-of-care glucose meters in dogs and cats (portable meter validation studies)',
    },
  ],
  tags: [
    { ru: 'глюкометр', en: 'glucometer' },
    { ru: 'AlphaTRAK', en: 'AlphaTRAK' },
    { ru: 'точность', en: 'accuracy' },
    { ru: 'мониторинг', en: 'monitoring' },
  ],
};
