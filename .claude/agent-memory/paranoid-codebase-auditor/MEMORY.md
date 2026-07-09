# DiaPet Audit Memory

## Audit 2026-07-08/09 (HEAD 0dd722c) — persistence/deferred-crash focus
- **NEW CRITICAL (not previously flagged): silent total data loss via App.tsx orphan-pet purge + MMKV key loss.**
  App.tsx bootstrap deletes ALL pets from SQLite when `ONBOARDING_COMPLETE` reads false. MMKV is encrypted with a
  per-device key in SecureStore/Keystore. If that key is lost but the DB+MMKV FILES survive (Android Auto Backup
  restore to a new device — keystore keys are NOT backed up; or keystore invalidation), MMKV reads empty →
  ONBOARDING_COMPLETE=false → **every pet + all glucose history deleted, silently**. Amplified by `android.allowBackup`
  defaulting to true (app.json sets no allowBackup=false). Fix: make purge non-destructive (adopt existing pet /
  set ONBOARDING_COMPLETE=true) OR gate deletion on pet createdAt age < few min; and set allowBackup:false.
- **EditPetScreen persistence gap**: only name/weight/insulinType/vet/schedule editable. gender, birthYear(age),
  diabetesType, diagnosisDate, species, breed, photoUri are NEVER editable post-creation. diagnosisDate/diabetesType
  feed risk score → a fat-fingered onboarding value skews analyzer forever with no correction path.
- breed & photoUri: in schema+DTO but collected in NO UI (always null).
- restoreScheduleNotifications module-level `isRestoring` guard: EditPet's post-save reschedule is SKIPPED if an
  AppState-active restore is mid-flight → edited reminder time not applied until next foreground.
- TIR inconsistency CONFIRMED still present: diaryAnalyzer computeDayStats uses targetLow..targetHigh (cat 4-9);
  trendEngine + predictionDataCollector use targetLow..rangeHigh (cat 4-12). Same day → two different "% in range".

## Audit 2026-07-03 (HEAD 3c888f9) — v2.5.0 script/runtime audit
- NO P0/P1 blockers. Codebase heavily audited already; charts+analyzer now species-aware (getSpeciesConfig everywhere, species passed to both charts).
- Prior findings CONFIRMED FIXED: aiClient AbortController timeout, DashboardScreen operator precedence (parenthesized ?? []), migration v9 guarded, mgdlToMmol 2dp.
- REMAINING (P2/P3, mostly latent because AI hidden AI_PROXY_URL=''):
  1. In-range% DEFINITION INCONSISTENCY: trendEngine + predictionDataCollector use glucose.rangeHigh (cat 12); diaryAnalyzer uses glucose.targetHigh (cat 9). Same readings → different "% in range" dashboard vs diary. P2 medical-UX.
  2. safetyGuard.sanitizeRecommendation regex missing /g (line 76) — 2nd occurrence of forbidden dose phrase survives. Also: AI prediction/chat output NOT routed through sanitizeRecommendation at all → bigger gap when AI ships.
  3. DashboardScreen calculateTrend maxDev/avg → NaN if avg==0 (guarded by numValue>0 validation).

## Architecture Summary
- Offline-first SQLite + MMKV storage, no network API calls (except RevenueCat subscriptions + AI chat via Anthropic API)
- Zustand petStore is the single runtime source for active pet, synced with MMKV for persistence
- React Query used for all DB reads with 5-minute staleTime
- DB init is lazy (first getDatabase() call), protected by singleton promise
- MMKV encryption key stored in SecureStore, with unencrypted fallback if accessed before init

## Audit 2026-03-16 - Full Codebase Audit v4

### Previously fixed (v3 audit, 2026-03-15):
- PDF export XSS: escapeHtml() in place
- ErrorBoundary: uses i18n.t() properly
- SQL injection in PRAGMA key: UUID regex validation
- Glucose conversion: mgdlToMmol rounds to 2dp
- Migration v3: wrapped in try/catch for idempotent ALTER TABLE
- Repository create() null-checks, MMKV throw on pre-init access
- EditPetScreen reschedules notifications, SettingsScreen clears hint+AI keys

### False Positives Confirmed (v4 audit):
- AssessmentScreen totalScore: NOT stale. React 18 batches setAnswers+setShowResult in same handler
- ExpensesScreen month navigation: React 18 batches setMonth+setYear correctly

### Current findings 2026-03-16 (v4):
**CRITICAL:**
1. DashboardScreen:138 operator precedence: `as` binds tighter than `??` on glucoseHistory
2. AI chat history stored unencrypted, not cleaned on pet deletion

**HIGH:**
3. aiClient.ts: No fetch timeout (AbortController) - hangs on bad network
4. calculateDryMatter: No negative input validation - could give wrong feed verdict
5. AchievementModal: makeStyles called every render (StyleSheet leak)
6. ScheduleScreen: Feeding times can be reduced to zero (no min check)
7. EmergencyScreen: tel: URL not sanitized, no .catch() on Linking.openURL

**MEDIUM:**
8-14: GlucoseChart spread, SimpleBarChart stale dimensions, PetInfoScreen draft validation, currency hardcoded, AI history size, i18n flash, FlatList index keys

**CONFIG:**
19-23: AdMob/Anthropic/RevenueCat placeholder keys, EAS track=production, newArch+AdMob compat

## Medical Invariants
- Glucose ranges: severe_low<2.8, low 2.8-3.3, below_target 3.3-4.0, normal 4.0-9.0, high 9.0-14.0, very_high>14.0
- Conversion: MGDL_PER_MMOLL = 18.0156
- Insulin dose limits: warning >6, high warning >10, hard limit 20
- Feed calculator: carbs DM <10% good, 10-15% acceptable, >15% bad; Fat DM<=40% (ISFM), Protein DM>=40%

## File Risk Assessment
- **Highest risk**: DashboardScreen.tsx (operator precedence), aiClient.ts (no timeout), EmergencyScreen.tsx (unsanitized tel:)
- **Medium risk**: AchievementModal.tsx (StyleSheet leak), calculateDryMatter.ts (no negative validation), ScheduleScreen.tsx (zero feedings)
- **Low risk**: repositories (well-parameterized), pdfExport.ts (escapeHtml present), ErrorBoundary.tsx
