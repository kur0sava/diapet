import { Article } from '../../types';

export const dogReadingFoodLabels: Article = {
  id: 'dog-reading-food-labels',
  titleKey: {
    ru: 'Как читать состав корма для собаки: клетчатка и стабильность',
    en: 'How to Read Dog Food Labels: Fiber and Consistency',
  },
  summaryKey: {
    ru: 'У собак другая логика, чем у кошек: важны клетчатка, низкий жир и постоянство. Разбираем, что искать на этикетке.',
    en: "Dogs follow a different logic than cats: fiber, low fat, and consistency matter. Here's what to look for on the label.",
  },
  contentKey: {
    ru: `## Как читать состав корма для собаки

У собак стратегия питания **противоположна кошачьей**. Кошке нужны минимальные углеводы, а собаке — **клетчатка и сложные углеводы**, которые сглаживают сахарную кривую после еды. Плюс **низкий жир** — ради защиты от панкреатита.

Поэтому и этикетку читаем иначе.

### Что ищем на упаковке

**Хорошие знаки для собаки-диабетика:**
- **Высокая клетчатка** — ориентир 10-15% по сухому веществу. Ищите цельные источники: свекловичный жом, отруби, гороховая клетчатка, целлюлоза
- **Сложные углеводы**: цельное зерно, ячмень, овёс — они медленные, а не «быстрый сахар»
- **Умеренный белок** (25-35% DM) — поддерживает мышцы
- **Низкий жир** (обычно до 20-25% DM, при склонности к панкреатиту ветеринар может рекомендовать ещё ниже)

**Плохие знаки:**
- **Простые сахара**: сахар, сироп, патока, мёд, декстроза в составе
- **Белый рис, белый хлеб** как основной углевод — быстрый скачок сахара
- **Высокий жир** — риск панкреатита
- «Полувлажные» корма в мягких пакетиках — часто держатся на сахаре/глицерине

### Про сухое вещество (DM)

Проценты на упаковке даны «как есть», с водой. Чтобы честно сравнить сухой и влажный корм, воду нужно убрать — это и есть пересчёт на **сухое вещество**. Клетчатку и жир двух кормов сравнивайте именно по DM. **Встроенный калькулятор в приложении** пересчитает цифры с этикетки за вас.

### Влажный или сухой?

Для собак это **не так критично**, как для кошек. Здесь важнее клетчатка, стабильность порций и низкий жир, а не влажность сама по себе.

- Хороший **сухой** лечебный корм с высокой клетчаткой — отличный вариант, легко отмерять одинаковыми порциями
- **Влажный** подойдёт привередам и собакам, которым нужно больше воды
- Можно сочетать — но тогда фиксируйте пропорцию и не меняйте её

> **Важно:** для собаки главное — **постоянство**. Один и тот же корм, та же марка, та же порция изо дня в день. Инсулин подобран под конкретную еду; смена корма «на лету» ломает контроль сахара сильнее, чем у кошек.

### Смена корма

Если корм всё же нужно поменять — делайте это плавно за 7-10 дней и предупредите ветеринара: возможно, потребуется скорректировать дозу инсулина.

> **Золотое правило:** у собаки читаем этикетку на клетчатку и жир, а дальше держимся выбранного корма как якоря. Предсказуемость = ровный сахар.`,
    en: `## How to Read Dog Food Labels

For dogs, the feeding strategy is the **opposite of a cat's**. A cat needs minimal carbs; a dog needs **fiber and complex carbs** that flatten the post-meal glucose curve. Plus **low fat** — to guard against pancreatitis.

So we read the label differently, too.

### What to Look For

**Good signs for a diabetic dog:**
- **High fiber** — aim for 10-15% on a dry-matter basis. Look for whole sources: beet pulp, bran, pea fiber, cellulose
- **Complex carbs**: whole grains, barley, oats — slow, not "fast sugar"
- **Moderate protein** (25-35% DM) — supports muscle
- **Low fat** (usually up to 20-25% DM; if pancreatitis is a concern your vet may recommend lower)

**Bad signs:**
- **Simple sugars**: sugar, syrup, molasses, honey, dextrose in the ingredients
- **White rice, white bread** as the main carb — a fast glucose spike
- **High fat** — pancreatitis risk
- "Semi-moist" foods in soft pouches — often held together with sugar/glycerin

### About Dry Matter (DM)

The label percentages are "as fed," water included. To compare a dry and a wet food fairly, remove the water — that's the **dry-matter** conversion. Compare two foods' fiber and fat on a DM basis. The **built-in calculator in the app** converts the label numbers for you.

### Wet or Dry?

For dogs this matters **less** than for cats. Fiber, portion consistency, and low fat matter more than moisture itself.

- A good high-fiber prescription **dry** food is an excellent choice and easy to portion identically
- **Wet** food suits picky dogs and those who need more water
- You can mix them — but then lock in the ratio and don't change it

> **Important:** for a dog, the priority is **consistency**. Same food, same brand, same portion day after day. Insulin is dosed for one specific food; switching foods on the fly breaks glucose control more in dogs than in cats.

### Changing Foods

If you do need to switch, do it gradually over 7-10 days and tell your vet — the insulin dose may need adjusting.

> **Golden rule:** for a dog, read the label for fiber and fat, then hold onto your chosen food like an anchor. Predictability = steady blood sugar.`,
  },
  category: 'nutrition',
  species: 'dog',
  readingTimeMinutes: 5,
  order: 4,
  relatedArticleIds: ['dog-diet', 'dog-foods-to-avoid', 'dog-home-diet', 'dog-pancreatitis'],
  references: [
    {
      ru: 'AAHA Diabetes Management Guidelines, 2018',
      en: 'AAHA Diabetes Management Guidelines, 2018',
    },
    {
      ru: 'Fleeman LM, Rand JS — Management of canine diabetes, Vet Clin North Am Small Anim Pract, 2001',
      en: 'Fleeman LM, Rand JS — Management of canine diabetes, Vet Clin North Am Small Anim Pract, 2001',
    },
  ],
  tags: [
    { ru: 'состав корма', en: 'food label' },
    { ru: 'клетчатка', en: 'fiber' },
    { ru: 'сухое вещество', en: 'dry matter' },
    { ru: 'этикетка', en: 'label' },
  ],
};
