# Paranoid UX Auditor Memory

## DiaPet App Architecture
- **Stack**: Expo SDK 54, React Native 0.81, TypeScript 5.9
- **Navigation**: React Navigation v6, 5 tab stacks + Root (Emergency modal, Paywall modal, Onboarding)
- **State**: Zustand (petStore, subscriptionStore) + React Query
- **Storage**: expo-sqlite + react-native-mmkv
- **i18n**: i18next (ru/en), translations in `src/shared/i18n/locales/`

## Key UX Patterns (Updated 2026-03-07)
- **Delete**: Visible trash icons + long-press + confirmation dialog on list screens
- **Delete all data**: DOUBLE confirmation dialog, irreversible, no backup offered
- **Forms**: useUnsavedChangesGuard on LogGlucose, LogInjection, LogFeeding, AddSymptom, EditPet, Assessment
- **Validation**: Glucose >0 to <35 mmol / <630 mg/dL; insulin hard limit 20 (FORM-004)
- **savingRef**: Present on all save forms including AddExpense and EditPet
- **FeedGuide**: Reachable from Dashboard HomeStack AND Encyclopedia stack (uses useEncyclopediaNavigation)
- **Assessment**: Moved to SymptomsStack, free for all, banner in SymptomsListScreen

## Full Visual/Layout Audit 2026-03-07
See `audit-visual-2026-03-07.md` for the 50+ findings on overflow, dark theme, keyboard, touch targets.
Key categories: hardcoded colors (~50 instances), missing keyboardShouldPersistTaps (5 screens),
StatusBar issues (2 screens), Dimensions.get (1 screen), missing input validation (feeding, calculator),
no unsaved guard (AddExpense), pet name overflow, ErrorBoundary fully hardcoded colors.

## Small Screen Layout Issues (2026-03-08)
- **StatusCard**: 3 cards in row on 320px = 58.6px per label. Russian labels 14-19 chars TRUNCATED.
  Fix: shorten i18n keys or add adjustsFontSizeToFit.
- **QuickActions**: justifyContent:'center' CONFIRMED FIXED. 5th button centered (acceptable).
- **DailyDiary addRow**: 3 buttons flex:1 on 320px = 90.6px for text. "Сделать инъекцию" wraps to 2 lines.
  Fix: shorter i18n keys for diary context (diary.addGlucose/addInjection/addFeeding).
- **DailyDiary statsRow**: statLabel fontSize:11 no numberOfLines -- overflows with large font.
- **DailyDiary CRITICAL**: No petId guard. Empty petId -> empty diary + add buttons lead to forms with no petId.
- **DailyDiary**: No pull-to-refresh (Dashboard HAS it). No error state from useQuery.
- **Dashboard petName**: fontSize:28 no numberOfLines -- long names overflow into SOS button.

## Audit History
- 2026-03-03: 6 Critical, 11 High, 16 Medium, 14 Low
- 2026-03-07: Full re-audit with focus on restructure + visual/layout audit
- 2026-03-08: POST-FIX audit: 1 Critical, 4 High, 6 Medium, 3 Low
