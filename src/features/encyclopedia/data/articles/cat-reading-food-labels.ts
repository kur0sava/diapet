import { Article } from '../../types';

export const catReadingFoodLabels: Article = {
  id: 'cat-reading-food-labels',
  titleKey: {
    ru: 'Как читать состав корма для кошки: углеводы по сухому веществу',
    en: 'How to Read Cat Food Labels: Carbs on a Dry-Matter Basis',
  },
  summaryKey: {
    ru: 'Производитель не пишет углеводы на этикетке — их нужно посчитать. Разбираем, как это сделать за минуту и на что смотреть.',
    en: "Labels don't print the carb number — you have to calculate it. Here's how to do it in a minute and what else to look for.",
  },
  contentKey: {
    ru: `## Как читать состав корма для кошки

Главная проблема: **углеводы почти никогда не указаны на этикетке**. Их придётся посчитать самому — но это буквально минута, и приложение делает это за вас.

Для кошки-диабетика цель — **углеводы менее 10% по сухому веществу (DM)**, в идеале 5-7%.

### Зачем «сухое вещество»?

На банке проценты даны «как есть», вместе с водой. Влажный корм на 78% состоит из воды, сухой — на 8%. Сравнивать их «в лоб» бессмысленно: это как сравнивать крепость пива и водки по объёму бутылки.

**Сухое вещество (Dry Matter)** убирает воду и показывает реальный состав. Только так два корма можно сравнить честно.

### Считаем углеводы за минуту

Углеводы (их называют NFE — «безазотистые экстрактивные вещества») производитель не пишет, но их легко получить: всё остальное вычитаем из 100%.

**Формула (по «как есть», гарантированный анализ):**

> Углеводы % ≈ 100 − белок − жир − влага − зола − клетчатка

Если зола не указана — для влажных кормов её принимают примерно за 2-3%. Затем это число пересчитывают на сухое вещество. **Не считайте вручную — используйте встроенный калькулятор сухого вещества в приложении:** введите цифры с банки, и он покажет углеводы по DM.

### На что смотреть на этикетке

**Хорошие знаки:**
- Первым ингредиентом — **конкретное мясо** (курица, индейка, тунец), а не «мясная мука» неясного происхождения
- Высокий белок, умеренный жир
- Короткий понятный состав

**Плохие знаки (для диабетика):**
- **Зерно и крахмал** в начале списка: кукуруза, пшеница, рис, «злаки», картофель, горох, тапиока
- Пометки «с соусом», «в желе», «gravy» — соус часто загущают крахмалом (углеводы выше, чем у той же линейки «в собственном соку»)
- Расплывчатые «субпродукты» без указания вида

### Влажный против сухого — коротко

| | Влажный | Сухой |
|---|---|---|
| Углеводы (DM) | обычно 3-20% | обычно 25-50% |
| Влага | 70-80% | 8-12% |
| Для диабетика | предпочтительно | чаще не подходит |

Сухой корм технически может быть низкоуглеводным (например, лечебные линейки), но большинство «магазинных» сухих кормов для кошки-диабетика не годятся из-за крахмала-связующего.

> **Важно:** внутри одной марки разные вкусы дают РАЗНЫЕ углеводы. «Паштет» и «кусочки в соусе» одного бренда — это два разных корма. Проверяйте каждый вкус отдельно.

> **Золотое правило:** цифры по DM важнее красивой упаковки и слова «премиум». Считайте углеводы — и выбор станет очевидным.`,
    en: `## How to Read Cat Food Labels

The core problem: **carbohydrates are almost never printed on the label**. You have to calculate them yourself — but it takes a minute, and the app does it for you.

For a diabetic cat the goal is **carbohydrates under 10% on a dry-matter basis (DM)**, ideally 5-7%.

### Why "Dry Matter"?

The can lists percentages "as fed," water included. Wet food is ~78% water, dry food ~8%. Comparing them head-to-head is meaningless — like comparing beer and vodka by bottle size.

**Dry Matter** strips out the water and shows the real composition. It's the only fair way to compare two foods.

### Calculate Carbs in a Minute

Carbohydrate (labeled NFE — "nitrogen-free extract") isn't printed, but it's easy to get: subtract everything else from 100%.

**Formula (as-fed, guaranteed analysis):**

> Carbs % ≈ 100 − protein − fat − moisture − ash − fiber

If ash isn't listed, wet foods are usually estimated at about 2-3%. Then convert that number to a dry-matter basis. **Don't do it by hand — use the built-in dry-matter calculator in the app:** enter the numbers from the can and it shows carbs on a DM basis.

### What to Look For on the Label

**Good signs:**
- The first ingredient is a **named meat** (chicken, turkey, tuna), not a vague "meat meal"
- High protein, moderate fat
- A short, readable ingredient list

**Bad signs (for a diabetic):**
- **Grain and starch** high on the list: corn, wheat, rice, "cereals," potato, peas, tapioca
- Labels like "with gravy" or "in jelly" — gravy is often thickened with starch (higher carbs than the "in juice" version of the same line)
- Vague "by-products" with no species named

### Wet vs Dry — In Short

| | Wet | Dry |
|---|---|---|
| Carbs (DM) | usually 3-20% | usually 25-50% |
| Moisture | 70-80% | 8-12% |
| For a diabetic | preferred | often unsuitable |

Dry food can technically be low-carb (some prescription lines), but most store dry foods are unsuitable for a diabetic cat because of the starch binder.

> **Important:** within one brand, different flavors have DIFFERENT carbs. A brand's "pâté" and "chunks in gravy" are two different foods. Check each flavor separately.

> **Golden rule:** the DM numbers matter more than pretty packaging or the word "premium." Calculate the carbs and the choice becomes obvious.`,
  },
  category: 'nutrition',
  species: 'cat',
  readingTimeMinutes: 5,
  order: 3,
  relatedArticleIds: ['diet', 'cat-foods-to-avoid', 'cat-home-diet', 'common-mistakes'],
  references: [
    {
      ru: '2025 iCatCare Consensus Guidelines on Diabetes Mellitus in Cats (Taylor et al., JFMS 2025)',
      en: '2025 iCatCare Consensus Guidelines on Diabetes Mellitus in Cats (Taylor et al., JFMS 2025)',
    },
    {
      ru: 'Rand J. — Feline Diabetes Mellitus, Veterinary Clinics of North America, 2013',
      en: 'Rand J. — Feline Diabetes Mellitus, Veterinary Clinics of North America, 2013',
    },
  ],
  tags: [
    { ru: 'состав корма', en: 'food label' },
    { ru: 'углеводы', en: 'carbohydrates' },
    { ru: 'сухое вещество', en: 'dry matter' },
    { ru: 'этикетка', en: 'label' },
  ],
};
