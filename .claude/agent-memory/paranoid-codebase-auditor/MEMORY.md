# DiaPet Audit Memory

## Architecture Summary
- Offline-first SQLite + MMKV storage, no network API calls (except RevenueCat subscriptions)
- Zustand petStore is the single runtime source for active pet, synced with MMKV for persistence
- React Query used for all DB reads with 5-minute staleTime
- DB init is lazy (first getDatabase() call), protected by singleton promise
- MMKV encryption key stored in SecureStore, with unencrypted fallback if accessed before init

## Audit 2026-03-07 - Full Codebase Audit
### Fixed since last audit:
- PDF export XSS: escapeHtml() now in place
- ErrorBoundary: now uses i18n.t() properly
- storageUtils.clear() no longer used in delete-all-data
- Notification content: now uses i18n
- useUnsavedChangesGuard: LogGlucose uses initialValuesRef to avoid false trigger
- Trend calculation: now correct (ASC sort, slice(-3), a<b<c = up)

### Remaining from previous audit:
1. **MMKV unencrypted fallback** - still creates data split risk
2. **Glucose conversion asymmetry** - mmolToMgdl rounds, mgdlToMmol does NOT
3. **Missing loadPets dependency** in App.tsx useEffect - still present
4. **Migration v3 ALTER TABLE** - can fail on duplicate column (no IF NOT EXISTS)

### New findings 2026-03-07:
1. **SQL injection in PRAGMA key** - database.ts:24
2. **DashboardScreen local interface shadows domain type** - line 29
3. **LogGlucoseScreen numValue outside useMemo** - recomputed on every render but stale in closures
4. **Assessment handleNext uses stale totalScore** - includes answer before setState processes

## Medical Invariants
- Glucose ranges: severe_low<2.8, low 2.8-3.3, below_target 3.3-4.0, normal 4.0-9.0, high 9.0-14.0, very_high>14.0
- Conversion: MGDL_PER_MMOLL = 18.0156
- Insulin dose limits: warning >6, high warning >10, hard limit 20
