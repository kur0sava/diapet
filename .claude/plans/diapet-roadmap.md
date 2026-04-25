# DiaPet — Roadmap v3.0: Мульти-animal

> Обновлён: 2026-04-25
> Основной план разработки

---

## ТЕКУЩИЙ СТАТУС

**Ветка**: master | **Версия в сторах**: 2.4.3 (versionCode 15)
**Версия в коде**: 2.5.0 (versionCode 17) — AAB+APK собраны, ждут upload в консоли
**Google Play**: v2.4.3 опубликован
**RuStore**: v2.4.3 опубликован
**GitHub**: https://github.com/kur0sava/diapet — актуален (HEAD `ebccfd7`)

### EAS-артефакты v2.5.0 (versionCode 17, коммит `f718f96`)
- AAB (Google Play): https://expo.dev/artifacts/eas/6KbJh75E8LB7sy1QMRaLR5.aab
- APK (RuStore): https://expo.dev/artifacts/eas/sjzhHt8BSDzqk5y2on4KxC.apk
- ⚠️ versionCode 16 артефакты (`a4d1fa75` AAB / `edabf442` APK) НЕ выгружать — у них сломана v9 миграция (брикает апгрейд с 2.4.3).

### v2.5.0 — что вошло (сверх v2.4.3)
- ЭТАП 15 полностью (мульти-animal, собаки)
- H1–H7, H9 business-audit
- Codex review batch 1 (theme reactivity, paywall gating, food DB split, Hill's w/d reclass, FeedGuide species-aware)
- Codex review batch 2 critical:
  - Bug #1 atomic onboarding (pet-rollback + orphan cleanup в App.tsx init)
  - Bug #3 UTC date shift (`todayLocal()`/`toDateOnly()` + замена `toISOString().slice(0,10)` в smartAlerts/useMissedInjection/AiAssistantScreen/PetInfoScreen)
  - Bug #5 миграция v9 (PRAGMA + ALTER TABLE guard перед UPDATE pets.species — иначе апгрейды с 2.4.3 брикало)
  - Bug #6 `ACTIVE_SPECIES` MMKV cleared on reset + константа в StorageKeys

### v2.5.1 — на master, не в стора́х
- Регрессионный тест миграций (`13bc502`) — ловит UPDATE по non-baseline колонке без guard
- Bug #3 добивка: `expenseRepository.create` default-дата → `todayLocal()` (`70e6ed6`)
- Bug #7 per-pet vet contact (`fed6ee8`) — `vetNameKey(petId)`/`vetPhoneKey(petId)` + миграция legacy глобалов в App.tsx + cloudBackup prefix-scan
- Bug #2 RU price hints показываются только на RU-region screen (`ebccfd7`)

### v2.5.1 — что осталось
- Bug #4 курсорная пагинация — **уже на месте** (`glucoseRepository.findByPetId/findByPetIdFiltered` курсор-пагинированы с прошлых релизов; `findAllByPetId` остался только для PDF/анализатора/прогноза, где нужна вся история). Codex memo стейл.
- H8 (hint packs 60/90/180 дней)
- H10 (Google Auth в онбординге)

---

## ЭТАП 15: РАСШИРЕНИЕ НА СОБАК (multi-animal)

Цель: DiaPet поддерживает кошек и собак с раздельными клиническими нормами, цветовой схемой, контентом и UI.

### Медицинская база (собрана, верифицирована медицинским аудитором)

| Параметр | Кошка (текущее) | Собака (новое) |
|----------|----------------|----------------|
| Тип диабета | Тип 2 (обратимый, 50-90% ремиссия) | Тип 1 (необратимый, ремиссия крайне редка) |
| Норма глюкозы натощак | 3.9–8.3 ммоль/л | 3.3–6.1 ммоль/л |
| Целевой диапазон терапии | 4.0–9.0 ммоль/л | 4.4–8.0 ммоль/л |
| Целевой надир | 4.0–8.0 ммоль/л | 4.4–8.0 ммоль/л |
| Гипогликемия (тревога) | <2.8 ммоль/л | <3.3 ммоль/л |
| Гипогликемия (тяжёлая) | <2.2 ммоль/л | <2.2 ммоль/л |
| Гипергликемия (усилить контроль) | >14.0 ммоль/л | >16.7 ммоль/л |
| Инсулин 1-й линии | Гларгин (Лантус), PZI (ProZinc) | Caninsulin (лент, U-40), NPH |
| Дозировка | 1–2 МЕ на кошку (абсолютная) | 0.25–0.5 МЕ/кг (по весу!) |
| Макс. стартовая доза | ~10 МЕ | ~20 МЕ |
| Макс. вес | 15 кг | 80 кг |
| Макс. возраст | 30 лет | 20 лет |
| Диета | Низкие углеводы (<10% СВ), высокий белок | Высокая клетчатка (>10% СВ), умеренные углеводы |
| Катаракта | Редко (<5%) | 75-80% за 16 мес |
| Нейропатия (планиградия) | Часто (30-50%) | Редко |
| Ремиссия | 50-90% при ранней терапии | Только вторичные формы (прогестерон, стероиды) |
| Стрессовая гипергликемия | До 15-17 ммоль/л (имитирует диабет) | До 8 ммоль/л (незначительная) |
| Фруктозамин норма | 170–340 мкмоль/л | 340–450 мкмоль/л |

### Источники: AAHA 2018, ECVIM-CA 2022, ISFM 2015, Merck Vet Manual 2022, Feldman & Nelson 2015

---

### ФАЗА 1: Фундамент — speciesConfig + тема + миграция

**Цель:** Создать инфраструктуру, от которой зависит всё остальное.

#### 1.1 Создать `src/shared/config/speciesConfig.ts`
- [ ] Интерфейс `SpeciesConfig` со всеми видозависимыми параметрами
- [ ] Конфиг для `cat` (идентичен текущим захардкоженным значениям — поведение НЕ меняется)
- [ ] Конфиг для `dog` (из медицинской базы выше)
- [ ] Функция `getSpeciesConfig(species: PetSpecies): SpeciesConfig`
- [ ] Хук `useSpeciesConfig()` — берёт species из activePet
- [ ] **Проверка:** tsc, тесты, убедиться что кошачий сценарий идентичен до рефакторинга

Структура конфига:
```typescript
interface SpeciesConfig {
  species: PetSpecies;
  label: { ru: string; en: string };           // "Кошка" / "Собака"
  
  glucose: {
    normalLow: number;                          // кошки: 3.9, собаки: 3.3
    normalHigh: number;                         // кошки: 8.3, собаки: 6.1
    targetLow: number;                          // кошки: 4.0, собаки: 4.4
    targetHigh: number;                         // кошки: 9.0, собаки: 8.0
    rangeHigh: number;                          // кошки: 12.0, собаки: 10.0
    emergencyLow: number;                       // кошки: 2.8, собаки: 3.3
    emergencyHigh: number;                      // кошки: 30, собаки: 30
    severeLow: number;                          // кошки: 2.2, собаки: 2.2
    highControlThreshold: number;               // кошки: 14.0, собаки: 16.7
    ranges: GlucoseRangeEntry[];                // полная шкала уровней
  };
  
  insulin: {
    dosePerKg: boolean;                         // кошки: false, собаки: true
    typicalDoseMin: number;                     // кошки: 1 МЕ, собаки: 0.25 МЕ/кг
    typicalDoseMax: number;                     // кошки: 4 МЕ, собаки: 0.5 МЕ/кг
    warningDose: number;                        // кошки: 4, собаки: рассчитывается
    dangerDose: number;                         // кошки: 6, собаки: рассчитывается
    absoluteMaxDose: number;                    // кошки: 10, собаки: 20
    commonTypes: InsulinTypeInfo[];             // список инсулинов с фармакокинетикой
  };
  
  analyzer: {
    somogyiNadirThreshold: number;              // кошки: 4, собаки: 3.3
    somogyiReboundThreshold: number;            // кошки: 18, собаки: 16
    postMealSpikeThreshold: number;             // кошки: 15, собаки: 14
    remissionRelevant: boolean;                 // кошки: true, собаки: false
    remissionMorningThreshold: number;          // кошки: 7, собаки: N/A
  };
  
  validation: {
    maxWeightKg: number;                        // кошки: 15, собаки: 80
    maxAgeYears: number;                        // кошки: 30, собаки: 20
  };
  
  nutrition: {
    carbsDMGood: number;                        // кошки: 10, собаки: 30
    carbsDMAcceptable: number;                  // кошки: 15, собаки: 40
    proteinDMMin: number;                       // кошки: 40, собаки: 25
    fatDMMax: number;                           // кошки: 40, собаки: 50
    fiberImportant: boolean;                    // кошки: false, собаки: true
    fiberDMMin?: number;                        // собаки: 10
  };
  
  symptoms: {
    available: SymptomType[];                   // видоспецифичные симптомы
  };
  
  theme: {
    primary: string;                            // кошки: '#4F8EF7', собаки: TBD
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    secondaryLight: string;
    gradientHeader: [string, string];
    gradientHeaderDark: [string, string];
    gradientHeaderRich: [string, string, string];
    gradientHeaderRichDark: [string, string, string];
  };
}
```

#### 1.2 Цветовая схема для собак (УТВЕРЖДЕНА)
- [ ] Реализовать палитру для dog:
  - Кошки: синяя (#4F8EF7) + фиолетовая (#7C5CBF)
  - Собаки: тёплая оранжево-янтарная:
    - primary: `#E67E22` (янтарный)
    - primaryDark: `#C0652A`
    - primaryLight: `#FFF3E0`
    - secondary: `#8B6914` (тёмное золото)
    - secondaryLight: `#FFF8E1`
    - gradientHeader: `['#E67E22', '#D35400']`
    - gradientHeaderDark: `['#2E1A0E', '#3D2814']`
    - gradientHeaderRich: `['#E67E22', '#D35400', '#8B6914']`
    - gradientHeaderRichDark: `['#2E1A0E', '#3D2814', '#4A3510']`
- [ ] Расширить `ThemeContext.tsx` — `buildTheme(isDark, species)` вместо `buildTheme(isDark)`
- [ ] Градиенты хедера зависят от species активного питомца
- [ ] **Проверка:** переключение между питомцами мгновенно меняет цветовую схему

#### 1.3 Заголовок (шапка)
- [ ] В хедере отображать "Cats" или "Dogs" в зависимости от species активного питомца
- [ ] i18n ключи: `header.cats`, `header.dogs`
- [ ] **Проверка:** переключение питомца → заголовок и цвета меняются

#### 1.4 Миграция БД (version 9)
- [ ] Safety-net: `UPDATE pets SET species = 'cat' WHERE species IS NULL OR species = ''`
- [ ] **Проверка:** существующие юзеры не затронуты, все питомцы явно = cat

#### Контрольная точка Фазы 1:
- [ ] `npx tsc --noEmit` — 0 ошибок
- [ ] `npm test` — все тесты проходят
- [ ] Кошачий сценарий работает **идентично** текущему (регрессий нет)
- [ ] Коммит: `feat: species config infrastructure + dog color theme`

---

### ФАЗА 2: Onboarding и UI — выбор вида

**Цель:** Пользователь выбирает кошку или собаку при создании питомца.

#### 2.1 Экран выбора вида (первый шаг онбординга)
- [ ] Новый экран или секция в `PetInfoScreen.tsx` — выбор: Кошка / Собака
- [ ] Крупные карточки с иконками (кот и пёс)
- [ ] `OnboardingState` → добавить `petSpecies: PetSpecies`
- [ ] При выборе → цветовая схема приложения сразу переключается

#### 2.2 `NotificationsScreen.tsx`
- [ ] Убрать хардкод `species: 'cat'` (строка 38) → использовать выбранный species

#### 2.3 `MoreMenuScreen.tsx`
- [ ] Добавить ветку для `'dog'` (строка 150)

#### 2.4 `EditPetScreen.tsx`
- [ ] Selector вида + валидация из `speciesConfig` (maxWeight, maxAge)

#### 2.5 i18n
- [ ] Ключи: `pets.dog`, `pets.species`, `pets.selectSpecies`, видозависимые тексты
- [ ] Placeholder имени: "Барсик" для кошек, "Бобик" для собак

#### Контрольная точка Фазы 2:
- [ ] Полный цикл онбординга с выбором "Собака" — без крашей
- [ ] Переключение между питомцами разных видов — тема и заголовок меняются
- [ ] `npx tsc --noEmit` + `npm test`
- [ ] Коммит: `feat: species selection in onboarding + UI adaptation`

---

### ФАЗА 3: Анализатор — параметризация под вид

**Цель:** Все клинические пороги берутся из speciesConfig.

#### 3.1 `src/storage/domain/types.ts`
- [ ] `GLUCOSE_RANGES` → `getGlucoseRanges(species)` из конфига
- [ ] `getGlucoseLevel()` → принимает species
- [ ] `getGlucoseColor()` → принимает species
- [ ] Заменить `MAX_CAT_WEIGHT_KG`, `MAX_CAT_AGE_YEARS` → конфиг
- [ ] `HIGH_CARBS_DM_THRESHOLD` → конфиг

#### 3.2 `trendEngine.ts`
- [ ] `TARGET_LOW/TARGET_HIGH` → из конфига
- [ ] `calculateTimeInRange` → видозависимые пороги
- [ ] `analyzeTrends(readings, now, speciesConfig)`

#### 3.3 `patternDetector.ts`
- [ ] Somogyi пороги: low < config.somogyiNadirThreshold, rebound > config.somogyiReboundThreshold
- [ ] Post-meal spike: > config.postMealSpikeThreshold
- [ ] Remission: пропускать если `config.remissionRelevant === false`
- [ ] Missed injection impact: порог из конфига

#### 3.4 `safetyGuard.ts`
- [ ] `EMERGENCY_GLUCOSE_LOW/HIGH` → конфиг

#### 3.5 `riskScoreCalculator.ts`
- [ ] Пороги из конфига

#### 3.6 `diaryAnalyzer.ts`
- [ ] `inRange` (4.0-9.0) → конфиг

#### 3.7 `predictionDataCollector.ts`
- [ ] `computeGlucoseStats` inRange → конфиг

#### 3.8 Тесты
- [ ] Обновить тесты в `analyzer/engine/__tests__/`
- [ ] Добавить тест-кейсы для dog-конфига (другие пороги)

#### Контрольная точка Фазы 3:
- [ ] Кошачьи тесты проходят с идентичными результатами
- [ ] Собачьи тесты корректно используют другие пороги
- [ ] `npx tsc --noEmit` + `npm test`
- [ ] Коммит: `feat: analyzer species-aware thresholds`

---

### ФАЗА 4: Дозировки и валидация инсулина

**Цель:** Дозовые пороги и инсулины соответствуют виду.

#### 4.1 `LogGlucoseScreen.tsx`
- [ ] Хардкод `10/6/4` МЕ → конфиг
- [ ] Для собак: доза зависит от веса (`dosePerKg * petWeight`)
- [ ] Предупреждения адаптированы: "Опасно высокая доза для собаки" vs "для кошки"

#### 4.2 `feedCalculator/utils/calculateDryMatter.ts`
- [ ] Пороги carbsDM, proteinDM, fatDM → конфиг
- [ ] Для собак: добавить оценку клетчатки (fiberDM)

#### 4.3 i18n тексты дозировок
- [ ] `highDoseWarningDesc` — видозависимый
- [ ] `veryHighDoseWarningDesc` — видозависимый
- [ ] `doseAbsoluteLimitDesc` — видозависимый

#### Контрольная точка Фазы 4:
- [ ] Для кошки: предупреждение на 4 МЕ, блок на 10 МЕ (как раньше)
- [ ] Для собаки 30кг: предупреждение на ~10 МЕ, блок на 20 МЕ
- [ ] FeedCalculator: правильные пороги для каждого вида
- [ ] `npx tsc --noEmit` + `npm test`
- [ ] Коммит: `feat: species-aware insulin dosing + feed calculator`

---

### ФАЗА 5: AI промпты и прогнозы

**Цель:** AI знает, с каким животным работает, и даёт корректные рекомендации.

#### 5.1 `aiSystemPrompt.ts` (чат)
- [ ] "cat owner" → species-aware
- [ ] "feline diabetes" → species-specific контекст
- [ ] "obligate carnivore" → только для кошек
- [ ] Целевой диапазон → из конфига
- [ ] Для собак: контекст про тип 1, пожизненный инсулин, катаракту, высокую клетчатку

#### 5.2 `predictionSystemPrompt.ts` (прогнозы)
- [ ] "domestic cats" → species-aware
- [ ] "Cat name:" → "Pet name:" + species
- [ ] Целевые диапазоны → из конфига
- [ ] Remission assessment → только для кошек
- [ ] Для собак: добавить контекст про Caninsulin/NPH, дозы по весу

#### 5.3 `predictionDataCollector.ts`
- [ ] Передавать species в данные для AI
- [ ] `computeGlucoseStats` inRange → из конфига (уже сделано в фазе 3, проверить)

#### 5.4 `AiPetContext`
- [ ] Добавить поле `species: PetSpecies`

#### Контрольная точка Фазы 5:
- [ ] AI чат для кошки: ответы как раньше
- [ ] AI чат для собаки: корректные рекомендации (Caninsulin, клетчатка, нет ремиссии)
- [ ] Прогнозы используют правильные пороги для вида
- [ ] `npx tsc --noEmit` + `npm test`
- [ ] Коммит: `feat: species-aware AI prompts and predictions`

---

### ФАЗА 6: Симптомы

**Цель:** Симптомы соответствуют виду животного.

#### 6.1 Расширить `SymptomType`
- [ ] Добавить собачьи: `cataracts`, `urinaryInfection`, `panting`, `ataxia`
- [ ] `hindLimbWeakness` — только для кошек
- [ ] Mapping в speciesConfig: `symptoms.available`

#### 6.2 UI фильтрация
- [ ] `AddSymptomScreen.tsx` — показывать только симптомы из конфига
- [ ] i18n ключи для новых симптомов

#### Контрольная точка Фазы 6:
- [ ] Кошка: те же симптомы что раньше
- [ ] Собака: катаракта, ИМП, атаксия вместо планиградии
- [ ] `npx tsc --noEmit` + `npm test`
- [ ] Коммит: `feat: species-specific symptoms`

---

### ФАЗА 7: Контент — хинты, пуши, энциклопедия

**Цель:** Весь текстовый контент адаптирован под вид животного.

#### 7.1 Хинты (`hintsContent.ts` — 137 шт)
- [ ] Добавить поле `species?: PetSpecies | 'all'` в `HintContent`
- [ ] Шаблонизация: "кот/кошка" → `{{speciesNom}}`, `{{speciesGen}}`
- [ ] Хинты про ремиссию, планиградию → `species: 'cat'`
- [ ] Хинты про катаракту, клетчатку → `species: 'dog'`
- [ ] Общие хинты → `species: 'all'`
- [ ] `useHintEngine` — фильтрация по species

#### 7.2 Пуш-уведомления (`pushContent.ts`)
- [ ] "Котейка" → видозависимое
- [ ] Добавить собачьи варианты

#### 7.3 Энциклопедия (22 статьи)
- [ ] Добавить `species?: PetSpecies | 'all'` в `Article` interface
- [ ] Текущие 22 статьи → `species: 'cat'` (или `'all'` где универсально)
- [ ] Создать 10-15 статей для собак:
  - Что такое диабет у собак (тип 1)
  - Caninsulin и NPH — инсулины для собак
  - Кривая глюкозы у собак
  - Катаракта — главное осложнение
  - Диета для диабетической собаки (клетчатка)
  - Гипогликемия у собак — первая помощь
  - Диэструсный диабет у сук
  - Болезнь Кушинга и диабет
  - Мониторинг дома
  - Породная предрасположенность
- [ ] Фильтр в UI по species активного питомца

#### 7.4 Корма (`naturalFoods.ts`, `diabeticFoods.ts`, `alternativeFoods.ts`)
- [ ] Добавить `species` к каждой записи
- [ ] Собачьи рекомендации: Hills w/d, Royal Canin Diabetic, высокая клетчатка
- [ ] Порции: собачьи нормы (зависят от веса)

#### Контрольная точка Фазы 7:
- [ ] Кошка: весь контент как раньше
- [ ] Собака: релевантные хинты, статьи, корма
- [ ] Нет "кошачьего" контента при выборе собаки
- [ ] `npx tsc --noEmit` + `npm test`
- [ ] Коммит: `feat: species-specific content (hints, encyclopedia, foods)`

---

### ФАЗА 8: Интеграционное тестирование и финализация

#### 8.1 Полный прогон на устройстве
- [ ] Онбординг с выбором "Собака" → полный цикл
- [ ] Онбординг с выбором "Кошка" → регрессий нет
- [ ] Переключение между питомцами разных видов
- [ ] Цветовая схема переключается корректно
- [ ] Заголовок "Cats" / "Dogs" переключается
- [ ] LogGlucose: дозы для собаки по весу
- [ ] Analyzer: собачьи пороги, нет ремиссии
- [ ] AI чат: корректные ответы для собаки
- [ ] Энциклопедия: собачьи статьи
- [ ] Хинты: собачий контент
- [ ] FeedCalculator: клетчатка для собак

#### 8.2 Edge cases
- [ ] Питомец без species (миграция) → cat
- [ ] Смена вида у существующего питомца → данные сохраняются
- [ ] Dark theme + dog color scheme
- [ ] Маленький экран (320px) + dog onboarding

#### 8.3 Версия
- [ ] Bump version → v2.5.0 (versionCode 16)
- [ ] `npx tsc --noEmit` + `npm test`
- [ ] Коммит + push + EAS build

#### Контрольная точка Фазы 8:
- [ ] Всё работает на физическом устройстве
- [ ] 0 регрессий для кошачьего сценария
- [ ] Коммит: `chore: bump to v2.5.0 — multi-animal support`

---

## ЗАХАРДКОЖЕННЫЕ МЕСТА (найдены архитектурным агентом)

Полный список файлов, где зашита "кошка":

### Клинические константы (КРИТИЧНО)
| Файл | Что захардкожено | Фаза |
|------|-----------------|------|
| `src/storage/domain/types.ts` | GLUCOSE_RANGES, getGlucoseLevel(), MAX_CAT_WEIGHT_KG, MAX_CAT_AGE_YEARS, HIGH_CARBS_DM_THRESHOLD | 3 |
| `src/features/analyzer/engine/trendEngine.ts` | TARGET_LOW=4, TARGET_HIGH=12 | 3 |
| `src/features/analyzer/engine/patternDetector.ts` | Somogyi: low<4, rebound>18; post-meal>15; remission morning<7 | 3 |
| `src/features/analyzer/engine/safetyGuard.ts` | EMERGENCY_GLUCOSE_LOW=2.8, HIGH=30 | 3 |
| `src/features/diary/utils/diaryAnalyzer.ts` | inRange: 4.0-9.0 | 3 |
| `src/features/prediction/data/predictionDataCollector.ts` | inRange: 4.0-12.0 | 3 |

### Дозировки (КРИТИЧНО)
| Файл | Что захардкожено | Фаза |
|------|-----------------|------|
| `src/features/glucose/screens/LogGlucoseScreen.tsx` | limit 10 IU, warning 6, elevated 4 | 4 |
| `src/features/feedCalculator/utils/calculateDryMatter.ts` | carbsDM<10, proteinDM>=40, fatDM<=40 | 4 |

### AI промпты
| Файл | Что захардкожено | Фаза |
|------|-----------------|------|
| `src/features/hints/data/aiSystemPrompt.ts` | "cat owner", "feline diabetes", target 4-9 | 5 |
| `src/features/prediction/data/predictionSystemPrompt.ts` | "domestic cats", "Cat name:", remission ISFM | 5 |

### UI и логика
| Файл | Что захардкожено | Фаза |
|------|-----------------|------|
| `src/features/onboarding/screens/NotificationsScreen.tsx` | species: 'cat' (строка 38) | 2 |
| `src/features/pets/screens/MoreMenuScreen.tsx` | нет ветки для 'dog' | 2 |

### Контент (самый объёмный)
| Файл | Объём | Фаза |
|------|-------|------|
| `src/features/hints/data/hintsContent.ts` | 137 хинтов, 258 упоминаний кот/кош | 7 |
| `src/features/hints/data/pushContent.ts` | пуши с "котейка" | 7 |
| `src/features/encyclopedia/data/articles/` | 22 статьи, 317 упоминаний | 7 |
| `src/features/encyclopedia/data/naturalFoods.ts` | порции для кошек | 7 |
| `src/shared/i18n/locales/ru.ts` + `en.ts` | "для кошки", "диабет кошек" | 4,7 |

---

## ПОСТ-РЕВЬЮ H1–H5 (чистки перед релизной веткой)

> Источник: код-ревью серии `5e3dbae^..cd9455b` от 2026-04-16.
> Блокирует: релизную ветку и старт ЭТАПа 15 Phase 1 (п.4 — до вынесения градиента в тему).

### 1. Мёртвые i18n-ключи `navigation.glucose`
- [ ] Удалить ключ `navigation.glucose` из `src/shared/i18n/locales/en.ts:513`
- [ ] Удалить ключ `navigation.glucose` из `src/shared/i18n/locales/ru.ts:513`
- [ ] `grep -r "navigation.glucose"` → 0 совпадений
- **Почему:** после H2 вкладка удалена, ключ не используется; мёртвые переводы гниют молча.

### 2. Двойная регистрация `AiAssistantScreen`
- [ ] Проверить `src/features/pets/screens/MoreMenuScreen.tsx` — остался ли пункт «AI-ассистент» в меню More
- [ ] Если остался: заменить `navigate('AiAssistant')` на `navigate('AiTab')` через root-навигатор; удалить `name="AiAssistant"` из `MainNavigator.tsx:284-285`
- [ ] Если убран: всё равно удалить мёртвую регистрацию в MoreStack
- **Почему:** сейчас `AiAssistantScreen` зарегистрирован и как `MoreTab > AiAssistant` (строка 285), и как `AiTab` (строка 351) — это два независимых дерева состояния React Navigation. История чата и контекст могут расходиться в зависимости от точки входа.
- **Как проверить:** на устройстве — открыть чат через AiTab, написать сообщение, вернуться, открыть через More → история должна совпасть. Если нет — бага подтверждена.

### 3. Тройная регистрация `FeedCalculator`
- [ ] Прочитать `src/features/feedCalculator/screens/FeedCalculatorScreen.tsx` — использует ли локальный `useState` для веса/корма
- [ ] Если локальный state: вынести в store (`feedCalculatorStore` через zustand) ИЛИ оставить stateless (расчёт на лету, без запоминания ввода)
- [ ] Задокументировать решение в коде комментарием на экране
- **Почему:** экран зарегистрирован в `HomeStack` (строка 143), `EncyclopediaStack` (228) и `MoreStack` (274). При локальном state пользователь, открывший калькулятор из FeedGuide, и снова из MoreMenu, увидит разный ввод — это баг.

### 4. Discoverability-регрессия AI Prediction
- [ ] В `src/features/analyzer/screens/AnalyzerDashboardScreen.tsx:118` — убрать условие `hasEnoughData &&` или сделать альтернативный рендер
- [ ] Если данных <7 дней: показывать выключенный тизер («Ведите дневник 7 дней, чтобы открыть AI-прогноз») с замком
- [ ] При тапе на выключенный тизер — тост/модалка с объяснением, НЕ переход на Paywall (это уведёт пользователя с пустой статистики)
- [ ] Добавить i18n-ключи: `analyzer.aiPredictionLockedTitle`, `analyzer.aiPredictionLockedDesc`
- **Почему:** H1 убрал всегда-видимую AI-карточку с Dashboard; H3 поставил CTA в Analyzer, но под условие `hasEnoughData`. Новый пользователь с <7 дней данных теперь НЕ ВИДИТ AI Prediction нигде — не может даже узнать о фиче. Это потеря монетизации и UX-регрессия.

### 5. Захардкоженный градиент AI CTA (блокирует ЭТАП 15)
- [ ] Добавить `aiGradient: [string, string]` в `src/shared/theme/colors.ts` для обеих тем (light/dark)
- [ ] В `speciesConfig` добавить `ui.aiGradient` — для кошек `['#8B5CF6', '#6D28D9']`, для собак подобрать градиент в янтарной гамме (`#E67E22` → `#B3590E` или согласовать с пользователем)
- [ ] Заменить хардкод в `AnalyzerDashboardScreen.tsx:121` на `theme.colors.aiGradient` или `speciesConfig.ui.aiGradient`
- [ ] Проверить другие места с хардкодом `#8B5CF6`/`#6D28D9` в `src/features/` — вынести все в тему
- **Почему:** ЭТАП 15 вводит species-тему (cat синий/фиолетовый vs. dog янтарный). Хардкод не адаптируется — на профилях собак фиолетовый CTA будет визуально конфликтовать с янтарным брендингом. **Этот пункт делать ДО Phase 1 ЭТАПа 15**, иначе придётся править заново.

### 6. Prettier pre-commit hook (опционально, предотвращает будущий шум)
- [ ] Проверить наличие `.prettierrc` и `husky`/`lint-staged`
- [ ] Если нет — добавить `lint-staged` с `prettier --write` на `*.{ts,tsx}` при коммите
- **Почему:** ~40% диффа H5 — это prettier-переформатирование `FeedGuideScreen.tsx`, маскирующее реальное изменение (добавление карточки Calculator). Формат на pre-commit держит будущие фичевые диффы чистыми.

### 7. Smoke-тест навигации (рекомендация)
- [ ] Ручная проверка на устройстве:
  - [ ] deep-link `diapet://glucose` → открывает GlucoseList в HomeStack
  - [ ] deep-link `diapet://ai` → открывает AiTab
  - [ ] AiTab — нет кнопки «назад» в header
  - [ ] MoreMenu → AiAssistant (если останется) — есть кнопка «назад»
  - [ ] Analyzer CTA при `isPro === false` → открывает Paywall
  - [ ] Analyzer CTA при `isPro === true` → открывает AdvancedAnalytics

### Порядок выполнения
1. Пункт 5 (градиент) — ПЕРЕД Phase 1 ЭТАПа 15, блокирует.
2. Пункты 1, 2, 3 — одним коммитом «chore(h-cleanup): nav/i18n dead code» перед релизом.
3. Пункт 4 — отдельным коммитом «feat(analyzer): teaser for AI Prediction without data».
4. Пункты 6, 7 — когда удобно, не блокируют.

---

## СПЕЦИЕС-АУДИТ ПОСЛЕ ЭТАПА 15 (2026-04-20)

> Ручной аудит после того, как ЭТАП 15 фазы 1-8 были помечены done.
> Обнаружено 5 классов регрессий — species-aware логика покрыла числовые пороги, но оставила хардкод в текстах и контенте. Все исправлены в одной серии.

### Исправлено (F1–F5)

- **F1. Dose-warning тексты species-aware** — `locales/{ru,en}.ts` получили `_dog`-варианты для `highDoseWarningDesc`, `veryHighDoseWarningDesc`, `doseAbsoluteLimitDesc`. В `LogGlucoseScreen.tsx` и `LogInjectionScreen.tsx` вызовы `t()` передают `context: species`. Владелец собаки больше не видит «dangerously high dose for a cat» на своей 15 МЕ дозе.
- **F2. AI default disclaimer нейтрализован** — `predictionApiClient.ts:86` и `en.ts:defaultDisclaimer` заменили `your cat's treatment plan` → `your pet's`. RU-версия уже была нейтральной.
- **F3. Natural Food card скрыта для собак** — `FeedGuideScreen.tsx` теперь проверяет species; карточка рендерится только для cat/other. `NATURAL_FEEDING_GUIDE` полностью кошачий (таурин, протеиновые нормы), собачий контент появится отдельной задачей.
- **F4. 7 i18n-строк нейтрализовано** (`cat/feline` → `pet/питомец`): encyclopedia subtitle, feedGuide disclaimer, whereToBuyDesc, feedCalculator badDesc, subscription aiAssistantDesc, hints aiAssistantDesc, aiPlaceholder.
- **F5. Убраны кошачьи дефолты** в `computeGlucoseStats` (`predictionDataCollector.ts`) — 4.0/12.0 были фолбэком "default: cat", заменены на required params. Единственный caller уже передавал `speciesConfig.glucose.targetLow/High`.

### Проверка

- `npx tsc --noEmit` — 0 ошибок
- `npm test` — 48/48 зелёных
- Ручная проверка на устройстве: TODO перед релизом v2.5.0

---

## H7: 7-ДНЕВНЫЙ ПРОБНЫЙ ПЕРИОД (2026-04-20)

> Бизнес-аудит, оставшийся пункт. Цель: дать пользователю полный доступ к Pro на 7 дней после онбординга, чтобы показать ценность до просьбы об оплате. Одна попытка на устройство (идемпотентный `startTrial`).

### Реализовано

- **`src/features/subscription/utils/trial.ts`** — новый модуль: `TRIAL_DURATION_DAYS = 7`, `TRIAL_REMINDER_DAYS = 2`, `startTrial()`, `hasTrialStarted()`, `isTrialActive()`, `isTrialExpired()`, `trialDaysLeft()`, `trialHoursLeft()`, `trialExpiresAt()`.
- **`StorageKeys.TRIAL_STARTED_AT`** — MMKV-ключ с таймстампом начала периода (пишется один раз, последующие `startTrial()` — no-op).
- **`useSubscription`** — трайал включён в `effectivePro`. Отдаёт `isPaidPro`, `isTrialActive`, `trialDaysLeft`, `hasTrialStarted`, `isTrialExpired` для UI.
- **`SuccessScreen`** — `handleStart` вызывает `startTrial()` перед `reset({Main})`. Добавлен баджик "7 дней Pro бесплатно — уже активированы".
- **`PaywallScreen`** — три состояния под hero:
  - `!hasTrialStarted` → CTA-карточка "Попробуйте Pro бесплатно — 7 дней"
  - `isTrialActive` → зелёная карточка "Бесплатный период активен — осталось N дней"
  - `isTrialExpired` → жёлтая карточка "Пробный период закончился"
- **`DashboardScreen`** — баннер (зелёный при активном, жёлтый с срочностью при ≤2 днях) с tap → Paywall. Скрыт для paid-Pro.
- **i18n** — `onboarding.success.trialBadge`, `subscription.trial.*` с RU-плюрализацией (`_0/_1/_2`) и EN (`_plural`).

### Решения

- **Триггер старта** — `SuccessScreen.handleStart`. Для существующих пользователей (онбординг уже пройден до апдейта) трайал не стартует автоматически — их CTA только на Paywall.
- **Идемпотентность** — `startTrial()` проверяет `hasTrialStarted()` и не перетирает старый таймстамп. Одна попытка на устройство (refresh по deviceId не делаем — это лазейка).
- **Почему не Zustand store** — трайал меняется 1 раз за жизнь (onboarding → active → expired). Чтение из MMKV на каждом рендере дешёвое; реактивность не нужна сверх того, что даёт navigation-reset после старта.

### Что НЕ делали в H7 (осознанно)

- Push-уведомление за 2 дня до окончания — бизнес-решение не делать, пока не настроены уведомления подписки на сервере (чтобы не дёргать пользователя без функционального фолбэка).
- Возможность продлить/перезапустить — намеренно, иначе ценность пробного периода размывается.
- Серверная проверка статуса — backend всё ещё заглушен, трайал работает чисто клиентски (это нормально для устройства-as-trial-token).

### Проверка

- `npx tsc --noEmit` — 0 ошибок
- `npm test` — 48/48 зелёных
- Ручная проверка на устройстве: TODO перед релизом v2.5.0

---

## ОТЛОЖЕННЫЕ ЭТАПЫ (после собак)

| Этап | Описание | Зависимость |
|------|----------|-------------|
| 13A | Подписки (Prodamus + Supabase) | Мерчант Prodamus + Supabase проект |
| 13B | AdMob | Google AdMob app + ad units |
| 13C | AI proxy (Supabase Edge Function) | Supabase проект |
| 13D | Cloud backup через Supabase | Supabase проект |
| 14 | Bluetooth, виджеты | Будущее |

---

## ПРАВИЛА РАБОТЫ

1. **Каждая фаза заканчивается:** `npx tsc --noEmit` + `npm test` + проверка регрессий + коммит
2. **Кошачий сценарий НЕ ДОЛЖЕН ломаться** — это главный инвариант
3. **Проверка на баги встроена:** после каждой фазы прогон тестов + ручная проверка на устройстве
4. **Сессия заканчивается:** обновление MEMORY.md с указанием текущей фазы и что осталось
5. **Следующая сессия начинается:** чтение MEMORY.md → продолжение с последней незавершённой фазы

---

## ИСТОРИЯ

| Дата | Версия | Что |
|------|--------|-----|
| 2026-04-20 | v2.4.3 | H7: 7-дневный пробный период (trial utility + auto-start + UI в 3 экранах) |
| 2026-04-20 | v2.4.3 | Species-аудит F1–F5 — нейтрализация cat-хардкода в текстах |
| 2026-04-15 | v2.4.3 | ЭТАП 15 фазы 1–8 multi-animal code complete + H1–H6 + H9 |
| 2026-04-13 | v2.4.3 | План ЭТАП 15 (multi-animal) создан и утверждён |
| 2026-04-10 | v2.4.3 | Сборки EAS, загрузка в Google Play + RuStore |
| 2026-04-06 | v2.4.3 | Privacy policy, Terms, google-services.json |
| 2026-04-05 | v2.4.2 | ЭТАП 12 complete, Firebase Auth, аудиты |
| 2026-03-30 | v2.4.0 | ЭТАП 9-10 (Analyzer + Encyclopedia) |
| 2026-03-29 | v2.3.0 | Design Refresh + ЭТАП 8 |
| Ранее | v1.x-2.x | MVP → PRO → AI → аудиты |
