# DiaPet — Master Development Plan

> Последнее обновление: 2026-03-29
> Версия: 2.3 (versionCode 11)

---

## ПРОГРЕСС

```
[####################] v1.0 MVP           ✅ DONE
[####################] v1.1 Критические   ✅ DONE
[####################] v1.1 Высокий        ✅ DONE
[####################] v1.2 Аудит-фиксы   ✅ DONE
[####################] v1.3 Средний прио   ✅ DONE
[####################] v1.4 Корм-гид       ✅ DONE
[####################] v1.5 Bug Review     ✅ DONE
[####################] v1.6 UI Redesign    ✅ DONE
[##########__________] v1.7 Pre-deploy     (иконка, Android 15/16, hints)
[####################] v1.8 Bug Audit      ✅ DONE (14 багов, paranoid audit)
[####################] v1.8.1 Full Audit   ✅ DONE (~36 багов, 8 агентов)
[####################] v2.0 PRO + AI Pred  ✅ DONE (7 фаз, 11 файлов)
[####################] v2.1 Audit+Features ✅ DONE (9 stages, 48 багов)
[####################] v2.2 Google Play    ✅ DONE (AAB билд)
[####################] v2.3 Deep Audit x4  ✅ DONE (80+ багов за 4 раунда)
[####################] v2.4 Design Refresh ✅ DONE (Manrope + Lucide)
[####################] v2.5 Arch Fixes     ✅ DONE (ЭТАП 8, 17 задач)
[####################] v2.6 Local Analyzer ✅ DONE (ЭТАП 9, 34 задачи)
[____________________] v2.7 Encyclopedia   ⬅ СЛЕДУЮЩИЙ
[____________________] v2.8 Backend        🔜 (Prodamus + Supabase)
[____________________] v3.0 AI/Smart       🔜
```

---

## ЭТАП 1: v1.0 MVP ✅

- [x] Онбординг (язык, питомец, расписание, ветеринар, уведомления)
- [x] Dashboard + мини-график глюкозы + тренд + бейдж времени
- [x] Дневник глюкозы (ввод, история, редактирование, статистика)
- [x] Лог инъекций + лог кормлений
- [x] Симптом-трекер с фото (валидация размера/количества)
- [x] Экстренный режим (гипо/гипергликемия + звонок ветеринару)
- [x] Энциклопедия (5 статей, offline)
- [x] Калькулятор расходов
- [x] Профиль питомца
- [x] Тёмная/светлая тема, RU/EN
- [x] SQLite + SQLCipher + MMKV (secure key via expo-secure-store)
- [x] Push-уведомления
- [x] Feature-based архитектура

---

## ЭТАП 2: v1.1 Критические + Высокий приоритет ✅

- [x] A1 SQLCipher шифрование
- [x] A2 MMKV secure key
- [x] A3 Валидация фото (selectionLimit: 5, fileSize < 5MB)
- [x] A4 .env в gitignore
- [x] B1 ErrorBoundary
- [x] B2 Кнопка кормления → LogFeedingScreen
- [x] B3 useEffect зависимости (editId)
- [x] B4 Non-null assertion guards
- [x] B5 Расчёт дат (endOfMonth)
- [x] C1 Типизированные навигационные хуки (28 файлов, 0 `<any>`)
- [x] D1 storage/domain/types.ts — единый источник типов
- [x] D2 Убрана зависимость shared→features
- [x] D5 Система миграций БД
- [x] E1 Индикатор времени с последнего замера
- [x] E3 PDF экспорт для ветеринара
- [x] G1 ESLint + Prettier + скрипты (lint, format, typecheck)
- [x] G2 Jest (18 тестов, 2 тест-файла)
- [x] G4 iOS EAS конфиг

---

## ЭТАП 3: v1.2 Аудит-фиксы ✅ DONE

> Завершён 2026-02-21. 18 фиксов в 5 фазах.
> Все проверки пройдены: tsc ✅ | jest (18/18) ✅

- [x] FIX-01 Миграция v2: `feeding_logs` → `feedings`
- [x] FIX-02 Миграция v3: убран дублирующий `photo_uri` ALTER
- [x] FIX-03 `glucoseRepository.update()` — добавлен `insulin_type`
- [x] FIX-04 EditPetScreen — сохранение расписания в БД
- [x] FIX-05 petStore.loadPets() — error state
- [x] FIX-06 App.tsx initStorage() — catch ошибок
- [x] FIX-07 Async cleanup в useEffect (3 файла)
- [x] FIX-08 Catch-блоки — уже имели Alert.alert (verified)
- [x] FIX-09 i18n: 50+ строк мигрированы в ru.ts/en.ts (19 файлов)
- [x] FIX-10 Стабильные ключи (4 файла)
- [x] FIX-11 Loading state: SymptomDetail, PetProfile
- [x] FIX-12 Typed useRoute в 7 файлах (0 `useRoute<any>`)
- [x] FIX-13 PDF экспорт: cap 100 glucose + 50 symptoms
- [x] FIX-14 console.log в migrations gated behind __DEV__
- [x] FIX-15 Удалён useActivePet хук
- [x] FIX-16 Удалён ScreenHeader компонент
- [x] FIX-17 Удалены 12 пустых директорий
- [x] FIX-18 GlucoseChart: прямой импорт из @storage/domain/types

