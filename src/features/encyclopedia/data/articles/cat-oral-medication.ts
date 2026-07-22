import { Article } from '../../types';

export const catOralMedication: Article = {
  id: 'cat-oral-medication',
  titleKey: {
    ru: 'Таблетки от диабета для кошек: SGLT2-ингибиторы (Bexacat, Senvelgo)',
    en: 'Oral Diabetes Medication for Cats: SGLT2 Inhibitors (Bexacat, Senvelgo)',
  },
  summaryKey: {
    ru: 'Диабет у кошки — и без уколов? Появился новый класс препаратов в таблетках и растворе. Разбираем, кому он подходит, а кому опасен.',
    en: 'Feline diabetes without injections? A new class of once-daily oral drugs has arrived. We break down who it fits — and who it can harm.',
  },
  contentKey: {
    ru: `## Таблетки от диабета для кошек

Ещё недавно диабет у кошки означал только одно — инъекции инсулина дважды в день. Но с 2022-2023 годов появился принципиально новый вариант: **пероральные препараты**, которые дают раз в день, без уколов. Это большая новость, но подходят они **далеко не всем** кошкам.

> **Важно:** решение о начале, отмене или замене любого препарата принимает **только ветеринар**. Эта статья поможет вам понять суть и задать врачу правильные вопросы — это не инструкция к самолечению.

### Что это за препараты

Речь о классе **SGLT2-ингибиторов**. Для кошек одобрены два:

- **Bexacat (бексаглифлозин, Elanco)** — таблетка **15 мг раз в день**, фиксированная доза, не зависит от веса (для кошек массой **от ~3 кг**; для более лёгких кошек не предназначен). Одобрен FDA **9 декабря 2022 года** — это первый пероральный препарат от диабета кошек и первый SGLT2-ингибитор для животных вообще
- **Senvelgo (велаглифлозин, Boehringer Ingelheim)** — пероральный **раствор раз в день** (удобно дозировать по весу). Одобрен FDA **10 августа 2023 года**; также одобрен в Евросоюзе (EMA, ноябрь 2023 года)

### Как они работают — это НЕ инсулин

Обычно почки возвращают глюкозу из мочи обратно в кровь. SGLT2-ингибиторы **блокируют этот механизм**: лишняя глюкоза уходит с мочой, и сахар в крови снижается.

Ключевое отличие от инсулина: препарат **не заставляет** сахар падать напрямую и не восполняет нехватку инсулина — он просто «сливает» избыток глюкозы через почки. Поэтому у него другой профиль рисков.

### Кому подходит

По обновлённым рекомендациям **2025 iCatCare**, SGLT2-ингибиторы включены как **вариант первой линии** — но с чёткими условиями. Кандидат — это кошка, которая:

- диагностирована **впервые** и **не получала инсулин** (инсулин-наивная);
- в остальном **относительно здорова**, ест, активна;
- имеет **сохранный резерв бета-клеток** (то есть организм ещё способен вырабатывать какое-то количество собственного инсулина).

> Именно поэтому все стартовые анализы и осмотр делает ветеринар: он оценивает, есть ли у конкретной кошки скрытые противопоказания.

### ⚠️ Главная опасность — эугликемический кетоацидоз (eDKA)

Это самый важный раздел статьи, прочитайте его внимательно.

> **Эугликемический ДКА (eDKA)** — это диабетический кетоацидоз (смертельно опасное состояние), который развивается при **нормальном или почти нормальном сахаре в крови**.
>
> Обычный ДКА обычно сопровождается очень высоким сахаром — это тревожный сигнал. Но на фоне SGLT2-ингибитора сахар может быть в норме, **поэтому eDKA легко пропустить**: глюкометр «успокаивает», а кошке становится хуже.

Из-за этого риска препараты **противопоказаны**:

- кошкам, которые **уже получают или когда-либо получали инсулин**;
- кошкам со **сниженным резервом бета-клеток** или склонностью к кетозу.

**Что делать владельцу.** Пока кошка на SGLT2-ингибиторе, следите за:

- **кетонами** (по назначенной ветеринаром схеме — кровь/моча);
- **аппетитом** — отказ от еды это красный флаг;
- **общим самочувствием** — вялость, рвота, обезвоживание.

> **Любой из признаков — вялость, отказ от еды, рвота — на фоне SGLT2-ингибитора требует СРОЧНОГО обращения к ветеринару. Даже если сахар в норме.** Не ждите «до утра».

### Чего эти препараты НЕ делают

- **Не заменяют инсулин** у кошек, которые уже на инсулинотерапии. Нельзя «перевести» кошку с уколов на таблетку по своему желанию — это прямой путь к eDKA
- Не подходят кошкам с ДКА в анамнезе или в нестабильном состоянии
- Не отменяют необходимость **диеты и мониторинга** — контроль всё равно нужен

### Доступность

- **США** — оба препарата **одобрены** (Bexacat, Senvelgo) и назначаются ветеринаром
- **ЕС и Великобритания** — **Senvelgo одобрен** (EMA, ноябрь 2023 года); данных об одобрении **Bexacat** в этих регионах на момент подготовки статьи нет — уточните у ветеринара
- **Россия и СНГ** — на момент подготовки статьи SGLT2-ингибиторы для кошек **не зарегистрированы** и в продаже отсутствуют. Здесь стандарт остаётся прежним — инсулинотерапия (см. «Инсулины для кошек»)

> **Главная мысль:** это не «лёгкая замена уколам», а отдельный инструмент со своим списком показаний и с серьёзным риском (eDKA). Он может быть отличным решением для правильно отобранной кошки — но решает это ветеринар, а не владелец.`,
    en: `## Oral Diabetes Medication for Cats

Until recently, feline diabetes meant one thing only — insulin injections twice a day. But since 2022-2023, there's a genuinely new option: **oral medications** given once daily, no needles. That's big news — but they are **not suitable for every** cat.

> **Important:** the decision to start, stop, or switch any medication is made by **your vet alone**. This article helps you understand the essentials and ask the right questions — it is not a self-treatment guide.

### What These Drugs Are

They belong to a class called **SGLT2 inhibitors**. Two are approved for cats:

- **Bexacat (bexagliflozin, Elanco)** — a **15 mg tablet once daily**, a fixed dose not adjusted for weight (for cats **weighing about 3 kg / 6.6 lb or more**; not intended for lighter cats). FDA-approved on **December 9, 2022** — the first-ever oral drug for feline diabetes and the first SGLT2 inhibitor in any animal
- **Senvelgo (velagliflozin, Boehringer Ingelheim)** — an **oral solution once daily** (convenient weight-based dosing). FDA-approved on **August 10, 2023**; also authorized in the European Union (EMA, November 2023)

### How They Work — This Is NOT Insulin

Normally the kidneys return glucose from urine back into the blood. SGLT2 inhibitors **block that mechanism**: excess glucose leaves in the urine, and blood sugar drops.

The key difference from insulin: the drug doesn't force sugar down directly and doesn't replace missing insulin — it simply "drains" surplus glucose through the kidneys. That gives it a different risk profile.

### Who It's For

Under the updated **2025 iCatCare** guidelines, SGLT2 inhibitors are included as a **first-line option** — but with clear conditions. A candidate is a cat that is:

- **newly diagnosed** and **has never received insulin** (insulin-naive);
- otherwise **relatively healthy**, eating, and active;
- has **preserved beta-cell reserve** (the body can still make some of its own insulin).

> This is exactly why the vet does the baseline bloodwork and exam first — to rule out hidden contraindications in that particular cat.

### ⚠️ The Main Danger — Euglycemic Ketoacidosis (eDKA)

This is the most important section of the article — please read it carefully.

> **Euglycemic DKA (eDKA)** is diabetic ketoacidosis (a life-threatening emergency) that develops while blood sugar is **normal or nearly normal**.
>
> Ordinary DKA usually comes with very high blood sugar — a clear warning sign. But on an SGLT2 inhibitor, blood sugar can look normal, **so eDKA is easy to miss**: the glucometer is reassuring while the cat gets worse.

Because of this risk, these drugs are **contraindicated** for:

- cats **already on insulin, or that have ever received insulin**;
- cats with **reduced beta-cell reserve** or a tendency toward ketosis.

**What the owner should do.** While your cat is on an SGLT2 inhibitor, watch for:

- **ketones** (per the schedule your vet sets — blood/urine);
- **appetite** — refusing food is a red flag;
- **general well-being** — lethargy, vomiting, dehydration.

> **Any of these signs — lethargy, loss of appetite, vomiting — while on an SGLT2 inhibitor calls for an URGENT vet visit. Even if blood sugar is normal.** Don't wait "until morning."

### What These Drugs Do NOT Do

- **They don't replace insulin** in cats already on insulin therapy. You cannot switch a cat from injections to a tablet on your own — that's a direct path to eDKA
- Not suitable for cats with a history of DKA or in an unstable condition
- They don't remove the need for **diet and monitoring** — control is still required

### Availability

- **USA** — both drugs are **approved** (Bexacat, Senvelgo) and prescribed by a vet
- **EU & UK** — **Senvelgo is approved** (EMA, November 2023); as of this writing there's no confirmed **Bexacat** approval in these regions — check with your vet
- **Russia & CIS** — as of this writing, feline SGLT2 inhibitors are **not registered** and not on sale. Here the standard remains insulin therapy (see "Insulin Types for Cats")

> **The bottom line:** this is not an "easy swap for injections" but a separate tool with its own indications and a serious risk (eDKA). It can be an excellent choice for a carefully selected cat — but that call belongs to the vet, not the owner.`,
  },
  category: 'treatment',
  species: 'cat',
  readingTimeMinutes: 7,
  order: 4,
  relatedArticleIds: [
    'insulin_types',
    'cat-insulin-brands',
    'remission',
    'ketone-testing',
    'what-is-diabetes',
  ],
  references: [
    {
      ru: 'FDA CVM — одобрение Bexacat (bexagliflozin), 9 декабря 2022',
      en: 'FDA CVM — Bexacat (bexagliflozin) approval, December 9, 2022',
    },
    {
      ru: 'FDA CVM — одобрение Senvelgo (velagliflozin), 10 августа 2023 (FOI Summary)',
      en: 'FDA CVM — Senvelgo (velagliflozin) approval, August 10, 2023 (FOI Summary)',
    },
    {
      ru: 'EMA — регистрация Senvelgo (velagliflozin) в ЕС, ноябрь 2023',
      en: 'EMA — Senvelgo (velagliflozin) EU authorisation, November 2023',
    },
    {
      ru: '2025 iCatCare Consensus Guidelines on Diabetes Mellitus in Cats (Taylor et al., JFMS 2025)',
      en: '2025 iCatCare Consensus Guidelines on Diabetes Mellitus in Cats (Taylor et al., JFMS 2025)',
    },
    {
      ru: "Обзоры применения SGLT2-ингибиторов при диабете кошек (Today's Veterinary Practice / dvm360, 2023-2025)",
      en: "Reviews of SGLT2 inhibitors in feline diabetes (Today's Veterinary Practice / dvm360, 2023-2025)",
    },
  ],
  tags: [
    { ru: 'таблетки', en: 'oral medication' },
    { ru: 'SGLT2', en: 'SGLT2' },
    { ru: 'без инсулина', en: 'insulin-free' },
    { ru: 'кетоацидоз', en: 'ketoacidosis' },
  ],
};
