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

- ✅ **B1 (HIGH). Собачий вердикт по углеводам в FeedCalculator противоречит каталогу.** [сделано 2026-07-10]
  `calculateDryMatter` теперь принимает `species` и вычисляет headline-вердикт через `getFoodVerdict` (единый источник
  истины: собаки — жир+клетчатка, кошки — carbs). `thresholds` остались только для вторичных чипов protein/fat/fiber.
  FeedCalculatorScreen передаёт species активного питомца. Hill's w/d canine больше не расходится между гидом и калькулятором.

- ✅ **B2 (HIGH). Кошачий порог «good» расходится: калькулятор <10 vs каталог ≤7.** [сделано 2026-07-10]
  Закрыто тем же фиксом B1: калькулятор теперь использует `getFoodVerdict` (кошки ≤7 `carbsIdealPercent`), а не локальную
  константу `carbsDMGood=10`. Один источник истины на оба call-site.

- ✅ **B3 (HIGH). Notes (вкл. safety-caveats) видны только RU.** [сделано 2026-07-10, перевод через diapet-medical-auditor]
  Тип `notes: string` → `LocalizedNote = string | {ru,en}` в `DiabeticCatFood`; helper `localizedNote(note, isRu)` (fallback
  en→ru, legacy-строки проходят как ru); рендер в FeedGuideRegionScreen без `isRu`-гейта. Медагент перевёл ВСЕ 45 notes на EN
  дословно сохранив клинические caveats («NOT recommended», % DM, ISFM-лимиты, санкц-предупреждения); 3 MX-записи были на
  испанском → сохранены как ru + переведены. Тесты localizedNote + «все bundled-notes = {ru,en}». Англ. рынок теперь видит
  safety-caveats. ⚠️ remote-манифест в diapet-foods-data всё ещё со string-notes — обновится при регенерации (см. follow-up).

- ✅ **B4 (HIGH). Deprecated `getFoodsByRegion` протекает санкционный бренд в RU.** [сделано 2026-07-10]
  `getFoodsByRegion` выровнен на семантику `foodInRegion` (region match + DE→EU, БЕЗ GLOBAL-фолбэка). Проверено: GLOBAL-only
  кормов нет (все GLOBAL-теги идут с явными регионами) → ничего не исчезло, но Hill's m/d ['MX','GLOBAL'] больше не всплыл бы в RU.

- ✅ **B5 (MED). FeedGuideAlternativesScreen species/region-blind.** [сделано 2026-07-10]
  Фильтр по species активного питомца (untagged = 'cat', это кошачий OTC-список) + региону (DE→EU). Пустое состояние
  `feedGuide.alternativesEmpty` (ru+en) для собак/пустого региона. Собачник больше не видит кошачьи углеводные рекомендации.

- ✅ **B6 (MED). Фоновое обновление каталога не доходит до смонтированного экрана региона.** [сделано 2026-07-10]
  В `foodCatalog.ts` добавлены `catalogVersion` + `subscribeFoodCatalog()`; `doRefresh` при 'updated' зовёт `bumpCatalogVersion()`.
  FeedGuideRegionScreen подписывается в `useEffect` и бампает локальную версию (pull-to-refresh теперь тоже идёт через подписку —
  единый путь). Стартовый background-refresh, резолвящийся после монтирования экрана, теперь обновляет список.

- 🔶 **B7 (HIGH, инфра). Remote-каталог без проверки подлинности.** [частично 2026-07-10]
  ✅ Сделано: жёсткие числовые границы в `isValidFood` (proteinDM/fatDM/carbsDM/fiberDM 0–100, kcalPerKg ≤8000) — битый/
  вредоносный манифест не подсунет неправдоподобный макрос (напр. carbsDM:2 на высокоуглеводном → ложный «good»). Тест B7.
  ⏸ ОТЛОЖЕНО (нужно участие пользователя): подпись Ed25519 против bundled-публичного ключа. Требует (1) новой крипто-
  зависимости — в проекте только `expo-crypto` без асимметрии (кандидаты `@noble/ed25519`/`tweetnacl`, нужно одобрение деп);
  (2) генерации ключей + приватный ключ у мейнтейнера; (3) правок генератора манифеста в repo `diapet-foods-data` (подписывать
  при публикации) + верификации подписи в `validateManifest`. Файл: `foodCatalog.ts`.

---

## 🟡 БАТЧ C — Полировка UX и логики (можно после релиза)

