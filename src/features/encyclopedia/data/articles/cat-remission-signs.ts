import { Article } from '../../types';

export const catRemissionSigns: Article = {
  id: 'cat-remission-signs',
  titleKey: {
    ru: 'Признаки ремиссии: как понять, что получается',
    en: "Signs of Remission: How to Tell It's Working",
  },
  summaryKey: {
    ru: 'Как распознать, что ремиссия близко, и не пропустить момент, когда доза инсулина стала слишком большой. Практичные сигналы и что с ними делать.',
    en: 'How to recognize that remission is near — and not miss the moment your insulin dose has become too much. Practical signs and what to do about them.',
  },
  contentKey: {
    ru: `## Как понять, что ремиссия приближается

Ремиссия у кошек редко наступает внезапно — обычно за несколько недель до неё появляются понятные сигналы. Умение их читать — это и надежда, и безопасность: приближение ремиссии означает, что **дозу пора снижать**, иначе можно уйти в гипогликемию.

### Ранние обнадёживающие признаки

Присмотритесь к переменам за 1–4 недели:

- **Надир** (минимум сахара за цикл) стал ниже обычного — например, регулярно ниже 4–5 ммоль/л при прежней дозе
- **Предынъекционный сахар** стабильно ниже, чем раньше (часто ниже 10 ммоль/л)
- Кошка **пьёт и мочится меньше** — уходит классическая жажда
- **Возвращается вес и активность**, шерсть выглядит лучше
- **Аппетит выравнивается** — инсулин будто становится «лишним»

### Главный сигнал — низкий надир

Ремиссия почти всегда «объявляет о себе» через **падающий надир**. Если минимум за цикл дважды подряд уходит ниже целевого — это не повод радоваться и ждать, а повод **связаться с ветеринаром для снижения дозы**.

> **Важно знать:** самая частая ошибка на пороге ремиссии — продолжать колоть прежнюю дозу, потому что «схема же работала». Но поджелудочная начала помогать сама, и та же доза теперь избыточна. Итог — гипогликемия. Реагируйте на снижение сахара, а не на привычку.

### Что делать при этих признаках

1. **Не снижайте дозу самовольно наугад** — но и не игнорируйте сигналы
2. Сделайте (или повторите) **кривую глюкозы** — она показывает реальный надир
3. **Свяжитесь с ветеринаром**: снижение дозы проводится по надиру, а не по предынъекционному сахару
4. Продолжайте **низкоуглеводную диету** — она держит достигнутый прогресс
5. Усильте **мониторинг**: чем ближе ремиссия, тем чаще замеры

### «Медовый месяц» — переходный период

Иногда перед ремиссией сахар «качает»: то нужна доза, то кошка уходит в гипо на прежней. Это **honeymoon** — поджелудочная восстанавливается неравномерно. Не паникуйте: это хороший знак, просто реагируйте на каждое измерение.

### Как подтверждают ремиссию

Ветеринар постепенно снижает дозу; если кошка **держит нормальный сахар без инсулина несколько недель** — ремиссию подтверждают. Но диету и наблюдение не бросают: важно вовремя заметить возможный рецидив.

**Падающий надир — это не тревога, а приглашение к следующему шагу. Заметили — не молчите, свяжитесь с ветеринаром: возможно, вы у самой цели.**`,
    en: `## How to Tell Remission Is Coming

In cats, remission rarely arrives out of nowhere — clear signals usually show up in the weeks before it. Reading them is both hope and safety: an approaching remission means it's **time to lower the dose**, or you risk a hypo.

### Early, Encouraging Signs

Watch for changes over 1–4 weeks:

- The **nadir** (the low point of the curve) is running lower than usual — for example, regularly under 4–5 mmol/L on the same dose
- **Pre-shot** blood sugar is consistently lower than before (often under 10 mmol/L)
- Your cat is **drinking and peeing less** — the classic thirst is fading
- **Weight and energy are returning**, the coat looks better
- **Appetite settles** — the insulin almost seems "unnecessary"

### The Key Signal — a Low Nadir

Remission almost always "announces itself" through a **falling nadir**. If the low point of the curve drops below target twice in a row, that's not a cue to celebrate and wait — it's a cue to **contact your vet about lowering the dose**.

> **Good to know:** the most common mistake on the doorstep of remission is continuing the same dose because "the protocol was working." But the pancreas has started pulling its own weight, and that same dose is now too much. The result is hypoglycemia. React to the falling numbers, not to habit.

### What to Do When You See These Signs

1. **Don't slash the dose blindly on your own** — but don't ignore the signals either
2. Run (or repeat) a **glucose curve** — it reveals the real nadir
3. **Contact your vet**: dose reductions are based on the nadir, not the pre-shot number
4. Keep up the **low-carb diet** — it holds the progress you've made
5. Increase **monitoring**: the closer remission gets, the more often you test

### The "Honeymoon" — a Transitional Phase

Sometimes before remission the numbers swing: one day the dose is needed, the next the cat hypos on it. That's the **honeymoon** — the pancreas recovering unevenly. Don't panic: it's a good sign, just respond to each reading.

### How Remission Is Confirmed

Your vet gradually lowers the dose; if the cat **holds normal blood sugar without insulin for several weeks**, remission is confirmed. But the diet and monitoring stay in place: catching a possible relapse early matters.

**A falling nadir isn't an alarm — it's an invitation to the next step. Spot it, speak up, and call your vet: you may be right at the finish line.**`,
  },
  category: 'remission',
  readingTimeMinutes: 6,
  order: 2,
  species: 'cat',
  relatedArticleIds: ['remission', 'cat-no-remission', 'glucose-curves-practice', 'hypoglycemia'],
  references: [
    {
      ru: 'Roomp K, Rand J — Intensive blood glucose control in diabetic cats using home monitoring and glargine, JFMS, 2009',
      en: 'Roomp K, Rand J — Intensive blood glucose control in diabetic cats using home monitoring and glargine, JFMS, 2009',
    },
    {
      ru: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
      en: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
    },
  ],
  tags: [
    { ru: 'ремиссия', en: 'remission' },
    { ru: 'признаки', en: 'signs' },
    { ru: 'надир', en: 'nadir' },
    { ru: 'снижение дозы', en: 'dose reduction' },
  ],
};
