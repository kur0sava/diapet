# План работ по итогам 3-агентного аудита (2026-07-10)

Источник: параллельный прогон агентов **code-auditor**, **logic-reviewer**, **ux-scenario-tester** по запросу
пользователя (2026-07-10, HEAD `80916a6`). Все три отработали. Крит-крашей/потери данных НЕ найдено
(код зрелый, C001/H002 подтверждены исправленными). Реальные риски сконцентрированы в двух зонах:
**медицинская безопасность ввода инсулина** и **каталог кормов**.

Легенда статусов: ⬜ не начато · 🔄 в работе · ✅ сделано · ⏭ осознанно отложено.

---

## Пересечения (нашли ≥2 агента — максимальный приоритет)
- **Глобальный тумблер единиц глюкозы** — code M1 + ux M6: тап mmol/L↔mg/dL в LogGlucose мгновенно
  и НАВСЕГДА меняет единицу во всём приложении. `regionConfig.ts` прямо называет единицы «medical safety issue».
- **Каталог кормов** — code H1/M4 + logic #1/2/4/5/6: кластер (см. Батч B).
- **Мёртвый `weight_trend` в risk-score** — code + logic #9: фактор всегда даёт константу 30 (нет истории веса);
  скор заявляет 6 факторов, реально работает на 5.

---

## 🔴 БАТЧ A — Медицинская безопасность (ДО РЕЛИЗА, обязательно)

- ✅ **A1 (CRIT). Инлайн-инсулин в LogGlucose обходит проверку двойной дозы.** [сделано 2026-07-10]
  Вынесен общий helper `src/features/glucose/utils/recentInsulinCheck.ts` (`findRecentInsulinDose`, окно 6ч,
  тихий откат при ошибке БД, `excludeGlucoseId` для edit). LogInjection переведён на него; LogGlucose теперь
  вызывает его при непустой дозе перед threshold-проверками (`proceedWithDoseChecks`). tsc 0, tests 110/110, eslint чисто.
  `LogInjectionScreen.handleSave` делает guard «кололи <6ч назад» (`injectionRepository.findNearestTo`
  + `glucoseRepository.findNearestInsulinTo`), а `LogGlucoseScreen.doSave/handleSave` при вводе дозы — НЕТ.
  Самый «безопасный» на вид путь молча пропускает главный медицинский guard → риск повторной дозы → гипогликемия.
  **Фикс:** вынести общий helper (напр. `checkRecentInsulin(petId, now)`), вызвать в LogGlucose при непустой `insulinDose` перед `doSave`.
  Файлы: `src/features/glucose/screens/LogGlucoseScreen.tsx`, `LogInjectionScreen.tsx`.

- ✅ **A2 (CRIT). «Позвонить ветеринару» на Emergency-экране — тупик без сохранённого врача.** [сделано 2026-07-10]
  Мёртвый алерт заменён на actionable: кнопка «Найти клинику рядом» → `Linking.openURL` на maps-поиск
  (`google.com/maps/search`, локализованный запрос `emergency.vetSearchQuery`). Deep-link на EditPet НЕ делал —
  EditPet во вложенном MoreStack, cross-nav из root-модалки хрупок и противоречит явному замыслу «не уводить из
  инструкций в момент паники»; maps открывается отдельным приложением, инструкции остаются. Лейбл
  `tapToAddVet`→`tapToFindVet`. Новые ключи ru+en (noVetContactDesc/findClinic/vetSearchQuery/tapToFindVet).

- ✅ **A3 (HIGH). Вес только в кг — US/UK вводят фунты в поле кг.** [сделано 2026-07-10, полный kg/lb]
  Инфра: `src/shared/utils/weight.ts` (kgToLb/lbToKg/kgToInput/inputToKg/convertInput, getWeightUnit/setWeightUnit —
  дефолт из региона), `WeightUnitToggle` компонент, `StorageKeys.WEIGHT_UNIT`, `weightUnit` в RegionDefaults
  (только US='lb', остальные 'kg'), `common.lb` ru+en. Интеграция в 3 экрана (AddPet/EditPet/PetInfo): переключатель
  kg/lb, конверсия на toggle/save, валидация против maxWeightKg в кг-эквиваленте, хранение каноничных кг. EditPet в
  kg-режиме сохраняет полную точность (без drift). PetInfo пишет weightUnit в ONBOARDING_DRAFT. Тесты weight.test.ts (5),
  обновлён regionConfig.test.ts. tsc 0, jest 115/116, eslint чисто.

