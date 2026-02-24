# DiaPet — Bug Fix Plan (v1.5)

> Составлен: 2026-02-24 после полного аудита проекта
> Источник: параллельный аудит (data layer + screens/navigation)
> Статус: НЕ ИСПРАВЛЕНО — план для следующей сессии

---

## CRITICAL (2)

### BUG-01 — Race condition в `getDatabase()` — двойная инициализация
**Файл:** `src/storage/database/database.ts:7-12`
**Описание:** Если два вызова `getDatabase()` одновременно (напр. `loadPets` + экран), оба пройдут `if (db) return db`, оба откроют БД и запустят миграции параллельно. Возможны дубли индексов и гонка на `user_version`.
**Фикс:** Добавить mutex/promise кеш — первый вызов создаёт Promise, последующие ждут его.

### BUG-02 — Orphan routes: GlucoseDetail + GlucoseChart
**Файл:** `src/navigation/types.ts:35-37`, `src/navigation/MainNavigator.tsx:74-76`
**Описание:** `GlucoseStackParamList` объявляет `GlucoseDetail` и `GlucoseChart`, но в `GlucoseStackNavigator` зарегистрированы только `GlucoseList` и `LogGlucose`. Навигация к этим экранам вызовет runtime crash.
**Фикс:** Либо зарегистрировать экраны, либо удалить из типов (если экраны не используются).

---

## HIGH (8)

### BUG-03 — symptomRepository.create/update не атомарны
**Файл:** `src/storage/database/repositories/symptomRepository.ts:10-25`
**Описание:** INSERT в `symptoms` + цикл INSERT в `symptom_entry_types` без транзакции. Краш между ними = orphan запись.
**Фикс:** Обернуть в `db.withTransactionAsync()`.

### BUG-04 — glucoseRepository.update() молча игнорирует обновления
**Файл:** `src/storage/database/repositories/glucoseRepository.ts:119-128`
**Описание:** Весь UPDATE внутри `if (dto.value !== undefined && dto.unit)`. Обновление `notes`, `mealRelation` без `value+unit` = молчаливый no-op.
**Фикс:** Разделить UPDATE на независимые поля.

### BUG-05 — expenseRepository.update() не обновляет currency
**Файл:** `src/storage/database/repositories/expenseRepository.ts:61-64`
**Описание:** `currency` отсутствует в SET clause UPDATE.
**Фикс:** Добавить `currency=COALESCE(?,currency)`.

### BUG-06 — petRepository.update() не может очистить nullable поля
**Файл:** `src/storage/database/repositories/petRepository.ts:42-49`
**Описание:** `COALESCE(?, field)` не различает `null` (очистить) и `undefined` (не менять).
**Фикс:** Динамическое построение SET clause только для переданных полей.

### BUG-07 — feedings таблица: разные схемы для свежих и обновлённых установок
**Файл:** `src/storage/database/schema.ts:71-80`, `migrations.ts:22-33`
**Описание:** Свежая установка: `fed_at` без DEFAULT, нет индекса. Обновлённая: с DEFAULT и индексом.
**Фикс:** Синхронизировать schema.ts с результатом всех миграций.

### BUG-08 — Dashboard "следующий укол/кормление" не сортирует по времени
**Файл:** `src/features/dashboard/screens/DashboardScreen.tsx:106-109`
**Описание:** Всегда берёт `[0]` из массива без сортировки и без логики "следующий после текущего времени".
**Фикс:** Найти ближайшее будущее время; если все прошли — показать первое завтрашнее.

### BUG-09 — LogGlucose: переключение unit при редактировании сбрасывает значение
**Файл:** `src/features/glucose/screens/LogGlucoseScreen.tsx:51-66`
**Описание:** `useEffect` зависит от `[editId, unit]`. Смена unit → перезагрузка из БД → потеря пользовательских правок.
**Фикс:** Убрать `unit` из зависимостей; конвертировать текущее значение в state.

### BUG-10 — invalidateQueries: injection vs injections — stale list
**Файл:** `src/features/glucose/screens/LogInjectionScreen.tsx:50`, `InjectionListScreen.tsx:29`
**Описание:** `invalidateQueries(['injection'])` не инвалидирует `['injections', petId]` (другой prefix). Список инъекций показывает stale данные.
**Фикс:** Унифицировать query keys или добавить `exact: false` с общим prefix.

---

## MEDIUM (12)

### BUG-11 — PRAGMA foreign_keys в batch SQL — не гарантировано
**Файл:** `src/storage/database/schema.ts:6`, `database.ts:20`
**Описание:** `PRAGMA foreign_keys = ON` в multi-statement `execAsync`. Должно быть отдельным `runAsync`.

### BUG-12 — MMKV: i18n может создать незашифрованный инстанс
**Файл:** `src/storage/mmkv/storage.ts:10-24`
**Описание:** Если `storage` используется до `initStorage()` (import-time в i18n), создаётся unencrypted MMKV.

