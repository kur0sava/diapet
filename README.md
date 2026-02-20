# DiaPet -- Управление диабетом у кошек

Мобильное приложение для iOS и Android для управления сахарным диабетом у кошек.

## Технологический стек

| Технология | Версия | Назначение |
|---|---|---|
| React Native | 0.81 | Мобильный фреймворк |
| Expo SDK | 54 | Инструменты сборки, нативные модули |
| TypeScript | 5.9 | Типизация |
| Zustand | 5 | Управление состоянием |
| React Query | 5 | Асинхронные данные |
| expo-sqlite | 16 | Локальная база данных |
| react-native-mmkv | 3 | Быстрое key-value хранение |
| React Navigation | 6 | Навигация |
| Victory Native | 36 | Графики |

## Быстрый старт

### Требования
- Node.js 18+
- npm или yarn
- Expo Go (для тестирования на устройстве)
- Android Studio (для Android эмулятора)
- Xcode 14+ (для iOS, только macOS)

### Установка

```bash
# 1. Клонировать репозиторий
git clone <repo-url>
cd DIAPET

# 2. Установить зависимости
npm install

# 3. Запустить Metro bundler
npm start
```

## Запуск на Android

### Через Expo Go (без сборки)
```bash
# Запуск с QR-кодом
npx expo start

# Отсканировать QR в приложении Expo Go на Android
```

### Android Emulator
```bash
# 1. Запустить эмулятор в Android Studio (AVD Manager)

# 2. Запустить приложение
npx expo start --android
# или
npm run android
```

### Production APK
```bash
# Через EAS Build (рекомендуется)
npm install -g eas-cli
eas login
eas build --platform android --profile preview

# Локально (требует Android SDK + Gradle)
npx expo run:android --variant release
```

## Запуск на iOS

### Через Expo Go (без сборки)
```bash
npx expo start
# Отсканировать QR в приложении Camera на iPhone
```

### iOS Simulator (только macOS)
```bash
npx expo start --ios
# или
npm run ios
```

### Production IPA
```bash
# Через EAS Build
eas build --platform ios --profile production

# Локально (требует macOS + Xcode)
npx expo run:ios --configuration Release
```

## Docker (Metro сервер)

> Docker предоставляет только среду разработки для JS bundling.
> Для реальной сборки APK/IPA используйте EAS Build или локальные инструменты.

```bash
# Запустить Metro сервер в Docker
docker-compose up

# Metro доступен на http://localhost:8081
# Подключите эмулятор к Metro: adb reverse tcp:8081 tcp:8081
```

## Структура проекта

```
DiaPet/
├── src/
│   ├── app/               # App.tsx -- точка входа
│   ├── features/          # Feature-based модули
│   │   ├── onboarding/    # Онбординг
│   │   ├── dashboard/     # Главный экран
│   │   ├── glucose/       # Дневник глюкозы + инъекции
│   │   ├── symptoms/      # Симптом-трекер
│   │   ├── emergency/     # Экстренный режим
│   │   ├── encyclopedia/  # Статьи (offline)
│   │   ├── expenses/      # Калькулятор расходов
│   │   └── pets/          # Профиль + настройки
│   ├── shared/            # Переиспользуемые модули
│   │   ├── components/    # UI компоненты
│   │   ├── hooks/         # React hooks
│   │   ├── stores/        # Zustand stores
│   │   ├── theme/         # Тема (dark/light)
│   │   ├── i18n/          # Локализация (RU/EN)
│   │   └── utils/         # Утилиты
│   ├── storage/
│   │   ├── database/      # SQLite (expo-sqlite)
│   │   └── mmkv/          # MMKV быстрое хранение
│   └── navigation/        # React Navigation
├── assets/                # Изображения, шрифты
├── .env                   # Переменные окружения
├── app.json               # Expo конфигурация
├── eas.json               # EAS Build конфигурация
├── babel.config.js        # Babel + path aliases
├── tsconfig.json          # TypeScript конфигурация
└── Dockerfile             # Docker (Metro сервер)
```

## Архитектура базы данных

```sql
pets                  -- Профиль питомца
injection_schedule    -- Расписание инъекций
feeding_schedule      -- Расписание кормлений
glucose_readings      -- Измерения глюкозы
injections            -- Лог инъекций
feedings              -- Лог кормлений
symptoms              -- Симптомы
expenses              -- Расходы
vet_contacts          -- Контакт ветеринара
```

## Переменные окружения

Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

## Сборка production APK (пошагово)

```bash
# 1. Установить EAS CLI
npm install -g eas-cli

# 2. Войти в аккаунт Expo
eas login

# 3. Настроить проект
eas init

# 4. Собрать APK (для тестирования)
eas build --platform android --profile preview

# 5. Скачать APK с dashboard.expo.dev
# 6. Установить: adb install app.apk
```

## Известные ограничения MVP

- Нет облачной синхронизации (планируется в v2)
- Один питомец на аккаунт (расширяется в будущем)
- Экспорт PDF требует expo-print (реализован)
- MMKV требует development build (не работает в Expo Go)

## Лицензия

MIT
