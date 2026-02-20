# DiaPet — Development Roadmap

> Последнее обновление: 2026-02-20
> Источник: Полный аудит проекта (5 агентов — Code Quality, Architecture, UX/Product, Performance+Security, DevOps)

---

## MVP v1.0 ✅ (реализовано)

- [x] Онбординг (язык, питомец, расписание, ветеринар, уведомления)
- [x] Главный экран с мини-графиком глюкозы
- [x] Дневник глюкозы (ввод, история, редактирование, статистика)
- [x] Лог инъекций
- [x] Симптом-трекер с фото
- [x] Экстренный режим (гипо/гипергликемия + звонок ветеринару)
- [x] Энциклопедия (5 статей, offline-first)
- [x] Калькулятор расходов
- [x] Профиль питомца
- [x] Тёмная/светлая тема
- [x] Локализация RU/EN
- [x] SQLite база данных (9 таблиц, WAL, индексы)
- [x] MMKV быстрое хранение
- [x] Push-уведомления (инъекции, кормление)
- [x] Feature-based архитектура

---

## v1.1 — Критические исправления 🔴
> Цель: устранить баги и уязвимости перед первым релизом

### Блок A — Безопасность (приоритет: КРИТИЧЕСКИЙ)

#### A1. Включить SQLCipher — шифрование базы данных
- **Проблема:** `app.json` → `"useSQLCipher": false`. Вся медицинская база (глюкоза, инсулин, симптомы) хранится открытым текстом на устройстве. При ADB backup данные легко извлечь.
- **Файлы:** `app.json:49-54`
- **Решение:**
  ```json
  ["expo-sqlite", { "enableFTS": true, "useSQLCipher": true }]
  ```
- **Эффект:** Шифрование всей SQLite базы на уровне нативного кода.

#### A2. Убрать захардкоженный ключ MMKV
- **Проблема:** `src/storage/mmkv/storage.ts:5` → `encryptionKey: 'diapet-secret-key'` — ключ виден в исходниках, любой может извлечь его из APK.
- **Решение:** Генерировать уникальный ключ для каждого устройства и хранить в `expo-secure-store`:
  ```typescript
  import * as SecureStore from 'expo-secure-store';
  import { randomUUID } from 'expo-crypto';

  async function getMmkvKey(): Promise<string> {
    let key = await SecureStore.getItemAsync('mmkv_key');
    if (!key) {
      key = randomUUID();
      await SecureStore.setItemAsync('mmkv_key', key);
    }
    return key;
  }
  ```
- **Зависимости:** Добавить `expo-secure-store`, `expo-crypto`

#### A3. Ограничить загрузку фотографий
- **Проблема:** `AddSymptomScreen.tsx:51-67` — нет ограничения размера и количества фото. Пользователь может выбрать 20 файлов по 15 MB.
- **Решение:**
  ```typescript
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    selectionLimit: 5,
    quality: 0.6,
    exif: false,
  });
  // Валидация размера после выбора
  const validAssets = result.assets.filter(a => (a.fileSize ?? 0) < 5_000_000);
  ```

#### A4. Убрать .env из git
- **Проблема:** `.env` не добавлен в `.gitignore`, попадёт в репозиторий.
- **Решение:** Добавить в `.gitignore`:
  ```
  .env
  .env.local
  secrets/
  google-services.json
  ```

---

### Блок B — Критические баги (приоритет: ВЫСОКИЙ)

#### B1. Добавить ErrorBoundary
- **Проблема:** `src/core/App.tsx` — нет обработчика ошибок. Любой необработанный exception крашит всё приложение без возможности восстановления.
- **Решение:** Создать `src/shared/components/ErrorBoundary.tsx` и обернуть `<AppContent>`:
  ```tsx
  export default function App() {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }
  ```

#### B2. Починить кнопку "Кормление" на Dashboard
- **Проблема:** `DashboardScreen.tsx` — `QuickActionButton` для кормления имеет пустой `onPress`. Пользователь нажимает, ничего не происходит.
- **Решение:** Реализовать экран `LogFeedingScreen` и подключить его, либо временно убрать кнопку до реализации.

