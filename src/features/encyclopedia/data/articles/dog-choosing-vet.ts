import { Article } from '../../types';

export const dogChoosingVet: Article = {
  id: 'dog-choosing-vet',
  titleKey: {
    ru: 'Как выбрать ветеринара для диабетической собаки',
    en: 'How to Choose a Vet for a Diabetic Dog',
  },
  summaryKey: {
    ru: 'На что смотреть, какие вопросы задать и когда нужен эндокринолог, а не общий ветеринар.',
    en: 'What to look for, what questions to ask, and when you need an endocrinologist rather than a general vet.',
  },
  contentKey: {
    ru: `# Как выбрать ветеринара для диабетической собаки

Не каждый ветеринар одинаково хорошо ведёт диабет. Это нормально — как терапевт и эндокринолог у людей. Вот как найти своего врача.

## Зелёные флаги (хороший ветеринар)

- Начинает с адекватного инсулина (Канинсулин/Vetsulin или NPH) и подбирает дозу **по кривой глюкозы**
- Рекомендует **собачью** диабетическую диету — высокая клетчатка, умеренный жир
- Просит вас делать **домашние замеры** и ведёт дневник вместе с вами
- **Настаивает на стерилизации суки** — это признак того, что врач понимает собачий диабет
- Ищет сопутствующие болезни (Кушинг, гипотиреоз, панкреатит, ИМП), если контроль плохой
- Направляет к офтальмологу по поводу катаракты
- Меняет дозу пошагово, а не сразу на несколько единиц
- Готов отвечать на вопросы между визитами

## Красные флаги (стоит искать второе мнение)

- Не спрашивает про домашние замеры, полагается только на клинические
- Не поднимает вопрос стерилизации у нестерилизованной суки
- Рекомендует кошачий низкоуглеводный корм собаке
- Резко поднимает дозу инсулина на несколько единиц
- Не упоминает риск гипогликемии и катаракты
- Не знает, что такое кривая глюкозы
- Раздражается на вопросы

## Вопросы для первого визита

1. «Какой инсулин вы рекомендуете и почему?»
2. «Нужно ли стерилизовать мою суку и когда?» (если она не стерилизована)
3. «Какую диету вы советуете?»
4. «Как часто мерить глюкозу дома?»
5. «Когда проверим на Кушинг/гипотиреоз, если контроль будет плохим?»
6. «Как с вами связаться между визитами?»

## Общий ветеринар vs специалист

**Общий ветеринар** подходит для большинства стабильных случаев и рутинного мониторинга.

**Эндокринолог/специалист нужен, когда:**
- Доза растёт, а контроль не улучшается
- Подозрение на Кушинг, гипотиреоз, акромегалию
- Повторяющийся кетоацидоз
- Осложнённая катаракта или сопутствующие болезни

## Как работать с ветеринаром

- Ведите дневник (DiaPet) и показывайте данные на приёме
- Записывайте назначения — в стрессе легко забыть
- Не стесняйтесь просить объяснений
- Второе мнение — это нормально, не предательство

> Ваш ветеринар — партнёр в одной команде. Найдите того, с кем комфортно работать месяцы и годы.`,
    en: `# How to Choose a Vet for a Diabetic Dog

Not every vet manages diabetes equally well. That's normal — like a GP versus an endocrinologist in human medicine. Here's how to find your doctor.

## Green flags (good vet)

- Starts with an appropriate insulin (Caninsulin/Vetsulin or NPH) and adjusts the dose **by glucose curve**
- Recommends a **canine** diabetic diet — high fiber, moderate fat
- Asks you to do **home readings** and keeps a diary with you
- **Insists on spaying an intact female** — a sign the vet understands canine diabetes
- Looks for concurrent illness (Cushing's, hypothyroidism, pancreatitis, UTI) when control is poor
- Refers to an ophthalmologist about cataracts
- Adjusts the dose gradually, not by several units at once
- Is available for questions between visits

## Red flags (consider a second opinion)

- Doesn't ask about home readings, relies only on clinic visits
- Doesn't raise spaying for an intact female
- Recommends low-carb cat food for a dog
- Sharply raises the insulin dose by several units
- Doesn't mention hypoglycemia or cataract risk
- Doesn't know what a glucose curve is
- Gets annoyed at questions

## Questions for the first visit

1. "Which insulin do you recommend and why?"
2. "Should my female be spayed, and when?" (if intact)
3. "What diet do you suggest?"
4. "How often should I check glucose at home?"
5. "When will we test for Cushing's/hypothyroidism if control is poor?"
6. "How can I reach you between visits?"

## General vet vs specialist

**A general vet** is fine for most stable cases and routine monitoring.

**An endocrinologist/specialist is needed when:**
- The dose keeps rising but control doesn't improve
- Cushing's, hypothyroidism, or acromegaly is suspected
- Recurring ketoacidosis
- Complicated cataracts or concurrent illness

## How to work with your vet

- Keep a diary (DiaPet) and share data at appointments
- Write down prescriptions — it's easy to forget under stress
- Don't be afraid to ask for explanations
- A second opinion is normal, not betrayal

> Your vet is a partner on the same team. Find someone you're comfortable working with for months and years.`,
  },
  category: 'lifestyle',
  species: 'dog',
  readingTimeMinutes: 5,
  order: 3,
  relatedArticleIds: ['dog-first-days', 'dog-common-mistakes', 'dog-comorbidities'],
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
    { ru: 'ветеринар', en: 'vet' },
    { ru: 'выбор врача', en: 'choosing a doctor' },
    { ru: 'второе мнение', en: 'second opinion' },
    { ru: 'red flags', en: 'red flags' },
  ],
};
