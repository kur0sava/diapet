import { Article } from '../../types';

export const choosingVet: Article = {
  id: 'choosing-vet',
  titleKey: {
    ru: 'Как выбрать ветеринара',
    en: 'How to Choose a Vet',
  },
  summaryKey: {
    ru: 'Red flags, правильные вопросы и разница между общим ветеринаром и эндокринологом.',
    en: 'Red flags, the right questions to ask, and the difference between a general vet and an endocrinologist.',
  },
  contentKey: {
    ru: `## Как выбрать ветеринара для диабетической кошки

Не каждый ветеринар одинаково хорошо разбирается в диабете. Это нормально — так же, как терапевт и эндокринолог у людей. Вот как найти своего врача.

### Зелёные флаги (хороший ветеринар)

- Назначает **Лантус или Левемир** как первый выбор (а не только Канинсулин)
- Рекомендует **низкоуглеводную диету** (влажный корм)
- Просит вас делать **домашние замеры** глюкозы
- Знает про **фруктозамин** и назначает его регулярно
- Говорит о возможности **ремиссии**
- Обсуждает дозировку **пошагово** (по 0.25-0.5 ед.), а не сразу большие дозы
- Готов отвечать на вопросы по телефону/мессенджеру между визитами

### Красные флаги (стоит искать второе мнение)

- Назначает только Канинсулин и не рассматривает альтернативы
- Не интересуется домашними замерами, полагается только на клинические
- Рекомендует сухой корм для диабетиков
- Говорит «диабет у кошек не лечится, только поддерживается» (ремиссия реальна!)
- Повышает дозу инсулина сразу на несколько единиц
- Не упоминает риск гипогликемии
- Раздражается, когда вы задаёте вопросы
- Не знает, что такое кривая глюкозы

### Вопросы для первого визита

1. «Какой инсулин вы рекомендуете и почему?»
2. «Какую диету вы советуете?»
3. «Как часто мне нужно мерить глюкозу дома?»
4. «Когда мы проверим фруктозамин?»
5. «Возможна ли ремиссия у моей кошки?»
6. «Как я могу связаться с вами между визитами?»

### Общий ветеринар vs специалист

**Общий ветеринар:**
- Достаточно для большинства стабильных случаев
- Подходит для рутинного мониторинга
- Если кошка хорошо реагирует на лечение — отлично

**Когда нужен эндокринолог/специалист:**
- Доза инсулина растёт, а контроль не улучшается
- Подозрение на коморбидности (гипертиреоз, ХБП, акромегалия)
- Повторяющийся кетоацидоз
- Нужно мнение по сложному случаю

### Онлайн-ресурсы

- Группы поддержки владельцев диабетических кошек (Facebook, ВКонтакте)
- Там можно найти рекомендации ветеринаров с опытом в эндокринологии в вашем городе
- Но помните: советы из интернета не заменяют ветеринара

### Как работать с ветеринаром

- Ведите дневник (DiaPet!) и показывайте данные на приёме
- Записывайте назначения — в стрессе легко забыть
- Не стесняйтесь просить объяснений
- Если не согласны — скажите. Хороший ветеринар обсудит, а не обидится
- Второе мнение — это нормально, не предательство

> **Ваш ветеринар — ваш партнёр.** Вы вместе в одной команде. Найдите того, с кем вам комфортно работать долгие месяцы (или годы).`,
    en: `## How to Choose a Vet for Your Diabetic Cat

Not every vet is equally experienced with diabetes. That's normal — just like the difference between a GP and an endocrinologist in human medicine. Here's how to find your doctor.

### Green Flags (Good Vet)

- Prescribes **Lantus or Levemir** as a first choice (not just Caninsulin)
- Recommends a **low-carb diet** (wet food)
- Asks you to do **home glucose monitoring**
- Knows about **fructosamine** and orders it regularly
- Talks about the possibility of **remission**
- Adjusts dose **gradually** (by 0.25-0.5 units), not in big jumps
- Is available for questions by phone/messenger between visits

### Red Flags (Consider a Second Opinion)

- Only prescribes Caninsulin and won't consider alternatives
- Doesn't care about home readings, relies only on clinic visits
- Recommends dry food for diabetics
- Says "feline diabetes can't be cured, only managed" (remission is real!)
- Increases insulin dose by several units at once
- Doesn't mention hypoglycemia risk
- Gets annoyed when you ask questions
- Doesn't know what a glucose curve is

### Questions for the First Visit

1. "Which insulin do you recommend and why?"
2. "What diet do you suggest?"
3. "How often should I check glucose at home?"
4. "When will we check fructosamine?"
5. "Is remission possible for my cat?"
6. "How can I reach you between visits?"

### General Vet vs Specialist

**General vet:**
- Sufficient for most stable cases
- Fine for routine monitoring
- If the cat responds well to treatment — great

**When you need an endocrinologist/specialist:**
- Insulin dose keeps rising but control doesn't improve
- Suspected comorbidities (hyperthyroidism, CKD, acromegaly)
- Recurring ketoacidosis
- Need an opinion on a complex case

### Online Resources

- Support groups for diabetic cat owners (Facebook, Reddit)
- You can find recommendations for experienced vets in your area
- But remember: internet advice doesn't replace a veterinarian

### How to Work with Your Vet

- Keep a diary (DiaPet!) and share data at appointments
- Write down prescriptions — it's easy to forget under stress
- Don't be afraid to ask for explanations
- If you disagree — say so. A good vet will discuss, not take offense
- Getting a second opinion is normal, not betrayal

> **Your vet is your partner.** You're on the same team. Find someone you're comfortable working with for months (or years).`,
  },
  category: 'lifestyle',
  readingTimeMinutes: 6,
  order: 16,
  species: 'cat',
  relatedArticleIds: ['first-days', 'common-mistakes', 'comorbidities'],
  references: [
    {
      ru: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
      en: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
    },
    {
      ru: 'AAHA Diabetes Management Guidelines for Dogs and Cats, 2018',
      en: 'AAHA Diabetes Management Guidelines for Dogs and Cats, 2018',
    },
  ],
  tags: [
    { ru: 'ветеринар', en: 'vet' },
    { ru: 'выбор врача', en: 'choosing a doctor' },
    { ru: 'второе мнение', en: 'second opinion' },
    { ru: 'red flags', en: 'red flags' },
  ],
};