### BUG-13 — petStore.refreshActivePet() без error handling
**Файл:** `src/shared/stores/petStore.ts:42-47`
**Описание:** Нет try/catch; deleted pet → stale activePet (не обнуляется).

### BUG-14 — scheduleRepository.daysOfWeek: crash на NULL
**Файл:** `src/storage/database/repositories/scheduleRepository.ts:64`
**Описание:** `row.days_of_week.split(',')` → TypeError если NULL; `map(Number)` → NaN на мусоре.

### BUG-15 — Асимметричное округление mmol↔mg/dL
**Файл:** `src/storage/database/repositories/glucoseRepository.ts:5,13`
**Описание:** `mmolToMgdl` округляет (`Math.round`), обратное преобразование нет. Потеря до 0.03 mmol/L.

### BUG-16 — FeedGuideRegion: param `region: string` вместо `Region`
**Файл:** `src/navigation/types.ts:52`, `FeedGuideRegionScreen.tsx:39`
**Описание:** Cast `as Region` без валидации. Невалидный регион → raw i18n ключ как заголовок.

### BUG-17 — FeedGuideAlternatives: type 'both' рендерится как 'dry'
**Файл:** `src/features/encyclopedia/screens/FeedGuideAlternativesScreen.tsx:73-76`
**Описание:** Нет обработки `type === 'both'` — показывает оранжевый "dry" badge.

### BUG-18 — Hardcoded "кг" вместо t('common.kg') в 3 экранах
**Файлы:** `MoreMenuScreen.tsx:35`, `EditPetScreen.tsx:88`, `PetProfileScreen.tsx:66`
**Описание:** В английском режиме показывается кириллица "кг".

### BUG-19 — SymptomDetail: бесконечный spinner если запись удалена
**Файл:** `src/features/symptoms/screens/SymptomDetailScreen.tsx:26-32`
**Описание:** Нет различия между "загрузка" и "не найдено".

### BUG-20 — Glucose фильтр: union несмежных диапазонов невозможен
**Файл:** `src/features/glucose/screens/GlucoseListScreen.tsx:83-101`
**Описание:** low+veryHigh без normal/high → min/max подход даёт все значения.

### BUG-21 — FeedGuideNatural: нет empty state при фильтре без результатов
**Файл:** `src/features/encyclopedia/screens/FeedGuideNaturalScreen.tsx:44-53`
**Описание:** Секции supplements/transition/menu всегда показываются; нет сообщения "ничего не найдено".

### BUG-22 — AddSymptomScreen игнорирует editId
**Файл:** `src/features/symptoms/screens/AddSymptomScreen.tsx:35`
**Описание:** Параметр editId передаётся но не читается. Кнопка "Редактировать" открывает пустую форму.

---

## LOW (8)

### BUG-23 — Миграции без транзакций
**Файл:** `src/storage/database/migrations.ts:87-99`

### BUG-24 — storageUtils.setObject не ловит ошибки stringify
**Файл:** `src/storage/mmkv/storage.ts:51-53`

### BUG-25 — Hill's w/d carbsDM:34 без предупреждения в данных
**Файл:** `src/features/encyclopedia/data/diabeticFoods.ts:188-212`

### BUG-26 — naturalFoods: chicken breast kcal 110 (cooked vs raw неоднозначность)
**Файл:** `src/features/encyclopedia/data/naturalFoods.ts:56`

### BUG-27 — FeedGuideNatural: `.split(' ')[0]` для сокращения i18n строк
**Файл:** `src/features/encyclopedia/screens/FeedGuideNaturalScreen.tsx:82-90`

### BUG-28 — FeedGuideRegion: empty text не показывается если есть магазины но нет кормов
**Файл:** `src/features/encyclopedia/screens/FeedGuideRegionScreen.tsx:232`

### BUG-29 — ArticleListScreen: `as any` cast при навигации на FeedGuide
**Файл:** `src/features/encyclopedia/screens/ArticleListScreen.tsx:138`

### BUG-30 — SymptomsListScreen использует ключ `glucose.noSymptoms` вместо symptoms.*
**Файл:** `src/features/symptoms/screens/SymptomsListScreen.tsx:115`

### BUG-31 — Неиспользуемые i18n ключи: assessment.emergencyLink, feedGuide.selectRegion, feedGuide.noPrescription
**Файлы:** `ru.ts`, `en.ts`

### BUG-32 — Accessibility: нет accessibilityLabel на icon-only кнопках (все экраны)

---

## Порядок исправления (рекомендация)

1. **CRITICAL** (BUG-01, BUG-02) — первыми
2. **HIGH data layer** (BUG-03..07) — атомарность, корректность БД
3. **HIGH screens** (BUG-08..10) — UX-баги
4. **MEDIUM** — по приоритету
5. **LOW** — по возможности

> После исправления: `npx tsc --noEmit` + `npm test` + ручное тестирование
