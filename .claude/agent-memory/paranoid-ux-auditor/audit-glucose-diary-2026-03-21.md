---
name: Glucose & Diary Screens Audit 2026-03-21
description: Adversarial UX audit of 7 glucose/diary screens — 3 critical, 5 high, 8 medium, 4 low bugs found
type: project
---

## Audit: Glucose, Injection, Feeding, Diary Screens (2026-03-21)

### Critical
- **BUG-001**: LogInjection has NO edit mode (no editId param, no load logic, InjectionList has no onPress nav). Users cannot fix wrong insulin doses.
- **BUG-017**: Duplicate injection check uses `findLatest` (most recent injection) instead of finding nearest injection to `administeredAt`. When entering past-dated injections, the check compares against wrong record.

### High
- **BUG-019**: InjectionListScreen + FeedingListScreen call `queryClient.invalidateQueries()` without `await` in delete handlers (lines 68-69 and 81-82 respectively). GlucoseListScreen correctly uses `await`.
- **BUG-021**: Insulin dose validation (4/6/10 IU thresholds) duplicated between LogGlucose and LogInjection. Medical safety risk if updated in one place only.
- **BUG-002**: LogFeeding useUnsavedChangesGuard (line 69) does NOT track manual nutrition fields (protein, fat, fiber, ash, moisture).

### Medium
- **BUG-006/008**: Trash icons in InjectionList (line 102) and FeedingList (line 121) have hitSlop 8px = total 34pt < 44pt minimum.
- **BUG-003**: LogFeeding verdictColor() uses hardcoded colors (#34C759, #FF9500, #FF3B30) instead of theme tokens.
- **BUG-005**: LogFeeding has no upper limit on amount (accepts 99999 grams).
- **BUG-016**: Diary timeline shows trailing space when injection insulinType is empty.
- **BUG-022**: FeedingList missing "long press to delete" hint (InjectionList has it).

### Low
- **BUG-004**: LogFeeding has ~15 hardcoded i18n strings using `i18n.language === 'ru'` pattern.
- **BUG-007/009**: handleDelete/renderItem not memoized in InjectionList and FeedingList.
- **BUG-010**: GlucoseList filterBadgeText has hardcoded color '#fff'.
- **BUG-013**: "Date & Time" section titles use hardcoded "&" across 3 screens.

### Patterns Confirmed
- useUnsavedChangesGuard present on LogGlucose, LogInjection, LogFeeding (good)
- savingRef double-tap protection present on all save forms (good)
- Delete confirmation with item details present on all list screens (good)
- LogGlucose edit mode fully functional with editId (good pattern to replicate)
