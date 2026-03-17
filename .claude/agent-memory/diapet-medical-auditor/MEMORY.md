# DiaPet Medical Auditor Memory
## Audit v1 — Completed 2026-02-28

## Key File Locations (Medical Data)
- `src/storage/domain/types.ts` — GLUCOSE_RANGES, getGlucoseLevel, conversion functions (lines 139-156)
- `src/storage/database/repositories/glucoseRepository.ts` — mmolToMgdl/mgdlToMmol (lines 5-6)
- `src/features/feedCalculator/utils/calculateDryMatter.ts` — DMB formula (lines 20-53)
- `src/features/encyclopedia/data/articles.ts` — 5 encyclopedia articles
- `src/features/encyclopedia/data/diabeticFoods.ts` — food DB + DIABETIC_NUTRITION_GUIDELINES
- `src/features/emergency/screens/EmergencyScreen.tsx` — emergency protocols (i18n-driven)
- `src/shared/i18n/locales/ru.ts` / `en.ts` — all medical text (emergency, glucose ranges, norms)
- `src/features/glucose/screens/LogGlucoseScreen.tsx` — dose warning threshold (line 87)
- `src/features/glucose/screens/LogInjectionScreen.tsx` — dose warning threshold (line 47)
- `src/features/dashboard/components/GlucoseChart.tsx` — NORMAL_MIN/MAX constants (lines 11-12)

## Audit v2 — Completed 2026-03-16
New files audited: hintsContent.ts (137 hints), aiSystemPrompt.ts, AssessmentScreen.tsx, en.ts/ru.ts (full), LogInjectionScreen.tsx, LogGlucoseScreen.tsx (dose logic).

### New Findings (Audit v2 — not in v1)

**CRITICAL:**
- N1: **Dose hard limit = 20 IU** in both LogGlucoseScreen.tsx:183 and LogInjectionScreen.tsx:85. ISFM absolute upper limit for feline insulin = 10 IU (Rand et al. 2012; ISFM 2023). Some exceptional cases may reach 10-12 IU under specialist guidance, but 20 IU is not defensible as an absolute ceiling. Should be 10 IU max with mandatory vet warning above 6 IU.
- N2: **i18n text "doseAbsoluteLimitDesc" states "Maximum dose for a cat is 20 units"** — this incorrect maximum will be read by users as clinical fact.

**HIGH:**
- N3: **Assessment scoring**: max score = 16 (8 questions × 2). Thresholds: mild ≤5 (31%), moderate ≤11 (56%), severe >11. No peer-reviewed basis for these numeric thresholds. Symptomatic DKA signs (ketone smell=2, vomiting=2) alone = 4 points — still "mild". Add rapid score path for DKA-only symptoms.
- N4: **Glucose hint glu_w2_05**: "Apply honey or syrup to the gums" for hypoglycemia without first checking if cat is conscious. Should not advise oral glucose without consciousness check (consistent with emergency screen step 1 which already has this caveat — but hints do not).
- N5: **AI prompt**: target glucose 5–14 mmol/L (90–250 mg/dL). Upper range 14 mmol/L is the app's "high" threshold. AAHA 2018 / ISFM 2023 target is 5–12 mmol/L pre-meal. 14 mmol/L as "acceptable" in AI response may lead owners to accept suboptimal control.
- N6: **AI prompt**: "below 3.5 mmol/L (63 mg/dL) is low" — but app's clinical hypoglycemia threshold is 2.8 mmol/L. Inconsistency between AI prompt and emergency screen threshold.

**MEDIUM:**
- N7: **inj_w3_d5e hint**: "You don't need to disinfect your cat's skin before injecting — cat fur is clean" — partially accurate but misleading. The correct statement is that alcohol swabbing is not routinely recommended (ISFM), but the reasoning "cat fur is clean" is incorrect and could be misinterpreted in unhygienic conditions.
- N8: **inj_w2_d4m hint**: "Insulin starts working 1–3 hours after injection" — true for glargine/detemir onset. NPH/Caninsulin: onset 1-2h. PZI: onset 1-4h. Range is acceptable but not insulin-specific.
- N9: **glu_w2_02 hint**: "Glucose above 20 mmol/L for several days" — threshold for vet contact. More conservative guidance suggests contact at >15-16 mmol/L sustained (ISFM 2023). 20 mmol/L = 360 mg/dL is a high bar before recommending vet consultation.
- N10: **Assessment "mild" stage description**: "Diabetes appears well-controlled" — users scoring 5/16 could have polyuria (2) + polydipsia (2) + weight loss (1) = 5 points and be told "well-controlled". These are classic active diabetes signs, not well-controlled signs.
- N11: **RU injection list** lacks Vetsulin — present in EN list, absent in RU. Caninsulin (=Vetsulin) is available in Russia as Caninsulin, so RU list should explicitly include it.