- ✅ **C1 (MED/пересечение). `PREMIUM_MODE='hidden'` — вечная блокировка без выхода.** [сделано 2026-07-10]
  `useSubscription`: `effectivePro = !monetizationEnabled || isPaidPro || trialActive` — не-billing (hidden/unlocked) = всё
  доступно; billing = гейтинг по покупке/триалу. Любой билд без `extra.premiumMode` (дефолт hidden) больше не запирается. AI
  остаётся отдельно скрыт через isAiFeature*. Убран мёртвый `featuresUnlocked`.

- ⬜ **C2 (HIGH). Нет черновика в экранах логирования.**
  Онбординг пишет `ONBOARDING_DRAFT`, а более частые LogGlucose/LogInjection держат всё в React-стейте → звонок/OOM-kill = потеря ввода.
  **Фикс:** лёгкий MMKV-черновик (value/dose/time) на change, восстановление на mount, очистка на успешном save.

- ⬜ **C3 (HIGH). EMERGENCY-баннер висит 24ч без dismiss.**
  Порог по 24ч-окну, не по состоянию; тройная экспозиция (save-alert + баннер + SOS) → alarm fatigue.
  **Фикс:** сделать баннер закрываемым/acknowledge и/или авто-сброс при последующем in-range чтении.
  Файл: `DashboardScreen.tsx`.

- ✅ **C4 (HIGH). Регион молча автодетектится и спрятан в Settings.** [сделано 2026-07-10]
  В LanguageScreen онбординга добавлен селектор региона (pre-fill из locale через getAppRegion). При смене —
  setAppRegion + применение дефолтов GLUCOSE_UNIT/WEIGHT_UNIT (онбординг не завершён → это ещё дефолты, безопасно).
  RU-юзер на en-US телефоне теперь видит и правит регион до того, как он молча задаст mg/dL. Файл: `LanguageScreen.tsx`.

- ✅ **C5 (MED). Дрейф точности глюкозы при edit без изменений.** [сделано 2026-07-10]
  Edit-prefill mmol теперь `parseFloat(valueMmol.toFixed(2)).toString()` (сохраняет 2-знач. точность хранилища) вместо
  `toFixed(1)` → пересохранение неизменного 6.49 больше не даёт 6.5. Файл: `LogGlucoseScreen.tsx`.

- ⬜ **C6 (MED). FeedCalculator требует все 5 макросов.**
  Нет ash на этикетке → результат не показывается без пояснения.
  **Фикс:** частичное guidance, дефолт ash с оговоркой, подсветка недостающего поля.

- ⬜ **C7 (MED). Коллизия long-press-delete и tap-edit в GlucoseList.**
  Чуть длинный тап → delete-confirm; плюс дублирующая корзина.
  **Фикс:** убрать long-press-delete (оставить корзину) или swipe-to-delete с undo.

- ⬜ **C8 (MED). Смена питомца в процессе ввода — abort без пути восстановления.**
  `petChangedDuringEntry` отказывает в save без указания как вернуться.
  **Фикс:** назвать исходного питомца в алерте + «Вернуться к <pet> и сохранить».

- ✅ **C9 (MED). Доза без типа инсулина в LogGlucose (асимметрия с LogInjection).** [сделано 2026-07-10]
  Тип уже prefill из `activePet.insulinType`; добавлено требование типа при непустой дозе в `continueAfterValueChecks`
  (`injection.typeError`, как в LogInjection). Файл: `LogGlucoseScreen.tsx`.

- ⬜ **C10 (MED). Онбординг-дефолты инъекция+кормление в одно время 08:00/20:00.**
  Два накладывающихся уведомления. **Фикс:** сместить дефолт кормления или подать как явно-редактируемые примеры.

- ✅ **C11 (MED). `no_readings`/trendEngine на неявном ASC-контракте сортировки.** [сделано 2026-07-10]
  smartAlerts: latest ts через `reduce(Math.max, Date.parse)` вместо `readings[len-1]`; trendEngine: earliest ts через
  `reduce(Math.min)` вместо `readings[0]`. Корректно при любом порядке, без spread-стек-риска. Убран мёртвый импорт
  `getSpeciesConfig` в trendEngine. Файлы: `smartAlerts.ts`, `trendEngine.ts`.

- ⏭ **C12. weight_trend risk-фактор инертен** (нет истории веса) — дать вес-историю ИЛИ выкинуть фактор и перенормировать веса. Известный отложенный gap.

---

## 🟢 БАТЧ D — Low (косметика/харденинг)

