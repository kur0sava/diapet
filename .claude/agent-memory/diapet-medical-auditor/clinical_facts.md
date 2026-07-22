---
name: clinical_facts
description: Verified clinical constants (conversion factor, DMB formula, region coverage, feline/canine thresholds) and the recurring "two parallel engines must agree" bug pattern in DiaPet.
metadata:
  type: project
---

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

## Key Feline/Canine Clinical Facts (for hint/encyclopedia validation)
- ProZinc (U-40) and Caninsulin (U-40): BOTH require refrigeration after opening (suspensions) — this is
  now correct throughout speciesConfig.ts and the articles (was previously wrong in one place, since fixed).
- AlphaTRAK 2: code 7 for CATS, code 10 for dogs — wrong code = wrong result (check if this ever gets
  surfaced in-app; as of last check it's only mentioned in article prose, not a live calculator).
- Glargine PK in cats: onset 1-3h, peak 4-8h, duration 10-16h — correct in speciesConfig.ts and
  insulin_types.ts as of Batch 8. PZI PK: onset 1-4h, peak 3-8h, duration 8-16h (aligned across
  speciesConfig.ts and insulin_types.ts in Batch 8 — they had drifted apart, see Batch 8 notes).
- Clinical hypoglycemia threshold cats: emergencyLow 2.8 mmol/L (~50mg/dL), severeLow 2.2 mmol/L.
  Range 3.3-4.0 = below_target (monitor), NOT emergency. Dogs share the same emergencyLow/severeLow
  (2.8/2.2) per Nelson & Couto / Feldman & Nelson — deliberately aligned with cats. NOTE: dog-hypoglycemia.ts
  article itself is stale on this — see open_issues.md.
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

## SGLT2 Inhibitors (cats only) — Verified Facts (Batch 12, 2026-07-22)
- Bexacat (bexagliflozin, Elanco): FDA-approved **Dec 9, 2022** (not Dec 8 — common off-by-one in secondary
  sources). Fixed 15mg tablet once daily, NOT weight-scaled; only for cats **≥~3kg/6.6lb**. US-only as of this
  audit, no confirmed EU/UK approval.
- Senvelgo (velagliflozin, Boehringer Ingelheim): FDA-approved **Aug 10, 2023** per FDA FOI Summary (company
  press release was Aug 14 — press-release dates commonly lag the real FDA approval date by several days,
  prefer the FOI summary date). ALSO EMA-approved in the EU, **Nov 2023** — don't describe these drugs as
  "USA-only", EU/UK vets can prescribe Senvelgo.
- Both are contraindicated in cats currently or ever on insulin, and in cats with reduced beta-cell reserve/
  ketosis tendency/DKA history — eDKA (euglycemic DKA, normal glucose + ketoacidosis) is the key risk, and
  real EU pharmacovigilance has recorded fatal eDKA cases in cats improperly switched from insulin to an
  SGLT2i. Candidate = newly diagnosed, insulin-naive, otherwise healthy, preserved beta-cell reserve — this
  "first-line option with conditions" framing matches 2025 iCatCare/AAHA guidance, not an overstatement.

## Drug/Insulin Discontinuation Dates — Always Check Per-Region, Not Just "Global"
Levemir/detemir (Novo Nordisk) is a real example: the decision to discontinue is global, but the vial
cutoff date is NOT uniform — US Dec 31 2024, Canada ~end 2025, UK/EU ~late 2026, Russia unconfirmed. A
DiaPet article stating one hard date as if it applied everywhere will be wrong for most of the app's
actual regions (RU/EU/UK). When auditing any "X is being discontinued/withdrawn" claim, search for the
region-specific timeline before accepting a single date — see dog-insulin.ts/dog-insulin-brands.ts fix.

## External Verification Facts (Batch 13, 2026-07-22 — first pass checking articles against real
literature/WebSearch rather than only cross-referencing other DiaPet articles)
- **AlphaTrak generations**: AlphaTrak 3 launched in the US Feb 6, 2023 (Zoetis); AlphaTrak 2 test strips were
  discontinued by Sept 2023. As of 2026, any article still recommending "AlphaTRAK 2" as the current buy is
  ~3 years stale — should say AlphaTRAK 3. AlphaTrak of any generation remains unavailable in Russia (Contour
  Plus / Сателлит Экспресс are the RU-market recommendations, correctly used throughout the app).
- **2025 iCatCare Consensus Guidelines (Taylor et al., JFMS, DOI 10.1177/1098612X251399103)** is the real,
  verifiable, current guideline — supersedes 2015 Sparkes et al. ISFM guidelines. It frames diet carb targets
  in **%ME (metabolizable energy)**, not %DM: "<25% DM / <15% ME / <5g/100kcal" generally, "ideally ≤12% ME" for
  cats being pushed toward remission. DiaPet's own content is %DM-framed (ideal 7%, max 15%) — stricter/safer,
  not wrong, but a different metric (see open_issues.md MEDIUM item).
- **Diabetic neuropathy**: ~10-11% of diabetic cats show plantigrade stance at diagnosis. Full resolution with
  good glycemic control typically takes up to 6-12 months (early/subtle improvement can appear within weeks) —
  a narrower "1-6 months" claim understates the tail and can needlessly worry an owner at month 7.
  Methylcobalamin dosing for this specific indication is Level D/anecdotal — cited doses range 0.25-5mg across
  sources, no controlled feline study exists; don't "correct" this number without a real source pinning a value.
- **Pancreatitis/DM comorbidity**: literature range is 31-83% of diabetic cats showing clinical/lipase evidence
  of pancreatitis (Xenoulis & Fracassi 2022) — DiaPet's "50-80%" framing sits inside that range, fine as-is.
  Guideline framing is "screen at least once" for pancreatitis in every diabetic cat, not necessarily routine
  repeat fPLI every 3-6 months — the app's "recheck every 3-6 months" framing is a plausible clinical judgment
  for a cat with *known* chronic pancreatitis specifically, not a guideline mandate for all diabetic cats.
- **Dental disease ↔ insulin resistance**: real, bidirectional, well-supported mechanism (chronic periodontal
  infection → IL-6/TNF-α → insulin resistance; hyperglycemia → impaired immune/gum defense). Post-extraction
  improved glycemic control / reduced insulin need is a real, reported clinical outcome, not an overclaim.
- **Reference-string accuracy is a distinct failure mode from fully fictitious citations**: a citation can have
  the *correct author and year* but a wrong/paraphrased title or journal (e.g. neuropathy.ts's Mizisin 2007
  cite said "Veterinary Pathology" — the real 2007 Mizisin paper is in Acta Neuropathologica; ketone-testing.ts's
  O'Brien 2010 cite had a paraphrased title). These are just as misleading to a reader trying to look the source
  up as a fully invented reference, and don't get caught by only checking "does this author/year combo look
  plausible" — always search the exact title string. Also watch for **phantom inline-prose citations that
  don't match the references array**: ketone-testing.ts had 4 "ISFM 2023" mentions in body text even though its
  references array had already been corrected to "2025 iCatCare" in an earlier pass — the fictitious tag
  survives in prose after the reference list is fixed unless both are grepped and fixed together. Same
  "ISFM 2023" ghost string still lives in dka.ts and stress-hyperglycemia.ts as of 2026-07-22 (out of scope for
  Batch 13, flagged in open_issues.md).

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
- Two full encyclopedia articles giving conflicting instructions on the same safety-critical question
  (found Batch 11: hypoglycemia.ts vs missed-double-insulin.ts) — see open_issues.md. Always diff a new
  safety article's central thesis against what its relatedArticleIds actually say, not just check it alone.
