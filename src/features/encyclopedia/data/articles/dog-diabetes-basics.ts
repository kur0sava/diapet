import { Article } from '../../types';

export const dogDiabetesBasics: Article = {
  id: 'dog-diabetes-basics',
  titleKey: {
    ru: 'Диабет у собак: что нужно знать',
    en: 'Diabetes in Dogs: What You Need to Know',
  },
  summaryKey: {
    ru: 'Собачий диабет — почти всегда 1-го типа. Это значит пожизненный инсулин, но при хорошем контроле собаки живут полной, счастливой жизнью.',
    en: 'Canine diabetes is almost always type 1. That means lifelong insulin, but with good control dogs live full, happy lives.',
  },
  contentKey: {
    ru: `# Диабет у собак: что нужно знать

## Что такое собачий диабет?

Сахарный диабет у собак — это хроническое заболевание, при котором поджелудочная железа перестаёт вырабатывать достаточно инсулина. В отличие от кошек (у которых чаще встречается тип 2), у собак диабет почти всегда **1-го типа** — аутоиммунное разрушение бета-клеток.

**Что это значит на практике:**
- Инсулин нужен пожизненно
- Ремиссия крайне маловероятна
- Но при правильном управлении прогноз хороший

## Кто в группе риска?

- **Возраст:** чаще развивается у собак 7–9 лет
- **Пол:** нестерилизованные суки в 2 раза чаще (из-за влияния прогестерона)
- **Породы:** самоеды, австралийские терьеры, миниатюрные шнауцеры, пудели, бишон фризе, мопсы
- **Вес:** ожирение повышает риск, но не является прямой причиной

## Типичные симптомы

- **Полиурия** — частое мочеиспускание (глюкоза «тянет» воду)
- **Полидипсия** — жажда (компенсация потери жидкости)
- **Потеря веса** при сохранённом аппетите
- **Помутнение глаз** — катаракта (у 75–80% собак с диабетом)
- **Вялость, слабость**

## Диагностика

Ветеринар ставит диагноз по:
- Стойкой гипергликемии (глюкоза натощак > 11 ммоль/л)
- Глюкозурии (глюкоза в моче)
- Фруктозамину (средняя глюкоза за 2–3 недели)

## Лечение

1. **Инсулинотерапия** — подкожные инъекции 2 раза в день
2. **Стабильная диета** — высокая клетчатка, сложные углеводы, умеренный белок
3. **Регулярная физическая активность** — спокойные, но ежедневные прогулки
4. **Мониторинг глюкозы** — домашние замеры + кривые глюкозы

## Прогноз

При хорошем контроле диабетические собаки живут столько же, сколько здоровые сверстники. Ключ — **стабильность**: одинаковое кормление, одинаковые прогулки, регулярный инсулин.

**Диабет — это не приговор. Это режим, к которому привыкают и собака, и хозяин.**`,
    en: `# Diabetes in Dogs: What You Need to Know

## What is canine diabetes?

Diabetes mellitus in dogs is a chronic condition where the pancreas stops producing enough insulin. Unlike cats (who more often have type 2), dogs almost always have **type 1** diabetes — autoimmune destruction of beta cells.

**What this means in practice:**
- Insulin is needed for life
- Remission is extremely unlikely
- But with proper management, the prognosis is good

## Who is at risk?

- **Age:** most commonly develops in dogs aged 7–9
- **Sex:** unspayed females are 2× more likely (due to progesterone effects)
- **Breeds:** Samoyeds, Australian Terriers, Miniature Schnauzers, Poodles, Bichon Frise, Pugs
- **Weight:** obesity increases risk but isn't a direct cause

## Typical symptoms

- **Polyuria** — frequent urination (glucose "pulls" water)
- **Polydipsia** — excessive thirst (compensating for fluid loss)
- **Weight loss** despite good appetite
- **Cloudy eyes** — cataracts (in 75–80% of diabetic dogs)
- **Lethargy, weakness**

## Diagnosis

Your vet diagnoses based on:
- Persistent hyperglycemia (fasting glucose > 11 mmol/L)
- Glucosuria (glucose in urine)
- Fructosamine (average glucose over 2–3 weeks)

## Treatment

1. **Insulin therapy** — subcutaneous injections twice daily
2. **Consistent diet** — high fiber, complex carbs, moderate protein
3. **Regular exercise** — calm but daily walks
4. **Glucose monitoring** — home checks + glucose curves

## Prognosis

With good control, diabetic dogs live as long as healthy peers. The key is **consistency**: same feeding, same walks, regular insulin.

**Diabetes isn't a death sentence. It's a routine that both you and your dog will get used to.**`,
  },
  category: 'basics',
  species: 'dog',
  readingTimeMinutes: 6,
  order: 1,
  relatedArticleIds: ['dog-cataracts', 'dog-diet', 'dog-insulin'],
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
    { ru: 'диабет', en: 'diabetes' },
    { ru: 'основы', en: 'basics' },
    { ru: 'тип 1', en: 'type 1' },
    { ru: 'собака', en: 'dog' },
  ],
};
