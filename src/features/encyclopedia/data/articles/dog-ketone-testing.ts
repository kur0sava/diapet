import { Article } from '../../types';

export const dogKetoneTesting: Article = {
  id: 'dog-ketone-testing',
  titleKey: {
    ru: 'Домашнее тестирование кетонов у собаки',
    en: 'Home Ketone Testing for Dogs',
  },
  summaryKey: {
    ru: 'Когда и как проверять кетоны у собаки дома, какие полоски использовать и как трактовать результат.',
    en: 'When and how to check ketones in a dog at home, which strips to use, and how to interpret the result.',
  },
  contentKey: {
    ru: `# Домашнее тестирование кетонов у собаки

Кетоны — сигнал тревоги. Когда организм не может использовать глюкозу (мало инсулина), он сжигает жир. Побочный продукт — кетоны. Много кетонов = кетоацидоз (ДКА) = экстренная ситуация.

## Когда проверять

**Обязательно:**
- Глюкоза стойко выше 14-15 ммоль/л
- Собака не ест более 24 часов
- Рвота + вялость при любом повышении глюкозы — проверяйте немедленно
- Запах ацетона изо рта
- Только что поставлен диагноз (до начала инсулина)
- Есть провоцирующая болезнь: инфекция, панкреатит, течка у суки

**Не обязательно:**
- Стабильная собака с нормальным сахаром и хорошим самочувствием

## Способы

### 1. Тест-полоски для мочи (Ketostix и аналоги)
- Дёшево и просто
- Показывают ацетоацетат в моче
- Результат отстаёт от реального уровня на 2-4 часа
- У собак мочу собрать обычно проще, чем у кошек (например, чистой ёмкостью во время прогулки)

**Шкала:**
- Отрицательно / следы — норма
- Малый (+) — повторите через 4 часа, проверьте глюкозу
- Умеренный (++) — звоните ветеринару
- Большой (+++) — **экстренно в клинику**

### 2. Анализатор кетонов крови (FreeStyle Optium и др.)
- Точнее, результат в реальном времени
- Показывает β-гидроксибутират — главный кетон при ДКА
- Капля крови из уха, как для глюкометра

**Шкала:**
- < 0.5 ммоль/л — норма
- 0.5-1.5 — лёгкое повышение, мониторьте
- 1.5-3.0 — звоните ветеринару
- > 3.0 — **экстренная ситуация**

## Важный нюанс полосок для мочи

Полоска ловит ацетоацетат, но **не** β-гидроксибутират (основной кетон при ДКА). Поэтому отрицательный результат **не исключает** ДКА. Если собаке плохо — в клинику независимо от полоски. Анализатор крови этого недостатка лишён.

## Что делать при положительном результате

1. Измерьте глюкозу
2. Глюкоза высокая + кетоны умеренные/высокие — **в клинику**
3. Глюкоза нормальная + следы кетонов — повторите через 4 часа
4. Никогда не пытайтесь лечить кетоацидоз дома

> Тест-полоски — ваш домашний «детектор дыма». Дёшево, просто, и однажды может спасти жизнь.`,
    en: `# Home Ketone Testing for Dogs

Ketones are an alarm signal. When the body can't use glucose (too little insulin), it burns fat. The byproduct is ketones. Too many ketones = ketoacidosis (DKA) = emergency.

## When to check

**Always check if:**
- Glucose stays above 14-15 mmol/L
- The dog hasn't eaten for more than 24 hours
- Vomiting + lethargy at any glucose elevation — check immediately
- Acetone smell on the breath
- Diabetes just diagnosed (before starting insulin)
- A triggering illness is present: infection, pancreatitis, a female's heat

**Not necessary if:**
- A stable dog with normal sugar and feeling well

## Methods

### 1. Urine test strips (Ketostix and similar)
- Cheap and simple
- Show acetoacetate in urine
- Results lag real levels by 2-4 hours
- In dogs, collecting urine is usually easier than in cats (e.g., a clean container during a walk)

**Scale:**
- Negative / trace — normal
- Small (+) — recheck in 4 hours, check glucose
- Moderate (++) — call the vet
- Large (+++) — **emergency clinic**

### 2. Blood ketone meter (FreeStyle Optium, etc.)
- More accurate, real-time results
- Measures β-hydroxybutyrate — the main ketone in DKA
- Drop of blood from the ear, like a glucometer

**Scale:**
- < 0.5 mmol/L — normal
- 0.5-1.5 — mild elevation, monitor
- 1.5-3.0 — call the vet
- > 3.0 — **emergency**

## Important nuance about urine strips

Strips detect acetoacetate but **not** β-hydroxybutyrate (the main ketone in DKA). So a negative result **does not rule out** DKA. If your dog is unwell — go to the clinic regardless of the strip. A blood meter doesn't have this limitation.

## What to do with a positive result

1. Check glucose
2. High glucose + moderate/high ketones — **go to the clinic**
3. Normal glucose + trace ketones — recheck in 4 hours
4. Never try to treat ketoacidosis at home

> Test strips are your home "smoke detector." Cheap, simple, and one day could save a life.`,
  },
  category: 'medical',
  species: 'dog',
  readingTimeMinutes: 5,
  order: 3,
  relatedArticleIds: ['dog-dka', 'dog-glucose-monitoring', 'dog-first-days'],
  references: [
    {
      ru: "O'Brien MA — Diabetic ketoacidosis, Vet Clin North Am Small Anim Pract, 2010",
      en: "O'Brien MA — Diabetic ketoacidosis, Vet Clin North Am Small Anim Pract, 2010",
    },
    {
      ru: 'AAHA Diabetes Management Guidelines for Dogs and Cats, 2018',
      en: 'AAHA Diabetes Management Guidelines for Dogs and Cats, 2018',
    },
  ],
  tags: [
    { ru: 'кетоны', en: 'ketones' },
    { ru: 'ДКА', en: 'DKA' },
    { ru: 'тест-полоски', en: 'test strips' },
    { ru: 'мониторинг', en: 'monitoring' },
  ],
};
