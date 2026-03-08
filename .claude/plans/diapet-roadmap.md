# DiaPet — Roadmap & Plan

> Обновлён: 2026-03-09

---

## 3. ПРИОРИТЕТЫ

| # | Задача | Статус |
|---|--------|--------|
| 0 | Закоммитить + запушить 7 файлов | ✅ коммит 3caca28 |
| 1 | Рефакторинг (секция 1) | ✅ DONE (2026-03-08) |
| 2 | Daily Diary (секция 2) | ✅ DONE (2026-03-08) |
| 3 | Полный аудит + фиксы (секция 4) | ✅ DONE (2026-03-08) |
| 4 | Edge-cases + layout + encyclopedia | ✅ DONE (2026-03-09) |
| 5 | **Деплой в Google Play** | 🔜 СЛЕДУЮЩАЯ СЕССИЯ |
| 6 | AI через Claude API | ❌ будущее |

---

## 5. ДЕПЛОЙ (следующая сессия)

### Чеклист перед сборкой
- [ ] `git push` — запушить все локальные коммиты на origin/master
- [ ] `package.json` version: `"1.0.0"` → `"1.1.0"`
- [ ] Проверить RevenueCat API key (не `YOUR_REVENUECAT_API_KEY`)
- [ ] Финальный `npx tsc --noEmit` + `npm run lint`

### Сборка
```bash
eas build --platform android --profile production
```

### Публикация
- Скачать AAB из EAS Dashboard
- Загрузить в Google Play Console → Закрытое тестирование
- Заполнить What's New (RU/EN)
- Отправить на проверку

### What's New v1.1.0
**RU:** Дневник дня — просматривайте глюкозу, инъекции и кормление за любой день. Анализ показателей и советы. Исправлены ошибки.
**EN:** Daily Diary — view glucose, injections and feedings for any day. Analysis and recommendations. Bug fixes.

---

## 4. СЕССИЯ 2026-03-09 — итог

### Autonomous audit edge-cases (коммит `a6790a3`)
- `LogFeedingScreen` — блокировка amount ≤ 0 перед сохранением
- `EditPetScreen` — валидация weight > 0 и ≤ 30 кг
- `PetInfoScreen` (онбординг) — валидация weight + age с отображением ошибки
- `dateUtils` — все 4 функции в try/catch → не крашат экран при повреждённых датах
- i18n: `feeding.amountError`, `pets.invalidWeight` в ru/en

### Layout overflow 320px (коммит `0c7845b`)
- `LogGlucoseScreen` — mealLabel `numberOfLines={2}` + `adjustsFontSizeToFit`
- `LogFeedingScreen` — chipLabel `numberOfLines={1}` + `adjustsFontSizeToFit`
- `GlucoseListScreen` — chipText (фильтры уровня + приёма пищи) `numberOfLines={1}`

### Encyclopedia fix (коммит `ce4fc56`)
- 424 строки с `- text` рендерились как сырой текст → теперь `• text` с буллетом
- Инлайн `**bold**` рендерился как `**слово**` → теперь жирный текст через `renderInline()`
- Все 12 статей: RU/EN контент 2000–3300 символов, все поля присутствуют

---

## 4. АУДИТ — итог (2026-03-08)

29 проблем найдено и исправлено. Коммиты: `ab75862`, `bf8abdb`.

### CRITICAL (2)
- `EmergencyScreen` — SOS уводил в EditPet, пользователь терял инструкции → убрана навигация из Alert
- `DailyDiaryScreen` — пустой экран без питомца без объяснений → добавлен guard + empty state

### HIGH (11)
- `callVet()` без debounce → 10 тапов = 10 звонков → callingRef 2s lock
- `mealRelation` не в unsaved-changes guard → молча терялся → добавлен в initialValuesRef
- `diary/*` query keys не инвалидировались после mutations (6 мест)
- delete без try-catch в Injection/FeedingListScreen
- DailyDiary: нет error state / pull-to-refresh / addRow overflow на 320px
- StatusCard label обрезался на 320px → numberOfLines 1→2

### MEDIUM (12)
- isFuture timestamp → startOfDay
- goodControl + highGlucose одновременно → исправлен guard
- Нет кнопки "Сегодня" в DailyDiary при глубокой навигации
- parseISO без isValid в route.params
- FeedingListScreen: regex на строке перевода → t('common.grams')
- DashboardScreen: onRefresh 2/5 → 5/5 queries; длинное имя питомца → adjustsFontSizeToFit

### LOW (4)
- avg * 18 → * MGDL_PER_MMOLL
- FOOD_TYPE_OPTIONS вне useMemo
- common.grams i18n ключ добавлен ru/en
- diaryAnalyzer асимметричный guard

---

## 2. DAILY DIARY — итог (2026-03-08)

- `DailyDiaryScreen.tsx` — таймлайн дня, навигация по датам + кнопка "Сегодня", stats row (avg/inRange%/count), rule-based AI-панель, pull-to-refresh, error state, petId guard
- `diaryAnalyzer.ts` — rule-based анализ: severe_low, low, high, inRange%, spread, no contradictions
- `injectionRepository.findForDay` + `feedingRepository.findForDay` + `findAllByPetId`
- `DailyDiary: { date?: string }` в HomeStackParamList + MainNavigator
- Dashboard: кнопка "Дневник дня" в quickActions (5-я кнопка, centered grid)
- i18n: `diary.*` + `dashboard.dailyDiary` + `common.grams` в ru/en

---

## 1. РЕФАКТОРИНГ — итог (2026-03-08)

- 0 TS ошибок (было 36: @expo/vector-icons + ThemeContext)
- 0 ESLint warnings
- `IoniconName` — единый тип (12 файлов), `NavigatorScreenParams`, `OnboardingPetData`, `ThemeSchemeColors`
- `.gitattributes` LF нормализация
- 3 неиспользуемых пакета удалены
- `findAllByPetId` в 3 репозиториях — PDF не обрезает историю
- `pets.invalidTimeFormat` i18n ключ добавлен

---

## БУДУЩЕЕ

- AI-рекомендации через Claude API (Cloudflare Worker)
- Виртуализация таймлайна DailyDiary (FlatList при 20+ событий)
- Онбординг hint для пустого Dashboard
- Inline добавление ветеринара в EmergencyScreen (без выхода)
- Unit-тесты (severityCalculator, dateUtils, diaryAnalyzer)