---

## ЭТАП 4: v1.3 Средний приоритет ✅ DONE

> Завершён 2026-02-22. 4 коммита, 3 фазы.
> Все проверки пройдены: tsc ✅ | jest (18/18) ✅

### Фаза 4A — Архитектура ✅

- [x] C8 React Query staleTime: 5 мин, refetchOnWindowFocus: false
- [x] D6 Нормализовать symptom_types (junction table + миграция v4)
- [x] D7 Пагинация для glucose/symptoms/injections/feedings (cursor-based, limit 50)
- [x] PaginatedResult<T> тип

### Фаза 4B — Новые фичи ✅

- [x] E2 Выбор даты/времени при вводе глюкозы (DateTimePicker)
- [x] E4 Связь симптомов с глюкозой (glucose_reading_id + UI picker)
- [x] E7 Фильтрация истории глюкозы (дата, уровень, приём пищи)
- [x] E8 Определение стадии диабета (ранее)
- [x] E9 Калькулятор корма (ранее)
- [x] История инъекций + кормлений (экраны + графики)

### Фаза 4C — Перформанс ✅

- [x] C4 useCallback для обработчиков (6 экранов)
- [x] C5 Стабильные ключи в оставшихся списках (9 файлов)
- [x] C6 useMemo для ExpensesScreen.byCategory (уже было)
- [x] C7 Zustand селекторы (5 файлов)

---

## ЭТАП 4.5: v1.4 Корм-гид (где купить + альтернативы) ✅ DONE

> Завершён 2026-02-24. Данные + 4 экрана + навигация + i18n.
> Все проверки пройдены: tsc ✅ | jest (18/18) ✅

### Фаза 4.5A — Данные о кормах ✅

- [x] Магазины по 6 регионам: RU, US, EU, DE, UK, MX (regionStores.ts)
- [x] 8 альтернативных кормов с вердиктами (alternativeFoods.ts)
- [x] 14 натуральных продуктов с БЖУ, советами, предупреждениями (naturalFoods.ts)
- [x] Гид по натуралке: порции, пропорции, добавки, пример меню, переход
- [x] MX регион добавлен в тип Region
- [x] getFoodVerdict() хелпер для оценки кормов
- [x] i18n: ~80 ключей feedGuide в ru.ts и en.ts

### Фаза 4.5B — UI экраны ✅

- [x] FeedGuideScreen — хаб (регионы, альтернативы, натуралка, советы)
- [x] FeedGuideRegionScreen — корма по региону + магазины + фильтры
- [x] FeedGuideAlternativesScreen — альтернативные корма с вердиктами
- [x] FeedGuideNaturalScreen — натуралка (дисклеймер, порции, продукты, добавки, меню)
- [x] Баннер "Гид по кормам" в ArticleListScreen
- [x] 4 маршрута в навигации (EncyclopediaStack)

> **CHECKPOINT 4.5**: tsc ✅ | jest ✅

---

## ЭТАП 4.6: v1.5 Full Bug Review — полная ревизия проекта

> Аудит завершён 2026-02-24. Найдено 32 бага. План фиксов: `BUGFIX-PLAN.md`

### Фаза 4.6A — Аудит ✅ DONE

- [x] Agent 1: Ревизия data layer (repositories, migrations, schema, stores, MMKV)
- [x] Agent 2: Ревизия screens + navigation + i18n + Feed Guide
- [x] Результат: 2 CRITICAL, 8 HIGH, 12 MEDIUM, 10 LOW → сохранено в `BUGFIX-PLAN.md`

### Фаза 4.6B — Исправление найденных багов ✅ DONE

- [x] Fix CRITICAL (2): race condition в getDatabase(), orphan routes
- [x] Fix HIGH (8): атомарность репозиториев, update logic, stale queries, UX
- [x] Fix MEDIUM (12): PRAGMA, MMKV, фильтры, i18n, типы
- [x] Fix LOW (10): 12 из 12 LOW исправлено
- [x] Regression test: tsc ✅ | jest (18/18) ✅