#### B3. Исправить useEffect зависимости (стейл данные)
- **Проблема:**
  - `LogGlucoseScreen.tsx:43-55` — `useEffect` не перезапускается при смене `editId`
  - `AddExpenseScreen.tsx:34-43` — то же самое
- **Решение:** Добавить `editId` в dependency array:
  ```typescript
  useEffect(() => { loadData(); }, [editId]); // было: []
  ```

#### B4. Убрать non-null assertion без guard
- **Проблема:** `GlucoseListScreen.tsx:28` → `glucoseRepository.findByPetId(activePet!.id)` — упадёт при null.
- **Решение:**
  ```typescript
  queryFn: () => activePet ? glucoseRepository.findByPetId(activePet.id) : Promise.resolve([]),
  ```

#### B5. Исправить расчёт дат в ExpensesRepository
- **Проблема:** `expenseRepository.ts:37` → `end = '${year}-${month}-31'` — февраль не имеет 31 дня, SQL вернёт некорректные результаты.
- **Решение:** Использовать `date-fns/endOfMonth`:
  ```typescript
  import { endOfMonth, format } from 'date-fns';
  const end = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
  ```

---

### Блок C — Качество кода (приоритет: СРЕДНИЙ)

#### C1. Заменить `useNavigation<any>()` на типизированные хуки
- **Проблема:** `MainNavigator.tsx:126`, `DashboardScreen.tsx:27`, `LogGlucoseScreen.tsx:25` — полная потеря типобезопасности навигации.
- **Решение:** Создать `src/navigation/hooks.ts`:
  ```typescript
  export const useAppNavigation = () => useNavigation<RootNavigationProp>();
  export const useHomeNavigation = () => useNavigation<HomeStackNavigationProp>();
  ```

#### C2. Вынести повторяющийся заголовок экрана в компонент
- **Проблема:** Одинаковый паттерн (кнопка "Назад" + заголовок) повторяется в 5+ экранах.
- **Решение:** Создать `src/shared/components/ui/ScreenHeader.tsx`

#### C3. Перенести хардкоженные строки в i18n
- **Проблема:** Сотни строк вида `"Быстрые действия"`, `"Последняя инъекция"`, `"История"` разбросаны по компонентам вместо `t('key')`.
- **Файлы:** `DashboardScreen.tsx:160,189`, `ExpensesScreen.tsx:98,112` и др.

#### C4. Добавить useCallback для обработчиков
- **Проблема:** `AddSymptomScreen.tsx:41-59` — `toggleType`, `pickPhoto`, `takePhoto` пересоздаются при каждом рендере.
- **Решение:** Обернуть в `useCallback` с правильными зависимостями.

#### C5. Заменить индексные ключи в списках
- **Проблема:** `ArticleListScreen.tsx:91`, `ArticleDetailScreen.tsx:25-49`, `AddSymptomScreen.tsx:170` используют `key={i}`.
- **Решение:** Использовать стабильные идентификаторы: `key={article.id}`, `key={`${type}-${i}`}`

#### C6. Добавить useMemo для дорогих вычислений
- **Проблема:** `ExpensesScreen.tsx:35-38` — `byCategory` пересчитывается при каждом рендере.
- **Решение:**
  ```typescript
  const byCategory = useMemo(
    () => expenses.reduce<Record<ExpenseCategory, number>>(...),
    [expenses]
  );
  ```

#### C7. Добавить Zustand селекторы
- **Проблема:** `DashboardScreen.tsx:30` → `const { activePet } = usePetStore()` — компонент ре-рендерится при любом изменении стора.
- **Решение:** `const activePet = usePetStore(s => s.activePet);`