- ✅ **A4 (HIGH). Экстремальная глюкоза сохраняется ДО подтверждения.** [сделано 2026-07-10]
  handleSave разбит: значение в emergency-зоне (< emergencyLow / > emergencyHigh, species-aware) → confirm-before-save
  (`glucose.extremeValueTitle/Body`, эхо введённого значения+единицы) ПЕРЕД записью. Продолжение вынесено в
  `continueAfterValueChecks` (доза+A1+threshold). Post-save emergency-алерт в doSave (first-aid guide) сохранён для реальных значений.

- ✅ **A5 (HIGH/пересечение). Глобальный тумблер единиц в LogGlucose.** [сделано 2026-07-10]
  Убрана строка `storage.set(StorageKeys.GLUCOSE_UNIT, u)` из onPress тумблера — теперь он ЛОКАЛЬНЫЙ для экрана
  (конверсия значения остаётся). Глобальная единица меняется только из Settings. Тап «прикинуть конверсию» больше
  не флипает единицу в dashboard/list/PDF.

- ⬜ **A6 (MED). Dog-конфиг: `normalLow`/`emergencyLow` (3.3) vs `targetLow`/ranges (4.4) — два «нижних нормы».**
  `checkEmergencyThresholds` фаерит гипо при <3.3 = ниже заявленной нормы. Разные пути классифицируют по-разному.
  **Фикс:** согласовать; hypo-emergency-порог логичнее ниже терапевтического `targetLow`, а не равен полу референс-интервала.
  Файл: `speciesConfig.ts:378-400`, `safetyGuard.ts:111`.

- ✅ **A6 (MED). Dog-конфиг: `normalLow`/`emergencyLow` (3.3) vs `targetLow`/ranges (4.4).** [сделано 2026-07-10, через diapet-medical-auditor]
  Медагент подтвердил: `emergencyLow==normalLow==3.3` схлопывало средний ярус «гипогликемия, нужно лечение» в нулевую
  ширину (below_target.min==emergencyLow), ломая 3-уровневую модель aiSystemPrompt. Правка: `emergencyLow 3.3→2.8`
  (50 mg/dL — тот же порог нейрогликопении, что у кошки; Nelson&Couto, Feldman&Nelson), ranges severe_low/low граница
  `2.2→2.8` для зеркала кошки. `normalLow/targetLow/severeLow` не тронуты (клинически корректны). Эскалация теперь:
  severeLow(2.2)<emergencyLow(2.8)<normalLow(3.3)<targetLow(4.4). Источники в комментарии кода.

- ⏭ **A7 (MED). Собака без веса: доза 18 IU проходит по confirmable, `absoluteMax=20` высок для тоя.**
  Обсудить: снижать `absoluteMax` для unknown-weight собак или требовать вес. (Осознанный trade-off в коде — решить отдельно.)
  Файл: `speciesConfig.ts:545-557`.

---

## 🟠 БАТЧ B — Каталог кормов (перед релизом желательно; безопасность контента)

- ⬜ **B1 (HIGH). Собачий вердикт по углеводам в FeedCalculator противоречит каталогу.**
  `calculateDryMatter` считает вердикт ТОЛЬКО по `carbsDM` для всех видов; каталог для собак использует
  `getFoodVerdict` (жир+клетчатка, углеводы игнор). Одна Hill's w/d canine → «good» в гиде, «bad» в калькуляторе.
  **Фикс:** species-ветка в `calculateDryMatter`, переиспользовать общую verdict-функцию (жир+клетчатка для собак).
  Файлы: `feedCalculator/utils/calculateDryMatter.ts:64-71`, `diabeticFoods.ts:getFoodVerdict`.

- ⬜ **B2 (HIGH). Кошачий порог «good» расходится: калькулятор <10 vs каталог ≤7.**
  Корм 7.5–9% DM → «good» в калькуляторе, «acceptable» в каталоге (реальные записи: Sheba, Catz, GranataPet, Wellness Core).
  **Фикс:** одна константа (`carbsIdealPercent`/`carbsDMGood`) на оба call-site.

- ⬜ **B3 (HIGH). Notes (вкл. safety-caveats) видны только RU.**
  `FeedGuideRegionScreen.tsx:248` рендерит notes только при `isRu`; все не-RU регионы = `language:'en'` → англ. рынок
  НЕ видит клинические предупреждения («Monge ~35% углеводов, НЕ рекомендован» и т.п.).
  **Фикс:** `notes` в форме `{ru,en}` (как `feedingTips`), убрать `isRu`-гейт.