> **CHECKPOINT 4.6**: 30/32 багов исправлено (BUG-07 уже ок, BUG-32 → ЭТАП 5)

---

## ЭТАП 4.7: v1.6 UI Redesign — современный дизайн ✅ DONE

> Завершён 2026-02-26. 3 фазы, ~35 файлов, 3 коммита.
> Все проверки: tsc ✅ | jest (18/18) ✅

### Фаза 4.7A — Дизайн-система ✅

- [x] Gradient цветовые пары (header, primary, secondary, success, danger, warm)
- [x] Типографика: Inter (400/500/600/700) через @expo-google-fonts/inter
- [x] Card: subtle border по умолчанию (bordered prop)
- [x] Button: gradient primary, icon prop (Lucide via Icon.tsx)
- [x] EmptyState: iconName + iconColor (Lucide в цветном круге)
- [x] AnimatedListItem: reanimated FadeInRight с задержкой
- [x] primarySm shadow для FAB кнопок
- [x] expo-splash-screen для загрузки шрифтов

### Фаза 4.7B — Ключевые экраны ✅

- [x] Dashboard: градиентный хедер, все emoji → Ionicons, Inter шрифты
- [x] Tab bar: тень вместо бордера, выше (64px), dot-индикатор, Inter labels
- [x] Навигация: slide_from_right на всех стеках
- [x] Emergency FAB: пульсирующая анимация (reanimated)
- [x] GlucoseList: AnimatedListItem, gradient FAB, шире color bar, Ionicons

### Фаза 4.7C — Polish всех экранов ✅

- [x] MoreMenu: gradient pet card, Ionicons menu, Inter fonts
- [x] LogGlucose: Ionicons meal/date/time
- [x] EditPet: Ionicons section headers
- [x] Symptoms (list, detail, add): SYMPTOM_ICONS mapping, AnimatedListItem
- [x] InjectionList, FeedingList: AnimatedListItem, Ionicons
- [x] LogInjection, LogFeeding: Ionicons
- [x] Language: gradient paw logo, FadeInDown
- [x] PetProfile, Expenses, AddExpense: Ionicons, Inter fonts

> **CHECKPOINT 4.7**: tsc ✅ | jest ✅ | emoji → Ionicons everywhere

---

## ЭТАП 4.8: v1.7 Pre-deploy — подготовка к Google Play

> Частично завершён. Иконка, Android 15/16, hints, AdMob placeholder — готовы.

- [x] app.json: version, versionCode, package name
- [x] Иконка приложения (1024x1024 adaptive icon, RGB + RGBA)
- [x] Splash screen (DiaPet branding)
- [x] Android 15/16 совместимость (orientation: default, resizeableActivity)
- [x] Hints система (30-дневные подсказки, push, AI-ассистент)
- [x] AdMob баннер на дашборде (placeholder, скрыт для Pro)
- [x] Тестирование на реальном устройстве (TECNO_KJ5n)
- [ ] Описание для Google Play (короткое + полное, RU/EN)
- [ ] Политика конфиденциальности (offline-only, no data collection)
- [ ] Скриншоты (минимум 4: Dashboard, Glucose, Symptoms, Encyclopedia)
- [ ] Feature graphic (1024x500)
- [ ] Рейтинг контента (анкета Google Play Console)

---

## ЭТАП 4.9: v1.8 Bug Audit ✅ DONE

> Завершён 2026-03-15. Paranoid codebase audit → 14 багов исправлено.
> Все проверки: tsc ✅

### Исправленные баги:

- [x] H1: MMKV getStorage() — throw вместо unencrypted fallback
- [x] H2: Repository create() — null-check после findById (6 репозиториев)
- [x] H3: EditPetScreen — reschedule notifications при изменении расписания
- [x] H4: SettingsScreen deleteAllData — очистка hints + AI chat ключей
- [x] M1: LogInjectionScreen commonInsulins — Array.isArray guard
- [x] M2: useHintTrigger — getState() вместо stale closure
- [x] M4: GlucoseListScreen — await invalidateQueries
- [x] M5: HintCard — useMemo для StyleSheet
- [x] L1: AddSymptomScreen — удаление orphan-фото с диска
- [x] L2: PetInfoScreen placeholder — i18n (Барсик / Whiskers)
- [x] L3: ErrorBoundary — dark mode цвета для деталей

---

## ЭТАП 4.9.1: v1.8.1 Full Audit — 8 агентов, ~36 багов

> Сессия 2026-03-16. 10 коммитов, 8 агентов в 4 батчах.
> tsc ✅

### Завершённые агенты:
- [x] Phase 1: Paranoid Codebase Auditor (batch 1+2)
- [x] Phase 2: Paranoid UX Auditor
- [x] Phase 3: Logic Reviewer (standard)
- [x] Phase 4: Logic Reviewer (deep)
- [x] Phase 5: Code Auditor (round 1)
- [x] Phase 8: Medical Auditor

