# DiaPet Medical Auditor Memory

## Key File Locations (Medical Data / Calculators)
- `src/shared/config/speciesConfig.ts` — SINGLE SOURCE OF TRUTH for species-aware glucose ranges,
  insulin types/onset/peak/duration, dose thresholds, analyzer thresholds, nutrition DM% targets.
  Cat and dog configs live side by side here — always check BOTH when editing a threshold.
- `src/storage/domain/types.ts` — MGDL_PER_MMOLL (18.0156), mmolToMgdl/mgdlToMmol, GLUCOSE_RANGES
  (deprecated cat-only fallback, still used by a couple of legacy call sites), SymptomType enum.
- `src/features/feedCalculator/utils/calculateDryMatter.ts` — DMB formula; delegates the
  good/acceptable/bad verdict to `getFoodVerdict()` in diabeticFoods.ts (species-aware: cat=carbs-led,
  dog=fat-gate+fibre) so the calculator and the food catalog can never disagree.
- `src/features/encyclopedia/data/diabeticFoods.ts` — food DB (extensively re-sourced/audited per-item
  with citation comments already, don't re-audit line by line — spot check only) + nutrition guideline
  constants + `getFoodVerdict()`.
- `src/features/emergency/screens/EmergencyScreen.tsx` — emergency protocols, i18n-driven
  (`emergency.hypoSteps` etc.), now species-context-aware (`t(..., {context: speciesContext})`).
- `src/features/assessment/utils/scoring.ts` — Assessment questionnaire scoring + `hasRedFlag()` DKA override.
- `src/features/symptoms/utils/severityCalculator.ts` — general Symptom Log severity + `hasDkaRedFlag()`.
  NOTE: this is a SEPARATE severity engine from assessment/scoring.ts — historically only one of the two
  had the DKA red-flag override. Always check both when auditing DKA/red-flag logic.
- `src/features/hints/data/aiSystemPrompt.ts` — AI system prompt, now fully species-aware via
  `getSpeciesConfig()`, uses shared `MGDL_PER_MMOLL` for mg/dL conversion (was hardcoded *18).
- `src/features/glucose/screens/LogGlucoseScreen.tsx` / `LogInjectionScreen.tsx` — dose entry; both use
  `getInsulinThresholds(species, weightKg)` from speciesConfig (cat=absolute, dog=per-kg-scaled). Cat
  absoluteMax=10 IU, dog absoluteMax=min(weight*2.0, 40) IU floor 3.
- `src/features/diary/utils/diaryAnalyzer.ts` — day-level TIR/recommendations, species-aware via config param.
- `src/features/analyzer/engine/{trendEngine,patternDetector,riskScoreCalculator,safetyGuard}.ts` —
  offline analyzer pipeline, all species-aware via `config?: SpeciesConfig` param with cat-shaped fallbacks.
  safetyGuard.ts is the dose-advice-language filter (FORBIDDEN_PATTERNS) — never recommends specific doses.
- `src/shared/config/regionConfig.ts` — region→unit/currency/language defaults. US/MX=mg/dL+lb(US only),
  RU/UK/EU/DE=mmol/L+kg. Verified correct.
- `src/shared/utils/weight.ts` — kg↔lb conversion (LB_PER_KG=2.20462, correct), canonical storage always kg.

## Conversion Factor
- App uses MGDL_PER_MMOLL = 18.0156 (MW glucose = 180.156 g/mol, matches IUPAC). Correct to 5dp; negligible
  deviation from 18.01559. mmolToMgdl rounds to int, mgdlToMmol rounds to 2dp. Safe at all clinical boundaries.
- Batch 8 (2026-07-20) found aiSystemPrompt.ts was using a hardcoded `*18` instead of this constant —
  fixed. **When auditing again, grep for literal `* 18` / `/ 18` near glucose values — a hardcoded
  factor drifting from MGDL_PER_MMOLL is the recurring failure mode here.**

## DMB Formula Assessment
- Core formula: carbs = 100 - P - F - Fi - Ash - M; carbsDM = carbs/DM*100. Division-by-zero, sum>100%,
  and negative-carbs are all guarded (return null). FeedCalculatorScreen estimates ash when the label
  omits it (wet≈2%, dry≈6%) and shows a caveat — reasonable heuristic, not a bug.
- Verdict is species-aware via `getFoodVerdict()`: cat driven by carbsDM alone (good<=7%, acceptable<=15%
  per DIABETIC_NUTRITION_GUIDELINES_CAT); dog driven by fat (hard pancreatitis gate, >25% DM = 'bad') +
  fibre, carbs deliberately de-emphasized (AAHA 2018 canine diet differs fundamentally from feline).

## Country/Region Coverage
- RU: Good — local brands (Craftia, Solid Natura, Ortipo), major platforms (Ozon, WB, 4lapy). Hill's and
  Farmina dry correctly marked unavailable in RU since 2023-24 (Rosselkhoznadzor).
- US: Good — major prescription brands, Fancy Feast, Chewy/Petco. UK/EU/DE: Adequate, Zooplus-centric.
- MX/JP/KR/BR: still thin (MX has stores but limited food data; JP/KR/BR not modeled as regions in
  regionConfig.ts's VALID_REGIONS at all — only RU/EU/UK/US/DE/MX/GLOBAL exist).

## Key Feline-Specific Clinical Facts (for hint/encyclopedia validation)
- ProZinc (U-40) and Caninsulin (U-40): BOTH require refrigeration after opening (suspensions) — this is
  now correct throughout speciesConfig.ts and the articles (was previously wrong in one place, since fixed).
- AlphaTRAK 2: code 7 for CATS, code 10 for dogs — wrong code = wrong result (check if this ever gets
  surfaced in-app; as of last check it's only mentioned in article prose, not a live calculator).
- Glargine PK in cats: onset 1-3h, peak 4-8h, duration 10-16h — correct in speciesConfig.ts and
  insulin_types.ts as of Batch 8. PZI PK: onset 1-4h, peak 3-8h, duration 8-16h (aligned across
  speciesConfig.ts and insulin_types.ts in Batch 8 — they had drifted apart, see Batch 8 notes below).
- Clinical hypoglycemia threshold cats: emergencyLow 2.8 mmol/L (60 mg/dL... actually ~50mg/dL), severeLow
  2.2 mmol/L. Range 3.3-4.0 = below_target (monitor), NOT emergency. Dogs share the same emergencyLow/
  severeLow (2.8/2.2) per Nelson & Couto / Feldman & Nelson — deliberately aligned with cats.
- Remission (cats only, dogs essentially never remit — canine DM is ~always type 1): glargine + low-carb
  50-90%; confirmation = euglycemia <6 mmol/L without insulin for 4 weeks (Roomp & Rand 2009).
- Somogyi: nadir <3.3 mmol/L + rebound >15 (cat) / >16 (dog) mmol/L within the same 12h cycle.
- Fructosamine norms: healthy cats 170-340; good diabetic control 350-450; >450 suboptimal; >550 poor.
- DKA ketone-testing / vet-contact threshold used consistently across dka.ts/dog-dka.ts/pancreatitis
  articles: sustained glucose >14-15 mmol/L warrants ketone strips; >20 mmol/L sustained (pancreatitis
  articles) or lethargy/vomiting/inappetence at any level = urgent vet contact.
- Insulin opened-vial shelf life: Lantus/glargine 28d, Detemir/Levemir 42d, PZI/ProZinc 60d,
  Caninsulin/Vetsulin 42d (dog article) — consistently applied across speciesConfig.ts, articles, and
  cost-planning.ts as of Batch 8.

## Recurring Pattern: Two Parallel Engines That Must Agree
DiaPet has several places where the SAME clinical judgment is computed twice by independent code paths.
Every audit so far has found at least one drift between them. Always diff these pairs:
- Assessment questionnaire (`assessment/utils/scoring.ts`) vs. general Symptom Log
  (`symptoms/utils/severityCalculator.ts`) — both need a DKA red-flag override, not just linear scoring.
- `diaryAnalyzer.ts` "wide spread" check vs. the species' own normal postprandial range (dog's rangeHigh-
  targetLow is ~9.5 mmol/L "normal", so a shared cat-tuned threshold false-flags every ordinary dog day —
  fixed in Batch 8 by adding `analyzer.wideSpreadThreshold` per species).
- `speciesConfig.ts` insulin PK numbers (onsetHours/peakHours/durationHours — currently UNUSED/dead in the
  UI, only informational fields) vs. the user-facing encyclopedia article prose (insulin_types.ts,
  dog-insulin.ts) — these silently drift since nothing enforces they match. insulin_types.ts / dog-insulin.ts
  are the user-visible source of truth; speciesConfig's PK fields should be treated as derived from them.
- Emergency screen (`EmergencyScreen.tsx`, the SOS button) vs. the detailed encyclopedia hypoglycemia
  articles (`hypoglycemia.ts` cat / `dog-hypoglycemia.ts` dog) — the Emergency screen is the ONE place a
  panicking owner actually opens, so any weight/species-scaled dosing info in the detailed articles must
  also appear (at least in simplified form) on the Emergency screen itself. Found+fixed in Batch 8: flat
  "1-2ml honey" on Emergency screen massively under-dosed large dogs vs. the dog article's 1-2 tbsp for >30kg.

## Audit History
- v1 (2026-02-28), v2 (2026-03-16), v3 (2026-04-15): found and the team subsequently fixed dose limits
  (was 15-20 IU, now species/weight-scaled with cat max 10 IU), GLUCOSE_RANGES hypo threshold (was 4.0,
  now 3.3/2.8 tiered), DMB negative-carbs guard, fat-threshold inconsistency, PZI/Caninsulin storage
  ('room'→'fridge'), Glargine PK numbers, remission threshold (8→6 mmol/L), Somogyi nadir (4.0→3.3),
  Lantus shelf life (60/90d→28d everywhere). All of the above are CONFIRMED RESOLVED as of Batch 8
  (2026-07-20) — do not re-flag them without re-verifying the current code first.
- **Batch 8 (2026-07-20)**, DiaPet v2.5.0 pre-release audit on branch `fix/audit-2026-07-19`: focused on
  calculators/formulas/thresholds only (not encyclopedia prose). Fixed: (1) Emergency screen hypoSteps
  honey/syrup dose was flat cat-scale regardless of species/weight — added `hypoSteps_dog` with the
  dog article's weight-tiered tsp/tbsp table + species context wiring; (2) aiSystemPrompt.ts mg/dL
  conversion hardcoded *18 → shared MGDL_PER_MMOLL; (3) PZI onset drift between speciesConfig.ts (1-3h)
  and insulin_types.ts article (1-4h) → aligned to 1-4h/4-8h/8-16h everywhere; (4) diaryAnalyzer.ts
  "wide spread >8 mmol/L" flat threshold false-flagged normal dog days → species-aware
  `analyzer.wideSpreadThreshold` (cat 8, dog 12); (5) symptoms/severityCalculator.ts lacked the DKA
  red-flag override that assessment/scoring.ts already had (vomiting+lossOfAppetite=5pts landed on
  'moderate' despite dka.ts calling that exact combo an immediate-clinic red flag) → added
  `hasDkaRedFlag()` mirroring scoring.ts's `hasRedFlag()`. Verified (no changes needed): conversion
  factor/rounding, DMB edge cases, glucose thresholds cat+dog, insulin dose thresholds (species+weight
  aware), Assessment questionnaire's existing DKA red-flag (already fixed pre-Batch-8, has test coverage),
  ketone/DKA/remission/pancreatitis numeric thresholds across cat+dog articles, region unit defaults,
  weight kg/lb conversion. tsc 0 errors, jest 170/171 passed (1 pre-existing skip) incl. 6 new tests added
  for severityCalculator.ts red-flag logic.
