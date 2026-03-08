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
- App uses 18.018 (deviation from correct 18.0182 = 0.0011%) — clinically negligible, acceptable.
- All boundary value conversions within 0.01 mmol/L — safe.

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
