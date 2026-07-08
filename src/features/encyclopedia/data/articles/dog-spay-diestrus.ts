import { Article } from '../../types';

export const dogSpayDiestrus: Article = {
  id: 'dog-spay-diestrus',
  titleKey: {
    ru: 'Стерилизация суки и диабет: почему это критично',
    en: 'Spaying and Diabetes: Why It Matters',
  },
  summaryKey: {
    ru: 'У сук половые гормоны напрямую ломают контроль диабета. Стерилизация — не опция, а часть лечения. Разбираем почему.',
    en: 'In female dogs, sex hormones directly wreck diabetes control. Spaying is not optional — it is part of treatment. Here is why.',
  },
  contentKey: {
    ru: `# Стерилизация суки и диабет

Это одна из важнейших тем для владельца **нестерилизованной суки** с диабетом — и то, чем собачий диабет принципиально отличается от кошачьего.

## Почему течка ломает диабет

После течки наступает фаза диэструса, в которой яичники и (при ложной или настоящей беременности) плацента вырабатывают много **прогестерона**. Прогестерон:
- вызывает сильную инсулинорезистентность — привычная доза перестаёт работать
- стимулирует выработку гормона роста молочной железой, а гормон роста ещё больше повышает сахар

Результат: у нестерилизованной суки диабет становится нестабильным при каждом цикле, дозу приходится гонять вверх-вниз, растёт риск кетоацидоза.

## Диэструс-индуцированный («гестационный») диабет

Иногда именно прогестерон запускает диабет. Если поймать это рано и **быстро стерилизовать**, у части сук диабет **обратим** — потребность в инсулине падает или исчезает. Но окно короткое: чем дольше высокий сахар, тем сильнее глюкозотоксичность повреждает бета-клетки, и шанс на обратимость теряется.

## Что это значит на практике

- **Стерилизация — обязательная часть лечения диабета у сук.** Обсудите её с ветеринаром сразу после диагноза
- Операцию проводят, когда собака максимально стабильна; у диабетика нужен грамотный анестезиологический протокол (контроль глюкозы до/во время/после, коррекция дозы в день операции)
- После стерилизации потребность в инсулине часто **снижается** — в первые недели усиленный мониторинг, чтобы не пропустить гипогликемию

## А если сука уже стерилизована?

Тогда эта проблема вас не касается — переходите к общим темам: диете, инсулину, мониторингу. Кастрированные кобели половыми гормонами диабет не дестабилизируют.

## Беременность и диабет

Беременность у диабетической суки — очень высокий риск и для матери, и для щенков, и почти всегда дестабилизирует диабет. Именно поэтому вязка диабетической суки не рекомендуется, а стерилизация решает вопрос радикально.

> **Главное:** у сук стерилизация — не «косметика» и не про поведение, а прямое условие стабильного контроля диабета. Не откладывайте разговор об этом с ветеринаром.`,
    en: `# Spaying and Diabetes

This is one of the most important topics for the owner of an **unspayed female** with diabetes — and something that fundamentally sets canine diabetes apart from feline.

## Why heat cycles wreck diabetes

After heat comes the diestrus phase, in which the ovaries and (in false or true pregnancy) the placenta produce a lot of **progesterone**. Progesterone:
- causes strong insulin resistance — the usual dose stops working
- stimulates growth hormone production by the mammary gland, and growth hormone raises blood sugar further

The result: in an unspayed female, diabetes becomes unstable with every cycle, the dose has to be chased up and down, and DKA risk rises.

## Diestrus-induced ("gestational") diabetes

Sometimes progesterone itself triggers diabetes. If caught early and the dog is **spayed promptly**, diabetes is **reversible** in some females — insulin needs fall or disappear. But the window is short: the longer blood sugar stays high, the more glucotoxicity damages the beta cells, and the chance of reversal is lost.

## What this means in practice

- **Spaying is a mandatory part of diabetes treatment in females.** Discuss it with your vet right after diagnosis
- Surgery is done when the dog is as stable as possible; a diabetic needs a careful anesthetic protocol (glucose control before/during/after, dose adjustment on surgery day)
- After spaying, insulin needs often **drop** — monitor closely in the first weeks so you don't miss hypoglycemia

## What if she's already spayed?

Then this issue doesn't apply to you — move on to the general topics: diet, insulin, monitoring. Neutered males don't destabilize diabetes through sex hormones.

## Pregnancy and diabetes

Pregnancy in a diabetic female is very high-risk for both mother and puppies and almost always destabilizes diabetes. That's exactly why breeding a diabetic female is not recommended, and spaying resolves the issue for good.

> **Bottom line:** in females, spaying isn't "cosmetic" or about behavior — it's a direct requirement for stable diabetes control. Don't put off that conversation with your vet.`,
  },
  category: 'medical',
  species: 'dog',
  readingTimeMinutes: 5,
  order: 4,
  relatedArticleIds: ['dog-diabetes-basics', 'dog-comorbidities', 'dog-insulin'],
  references: [
    {
      ru: 'Fall T et al — Diabetes mellitus in a population of 180,000 insured dogs, JVIM 2007',
      en: 'Fall T et al — Diabetes mellitus in a population of 180,000 insured dogs, JVIM 2007',
    },
    {
      ru: 'Feldman EC, Nelson RW — Canine and Feline Endocrinology, 4th ed., 2015',
      en: 'Feldman EC, Nelson RW — Canine and Feline Endocrinology, 4th ed., 2015',
    },
  ],
  tags: [
    { ru: 'стерилизация', en: 'spaying' },
    { ru: 'диэструс', en: 'diestrus' },
    { ru: 'суки', en: 'females' },
    { ru: 'гормоны', en: 'hormones' },
  ],
};
