---
name: open_issues
description: Unresolved cross-article medical contradictions found during audits but not fixed (out of scope at the time) — check these first on the next pass.
metadata:
  type: project
---

## CRITICAL — Cross-Article Contradiction (found Batch 11, 2026-07-22, still UNRESOLVED)
`hypoglycemia.ts` (cat, existing/canonical) contains a "Пропущенная инъекция — таблица действий" /
"Missed Injection — Action Table" that instructs owners to **self-calculate and inject a partial dose**
by elapsed time (менее 2ч→100%, 2-4ч→50-75%, 4-6ч→50%, >6ч→skip) with NO vet call required before dosing.
This directly contradicts `missed-double-insulin.ts` (species:'all', added Batch 11)'s central safety
thesis: never self-adjust a missed dose, confirm partial-dose decisions with the vet ("это его решение, а
не ваша самодеятельность"), missed is always safer than double. The two articles are cross-linked
(relatedArticleIds) so a user reading both gets contradictory instructions on the exact question both call
"the most nerve-wracking." `dog-hypoglycemia.ts` has NO such table (asymmetric — only the cat article has
this legacy self-dosing table).
**Action needed**: either remove/soften the percentage table in hypoglycemia.ts (defer to vet like the
newer article does) or explicitly reconcile the two. Was out of scope for the Batch 11 task (only 6 named
files could be touched) — fix this the next time hypoglycemia.ts is in scope.

## MEDIUM — dog-hypoglycemia.ts emergency threshold stale
`dog-hypoglycemia.ts` states emergency threshold "ниже 2.2 ммоль/л" for dogs, but `speciesConfig.ts`
DOG_CONFIG.glucose.emergencyLow=2.8 (2.2 is severeLow). The newer `dog-cgm-monitoring.ts` (Batch 11)
correctly uses 2.8 for dog emergency, matching config — so it's dog-hypoglycemia.ts that's stale/
inconsistent with the config's 3-tier model (severeLow 2.2 < emergencyLow 2.8 < normalLow 3.3), not the
new article. Fix dog-hypoglycemia.ts next time it's in scope.

## RESOLVED (verify once more, then delete) — human glucometer underestimation % mismatch
Previously: `cost-planning.ts` said "10-15%" vs `pet-glucometer-vs-human.ts`'s "10-30%". As of Batch 13
(2026-07-22), cost-planning.ts now reads "10-30%" in both ru/en — matches. Appears fixed by someone else's
pass in the interim; confirm once more next audit and then remove this entry.

## HIGH — real-life-management.ts has a THIRD article giving a time-based missed-dose table (found Batch 13,
2026-07-22, unresolved, out of scope for that batch's file list restrictions — NOT edited)
`real-life-management.ts`'s "Опоздали с инъекцией" section gives its own elapsed-time table (≤2h full dose,
2-4h full dose + shift next, >6h skip) with no explicit "confirm with vet first" framing, in the same spirit as
the hypoglycemia.ts table already flagged CRITICAL above. It doesn't do %-partial-dosing (so it's less acute
than the hypoglycemia.ts table) and its bottom-line advice (never double, when in doubt skip) is directionally
correct, but it still hands the reader a self-serve decision table on the exact question missed-double-
insulin.ts's whole thesis is "this is the vet's call, not yours." When hypoglycemia.ts is finally reconciled,
also revisit real-life-management.ts's table for the same softening (e.g. "as a general guide, but always
confirm with your vet") — three articles independently answering "what do I do about a late shot" is one too
many sources of truth for a safety-critical question.

## MEDIUM — %DM vs %ME carbohydrate metric conflation (found Batch 13, 2026-07-22, not a same-day fix)
2025 iCatCare consensus guidelines (Taylor et al., JFMS 2025) frame diet carb targets in **%ME (metabolizable
energy)**: "<25% DM / <15% ME / <5g/100kcal" generally, "ideally ≤12% ME" for cats targeting remission. DiaPet's
cat nutrition content (cat-reading-food-labels.ts, diet.ts, DIABETIC_NUTRITION_GUIDELINES_CAT constant in
diabeticFoods.ts) is uniformly framed in **%DM** (ideal 7%, max 15%), which is a different metric that happens
to usually track %ME fairly closely for typical wet cat food but diverges for higher-fat formulations (%DM carb
runs lower than %ME carb as fat% rises, since fat is calorie-dense). The app's %DM figures are stricter/safer
than iCatCare's %DM-equivalent figure (<25%), so this isn't a dangerous error, just a metric inconsistency
worth a maintainer's attention — not urgent, no edit made.

## LOW — DIABETIC_NUTRITION_GUIDELINES_CAT vs CAT_CONFIG.nutrition drift (found Batch 13, 2026-07-22, NOT
edited — both files out of scope for the 17-article task)
`diabeticFoods.ts`'s `DIABETIC_NUTRITION_GUIDELINES_CAT` has `carbsIdealPercent: 7, carbsMaxPercent: 15`, but
`speciesConfig.ts`'s `CAT_CONFIG.nutrition` has `carbsDMGood: 10, carbsDMAcceptable: 15` — the "ideal/good"
threshold differs (7 vs 10) between the two engines even though "max/acceptable" agrees (15 both). This is
another instance of the "two parallel engines must agree" pattern (see clinical_facts.md) — worth reconciling
next time either speciesConfig.ts or diabeticFoods.ts is in scope; low severity since the disagreement is only
at the "good" boundary, both engines still gate "bad" food at the same 15% DM ceiling.

## LOW-uncertain — methylcobalamin dose for feline diabetic neuropathy (found Batch 13, 2026-07-22, NOT edited
— evidence level too weak/contested to correct confidently either direction)
`neuropathy.ts` states 0.5-1mg PO once daily. Secondary veterinary/consumer sources cite anywhere from 0.25mg
(Cobalequin-style GI-deficiency dosing) up to 3-5mg once daily for neuropathy specifically; there is no
controlled feline dosing study for this indication (dvm360's own "Managing complications in diabetic cats"
piece says explicitly there's no research supporting methylcobalamin for feline peripheral neuritis, just
anecdotal practice). App's 0.5-1mg is within the plausible/conservative end of the range — left unedited per
audit rule (don't correct contested Level-D numbers without a real source pinning down a specific value).
