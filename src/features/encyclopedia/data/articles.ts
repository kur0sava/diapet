import { Article } from '../types';

export const articles: Article[] = [
  {
    id: 'what-is-diabetes',
    titleKey: {
      ru: 'Что такое диабет у кошек?',
      en: 'What Is Diabetes in Cats?',
    },
    summaryKey: {
      ru: 'Сахарный диабет — одно из наиболее распространённых эндокринных заболеваний у кошек. Узнайте о причинах, симптомах и механизме развития болезни.',
      en: 'Diabetes mellitus is one of the most common endocrine diseases in cats. Learn about its causes, symptoms, and how the disease develops.',
    },
    contentKey: {
      ru: `## Что такое сахарный диабет у кошек?

Сахарный диабет у кошек — это хроническое заболевание, при котором поджелудочная железа вырабатывает недостаточно инсулина или клетки организма не реагируют на инсулин должным образом.

### Типы диабета

**Тип 1 (инсулинозависимый)**
Поджелудочная железа не производит инсулин. Встречается редко у кошек. Требует пожизненных инъекций инсулина.

**Тип 2 (инсулинонезависимый)**
Наиболее распространённый тип у кошек (~80-90% случаев). Клетки организма теряют чувствительность к инсулину. При правильном лечении возможна ремиссия.

### Факторы риска

- **Ожирение** — главный фактор риска
- **Возраст** старше 8 лет
- **Мужской пол** (коты болеют в 2 раза чаще)
- **Малоподвижный образ жизни**
- **Стероидная терапия**
- **Генетическая предрасположенность** (Бирманские кошки)
- **Хронический панкреатит**

### Основные симптомы

🔴 **Полиурия** — частое мочеиспускание, наполненный лоток
🔴 **Полидипсия** — чрезмерная жажда, питьё из необычных мест
🔴 **Потеря веса** при сохранённом или повышенном аппетите
🔴 **Вялость** и снижение активности
🔴 **Слабость задних лап** (диабетическая нейропатия)
🔴 **Помутнение хрусталика** (у собак чаще, у кошек редко)

### Диагностика

Диагноз ставится на основании:
- Стойкой гипергликемии (глюкоза > 14-16 ммоль/л)
- Глюкозурии (глюкоза в моче)
- Повышенного фруктозамина
- Клинических симптомов

> **Важно:** Стресс у кошек вызывает транзиторную гипергликемию до 20 ммоль/л, поэтому для диагноза нужна повторная оценка.

### Как глюкоза влияет на организм

При недостатке инсулина:
1. Глюкоза не попадает в клетки
2. Клетки «голодают», несмотря на высокий сахар в крови
3. Печень расщепляет жиры → кетоны
4. Развивается диабетический кетоацидоз (ДКА) — опасное состояние`,
      en: `## What Is Diabetes Mellitus in Cats?

Diabetes mellitus in cats is a chronic disease in which the pancreas produces insufficient insulin or the body's cells do not respond to insulin properly.

### Types of Diabetes

**Type 1 (Insulin-Dependent)**
The pancreas does not produce insulin. Rare in cats. Requires lifelong insulin injections.

**Type 2 (Non-Insulin-Dependent)**
The most common type in cats (~80-90% of cases). The body's cells lose sensitivity to insulin. Remission is possible with proper treatment.

### Risk Factors

- **Obesity** — the primary risk factor
- **Age** over 8 years
- **Male sex** (male cats are affected 2x more often)
- **Sedentary lifestyle**
- **Steroid therapy**
- **Genetic predisposition** (Burmese cats)
- **Chronic pancreatitis**

### Key Symptoms

🔴 **Polyuria** — frequent urination, overfilled litter box
🔴 **Polydipsia** — excessive thirst, drinking from unusual places
🔴 **Weight loss** despite normal or increased appetite
🔴 **Lethargy** and decreased activity
🔴 **Hind leg weakness** (diabetic neuropathy)
🔴 **Lens clouding** (more common in dogs, rare in cats)

### Diagnosis

Diagnosis is based on:
- Persistent hyperglycemia (glucose > 14-16 mmol/L)
- Glucosuria (glucose in urine)
- Elevated fructosamine
- Clinical symptoms

> **Important:** Stress in cats can cause transient hyperglycemia up to 20 mmol/L, so a repeat evaluation is needed for diagnosis.

### How Glucose Affects the Body

When insulin is insufficient:
1. Glucose cannot enter cells
2. Cells "starve" despite high blood sugar
3. The liver breaks down fats → ketones
4. Diabetic ketoacidosis (DKA) develops — a life-threatening condition`,
    },
    category: 'basics',
    readingTimeMinutes: 5,
    tags: [
      { ru: 'диабет', en: 'diabetes' },
      { ru: 'симптомы', en: 'symptoms' },
      { ru: 'диагностика', en: 'diagnosis' },
      { ru: 'типы', en: 'types' },
    ],
  },
  {
    id: 'remission',
    titleKey: {
      ru: 'Ремиссия диабета у кошек',
      en: 'Diabetes Remission in Cats',
    },
    summaryKey: {
      ru: 'До 90% кошек с сахарным диабетом 2 типа могут достичь полной ремиссии. Узнайте, что для этого нужно и как распознать ремиссию.',
      en: 'Up to 90% of cats with type 2 diabetes can achieve full remission. Learn what it takes and how to recognize remission.',
    },
    contentKey: {
      ru: `## Ремиссия диабета у кошек

Ремиссия — это состояние, при котором кошка больше не нуждается в инъекциях инсулина для поддержания нормального уровня глюкозы в крови.

### Статистика ремиссии

По данным исследований:
- **50–90%** кошек с диабетом 2 типа могут достичь ремиссии
- Большинство случаев ремиссии наступает в первые **1–6 месяцев** лечения
- При правильном подходе ремиссия достижима у большинства кошек

### Условия для достижения ремиссии

**1. Ранняя диагностика и начало лечения**
Чем раньше начато лечение, тем выше шансы на ремиссию. Каждый лишний месяц токсической гипергликемии снижает шансы.

**2. Строгий гликемический контроль**
Поддержание глюкозы в диапазоне 4–9 ммоль/л позволяет β-клеткам поджелудочной железы восстановиться.

**3. Диета с низким содержанием углеводов**
- Влажный корм с высоким содержанием белка и низким — углеводов (<10%)
- Никакого сухого корма (высокое содержание крахмала)
- Примеры: Hill's m/d, Purina DM, Fancy Feast Classics

**4. Снижение веса**
Нормализация веса значительно повышает чувствительность клеток к инсулину.

**5. Выбор инсулина**
Аналоги инсулина длительного действия (Гларгин/Лантус, Детемир/Левемир) дают более высокий процент ремиссии, чем НПХ-инсулины.

### Признаки приближающейся ремиссии

📉 Требуется всё меньшая доза инсулина
📉 Уровень глюкозы стабильно в норме
📉 Симптомы (жажда, частое мочеиспускание) исчезают
📉 Кошка возвращается к нормальному весу и активности

### Как подтвердить ремиссию

1. Дозу инсулина постепенно снижают под контролем кривых глюкозы
2. Если глюкоза остаётся < 7 ммоль/л (126 мг/дл) без инсулина в течение 4 недель — **ремиссия подтверждена** (критерий ISFM)
3. Продолжайте диету и мониторинг!

### Важно помнить

⚠️ Ремиссия — не «излечение». Диабет может вернуться при:
- Нарушении диеты
- Наборе веса
- Стрессе
- Применении стероидов

Продолжайте измерять глюкозу раз в 1–2 месяца даже в ремиссии.`,
      en: `## Diabetes Remission in Cats

Remission is a state in which a cat no longer requires insulin injections to maintain normal blood glucose levels.

### Remission Statistics

According to research:
- **50–90%** of cats with type 2 diabetes can achieve remission
- Most remissions occur within the first **1–6 months** of treatment
- With the right approach, remission is achievable for the majority of cats

### Requirements for Achieving Remission

**1. Early Diagnosis and Treatment**
The sooner treatment begins, the higher the chances of remission. Every extra month of toxic hyperglycemia reduces the odds.

**2. Tight Glycemic Control**
Maintaining glucose in the 4–9 mmol/L range allows the pancreatic beta-cells to recover.

**3. Low-Carbohydrate Diet**
- Wet food with high protein and low carbohydrates (<10%)
- No dry food (high starch content)
- Examples: Hill's m/d, Purina DM, Fancy Feast Classics

**4. Weight Loss**
Normalizing weight significantly improves cellular insulin sensitivity.

**5. Insulin Choice**
Long-acting insulin analogs (Glargine/Lantus, Detemir/Levemir) yield higher remission rates than NPH insulins.

### Signs of Approaching Remission

📉 Progressively lower insulin doses needed
📉 Glucose levels consistently within normal range
📉 Symptoms (thirst, frequent urination) disappear
📉 Cat returns to normal weight and activity

### How to Confirm Remission

1. Gradually reduce the insulin dose while monitoring glucose curves
2. If glucose remains < 7 mmol/L (126 mg/dL) without insulin for 4 weeks — **remission is confirmed** (ISFM criterion)
3. Continue the diet and monitoring!

### Important to Remember

⚠️ Remission is not a "cure." Diabetes can return with:
- Diet violations
- Weight gain
- Stress
- Steroid use

Continue measuring glucose once every 1–2 months even during remission.`,
    },
    category: 'remission',
    readingTimeMinutes: 6,
    tags: [
      { ru: 'ремиссия', en: 'remission' },
      { ru: 'лечение', en: 'treatment' },
      { ru: 'диета', en: 'diet' },
      { ru: 'инсулин', en: 'insulin' },
    ],
  },
  {
    id: 'neuropathy',
    titleKey: {
      ru: 'Диабетическая нейропатия',
      en: 'Diabetic Neuropathy',
    },
    summaryKey: {
      ru: 'Слабость задних лап — один из характерных признаков диабета у кошек. Узнайте о диабетической нейропатии и методах её лечения.',
      en: 'Hind leg weakness is one of the hallmark signs of diabetes in cats. Learn about diabetic neuropathy and its treatment options.',
    },
    contentKey: {
      ru: `## Диабетическая нейропатия у кошек

Диабетическая нейропатия — это повреждение нервов, вызванное длительной гипергликемией. У кошек проявляется специфической «плантиградной» (планtigrade) постановкой задних лап.

### Как выглядит нейропатия

Здоровая кошка ходит на пальцах (дигитиградная постановка).
При нейропатии кошка ходит **на всей поверхности лапы** (плантиградная постановка) — как будто «подламываются» задние ноги.

### Другие проявления

- Слабость задних конечностей
- Шаткая, неуверенная походка
- Кошка не может запрыгнуть на диван
- Снижение чувствительности лап
- Боль (кошка избегает ходьбы)

### Почему это происходит

Хроническая гипергликемия → накопление сорбитола в нервных клетках → демиелинизация нервных волокон → нарушение проведения нервных импульсов.

### Лечение и прогноз

**Хорошая новость:** нейропатия у кошек **обратима** при нормализации уровня глюкозы!

Восстановление занимает от **1 до 6 месяцев** при достижении хорошего гликемического контроля.

**Что помогает:**
- Нормализация глюкозы (основа лечения)
- Витамин B12 (метилкобаламин) — 0.5–1 мг/кг
- Физиотерапия (мягкий массаж лап)
- Удобная мягкая подстилка
- Миски и лоток с низкими бортиками

### Когда обратиться к ветеринару

Немедленно при:
- Внезапном ухудшении
- Полном отказе задних лап
- Болевых реакциях`,
      en: `## Diabetic Neuropathy in Cats

Diabetic neuropathy is nerve damage caused by prolonged hyperglycemia. In cats, it manifests as a characteristic "plantigrade" stance of the hind legs.

### What Neuropathy Looks Like

A healthy cat walks on its toes (digitigrade stance).
With neuropathy, the cat walks **on the entire surface of the paw** (plantigrade stance) — as if the hind legs are "buckling."

### Other Manifestations

- Hind limb weakness
- Wobbly, unsteady gait
- Inability to jump onto furniture
- Decreased paw sensitivity
- Pain (cat avoids walking)

### Why This Happens

Chronic hyperglycemia → accumulation of sorbitol in nerve cells → demyelination of nerve fibers → impaired nerve impulse conduction.

### Treatment and Prognosis

**Good news:** neuropathy in cats is **reversible** when glucose levels are normalized!

Recovery takes **1 to 6 months** once good glycemic control is achieved.

**What helps:**
- Glucose normalization (the foundation of treatment)
- Vitamin B12 (methylcobalamin) — 0.5–1 mg/kg
- Physiotherapy (gentle paw massage)
- Comfortable soft bedding
- Bowls and litter box with low sides

### When to See a Veterinarian

Immediately if:
- Sudden worsening occurs
- Complete hind leg paralysis
- Pain responses are observed`,
    },
    category: 'complications',
    readingTimeMinutes: 4,
    tags: [
      { ru: 'нейропатия', en: 'neuropathy' },
      { ru: 'осложнения', en: 'complications' },
      { ru: 'лапы', en: 'legs' },
      { ru: 'симптомы', en: 'symptoms' },
    ],
  },
  {
    id: 'diet',
    titleKey: {
      ru: 'Диета при диабете у кошек',
      en: 'Diet for Diabetic Cats',
    },
    summaryKey: {
      ru: 'Правильное питание — ключевой элемент лечения диабета. Узнайте, что можно и нельзя кормить диабетической кошке.',
      en: 'Proper nutrition is a key element of diabetes management. Learn what to feed and what to avoid for a diabetic cat.',
    },
    contentKey: {
      ru: `## Диета при диабете у кошек

Питание — один из важнейших факторов лечения диабета. Правильная диета снижает потребность в инсулине и повышает шансы на ремиссию.

### Главное правило: НИЗКИЕ УГЛЕВОДЫ

Кошки — облигатные плотоядные. Их организм не приспособлен к переработке большого количества углеводов.

**Целевое содержание углеводов:** менее 10% от калорийности (в идеале 5-7%)

### Влажный vs. Сухой корм

| | Влажный корм | Сухой корм |
|---|---|---|
| Углеводы | 5-20% | 30-50% |
| Белок | 40-60% | 25-40% |
| Вода | 70-80% | 8-12% |
| **Для диабетика** | ✅ Отлично | ❌ Не рекомендуется |

> **Вывод:** Переходите на влажный корм немедленно!

### Рекомендуемые корма

**Специальные диабетические:**
- Hill's Prescription Diet m/d
- Purina Veterinary Diets DM
- Royal Canin Diabetic

**Обычные влажные корма с низкими углеводами:**
- Fancy Feast Classic (Тунец, Курица, Говядина)
- Sheba (многие варианты)
- Felix (влажный)

### Чего избегать

❌ Любой сухой корм
❌ Корма с зерном (пшеница, кукуруза, рис)
❌ Полуфабрикаты
❌ Сладости и фрукты
❌ Частые перекусы (дестабилизируют глюкозу)

### Режим кормления

**При 2 инъекциях в день:**
- Кормление строго перед инъекцией
- Примерно одинаковое количество еды каждый раз

**При нежелании есть перед уколом:**
- Не делайте укол, если кошка не ела!
- Проконсультируйтесь с ветеринаром

### Снижение веса

При ожирении:
- Постепенное снижение (не более 1-2% веса в неделю!)
- Резкое снижение калорий → опасность гепатолипидоза
- Цель: 3.5-5 кг для большинства кошек

### Переход на новый корм

Делайте постепенно в течение 7-10 дней:
1. День 1-3: 25% нового, 75% старого
2. День 4-6: 50/50
3. День 7-9: 75% нового, 25% старого
4. День 10+: 100% новый

⚠️ Быстрый перевод может вызвать расстройство ЖКТ и нестабильность глюкозы!`,
      en: `## Diet for Diabetic Cats

Nutrition is one of the most important factors in diabetes management. A proper diet reduces insulin requirements and increases the chances of remission.

### The Golden Rule: LOW CARBOHYDRATES

Cats are obligate carnivores. Their bodies are not designed to process large amounts of carbohydrates.

**Target carbohydrate content:** less than 10% of calories (ideally 5-7%)

### Wet vs. Dry Food

| | Wet Food | Dry Food |
|---|---|---|
| Carbohydrates | 5-20% | 30-50% |
| Protein | 40-60% | 25-40% |
| Water | 70-80% | 8-12% |
| **For diabetics** | ✅ Excellent | ❌ Not recommended |

> **Conclusion:** Switch to wet food immediately!

### Recommended Foods

**Specialized diabetic formulas:**
- Hill's Prescription Diet m/d
- Purina Veterinary Diets DM
- Royal Canin Diabetic

**Regular wet foods with low carbohydrates:**
- Fancy Feast Classic (Tuna, Chicken, Beef)
- Sheba (many varieties)
- Felix (wet)

### What to Avoid

❌ Any dry food
❌ Foods with grains (wheat, corn, rice)
❌ Processed foods
❌ Sweets and fruits
❌ Frequent snacks (destabilize glucose)

### Feeding Schedule

**With 2 injections per day:**
- Feed strictly before the injection
- Approximately equal amounts of food each time

**If the cat refuses to eat before the injection:**
- Do not give the injection if the cat hasn't eaten!
- Consult your veterinarian

### Weight Loss

For obese cats:
- Gradual reduction (no more than 1-2% of body weight per week!)
- Rapid calorie reduction → risk of hepatic lipidosis
- Target: 3.5-5 kg for most cats

### Transitioning to New Food

Do it gradually over 7-10 days:
1. Days 1-3: 25% new, 75% old
2. Days 4-6: 50/50
3. Days 7-9: 75% new, 25% old
4. Day 10+: 100% new

⚠️ A rapid switch can cause gastrointestinal upset and glucose instability!`,
    },
    category: 'nutrition',
    readingTimeMinutes: 7,
    tags: [
      { ru: 'диета', en: 'diet' },
      { ru: 'питание', en: 'nutrition' },
      { ru: 'корм', en: 'food' },
      { ru: 'углеводы', en: 'carbohydrates' },
    ],
  },
  {
    id: 'common-mistakes',
    titleKey: {
      ru: 'Частые ошибки при лечении диабета',
      en: 'Common Mistakes in Diabetes Management',
    },
    summaryKey: {
      ru: 'Избегайте типичных ошибок, которые совершают владельцы кошек с диабетом. Эти знания могут спасти жизнь вашему питомцу.',
      en: 'Avoid the typical mistakes made by owners of diabetic cats. This knowledge can save your pet\'s life.',
    },
    contentKey: {
      ru: `## Частые ошибки при лечении диабета

Лечение диабета у кошек требует постоянства и внимательности. Рассмотрим наиболее частые ошибки.

### ❌ Ошибка 1: Инъекция без еды

**Проблема:** Введение инсулина кошке, которая не ела, может вызвать опасную гипогликемию.

**Правило:** Никогда не вводите инсулин, если кошка не съела хотя бы половину порции!

При отказе от еды:
- Попробуйте другой корм
- Дайте 30 минут
- Если не ест — пропустите дозу и позвоните ветеринару

---

### ❌ Ошибка 2: Нерегулярные инъекции

**Проблема:** Пропуски доз или неодинаковые интервалы нарушают стабильность глюкозы.

**Правило:** Инъекции каждые 12 часов (±30 минут максимум). Установите напоминания!

---

### ❌ Ошибка 3: Самостоятельное изменение дозы

**Проблема:** Повышение дозы из-за «высокой глюкозы» без кривой глюкозы может быть опасным.

**Правило:** Любое изменение дозы — только после консультации с ветеринаром и на основании кривых глюкозы.

---

### ❌ Ошибка 4: Кормление сухим кормом

**Проблема:** Сухой корм содержит 30-50% углеводов — это катастрофа для диабетика.

**Правило:** Только влажный корм с низким содержанием углеводов.

---

### ❌ Ошибка 5: Игнорирование симптомов гипогликемии

**Признаки гипо:**
- Слабость, шатание
- Дрожь
- Дезориентация
- Судороги

**Действие:** Немедленно нанесите сироп глюкозы или мёд на дёсны → звонок ветеринару!

---

### ❌ Ошибка 6: Неправильное хранение инсулина

- Открытый флакон — не более 28 дней (Гларгин) или по инструкции
- Хранение при 2-8°C (в дверце холодильника)
- Не замораживать!
- Проверять прозрачность (мутный — выбросить)

---

### ❌ Ошибка 7: Отказ от мониторинга дома

Посещение клиники для кривых глюкозы стресс → искажённые результаты.

Домашний мониторинг даёт:
- Реальные показатели без стресса
- Раннее обнаружение гипо
- Данные для оптимизации дозы

**Как мерить:** Глюкометром в ушной вене или лапке. Попросите ветеринара показать технику.

---

### ✅ Золотые правила

1. Еда → Инъекция (никогда не наоборот)
2. Регулярность — основа стабильности
3. Низкоуглеводная диета
4. Домашний мониторинг глюкозы
5. Регулярные визиты к ветеринару (каждые 3-6 месяцев при стабильном состоянии)`,
      en: `## Common Mistakes in Diabetes Management

Managing diabetes in cats requires consistency and attentiveness. Let's look at the most common mistakes.

### ❌ Mistake 1: Injecting Without Food

**Problem:** Giving insulin to a cat that hasn't eaten can cause dangerous hypoglycemia.

**Rule:** Never give insulin if the cat hasn't eaten at least half of its meal!

If the cat refuses to eat:
- Try a different food
- Wait 30 minutes
- If still not eating — skip the dose and call the veterinarian

---

### ❌ Mistake 2: Irregular Injections

**Problem:** Missed doses or inconsistent intervals disrupt glucose stability.

**Rule:** Injections every 12 hours (±30 minutes maximum). Set reminders!

---

### ❌ Mistake 3: Adjusting the Dose on Your Own

**Problem:** Increasing the dose due to "high glucose" without a glucose curve can be dangerous.

**Rule:** Any dose change — only after consulting with a veterinarian and based on glucose curves.

---

### ❌ Mistake 4: Feeding Dry Food

**Problem:** Dry food contains 30-50% carbohydrates — a disaster for a diabetic.

**Rule:** Only wet food with low carbohydrate content.

---

### ❌ Mistake 5: Ignoring Hypoglycemia Symptoms

**Signs of hypo:**
- Weakness, staggering
- Trembling
- Disorientation
- Seizures

**Action:** Immediately apply glucose syrup or honey to the gums → call the veterinarian!

---

### ❌ Mistake 6: Improper Insulin Storage

- Opened vial — no more than 28 days (Glargine) or per instructions
- Store at 2-8°C (in the refrigerator door)
- Do not freeze!
- Check for clarity (cloudy — discard)

---

### ❌ Mistake 7: Refusing to Monitor at Home

Clinic visits for glucose curves cause stress → distorted results.

Home monitoring provides:
- Accurate readings without stress
- Early detection of hypo
- Data for dose optimization

**How to measure:** With a glucometer from the ear vein or paw pad. Ask your veterinarian to demonstrate the technique.

---

### ✅ Golden Rules

1. Food → Injection (never the other way around)
2. Consistency is the foundation of stability
3. Low-carbohydrate diet
4. Home glucose monitoring
5. Regular veterinary visits (every 3-6 months when stable)`,
    },
    category: 'tips',
    readingTimeMinutes: 6,
    tags: [
      { ru: 'ошибки', en: 'mistakes' },
      { ru: 'советы', en: 'tips' },
      { ru: 'безопасность', en: 'safety' },
      { ru: 'инсулин', en: 'insulin' },
    ],
  },
];
