import { Article } from '../../types';

export const stressHyperglycemia: Article = {
  id: 'stress-hyperglycemia',
  titleKey: {
    ru: 'Стрессовая гипергликемия',
    en: 'Stress Hyperglycemia',
  },
  summaryKey: {
    ru: 'Почему сахар зашкаливает в ветклинике, но нормальный дома — и как отличить стресс от плохого контроля.',
    en: 'Why blood sugar skyrockets at the vet but is normal at home — and how to tell stress from poor control.',
  },
  contentKey: {
    ru: `## Стрессовая гипергликемия: когда сахар врёт

Вы привезли кошку в ветклинику, и глюкоза показала 25 ммоль/л. Паника? Не обязательно. У кошек стресс вызывает **реальный** подъём сахара в крови — и это не имеет отношения к контролю диабета.

### Почему это происходит

Стресс запускает выброс кортизола и адреналина. Эти гормоны:
- Стимулируют печень выбрасывать глюкозу в кровь
- Снижают чувствительность клеток к инсулину
- У кошек этот эффект особенно выражен — сахар может вырасти на 10-15 ммоль/л за минуты

### Ветклиника vs дом: как отличить

| Признак | Стрессовая гипергликемия | Плохой контроль |
|---------|-------------------------|-----------------|
| Где замер | Ветклиника | Дома, спокойная обстановка |
| Фруктозамин | Нормальный (250-350 мкмоль/л) | Повышенный (>400 мкмоль/л) |
| Домашние замеры | Стабильные, в пределах нормы | Тоже высокие |
| Поведение дома | Нормальное | Жажда, частое мочеиспускание |

### Что делать

**Если подозреваете стрессовую гипергликемию:**
- Никогда не корректируйте дозу инсулина по одному замеру в ветклинике
- Попросите ветеринара проверить фруктозамин — он отражает средний сахар за 2-3 недели
- Принесите домашний дневник замеров — это гораздо информативнее
- Если возможно, дайте кошке 20-30 минут в тихой комнате перед замером

**Как снизить стресс при визите:**
- Феромоны (Feliway) в переноске за 30 минут до поездки
- Накройте переноску полотенцем
- Избегайте шумных залов ожидания — попросите подождать в машине
- Запишитесь на утро, когда клиника спокойнее

### Типичные стрессоры и их влияние

| Стрессор | Ожидаемый подъём глюкозы | Длительность |
|----------|------------------------|-------------|
| Визит в клинику | +3-10 ммоль/л | 1-3 ч |
| Переезд / ремонт | +2-5 ммоль/л | 2-7 дней |
| Новое животное в доме | +2-6 ммоль/л | 1-4 нед |
| Громкие звуки (стройка, гости) | +1-4 ммоль/л | Часы |

**Тактика:** не корректируйте дозу при разовом стрессовом подъёме — ждите 2-3 дня устойчивого изменения. При переезде: усиленный мониторинг в первые 2 недели.

### Когда это НЕ стресс

Если домашние замеры тоже высокие (>15 ммоль/л регулярно), это не стресс. Поговорите с ветеринаром о корректировке дозы.

> **Ключевой вывод:** один высокий замер в ветклинике — не повод для паники. Доверяйте домашним замерам и фруктозамину.`,
    en: `## Stress Hyperglycemia: When Blood Sugar Lies

You brought your cat to the vet and glucose read 25 mmol/L. Panic? Not necessarily. In cats, stress causes a **real** rise in blood sugar — and it has nothing to do with diabetes control.

### Why This Happens

Stress triggers the release of cortisol and adrenaline. These hormones:
- Stimulate the liver to dump glucose into the blood
- Reduce cell sensitivity to insulin
- In cats, this effect is particularly strong — sugar can rise 10-15 mmol/L within minutes

### Vet Clinic vs Home: How to Tell the Difference

| Sign | Stress Hyperglycemia | Poor Control |
|------|---------------------|--------------|
| Where measured | Vet clinic | At home, calm environment |
| Fructosamine | Normal (250-350 µmol/L) | Elevated (>400 µmol/L) |
| Home readings | Stable, within range | Also high |
| Behavior at home | Normal | Excessive thirst, frequent urination |

### What to Do

**If you suspect stress hyperglycemia:**
- Never adjust insulin dose based on a single vet clinic reading
- Ask your vet to check fructosamine — it reflects average sugar over 2-3 weeks
- Bring your home glucose diary — it's far more informative
- If possible, let the cat settle for 20-30 minutes in a quiet room before testing

**How to reduce stress during visits:**
- Pheromones (Feliway) in the carrier 30 minutes before the trip
- Cover the carrier with a towel
- Avoid noisy waiting rooms — ask to wait in the car
- Book morning appointments when the clinic is quieter

### Common Stressors and Their Impact

| Stressor | Expected glucose rise | Duration |
|----------|----------------------|----------|
| Vet visit | +3-10 mmol/L | 1-3 h |
| Moving / renovation | +2-5 mmol/L | 2-7 days |
| New pet in the house | +2-6 mmol/L | 1-4 weeks |
| Loud noises (construction, guests) | +1-4 mmol/L | Hours |

**Strategy:** don't adjust the dose after a one-time stress spike — wait 2-3 days for a sustained change. After moving: increase monitoring for the first 2 weeks.

### When It's NOT Stress

If home readings are also consistently high (>15 mmol/L regularly), it's not stress. Talk to your vet about dose adjustment.

> **Key takeaway:** a single high reading at the vet is not a reason to panic. Trust home readings and fructosamine.`,
  },
  category: 'medical',
  readingTimeMinutes: 5,
  order: 10,
  relatedArticleIds: ['glucose_monitoring', 'flexible-monitoring', 'fructosamine'],
  references: [
    {
      ru: 'Rand J. — Feline Diabetes Mellitus, Veterinary Clinics, 2012',
      en: 'Rand J. — Feline Diabetes Mellitus, Veterinary Clinics, 2012',
    },
    {
      ru: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
      en: 'ISFM Guidelines on Diabetes Mellitus in Cats, 2023',
    },
    {
      ru: 'Sparkes AH et al. — ISFM Consensus on Feline Diabetes, JFMS 2015',
      en: 'Sparkes AH et al. — ISFM Consensus on Feline Diabetes, JFMS 2015',
    },
  ],
  tags: [
    { ru: 'стресс', en: 'stress' },
    { ru: 'гипергликемия', en: 'hyperglycemia' },
    { ru: 'ветклиника', en: 'vet clinic' },
    { ru: 'фруктозамин', en: 'fructosamine' },
  ],
};
