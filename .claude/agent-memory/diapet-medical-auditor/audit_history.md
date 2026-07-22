---
name: audit_history
description: Chronological log of every DiaPet medical audit batch — what was checked, what was fixed, what was confirmed clean.
metadata:
  type: project
---

## v1-v3 (2026-02-28 / 2026-03-16 / 2026-04-15)
Found and the team subsequently fixed dose limits (was 15-20 IU, now species/weight-scaled with cat max
10 IU), GLUCOSE_RANGES hypo threshold (was 4.0, now 3.3/2.8 tiered), DMB negative-carbs guard, fat-threshold
inconsistency, PZI/Caninsulin storage ('room'→'fridge'), Glargine PK numbers, remission threshold (8→6
mmol/L), Somogyi nadir (4.0→3.3), Lantus shelf life (60/90d→28d everywhere). All CONFIRMED RESOLVED as of
Batch 8 (2026-07-20) — do not re-flag without re-verifying current code first.

## Batch 8 (2026-07-20) — DiaPet v2.5.0 pre-release, calculators/formulas/thresholds only
Branch `fix/audit-2026-07-19`. Fixed: (1) Emergency screen hypoSteps honey/syrup dose was flat cat-scale
regardless of species/weight → added `hypoSteps_dog` with the dog article's weight-tiered tsp/tbsp table +
species context wiring; (2) aiSystemPrompt.ts mg/dL conversion hardcoded *18 → shared MGDL_PER_MMOLL;
(3) PZI onset drift between speciesConfig.ts (1-3h) and insulin_types.ts article (1-4h) → aligned to
1-4h/4-8h/8-16h everywhere; (4) diaryAnalyzer.ts "wide spread >8 mmol/L" flat threshold false-flagged
normal dog days → species-aware `analyzer.wideSpreadThreshold` (cat 8, dog 12); (5) symptoms/
severityCalculator.ts lacked the DKA red-flag override that assessment/scoring.ts already had → added
`hasDkaRedFlag()` mirroring scoring.ts's `hasRedFlag()`. Verified clean: conversion factor/rounding, DMB
edge cases, glucose thresholds cat+dog, insulin dose thresholds, Assessment's DKA red-flag, ketone/DKA/
remission/pancreatitis numeric thresholds, region unit defaults, weight kg/lb conversion. tsc 0, jest
170/171 (1 pre-existing skip) incl. 6 new tests for severityCalculator.ts red-flag logic.

## Batch 9 (2026-07-22) — narrative "basics"/"remission" encyclopedia audit, 9 new articles
cat-life-expectancy, cat-why-diabetes, cat-diabetes-myths, dog-life-expectancy, dog-why-diabetes,
dog-insulin-explained, cat-remission-signs, cat-no-remission, dog-remission. Clean batch, 1 cosmetic edit
(added 75-80% cataract prevalence stat to dog-life-expectancy.ts RU+EN, sourced from dog-cataracts.ts). No
CRITICAL/HIGH — all numbers (nadir 4-5/pre-shot 10 mmol/L, remission window 1-6mo, carbs <10%, breed lists,
male-cat 2x risk) cross-checked against and matched pre-existing canonical articles verbatim — clearly
drafted from those as templates. RU/EN pairs faithful, relatedArticleIds/order all valid. Technique: grep
the same fact/number across src/features/encyclopedia/data/articles/ — this codebase reuses vetted numbers
extremely consistently, so a claim either matches an existing sourced one or is the first appearance
(needs real scrutiny).

## Batch 10 (2026-07-22) — nutrition+treatment encyclopedia audit, 10 new articles
cat/dog-foods-to-avoid, cat/dog-reading-food-labels, cat/dog-home-diet, cat/dog-insulin-brands,
insulin-storage, insulin-syringes-u40-u100. Clean batch, zero edits needed — all claims matched canonical
sources (diet.ts/dog-diet.ts, DIABETIC_NUTRITION_GUIDELINES_CAT/DOG, calculateDryMatter.ts, insulin_types.ts/
dog-insulin.ts). insulin-syringes-u40-u100.ts and insulin-storage.ts are exemplary safety writing — refuse
to give a home U-40/U-100 dose-conversion formula, warn against raising dose to "push through" high sugar
before checking for a bad/expired vial. Insulin-brand facts (ProZinc FDA dog-approved 2019, Vetsulin=US
canine-labeled, Caninsulin cascade-registered EU/UK, RinGlar/Ринсулин НПХ Геропарм RU off-label, AMDUCA/
cascade framing) all check out. Noted (not a fix): cat-foods-to-avoid.ts's xylitol-in-cats warning is
appropriately hedged (no established feline mechanism claimed, just recommends avoidance).

