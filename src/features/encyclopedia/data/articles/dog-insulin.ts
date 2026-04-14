import { Article } from '../../types';

export const dogInsulin: Article = {
  id: 'dog-insulin',
  titleKey: {
    ru: 'Инсулины для собак: Канинсулин, NPH и другие',
    en: 'Insulin for Dogs: Caninsulin, NPH, and Others',
  },
  summaryKey: {
    ru: 'Какой инсулин используют для собак, как подбирается доза, и что важно знать о хранении и технике инъекций.',
    en: 'Which insulins are used for dogs, how the dose is determined, and what you need to know about storage and injection technique.',
  },
  contentKey: {
    ru: `# Инсулины для собак

## Основные типы

### Канинсулин (Caninsulin / Vetsulin)
- **Тип:** свиной Ленте-инсулин (смесь аморфного + кристаллического)
- **Концентрация:** U-40 (требуются специальные шприцы!)
- **Начало действия:** 1–4 часа
- **Пик:** 4–8 часов
- **Продолжительность:** 8–24 часов
- **Это суспензия** — перед каждой инъекцией флакон нужно аккуратно покатать между ладонями 10–15 раз. Не встряхивать!

### NPH (Humulin N / Протафан)
- **Тип:** человеческий изофан-инсулин
- **Концентрация:** U-100 (стандартные инсулиновые шприцы)
- **Начало действия:** 0.5–2 часа
- **Пик:** 2–8 часов
- **Продолжительность:** 6–16 часов
- Тоже суспензия — перемешивать перед использованием

### Гларгин (Lantus) и Детемир (Levemir)
- Длительного действия, используются off-label
- Могут быть назначены ветеринаром при плохом ответе на Канинсулин/NPH
- Не суспензии — не нужно перемешивать

## Как подбирается доза?

- **Стартовая доза:** 0.25–0.5 ЕД/кг массы тела, 2 раза в день
- Доза подбирается ветеринаром на основе **кривой глюкозы** (замеры каждые 2 часа в течение 12 часов)
- **Никогда не меняй дозу самостоятельно!**

## Важно: U-40 vs U-100

- Канинсулин — **U-40** (40 ЕД/мл)
- NPH — **U-100** (100 ЕД/мл)
- Использование неправильного шприца = **неправильная доза** = опасно!
- U-40 шприцы обычно с красным колпачком, U-100 — с оранжевым

## Хранение

- Закрытый флакон: холодильник (2–8°C)
- Открытый флакон: комнатная температура или холодильник (зависит от типа)
- Срок после вскрытия зависит от препарата:
  - **Канинсулин / Vetsulin: 28 дней** (при комнатной температуре)
  - **NPH (Humulin N / Протафан): 28 дней**
  - **Lantus (гларгин): 28 дней**
  - **Levemir (детемир): 42 дня** (уникально — дольше остальных)
- Никогда не замораживать
- Не использовать, если изменился цвет или появились хлопья

## Техника инъекции

1. Покорми собаку
2. Подготовь шприц (для суспензий — покатай флакон)
3. Набери нужную дозу
4. Оттяни складку кожи на холке, между лопатками или на боку
5. Введи иглу **под углом 45°** (для мелких и худых собак) или **90°** (для крупных пород и собак с хорошо выраженной подкожной клетчаткой). Главное — игла должна попасть в подкожную клетчатку, а не в мышцу
6. Медленно введи инсулин
7. Чередуй стороны (сегодня левый бок, завтра правый)`,
    en: `# Insulin for Dogs

## Main types

### Caninsulin (Vetsulin)
- **Type:** porcine Lente insulin (mix of amorphous + crystalline)
- **Concentration:** U-40 (requires special syringes!)
- **Onset:** 1–4 hours
- **Peak:** 4–8 hours
- **Duration:** 8–24 hours
- **It's a suspension** — before each injection, gently roll the vial between your palms 10–15 times. Don't shake!

### NPH (Humulin N / Protaphane)
- **Type:** human isophane insulin
- **Concentration:** U-100 (standard insulin syringes)
- **Onset:** 0.5–2 hours
- **Peak:** 2–8 hours
- **Duration:** 6–16 hours
- Also a suspension — mix before use

### Glargine (Lantus) and Detemir (Levemir)
- Long-acting, used off-label
- May be prescribed by your vet if response to Caninsulin/NPH is poor
- Not suspensions — no mixing needed

## How is the dose determined?

- **Starting dose:** 0.25–0.5 IU/kg body weight, twice daily
- The dose is adjusted by the vet based on a **glucose curve** (readings every 2 hours over 12 hours)
- **Never adjust the dose yourself!**

## Important: U-40 vs U-100

- Caninsulin is **U-40** (40 IU/mL)
- NPH is **U-100** (100 IU/mL)
- Using the wrong syringe = **wrong dose** = dangerous!
- U-40 syringes usually have a red cap, U-100 have orange

## Storage

- Unopened vial: refrigerator (2–8°C)
- Opened vial: room temperature or fridge (depends on type)
- Shelf life after opening depends on the product:
  - **Caninsulin / Vetsulin: 28 days** (at room temperature)
  - **NPH (Humulin N / Protaphane): 28 days**
  - **Lantus (glargine): 28 days**
  - **Levemir (detemir): 42 days** (unique — longer than the others)
- Never freeze
- Don't use if color has changed or flakes appear

## Injection technique

1. Feed your dog
2. Prepare the syringe (for suspensions — roll the vial)
3. Draw up the correct dose
4. Lift a fold of skin at the scruff, between the shoulder blades, or on the flank
5. Insert the needle at **45°** (for small, thin dogs) or **90°** (for large breeds and dogs with well-developed subcutaneous tissue). The key is that the needle must reach the subcutaneous tissue, not muscle
6. Slowly inject the insulin
7. Alternate sides (left flank today, right tomorrow)`,
  },
  category: 'treatment',
  species: 'dog',
  readingTimeMinutes: 7,
  order: 2,
  relatedArticleIds: ['dog-diabetes-basics', 'dog-diet', 'dog-cataracts'],
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
    { ru: 'инсулин', en: 'insulin' },
    { ru: 'канинсулин', en: 'caninsulin' },
    { ru: 'NPH', en: 'NPH' },
    { ru: 'лечение', en: 'treatment' },
  ],
};