#### C8. Добавить React Query конфигурацию
- **Проблема:** Все `useQuery` без `staleTime` — данные рефетчатся при каждом фокусе экрана.
- **Решение:**
  ```typescript
  {
    staleTime: 5 * 60 * 1000,       // 5 минут
    gcTime: 10 * 60 * 1000,         // 10 минут
    refetchOnWindowFocus: false,
    retry: 1,
  }
  ```

---

## v1.2 — Архитектурный рефакторинг 🏗️
> Цель: устранить нарушения слоёв и подготовить к масштабированию

### Блок D — Нарушения архитектурных слоёв (приоритет: ВЫСОКИЙ)

#### D1. Создать `@storage/domain/types.ts` — единый источник типов данных
- **Проблема:** `petRepository.ts`, `glucoseRepository.ts` и др. импортируют типы из `@features/*/types.ts`. Storage-слой не должен зависеть от Features.
- **Текущее (неправильно):**
  ```
  src/storage/repositories/ → импортирует → src/features/pets/types.ts
  ```
- **Целевое состояние:**
  ```
  src/storage/domain/types.ts   ← Pet, GlucoseReading, Symptom, Expense...
  src/features/pets/types.ts    ← только UI-модели (FormValues, ViewState...)
  src/storage/repositories/     ← импортирует из @storage/domain
  ```

#### D2. Убрать зависимость Shared от Features
- **Проблема:** `src/shared/components/ui/GlucoseValueBadge.tsx` импортирует `getGlucoseColor`, `getGlucoseLevel` из `@features/glucose/types`. Shared не может зависеть от Features.
- **Решение:** Перенести утилиты глюкозы в `src/shared/domain/glucose.ts`

#### D3. Консолидировать стейт питомца
- **Проблема:** Три источника одних и тех же данных — Zustand (`activePet`), MMKV (`ACTIVE_PET_ID`), React Query (запросы с petId).
- **Решение (вариант А — рекомендуется):** Убрать Zustand, использовать React Query как единый источник:
  ```typescript
  // Вместо usePetStore
  export function useActivePet() {
    const activePetId = storage.getString(StorageKeys.ACTIVE_PET_ID);
    return useQuery({
      queryKey: ['pet', 'active', activePetId],
      queryFn: () => activePetId ? petRepository.findById(activePetId) : null,
      staleTime: Infinity,
    });
  }
  ```

#### D4. Создать `index.ts` barrel-файлы для фич
- **Проблема:** Фичи импортируются напрямую по пути (`@features/glucose/screens/LogGlucoseScreen`), нет контроля над публичным API.
- **Решение:** Добавить `src/features/glucose/index.ts`:
  ```typescript
  export { LogGlucoseScreen } from './screens/LogGlucoseScreen';
  export { GlucoseListScreen } from './screens/GlucoseListScreen';
  export type { GlucoseReading } from './types';
  ```

#### D5. Добавить систему миграций базы данных
- **Проблема:** `database.ts` просто вызывает `CREATE TABLE IF NOT EXISTS` — нет версионирования. При добавлении новой колонки нет способа запустить `ALTER TABLE` для существующих пользователей.
- **Решение:** Создать `src/storage/database/migrations.ts`:
  ```typescript
  const MIGRATIONS: Record<number, string[]> = {
    1: [CREATE_TABLES_SQL],
    2: ['ALTER TABLE pets ADD COLUMN photo_uri TEXT'],
    3: ['CREATE TABLE feeding_logs (...)'],
  };

  export async function runMigrations(db: SQLiteDatabase): Promise<void> {
    const [{ user_version }] = await db.getAllAsync<{ user_version: number }>(
      'PRAGMA user_version'
    );
    for (const version of Object.keys(MIGRATIONS).map(Number).sort()) {
      if (version > user_version) {
        for (const sql of MIGRATIONS[version]) {
          await db.execAsync(sql);
        }
        await db.execAsync(`PRAGMA user_version = ${version}`);
      }
    }
  }
  ```

