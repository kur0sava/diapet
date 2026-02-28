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
- Витамин B12 (метилкобаламин) — 0.5–1 мг/кошку/день PO
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
- Vitamin B12 (methylcobalamin) — 0.5–1 mg/cat/day PO
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
  {
    id: 'insulin_types',
    titleKey: {
      ru: 'Инсулины для кошек',
      en: 'Insulin Types for Cats',
    },
    summaryKey: {
      ru: 'Разные инсулины работают по-разному у кошек. Узнайте об основных препаратах, их продолжительности действия, концентрациях и правилах хранения.',
      en: 'Different insulins behave differently in cats. Learn about the main preparations, their duration of action, concentrations, and storage rules.',
    },
    contentKey: {
      ru: `## Инсулины для кошек

Не все инсулины одинаково эффективны у кошек. Фармакокинетика (начало действия, пик, продолжительность) у кошек существенно отличается от человека. Выбор инсулина — решение ветеринара.

### Основные инсулины

#### Гларгин (Lantus) — предпочтительный выбор

- **Концентрация:** U-100 (100 ЕД/мл)
- **Начало / Пик / Длительность:** 1–3 ч / 4–8 ч / 10–16 ч
- **Режим:** 2 раза в сутки (каждые 12 ч)
- **Особенности:** Наибольший процент ремиссии при совместном применении с низкоуглеводной диетой
- **Хранение:** Вскрытый флакон 28 дней при комнатной температуре

#### Детемир (Levemir)

- **Концентрация:** U-100
- **Начало / Пик / Длительность:** 0.5–2 ч / 3–6 ч / 10–16 ч
- **Особенности:** Мощный инсулин, начинают с очень низких доз
- **Хранение:** Вскрытый флакон 42 дня

#### ProZinc (PZI) — ветеринарный

- **Концентрация:** U-40 (40 ЕД/мл) — требует шприцев U-40!
- **Начало / Пик / Длительность:** 1–4 ч / 4–8 ч / 8–14 ч
- **Особенности:** Единственный FDA-одобренный инсулин для кошек (США)
- **Хранение:** 28 дней в холодильнике

#### Caninsulin / Vetsulin — ветеринарный

- **Концентрация:** U-40 — требует шприцев U-40!
- **Начало / Пик / Длительность:** 0.5–2 ч / 2–6 ч / 6–12 ч
- **Особенности:** Зарегистрирован для кошек в ЕС, Австралии, Канаде
- **Хранение:** 28 дней в холодильнике

#### Протафан / НПХ (NPH)

- **Концентрация:** U-100
- **Длительность:** 6–10 ч — слишком короткое у большинства кошек
- **Особенности:** Не является препаратом первого выбора (ISFM 2023)

### U-40 против U-100 — критическое различие

| Концентрация | ЕД на 1 мл | Нужный шприц |
|---|---|---|
| U-40 | 40 единиц | Шприц U-40 |
| U-100 | 100 единиц | Шприц U-100 |

> **ВНИМАНИЕ:** Использование шприца U-100 с инсулином U-40 = передозировка в 2.5 раза. Всегда уточняйте у ветеринара, какой шприц использовать.

### Правила хранения

- Невскрытый флакон: в холодильнике при +2...+8°C
- Никогда не замораживать, беречь от солнца и нагрева
- ProZinc и Caninsulin — осторожно перекатывать между ладонями перед набором (не встряхивать)
- Перед инъекцией — дать нагреться до комнатной температуры (1–2 мин в руках)

> **Важно:** Никогда не меняйте тип инсулина, дозу или режим без согласования с ветеринаром.`,
      en: `## Insulin Types for Cats

Not all insulins work equally well in cats. Pharmacokinetics (onset, peak, duration) in cats differ substantially from humans. The choice of insulin is your veterinarian's decision.

### Main Insulins

#### Glargine (Lantus) — Preferred Choice

- **Concentration:** U-100 (100 units/mL)
- **Onset / Peak / Duration:** 1–3 h / 4–8 h / 10–16 h
- **Schedule:** Twice daily (every 12 hours)
- **Notes:** Highest remission rates when combined with low-carbohydrate diet
- **Storage:** Opened vial 28 days at room temperature

#### Detemir (Levemir)

- **Concentration:** U-100
- **Onset / Peak / Duration:** 0.5–2 h / 3–6 h / 10–16 h
- **Notes:** Potent insulin — start at very low doses
- **Storage:** Opened vial 42 days

#### ProZinc (PZI) — Veterinary

- **Concentration:** U-40 (40 units/mL) — requires U-40 syringes!
- **Onset / Peak / Duration:** 1–4 h / 4–8 h / 8–14 h
- **Notes:** Only FDA-approved insulin specifically for cats (USA)
- **Storage:** 28 days refrigerated after opening

#### Caninsulin / Vetsulin — Veterinary

- **Concentration:** U-40 — requires U-40 syringes!
- **Onset / Peak / Duration:** 0.5–2 h / 2–6 h / 6–12 h
- **Notes:** Registered for cats in the EU, Australia, and Canada
- **Storage:** 28 days refrigerated

#### Protaphane / NPH

- **Concentration:** U-100
- **Duration:** 6–10 h — too short for most cats
- **Notes:** Not a first-line choice for cats (ISFM 2023)

### U-40 vs U-100 — Critical Distinction

| Concentration | Units per mL | Required Syringe |
|---|---|---|
| U-40 | 40 units | U-40 syringe |
| U-100 | 100 units | U-100 syringe |

> **WARNING:** Using a U-100 syringe with U-40 insulin = 2.5x overdose. Always confirm the correct syringe type with your veterinarian.

### Storage Rules

- Unopened vial: refrigerate at +2...+8°C
- Never freeze; keep away from sunlight and heat
- ProZinc and Caninsulin: gently roll between palms before drawing (do not shake)
- Bring to room temperature before injecting (hold in hands 1–2 minutes)

> **Important:** Never change the insulin type, dose, or schedule without consulting your veterinarian.`,
    },
    category: 'treatment',
    readingTimeMinutes: 6,
    tags: [
      { ru: 'инсулин', en: 'insulin' },
      { ru: 'лечение', en: 'treatment' },
      { ru: 'дозировка', en: 'dosage' },
      { ru: 'шприц', en: 'syringe' },
    ],
  },
  {
    id: 'glucose_monitoring',
    titleKey: {
      ru: 'Мониторинг глюкозы дома',
      en: 'Home Glucose Monitoring',
    },
    summaryKey: {
      ru: 'Домашний контроль глюкозы — ключевой инструмент управления диабетом у кошки. Узнайте про кривые глюкозы, надир и как интерпретировать результаты.',
      en: 'Home glucose monitoring is the key tool for managing your cat\'s diabetes. Learn about glucose curves, nadir, and how to interpret results.',
    },
    contentKey: {
      ru: `## Мониторинг глюкозы дома

Регулярное измерение глюкозы — основа безопасного управления диабетом. Домашний мониторинг точнее клинического: стресс в клинике поднимает глюкозу до 15–17 ммоль/л даже у здоровых кошек.

### Глюкометры

#### AlphaTRAK 2 (рекомендован ветеринарами)

- Специально откалиброван для кошек и собак
- Код калибровки: **код 7 для кошек** (важно выбрать правильный!)
- Объём крови: 0.3–0.5 мкл (минимальный укол)
- Полоски специфические для AlphaTRAK 2

#### FreeStyle Libre (непрерывный CGM)

- Человеческий прибор, адаптируется для кошек
- Сенсор крепится на кожу (холка или бок)
- Измеряет глюкозу в тканевой жидкости: задержка 10–15 мин, отклонение 10–20%
- Требует установки и интерпретации под наблюдением ветеринара

### Где брать кровь

**Ушная раковина (краевая вена)** — наиболее удобный метод:
1. Согрейте ухо несколько секунд
2. Быстрый укол ланцетом в краевую вену
3. Не сдавливайте ухо — дождитесь капли самостоятельно
4. Прикоснитесь полоской к капле, затем зажмите ухо тампоном 30 сек

### Кривая глюкозы

Серия измерений на протяжении 12-часового цикла:

**Полный протокол:** 0 ч → 2 ч → 4 ч → 6 ч → 8 ч → 10 ч → 12 ч
**Минимальный:** 0 ч → 4 ч → 6–8 ч (надир) → 12 ч

### Надир — ключевое значение

Надир — **наименьшее значение** глюкозы в цикле. Именно по надиру ветеринар корректирует дозу.

**Целевой надир для кошек:** 5.5–8.0 ммоль/л (100–144 мг/дл)

| Надир | Интерпретация | Действие |
|---|---|---|
| < 3.3 ммоль/л | Гипогликемия | Снизить дозу, вызвать врача |
| 3.3–5.5 | Ниже цели | Рассмотреть снижение дозы |
| 5.5–8.0 | **Целевой** | Доза подобрана |
| 8.0–14.0 | Выше цели | Рассмотреть повышение дозы |
| > 14.0 | Плохой контроль | Консультация ветеринара |

### Феномен Сомоджи (рикошет)

Глюкоза падает слишком низко → организм выбрасывает гормоны → глюкоза резко растёт.
**Выглядит как гипергликемия, но причина — передозировка инсулина.**
Решение: снижение дозы (не повышение!).

### Частота мониторинга

- **Подбор дозы:** кривая каждые 1–2 недели
- **Стабильный контроль:** кривая раз в 1–3 месяца + ежедневные разовые измерения
- **При недомогании:** измерить немедленно

> Коррекцию дозы всегда делает ветеринар. Не меняйте дозу самостоятельно.`,
      en: `## Home Glucose Monitoring

Regular glucose measurement is the foundation of safe diabetes management. Home monitoring is more accurate than clinic visits: stress alone can raise glucose to 15–17 mmol/L in healthy cats.

### Glucometers

#### AlphaTRAK 2 (Veterinarian-Recommended)

- Specifically calibrated for cats and dogs
- Calibration code: **code 7 for cats** (selecting the correct code is essential)
- Blood volume: 0.3–0.5 µL (minimal lancet stick)
- Strips are specific to AlphaTRAK 2

#### FreeStyle Libre (Continuous CGM)

- Human device adapted for cats
- Sensor placed on skin (scruff or flank)
- Measures interstitial fluid glucose: 10–15 min lag, 10–20% variance
- Requires veterinary supervision for placement and interpretation

### Where to Collect Blood

**Ear pinna (marginal vein)** — most convenient method:
1. Warm the ear for a few seconds
2. Quick lancet prick in the marginal vein
3. Do not squeeze — wait for the drop to form naturally
4. Touch strip to drop, then hold cotton pad against ear for 30 sec

### Glucose Curve

A series of measurements across a 12-hour insulin cycle:

**Full protocol:** 0 h → 2 h → 4 h → 6 h → 8 h → 10 h → 12 h
**Minimal:** 0 h → 4 h → 6–8 h (nadir) → 12 h

### Nadir — The Key Value

The nadir is the **lowest glucose point** in the cycle. The veterinarian uses it to adjust the dose.

**Target nadir for cats:** 5.5–8.0 mmol/L (100–144 mg/dL)

| Nadir | Interpretation | Action |
|---|---|---|
| < 3.3 mmol/L | Hypoglycemia | Reduce dose, contact vet |
| 3.3–5.5 | Below target | Consider dose reduction |
| 5.5–8.0 | **Target range** | Dose well adjusted |
| 8.0–14.0 | Above target | Consider dose increase |
| > 14.0 | Poor control | Consult veterinarian |

### Somogyi Rebound

Glucose drops too low → body releases stress hormones → glucose rises sharply.
**Looks like hyperglycemia, but the cause is insulin overdose.**
Solution: reduce the dose (not increase it).

### Monitoring Frequency

- **Dose adjustment:** glucose curve every 1–2 weeks
- **Stable control:** curve every 1–3 months + daily spot checks
- **Any illness:** measure immediately

> Dose adjustments are always made by the veterinarian. Do not adjust the dose on your own.`,
    },
    category: 'monitoring',
    readingTimeMinutes: 7,
    tags: [
      { ru: 'мониторинг', en: 'monitoring' },
      { ru: 'глюкоза', en: 'glucose' },
      { ru: 'кривая глюкозы', en: 'glucose curve' },
      { ru: 'надир', en: 'nadir' },
    ],
  },
  {
    id: 'fructosamine',
    titleKey: {
      ru: 'Фруктозамин: контроль за 2–3 недели',
      en: 'Fructosamine: 2–3 Week Control Marker',
    },
    summaryKey: {
      ru: 'Фруктозамин — анализ крови, показывающий средний уровень глюкозы за последние 2–3 недели. Норма для кошек 170–340 мкмоль/л.',
      en: 'Fructosamine is a blood test showing average glucose over the past 2–3 weeks. Normal range for cats: 170–340 µmol/L.',
    },
    contentKey: {
      ru: `## Фруктозамин: долгосрочный контроль диабета у кошек

Разовые измерения глюкозы — «мгновенный снимок». Фруктозамин показывает «среднюю температуру» за последние 2–3 недели.

### Что такое фруктозамин

Продукт необратимой реакции глюкозы с белками крови (преимущественно альбумином). Чем выше глюкоза на протяжении 2–3 недель — тем выше фруктозамин.

### Почему не HbA1c (как у людей)?

У кошек эритроциты живут ~70 дней (у людей ~120 дней), а реакция гемоглобина с глюкозой протекает иначе. Поэтому HbA1c у кошек неинформативен — стандарт для кошек **фруктозамин**.

### Референсные значения

| Значение (мкмоль/л) | Интерпретация |
|---|---|
| 170–340 | Норма у здоровой кошки |
| 340–400 | Хороший контроль диабета |
| 400–500 | Удовлетворительный контроль |
| > 500 | Плохой контроль — нужна коррекция |
| > 600 | Очень плохой — высокий риск осложнений |

### Ложно заниженный результат

Фруктозамин может быть **занижен** при:
- Гипоальбуминемии (болезни печени, почек, воспаления)
- Гипертиреозе кошек (ускоренный белковый обмен)
- Гемолизе пробы крови

Всегда интерпретируется вместе с клинической картиной и домашними измерениями.

### Когда сдавать

- **При диагностике:** подтверждает хроническую гипергликемию (исключает стресс)
- **Подбор дозы:** каждые 4–6 недель
- **Стабильный контроль:** каждые 3–6 месяцев
- **Подозрение на ремиссию или ухудшение:** для объективной оценки

### Фруктозамин при ремиссии

После ремиссии возвращается к норме (170–340 мкмоль/л). Рост выше 400 мкмоль/л у кошки в ремиссии — ранний признак возврата диабета, часто ещё до симптомов.

> Продолжайте проверять фруктозамин каждые 3–6 месяцев даже в ремиссии.`,
      en: `## Fructosamine: Long-Term Diabetes Control in Cats

Single glucose measurements are an "instant snapshot." Fructosamine shows the "average" over the past 2–3 weeks.

### What Is Fructosamine

The product of an irreversible reaction between glucose and blood proteins (primarily albumin). The higher blood glucose over the past 2–3 weeks, the more fructosamine is formed.

### Why Not HbA1c (Like in Humans)?

Cat red blood cells live ~70 days (vs ~120 days in humans), and feline hemoglobin reacts with glucose differently. HbA1c is not informative in cats — **fructosamine** is the standard.

### Reference Values

| Value (µmol/L) | Interpretation |
|---|---|
| 170–340 | Normal for a healthy cat |
| 340–400 | Good diabetic control |
| 400–500 | Acceptable control |
| > 500 | Poor control — dose adjustment needed |
| > 600 | Very poor — high complication risk |

### Falsely Low Results

Fructosamine can be **falsely lowered** by:
- Hypoalbuminemia (liver disease, kidney disease, inflammation)
- Hyperthyroidism (accelerated protein turnover)
- Hemolysis of the blood sample

Always interpret alongside clinical signs and home glucose measurements.

### When to Test

- **At diagnosis:** confirms chronic hyperglycemia (rules out a stress response)
- **Dose adjustment period:** every 4–6 weeks
- **Stable control:** every 3–6 months
- **Suspected remission or worsening:** for objective assessment

### Fructosamine During Remission

After remission, returns to the healthy range (170–340 µmol/L). A rise above 400 µmol/L in a cat in remission is an early sign of relapse — often before symptoms appear.

> Continue testing fructosamine every 3–6 months even during remission.`,
    },
    category: 'monitoring',
    readingTimeMinutes: 5,
    tags: [
      { ru: 'фруктозамин', en: 'fructosamine' },
      { ru: 'мониторинг', en: 'monitoring' },
      { ru: 'анализ крови', en: 'blood test' },
      { ru: 'гликемический контроль', en: 'glycemic control' },
    ],
  },
];
