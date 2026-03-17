# Paranoid UX Auditor Memory

## DiaPet App Architecture
- **Stack**: Expo SDK 54, React Native 0.81, TypeScript 5.9
- **Navigation**: React Navigation v6, 5 tab stacks + Root (Emergency modal, Paywall modal, Onboarding)
- **State**: Zustand (petStore, subscriptionStore) + React Query
- **Storage**: expo-sqlite + react-native-mmkv
- **i18n**: i18next (ru/en), translations in `src/shared/i18n/locales/`

## Key UX Patterns (Updated 2026-03-16)
- **Delete**: Visible trash icons + long-press + confirmation dialog on list screens (with item details)
- **Delete all data**: DOUBLE confirmation dialog, irreversible, no backup offered
- **Forms**: useUnsavedChangesGuard on LogGlucose, LogInjection, LogFeeding, AddSymptom, EditPet, Assessment
- **MISSING guard**: AddExpense has NO useUnsavedChangesGuard
- **Validation**: Glucose >0 to <35 mmol / <630 mg/dL; insulin hard limit 20 (FORM-004)
- **savingRef**: Present on all save forms including AddExpense and EditPet
- **Onboarding draft**: Only PetInfo saved to MMKV. Schedule/VetContact NOT persisted.

## Full Audit 2026-03-16
See `audit-full-2026-03-16.md` for comprehensive adversarial audit.
Key critical/high issues:
- LogInjection has NO edit mode (no editId support)
- AddExpense has NO unsaved changes guard
- FeedCalculator accepts values >100% without warning
- Emergency screen: no vet phone => user offered only 112
- Onboarding draft only covers PetInfo step
- DailyDiary add-buttons navigate to forms that log for TODAY, not the selected diary date
- LogFeeding has no date/time picker (always logs as "now")

## Audit History
- 2026-03-03: 6 Critical, 11 High, 16 Medium, 14 Low
- 2026-03-07: Full re-audit with focus on restructure + visual/layout audit
- 2026-03-08: POST-FIX audit: 1 Critical, 4 High, 6 Medium, 3 Low
- 2026-03-16: Comprehensive adversarial audit: 5 Critical, 10 High, 15 Medium, 8 Low