#### D6. Нормализовать хранение типов симптомов
- **Проблема:** `symptoms.symptom_types` хранится как JSON-строка `'["polyuria","lethargy"]'`. Нельзя делать запросы по типу симптома через SQL.
- **Решение:** Создать связующую таблицу:
  ```sql
  CREATE TABLE IF NOT EXISTS symptom_type_entries (
    id TEXT PRIMARY KEY NOT NULL,
    symptom_id TEXT NOT NULL,
    type TEXT NOT NULL,
    FOREIGN KEY (symptom_id) REFERENCES symptoms(id) ON DELETE CASCADE
  );
  CREATE INDEX idx_symptom_type ON symptom_type_entries(symptom_id, type);
  ```

#### D7. Добавить пагинацию для медицинских записей
- **Проблема:** `glucoseRepository.findByPetId()` загружает ВСЕ записи в память. При 1000+ записях это критично.
- **Решение:** Cursor-based пагинация:
  ```typescript
  async findByPetId(
    petId: string,
    limit = 50,
    before?: string  // ISO timestamp cursor
  ): Promise<GlucoseReading[]>
  ```

---

## v1.3 — UX и функциональные улучшения 🎯
> Цель: дать реальному владельцу диабетического кота всё необходимое

### Блок E — Критически важные для пользователя фичи

#### E1. Индикатор "Время с последнего замера"
- **Проблема:** Нет визуального сигнала, если глюкоза не измерялась >12 часов — это медицински опасно.
- **Решение:** Добавить на Dashboard бейдж:
  - Зелёный: < 6 часов
  - Жёлтый: 6–12 часов
  - Красный: > 12 часов с текстом "Не измерено 18ч"

#### E2. Выбор времени при вводе глюкозы
- **Проблема:** `LogGlucoseScreen` всегда ставит текущее время. Хозяин забыл записать утренний замер.
- **Решение:** Добавить `DateTimePicker` для ввода фактического времени замера (по умолчанию — текущее).

#### E3. Экспорт данных для ветеринара (PDF)
- **Пакеты:** `expo-print` (уже установлен), `expo-sharing` (уже установлен)
- **Содержимое PDF:**
  - Имя питомца, порода, дата постановки диагноза
  - Таблица показателей глюкозы за выбранный период
  - График глюкозы
  - Последние 10 инъекций
  - Симптомы за период
- **Точки входа:** GlucoseListScreen (FAB "Экспорт") и PetProfileScreen

#### E4. Связать симптомы с показателями глюкозы
- **Проблема:** Нельзя ответить "При каком уровне глюкозы кот был вялым?"
- **Решение:**
  - При добавлении симптома автоматически подтягивать последний показатель глюкозы
  - Добавить колонку `glucose_reading_id` в таблицу `symptoms`
  - В `SymptomDetailScreen` показывать связанный показатель

#### E5. Лог кормлений (реализовать кнопку)
- **Проблема:** Кнопка "Кормление" на Dashboard есть, но не работает.
- **Решение:** Создать `LogFeedingScreen` и таблицу `feedings`:
  ```sql
  CREATE TABLE IF NOT EXISTS feedings (
    id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL,
    fed_at TEXT NOT NULL,
    food_type TEXT,
    amount_grams REAL,
    notes TEXT,
    created_at TEXT NOT NULL
  );
  ```

#### E6. Быстрый доступ к настройкам
- **Проблема:** Чтобы поменять единицу измерения глюкозы (mmol ↔ mg/dL) — нужно 4 тапа.
- **Решение:** Вынести переключатель единиц в GlucoseListScreen header или добавить иконку шестерёнки в таб-бар.

#### E7. Фильтрация и сортировка истории
- **Проблема:** Нельзя посмотреть "только утренние замеры" или "только гипогликемии".
- **Решение:** Добавить фильтр в `GlucoseListScreen`:
  - По диапазону дат
  - По уровню (норма / высокий / низкий)
  - По приёму пищи (натощак / после еды)

