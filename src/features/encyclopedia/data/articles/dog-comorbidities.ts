import { Article } from '../../types';

export const dogComorbidities: Article = {
  id: 'dog-comorbidities',
  titleKey: {
    ru: 'Диабет + другие болезни у собак',
    en: 'Diabetes and Comorbidities in Dogs',
  },
  summaryKey: {
    ru: 'Болезнь Кушинга, гипотиреоз, панкреатит, инфекции, течки — что чаще всего мешает контролю диабета у собак.',
    en: "Cushing's, hypothyroidism, pancreatitis, infections, heat cycles — what most often disrupts diabetes control in dogs.",
  },
  contentKey: {
    ru: `# Диабет и сопутствующие болезни у собак

Если диабет плохо контролируется несмотря на правильную дозу и диету — почти всегда виновата сопутствующая болезнь. У собак «соседи» диабета не такие, как у кошек: здесь на первом месте Кушинг, гипотиреоз, панкреатит, инфекции и половые гормоны у сук.

## Болезнь Кушинга (гиперадренокортицизм)

Это **самая частая причина инсулинорезистентности у собак** (аналог того, чем у кошек являются акромегалия и гипертиреоз). Надпочечники вырабатывают избыток кортизола, а кортизол напрямую противодействует инсулину.

**Когда заподозрить:**
- Дозу инсулина приходится поднимать, а контроль не улучшается
- Сильная жажда и обильное мочеиспускание сверх обычного для диабета
- «Пивной» живот, истончение шерсти, симметричные залысины
- Повышенный аппетит, вялость

**Что делать:** ветеринар проверит функцию надпочечников (тест с АКТГ, малый дексаметазоновый тест). Лечение Кушинга обычно резко улучшает контроль диабета.

## Гипотиреоз

Недостаток гормонов щитовидной железы — частая у собак болезнь (в отличие от кошек, у которых чаще наоборот, гипер-). Гипотиреоз усиливает инсулинорезистентность и нарушает жировой обмен.

**Признаки:** набор веса без переедания, вялость, тусклая шерсть, непереносимость холода. Проверяется по Т4/свободному Т4 и ТТГ.

## Панкреатит

Очень частый спутник собачьего диабета и в обе стороны: панкреатит может вызвать диабет, а диабет повышает риск панкреатита.

**Важное отличие от кошек:** у собак панкреатит тесно связан с **жирной пищей**, поэтому им нужна **строгая диета с низким жиром** (у кошек жёсткое ограничение жира не рекомендуется). Признаки обострения: рвота, отказ от еды, боль в животе (поза «молящейся собаки»), вялость. Подробнее — в отдельной статье о панкреатите.

## Инфекции мочевыводящих путей (ИМП)

У диабетиков сахар в моче — питательная среда для бактерий, поэтому ИМП очень часты и нередко **протекают скрыто**, без явных симптомов. Скрытая инфекция дестабилизирует сахар и может спровоцировать ДКА.

**Что делать:** при потере контроля ветеринар назначит анализ и посев мочи. Периодический контроль мочи полезен даже без симптомов.

## Половые гормоны у сук (диэструс, течка, беременность)

У нестерилизованной суки прогестерон во второй половине цикла вызывает сильную инсулинорезистентность и стимулирует выброс гормона роста. Это может:
- сделать диабет нестабильным при каждой течке
- спровоцировать «диэструс-индуцированный диабет»

**Что делать:** стерилизация — обязательная часть лечения диабета у сук. У некоторых сук, стерилизованных на ранней стадии, диабет даже удаётся обратить.

## Стероидная терапия

Любые стероиды (преднизолон при аллергии, артрите, дерматите) **повышают сахар** и усиливают инсулинорезистентность. Обязательно сообщайте каждому врачу, что собака на инсулине, и обсуждайте альтернативы.

> **Главный вывод:** если диабет «не слушается» правильной дозы — не наращивайте инсулин вслепую. Ищите с ветеринаром сопутствующую болезнь. У собак чаще всего это Кушинг, гипотиреоз, панкреатит, скрытая ИМП или течка у суки.`,
    en: `# Diabetes and Comorbidities in Dogs

If diabetes stays poorly controlled despite correct dosing and diet — a concurrent illness is almost always to blame. In dogs, the "neighbors" of diabetes differ from cats: here the leaders are Cushing's, hypothyroidism, pancreatitis, infections, and sex hormones in females.

## Cushing's Disease (Hyperadrenocorticism)

This is the **most common cause of insulin resistance in dogs** (the canine counterpart to what acromegaly and hyperthyroidism are in cats). The adrenal glands overproduce cortisol, which directly opposes insulin.

**When to suspect it:**
- The insulin dose keeps climbing but control doesn't improve
- Excessive thirst and urination beyond what diabetes alone explains
- A "pot belly," thinning coat, symmetrical hair loss
- Increased appetite, lethargy

**What to do:** your vet will test adrenal function (ACTH stimulation, low-dose dexamethasone suppression). Treating Cushing's usually sharply improves diabetes control.

## Hypothyroidism

A deficiency of thyroid hormones is common in dogs (unlike cats, who more often have the opposite, hyper-). Hypothyroidism worsens insulin resistance and disrupts fat metabolism.

**Signs:** weight gain without overeating, lethargy, dull coat, cold intolerance. Checked via T4/free T4 and TSH.

## Pancreatitis

A very common companion of canine diabetes, and in both directions: pancreatitis can cause diabetes, and diabetes raises pancreatitis risk.

**Key difference from cats:** in dogs pancreatitis is closely tied to **fatty food**, so they need a **strict low-fat diet** (in cats, strict fat restriction is not recommended). Flare signs: vomiting, refusal to eat, abdominal pain ("praying" posture), lethargy. More in the dedicated pancreatitis article.

## Urinary Tract Infections (UTIs)

In diabetics, sugar in the urine feeds bacteria, so UTIs are very common and often **run silently**, without obvious symptoms. A hidden infection destabilizes blood sugar and can trigger DKA.

**What to do:** if control is lost, your vet will order a urinalysis and culture. Periodic urine checks are useful even without symptoms.

## Sex Hormones in Females (Diestrus, Heat, Pregnancy)

In an unspayed female, progesterone in the second half of the cycle causes strong insulin resistance and stimulates growth hormone release. This can:
- make diabetes unstable at every heat
- trigger "diestrus-induced diabetes"

**What to do:** spaying is a mandatory part of diabetes treatment in females. In some females spayed early, diabetes can even be reversed.

## Steroid Therapy

Any steroids (prednisolone for allergies, arthritis, dermatitis) **raise blood sugar** and worsen insulin resistance. Always tell every vet that your dog is on insulin, and discuss alternatives.

> **Key takeaway:** if diabetes "won't obey" the correct dose — don't blindly increase insulin. Look for a concurrent illness with your vet. In dogs it's most often Cushing's, hypothyroidism, pancreatitis, a hidden UTI, or a female's heat cycle.`,
  },
  category: 'medical',
  species: 'dog',
  readingTimeMinutes: 7,
  order: 1,
  relatedArticleIds: ['dog-pancreatitis', 'dog-diabetes-basics', 'dog-dka'],
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
    { ru: 'коморбидности', en: 'comorbidities' },
    { ru: 'Кушинг', en: "Cushing's" },
    { ru: 'гипотиреоз', en: 'hypothyroidism' },
    { ru: 'инсулинорезистентность', en: 'insulin resistance' },
  ],
};