### Требуют повторного запуска в v1.9:
- [ ] Phase 6: Code Auditor (round 2) — результаты потеряны при компрессии контекста, топ-3 бага исправлены
- [ ] Phase 7: UX Scenario Tester — результаты потеряны, топ-2 бага исправлены (SOS, paywall)

### Ключевые исправления:
- [x] Insulin hard stop: 20→10 IU (ISFM 2021, Rand 2012)
- [x] Hypo protocol: 10→5 min, consciousness check before oral glucose
- [x] Duplicate injection warning (< 6h safety guard)
- [x] DateTimePicker date-mode preserves time (3 screens)
- [x] Locale-aware dates in all log screens (dd.MM.yyyy / MM/dd/yyyy)
- [x] AdMob placeholder guard (no crash without key)
- [x] cancelScheduleNotifications (preserves hint pushes)
- [x] presetDate for all log screens from DailyDiary
- [x] AI prompt thresholds aligned with app domain types
- [x] Paywall bypass when backend not configured
- [x] SOS button enlarged (48px, accessible)
- [x] Glucose delete in transaction (FK safety)
- [x] FlatList keyExtractor fix
- [x] Stale closures in hint hooks (getState())
- [x] PDF date formats locale-aware
- [x] Feeding times min-1 guard
- [x] NotificationsScreen persists user choice
- [x] Unsaved changes guard on AddExpenseScreen

---

## ЭТАП 5.0: v1.9 Pre-release — финальная подготовка ⬅ ТЕКУЩИЙ

> Всё что нужно для публикации в Google Play

### #0 — Re-run аудит агентов (незавершённые)
- [ ] Code Auditor round 2 (phase 6) — полный re-run, фокус на изменённых файлах
- [x] UX Scenario Tester (phase 7) — 18 багов найдено, 7 HIGH+MEDIUM исправлены
- [ ] Исправить найденные CRITICAL/HIGH баги

### #1 — EAS Build
- [ ] Запустить: `eas build --platform android --profile production --non-interactive`
- [ ] Скачать AAB → загрузить в Google Play Console (закрытое тестирование)

### #2 — Prodamus + Supabase (подписки)

**Архитектура**: Prodamus (платёжный провайдер, РФ) → webhook → Supabase Edge Function → PostgreSQL
**Причина**: Google Play не выводит деньги в РФ; Prodamus принимает Visa/MC/Мир/СБП, выплачивает на ИП/самозанятость

**Код уже готов (заглушки):**
- [x] `src/shared/utils/deviceId.ts` — UUID привязка устройства
- [x] `src/shared/api/subscriptionApi.ts` — API клиент (Supabase + Prodamus)
- [x] `src/shared/stores/subscriptionStore.ts` — rewrite без RevenueCat
- [x] `src/features/subscription/hooks/useSubscription.ts` — bypass при !isBackendConfigured()
- [x] `src/features/subscription/screens/PaywallScreen.tsx` — web paywall flow
- [x] `src/core/App.tsx` — убран RevenueCat, deviceId + loadStatus
- [x] `app.config.ts` — supabaseUrl, supabaseAnonKey, prodamusShopUrl
- [x] `.env` / `.env.example` — обновлены переменные
- [x] `react-native-purchases` — удалён из package.json

**Осталось (внешние сервисы):**
- [ ] Зарегать Prodamus (ИП/самозанятость) → создать магазин → 2 товара (monthly/yearly)
- [ ] Зарегать Supabase → создать проект → таблица `subscriptions`
- [ ] Supabase Edge Function: `check-subscription` (GET, по device_id)
- [ ] Supabase Edge Function: `prodamus-webhook` (POST, верифицирует подпись, записывает)
- [ ] Заполнить `.env`: SUPABASE_URL, SUPABASE_ANON_KEY, PRODAMUS_SHOP_URL
- [ ] Протестировать полный флоу: оплата → webhook → проверка статуса

### #3 — AdMob (реклама)
- [ ] Google AdMob → создать приложение, получить App ID → `app.json` androidAppId
- [ ] Создать Banner Ad Unit → `DashboardScreen.tsx` ADMOB_BANNER_ID
- [ ] Новый EAS билд (нативная зависимость)

### #4 — Google Play листинг
- [ ] Описание (короткое + полное, RU/EN)
- [ ] Политика конфиденциальности
- [ ] Скриншоты (4+)
- [ ] Feature graphic (1024x500)
- [ ] Рейтинг контента