#### E8. Тренд глюкозы на Dashboard
- **Решение:** Добавить стрелку-индикатор рядом с последним значением:
  - ↓ `trending_down`: последние 3 замера снижаются
  - ↑ `trending_up`: растут
  - → `stable`: отклонение < 15%

### Блок F — Улучшения UX

#### F1. Закладки в Энциклопедии
- MMKV: `StorageKeys.BOOKMARKED_ARTICLES = 'bookmarked_articles'`
- Иконка закладки в `ArticleDetailScreen` header

#### F2. Оглавление для длинных статей
- Распарсить `##` заголовки из markdown
- Показать кликабельное оглавление в начале статьи

#### F3. Добавить недостающие статьи в Энциклопедию
- "Как измерять глюкоза дома" (практическое руководство)
- "Первая помощь при гипогликемии" (мёд, корм без инсулина)
- "Влияние стресса на уровень глюкозы"
- "Несколько питомцев: как не перепутать инсулин"

#### F4. Счётчик расходов — расширение
- Добавить категории: тест-полоски, ланцеты, одноразовые шприцы
- Годовой вид (`ExpensesScreen` — переключатель Месяц/Год)
- Бюджетный лимит с предупреждением

#### F5. Настройки доступности
- Размер шрифта (Маленький / Средний / Большой)
- Добавить `accessibilityLabel` на все кнопки-иконки

---

## v2.0 — DevOps и инфраструктура ⚙️
> Цель: настроить продакшн-пайплайн, тесты и мониторинг

### Блок G — CI/CD и качество кода

#### G1. Настроить ESLint + Prettier
```bash
npm install -D eslint eslint-config-expo @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser prettier eslint-config-prettier
```
- Создать `.eslintrc.json` с правилом `react-hooks/exhaustive-deps: warn`
- Создать `.prettierrc`
- Добавить в `package.json`: `"lint": "eslint src --ext .ts,.tsx"`

#### G2. Настроить Jest + React Native Testing Library
```bash
npm install -D jest @testing-library/react-native jest-expo
```
- Минимальный порог покрытия: 70% для storage/ и shared/
- Обязательные тесты:
  - Репозитории (glucoseRepository, expenseRepository)
  - Утилиты (dateUtils, glucose domain)
  - Zustand store (petStore)

#### G3. GitHub Actions CI Pipeline
Создать `.github/workflows/ci.yml`:
```yaml
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx tsc --noEmit          # TypeScript
      - run: npm run lint               # ESLint
      - run: npm run test -- --coverage # Jest
  build:
    needs: check
    runs-on: ubuntu-latest
    steps:
      - run: eas build --platform android --profile preview --non-interactive
```

#### G4. Настроить iOS EAS сборку
- **Проблема:** `eas.json` полностью отсутствует iOS конфиг для production/preview.
- Добавить в `eas.json`:
  ```json
  "production": {
    "android": { "buildType": "app-bundle", "versionCode": 1 },
    "ios": { "distribution": "store", "buildNumber": "1" }
  }
  ```
- Добавить в `app.json`:
  ```json
  "ios": {
    "bundleIdentifier": "com.diapet.app",
    "buildNumber": "1",
    "minimumIosVersion": "14.0"
  },
  "android": {
    "package": "com.diapet.app",
    "versionCode": 1,
    "minSdkVersion": 24
  }
  ```

#### G5. Добавить Sentry (мониторинг крашей)
```bash
npm install @sentry/react-native
```
```typescript
// src/core/App.tsx
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.APP_ENV,
  tracesSampleRate: 0.2,
});
```

#### G6. Удалить лишнюю зависимость AsyncStorage
- **Проблема:** `@react-native-async-storage/async-storage` не используется — MMKV уже есть.
```bash
npm uninstall @react-native-async-storage/async-storage
```

#### G7. Добавить pre-commit хуки
```bash
npm install -D husky lint-staged
npx husky init
```
`.husky/pre-commit`:
```bash
npx lint-staged
npx tsc --noEmit
```

---

