import { Article } from '../../types';

export const costPlanning: Article = {
  id: 'cost-planning',
  titleKey: {
    ru: 'Бюджет лечения диабета',
    en: 'Diabetes Treatment Budget',
  },
  summaryKey: {
    ru: 'Сколько стоит лечение диабета у кошки: инсулин, тест-полоски, корм, визиты к ветеринару.',
    en: 'How much diabetes treatment costs: insulin, test strips, food, vet visits.',
  },
  contentKey: {
    ru: `## Бюджет лечения: сколько стоит диабет у кошки

Диабет — это долгосрочные расходы. Но хорошая новость: при правильном планировании это вполне подъёмная сумма. Разберём по категориям.

### Разовые расходы (первый месяц)

| Позиция | Россия | Европа/США |
|---------|--------|------------|
| Глюкометр | 500-2000 ₽ | €20-50 |
| Ланцеты (100 шт) | 200-400 ₽ | €5-10 |
| Первичный приём ветеринара | 1500-5000 ₽ | €50-150 |
| Анализы крови (биохимия + Т4) | 2000-5000 ₽ | €80-200 |

### Ежемесячные расходы

| Позиция | Россия | Европа/США |
|---------|--------|------------|
| Инсулин (Лантус/Левемир) | 1500-3500 ₽ | €30-80 |
| Тест-полоски (50 шт) | 800-2000 ₽ | €15-40 |
| Корм (низкоуглеводный влажный) | 3000-8000 ₽ | €50-120 |
| Шприцы/иглы | 300-600 ₽ | €5-15 |

**Итого в месяц: 5 600 - 14 000 ₽ / €100 - 255**

### Периодические расходы

- Фруктозамин (каждые 2-3 месяца): 500-1500 ₽ / €15-40
- Повторный приём ветеринара (раз в 2-3 месяца): 1000-3000 ₽ / €40-100
- Анализ мочи (раз в 3-6 месяцев): 500-1000 ₽ / €10-30

### Как сэкономить (без ущерба здоровью)

**Инсулин:**
- Один флакон Лантуса (10 мл) хватает на 2-6 месяцев при малых дозах
- Храните правильно: в холодильнике, не замораживать
- Открытый флакон: **строго по инструкции производителя — 28 дней** (Sanofi SPC для Лантуса). Некоторые ветеринары используют вскрытый флакон дольше при хранении в холодильнике, но это off-label практика без доказательной базы: после 28 дней не гарантируется ни стерильность, ни стабильность действующего вещества. Если бюджет критичен — обсуди с ветеринаром, но сам не продлевай
- **В России:** РинГлар (Герофарм) — биосимиляр Лантуса, то же действующее вещество, но ~1500-2500 руб vs 3000-4500 руб за Лантус. Спросите ветеринара
- Ринсулин НПХ — самый бюджетный (500-1000 руб), но менее эффективен для кошек

**Полоски:**
- **В России:** AlphaTRAK 2 недоступен. Рекомендуем **Contour Plus** (хорошее качество) или **Сателлит Экспресс** (самые дешёвые полоски — 400-600 руб/50 шт, но точность ниже). Помните: человеческие глюкометры занижают результат у кошек на 10-15%
- За рубежом: AlphaTRAK 2 — точнее, но полоски дороже
- Покупайте полоски оптом (100 шт = дешевле за штуку)
- Не тестируйте каждый день, если кошка стабильна (2-3 раза в неделю достаточно)
- FreeStyle Libre 2 (~5000-7000 руб/сенсор на 14 дней) может быть выгоднее, чем ежедневные полоски при построении кривых

**Корм:**
- **В России:** Royal Canin Diabetic — самый надёжный (завод в Дмитрове, стабильные поставки). Karmy Veterinary Diabetic — российский бюджетный вариант
- Fancy Feast Classic (в США) — дешёвая низкоуглеводная альтернатива
- Hill's m/d: в России поставки нерегулярные, цены x2-3
- Готовьте сами? Только после консультации с ветеринарным диетологом

**Ветеринар:**
- Спросите о программе лояльности
- Некоторые клиники предлагают пакетные обследования со скидкой
- Онлайн-консультации дешевле очных (для контрольных визитов)

**Сообщества:**
- Группы владельцев кошек-диабетиков (ВКонтакте, Telegram) — взаимная помощь, советы, оптовые закупки полосок

### Отслеживание расходов

Используйте раздел «Расходы» в DiaPet! Он создан именно для этого — отслеживать траты по категориям и видеть общую картину.

### Экстренные расходы

Держите «подушку безопасности» на случай:
- Кетоацидоз (лечение в стационаре): 10 000-50 000 ₽ / €300-2000
- Обследование при резком ухудшении: 5 000-15 000 ₽ / €100-500

> **Главное:** диабет — это управляемая болезнь. При стабильном контроле расходы предсказуемы и не растут со временем.`,
    en: `## Treatment Budget: How Much Does Feline Diabetes Cost

Diabetes is a long-term expense. But the good news: with proper planning, it's quite manageable. Let's break it down by category.

### One-Time Costs (First Month)

| Item | Russia | Europe/US |
|------|--------|-----------|
| Glucometer | 500-2000 ₽ | €20-50 / $15-40 |
| Lancets (100 pcs) | 200-400 ₽ | €5-10 |
| Initial vet visit | 1500-5000 ₽ | €50-150 / $50-200 |
| Blood work (chemistry + T4) | 2000-5000 ₽ | €80-200 / $100-300 |

### Monthly Costs

| Item | Russia | Europe/US |
|------|--------|-----------|
| Insulin (Lantus/Levemir) | 1500-3500 ₽ | €30-80 / $30-100 |
| Test strips (50 pcs) | 800-2000 ₽ | €15-40 / $15-50 |
| Food (low-carb wet) | 3000-8000 ₽ | €50-120 / $50-150 |
| Syringes/needles | 300-600 ₽ | €5-15 |

**Monthly total: 5,600-14,000 ₽ / €100-255 / $100-315**

### Periodic Costs

- Fructosamine (every 2-3 months): $15-50 / €15-40
- Follow-up vet visit (every 2-3 months): $40-120 / €40-100
- Urinalysis (every 3-6 months): $10-40 / €10-30

### How to Save (Without Compromising Health)

**Insulin:**
- One vial of Lantus (10 mL) lasts 2-6 months at low doses
- Store properly: refrigerated, never freeze
- An opened vial: **strictly follow the manufacturer label — 28 days** (Sanofi SPC for Lantus). Some vets use opened vials longer if refrigerated, but this is off-label practice without evidence: beyond 28 days neither sterility nor potency is guaranteed. If budget is tight — discuss with your vet, don't extend on your own
- **In Russia:** RinGlar (Geropharm) is a Lantus biosimilar — same active ingredient, ~1,500-2,500 RUB vs 3,000-4,500 RUB for Lantus. Ask your vet
- **In the USA:** NPH insulin (e.g. Walmart ReliOn, ~$25/vial) is the cheapest option, but NPH is **not first-choice for cats** — shorter duration of action and a lower remission rate (~25% vs 50-90% on glargine). Discuss with your vet before switching purely to save money

**Test strips:**
- **In Russia:** AlphaTRAK 2 is unavailable. Use **Contour Plus** (good quality) or **Satellite Express** (cheapest strips ~400-600 RUB/50 pcs, but less accurate). Note: human glucometers read 10-15% lower for cats
- **In the USA/EU:** AlphaTRAK 2 is the gold standard for pets
- Buy strips in bulk (100 pcs = cheaper per strip)
- Don't test every day if the cat is stable (2-3 times per week is enough)
- FreeStyle Libre 2 sensor (14-day wear) may be more economical than daily strips when building glucose curves

**Food:**
- **In Russia:** Royal Canin Diabetic is the most reliably available (local Dmitrov factory). Karmy Veterinary Diabetic is a budget Russian alternative
- **In the USA:** Fancy Feast Classic — affordable low-carb option
- Check the ingredients: look for pate/classic varieties with no gravy
- Home cooking? Only after consulting a veterinary nutritionist

**Vet visits:**
- Ask about loyalty programs
- Some clinics offer discounted package deals
- Telemedicine is cheaper for follow-up checks

**Communities:**
- Look for diabetic pet owner groups on social media — mutual support, tips, and group purchases for supplies

### Tracking Expenses

Use the "Expenses" section in DiaPet! It's built exactly for this — tracking costs by category and seeing the big picture.

### Emergency Costs

Keep a safety fund for:
- Ketoacidosis (hospital treatment): $500-3000 / €300-2000
- Workup for sudden deterioration: $150-600 / €100-500

> **The bottom line:** diabetes is a manageable disease. With stable control, costs are predictable and don't increase over time.`,
  },
  category: 'lifestyle',
  readingTimeMinutes: 7,
  order: 15,
  species: 'cat',
  relatedArticleIds: ['first-days', 'insulin_types', 'diet', 'flexible-monitoring'],
  references: [
    {
      ru: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
      en: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
    },
  ],
  tags: [
    { ru: 'бюджет', en: 'budget' },
    { ru: 'расходы', en: 'costs' },
    { ru: 'экономия', en: 'savings' },
    { ru: 'планирование', en: 'planning' },
  ],
};
