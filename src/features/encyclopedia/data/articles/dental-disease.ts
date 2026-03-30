import { Article } from '../../types';

export const dentalDisease: Article = {
  id: 'dental-disease',
  titleKey: {
    ru: 'Зубы и диабет',
    en: 'Dental Disease and Diabetes',
  },
  summaryKey: {
    ru: 'Связь между здоровьем зубов и диабетом, анестезия у диабетиков, когда нужно удалять зубы.',
    en: 'The connection between dental health and diabetes, anesthesia in diabetics, when teeth need to come out.',
  },
  contentKey: {
    ru: `## Зубы и диабет: двусторонняя связь

Болезни зубов и дёсен — одна из самых частых проблем кошек. У диабетиков они встречаются ещё чаще. И что хуже — больные зубы ухудшают контроль диабета, создавая порочный круг.

### Почему диабетики чаще страдают от зубов

- Высокий сахар в слюне создаёт питательную среду для бактерий
- Диабет снижает иммунитет, ослабляя защиту дёсен
- Хроническое воспаление дёсен усиливает инсулинорезистентность
- Кошка с больными зубами ест хуже → нестабильный сахар

### Признаки проблем с зубами

- Неприятный запах изо рта
- Слюнотечение, иногда с кровью
- Кошка ест медленнее или выбирает только мягкий корм
- Трёт лапой морду
- Похудение при нормальном аппетите
- Красные или опухшие дёсны

### Анестезия у диабетиков

Многие владельцы боятся анестезии — и это понятно. Но у современных ветеринаров есть протоколы для диабетиков:

**Подготовка:**
- Утренняя доза инсулина: обычно вводят половину обычной дозы
- Или инсулин не вводят утром — по решению ветеринара
- Глюкоза мониторится каждые 30-60 минут во время процедуры
- Внутривенная капельница с глюкозой при необходимости

**Риски:**
- Гипогликемия под наркозом (если ввели инсулин, а кошка не ела)
- Гипергликемия от стресса и анестетиков
- Оба контролируемы при правильном мониторинге

**Рекомендации:**
- Операция утром, первой в очереди (минимальное голодание)
- Попросите замер глюкозы до, во время и после процедуры
- Забирайте кошку в тот же день, если возможно
- Дома: уменьшите дозу инсулина на 25-50% в первый день (кошка может есть меньше)

### Когда зубы нужно удалять

- FORL (одонтокластическая резорбция) — специфическая кошачья болезнь, зуб разрушается изнутри. Лечение одно — удаление
- Тяжёлый периодонтит с подвижностью зубов
- Абсцессы корня зуба
- Стоматит (воспаление всей ротовой полости)

### После удаления

- Кошки отлично едят и без зубов — влажный корм подходит идеально
- После санации полости рта контроль диабета часто **улучшается**
- Некоторым кошкам удаётся снизить дозу инсулина после лечения зубов

> **Не откладывайте:** больные зубы — это боль и инфекция. Лечение зубов может быть тем фактором, которого не хватало для стабилизации сахара.`,
    en: `## Dental Disease and Diabetes: A Two-Way Street

Dental and gum disease is one of the most common problems in cats. In diabetics, it's even more frequent. Worse still — bad teeth worsen diabetes control, creating a vicious cycle.

### Why Diabetics Suffer More Dental Problems

- High sugar in saliva creates a breeding ground for bacteria
- Diabetes lowers immunity, weakening gum defenses
- Chronic gum inflammation increases insulin resistance
- A cat with dental pain eats poorly → unstable blood sugar

### Signs of Dental Problems

- Bad breath
- Drooling, sometimes with blood
- Cat eats slower or only chooses soft food
- Pawing at the face
- Weight loss despite normal appetite
- Red or swollen gums

### Anesthesia in Diabetics

Many owners fear anesthesia — and understandably so. But modern vets have protocols for diabetic patients:

**Preparation:**
- Morning insulin dose: usually give half the normal dose
- Or skip morning insulin entirely — per vet's decision
- Glucose monitored every 30-60 minutes during the procedure
- IV glucose drip if needed

**Risks:**
- Hypoglycemia under anesthesia (if insulin was given but cat didn't eat)
- Hyperglycemia from stress and anesthetic agents
- Both are manageable with proper monitoring

**Recommendations:**
- Surgery in the morning, first in line (minimal fasting)
- Ask for glucose checks before, during, and after the procedure
- Take the cat home the same day if possible
- At home: reduce insulin dose by 25-50% on the first day (cat may eat less)

### When Teeth Need to Come Out

- FORL (feline odontoclastic resorptive lesions) — a cat-specific disease where the tooth breaks down from within. The only treatment is extraction
- Severe periodontal disease with loose teeth
- Root abscesses
- Stomatitis (inflammation of the entire oral cavity)

### After Extraction

- Cats eat perfectly well without teeth — wet food works great
- After dental treatment, diabetes control often **improves**
- Some cats can reduce their insulin dose after dental work

> **Don't delay:** bad teeth mean pain and infection. Dental treatment could be the missing factor for stabilizing blood sugar.`,
  },
  category: 'medical',
  readingTimeMinutes: 6,
  order: 13,
  relatedArticleIds: ['what-is-diabetes', 'comorbidities', 'diet'],
  references: [
    { ru: 'AAFP/AAHA Dental Care Guidelines for Dogs and Cats, 2019', en: 'AAFP/AAHA Dental Care Guidelines for Dogs and Cats, 2019' },
    { ru: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023', en: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023' },
  ],
  tags: [
    { ru: 'зубы', en: 'dental' },
    { ru: 'анестезия', en: 'anesthesia' },
    { ru: 'стоматология', en: 'dentistry' },
    { ru: 'FORL', en: 'FORL' },
  ],
};