### #5 — Валюта расходов (M5) ✅
- [x] Валюта по локали в AddExpenseScreen и ExpensesScreen
- [x] Currency code: RU→RUB, EN→USD

### #6 — Формат даты по локали (M6) ✅
- [x] dateUtils: formatShortDate/formatFullDate/formatFullDateTime (RU: dd.MM, EN: MM/dd)
- [x] Заменены хардкоды в FeedingList, InjectionList, GlucoseList

### #7 — UI Dark Mode Audit ✅
- [x] ErrorBoundary → Colors constants вместо хардкода
- [x] EmergencyScreen → 9x theme.colors.danger
- [x] DashboardScreen → SOS + upgrade gradient → theme tokens
- [x] PaywallScreen → theme.colors.success
- [x] HintCard → normalized shadow

> **DEPLOY**: загрузка в Google Play Console → Internal Testing → Production

---

## ЭТАП 6: v2.0 PRO Features + AI Prediction ✅ DONE (2026-03-17)

> План: `.claude/plans/federated-skipping-volcano.md`
> Memory: `project_pro_features_plan.md`
> 7 коммитов, 11 новых файлов, ~1800 строк кода

### Phase 1: PRO Feature Alignment ✅
- [x] PaywallScreen: 5 -> 8 features (+ Feed Calculator, AI Assistant, AI Prediction)
- [x] i18n: add feedCalculator, aiPrediction, aiAssistant subscription keys
- [x] Update advancedAnalyticsDesc text
- [x] Enforce 30-day history limit (GlucoseListScreen + DailyDiaryScreen) for free users
- [x] Removed cloudBackup placeholder

### Phase 2: Data Collection Layer ✅
- [x] `src/features/prediction/data/predictionTypes.ts` — full interfaces
- [x] `src/features/prediction/data/predictionDataCollector.ts` — queries all repos, 7d/30d stats
- [x] `src/features/prediction/data/predictionStorage.ts` — MMKV cache (6h/7d TTL) + rate limits
- [x] 4 new StorageKeys in storage.ts

### Phase 3: AI Prediction Prompt + API ✅
- [x] `src/features/prediction/data/predictionSystemPrompt.ts` — ISFM safety rules, structured JSON
- [x] `aiClient.ts` extended with maxTokens/timeout options
- [x] `src/features/prediction/utils/predictionApiClient.ts` — JSON parsing + fallback
- [x] `src/features/prediction/hooks/usePrediction.ts` — cache + rate limit + manual trigger

### Phase 4: UI Components ✅
- [x] `PredictionChart.tsx` — SVG: solid actual + dashed predicted + confidence band
- [x] `ChecklistCard.tsx` — collapsible recs with category icons & priority colors
- [x] `RemissionCard.tsx` — probability badge + +/- factors
- [x] `DisclaimerBanner.tsx` — amber warning banner

### Phase 5: AdvancedAnalyticsScreen + Navigation ✅
- [x] `AdvancedAnalyticsScreen.tsx` — full screen
- [x] Navigation: HomeStack + MoreStack registration
- [x] Dashboard: AI Smart Analysis card with gradient
- [x] MoreMenu: sparkles entry (pro-gated)

### Phase 6: i18n ✅
- [x] `prediction` section: ~25 keys EN + RU
- [x] Subscription feature descriptions updated

### Phase 7: Verification ✅
- [x] tsc clean (all 7 phases)
- [x] Walkthrough paths verified (Dashboard + More)
- [x] PaywallScreen shows 8 features
- [x] Both locales have all keys

### Post-implementation fixes ✅
- [x] Pro-gate on AdvancedAnalyticsScreen (useEffect redirect to Paywall)
- [x] DisclaimerBanner dark mode colors (theme.isDark conditional)
- [x] Raw API errors → localized user-friendly strings (3 error types)
- [x] Unused Rect import removed from PredictionChart
- [x] API key security: .env → app.config.ts → Constants.expoConfig (dotenv)
- [x] Real key removed from git-tracked app.json
- [x] dotenv installed as devDependency

---

## ЭТАП 6.5: v2.3 Deep Audit x4 ✅ DONE (2026-03-18 — 2026-03-28)

> 4 сессии, 80+ багов, 5 коммитов. Код стабилизирован.

### Сессия 2026-03-18 (v2.1.2)
- [x] 33 бага (API ключ в клиенте, notification opt-in, stale closure, layout fixes)

### Сессия 2026-03-21 (v2.3)
- [x] 9-stage plan, 48 багов (NaN dose, nutrition auto-fill, article audit, UI/UX)

### Сессия 2026-03-22
- [x] 3 parallel logic reviewers, 18 багов (injection safety, prediction cache, petStore sync)

