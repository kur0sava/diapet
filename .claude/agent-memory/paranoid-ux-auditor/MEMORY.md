# Paranoid UX Auditor Memory

## DiaPet App Architecture
- **Stack**: Expo SDK 54, React Native 0.81, TypeScript 5.9
- **Navigation**: React Navigation v6, 5 tab stacks + Root (Emergency modal, Paywall modal, Onboarding)
- **State**: Zustand (petStore, subscriptionStore) + React Query
- **Storage**: expo-sqlite + react-native-mmkv
- **i18n**: i18next (ru/en), translations in `src/shared/i18n/locales/`

## Key UX Patterns (Updated 2026-03-21)
- **Delete**: Visible trash icons + long-press + confirmation dialog on list screens (with item details)
- **Delete all data**: DOUBLE confirmation. As of v2.6 SQL transaction runs BEFORE storage.delete (BUG-020 order now correct in SettingsScreen.handleDeleteAllData)
- **Forms**: useUnsavedChangesGuard on LogGlucose, LogInjection, LogFeeding, AddSymptom, EditPet, Assessment, AddExpense
- **AddExpense guard bug**: HAS guard now but triggers falsely in edit mode (no isDirty pattern)
- **Validation**: Glucose >0 to <35 mmol / <630 mg/dL; insulin hard limit 10 IU
- **savingRef**: Present on all save forms
- **Onboarding draft**: Only PetInfo saved to MMKV. Schedule/VetContact NOT persisted
- **Glucose unit change**: Does NOT invalidate React Query cache (BUG-021 HIGH)
- **File locations**: Expenses in `src/features/expenses/`, Emergency in `src/features/emergency/`, Subscription in `src/features/subscription/`

## Still OPEN from all audits:
- LogInjection has NO edit mode (no editId support)
- SettingsScreen: MMKV deleted BEFORE SQL transaction in handleDeleteAllData
- AdvancedAnalyticsScreen: pro-gate navigate+goBack race condition
- EmergencyScreen: "tapToAddVet" text misleading
- PetProfileScreen: no empty state for empty schedules
- ExpensesScreen: missing long-press hint (inconsistent with SymptomsListScreen)
- Touch targets < 44px: AI back button (36px), trash icons (~34px), bookmark button

## 2026-07-19 re-audit (HEAD a99a416) — status of prior findings
- FIXED: achievement-over-emergency for GLUCOSE logs — useHintTrigger.ts:35-39 now suppresses achievement+hint when valueMmol in emergency band. BUT checkAchievements (:45-47) still fires 3s after ANY non-glucose log (feeding/injection/weight); HintProvider wraps whole app (App.tsx:226) so AchievementModal (native Modal) still can pop over Emergency screen after e.g. logging honey to treat hypo. STILL OPEN (High, narrowed).
- FIXED: SettingsScreen delete-all — SQL transaction runs BEFORE MMKV deletes (:115-119). Order correct.
- FIXED: glucose unit change invalidates glucose query cache (Settings:302, Dashboard:145).
- FIXED: AddExpense unsaved-guard false-trigger in edit mode — now uses initialLoaded ref + isDirty pattern (:60-68).
- FIXED: pet delete has DOUBLE confirm + blocks deleting last pet (PetProfileScreen:37-81).
- STILL OPEN: LogInjection no edit mode (InjectionList row tap = no-op, only delete). Weight lossWarning ignores time-gap (WeightHistoryScreen:282). Weight unit global toggle silent from 4 places; PetProfile hardcodes kg (:232). AchievementModal no ScrollView (clip under max font).

## v2.6 New Surfaces (audited 2026-07-18, static)
- **Retention (LIVE in prod)**: achievementEngine + hintStore (id-based achievements, queued modals), weeklySummary + Sunday push scheduler, streak chip, event hints (hypo/hyper/new-food), WeightHistoryScreen.
- **KEY LIVE BUG**: AchievementModal (gold celebration, global via HintProvider) can pop OVER Emergency screen / right after a scary glucose reading. `useHintTrigger.ts:33` schedules checkAchievements 3s AFTER any log, "NOT gated", fires even in emergency path (LogGlucoseScreen:324 triggerAfterAction BEFORE emergency alert:333). Emotional tone-clash. FIX: suppress achievement when emergency.
- **WeightHistory**: add-only (no edit, delete+add to fix typo). lossWarning (`:282`) ignores time gap → false vet-call panic on same-day re-weigh. Unit toggle changes GLOBAL weight unit silently.
- **Community stack (GATED OFF in prod via isChatFeatureEnabled)**: 7 screens under CommunityStack. Reviewed for future. Key issues: dose advice ("уколи 5 ед") only WARN (posted+flagged, not blocked) in newly_diagnosed/questions/diet rooms — only insulin/complications are moderation:'max'→block; no server AI moderator deployed. Own messages have NO delete/edit (MessageBubble actions are !isOwn only). NewThread/Thread composer have NO unsaved-changes guard. Google signIn errors swallowed silently (CommunityRoomsScreen:33). moderation.ts DOSE_RE/ABUSE_WORDS heuristic; rateLimit 40/day+5s cooldown (cooldown & daily_limit share one message).
- **QuickAddButton FAB**: AddTab center, tabBarButton, preventDefault on press; navigates Home>LogX. Clean.
- **ScreenHeader**: canonical, 44x44 back, centered title. Clean.

## Audit History
- 2026-03-03: 6 Critical, 11 High, 16 Medium, 14 Low
- 2026-03-07: Full re-audit with focus on restructure + visual/layout audit
- 2026-03-08: POST-FIX audit: 1 Critical, 4 High, 6 Medium, 3 Low
- 2026-03-16: Comprehensive adversarial audit: 5 Critical, 10 High, 15 Medium, 8 Low
- 2026-03-21 (AM): Glucose & Diary focused: 3C, 5H, 8M, 4L. See `audit-glucose-diary-2026-03-21.md`
- 2026-03-21 (PM): More/AI/Encyclopedia/FeedCalc/Assessment: 1C, 4H, 10M, 5L. See `audit-2026-03-21.md`
- 2026-03-21 (PM2): Onboarding+Dashboard: 2C, 5M, 3L. See `audit-onboarding-dashboard-2026-03-21.md`
- 2026-07-18: v2.6 new surfaces (retention + community + FAB/header/export): 0C, 2H, 6M, 5L. Top: H1 achievement modal over emergency (LIVE); H2 community dose-advice warn-not-block (gated).
