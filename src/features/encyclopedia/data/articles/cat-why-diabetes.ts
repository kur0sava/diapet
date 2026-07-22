import { Article } from '../../types';

export const catWhyDiabetes: Article = {
  id: 'cat-why-diabetes',
  titleKey: {
    ru: 'Почему моя кошка заболела диабетом?',
    en: 'Why Did My Cat Get Diabetes?',
  },
  summaryKey: {
    ru: 'Первый вопрос почти каждого владельца — «это моя вина?». Разбираем настоящие причины и факторы риска диабета у кошек. Спойлер: вы не виноваты.',
    en: 'Almost every owner\'s first question is "is this my fault?" Here are the real causes and risk factors for feline diabetes. Spoiler: it is not your fault.',
  },
  contentKey: {
    ru: `## Почему это случилось с моей кошкой?

Почти каждый владелец после диагноза задаёт себе один и тот же вопрос: **«Это я виноват?»** Давайте сразу снимем эту тяжесть: в подавляющем большинстве случаев — **нет, не виноваты.** Диабет складывается из многих факторов, и большинство из них от вас не зависело.

### Что на самом деле происходит

У кошек чаще всего развивается **диабет 2 типа**: инсулин вырабатывается, но клетки тела перестают на него нормально реагировать (инсулинорезистентность). Постепенно перегруженная поджелудочная железа «выдыхается» — и сахар в крови растёт.

### Главные факторы риска

- **Лишний вес** — самый значимый управляемый фактор. Жировая ткань усиливает инсулинорезистентность
- **Возраст** старше 7–8 лет
- **Пол** — коты болеют примерно вдвое чаще кошек
- **Малоподвижность** — жизнь только в квартире, мало игры
- **Порода** — бирманские кошки предрасположены генетически
- **Стероидные и некоторые другие препараты** — например, при лечении астмы или дерматита
- **Хронический панкреатит** — воспаление поджелудочной

### Что здесь НЕ ваша вина

Важно честно развести управляемое и неуправляемое:

- **Гены, возраст, пол, породу** вы не выбирали
- **Панкреатит** мог протекать скрыто
- **Стероиды** назначались по показаниям — они были нужны для другой болезни

> **Важно знать:** даже вес — это не про «плохого хозяина». Многие кошки полнеют на сухом корме, который позиционируется как норма. Вы кормили так, как считалось правильным. Теперь вы знаете больше — и это уже шаг вперёд.

### На что вы реально можете влиять — дальше

Прошлое не изменить, но будущее в ваших руках:

- **Низкоуглеводный влажный корм** снижает нагрузку на поджелудочную
- **Плавное снижение веса** (только под контролем — резкое похудение у кошек опасно)
- **Больше движения и игры**
- **Регулярный инсулин и мониторинг**

### Главное

Диабет — это не наказание и не приговор вашей заботе. Это болезнь со множеством причин, большинство из которых вне вашего контроля.

**Вопрос «кто виноват» уводит в сторону. Правильный вопрос — «что делать дальше», и на него вы уже отвечаете.**`,
    en: `## Why Did This Happen to My Cat?

Almost every owner asks themselves the same thing after the diagnosis: **"Is this my fault?"** Let's lift that weight right away: in the vast majority of cases — **no, it is not.** Diabetes comes from many factors, and most of them were never in your hands.

### What's Actually Going On

Cats most often develop **type 2 diabetes**: insulin is still produced, but the body's cells stop responding to it properly (insulin resistance). Over time the overworked pancreas "burns out," and blood sugar climbs.

### The Main Risk Factors

- **Excess weight** — the single most important factor you can influence. Fat tissue drives insulin resistance
- **Age** over 7–8 years
- **Sex** — male cats are affected roughly twice as often
- **Inactivity** — indoor-only life with little play
- **Breed** — Burmese cats have a genetic predisposition
- **Steroids and some other medications** — for example, when treating asthma or skin disease
- **Chronic pancreatitis** — inflammation of the pancreas

### What Is NOT Your Fault

It's worth honestly separating what you could control from what you couldn't:

- You didn't choose your cat's **genes, age, sex, or breed**
- **Pancreatitis** may have been silent
- **Steroids** were prescribed for a reason — they were needed for another condition

> **Good to know:** even weight isn't about being a "bad owner." Many cats gain weight on dry kibble that's marketed as normal. You fed the way it was considered right. Now you know more — and that's already a step forward.

### What You Can Actually Change — Going Forward

You can't rewrite the past, but the future is in your hands:

- **Low-carbohydrate wet food** eases the load on the pancreas
- **Gradual weight loss** (supervised only — rapid weight loss is dangerous in cats)
- **More movement and play**
- **Consistent insulin and monitoring**

### The Bottom Line

Diabetes isn't a punishment or a verdict on your care. It's a disease with many causes, most of them beyond your control.

**"Who's to blame" leads nowhere. The right question is "what do I do next" — and you're already answering it.**`,
  },
  category: 'basics',
  readingTimeMinutes: 5,
  order: 3,
  species: 'cat',
  relatedArticleIds: ['what-is-diabetes', 'diet', 'cat-life-expectancy', 'pancreatitis-diabetes'],
  references: [
    {
      ru: 'Rand J. — Feline Diabetes Mellitus, Veterinary Clinics of North America, 2012',
      en: 'Rand J. — Feline Diabetes Mellitus, Veterinary Clinics of North America, 2012',
    },
    {
      ru: '2025 iCatCare Consensus Guidelines on Diabetes Mellitus in Cats (Taylor et al., JFMS 2025)',
      en: '2025 iCatCare Consensus Guidelines on Diabetes Mellitus in Cats (Taylor et al., JFMS 2025)',
    },
  ],
  tags: [
    { ru: 'причины', en: 'causes' },
    { ru: 'факторы риска', en: 'risk factors' },
    { ru: 'вина', en: 'is it my fault' },
    { ru: 'ожирение', en: 'obesity' },
  ],
};
