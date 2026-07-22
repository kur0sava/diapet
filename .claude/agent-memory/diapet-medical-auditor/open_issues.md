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

## LOW — human glucometer underestimation % mismatch between two articles
`cost-planning.ts` says human glucometers underestimate cat glucose by "10-15%"; `pet-glucometer-vs-human.ts`
(Batch 11) says "10-30%, иногда сильнее". Both plausible per literature (Cohn et al. 2000 JAVMA found larger
errors at high glucose in some meter/species pairs) but the two in-app numbers don't match each other —
reconcile when either file is next touched.
