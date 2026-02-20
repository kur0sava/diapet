# DiaPet — Master Development Plan

> Последнее обновление: 2026-02-20
> Коммит: df2789b (master)

---

## ПРОГРЕСС

```
[##########----------] v1.0 MVP           ✅ DONE
[##########----------] v1.1 Критические   ✅ DONE
[####################] v1.1 Высокий        ✅ DONE
[____________________] v1.2 Аудит-фиксы   ⬅ ТЕКУЩИЙ ЭТАП
[____________________] v1.3 Средний прио   🔜
[____________________] v1.4 UX фичи        🔜
[____________________] v2.0 DevOps         🔜
[____________________] v2.1 Backend        🔜
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

## ЭТАП 3: v1.2 Аудит-фиксы (КРИТИЧЕСКИЕ БАГИ) ⬅ ТЕКУЩИЙ

> Найдены аудитом 2026-02-20 (3 параллельных агента: структура, логика, UI)
> Протокол: исправить → `npx tsc --noEmit` → `npm test` → git commit

### Фаза 3A — Критические баги БД и логики

- [ ] **FIX-01** Миграция v2: `feeding_logs` → `feedings` (неправильное имя таблицы)
  - Файл: `src/storage/database/migrations.ts`
  - Действие: исправить имя таблицы в миграции
- [ ] **FIX-02** Миграция v3: `photo_uri` уже есть в schema.ts — дублирование ALTER TABLE
  - Файл: `src/storage/database/migrations.ts`
  - Действие: убрать дублирующий ALTER, оставить только новые колонки
- [ ] **FIX-03** `glucoseRepository.update()` не обновляет `insulin_type` (пропущен в SQL)
  - Файл: `src/storage/database/repositories/glucoseRepository.ts`
- [ ] **FIX-04** EditPetScreen не сохраняет изменения расписания в БД
  - Файл: `src/features/pets/screens/EditPetScreen.tsx`
  - Действие: вызывать `scheduleRepository.updateTimes()` в `handleSave()`

> **CHECKPOINT 3A**: `git commit -m "fix: critical DB bugs (migrations, glucose update, schedule persist)"`

### Фаза 3B — Обработка ошибок

- [ ] **FIX-05** petStore.loadPets() глушит ошибки — добавить error state
  - Файл: `src/shared/stores/petStore.ts`
- [ ] **FIX-06** App.tsx: initStorage() без обработки ошибок → бесконечный спиннер
  - Файл: `src/core/App.tsx`
- [ ] **FIX-07** Async без cleanup в useEffect (EditPet, LogGlucose, AddExpense)
  - Действие: добавить `let cancelled = false;` паттерн или AbortController
- [ ] **FIX-08** Пустые catch-блоки — добавить `console.error` + user-facing сообщение
  - Файлы: LogGlucoseScreen, LogInjectionScreen, LogFeedingScreen

> **CHECKPOINT 3B**: `git commit -m "fix: error handling (petStore, initStorage, async cleanup)"`

### Фаза 3C — i18n (40+ строк)

- [ ] **FIX-09** Перенести все hardcoded русские строки в `ru.ts` / `en.ts`
  - GlucoseChart: "Норма 4-9", "Вне нормы"
  - GlucoseListScreen: "Среднее", "Мин", "Макс", "Всего"
  - LogInjectionScreen: "Инъекция инсулина", "Тип инсулина", "Быстрый выбор", "Доза (единицы)"
  - LogFeedingScreen: "Кормление", "Тип корма", "Количество (г)"
  - ScheduleScreen, VetContactScreen, NotificationsScreen: подзаголовки
  - SymptomsListScreen, SymptomDetailScreen: заголовки секций
  - PetProfileScreen, MoreMenuScreen: "Кошка", "МЕНЮ", "Экстренный режим"
  - ExpensesScreen: названия месяцев
  - EmergencyScreen: дисклеймер
  - SettingsScreen: метки тем
  - ArticleListScreen: категории
  - ArticleDetailScreen: "Статья не найдена"
  - AddExpenseScreen: alert-тексты

> **CHECKPOINT 3C**: `git commit -m "feat: complete i18n coverage (40+ strings migrated to locales)"`

### Фаза 3D — UI качество

- [ ] **FIX-10** Заменить `key={index}` на стабильные ключи (5 мест)
  - ArticleDetailScreen (content, TOC), ScheduleScreen, EditPetScreen, QuickActionButton
- [ ] **FIX-11** Добавить loading state в SymptomDetailScreen, PetProfileScreen
- [ ] **FIX-12** Типизировать `useRoute<any>()` → proper ScreenProps (4 файла)
  - LogGlucoseScreen, AddExpenseScreen, ScheduleScreen, VetContactScreen
- [ ] **FIX-13** Лимит симптомов в PDF экспорте (cap 50)
  - Файл: `src/shared/utils/pdfExport.ts`
- [ ] **FIX-14** Удалить console.log из migrations.ts, оставить только ErrorBoundary

> **CHECKPOINT 3D**: `git commit -m "fix: UI quality (keys, loading states, route types, PDF limit)"`

### Фаза 3E — Cleanup

- [ ] **FIX-15** Удалить неиспользуемый `useActivePet` хук или заменить petStore
- [ ] **FIX-16** Удалить / внедрить `ScreenHeader` компонент
- [ ] **FIX-17** Удалить пустые папки (features/*/store/, features/*/components/ и т.д.)
- [ ] **FIX-18** GlucoseChart: импортировать GlucoseReading из `@storage/domain/types` напрямую

> **CHECKPOINT 3E**: `git commit -m "chore: cleanup (unused hooks, empty dirs, direct domain imports)"`
> **АВТОПРОВЕРКА**: `npx tsc --noEmit && npm test && npm run lint`

---

## ЭТАП 4: v1.3 Средний приоритет

> Начинать только после полного завершения ЭТАПА 3

### Фаза 4A — Архитектура

- [ ] C8 React Query staleTime: 5 мин по умолчанию, refetchOnWindowFocus: false
- [ ] D3 Консолидировать стейт питомца (Zustand → React Query)
- [ ] D6 Нормализовать symptom_types (JSON → связующая таблица)
- [ ] D7 Пагинация для glucose/symptoms (cursor-based, limit 50)

> **CHECKPOINT 4A**: commit + tsc + test

### Фаза 4B — Новые фичи

- [ ] E2 Выбор даты/времени при вводе глюкозы (DateTimePicker)
- [ ] E4 Связь симптомов с глюкозой (glucose_reading_id в symptoms)
- [ ] E7 Фильтрация истории глюкозы (дата, уровень, приём пищи)

> **CHECKPOINT 4B**: commit + tsc + test

### Фаза 4C — Перформанс

- [ ] C4 useCallback для обработчиков (AddSymptomScreen, и др.)
- [ ] C5 Стабильные ключи в оставшихся списках
- [ ] C6 useMemo для ExpensesScreen.byCategory
- [ ] C7 Zustand селекторы (если не убран в D3)

> **CHECKPOINT 4C**: commit + tsc + test

---

## ЭТАП 5: v1.4 UX улучшения

- [ ] F1 Закладки в Энциклопедии (MMKV)
- [ ] F2 Оглавление для длинных статей (парсинг ##)
- [ ] F3 Новые статьи (4 шт: домашний замер, гипогликемия, стресс, несколько питомцев)
- [ ] F4 Расходы: годовой вид, бюджетный лимит
- [ ] F5 Accessibility: accessibilityLabel на все кнопки (15+), размер шрифта
- [ ] E6 Быстрый доступ к настройкам глюкозы

> **CHECKPOINT 5**: commit + tsc + test + lint

---

## ЭТАП 6: v2.0 DevOps

- [ ] G3 GitHub Actions CI (tsc + lint + test + build)
- [ ] G5 Sentry мониторинг крашей
- [ ] G6 Удалить AsyncStorage
- [ ] G7 Pre-commit хуки (husky + lint-staged)
- [ ] D4 Barrel exports для фич (index.ts)
- [ ] Расширить Jest покрытие до 70% (repositories, stores)

> **CHECKPOINT 6**: commit + push + CI green

---

## ЭТАП 7: v2.1 Backend + Облако

- [ ] REST API (Fastify + PostgreSQL)
- [ ] JWT аутентификация
- [ ] Облачная синхронизация
- [ ] Резервное копирование (шифрованное)
- [ ] Кабинет ветеринара

---

## ЭТАП 8: v3.0 AI/Smart

- [ ] Анализ трендов (статистика)
- [ ] Предупреждение о риске гипогликемии
- [ ] Bluetooth-глюкометр (FreeStyle Libre, Dexcom)
- [ ] Виджет на главный экран (Android/iOS)
- [ ] Расширение на собак, кроликов, ферретов

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
| @expo/vector-icons types | Предсуществующая проблема, не блокирует |
| ThemeContext readonly types | Предсуществующая, косметическая |
| SQLCipher | `"useSQLCipher": true` в app.json + dev build |
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
