---
name: file_locations
description: Key files containing medical constants, thresholds, and calculator logic in DiaPet, with what each does.
metadata:
  type: project
---

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
