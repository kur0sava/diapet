# DiaPet — Master Development Plan

> Последнее обновление: 2026-02-22
> Коммит: d342db6 (master)

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
[____________________] v1.7 Pre-deploy     ⬅ ТЕКУЩИЙ ЭТАП (Google Play)
[____________________] v1.8 UX фичи        🔜
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
- [x] Button: gradient primary, icon prop (Ionicons)
- [x] EmptyState: iconName + iconColor (Ionicons в цветном круге)
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

> Финальная подготовка перед публикацией

- [ ] app.json: version 1.0.0, versionCode 1, package name
- [ ] Иконка приложения (512x512 adaptive icon)
- [ ] Splash screen
- [ ] Описание для Google Play (короткое + полное, RU/EN)
- [ ] Политика конфиденциальности (offline-only, no data collection)
- [ ] Скриншоты (минимум 4: Dashboard, Glucose, Symptoms, Encyclopedia)
- [ ] Feature graphic (1024x500)
- [ ] AAB production сборка: `eas build --platform android --profile production`
- [ ] Тестирование на реальном устройстве
- [ ] Рейтинг контента (анкета Google Play Console)

> **DEPLOY**: загрузка в Google Play Console → Internal Testing → Production

---

## ЭТАП 5: v1.7 UX улучшения

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

## ЭТАП 7: v2.1 Backend + Облако + Аккаунты

- [ ] REST API (Fastify + PostgreSQL)
- [ ] Авторизация: Google Sign-In + Email/Password (Firebase Auth или Supabase)
- [ ] Привязка всех данных (глюкоза, инъекции, кормления, симптомы, питомцы) к аккаунту
- [ ] Облачная синхронизация (local-first → server sync)
- [ ] Резервное копирование (шифрованное)
- [ ] Политика конфиденциальности (обновлённая, с учётом облака)
- [ ] Кабинет ветеринара

---

## ЭТАП 8: v3.0 AI/Smart

- [ ] Анализ трендов (статистика)
- [ ] Предупреждение о риске гипогликемии
- [ ] Bluetooth-глюкометр (FreeStyle Libre, Dexcom)
- [ ] Виджет на главный экран (Android/iOS)
- [ ] Расширение на собак, кроликов, ферретов
- [ ] Smart symptom analysis: авто-предложение severity + действий

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
