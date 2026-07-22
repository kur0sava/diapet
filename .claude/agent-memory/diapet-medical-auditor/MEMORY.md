# DiaPet Medical Auditor Memory

## Index
- [file_locations.md](file_locations.md) — where medical constants/calculators live in the codebase (speciesConfig.ts is the SSOT; check cat+dog both).
- [clinical_facts.md](clinical_facts.md) — verified conversion factor, DMB formula, region coverage, feline/canine numeric thresholds, and the recurring "two parallel engines must agree" bug pattern.
- [open_issues.md](open_issues.md) — **read first**: unresolved cross-article contradictions found but not yet fixed (1 CRITICAL missed-dose table contradiction, 1 MEDIUM dog threshold, 1 LOW % mismatch).
- [audit_history.md](audit_history.md) — chronological log of all audit batches (v1-v3, Batch 8-12) with what was fixed vs. confirmed clean.

## Quick Orientation for a New Audit Pass
1. **Start with open_issues.md** — those are known, still-broken items; don't re-discover them from scratch, just check if they're now in scope to fix.
2. **speciesConfig.ts** (`src/shared/config/speciesConfig.ts`) is ground truth for all numeric thresholds (glucose ranges, insulin dose limits, Somogyi nadir/rebound, nutrition DM%). Any article or calculator claim should trace back to it.
3. When auditing new encyclopedia articles, the fastest validation technique is grepping the same fact/number across `src/features/encyclopedia/data/articles/` — this codebase drafts new articles from older vetted ones as templates, so a claim either matches an existing sourced one (fine) or is the first appearance (needs real scrutiny). Also always diff a new safety-critical article's central thesis against what its `relatedArticleIds` actually say — cross-article contradictions (not just single-article errors) are the main class of bug found so far.
4. Grep for literal `* 18` / `/ 18` near glucose values — a hardcoded mg/dL⇄mmol/L factor drifting from `MGDL_PER_MMOLL` is a recurring failure mode.
5. Cat and dog configs/thresholds live side by side in the same files — always check both species when validating a threshold, and check both `hypoglycemia.ts`/`dog-hypoglycemia.ts`-style species-pair articles for symmetry.
6. Scope discipline: past tasks have been "audit these N named files only" — flag out-of-scope contradictions in open_issues.md rather than silently editing files outside the task's file list.