### Сессия 2026-03-28
- [x] 3 parallel auditors, 17 багов + HintCard animation fix
- [x] Negative chart widths, Math.min stack overflow, symptom delete atomicity
- [x] Typed navigators, orientation lock, SQLCipher cleanup, Linking.openURL safety
- [x] Version sync, colorUtils shorthand hex, PDF rounding

---

## ЭТАП 7: v2.4 Design Refresh ✅ DONE (2026-03-29)

> 2 коммита, 50 файлов. Полная миграция шрифтов и иконок.

### Шрифты ✅
- [x] Manrope (UI text) — замена Inter (400/500/600/700)
- [x] Cormorant Garamond (display/accent — 600/700)
- [x] typography.ts: FontFamily обновлён
- [x] App.tsx: useFonts с 6 вариантами
- [x] MainNavigator: tabBarLabel → Manrope_500Medium
- [x] @expo-google-fonts/inter удалён из package.json

### Иконки ✅
- [x] Новый Icon.tsx — wrapper над Lucide Icons (120+ маппингов)
- [x] 41 экран/компонент мигрирован: Ionicons → `<Icon name="..." />`
- [x] lucide-react-native добавлен в зависимости
- [x] @expo/vector-icons больше не импортируется нигде
- [x] 5 пропущенных маппингов найдены аудитом и добавлены (wallet, cart, bag, arrow-up, stats-chart)

---

## ЭТАП 8: v2.5 Architecture Fixes ✅ DONE (2026-03-29)

> Исправления из архитектурного аудита 2026-03-29. 3 коммита, 33 файла.

### Фаза 8A — P0: Critical + High ✅

**CRITICAL:**
- [x] A1: Schema.ts — DB_VERSION→CURRENT_SCHEMA_VERSION=7, fresh installs skip migrations
- [x] A2: App.tsx — hardcoded Russian → i18n (errors.storageError, errors.storageRetry)

**HIGH — Data Consistency:**
- [x] A3: EditPetScreen — removed dead ['pet'] invalidation (pets in Zustand)
- [x] A4: Query key factory — queryKeys.ts, migrated all 16 screens
- [x] A5: DashboardScreen — trend/schedule wrapped in useMemo
- [x] A6: False positive — RQ5 stable refetch refs, no loop

**HIGH — Security/Cost:**
- [x] A7: AiAssistantScreen — 5s rate limit between messages
- [x] A8: Subscription cache TTL 24h→4h + AppState 'active' refresh

**HIGH — Missing Features:**
- [x] A9: Deep linking — diapet:// scheme + linking config in RootNavigator

### Фаза 8B — P1: Medium priority ✅

**Performance:**
- [x] B1: Migration v7 — 5 performance indexes on pet_id columns
- [x] B2: Already done — useInfiniteQuery cursor pagination on all 4 lists

**Navigation:**
- [x] B3: Not a bug — FeedGuide in HomeStack needed for Dashboard nav

**API:**
- [x] B4: subscriptionApi — error.status for classification
- [x] B5: subscriptionApi — exponential backoff (2s→32s), skip 401/403

**Validation:**
- [x] B6: Already done — 10M cap exists

**Code Quality:**
- [x] B7: Removed dead useAchievements.ts
- [x] B8: 6 validation constants in types.ts, replaced in 6 files

> **CHECKPOINT 8**: tsc ✅ | 3 коммита | pushed

---

## ЭТАП 9: v2.6 Local Analyzer ✅ DONE (2026-03-29)

> Локальная система анализа данных. Без API, офлайн, бесплатно. Ядро ценности приложения.
> Коммиты: `30523c9` (engine 9A-9E), `5a3c02a` (UI+data 9F-9G)

### Фаза 9A — Trend Engine ✅
- [x] C1-C6: trendEngine.ts — скользящие средние, направление, ускорение, CV%, TIR, morning trend

### Фаза 9B — Pattern Detector ✅
- [x] C7-C13: patternDetector.ts — 7 детекторов (Somogyi, dawn, post-meal, missed injection, food correlation, dose-response, remission)

### Фаза 9C — Risk Score Calculator ✅
- [x] C14-C16: riskScoreCalculator.ts — 6-факторная модель, 4 уровня риска, per-factor breakdown

### Фаза 9D — Safety Guard ✅
- [x] C17-C20: safetyGuard.ts — regex фильтр доз, emergency thresholds, disclaimer, pattern sanitization

### Фаза 9E — Smart Alerts ✅
- [x] C21-C22: smartAlerts.ts — 6 типов алертов, MMKV throttling (1/day, 7d cooldown)