## Batch 11 (2026-07-22) — monitoring+medical safety audit, 6 new articles
cgm-monitoring, dog-cgm-monitoring, pet-glucometer-vs-human, somogyi-rebound (species:'all', deliberately
controversial topic), sick-day-rules, missed-double-insulin (both species:'all', high-stakes safety
topics). RESULT: content clean and well-hedged — CGM thresholds (cat targetLow 4.0/emergencyLow 2.8; dog
nadir band ~5-9/emergencyLow 2.8) match speciesConfig.ts exactly; Somogyi nadir/rebound numbers (cat
<3.3/>15, dog <3.3/>16) match analyzer.somogyiNadirThreshold/somogyiReboundThreshold exactly; sick-day-
rules.ts and missed-double-insulin.ts both scrupulously avoid self-directed dosing formulas and correctly
frame partial/adjusted dosing as strictly the vet's decision — notably SAFER than the pre-existing
hypoglycemia.ts table (see open_issues.md — CRITICAL, unresolved). somogyi-rebound.ts's "why it's rarer
than it sounds" section appropriately hedges the controversial claim that classic Somogyi is over-diagnosed
relative to simple insulin shortage — matches modern ISFM2023/Roomp&Rand skepticism without pushing
self-adjustment. Only edit made: cosmetic brand capitalization "AlphaTrak"→"AlphaTRAK" in
pet-glucometer-vs-human.ts (RU+EN+tag, 9 occurrences) to match the rest of the encyclopedia. tsc 0 after
edit. Also surfaced 3 unresolved cross-article issues, filed in open_issues.md (1 CRITICAL, 1 MEDIUM, 1 LOW).
Technique confirmed: cross-reference a new safety article's central thesis against what its
relatedArticleIds actually say, not just check it in isolation — this is what caught the CRITICAL finding.

## Batch 12 (2026-07-22) — SGLT2 inhibitors (oral meds) + insulin PK date-fact audit
New: cat-oral-medication.ts (Bexacat/Senvelgo, cat-only). Re-checked mentions in insulin_types.ts,
cat-insulin-brands.ts, remission.ts, dog-insulin.ts, dog-insulin-brands.ts, glucose_monitoring.ts,
glucose-curves-practice.ts. eDKA framing (contraindicated if currently/ever on insulin or reduced beta-cell
reserve; red-flag = lethargy/anorexia/vomiting even with normal glucose → urgent vet) was ALREADY correct
and appropriately hard-hitting — no changes needed there, matches real-world EU pharmacovigilance reports of
fatal eDKA in cats improperly switched from insulin. "First-line option... but with clear conditions" framing
for SGLT2i verified accurate against 2025 iCatCare/AAHA guidance (SGLT2i now positioned as alternative
first-line for well-selected insulin-naive cats, not superior/preferred over insulin generally) — not an
overstatement. Fixed via WebSearch-verified facts (all edits applied ru+en):
1. Bexacat FDA approval date was off by one day: app said Dec 8 2022 → corrected to **Dec 9, 2022** (FDA/
   Elanco press release consensus date).
2. Senvelgo FDA approval date used the BI press-release date (Aug 14, 2023) instead of the official FDA
   approval date **Aug 10, 2023** (per FDA FOI Summary — "Date of Approval: August 10, 2023"). Note for future:
   company announcement dates commonly lag 2-5 days behind the actual FDA approval date — prefer the FOI
   summary date when both are available.
3. Added missing fact: Bexacat is a FIXED 15mg dose (not weight-scaled) and only indicated for cats **≥~3kg
   (6.6 lb)** — relevant because many diabetic cats are underweight from PU/PD weight loss and could be
   ineligible.
4. Added missing fact: Senvelgo is ALSO EMA-approved in the EU (Nov 2023) — the article previously implied
   both drugs were USA-only + unavailable in RU/CIS, which under-informed EU/UK users (a real DiaPet region).
   No confirmed Bexacat EU/UK approval found as of this audit — flagged as "no confirmed approval" rather
   than "unavailable" (open-ended, don't assert an absence you can't fully verify).
5. **Detemir/Levemir discontinuation date was mis-stated as a single global date.** dog-insulin.ts and
   dog-insulin-brands.ts both said "флаконы сняты с 31.12.2024" as if globally true. Verified: Novo Nordisk's
   decision to discontinue IS global, but the Dec 31 2024 vial cutoff is **US-market only** — UK/EU supply
   continues to ~late 2026, Canada to ~end 2025, Russia timeline unconfirmed. Corrected all instances (ru+en)
   to state the US date explicitly and note EU/UK runs ~2 years longer. **Pattern for future audits: any
   claim about a drug/insulin being "discontinued"/"withdrawn" needs a per-region timeline check — global
   manufacturer decisions routinely have staggered, multi-year regional wind-down dates, and DiaPet's
   audience spans exactly the regions (RU/EU/UK) most likely to be misled by a US-centric date.**
Toujeo/Tardo et al. JVIM 2024 citation for dogs verified correct (Tardo et al., JVIM 38(4):2120-2128, 2024,
dose titration protocol for once-daily IGla300 in dogs) — no change needed. tsc 0 after all edits.
