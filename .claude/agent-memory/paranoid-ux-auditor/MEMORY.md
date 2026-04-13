# Paranoid UX Auditor Memory

## DiaPet App Architecture
- **Stack**: Expo SDK 54, React Native 0.81, TypeScript 5.9
- **Navigation**: React Navigation v6, 5 tab stacks + Root (Emergency modal, Paywall modal, Onboarding)
- **State**: Zustand (petStore, subscriptionStore) + React Query
- **Storage**: expo-sqlite + react-native-mmkv
- **i18n**: i18next (ru/en), translations in `src/shared/i18n/locales/`

## Key UX Patterns (Updated 2026-03-21)
- **Delete**: Visible trash icons + long-press + confirmation dialog on list screens (with item details)
- **Delete all data**: DOUBLE confirmation, BUT MMKV deletes before SQL transaction (BUG-020 CRITICAL)
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

## Audit History
- 2026-03-03: 6 Critical, 11 High, 16 Medium, 14 Low
- 2026-03-07: Full re-audit with focus on restructure + visual/layout audit
- 2026-03-08: POST-FIX audit: 1 Critical, 4 High, 6 Medium, 3 Low
- 2026-03-16: Comprehensive adversarial audit: 5 Critical, 10 High, 15 Medium, 8 Low
- 2026-03-21 (AM): Glucose & Diary focused: 3C, 5H, 8M, 4L. See `audit-glucose-diary-2026-03-21.md`
- 2026-03-21 (PM): More/AI/Encyclopedia/FeedCalc/Assessment: 1C, 4H, 10M, 5L. See `audit-2026-03-21.md`
- 2026-03-21 (PM2): Onboarding+Dashboard: 2C, 5M, 3L. See `audit-onboarding-dashboard-2026-03-21.md`
