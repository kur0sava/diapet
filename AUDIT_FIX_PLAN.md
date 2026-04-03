# Audit Fix Plan (Project-Wide)

Дата: 2026-04-03  
Статус: `completed` (2026-04-03)  
Коммиты: `233476c` (codex DB fix), `b314a46` (10 audit fixes, 19 files)

## 1. Цель

Закрыть найденные дефекты (функциональные, архитектурные, UI и безопасность), минимизировать регрессии и вернуть проект к чистому `lint/typecheck/test` с подтвержденной работоспособностью ключевых сценариев.

## 2. Приоритеты

## P0 (срочно, перед релизом)

1. Subscription/backend bypass risk
- Файлы:
  - `src/features/subscription/hooks/useSubscription.ts`
  - `src/shared/stores/subscriptionStore.ts`
  - `app.config.ts`
- План:
  - Разделить `dev` и `prod` поведение явно.
  - В `prod` запрещать auto-Pro fallback при пустых `SUPABASE_URL/SUPABASE_ANON_KEY`.
  - Добавить hard-check на startup + лог/экран конфигурационной ошибки.
  - Проверить все Pro-gated экраны (`Paywall`, `AdvancedAnalytics`, `AiAssistant`, PDF export).
- Проверка:
  - Unit/integration: сценарии с пустым и заполненным backend config.
  - Ручной smoke: free user не получает Pro-фичи без backend.

2. `useUnsavedChangesGuard` (react-hooks/refs error)
- Файл:
  - `src/shared/hooks/useUnsavedChangesGuard.ts`
- План:
  - Убрать запись `enabledRef.current` из render.
  - Синхронизировать ref через `useEffect`.
  - Оставить `disableGuard()` для синхронного отключения перед `goBack()`.
  - Проверить все потребители хука.
- Затронутые экраны:
  - `AddSymptom`, `Assessment`, `LogInjection`, `LogGlucose`, `LogFeeding`, `EditPet`, `AddExpense`.
- Проверка:
  - Навигация назад с/без изменений, без ложных алертов.

3. `FoodSelector` section-header bug (FlatList/immutability)
- Файл:
  - `src/features/glucose/components/FoodSelector.tsx`
- План:
  - Убрать `lastCategory` мутацию в `renderItem`.
  - Перейти на `SectionList` или предрасчитанные маркеры заголовков.
  - Добавить тест на корректный порядок и отображение заголовков.
- Проверка:
  - Скролл вверх/вниз, поиск, смена фильтра, отсутствие “прыгающих” заголовков.

## P1 (высокий)

4. TOC scroll offset в статье
- Файл:
  - `src/features/encyclopedia/screens/ArticleDetailScreen.tsx`
- План:
  - Исправить вычисление позиции для `scrollToHeading`.
  - Мерить абсолютный Y (или мерить offset `articleContent`) вместо “магического” `+140`.
  - Протестировать на длинных статьях и разных языках.
- Проверка:
  - Тап по каждому пункту TOC приводит к правильному заголовку.

5. Language reactivity в `FoodSelector`
- Файл:
  - `src/features/glucose/components/FoodSelector.tsx`
- План:
  - Обновлять `allFoods` при смене `i18n.language`.
  - Проверить лейблы категорий и название корма после runtime switch языка.
- Проверка:
  - Смена языка в настройках -> список и категории обновились без перезахода.

6. `usePrediction` stale data при смене питомца
- Файл:
  - `src/features/prediction/hooks/usePrediction.ts`
- План:
  - Добавить `useEffect` на `petId` для подгрузки кэша нового питомца и сброса старого состояния.
  - Проверить, что `error/loading/countdown` не перетекают между питомцами.
- Проверка:
  - Быстрое переключение pets, правильный prediction у каждого.

7. Side-effects внутри `useMemo` (`useAnalyzer` -> `generateSmartAlerts`)
- Файлы:
  - `src/features/analyzer/hooks/useAnalyzer.ts`
  - `src/features/analyzer/engine/smartAlerts.ts`
- План:
  - Разделить чистый расчёт кандидата алерта и запись в storage.
  - Выполнять `markFired` в `useEffect`/action-слое, не во время memo/render.
- Проверка:
  - Отсутствие повторных/пропущенных алертов при ререндерах.

## P2 (средний/техдолг)

8. Exhaustive deps warnings (`disableGuard`, `prediction`, etc.)
- Файлы:
  - `AddSymptomScreen`, `LogGlucoseScreen`, `LogInjectionScreen`, `LogFeedingScreen`, `usePrediction`, `ArticleDetailScreen` и др.
- План:
  - Нормализовать зависимости `useCallback/useMemo`.
  - Где нужно, стабилизировать функции через `useRef/useEvent` pattern.
- Проверка:
  - `eslint` без hook warnings.

9. Notification restore robustness
- Файл:
  - `src/shared/hooks/useNotifications.ts`
- План:
  - Гарантировать наличие Android channels при `restoreScheduleNotifications`.
  - Добавить fallback/guard на старые Android состояния.
- Проверка:
  - После апдейта/перезапуска уведомления продолжают приходить.

10. Lint hygiene cleanup
- План:
  - Удалить неиспользуемые импорты/переменные.
  - Убрать пустые `catch {}` или логировать явно (где уместно).
  - Свести `eslint-disable` к минимуму.
- Проверка:
  - `npm run lint` полностью зеленый.

## 3. Безопасность (обязательно)

1. Исключить клиентское хранение боевых AI ключей
- Файлы:
  - `app.config.ts`
  - `src/features/hints/utils/aiClient.ts`
- План:
  - Перенести AI вызовы на backend (Edge Function), клиенту оставить только безопасный endpoint.
  - Проверить, что `ANTHROPIC_API_KEY` не попадает в публичный `expoConfig.extra` в production.

2. Проверка секретов в локальной среде
- Проверить `.env`, CI secrets и release pipeline на утечки.

## 4. Порядок выполнения (батчи)

Batch A (P0):
1. subscription/backend gate
2. useUnsavedChangesGuard
3. FoodSelector render/sections

Batch B (P1):
1. TOC scroll correctness
2. usePrediction pet switch
3. analyzer alert side-effects
4. language reactivity in FoodSelector

Batch C (P2 + hygiene):
1. hook deps + lint cleanup
2. notifications restore hardening
3. security hardening AI key flow

## 5. Acceptance Criteria

1. `npm run lint` -> 0 errors / 0 warnings.  
2. `npm run typecheck` -> pass.  
3. `npm test -- --runInBand` -> pass.  
4. Manual smoke:
- Add symptom (new/edit, with/without glucose link, with photo).
- Glucose/Injection/Feeding create + delete.
- TOC jump in encyclopedia.
- Switch pet in analytics/prediction.
- Pro gating behavior under configured/non-configured backend.

## 6. Артефакты после фикса

1. Changelog секция “Audit Fixes”.  
2. Короткий regression checklist для QA/модерации.  
3. Отчет по security-hardening ключей AI.
