# Полный чекап перед публикацией v2.5.0 — план фиксов (аудит Fable, 2026-07-05)

Статус базы: tsc 0, tests 51/51, i18n паритет OK. HEAD `3693213`, local +4 к origin.
Правило: все фиксы — в 2.5.0 (vc17), одна пересборка AAB+APK после закрытия списка.

## 🔴 Критичные (обязательно до сторов)

- [x] **A1. PDF-отчёт экспортирует старейшие записи вместо свежих**
  `src/shared/utils/pdfExport.ts:233-273` — `slice(0,100)/(0,10)/(0,50)` поверх ASC-сортировки
  (`findAllByPetId` = ORDER BY ... ASC). «Последние инъекции» = первые 10 в жизни.
  Фикс: брать последние N (slice(-N) + reverse, показывать новые сверху) или сортировать DESC на входе.

- [x] **A2. Morning hint никогда не показывается**
  `src/features/hints/hooks/useMorningGreeting.ts:16-47` — эффект с deps `[species]`:
  1-й прогон (species=undefined) пишет `HINTS_LAST_APP_OPEN_DATE=today` и ставит таймер 2с;
  loadPets() резолвится → species меняется → cleanup убивает таймер, ре-ран выходит по `lastOpen===today`.
  Фикс: не перезапускать эффект по species (читать species из getState() в момент срабатывания таймера)
  либо писать lastOpen только после фактического показа хинта.

- [x] **A3. Emergency-баннер Dashboard под статус-баром**
  `src/features/dashboard/screens/DashboardScreen.tsx:294-308` — баннер первый в ScrollView,
  до hero-градиента с `SafeAreaView edges=['top']`; контейнер `edges=['left','right']`.
  Фикс: обернуть баннер в top-inset (useSafeAreaInsets paddingTop) или рендерить его внутри hero.

## 🟠 Средние (очень желательно в этот же релиз)

- [x] **B1. Risk Score штрафует новых пользователей за adherence**
  `src/features/analyzer/engine/riskScoreCalculator.ts:87-114` — expected всегда `scheduledPerDay*14`.
  Фикс: `days = min(14, дней с первой записи/регистрации)`; при <2 дней данных — нейтральный скор.

- [x] **B2. Рассинхрон единиц глюкозы на Dashboard**
  `DashboardScreen.tsx:123-125` — `GLUCOSE_UNIT` читается в useState при маунте.
  Фикс: перечитывать в useFocusEffect (setGlucoseUnit из storage при фокусе).

- [x] **B3. LogFeeding: нет guard'а будущего времени**
  `src/features/glucose/screens/LogFeedingScreen.tsx:529-542` — добавить кламп `merged > now ? now : merged`
  как в LogGlucose/LogInjection.

- [x] **B4. FoodSelector: кошачьи пороги вердиктов для всех видов**
  `src/features/glucose/components/FoodSelector.tsx:46,57,68,85,95,105`:
  - вердикт по carbsDM захардкожен <10/<=15 (cat) — для собак нужен speciesConfig.nutrition;
  - naturalFoods: `carbsPer100g` подставляется как carbsDM (разные метрики) — как минимум не писать в carbsDM
    без пометки isNatural, в идеале не красить вердиктом DM;
  - alternative: ветка `'bad'` недостижима (обе → 'acceptable').

- [x] **B5. Инлайн-инсулин невидим вне анализатора**
  - LogInjection: X.8-проверка «<6ч» смотрит только injections → учесть insulin_dose из glucose_readings
    (`LogInjectionScreen.tsx:158-189`);
  - DailyDiary: показывать инлайн-дозу как injection-событие таймлайна (`DailyDiaryScreen.tsx:158-212`);
  - pdfExport: мёржить инлайн-дозы в таблицу инъекций.