- ⬜ **B4 (HIGH). Deprecated `getFoodsByRegion` протекает санкционный бренд в RU.**
  `getFoodsByRegion` имеет GLOBAL-фолбэк → `hills-md-mx ['MX','GLOBAL']` всплыл бы в RU (нарушение санкц-правила).
  Живой экран спасается тем, что использует `foodInRegion` (без GLOBAL-фолбэка). Две семантики для одного концепта.
  **Фикс:** удалить/перенаправить `getFoodsByRegion` на `foodInRegion`, определить семантику GLOBAL один раз.
  Файлы: `foodCatalog.ts:181-185`, `diabeticFoods.ts:1423-1426,964`.

- ⬜ **B5 (MED). FeedGuideAlternativesScreen species/region-blind.**
  `ALTERNATIVE_FOODS` без фильтра вида/региона, углеводная шкала вердикта → собачник видит кошачьи рекомендации.
  **Фикс:** фильтровать по активному виду и региону (как FeedGuideRegionScreen).
  Файл: `FeedGuideAlternativesScreen.tsx:29-32`.

- ⬜ **B6 (MED). Фоновое обновление каталога не доходит до смонтированного экрана региона.**
  Мемо экрана привязано к локальному `catalogVersion` (бампается только pull-to-refresh); стартовый `refreshFoodCatalog()`
  мутирует module-level `current`, но уже открытый экран показывает стейл до ручного pull.
  **Фикс:** подписка/версия из `foodCatalog.ts`, рефреш бампает её, потребители перечитывают.
  Файлы: `FeedGuideRegionScreen.tsx:70-105`, `App.tsx:76`.

- ⬜ **B7 (HIGH, инфра). Remote-каталог без проверки подлинности.**
  Медконтент с `raw.githubusercontent.com` по plain `fetch`; `validateManifest` проверяет только структуру, не содержимое/подпись.
  MITM/злонамеренный PR → подмена углеводов, «плохой» корм показан «good», оседает в MMKV.
  **Фикс:** подпись манифеста (Ed25519 против bundled-ключа) или hash-allowlist + жёсткие числовые границы (protein/fat/carbs/fiber 0–100, kcal в разумных пределах). Усилить дисклеймер (advisory).
  Файл: `foodCatalog.ts:71-120,230-273`.
  ⚠️ Требует изменения в repo `diapet-foods-data` (генерация подписи при публикации манифеста).

---

## 🟡 БАТЧ C — Полировка UX и логики (можно после релиза)

- ⬜ **C1 (MED/пересечение). `PREMIUM_MODE='hidden'` — вечная блокировка без выхода.**
  В `hidden` монетизация off, но лимиты (canAddPet<1, PDF off, история off) активны → фичи заперты за покупкой, которой нет.
  Soft-launch держится ТОЛЬКО на EAS-переопределении `unlocked`; любой dev/билд без `extra.premiumMode` молча запирается.
  **Фикс:** гейтить лимиты на `isMonetizationEnabled()` (billing) → `hidden` = «всё доступно, premium-UI скрыт».
  Файлы: `runtimeConfig.ts:12-30`, `useSubscription.ts:18-35`.

- ⬜ **C2 (HIGH). Нет черновика в экранах логирования.**
  Онбординг пишет `ONBOARDING_DRAFT`, а более частые LogGlucose/LogInjection держат всё в React-стейте → звонок/OOM-kill = потеря ввода.
  **Фикс:** лёгкий MMKV-черновик (value/dose/time) на change, восстановление на mount, очистка на успешном save.

- ⬜ **C3 (HIGH). EMERGENCY-баннер висит 24ч без dismiss.**
  Порог по 24ч-окну, не по состоянию; тройная экспозиция (save-alert + баннер + SOS) → alarm fatigue.
  **Фикс:** сделать баннер закрываемым/acknowledge и/или авто-сброс при последующем in-range чтении.
  Файл: `DashboardScreen.tsx`.

- ⬜ **C4 (HIGH). Регион молча автодетектится и спрятан в Settings.**
  RU-юзер на en-US телефоне получает mg/dL + USD + US-каталог без шанса поправить в онбординге.
  **Фикс:** шаг подтверждения региона в онбординге (pre-fill из locale), т.к. он задаёт дефолт единицы глюкозы.
  Файлы: `regionConfig.ts:initRegionOnFirstRun`, онбординг.

- ⬜ **C5 (MED). Дрейф точности глюкозы при edit без изменений.**
  Поле pre-fill `toFixed(1)`, хранилище 2 знака; пересохранение неизменного 6.49 → 6.5.
  **Фикс:** сохранять полную точность в поле edit или пропускать write при равенстве в пределах толеранса.
  Файл: `LogGlucoseScreen.tsx:139,219-234`.

- ⬜ **C6 (MED). FeedCalculator требует все 5 макросов.**
  Нет ash на этикетке → результат не показывается без пояснения.
  **Фикс:** частичное guidance, дефолт ash с оговоркой, подсветка недостающего поля.

