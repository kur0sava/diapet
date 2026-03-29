import { Article } from '../../types';

export const flexibleMonitoring: Article = {
  id: 'flexible-monitoring',
  titleKey: {
    ru: 'Реалистичный мониторинг глюкозы',
    en: 'Realistic Glucose Monitoring',
  },
  summaryKey: {
    ru: 'Не каждый может делать кривые глюкозы каждую неделю. Вот как контролировать диабет с минимальным стрессом для вас и кошки.',
    en: 'Not everyone can do glucose curves every week. Here\'s how to manage diabetes with minimal stress for you and your cat.',
  },
  contentKey: {
    ru: `## Реалистичный подход к мониторингу

Если вы читали про кривые глюкозы и чувствуете панику — остановитесь. Большинство владельцев не делают кривые каждую неделю. И их кошки живут отлично.

### Три уровня мониторинга

**Уровень 1: Минимальный (для всех)**
- Один утренний замер перед инъекцией, 2-3 раза в неделю
- Наблюдение за поведением: жажда, аппетит, активность, лоток
- Взвешивание раз в 2 недели
- Это уже отличный контроль!

**Уровень 2: Стандартный (рекомендуемый)**
- Утренний замер перед инъекцией ежедневно или через день
- Один замер в середине дня (надир) раз в неделю
- Фруктозамин каждые 2-3 месяца у ветеринара

**Уровень 3: Продвинутый**
- Полная кривая глюкозы раз в 2-4 недели (замер каждые 2 часа в течение 12ч)
- Подходит для фазы подбора дозы или перед визитом к ветеринару
- Не нужен постоянно!

### Утренний замер — ваш лучший друг

Один утренний замер перед инъекцией — это самый ценный показатель. Он говорит:
- Как кошка прошла ночь
- Не слишком ли низкий сахар для следующей инъекции
- Общий тренд: растёт, стабилен, снижается

**Когда одного утреннего замера мало:**
- Сахар скачет (то 5, то 20)
- Недавно изменили дозу
- Кошка ведёт себя необычно
- Ветеринар попросил сделать кривую

### Наблюдение без глюкометра

Удивительно, но внимательное наблюдение за кошкой даёт много информации:

- **Жажда:** меньше пьёт = сахар под контролем. Больше пьёт = сахар высокий
- **Лоток:** меньше мочи = хорошо. Огромные комки = сахар высокий
- **Вес:** стабильный или растущий = хорошо. Теряет вес = плохо
- **Активность:** играет, прыгает = хорошо. Вялый, много спит = проверьте сахар
- **Задние лапы:** ходит нормально = хорошо. «Проседает» = нейропатия, высокий сахар

### Когда НЕ нужна кривая

- Кошка стабильна уже месяц+ на текущей дозе
- Утренние замеры в пределах 5-12 ммоль/л
- Поведение нормальное
- Вес стабильный

### Когда кривая НУЖНА

- Только что начали инсулин
- Ветеринар изменил дозу
- Утренние замеры непредсказуемы
- Подозрение на ремиссию (сахар стабильно низкий)

> **Помните:** идеальный мониторинг — тот, который вы реально делаете. Лучше один замер в день, чем план на 8 замеров, который вы забросите через неделю.`,
    en: `## A Realistic Approach to Monitoring

If you've been reading about glucose curves and feeling panicked — stop. Most owners don't do curves every week. And their cats do just fine.

### Three Levels of Monitoring

**Level 1: Minimal (for everyone)**
- One morning reading before injection, 2-3 times per week
- Behavior observation: thirst, appetite, activity, litter box
- Weighing every 2 weeks
- This is already excellent monitoring!

**Level 2: Standard (recommended)**
- Morning reading before injection daily or every other day
- One midday reading (nadir) once a week
- Fructosamine every 2-3 months at the vet

**Level 3: Advanced**
- Full glucose curve every 2-4 weeks (reading every 2 hours for 12h)
- Best for the dose adjustment phase or before a vet visit
- Not needed all the time!

### The Morning Reading — Your Best Friend

One morning reading before injection is the single most valuable measurement. It tells you:
- How your cat got through the night
- Whether blood sugar is too low for the next injection
- The overall trend: rising, stable, or falling

**When one morning reading isn't enough:**
- Blood sugar is erratic (jumping between 5 and 20)
- You recently changed the dose
- Your cat is behaving unusually
- Your vet asked for a curve

### Monitoring Without a Glucometer

Surprisingly, careful observation of your cat provides a lot of information:

- **Thirst:** drinking less = sugar under control. Drinking more = sugar is high
- **Litter box:** less urine = good. Huge clumps = sugar is high
- **Weight:** stable or gaining = good. Losing weight = concerning
- **Activity:** playing, jumping = good. Lethargic, sleeping a lot = check blood sugar
- **Hind legs:** walking normally = good. "Sinking" posture = neuropathy, high sugar

### When You DON'T Need a Curve

- Cat has been stable for 1+ month on current dose
- Morning readings are in the 5-12 mmol/L range
- Behavior is normal
- Weight is stable

### When You DO Need a Curve

- Just started insulin
- Vet changed the dose
- Morning readings are unpredictable
- Suspected remission (blood sugar consistently low)

> **Remember:** the best monitoring plan is the one you actually follow. One reading a day beats a plan for 8 readings that you abandon after a week.`,
  },
  category: 'lifestyle',
  readingTimeMinutes: 6,
  order: 2,
  relatedArticleIds: ['glucose_monitoring', 'fructosamine', 'remission'],
  references: [
    { ru: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023', en: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023' },
    { ru: 'Cornell Feline Health Center — Feline Diabetes, 2021', en: 'Cornell Feline Health Center — Feline Diabetes, 2021' },
  ],
  tags: [
    { ru: 'мониторинг', en: 'monitoring' },
    { ru: 'глюкометр', en: 'glucometer' },
    { ru: 'реалистичный', en: 'realistic' },
    { ru: 'кривая глюкозы', en: 'glucose curve' },
  ],
};
