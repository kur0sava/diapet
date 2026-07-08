import { Article } from '../../types';

export const dogRealLife: Article = {
  id: 'dog-real-life',
  titleKey: {
    ru: 'Жизнь с диабетиком: практические ситуации (собака)',
    en: 'Living with a Diabetic Dog: Real-Life Situations',
  },
  summaryKey: {
    ru: 'Опоздали с уколом, собака не доела, поездка, передержка, длинная прогулка — как справляться с реальной жизнью.',
    en: "Late with an injection, dog didn't finish eating, travel, boarding, a long walk — how to handle real life.",
  },
  contentKey: {
    ru: `# Жизнь с диабетиком: когда всё идёт не по плану

Учебники описывают идеальный мир: кормление по часам, уколы минута в минуту. Реальная жизнь другая — и это нормально.

## Опоздали с инъекцией

- **До 1-2 часов** — колите как обычно
- **2-4 часа** — колите обычную дозу, следующую немного сдвиньте
- **Больше 6 часов или скоро следующая** — пропустите эту дозу, следующую по расписанию
- **Никогда** не колите двойную дозу

## Собака не доела

- Съела больше половины — колите полную дозу
- Съела меньше половины — обсудите с ветеринаром половинную дозу
- Не ела совсем — **не колите**, свяжитесь с ветеринаром. Отказ от еды у диабетика — повод для внимания (возможен панкреатит или другая болезнь)

## Прогулки и физическая нагрузка

Это важное отличие собак: активность заметно снижает сахар.
- **Одинаковая нагрузка каждый день** — залог стабильности
- Внезапная длинная/активная прогулка может уронить сахар — берите с собой мёд/лакомство
- Планируете поход или необычно активный день — обсудите с ветеринаром корректировку и чаще проверяйте сахар
- Признаки гипогликемии на прогулке (слабость, шатание, спутанность) — сразу дайте углеводы

## Поездка / отпуск

**Собака остаётся дома с помощником:**
- Обучите человека делать инъекции (2-3 тренировки)
- Оставьте письменную инструкцию: инсулин, доза, время, корм, экстренные контакты
- Шприц-ручка проще для новичка

**Передержка / гостиница:**
- Предупредите заранее — не все берут диабетиков
- Оставьте инсулин, шприцы, корм, инструкцию, просите фото/видео ежедневно

**Собака едет с вами:**
- Инсулин в термосумке (не замораживать!)
- Держите привычный режим кормления и уколов по времени
- Возьмите мёд на случай гипогликемии

## Собака вырвала после еды

- Инсулин уже введён? Следите за сахаром, измеряйте каждые 1-2 часа
- Сахар падает — предложите немного лёгкой еды
- Повторная рвота — к ветеринару (у собак рвота часто сигнал панкреатита)

## Закончился инсулин или шприцы

- Держите запас на 2 недели
- Заказывайте заранее
- Один день без инсулина для стабильной собаки не катастрофа, но позвоните ветеринару и не «догоняйте» двойными дозами

## Несколько собак в доме

- Кормите диабетика отдельно, чтобы контролировать, что и сколько он съел
- Не давайте ему подъедать чужие порции и лакомства

> **Главная мысль:** диабет — это марафон, а не спринт. Не нужно быть идеальным каждый день. Нужно быть достаточно стабильным большую часть времени.`,
    en: `# Living with a Diabetic Dog: When Things Don't Go as Planned

Textbooks describe an ideal world: feeding on schedule, injections to the minute. Real life is different — and that's okay.

## Late with the injection

- **Up to 1-2 hours** — inject as usual
- **2-4 hours** — inject the usual dose, shift the next one slightly
- **More than 6 hours or the next is due soon** — skip this dose, give the next on schedule
- **Never** give a double dose

## Dog didn't finish eating

- Ate more than half — give the full dose
- Ate less than half — discuss a half dose with your vet
- Didn't eat at all — **don't inject**, contact your vet. Refusal to eat in a diabetic warrants attention (possible pancreatitis or another illness)

## Walks and exercise

This is a key dog difference: activity noticeably lowers blood sugar.
- **The same amount of exercise every day** — the key to stability
- A sudden long/active walk can drop blood sugar — bring honey/a treat
- Planning a hike or unusually active day — discuss an adjustment with your vet and check sugar more often
- Signs of hypoglycemia on a walk (weakness, staggering, confusion) — give carbs immediately

## Travel / vacation

**Dog stays home with a helper:**
- Train the person to inject (2-3 practice sessions)
- Leave written instructions: insulin, dose, timing, food, emergency contacts
- An insulin pen is easier for a beginner

**Boarding / kennel:**
- Warn them in advance — not all accept diabetics
- Leave insulin, syringes, food, instructions; ask for daily photos/videos

**Dog travels with you:**
- Insulin in a cooler bag (don't freeze!)
- Keep the usual feeding and injection timing
- Bring honey for hypoglycemia

## Dog vomited after eating

- Insulin already given? Watch blood sugar, measure every 1-2 hours
- Sugar dropping — offer a little gentle food
- Repeated vomiting — see the vet (in dogs, vomiting is often a pancreatitis signal)

## Ran out of insulin or syringes

- Keep a 2-week supply
- Order in advance
- One day without insulin isn't catastrophic for a stable dog, but call your vet and don't "catch up" with double doses

## Multiple dogs at home

- Feed the diabetic separately to control what and how much they eat
- Don't let them raid others' portions and treats

> **The main takeaway:** diabetes is a marathon, not a sprint. You don't need to be perfect every day. You need to be stable enough most of the time.`,
  },
  category: 'lifestyle',
  species: 'dog',
  readingTimeMinutes: 7,
  order: 2,
  relatedArticleIds: ['dog-first-days', 'dog-hypoglycemia', 'dog-common-mistakes'],
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
    { ru: 'практика', en: 'practical' },
    { ru: 'прогулки', en: 'walks' },
    { ru: 'поездки', en: 'travel' },
    { ru: 'образ жизни', en: 'lifestyle' },
  ],
};