### Фаза 9F — UI интеграция ✅
- [x] C23: RiskScoreWidget — SVG ring + score + level badge
- [x] C24: TrendIndicator — direction arrow + acceleration (compact/full)
- [x] C25: SmartInsightCard — priority-colored alert card
- [x] C26: AnalyzerDashboardScreen — trends, averages, CV/TIR, patterns, factor bars
- [x] C27: Dashboard integration — SmartInsight + RiskScore + TrendIndicator + TIR badge
- [x] C28: AI data pass-through — analyzer summary in prediction prompt

### Фаза 9G — Data Gaps Fix ✅
- [x] C29-C34: weightKg, carbsDM, circadian, scheduledInjectionsPerDay, lastVetVisitDate

---

## ЭТАП 10: v2.7 Encyclopedia Content Expansion

> Расширение 12 существующих статей + 10 новых. Билингвально (RU/EN).

### Фаза 10A — Инфраструктура контента

- [ ] D1: Разбить articles.ts на отдельные файлы: `src/features/encyclopedia/data/articles/*.ts`
- [ ] D2: Article interface — добавить `references: BilingualText[]`, `relatedArticleIds: string[]`, `order: number`
- [ ] D3: ArticleDetailScreen — рендеринг нумерованных списков, раздела "Источники"
- [ ] D4: Категория `lifestyle` в ArticleCategory (для новых практических статей)

### Фаза 10B — Новые статьи (приоритет: самые нужные)

- [ ] D5: `first-days` — "Первая неделя после диагноза" (пошаговый план, что купить, чего ждать)
- [ ] D6: `flexible-monitoring` — "Реалистичный подход" (утренний чек + наблюдение vs кривые каждый день)
- [ ] D7: `real-life-management` — "Жизнь с диабетиком" (кормление по требованию, поездки, передержка, несколько кошек)

### Фаза 10C — Новые статьи (медицинские)

- [ ] D8: `stress-hyperglycemia` — стрессовая гипергликемия (ветклиника vs дом, как отличить)
- [ ] D9: `comorbidities` — IBD + гипертиреоз + ХБП (частые коморбидности)
- [ ] D10: `ketone-testing` — домашнее тестирование кетонов (полоски, интерпретация)
- [ ] D11: `dental-disease` — зубы и диабет (связь, анестезия, когда удалять)
- [ ] D12: `glucose-curves-practice` — кривые глюкозы на практике (5 примеров с числами)

### Фаза 10D — Новые статьи (практические)

- [ ] D13: `cost-planning` — бюджет лечения (инсулин, полоски, корм, ветеринар, по регионам)
- [ ] D14: `choosing-vet` — как выбрать ветеринара (red flags, вопросы, специалист vs общая практика)

### Фаза 10E — Расширение существующих статей

Каждую статью расширить: добавить "реальная жизнь" секцию, источники, cross-links:
- [ ] D15: `what-is-diabetes` — первая эмоциональная реакция, что делать на этой неделе
- [ ] D16: `remission` — timeline expectations, частичная ремиссия, мониторинг в ремиссии
- [ ] D17: `diet` — **кормление по требованию** vs строгий график, привередливые кошки
- [ ] D18: `glucose_monitoring` — **гибкий мониторинг** (утренний чек + наблюдение), когда кривые реально нужны
- [ ] D19: `common-mistakes` — "не чекать сахар каждый день — это НЕ ошибка если стабильно", овертритмент
- [ ] D20: `insulin_types` — инсулиновые ручки, биосимиляры (Semglee, Basaglar), цены
- [ ] D21: `neuropathy` — метилкобаламин дозировка, физиотерапия, timeline восстановления
- [ ] D22: `injection-technique` — инсулиновые ручки, когда кот дерётся, управление страхом
- [ ] D23: `hypoglycemia` — лёгкая гипо дома, когда НЕ паниковать
- [ ] D24: `dka` — чеклист факторов риска, что сказать экстренному ветеринару
- [ ] D25: `fructosamine` — практические сценарии интерпретации
- [ ] D26: `pancreatitis-diabetes` — triaditis (IBD+панкреатит+холангит), долгосрочный прогноз

### Фаза 10F — Источники и cross-links

- [ ] D27: Добавить `## Источники` в каждую статью (ISFM 2023, Rand 2012, Cornell, AAHA 2018)
- [ ] D28: `relatedArticleIds` для каждой статьи (навигация между связанными темами)
- [ ] D29: Обновить `readingTimeMinutes` для расширенных статей
- [ ] D30: i18n — новые категории и метки

> **CHECKPOINT 10**: tsc ✅ | все статьи RU+EN | commit

---

## ЭТАП 11: v2.8 Backend + Облако + Аккаунты

> Подключение реального бэкенда. Supabase + Prodamus + Google Sign-In.

### Фаза 11A — Supabase Setup

