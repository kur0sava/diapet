import { Article } from '../../types';

export const dogDiet: Article = {
  id: 'dog-diet',
  titleKey: {
    ru: 'Диета для диабетической собаки',
    en: 'Diet for a Diabetic Dog',
  },
  summaryKey: {
    ru: 'В отличие от кошек, диабетическим собакам нужна диета с высоким содержанием клетчатки и сложных углеводов. Главный принцип — стабильность.',
    en: 'Unlike cats, diabetic dogs need a diet high in fiber and complex carbs. The key principle is consistency.',
  },
  contentKey: {
    ru: `# Диета для диабетической собаки

## Почему диета собак отличается от кошачьей?

Кошки — облигатные хищники, и им нужна высокобелковая, низкоуглеводная диета. Собаки — всеядные, и их метаболизм хорошо справляется с правильными углеводами. Для диабетических собак рекомендуется диета, **богатая клетчаткой** и **сложными углеводами**.

## Основные принципы

### 1. Высокая клетчатка
- Клетчатка замедляет всасывание глюкозы после еды
- Это даёт более плавные показатели глюкозы, без резких пиков
- Целевое содержание клетчатки: **10–15% на сухое вещество**

### 2. Сложные углеводы
- Предпочтительнее простых сахаров
- Медленно расщепляются, обеспечивая стабильную энергию
- Избегай: белый рис, белый хлеб, сладости

### 3. Умеренный белок
- 25–35% на сухое вещество
- Поддерживает мышечную массу без чрезмерной нагрузки на почки

### 4. Низкий жир
- Важно для профилактики панкреатита — частого спутника диабета у собак
- Максимум 20–25% на сухое вещество

## Специализированные корма

- **Hills w/d** — высокая клетчатка, низкий жир, для диабета и контроля веса (⚠️ в РФ официальных поставок больше нет — производство ушло; доступен за рубежом)
- **Royal Canin Diabetic (Canine)** — специально для собак с диабетом, высокая клетчатка (в РФ производится, завод Дмитров)
- **Farmina Vet Life Diabetic (Canine)** — доступен в Европе; в РФ ввоз сухих кормов Farmina запрещён с 2024 (недоступен)
- ⚠️ **Не давай собаке кошачьи диабетические корма** (Purina DM Feline, Hill's m/d Feline и др.) — у кошек стратегия «высокий белок / низкие углеводы», собаке она не подходит и повышает риск панкреатита

## Главное правило: СТАБИЛЬНОСТЬ

**Одно и то же время → Тот же корм → Та же порция → Тот же инсулин**

Это самый важный принцип для собак с диабетом. Инсулин подобран под определённое количество пищи. Если кормление нестабильно — глюкоза будет «прыгать».

## Лакомства

- Можно: кусочки варёной курицы, зелёная фасоль, морковь
- Нельзя: кости с мозгом, сладкие фрукты, хлеб, еда со стола
- Лакомства должны составлять **не более 10%** дневного рациона

## Время кормления

- Корми 2 раза в день, за 15–30 минут до инъекции инсулина
- Если собака не съела всю порцию — **не вводи полную дозу инсулина** и свяжись с ветеринаром`,
    en: `# Diet for a Diabetic Dog

## Why is a dog's diet different from a cat's?

Cats are obligate carnivores who need a high-protein, low-carb diet. Dogs are omnivores, and their metabolism handles the right carbs well. For diabetic dogs, a diet **rich in fiber** and **complex carbohydrates** is recommended.

## Key principles

### 1. High fiber
- Fiber slows glucose absorption after meals
- This gives smoother glucose readings, without sharp spikes
- Target fiber content: **10–15% dry matter**

### 2. Complex carbohydrates
- Preferred over simple sugars
- Break down slowly, providing stable energy
- Avoid: white rice, white bread, sweets

### 3. Moderate protein
- 25–35% dry matter
- Supports muscle mass without excessive kidney load

### 4. Low fat
- Important for preventing pancreatitis — a common companion to canine diabetes
- Maximum 20–25% dry matter

## Specialized foods

- **Hills w/d** — high fiber, low fat, for diabetes and weight management (⚠️ no longer officially supplied in Russia — production left the market; available abroad)
- **Royal Canin Diabetic (Canine)** — specifically for diabetic dogs, high fiber (made in Russia, Dmitrov plant)
- **Farmina Vet Life Diabetic (Canine)** — available in Europe; Farmina dry foods have been banned from import into Russia since 2024 (unavailable)
- ⚠️ **Don't feed a dog feline diabetic foods** (Purina DM Feline, Hill's m/d Feline, etc.) — cats use a "high protein / low carb" strategy that is unsuitable for dogs and raises pancreatitis risk

## The golden rule: CONSISTENCY

**Same time → Same food → Same portion → Same insulin**

This is the most important principle for diabetic dogs. Insulin is dosed for a specific amount of food. If feeding is inconsistent — glucose will fluctuate.

## Treats

- OK: pieces of boiled chicken, green beans, carrots
- Avoid: marrow bones, sweet fruits, bread, table scraps
- Treats should be **no more than 10%** of the daily diet

## Feeding schedule

- Feed twice daily, 15–30 minutes before insulin injection
- If the dog didn't finish the portion — **don't give the full insulin dose** and contact your vet`,
  },
  category: 'nutrition',
  species: 'dog',
  readingTimeMinutes: 6,
  order: 2,
  relatedArticleIds: ['dog-diabetes-basics', 'dog-insulin'],
  references: [
    {
      ru: 'Fleeman LM, Rand JS — Management of canine diabetes, Vet Clin North Am Small Anim Pract, 2001',
      en: 'Fleeman LM, Rand JS — Management of canine diabetes, Vet Clin North Am Small Anim Pract, 2001',
    },
    {
      ru: 'AAHA Diabetes Management Guidelines, 2018',
      en: 'AAHA Diabetes Management Guidelines, 2018',
    },
  ],
  tags: [
    { ru: 'диета', en: 'diet' },
    { ru: 'питание', en: 'nutrition' },
    { ru: 'клетчатка', en: 'fiber' },
    { ru: 'корм', en: 'food' },
  ],
};
