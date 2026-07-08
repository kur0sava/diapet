import { Article } from '../../types';

export const dogPancreatitis: Article = {
  id: 'dog-pancreatitis',
  titleKey: {
    ru: 'Панкреатит и диабет у собак',
    en: 'Pancreatitis and Diabetes in Dogs',
  },
  summaryKey: {
    ru: 'Панкреатит часто идёт рука об руку с диабетом. Как распознать обострение и почему собаке нужна строгая нежирная диета.',
    en: 'Pancreatitis often goes hand in hand with diabetes. How to recognize a flare and why a dog needs a strict low-fat diet.',
  },
  contentKey: {
    ru: `# Панкреатит и диабет у собак

## Почему эти болезни связаны

Поджелудочная железа делает две работы: вырабатывает пищеварительные ферменты и производит инсулин. Когда она воспаляется (панкреатит), страдают обе функции. У собак панкреатит — один из самых частых спутников диабета, и связь двусторонняя: тяжёлый панкреатит может разрушить бета-клетки и вызвать диабет, а диабет повышает риск панкреатита.

## Главное отличие от кошек: жир

Это ключевой момент. У собак панкреатит тесно связан с **жирной пищей** — жирное лакомство или «кусочек со стола» могут спровоцировать острый приступ. Поэтому собаке с панкреатитом нужна **строгая диета с низким жиром**.

> Важно: у кошек всё наоборот — жёсткое ограничение жира им не рекомендуется. Не переносите кошачьи советы на собаку и наоборот.

## Признаки обострения

У собак панкреатит обычно проявляется ярче, чем у кошек:

- **Рвота** — частый и заметный признак
- **Отказ от еды**
- **Боль в животе** — характерная «поза молящейся собаки»: передние лапы и грудь на полу, зад приподнят
- **Вялость, угнетённость**
- **Диарея**
- Иногда лихорадка

## Когда к ветеринару

- Рвота 2 и более раз
- Отказ от еды более 24 часов
- Явная боль в животе
- Глюкоза стойко выше 20 ммоль/л на привычной дозе
- Обезвоживание (сухие дёсны, вялость кожи)

Не ждите — при панкреатите время важно, тяжёлый приступ опасен для жизни.

## Диагностика

- Специфическая панкреатическая липаза собак (**cPLI / Spec cPL**) — основной анализ
- УЗИ брюшной полости
- Общий и биохимический анализ крови

## Кормление

**В острую фазу (по назначению ветеринара):**
- Не вводите инсулин, если собака не ест!
- Часто требуется госпитализация, капельницы, противорвотные и обезболивание
- Раннее возобновление кормления маленькими порциями нежирной легко усваиваемой еды

**Долгосрочно:**
- **Диета с низким жиром** — основа профилактики обострений
- Никаких жирных лакомств, костей с мозгом, еды со стола
- Стабильный режим: одинаковое время и порции
- Контроль веса — ожирение повышает риск

## Влияние на диабет

Во время обострения инсулинорезистентность растёт, сахар «скачет», привычная доза может не работать. Не наращивайте дозу вслепую — стабилизация панкреатита обычно возвращает контроль. Все изменения дозы — с ветеринаром.

> **Главное:** у собаки с диабетом и склонностью к панкреатиту низкожировая диета и отказ от жирных лакомств — не прихоть, а защита от опасных для жизни приступов.`,
    en: `# Pancreatitis and Diabetes in Dogs

## Why these conditions are connected

The pancreas has two jobs: producing digestive enzymes and making insulin. When it becomes inflamed (pancreatitis), both functions suffer. In dogs, pancreatitis is one of the most common companions of diabetes, and the link runs both ways: severe pancreatitis can destroy beta cells and cause diabetes, while diabetes raises pancreatitis risk.

## The key difference from cats: fat

This is the crucial point. In dogs, pancreatitis is closely tied to **fatty food** — a fatty treat or a "bite from the table" can trigger an acute attack. So a dog with pancreatitis needs a **strict low-fat diet**.

> Important: in cats it's the opposite — strict fat restriction is not recommended for them. Don't transfer cat advice to a dog or vice versa.

## Signs of a flare

In dogs, pancreatitis usually presents more dramatically than in cats:

- **Vomiting** — a frequent and obvious sign
- **Refusal to eat**
- **Abdominal pain** — the classic "praying" posture: front legs and chest on the floor, rear raised
- **Lethargy, depression**
- **Diarrhea**
- Sometimes fever

## When to see the vet

- Vomiting 2 or more times
- Refusal to eat for more than 24 hours
- Obvious abdominal pain
- Glucose persistently above 20 mmol/L on the usual dose
- Dehydration (dry gums, skin that tents)

Don't wait — with pancreatitis, timing matters; a severe attack is life-threatening.

## Diagnosis

- Canine specific pancreatic lipase (**cPLI / Spec cPL**) — the main test
- Abdominal ultrasound
- Complete blood count and chemistry

## Feeding

**Acute phase (per your vet):**
- Don't give insulin if the dog isn't eating!
- Hospitalization, IV fluids, anti-nausea, and pain control are often needed
- Early reintroduction of small portions of low-fat, easily digestible food

**Long term:**
- **A low-fat diet** — the cornerstone of flare prevention
- No fatty treats, marrow bones, or table scraps
- A consistent routine: same times and portions
- Weight control — obesity increases risk

## Effect on diabetes

During a flare, insulin resistance rises, blood sugar swings, and the usual dose may not work. Don't blindly increase the dose — stabilizing the pancreatitis usually restores control. Any dose change is with your vet.

> **Bottom line:** for a diabetic dog prone to pancreatitis, a low-fat diet and avoiding fatty treats aren't a whim — they're protection against life-threatening attacks.`,
  },
  category: 'complications',
  species: 'dog',
  readingTimeMinutes: 5,
  order: 4,
  relatedArticleIds: ['dog-comorbidities', 'dog-diet', 'dog-dka'],
  references: [
    {
      ru: 'Xenoulis PG, Steiner JM — Canine pancreatitis, Vet Clin North Am Small Anim Pract, 2013',
      en: 'Xenoulis PG, Steiner JM — Canine pancreatitis, Vet Clin North Am Small Anim Pract, 2013',
    },
    {
      ru: 'AAHA Diabetes Management Guidelines for Dogs and Cats, 2018',
      en: 'AAHA Diabetes Management Guidelines for Dogs and Cats, 2018',
    },
  ],
  tags: [
    { ru: 'панкреатит', en: 'pancreatitis' },
    { ru: 'осложнения', en: 'complications' },
    { ru: 'питание', en: 'nutrition' },
    { ru: 'низкий жир', en: 'low fat' },
  ],
};