**LOW:**
- N12: **Syringe needle length hint** (inj_w2_d5m): "4–6 mm barrel" — "barrel" should be "needle length". 4–6 mm needle is correct for subcutaneous injection in cats.
- N13: **Morning glucose hint** (morn_w2_03): "Morning glucose — before feeding and injection — gives a baseline level" — technically this is the pre-injection nadir/pre-dose value, not a fasting baseline in the traditional sense. Acceptable for lay audience.
- N14: **Hint inj_w4_d4m**: "Infections — even minor ones — can increase insulin needs" — clinically accurate. No issue.

## Confirmed Issues (Audit v1)

### CRITICAL — Safety
1. **Dose warning at >15 IU** (LogGlucose:87, LogInjection:47) — dangerously high for cats. ISFM max starting = 2 IU. Should warn at >6 IU.
2. **Hypoglycemia step 1 uses oral glucose for ALL states** — must add: if unconscious/seizuring, NO oral glucose, IV dextrose only. Current protocol unsafe for severe hypo.
3. **No distinction between mild/moderate/severe hypoglycemia** in emergency screen — all treated identically.

### HIGH — Clinical Accuracy
4. **GLUCOSE_RANGES.low threshold = 4.0 mmol/L** — app labels anything <4.0 as "low/critical". But ISFM clinical hypoglycemia = <3.3 mmol/L (60 mg/dL). Values 3.3-4.0 are sub-optimal but NOT emergency. Conflates monitoring target with emergency threshold.
5. **Input validation boundary mismatch**: mmol/L max=35 (=631 mg/dL) vs mg/dL max=600 — inconsistent upper limits when user switches units.
6. **DMB calculator: no negative carbs guard** — if ash field omitted (=0) and actual ash is 5-8%, carbs calculation inflated by 5-8%. Should warn when ash=0.
7. **Fat standard inconsistency**: diabeticFoods.ts says 15-25% DM, calculator says <=45%, i18n says 25-45%. Three conflicting values.
8. **Diagnostic threshold in articles**: "glucose >14-16 mmol/L" (articles.ts line 49) — ISFM uses persistent fasting hyperglycemia + glucosuria + clinical signs. Numeric threshold alone is oversimplified.

### MEDIUM — Content Gaps
9. **No PZI/ProZinc insulin** in commonInsulins lists — primary veterinary insulin in USA, available globally. EN list has Protaphane (not common in US).
10. **Glargine/Lantus listed without concentration warning** — U-100 vs U-300 confusion risk; app does not mention syringes or concentrations.
11. **No fructosamine reference** in encyclopedia — key monitoring metric for FDM, normal 170-340 umol/L.
12. **Remission confirmation threshold** (articles.ts): "<8 mmol/L without insulin for 4 weeks" — ISFM uses euglycemia <6-7 mmol/L (108-126 mg/dL) sustained 4 weeks. 8 mmol/L (144 mg/dL) is borderline acceptable range, not true euglycemia.
13. **No AlphaTRAK 2 / FreeStyle Libre mention** in encyclopedia — owners need guidance on veterinary glucometers.
14. **Stress hyperglycemia threshold**: article says "up to 20 mmol/L" — conservative, actual data shows stress can reach 15-17 mmol/L in cats, literature varies.
15. **Neuropathy B12 dose**: "0.5-1 mg/kg" methylcobalamin — dose is per cat (not per kg) in most protocols: 0.5-1 mg per cat PO daily.

### LOW — Minor
16. **RC DS46 dry carbsDM=20% in database** — RC official data shows ~20% DM which is above recommended <12%. App correctly shows "bad" verdict for this food. But it IS listed as "prescription" — note in database is accurate.
17. **Hills w/d carbsDM=34%** — correctly flagged with warning note in food database.
18. **Insulin storage**: article says "28 days for Glargine" — correct. Detemir is 42 days. PZI is 28 days.

## Conversion Factor
- App uses 18.0156 (based on MW of glucose = 180.156 g/mol). Correct MW = 180.1559 g/mol → factor 18.01559. Deviation = 0.00001 (0.0001%) — clinically negligible, acceptable.
- All boundary value conversions within 0.01 mmol/L — safe.
- Comment in code states "180.156 g/mol" — this is correct, matches IUPAC 2021.

## DMB Formula Assessment
- Core formula correct: carbs = 100 - P - F - Fi - Ash - M; carbsDM = carbs/DM*100
- Division by zero protected (moisture=100% returns null)
- Sum >100% protected (returns null)
- MISSING: negative carbs guard (when ash=0 and nutrients sum near 100)
- Verdict thresholds: good<10%, acceptable<=15% — slightly more conservative than ISFM 20% ceiling, acceptable.

## Country Coverage
- RU: Good — local brands (Craftia, Solid Natura), major platforms (Ozon, WB, 4lapy)
- US: Good — major prescription brands, Fancy Feast, Chewy/Petco
- EU/DE/UK: Adequate — Zooplus, German brands
- MX: Store data only, no food data — gap
- JP/KR/BR: Defined as regions but NO food data, NO stores
