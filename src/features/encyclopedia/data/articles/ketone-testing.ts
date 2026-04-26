import { Article } from '../../types';

export const ketoneTesting: Article = {
  id: 'ketone-testing',
  titleKey: {
    ru: 'Домашнее тестирование кетонов',
    en: 'Home Ketone Testing',
  },
  summaryKey: {
    ru: 'Когда и как проверять кетоны дома, какие полоски использовать и как интерпретировать результаты.',
    en: 'When and how to check ketones at home, which strips to use, and how to interpret results.',
  },
  contentKey: {
    ru: `## Домашнее тестирование кетонов

Кетоны — это сигнал тревоги. Когда организм не может использовать глюкозу (нет инсулина), он начинает сжигать жир. Побочный продукт — кетоны. Много кетонов = кетоацидоз (ДКА) = экстренная ситуация.

### Когда проверять кетоны

**Обязательно:**
- Глюкоза выше 20 ммоль/л (360 мг/дл) дважды подряд
- Кошка не ест более 24 часов
- **Рвота + вялость при любом повышении глюкозы выше нормы — проверяйте немедленно** (по ISFM 2023, не ждите достижения 20 ммоль/л)
- Запах ацетона изо рта
- Только что диагностирован диабет (до начала инсулинотерапии)

**Не обязательно:**
- Стабильная кошка с нормальным сахаром
- Однократное повышение глюкозы при нормальном поведении

### Способы тестирования

**1. Тест-полоски для мочи (Ketostix и аналоги)**
- Стоимость: ~300-500 руб за 50 полосок
- Что показывают: ацетоацетат в моче
- Точность: приблизительная, результат отстаёт от реального уровня на 2-4 часа
- Как использовать: окуните в мочу или приложите к мокрому наполнителю

**Шкала:**
- Отрицательно / следы — норма
- Малый (+) — повторите через 4 часа, проверьте глюкозу
- Умеренный (++) — звоните ветеринару
- Большой (+++) — **экстренная ситуация**, в клинику немедленно

**2. Анализатор кетонов крови (FreeStyle Optium)**
- Стоимость: ~2000-3000 руб прибор + ~100-150 руб за полоску
- Что показывает: бета-гидроксибутират в крови
- Точность: высокая, результат в реальном времени
- Как использовать: капля крови из уха (как для глюкометра)

**Шкала:**
- < 0.5 ммоль/л — норма
- 0.5-1.5 ммоль/л — лёгкое повышение, мониторьте
- 1.5-3.0 ммоль/л — звоните ветеринару
- > 3.0 ммоль/л — **экстренная ситуация**

### Практические советы

- Полоски для мочи дешевле и проще, но менее точны — для скрининга достаточно
- Анализатор крови точнее, но требует дополнительный прокол
- Храните полоски в сухом месте, не используйте после истечения срока
- Заведите 1-2 упаковки тест-полосок «на всякий случай»

### Что делать при положительном результате

1. Измерьте глюкозу
2. Если глюкоза > 15 ммоль/л + кетоны умеренные/высокие — **в клинику**
3. Если глюкоза нормальная + следы кетонов — повторите через 4 часа
4. Никогда не пытайтесь лечить кетоацидоз дома

> **Запомните:** тест-полоски для мочи — это ваш домашний детектор дыма. Дёшево, просто, и однажды может спасти жизнь.`,
    en: `## Home Ketone Testing

Ketones are an alarm signal. When the body can't use glucose (no insulin), it starts burning fat. The byproduct is ketones. Too many ketones = ketoacidosis (DKA) = emergency.

### When to Check Ketones

**Always check if:**
- Glucose above 20 mmol/L (360 mg/dL) twice in a row
- Cat hasn't eaten for more than 24 hours
- **Vomiting + lethargy at any above-normal glucose — check immediately** (per ISFM 2023, do not wait for 20 mmol/L)
- Acetone smell from breath
- Diabetes just diagnosed (before starting insulin)

**Not necessary if:**
- Stable cat with normal blood sugar
- Single glucose spike with normal behavior

### Testing Methods

**1. Urine test strips (Ketostix and similar)**
- Cost: ~$5-10 for 50 strips
- What they measure: acetoacetate in urine
- Accuracy: approximate, results lag real levels by 2-4 hours
- How to use: dip in urine or press against wet litter

**Scale:**
- Negative / trace — normal
- Small (+) — recheck in 4 hours, check glucose
- Moderate (++) — call the vet
- Large (+++) — **emergency**, go to the clinic immediately

**2. Blood ketone meter (FreeStyle Optium)**
- Cost: ~$25-40 for the meter + ~$2-3 per strip
- What it measures: beta-hydroxybutyrate in blood
- Accuracy: high, real-time results
- How to use: drop of blood from the ear (same as glucometer)

**Scale:**
- < 0.5 mmol/L — normal
- 0.5-1.5 mmol/L — mild elevation, monitor
- 1.5-3.0 mmol/L — call the vet
- > 3.0 mmol/L — **emergency**

### Practical Tips

- Urine strips are cheaper and simpler, but less accurate — fine for screening
- Blood meter is more accurate but requires an extra prick
- Store strips in a dry place, don't use after expiration
- Keep 1-2 packs of urine test strips "just in case"

### What to Do with a Positive Result

1. Check glucose
2. If glucose > 15 mmol/L + moderate/high ketones — **go to the clinic**
3. If glucose is normal + trace ketones — recheck in 4 hours
4. Never try to treat ketoacidosis at home

> **Remember:** urine test strips are your home smoke detector. Cheap, simple, and could save a life.`,
  },
  category: 'medical',
  readingTimeMinutes: 6,
  order: 12,
  relatedArticleIds: ['dka', 'glucose_monitoring', 'first-days'],
  references: [
    {
      ru: "O'Brien MA — Diabetic Ketoacidosis in Cats, Veterinary Clinics 2010",
      en: "O'Brien MA — Diabetic Ketoacidosis in Cats, Veterinary Clinics 2010",
    },
    {
      ru: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
      en: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
    },
  ],
  tags: [
    { ru: 'кетоны', en: 'ketones' },
    { ru: 'ДКА', en: 'DKA' },
    { ru: 'тест-полоски', en: 'test strips' },
    { ru: 'мониторинг', en: 'monitoring' },
  ],
};