## v2.1 — Backend и облако ☁️

### Инфраструктура
- [ ] REST API (Node.js / Fastify + PostgreSQL)
- [ ] JWT аутентификация
- [ ] Облачная синхронизация данных между устройствами
- [ ] Резервное копирование в облако (шифрованное)
- [ ] Кабинет ветеринара — просмотр данных питомца онлайн

### Монетизация (Freemium)
- [ ] Бесплатно: 1 питомец, история 3 месяца, базовые функции
- [ ] Premium: неограниченная история, PDF-экспорт, синхронизация, несколько питомцев
- [ ] Vet Plan: кабинет ветеринара (SaaS)

---

## v3.0 — Умные функции 🤖

- [ ] Анализ трендов глюкозы (статистические паттерны)
- [ ] Предупреждение о риске гипогликемии на основе истории
- [ ] Интеграция с Bluetooth-глюкометром (FreeStyle Libre, Dexcom)
- [ ] Виджет на главный экран (Android/iOS)
- [ ] Расширение на другие виды: собаки, кролики, ферреты

---

## Трекер: что делать первым

```
КРИТИЧНО (делать немедленно):
  A1 ✅ SQLCipher
  A2 ✅ MMKV ключ
  B1 ✅ ErrorBoundary
  B2 ✅ Кормление
  B3 ✅ useEffect deps
  B4 ✅ Non-null assertion
  B5 ✅ Дата февраль

ВЫСОКИЙ приоритет (до публикации):
  A3   Валидация фото
  A4   .env в gitignore
  C1   Типизация навигации
  D1   storage/domain/types.ts
  D2   Убрать shared → features зависимость
  D5   Миграции БД
  E1   Индикатор времени замера
  E3   PDF экспорт
  G1   ESLint + Prettier
  G2   Jest тесты
  G4   iOS EAS конфиг

СРЕДНИЙ приоритет (v1.3):
  C2   ScreenHeader компонент
  C3   i18n строки
  D3   Консолидация стейта
  D6   Нормализация symptom_types
  D7   Пагинация
  E2   Время при вводе глюкозы
  E4   Симптом ↔ Глюкоза
  E5   Лог кормлений
  E7   Фильтрация истории
  E8   Тренд глюкозы
  G3   GitHub Actions CI
  G5   Sentry
  G6   Удалить AsyncStorage

НИЗКИЙ приоритет (v2.0+):
  F1-F5  UX улучшения
  G7     Pre-commit хуки
  E6     Быстрый доступ к настройкам
  D4     Barrel exports
```

---

## Известные технические решения

| Проблема | Решение |
|---|---|
| MMKV не работает в Expo Go | Использовать Expo Dev Client или EAS Build |
| Victory Native peer deps | Установлен с `--legacy-peer-deps` (проверить с React 19) |
| DateTimePicker на Android | `@react-native-community/datetimepicker` |
| Docker для мобильной разработки | Только Metro сервер, сборка через EAS Build |
| Несколько питомцев | DB schema готова, UI ограничен до 1 питомца в MVP |
| SQLCipher в Expo | Требует `"useSQLCipher": true` в app.json + dev build |
| MMKV ключ шифрования | Генерировать через expo-crypto, хранить в expo-secure-store |
| Февраль 28/29 дней | Использовать `date-fns/endOfMonth` вместо хардкоженного -31 |

---

## Команды быстрого старта

```bash
# Dev (Expo Go — без MMKV/SQLite)
npx expo start

# Dev build (с нативными модулями)
npx expo run:android
npx expo run:ios          # macOS only

# Сброс кэша
node scripts/reset-db.js

# Проверка типов
npx tsc --noEmit

# Линтер (после настройки)
npm run lint

# Тесты (после настройки)
npm run test

# Production Android APK
eas build --platform android --profile preview

# Production Android AAB (Google Play)
eas build --platform android --profile production

# Production iOS (App Store)
eas build --platform ios --profile production

# Docker Metro
docker-compose up
```
