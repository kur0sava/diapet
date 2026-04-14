import { Article } from '../../types';

export const dogHypoglycemia: Article = {
  id: 'dog-hypoglycemia',
  titleKey: {
    ru: 'Гипогликемия у собак — первая помощь',
    en: 'Hypoglycemia in Dogs — First Aid',
  },
  summaryKey: {
    ru: 'Гипогликемия — самая опасная экстренная ситуация при диабете. Знание первой помощи может спасти жизнь вашей собаке.',
    en: "Hypoglycemia is the most dangerous emergency in diabetes. Knowing first aid can save your dog's life.",
  },
  contentKey: {
    ru: `# Гипогликемия у собак — первая помощь

## Что это?

Гипогликемия — это опасное падение уровня глюкозы в крови ниже нормы. У собак это обычно глюкоза **ниже 3.3 ммоль/л (60 мг/дл)**, а экстренная ситуация — **ниже 2.2 ммоль/л (40 мг/дл)**.

## Причины

- Передозировка инсулина
- Собака не съела всю порцию перед уколом
- Необычно интенсивная физическая нагрузка
- Рвота после еды (корм не усвоился, а инсулин введён)
- Случайная двойная инъекция

## Симптомы (от лёгких к тяжёлым)

### Лёгкие:
- Дрожь, тремор
- Слабость, вялость
- Повышенный аппетит

### Средние:
- Дезориентация, «пьяная» походка
- Беспокойство или апатия
- Слюнотечение

### Тяжёлые (ЭКСТРЕННАЯ СИТУАЦИЯ):
- Судороги
- Потеря сознания
- Коллапс

## Первая помощь

### Если собака В СОЗНАНИИ и может глотать:
1. **Нанеси мёд, кленовый сироп или сахарный раствор на дёсны.** Доза **строго зависит от веса** — избыток для мелкой собаки сам по себе опасен:
   - **до 5 кг** (той-породы, чихуахуа, йорк): **½–1 чайная ложка**
   - **5–15 кг**: **1–2 чайные ложки**
   - **15–30 кг**: **1 столовая ложка**
   - **более 30 кг**: **1–2 столовые ложки**
2. **Не заливай жидкость в пасть** — только размазывай по дёснам
3. Симптомы должны улучшиться через **5–15 минут**. Если через 10–15 минут улучшения нет — повтори ту же дозу и езжай в клинику
4. Как только собака может есть — дай небольшую порцию обычного корма
5. **Обязательно позвони ветеринару**, даже если стало лучше

### Если собака БЕЗ СОЗНАНИЯ или в судорогах:
1. **НЕ давай ничего в пасть** — риск аспирации
2. Нанеси мёд/сироп на дёсны (глюкоза всасывается через слизистую)
3. **Немедленно везите в ветеринарную клинику** — это экстренная ситуация
4. По дороге: оберни собаку одеялом, держи голову ниже тела

## Профилактика

- **Всегда корми перед инъекцией** — если собака не поела, не вводи полную дозу
- Имей сироп/мёд дома и на прогулке
- Избегай резких изменений физической нагрузки
- Никогда не вводи инсулин дважды, если не уверен
- Записывай каждый укол в приложение — это защита от ошибок

## Важно помнить

Один эпизод гипогликемии — это не конец света. Но это сигнал обсудить с ветеринаром:
- Правильность дозы
- Расписание кормления
- Режим прогулок`,
    en: `# Hypoglycemia in Dogs — First Aid

## What is it?

Hypoglycemia is a dangerous drop in blood glucose below normal levels. In dogs, this is usually glucose **below 3.3 mmol/L (60 mg/dL)**, and an emergency is **below 2.2 mmol/L (40 mg/dL)**.

## Causes

- Insulin overdose
- Dog didn't eat the full portion before injection
- Unusually intense physical activity
- Vomiting after eating (food not absorbed, but insulin given)
- Accidental double injection

## Symptoms (mild to severe)

### Mild:
- Trembling, tremors
- Weakness, lethargy
- Increased appetite

### Moderate:
- Disorientation, "drunk" walk
- Restlessness or apathy
- Drooling

### Severe (EMERGENCY):
- Seizures
- Loss of consciousness
- Collapse

## First Aid

### If the dog IS CONSCIOUS and can swallow:
1. **Apply honey, maple syrup, or sugar solution to the gums.** Dose **depends on body weight** — too much is itself risky for small dogs:
   - **under 5 kg** (toy breeds, Chihuahua, Yorkie): **½–1 teaspoon**
   - **5–15 kg**: **1–2 teaspoons**
   - **15–30 kg**: **1 tablespoon**
   - **over 30 kg**: **1–2 tablespoons**
2. **Don't pour liquid into the mouth** — just smear on gums
3. Symptoms should improve within **5–15 minutes**. If no improvement after 10–15 minutes — repeat the same dose and head to the clinic
4. Once the dog can eat — give a small portion of regular food
5. **Always call your vet**, even if things improve

### If the dog is UNCONSCIOUS or having seizures:
1. **Do NOT give anything by mouth** — aspiration risk
2. Apply honey/syrup to gums (glucose absorbs through the mucosa)
3. **Get to a veterinary clinic immediately** — this is an emergency
4. On the way: wrap the dog in a blanket, keep the head below the body

## Prevention

- **Always feed before injection** — if the dog didn't eat, don't give the full dose
- Keep syrup/honey at home and on walks
- Avoid sudden changes in exercise intensity
- Never inject insulin twice if you're unsure
- Log every injection in the app — it protects against mistakes

## Important to remember

One hypoglycemia episode isn't the end of the world. But it's a signal to discuss with your vet:
- Whether the dose is correct
- Feeding schedule
- Exercise routine`,
  },
  category: 'complications',
  species: 'dog',
  readingTimeMinutes: 5,
  order: 3,
  relatedArticleIds: ['dog-diabetes-basics', 'dog-insulin', 'dog-diet'],
  references: [
    {
      ru: 'AAHA Diabetes Management Guidelines, 2018',
      en: 'AAHA Diabetes Management Guidelines, 2018',
    },
    {
      ru: 'Feldman EC, Nelson RW — Canine and Feline Endocrinology, 4th ed., 2015',
      en: 'Feldman EC, Nelson RW — Canine and Feline Endocrinology, 4th ed., 2015',
    },
  ],
  tags: [
    { ru: 'гипогликемия', en: 'hypoglycemia' },
    { ru: 'экстренная помощь', en: 'emergency' },
    { ru: 'первая помощь', en: 'first aid' },
    { ru: 'безопасность', en: 'safety' },
  ],
};