- ⬜ **C7 (MED). Коллизия long-press-delete и tap-edit в GlucoseList.**
  Чуть длинный тап → delete-confirm; плюс дублирующая корзина.
  **Фикс:** убрать long-press-delete (оставить корзину) или swipe-to-delete с undo.

- ⬜ **C8 (MED). Смена питомца в процессе ввода — abort без пути восстановления.**
  `petChangedDuringEntry` отказывает в save без указания как вернуться.
  **Фикс:** назвать исходного питомца в алерте + «Вернуться к <pet> и сохранить».

- ⬜ **C9 (MED). Доза без типа инсулина в LogGlucose (асимметрия с LogInjection).**
  **Фикс:** prefill типа из `activePet.insulinType`, требовать при непустой дозе.

- ⬜ **C10 (MED). Онбординг-дефолты инъекция+кормление в одно время 08:00/20:00.**
  Два накладывающихся уведомления. **Фикс:** сместить дефолт кормления или подать как явно-редактируемые примеры.

- ⬜ **C11 (MED). `no_readings`/trendEngine на неявном ASC-контракте сортировки.**
  Сейчас верно (репозиторий ASC), но без guard. **Фикс:** `Math.max(...map(recordedAt))` вместо позиционного доступа, либо assert на границе.
  Файлы: `smartAlerts.ts:193-195`, `trendEngine.ts:215-219`.

- ⏭ **C12. weight_trend risk-фактор инертен** (нет истории веса) — дать вес-историю ИЛИ выкинуть фактор и перенормировать веса. Известный отложенный gap.

---

## 🟢 БАТЧ D — Low (косметика/харденинг)

- ⬜ D1. `severeLow` определён, но severe-hypo tier не реализован (только severe-hyper) — добавить tier или убрать поле. `safetyGuard.ts:97-131`.
- ⬜ D2. `user_version` ставится вне транзакции миграции (сейчас безопасно — идемпотентно; хрупко для будущих не-идемпотентных). `migrations.ts:192-201`.
- ⬜ D3. `markFired` на wall-clock `new Date()` вместо injected `now` — cooldown нетестируем. `smartAlerts.ts:116`.
- ⬜ D4. Контраст emergency-дисклеймера (white 70% на красном). `EmergencyScreen.tsx`.
- ⬜ D5. Emoji как единственный сигнификатор (пол/вид/флаги) — accessibility-лейблы.
- ⬜ D6. Нет тоста подтверждения смены региона/единиц. `SettingsScreen.tsx`.
- ⬜ D7. Нет индикатора прогресса онбординга (6 экранов). `OnboardingNavigator.tsx`.
- ⬜ D8. Устаревший dev-facing RU-summary противоречит санкц-данным. `diabeticFoods.ts:1500-1512`.
- ⬜ D9. Dead-типы алертов (`weight_loss`) + косметический зелёный `50%` бейдж на собачьем корме. `smartAlerts.ts:17-24`, `FeedGuideRegionScreen.tsx:189-201`.
- ⬜ D10. Untagged-хинты показываются всем видам (структурное условие исторической протечки кот→собака) — дефолт вида или обязательное поле. `useHintEngine.ts:119-126`.

---

## Порядок выполнения (рекомендация)
1. **Батч A** (медбезопасность) — обязательно до релиза. Начать с A1, A2.
2. **Батч B** (каталог кормов) — B1-B6 в коде; B7 требует repo diapet-foods-data.
3. **Батч C** (полировка) — C1 (premium-guard) важен для dev-стабильности, остальное — по времени.
4. **Батч D** — по возможности.

## Процесс
- Работать по-русски, автономно; коммитить после логических этапов (commit message через Write-файл + `git commit -F`, heredoc ломает кириллицу).
- После каждого этапа: `npx tsc --noEmit` (0), `npx jest`, при необходимости fuzz.
- Медчувствительные правки каталога (B1-B4, B7) — прогон через `diapet-medical-auditor` только по явной просьбе ([[feedback_no_agents_for_audit]]).
- ⚠️ Правки требуют пересборки vc17 перед выгрузкой (артефакты в MEMORY.md устареют).

## Что агенты подтвердили как исправное (не трогать)
Конверсии единиц централизованы (`MGDL_PER_MMOLL=18.0156`), DMB-гварды, композитные `(ts,id)` курсоры во всех 4 репозиториях,
C001/H002 фиксы, тройное подтверждение delete-pet, защита double-tap save, блок будущих дат, softened risk-score для новичков,
species-aware дашборд/TIR, откат orphan-питомца при сбое расписания.