- ✅ D1. severe-hypo tier добавлен (severeLow теперь читается как порог; type `severe_hypoglycemia`; Dashboard трактует как гипо). `safetyGuard.ts`. [2026-07-10]
- ✅ D2. `user_version` перенесён внутрь транзакции миграции (транзакционен в SQLite). `migrations.ts`. [2026-07-10]
- ✅ D3. `now` прокинут в `markFired`/`markAlertFired` (деф. new Date()) — cooldown время-консистентен/тестируем. `smartAlerts.ts`. [2026-07-10]
- ✅ D4. Контраст emergency-дисклеймера 70%→95% white. `EmergencyScreen.tsx`. [2026-07-10]
- ✅ D5. accessibilityRole/Label/state на emoji-селекторах (пол/вид в PetInfo, языковые карточки). [2026-07-10] (scoped на онбординг-критичные; текст-лейблы и так рядом).
- ✅ D6. ToastAndroid при смене единиц/региона в Settings (проект Android-only). Ключи unitChanged/regionChanged. `SettingsScreen.tsx`. [2026-07-10]
- ⏸ D7. Индикатор прогресса онбординга — ОТЛОЖЕН. native-stack headerShown:false, нет общего хедера → требует правки 5 экранов с разными лейаутами + девайс-тест; LOW-косметика. Ключ `onboarding.stepOf` уже есть для будущей реализации.
- ✅ D8. Устаревшая dev-сводка «доступность в РФ» обновлена под санкц-реальность 2023-24. `diabeticFoods.ts`. [2026-07-10]
- ✅ D9. Мёртвый AlertType `weight_loss` удалён; углеводный бейдж собак нейтрального цвета (не verdict). `smartAlerts.ts`, `FeedGuideRegionScreen.tsx`. [2026-07-10]
- ⏸ D10. Untagged-хинты = универсальные (показ всем видам) — ОТЛОЖЕНО ОСОЗНАННО. Смена дефолта на species СКРЫЛА БЫ легитимные универсальные хинты (регресс). Инвариант уже защищён завершённым species-аудитом контента ([[project-roadmap-2026-07-09]]). `useHintEngine.ts`.

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

---

## 🔴 Пост-аудит: diashizo (2026-07-10, коммит `bc27f90`)
Гиперпараноидальный прогон по всем 6 фазам. **Крит/high НЕ найдено.** Закрыто:
- **M1** черновик логирования per-pet ключ (`<base>_<petId>`) — единый слот стирался при переключении питомца.
- **L1** edit double-dose: исключение редактируемой записи ушло в SQL (`id != ?`) — возвращается истинно ближайший ДРУГОЙ inline-приём.
- **L2** удалены мёртвые `getFoodsByRegion/getPrescriptionFoods/getOtcFoods` (+хелпер foodSpecies) — латентный возврат B4.
- **L3** unused-vars (HintSpecies/animalAdj). **L4** `now` в markAlertFired. **L5** ленивая инициализация emergencyDismissedAt (не мелькает).

## 🟢 Пост-аудит: DiaStore store-readiness (2026-07-10, коммит `792dabf`)
Технически к выкладке готов. Исправлено:
- **B1** store-listing.md — убраны ложные «нет интернета/облаков» + «SQLCipher» (в проекте нет — `database.ts:5` PRAGMA key no-op); privacy-блок ↔ privacy-policy.html / Data Safety.
- **B2** листинг кот-онли → кошки+собаки (описание/ключевики/short desc RU/EN). **B3** меддисклеймер. **W1** release notes 2.5.0 RU+EN.
- **W3** eas.json submit-путь → `play-service-account.json`. **README** актуализирован. **W4** GitHub описание+topics+тег `v2.5.0`.

## ▶️ ОСТАЛОСЬ К РЕЛИЗУ (детали и девайс-чеклист → [[project-roadmap-2026-07-09]] §🎯 ОСТАЛОСЬ К РЕЛИЗУ)
0. [если ещё не] запушить `bc27f90`+`792dabf` + тег `v2.5.0`.
1. **W2** (за пользователем): ограничить Firebase API-ключ в Google Cloud Console (`google-services.json` в публичном репо).
2. **Пересборка vc17 с HEAD `792dabf`** (артефакты в MEMORY.md устарели — собраны с `80916a6`).
3. **Девайс-тест**: медбезопасность A (двойная доза/экстрим/emergency-фолбэк), kg/lb, черновики M1/C2, регион в онбординге C4, пейволл в unlocked не тупик, каталог кормов, C001-миграция, H002 + ранее непроверенное.
4. **Скриншоты dog+cat + выгрузка** (за пользователем): AAB→Google Play, APK→RuStore; тексты из обновлённого store-listing.md.
5. (опц.) low-confidence флаги кормов; B7 Ed25519-подпись манифеста.