- [x] **B6. EditPet: reschedule гасит напоминания других питомцев + `!== false`**
  `src/features/pets/screens/EditPetScreen.tsx:148-157`:
  - вместо cancel-all-injection/feeding + reschedule active — вызвать restoreScheduleNotifications()
    (он per-pet и с guard'ом);
  - условие `getBoolean(NOTIFICATIONS_ENABLED) !== false` → `=== true`.

- [x] **B7. promptExactAlarmIfNeeded: молчаливый выброс в настройки**
  `src/shared/hooks/useNotifications.ts:127-142` — добавить Alert с объяснением до openSettings
  (по образцу battery-подсказки); не показывать оба промпта, если permission denied.

- [x] **B8. Emergency: текст «Нажмите, чтобы добавить ветеринара» противоречит действию**
  `EmergencyScreen.tsx:44-57,118-126` — тап предлагает только 112. Поменять подпись
  (напр. «Контакт не указан — добавьте в профиле питомца») и/или пересмотреть уместность «112» для питомца.

- [x] **B9. Гонка species при старте: пуш-хинты и morning hint до loadPets**
  `hintScheduler.ts:46` (и useMorningGreeting) — species = 'cat' пока activePet null.
  Фикс: fallback на `storage.getString(ACTIVE_SPECIES)` вместо голого 'cat', либо ждать loadPets.

- [x] **B10. Smart-alert: двойной markAlertFired + исчезновение при рефокусе**
  `useAnalyzer.ts:158-162` + `smartAlerts.ts` — два экрана с useAnalyzer жгут дневной лимит дважды;
  на следующем фокусе алерт исчезает. Фикс: помечать fired один раз (например, по dismiss/tap,
  или дедуп по типу+дате в markFired), и/или показывать уже «сегодняшний» алерт повторно в течение дня.

- [x] **B11. Account: кнопки Backup/Restore молча no-op без firebaseUid**
  `AccountScreen.tsx:60-62,81-83` — при user из кэша и офлайн silent sign-in. Добавить Alert
  «нет соединения с аккаунтом, повторите вход».

- [x] **B12. Success-экран: «7 дней Pro бесплатно» в релизе без Pro**
  `SuccessScreen.tsx:120-130` — скрывать trialBadge при `PREMIUM_MODE !== 'billing'`.

## 🟡 Полировка (по остаточному принципу)

- [x] C1. Онбординг: выбор вида не переключает тему живьём (`PetInfoScreen.tsx:55-59` — MMKV-запись не ре-рендерит ThemeProvider).
- [x] C2. RU-плейсхолдеры в EN («Др. Иванова», «+7 999…», «Барсик», «Протафан») — Vet Contact/EditPet/AddPet.
- [x] C3. EditPet: «8:30» vs «08:30» — нормализовать в HH:MM перед dedupe/сохранением.
- [x] C4. Фильтр уровней GlucoseList: SQL `<= max` для всех диапазонов → 9.0 в двух фильтрах сразу (сделать полуинтервалы как в classify).
- [x] C5. GlucoseChart (сделано 2026-07-07: временнáя ось X, анти-коллизия X/Y-подписей): индексная ось X сжимает пропущенные дни; y-подписи могут накладываться.
- [x] C6. Delete-all не чистит `analyzer_alert_history`/`analyzer_alerts_today`.
- [x] C7. Deep-link `diapet://ai` при скрытом AiTab — убрать из linking-конфига при !showAiTab.
- [x] C8. Retry-кнопка storage-error (`App.tsx:213-218`) пропускает пост-инициализацию (язык/подписка/auth/analytics).
- [x] C9. Квик-селект инсулинов LogInjection не species-aware (использовать speciesConfig.commonTypes).
- [x] C10. LogFeeding: unsaved-guard не учитывает поля ручного состава (protein/fat/...).

## Найдено при углублённом проходе (2-й пасс)

- [x] **D1. 🔴 51 хинт с кошачьим текстом уходит владельцам собак**
  `src/features/hints/data/hintsContent.ts` — 51 из 164 хинтов без species-тега говорят «кот/кошка/котейка»,
  включая медицинские факты («норма глюкозы у кошки 4–8 ммоль/л» — glu_w1_02, «если кот отказался есть…» — inj_w1_d3m).
  Собачник первые 30 дней получает кошачьи подсказки и кошачьи клинические нормы.
  Фикс: пройтись по списку (inj_w1_d3m…gluc_extra_02, полный список в аудит-логе) — либо тег species:'cat'
  + собачьи парные варианты, либо переписать текст видо-нейтрально («питомец»).
  Проверено скриптом; push-контент (37 шт) чистый.

- [x] **D2. 🔴 Нет UI удаления питомца**
  `petRepository.delete` вызывается только из recovery/rollback. Мультипет есть (AddPet, PetPicker),
  а удалить питомца нельзя — только «удалить ВСЕ данные». Умерший/ошибочно созданный питомец навсегда в пикере.
  Фикс: кнопка удаления в PetProfile/EditPet с двойным подтверждением + переключение activePet + отмена его алярмов.

- [x] **D3. 🟠 Отсутствующие i18n-ключи (сырые ключи в UI)**
  - `common.skip` → кнопка в Alert «разрешение отклонено» (онбординг!) отображается как «common.skip»
    (`NotificationsScreen.tsx:150`; использовать `onboarding.skip`);
  - `feedCalculator.fiberDM` → собачники видят сырой ключ в результатах калькулятора
    (`FeedCalculatorScreen.tsx:215`; ключ существует как `feedGuide.fiberDM` — неправильный namespace);
  - `common.search`, `encyclopedia.addBookmark/removeBookmark` — есть defaultValue (EN-текст в RU-интерфейсе), минор.

- [x] **D4. 🟠 6 иконок отсутствуют в ICON_MAP → рендерятся пустотой**
  Icon.tsx возвращает null для неизвестных имён; tsc не ловит (тип `string & {}`):
  - AccountScreen: `cloud-outline`, `cloud-upload-outline`, `cloud-download-outline`, `logo-google`,
    `person-circle-outline` — весь экран Account без иконок, Google-кнопка без логотипа;
  - DashboardScreen: `swap-horizontal` — тумблер единиц без иконки.
  Фикс: добавить маппинги (Cloud, CloudUpload, CloudDownload, CircleUserRound, ArrowLeftRight; для logo-google — SVG или Chrome-глиф).

- [x] **D5. 🟠 FoodSelector игнорирует вид питомца (усиление B4)**
  В `diabeticFoods.ts` есть поле `species` (11 собачьих кормов) и готовый species-aware `getFoodVerdict()`
  (используется FeedGuideRegionScreen), но FoodSelector: (а) не фильтрует список по виду —
  кошкам показываются собачьи корма и наоборот; (б) не вызывает getFoodVerdict, а считает вердикт
  по кошачьим порогам. Фикс: прокинуть species, отфильтровать, заменить вердикт на getFoodVerdict.

- [x] D6. AnalyzerDashboard при 1–2 замерах показывает и «недостаточно данных», и риск-виджет одновременно
  (`AnalyzerDashboardScreen.tsx:98,159` — riskScore не-null уже при 1 замере). Прятать виджеты до hasEnoughData.
- [x] D7. PetProfile `{activePet.weightKg && renderInfoRow(...)}` — при weightKg=0 в дерево попадает голый `0`
  → RN-крэш «Text strings must be rendered within a <Text>». Достижимо через restore старого бэкапа. Использовать `!= null`.
- [x] D8. `scheduleRepository` сортирует `ORDER BY time_of_day` строкой — «8:30» встаёт после «20:00»
  (проявляется с ручным вводом времени из EditPet; лечится нормализацией C3 при сохранении).
- [x] D9. GlucoseValueBadge — мёртвый компонент (нигде не используется, только barrel-экспорт). Удалить или начать использовать.
- [x] D10. LanguageScreen применяет язык только по «Далее» — до этого EN-пользователь видит RU-интерфейс первого экрана.
- [x] D11. `authStore.signOut()` без catch в UI — сетевая ошибка Google signOut даёт unhandled rejection.
- [x] D12. `useMissedInjection` тоже не видит инлайн-инсулин из glucose_readings (объединить с B5).
- [x] D13. Расходы: валюта привязана к языку (RU→RUB, EN→USD в AddExpense), а `SUM(amount)` в totals
  игнорирует currency — после смены языка рубли и доллары складываются в одну цифру. Минимум: фиксировать
  валюту первой записи / по региону, не по текущему языку.
- [x] D14. У расхода нельзя выбрать дату (всегда today; при edit дата сохраняется, но не редактируется) — UX-пробел.

## Проверено во 2-м пассе, чисто
Репозитории (injection/schedule/expense — SQL, транзакции), i18n-интерполяции ({{var}} совпадают в RU/EN),
покрытие t()-ключей (572 использованных, 5 промахов ↑D3), покрытие иконок (87 использованных, 6 промахов ↑D4),
push-контент species-теги, deviceId, googleAuth/authStore (кроме D11), subscriptionApi (таймаут, ретраи),
Paywall/Subscription (спят при unlocked), prediction/AI (недостижимы без AI_PROXY_URL), Assessment, SymptomDetail,
PetPicker, FirstStepsCard, StatusCard/Button/Input/SimpleBarChart/ErrorBoundary/AchievementModal/HintCard,
ArticleList/FeedGuide (species-aware — в отличие от FoodSelector), deps (RN 0.81 + mmkv3 + reanimated4 — совместимы с new arch).

## Порядок работ
1. A1–A3 → коммит fix(critical).
2. B1–B12 → 2-3 тематических коммита (analyzer/notifications/UX).
3. C* — одним polish-коммитом, что успеем.
4. tsc + tests + ручная проверка ключевых флоу → пересборка vc17 (`NODE_OPTIONS=--use-system-ca npx eas-cli build ...`) → push.


## СТАТУС 2026-07-07: ВСЕ 40 ПУНКТОВ ЗАКРЫТЫ, включая C5
Коммиты: 4856760, 136dd45, bb1fdc8, a04b7cc, e9ccf58, 1911e4b, 7da4ac7, aa21cc3, 0dd4035, 13c517d.
