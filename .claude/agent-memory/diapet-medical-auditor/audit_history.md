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

## Batch 13 (2026-07-22) — external WebSearch fact-check of 17 cat articles (first EXTERNAL-source pass,
not just internal cross-referencing) — injection-technique, first-days, flexible-monitoring, real-life-
management, ketone-testing, common-mistakes, choosing-vet, cost-planning, neuropathy, dental-disease,
pancreatitis-diabetes, cat-life-expectancy, cat-why-diabetes, cat-diabetes-myths, cat-remission-signs,
cat-no-remission, cat-foods-to-avoid, cat-reading-food-labels, cat-home-diet. Verified against real 2025
iCatCare guidelines (Taylor et al., JFMS, sagepub DOI 10.1177/1098612X251399103), Xenoulis & Fracassi 2022
pancreatitis/DM comorbidity review, dental/insulin-resistance literature, Mizisin neuropathy papers, AlphaTrak
product-generation facts. Edits made (all ru+en, tsc 0 after):
1. **ketone-testing.ts had 4 leftover inline-prose "ISFM 2023" citations** (RU x2, EN x2) — the references
   array had already been fixed to 2025 iCatCare in an earlier pass but the body prose citations were missed.
   "ISFM 2023" does not correspond to any real guideline document (the actual current ISFM/iCatCare cat DM
   guideline is the 2025 Taylor et al. consensus, superseding 2015 Sparkes et al.) — replaced all 4 with
   "2025 iCatCare Consensus Guidelines". **Same phantom "ISFM 2023" string still exists in dka.ts (2 occurrences)
   and stress-hyperglycemia.ts (2 occurrences) — both OUT OF SCOPE for this batch (not in the 17-file list),
   flagged in open_issues.md, fix next time either file is in scope.**
2. **3 reference citations had wrong/paraphrased journal or title** (author+year were right, title/journal
   were not — a different failure mode than the fully-fictitious "ISFM 2023"): ketone-testing.ts's O'Brien
   2010 citation said "Diabetic Ketoacidosis in Cats, Veterinary Clinics" — real title is "Diabetic Emergencies
   in Small Animals," Vet Clin North Am Small Anim Pract 40(2):317-33; pancreatitis-diabetes.ts's Xenoulis 2015
   citation said "Feline pancreatitis, JFMS" — real is "Diagnosis of Pancreatitis in Dogs and Cats," Journal of
   Small Animal Practice 56(1):13-26; dental-disease.ts's dental guideline said "AAFP/AAHA Dental Care
   Guidelines... 2019" — real 2019 guideline is AAHA-only (JAAHA 55(2):49-69), no AAFP co-authorship (AAFP/AAHA
   jointly published a *different*, later document — the 2021 Feline Life Stage Guidelines — not the dental
   one). All three fixed to the verified real title/journal. **Technique for future audits: even when a
   reference "looks real" (plausible author+year), verify the actual title/journal string — paraphrased/
   drifted citations are as easy to introduce as fully fictitious ones and just as misleading to a reader who
   tries to look the source up.**
3. **neuropathy.ts recovery-time window was too narrow**: said "1 to 6 months" for full resolution; multiple
   sources (dvm360, canadianinsulin.com, secondary summaries of Mizisin's work) consistently describe full
   resolution as taking up to **6-12 months**, with only *early/subtle* improvement visible within weeks.
   Widened to "1 to 12 months (6-12 months in some cats), early improvement often within weeks" — avoids
   worrying an owner whose cat hasn't fully recovered by month 6. Also fixed neuropathy.ts's Mizisin reference:
   said "Feline Diabetic Neuropathy, Veterinary Pathology, 2007" — no such paper exists; the real 2007 Mizisin
   paper is "Comparable Myelinated Nerve Pathology in Feline and Human Diabetes Mellitus," Acta Neuropathologica
   113:431-442 (there's also a 2002 J Neuropathol Exp Neurol clinical paper and a 2008 Microvascular Research
   endoneurial-pathology paper by the same group, neither titled/journaled as the app stated).
4. **AlphaTRAK 2 → AlphaTRAK 3**: Zoetis launched AlphaTrak 3 in the US Feb 2023 and discontinued AlphaTrak 2
   test strips by Sept 2023 — by 2026 recommending "AlphaTRAK 2" as the current buy is stale (~3 years out of
   date). Updated first-days.ts (shopping list) and cost-planning.ts (both RU/US-EU rows) to reference
   AlphaTRAK 3 as current, noting AlphaTrak 2 strips are discontinued. Also softened first-days.ts's blanket
   "a human [glucometer] works too" to note it typically reads low for cats (matches cost-planning.ts's own
   10-30% underestimation caveat, previously only present in that one file).
Findings NOT edited (uncertain/contested, flagged for humans instead — see open_issues.md): methylcobalamin
dose for neuropathy (app says 0.5-1mg PO SID; secondary vet sources cite anywhere from 0.25mg to 3-5mg —
evidence is Level D/anecdotal either way, no controlled feline dosing study exists, app's number is within the
plausible/conservative range so left alone); iCatCare 2025's diet-carb targets are framed in **%ME (metabolizable
energy)**, not %DM — guideline text is "<25% DM / <15% ME / <5g/100kcal" generally, "ideally ≤12% ME" for
remission-focused cats — DiaPet's articles and DIABETIC_NUTRITION_GUIDELINES_CAT constant are all %DM-framed
(ideal 7%, max 15%) which is stricter/safer than iCatCare's %DM figure (<25%) and not clearly wrong, but the
ME-vs-DM metric conflation is a subtlety worth a maintainer's eye, not a same-day fix. Also noted: cost-
planning.ts's "10-15%" vs pet-glucometer-vs-human.ts's "10-30%" human-meter-underestimation mismatch flagged in
open_issues.md (Batch 11) **appears already resolved** — cost-planning.ts now reads "10-30%" in both languages,
matching pet-glucometer-vs-human.ts. Remove that LOW item from open_issues.md if a future audit confirms it's
still consistent.
