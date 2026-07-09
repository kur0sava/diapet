# DiaPet — self-updating food catalog data

`foods-manifest.json` is the curated list of diabetic cat & dog foods the app
pulls at runtime so the catalog stays current **without an app release**. See
`src/features/encyclopedia/data/foodCatalog.ts` for the client that consumes it.

## How it works (3 layers, best available wins)

1. **bundled** — `ALL_CAT_FOODS` / `ALL_DOG_FOODS` compiled into the APK.
2. **cache** — last successfully downloaded manifest (MMKV), survives offline.
3. **remote** — this `foods-manifest.json`, served from a public git repo over
   `raw.githubusercontent.com`.

A downloaded manifest is only adopted if it is **strictly newer** than the
bundled data (`generatedAt`) and passes validation. Any network / JSON /
schema failure silently falls back to the previous layer — the user never
sees an empty catalog.

## Publishing an update

The runtime default URL is:

```
https://raw.githubusercontent.com/kur0sava/diapet-foods-data/main/foods-manifest.json
```

Create the public `diapet-foods-data` repo (separate from the app so the data
outlives any single app release, and the community can send PRs) and commit
`foods-manifest.json` to its `main` branch. Override the URL for a build via
the `FOODS_MANIFEST_URL` env var (wired in `app.config.ts`).

## Regenerating from the bundled data

The manifest in this folder is generated from the app's bundled food data so
the two never drift:

```
WRITE_FOODS_MANIFEST=1 npx jest foodsManifest
```

writes `foods-manifest.json` to the repo root (move it here). Bump
`BUNDLED_GENERATED_AT` in `foodCatalog.ts` whenever the bundled data changes,
or a fresher app build would be shadowed by an older cached download.

## Schema

```jsonc
{
  "schemaVersion": 1,            // clients ignore a NEWER major schema
  "generatedAt": "ISO-8601",
  "foods": {
    "cat": [ /* DiabeticCatFood[] */ ],
    "dog": [ /* DiabeticCatFood[] */ ]
  }
}
```

Each food entry must satisfy `isValidFood` (see `foodCatalog.ts`): non-empty
`id` / `brand` / `product`, `type` ∈ {dry,wet,both}, `category` ∈
{prescription,veterinary,otc_low_carb}, boolean `prescriptionRequired`, a
non-empty `regions` array of valid region codes, and finite numeric macros.
Invalid rows are dropped; a manifest with implausibly few rows (cat < 10 or
dog < 5) is rejected wholesale to guard against truncated uploads.
