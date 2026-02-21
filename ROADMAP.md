# DiaPet — Master Development Plan

> Последнее обновление: 2026-02-21
> Коммит: 74748eb (master)

---

## ПРОГРЕСС

```
[####################] v1.0 MVP           ✅ DONE
[####################] v1.1 Критические   ✅ DONE
[####################] v1.1 Высокий        ✅ DONE
[####################] v1.2 Аудит-фиксы   ✅ DONE
[____________________] v1.3 Средний прио   ⬅ ТЕКУЩИЙ ЭТАП
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
- [ ] E8 Определение стадии диабета (анкета по симптомам → стадия + рекомендации)
- [ ] E9 Калькулятор корма (БЖУ → сухое вещество углеводов → допуск/запрет)

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
