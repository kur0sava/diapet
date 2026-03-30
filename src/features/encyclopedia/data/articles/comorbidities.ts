import { Article } from '../../types';

export const comorbidities: Article = {
  id: 'comorbidities',
  titleKey: {
    ru: 'Диабет + другие болезни',
    en: 'Diabetes and Comorbidities',
  },
  summaryKey: {
    ru: 'Гипертиреоз, ХБП, воспаление кишечника — как диабет сочетается с другими частыми болезнями кошек.',
    en: 'Hyperthyroidism, CKD, IBD — how diabetes coexists with other common feline diseases.',
  },
  contentKey: {
    ru: `## Диабет и коморбидности: когда проблема не одна

У пожилых кошек диабет редко приходит один. Три самых частых «соседа»: гипертиреоз, хроническая болезнь почек (ХБП) и воспалительное заболевание кишечника (IBD).

### Гипертиреоз + диабет

Гипертиреоз (избыточная функция щитовидной железы) — одна из самых частых эндокринных болезней кошек старше 10 лет.

**Как влияет на диабет:**
- Гипертиреоз вызывает инсулинорезистентность — дозу инсулина приходится повышать
- После лечения гипертиреоза потребность в инсулине часто **резко падает**
- У некоторых кошек диабет после лечения щитовидки уходит в ремиссию

**Что важно:**
- Если сахар плохо контролируется — проверьте Т4 (гормон щитовидки)
- При начале лечения гипертиреоза мониторьте глюкозу чаще — риск гипогликемии!
- Предупредите ветеринара, что кошка на инсулине

### ХБП + диабет

Хроническая болезнь почек встречается у 30%+ кошек старше 12 лет.

**Особенности:**
- ХБП может вызывать потерю аппетита → нестабильное кормление → скачки сахара
- Некоторые препараты для почек влияют на глюкозу
- Обезвоживание (частое при ХБП) искажает показатели глюкозы
- Диета для ХБП (низкобелковая) может конфликтовать с диетой для диабета (низкоуглеводной)

**Баланс диет:**
- Приоритет обычно отдаётся диете для ХБП при стадии 3-4 IRIS
- При стадии 1-2 можно совмещать низкоуглеводную и умеренно-белковую диету
- Решение — всегда с ветеринаром, универсального ответа нет

### IBD (воспалительное заболевание кишечника) + диабет

IBD вызывает хроническое воспаление, которое усиливает инсулинорезистентность.

**Признаки:**
- Рвота, диарея, потеря веса несмотря на хороший аппетит
- Нестабильный сахар, который «скачет» без видимой причины

**Что делать:**
- IBD часто лечат стероидами (преднизолон) — а стероиды **повышают** сахар
- Обсудите с ветеринаром альтернативы: будесонид (менее влияет на глюкозу), диетотерапия
- При обострении IBD готовьтесь к временному повышению дозы инсулина

### Триадит

У кошек есть уникальный синдром — **триадит** (IBD + панкреатит + холангит). Все три органа воспалены одновременно. Это серьёзно и требует комплексного лечения.

> **Главный вывод:** если диабет плохо контролируется несмотря на правильную дозу и диету — ищите другую болезнь. Комплексный подход с ветеринаром — ключ к стабилизации.`,
    en: `## Diabetes and Comorbidities: When Problems Come in Pairs

In older cats, diabetes rarely comes alone. The three most common "neighbors": hyperthyroidism, chronic kidney disease (CKD), and inflammatory bowel disease (IBD).

### Hyperthyroidism + Diabetes

Hyperthyroidism (overactive thyroid) is one of the most common endocrine diseases in cats over 10 years old.

**How it affects diabetes:**
- Hyperthyroidism causes insulin resistance — you may need to increase the insulin dose
- After treating hyperthyroidism, insulin needs often **drop sharply**
- Some cats achieve diabetes remission after thyroid treatment

**Key points:**
- If blood sugar is poorly controlled — check T4 (thyroid hormone)
- When starting hyperthyroid treatment, monitor glucose more frequently — risk of hypoglycemia!
- Tell your vet the cat is on insulin

### CKD + Diabetes

Chronic kidney disease affects 30%+ of cats over 12 years old.

**Special considerations:**
- CKD can cause appetite loss → unstable feeding → blood sugar swings
- Some kidney medications affect glucose levels
- Dehydration (common with CKD) distorts glucose readings
- CKD diet (low protein) may conflict with diabetes diet (low carb)

**Balancing diets:**
- Priority is usually given to CKD diet at IRIS stage 3-4
- At stages 1-2, you can combine low-carb and moderate-protein diets
- The decision should always involve your vet — there's no universal answer

### IBD (Inflammatory Bowel Disease) + Diabetes

IBD causes chronic inflammation that worsens insulin resistance.

**Signs:**
- Vomiting, diarrhea, weight loss despite good appetite
- Unstable blood sugar that "jumps" for no apparent reason

**What to do:**
- IBD is often treated with steroids (prednisolone) — and steroids **raise** blood sugar
- Discuss alternatives with your vet: budesonide (less impact on glucose), dietary therapy
- During IBD flares, be prepared for temporary insulin dose increases

### Triaditis

Cats have a unique syndrome — **triaditis** (IBD + pancreatitis + cholangitis). All three organs are inflamed simultaneously. This is serious and requires comprehensive treatment.

> **Key takeaway:** if diabetes is poorly controlled despite correct dosing and diet — look for another disease. A comprehensive approach with your vet is key to stabilization.`,
  },
  category: 'medical',
  readingTimeMinutes: 7,
  order: 11,
  relatedArticleIds: ['what-is-diabetes', 'pancreatitis-diabetes', 'diet'],
  references: [
    { ru: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023', en: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023' },
    { ru: 'IRIS Staging of CKD, 2023', en: 'IRIS Staging of CKD, 2023' },
    { ru: 'Feldman EC — Feline Hyperthyroidism, Canine & Feline Endocrinology, 4th ed', en: 'Feldman EC — Feline Hyperthyroidism, Canine & Feline Endocrinology, 4th ed' },
  ],
  tags: [
    { ru: 'коморбидности', en: 'comorbidities' },
    { ru: 'гипертиреоз', en: 'hyperthyroidism' },
    { ru: 'ХБП', en: 'CKD' },
    { ru: 'IBD', en: 'IBD' },
  ],
};