- [ ] E1: Supabase проект → subscriptions table + RLS policies
- [ ] E2: Edge Function: `check-subscription` (GET по device_id)
- [ ] E3: Edge Function: `prodamus-webhook` (POST, верификация подписи)
- [ ] E4: Заполнить .env: SUPABASE_URL, SUPABASE_ANON_KEY

### Фаза 11B — Prodamus Integration

- [ ] E5: Зарегать Prodamus (самозанятость) → магазин → 2 товара (monthly/yearly)
- [ ] E6: Тест полного флоу: оплата → webhook → проверка статуса
- [ ] E7: Снять шторку "Coming Soon" с PaywallScreen

### Фаза 11C — Google Sign-In + Cloud Backup

- [ ] E8: @react-native-google-signin → Supabase Auth (Web Client ID)
- [ ] E9: Привязка всех данных к аккаунту (user_id в Supabase)
- [ ] E10: Cloud backup: SQLite export → Supabase Storage (шифрованный)
- [ ] E11: Cloud restore: download + decrypt + import
- [ ] E12: Auto-backup при значимых изменениях (>10 новых записей)

### Фаза 11D — Anthropic API через Supabase

- [ ] E13: Edge Function: `ai-proxy` — проксирует запросы к Anthropic (ключ на сервере)
- [ ] E14: Убрать Anthropic key из клиента полностью
- [ ] E15: Rate limiting на сервере (10 req/hour per device)

> **CHECKPOINT 11**: полный тест оплаты + backup/restore | commit

---

## ЭТАП 12: v2.9 UX + DevOps

### UX улучшения
- [ ] F1: Закладки в Энциклопедии (MMKV)
- [ ] F2: Accessibility: accessibilityLabel на все кнопки (15+)
- [ ] F3: Расходы: годовой вид, бюджетный лимит
- [ ] F4: Быстрый доступ к настройкам глюкозы

### DevOps
- [ ] F5: GitHub Actions CI (tsc + lint + test + build)
- [ ] F6: Sentry мониторинг крашей
- [ ] F7: Pre-commit хуки (husky + lint-staged)
- [ ] F8: Расширить Jest покрытие до 70%

### Google Play
- [ ] F9: Описание (короткое + полное, RU/EN)
- [ ] F10: Скриншоты (4+) + Feature graphic (1024x500)
- [ ] F11: Политика конфиденциальности (обновлённая с cloud data)
- [ ] F12: Рейтинг контента

> **CHECKPOINT 12**: CI green | Play Store submission ready

---

## ЭТАП 13: v3.0 Advanced AI/Smart

- [ ] Bluetooth-глюкометр (FreeStyle Libre, Dexcom)
- [ ] Виджет на главный экран (Android/iOS)
- [ ] Расширение на собак, кроликов, ферретов
- [ ] Smart symptom analysis: авто-предложение severity + действий
- [ ] AI-ассистент: голосовой ввод
- [ ] Кабинет ветеринара (просмотр данных по ссылке)

---

## Автопротокол работы

```
Для каждой фазы:
1. Прочитать задачи фазы
2. Запустить параллельных агентов (где возможно)
3. После завершения: npx tsc --noEmit
4. Если ошибки TS — исправить
5. npm test — все тесты зелёные
6. git add <files> && git commit (сообщение по шаблону фазы)
7. Перейти к следующей фазе

При фатальной ошибке:
- НЕ продолжать следующую фазу
- Зафиксировать в памяти точку останова
- Описать проблему для следующей сессии
```

---

## Известные технические решения

| Проблема | Решение |
|---|---|
| MMKV не работает в Expo Go | Expo Dev Client / EAS Build |
| Victory Native peer deps | `--legacy-peer-deps` |
| jest v30 не совместим с jest-expo | Использовать jest v29 |
| babel-preset-expo | Должен быть в devDependencies для Jest |
| @expo/vector-icons | Удалён, заменён на lucide-react-native + Icon.tsx wrapper |
| ThemeContext readonly types | Предсуществующая, косметическая |
| SQLCipher | Убран (OS-level encryption only, no PRAGMA key) |
| MMKV ключ | expo-crypto → expo-secure-store |
| Февраль | `date-fns/endOfMonth` |

---

## Команды

```bash
npx expo start              # Dev
npx expo run:android        # Dev build
npx tsc --noEmit            # Проверка типов
npm run lint                # ESLint
npm run lint:fix            # ESLint autofix
npm run format              # Prettier
npm test                    # Jest (18 тестов)
npm test -- --coverage      # С покрытием
node scripts/reset-db.js    # Сброс БД
eas build --platform android --profile preview   # APK
eas build --platform ios --profile production     # IPA
docker-compose up            # Metro в Docker
```
