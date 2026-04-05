# Issue List (code walkthrough)

Scope: static code walkthrough (no UI runtime). Date: 2026-03-20.
Updated: 2026-04-05 — сверка с реальным кодом.

Logic overview
1. Onboarding: Language -> PetInfo -> Schedule -> VetContact -> Notifications. Notifications screen creates pet, saves schedules, stores vet contact, sets onboarding complete, optionally schedules notifications.
2. Main app: tabs (Home, Glucose, Symptoms, Encyclopedia, More). Schedules/notifications are persisted in DB and MMKV; dashboard reads schedule for next events.

Issues

1. ~~Duplicate schedule times can be added.~~ ✅ FIXED
   - addTime now finds unique time slot, duplicate prevention with Alert.

2. ~~"Add time" doesn't open a picker.~~ ✅ FIXED
   - addTime immediately opens DateTimePicker for the new entry.

3. ~~Notifications flag can be true even when OS permission is denied.~~ ✅ FIXED
   - `granted = await requestPermissions()` → `storage.set(NOTIFICATIONS_ENABLED, granted)`.

4. ~~Injection dose validation allows NaN.~~ ✅ FIXED
   - `isNaN(doseNum)` check added in LogInjectionScreen.

5. ~~Unsaved-changes guard misses date/time or category edits.~~ ✅ FIXED
   - `useUnsavedChangesGuard` now tracks date changes on LogInjection, LogFeeding, AddExpense.

6. ~~Validation error messaging is too generic on PetInfo.~~ ✅ FIXED (ЭТАП 12, F13)
   - Specific i18n keys added: `onboarding.nameRequired`, `onboarding.ageInvalid`, `onboarding.weightInvalid`.

Summary: 6/6 fixed.
