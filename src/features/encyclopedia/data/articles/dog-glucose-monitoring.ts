import { Article } from '../../types';

export const dogGlucoseMonitoring: Article = {
  id: 'dog-glucose-monitoring',
  titleKey: {
    ru: 'Мониторинг глюкозы у собаки дома',
    en: 'Home Glucose Monitoring for Dogs',
  },
  summaryKey: {
    ru: 'Домашние замеры сахара у собаки, кривая глюкозы и надир. У собак, в отличие от кошек, стресс почти не искажает результат — но дом всё равно удобнее.',
    en: "Home blood sugar testing for dogs, the glucose curve, and the nadir. Unlike cats, dogs' results are barely distorted by stress — but home is still more convenient.",
  },
  contentKey: {
    ru: `# Мониторинг глюкозы у собаки дома

## Зачем измерять дома

Домашние замеры дают ветеринару точную картину того, как инсулин работает в реальной жизни собаки: на её обычном корме, прогулках и режиме.

**Важное отличие от кошек:** у собак стрессовая гипергликемия выражена слабо. Кошка от поездки в клинику может «подскочить» на 10–15 ммоль/л, а собака — почти нет. Поэтому клинические замеры у собак надёжнее, чем у кошек. Но дом всё равно удобнее: не нужно возить собаку, и можно сделать полную кривую.

## Какой глюкометр выбрать

### AlphaTRAK 2/3 — создан для животных
- Откалиброван отдельно для собак и кошек — **выберите режим «собака»** в настройках прибора
- Нужна крошечная капля крови
- Самый точный вариант для собак

### Человеческий глюкометр (Contour Plus, OneTouch, Accu-Chek)
- Доступнее и дешевле
- У собак занижает результат примерно на **5–10%** (у собак расхождение меньше, чем у кошек)
- Вполне подходит для отслеживания тренда

### FreeStyle Libre — непрерывный мониторинг
- Человеческий сенсор, который крепят на кожу (обычно на шею или бок)
- Измеряет каждые несколько минут в течение 14 дней — удобно для собак, которым тяжело даётся прокол
- Есть задержка и погрешность; устанавливать и трактовать — с ветеринаром

## Где брать кровь

- **Край уха** (краевая вена) — самое частое место
- **Мозолистый край губы** или **подушечка лапы** — альтернатива
- Согрейте место пальцами, быстрый прокол ланцетом, не сжимайте — ждите, пока капля появится сама
- После — прижмите ватку на 20–30 секунд

С практикой замер занимает минуту. Многие собаки спокойно переносят прокол за лакомство.

## Кривая глюкозы

Серия замеров каждые 2 часа в течение 12-часового цикла показывает, как инсулин работает за день:

**Полный протокол:** 0 ч (перед уколом и едой), затем 2, 4, 6, 8, 10, 12 ч.

## Надир — главное число

Надир — самая низкая точка глюкозы за цикл. По нему ветеринар решает, верна ли доза.

**Целевой надир у собак: 5–9 ммоль/л (90–160 мг/дл).** Он не должен опускаться ниже 4–5 ммоль/л — это риск гипогликемии.

| Надир | Что значит | Что делать |
|---|---|---|
| Ниже 4 ммоль/л | Гипогликемия — опасно | Экстренно, снизить дозу, к врачу |
| 4–5 | Пограничная зона | Наблюдать, обсудить с врачом |
| 5–9 | Отличный контроль | Продолжать |
| 9–14 | Выше цели | Обсудить повышение дозы |
| Выше 14 | Контроль недостаточный | Консультация ветеринара |

## Эффект Сомоджи

Если доза слишком велика, сахар падает слишком низко, организм выбрасывает гормоны стресса — и глюкоза резко взлетает. Выглядит как «нужно больше инсулина», а на самом деле дозу надо **снизить**. Поэтому без полной кривой менять дозу опасно.

## Как часто

- **Подбор дозы:** кривая каждые 1–2 недели
- **Стабильное состояние:** кривая раз в 1–3 месяца + точечные утренние замеры
- **Собака нездорова:** измерьте сразу

> Дозу меняет только ветеринар. Ваша задача — собирать данные. Записывайте замеры в DiaPet и показывайте врачу.`,
    en: `# Home Glucose Monitoring for Dogs

## Why measure at home

Home readings give your vet an accurate picture of how insulin works in your dog's real life: on their usual food, walks, and routine.

**Key difference from cats:** stress hyperglycemia is minimal in dogs. A cat can spike 10–15 mmol/L from a car ride to the clinic; a dog barely does. So clinic readings are more reliable in dogs than in cats. Still, home is more convenient — no travel, and you can do a full curve.

## Which glucometer to choose

### AlphaTRAK 2/3 — built for pets
- Calibrated separately for dogs and cats — **select the "dog" setting** on the device
- Needs a tiny drop of blood
- The most accurate option for dogs

### Human glucometer (Contour Plus, OneTouch, Accu-Chek)
- More available and cheaper
- Reads about **5–10% low** in dogs (the gap is smaller than in cats)
- Perfectly fine for tracking trends

### FreeStyle Libre — continuous monitoring
- A human sensor attached to the skin (usually neck or flank)
- Measures every few minutes for 14 days — handy for dogs who dislike pricks
- Has lag and some error; set up and interpret with your vet

## Where to collect blood

- **Ear margin** (marginal vein) — the most common spot
- **Callused lip margin** or **paw pad** — alternatives
- Warm the spot with your fingers, quick lancet prick, don't squeeze — let the drop form
- Afterward, press a cotton pad for 20–30 seconds

With practice a reading takes a minute. Many dogs tolerate the prick calmly for a treat.

## The glucose curve

A series of readings every 2 hours over a 12-hour cycle shows how insulin works across the day:

**Full protocol:** 0 h (before injection and food), then 2, 4, 6, 8, 10, 12 h.

## Nadir — the key number

The nadir is the lowest glucose point in the cycle. Your vet uses it to decide if the dose is right.

**Target nadir in dogs: 5–9 mmol/L (90–160 mg/dL).** It should not drop below 4–5 mmol/L — that's a hypoglycemia risk.

| Nadir | Meaning | What to do |
|---|---|---|
| Below 4 mmol/L | Hypoglycemia — dangerous | Emergency, reduce dose, see vet |
| 4–5 | Borderline zone | Watch, discuss with vet |
| 5–9 | Excellent control | Continue |
| 9–14 | Above target | Discuss dose increase |
| Above 14 | Insufficient control | Vet consultation |

## The Somogyi effect

If the dose is too high, sugar drops too low, the body releases stress hormones — and glucose rebounds sharply. It looks like "needs more insulin," but the dose actually needs to be **reduced**. That's why changing the dose without a full curve is risky.

## How often

- **Dose adjustment:** curve every 1–2 weeks
- **Stable:** curve every 1–3 months + spot morning checks
- **Dog is unwell:** measure right away

> Only the vet changes the dose. Your job is to collect the data. Log readings in DiaPet and show your vet.`,
  },
  category: 'monitoring',
  species: 'dog',
  readingTimeMinutes: 7,
  order: 1,
  relatedArticleIds: ['dog-fructosamine', 'dog-glucose-curves', 'dog-insulin'],
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
    { ru: 'мониторинг', en: 'monitoring' },
    { ru: 'глюкоза', en: 'glucose' },
    { ru: 'кривая глюкозы', en: 'glucose curve' },
    { ru: 'надир', en: 'nadir' },
  ],
};
