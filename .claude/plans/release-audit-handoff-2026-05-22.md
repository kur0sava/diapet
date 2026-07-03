# DiaPet Release Audit Handoff

Дата: 2026-05-22

## Контекст

Идёт глубокий предрелизный аудит перед сборками для Google Play и RuStore.

Цель:
- вычистить кодовые баги;
- вычистить медицинские и контентные ошибки;
- проверить Android runtime;
- затем прогнать приложение руками на реальном телефоне.

## Что уже сделано

### 1. Исправлены кодовые дефекты

- Исправлен species-regression в графиках:
  - `src/features/dashboard/components/GlucoseChart.tsx`
  - `src/features/prediction/components/PredictionChart.tsx`
  - теперь target range берётся из `speciesConfig`, а не из захардкоженных кошачьих значений.

- Исправлен AI timeout:
  - `src/features/prediction/utils/predictionApiClient.ts`
  - timeout увеличен, чтобы не обрывать prediction раньше proxy.

- Исправлен timezone/day-bucket bug:
  - `src/features/prediction/data/predictionDataCollector.ts`
  - группировка дней переведена с UTC string slicing на локальную дату.

### 2. Исправлены медицинские и контентные ошибки

- Исправлена опасная ошибка по `U-40` / `U-100`:
  - раньше часть текстов утверждала, что при наборе `U-40` инсулина по шкале шприца `U-100` питомец получит в `2.5 раза больше`.
  - правильно: питомец получает примерно в `2.5 раза меньше`.

- Приведены в консистентное состояние тексты по хранению инсулинов:
  - `ProZinc`:
    - хранить в холодильнике после вскрытия;
    - `10 mL vial` использовать в течение `60 days`;
    - `20 mL vial` использовать в течение `80 days`.
  - `Caninsulin / Vetsulin`:
    - срок после первого использования `42 days`;
    - режим хранения после вскрытия зависит от лейбла страны:
      - `Vetsulin` US: холодильник;
      - `Caninsulin` UK/EU: часто допускается хранение до `25°C`.
  - `Lantus`: `28 days`.
  - `Levemir`: `42 days`.

- Исправлена фактическая ошибка по `ProZinc`:
  - в части dog-контента было написано, что он “только для кошек”;
  - актуально: в США у `ProZinc` есть FDA-лейбл и для собак.

- Убраны ложные общие формулировки вида:
  - “любой открытый инсулин хранить в холодильнике”;
  - “дверца холодильника — идеально”.

### 3. Проверки

Проходят:
- `npm run typecheck`
- `npm test -- --runInBand`

Состояние на 2026-05-22:
- `TypeScript`: OK
- `Jest`: `8/8 suites`, `51/51 tests`

## Файлы, которые уже изменены

- `docs/medical/cat-diabetes-practical-guide.md`
- `docs/medical/country-availability.md`
- `docs/medical/dog-diabetes-practical-guide.md`
- `src/features/dashboard/components/GlucoseChart.tsx`
- `src/features/encyclopedia/data/articles/common-mistakes.ts`
- `src/features/encyclopedia/data/articles/dog-insulin.ts`
- `src/features/encyclopedia/data/articles/injection-technique.ts`
- `src/features/encyclopedia/data/articles/insulin_types.ts`
- `src/features/hints/data/aiSystemPrompt.ts`
- `src/features/hints/data/hintsContent.ts`
- `src/features/prediction/components/PredictionChart.tsx`
- `src/features/prediction/data/predictionDataCollector.ts`
- `src/features/prediction/utils/predictionApiClient.ts`
- `src/shared/config/speciesConfig.ts`

Локальные посторонние/служебные изменения:
- `.claude/settings.local.json`
- `.claude/scheduled_tasks.lock`
- `.gradle-user/` — временная локальная папка для попытки обойти Gradle sandbox/cache проблему

## Главный текущий блокер

### Android runtime пока не проверен на устройстве

Проверка native Android остановилась не на коде проекта, а на окружении машины.

Текущее состояние:
- `android/gradle/wrapper/gradle-wrapper.properties` использует:
  - `gradle-8.14.3-bin.zip`
- Gradle wrapper не может скачать distribution из:
  - `https://services.gradle.org/distributions/gradle-8.14.3-bin.zip`

Фактическая ошибка:
- `javax.net.ssl.SSLHandshakeException`
- `PKIX path building failed`
- `unable to find valid certification path to requested target`

Это значит:
- до реального Android build stack проект ещё не дошёл;
- текущий стоппер — Java truststore / SSL окружения, а не подтверждённая поломка приложения.

## Что делать в следующей сессии

Приоритетный план:

1. Поднять Android build/runtime на машине.
   - Снять SSL/truststore blocker для Gradle.
   - Добиться скачивания `gradle-8.14.3`.
   - Повторить `gradlew :app:testDebugUnitTest`.
   - Если Gradle пойдёт дальше, проверить, вернётся ли старый blocker по `io.invertase.gradle.build`.

2. После этого собрать и поставить приложение на телефон.
   - Либо `expo run:android`, либо debug/install через Gradle, в зависимости от состояния native chain.
   - Если есть ADB-устройство, использовать его как основной smoke-test target.

3. Пройти руками критические user flows на телефоне.
   - старт приложения;
   - создание/открытие питомца;
   - логирование глюкозы;
   - логирование инъекции;
   - логирование еды;
   - dashboard / графики;
   - prediction / analyzer;
   - hints / encyclopedia;
   - экспорт / share / print если есть;
   - локализация RU/EN;
   - проверка на переполнение текста и layout issues.

4. Отдельно смотреть:
   - падения на старте;
   - permission flows;
   - broken navigation;
   - пустые состояния;
   - regressions после поднятия версии до `2.5.0`.

## Риски, которые уже сняты

- жёстко захардкоженный кошачий target range в графиках;
- неверная математика `U-40`/`U-100`;
- противоречивые сроки хранения `ProZinc`;
- противоречивые сроки хранения `Caninsulin/Vetsulin`;
- timezone bug в day grouping;
- слишком короткий timeout prediction-клиента.

## Риски, которые ещё не сняты

- реальный Android startup/runtime не подтверждён;
- поведение на живом телефоне не прогнано;
- Play/RuStore readiness нельзя считать подтверждённой до install/run.

## Полезные источники, уже использованные в аудите

- `PROZINC` DailyMed:
  - `10 mL vial within 60 days of first puncture`
  - `20 mL vial within 80 days of first puncture`
  - https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8dbc0e47-8df9-4484-903b-70fdd26f7998

- `Vetsulin` DailyMed:
  - `Use contents within 42 days of first puncture`
  - refrigerated
  - https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=4472644f-edc1-4a4f-8506-888bd8ad895a

- `Caninsulin` MSD UK:
  - broached product may be stored up to `25°C`
  - `Broached Caninsulin lasts up to 42 days`
  - https://www.msd-animal-health-hub.co.uk/Products/Caninsulin

- `Lantus` DailyMed:
  - opened vial `28 days`
  - refrigerated or room temperature under label limits
  - https://dailymed.awsprod.nlm.nih.gov/dailymed/drugInfo.cfm?audience=consumer&setid=6c81d894-67eb-4c68-8af1-8cc220adb6f5

- `Levemir` official:
  - `42 days`
  - https://www.levemir.com/taking-levemir.html

## Коротко для старта следующей сессии

Открыть этот файл и продолжать с пункта:

`Поднять Android build/runtime и запускать на телефоне`
