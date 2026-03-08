# DiaPet — Roadmap & Plan

> Обновлён: 2026-03-08

---

## 0. НЕЗАКОММИЧЕННЫЕ ИЗМЕНЕНИЯ (7 файлов)
Доработки после аудита — нужно закоммитить и запушить:
- `App.tsx` — markPurchasesConfigured() guard
- `EmergencyScreen.tsx` — навигация 'More' → 'MoreTab'
- `FeedCalculatorScreen.tsx` — запятая как десятичный разделитель
- `EditPetScreen.tsx` — валидация времени ЧЧ:ММ
- `SettingsScreen.tsx` — сброс → редирект на Onboarding
- `subscriptionStore.ts` — purchasesConfigured guard
- `dateUtils.ts` — защита от NaN

---

## 1. РЕФАКТОРИНГ ПРОЕКТА

### 1.1 Типизация и типобезопасность
- [ ] Исправить 36 pre-existing TS ошибок (`@expo/vector-icons`, `ThemeContext readonly`)
- [ ] Убрать все `as any` кастинги (навигация, компоненты)
- [ ] Добавить strict типы для navigation params (полная типизация стека)
- [ ] Ревизия интерфейсов: убрать дублирование типов между features

### 1.2 Архитектура компонентов
- [ ] Разбить крупные экраны на подкомпоненты (EditPetScreen, DashboardScreen)
- [ ] Извлечь переиспользуемые UI-компоненты в `src/shared/components/` (карточки, инпуты, модалки)
- [ ] Унифицировать стили: вынести общие паттерны в shared styles/theme tokens
- [ ] Проверить и оптимизировать re-renders (React.memo, useMemo, useCallback)

### 1.3 Бизнес-логика и stores
- [ ] Ревизия Zustand stores: единообразные паттерны (actions, selectors)
- [ ] Вынести side effects из компонентов в хуки/сервисы
- [ ] Проверить React Query ключи на уникальность и консистентность
- [ ] Убрать дублирование логики между repositories и stores

### 1.4 Навигация
- [ ] Полная типизация всех навигаторов (убрать `as any`)
- [ ] Ревизия deep link / reset-навигации (SettingsScreen, EmergencyScreen)
- [ ] Проверить edge cases: назад из вложенных экранов, double-tap

### 1.5 Код-гигиена
- [ ] Удалить мёртвый код и неиспользуемые импорты
- [ ] Проверить console.log / console.warn — оставить только нужные
- [ ] CRLF → LF нормализация (.gitattributes)
- [ ] Ревизия зависимостей: удалить неиспользуемые пакеты из package.json

### 1.6 i18n
- [ ] Проверить полноту ключей ru.ts vs en.ts (все ли переведены)
- [ ] Убрать хардкод строк на русском (defaultValue fallbacks)
- [ ] Типизировать i18n ключи (автокомплит)

### 1.7 Тесты (опционально)
- [ ] Unit-тесты для критических утилит (severityCalculator, dateUtils, calculateDryMatter)
- [ ] Snapshot-тесты для ключевых экранов

---

## 2. DAILY DIARY (следующая фича)

### Суть
Пошаговый визард дневника дня: глюкоза → еда → доза → промежуточный чек → следующий цикл → итог.
AI-панель рекомендаций (заглушка rule-based, позже Claude API через Cloudflare Worker).

### Новые файлы (7):
1. `src/features/diary/screens/DailyDiaryScreen.tsx` — визард-контейнер
2. `src/features/diary/components/StepGlucose.tsx`
3. `src/features/diary/components/StepFeeding.tsx`
4. `src/features/diary/components/StepInsulin.tsx`
5. `src/features/diary/components/StepSummary.tsx`
6. `src/features/diary/components/AIRecommendationPanel.tsx`
7. `src/features/diary/utils/diaryAnalyzer.ts` — rule-based анализ

### Изменяемые файлы (4):
- `src/navigation/types.ts` — DailyDiary в HomeStackParamList
- `src/navigation/MainNavigator.tsx` — Screen в HomeStack
- `src/features/dashboard/screens/DashboardScreen.tsx` — кнопка в quick actions
- `src/shared/i18n/locales/ru.ts` + `en.ts` — diary.* ключи

### Порядок:
типы → визард → StepGlucose → StepFeeding → StepInsulin → analyzer → AIPanel → Summary → Dashboard → i18n

---

## 3. ПРИОРИТЕТЫ

| # | Задача | Статус |
|---|--------|--------|
| 0 | Закоммитить + запушить 7 файлов | ⏳ |
| 1 | Рефакторинг (секция 1) | ❌ НЕ НАЧАТ |
| 2 | Daily Diary (секция 2) | ❌ НЕ НАЧАТ |
| 3 | MEDIUM/LOW аудит-фиксы | ❌ отложено |
| 4 | AI через Claude API | ❌ будущее |
