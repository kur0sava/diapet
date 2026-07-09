/**
 * The bundled food data must always round-trip through the manifest schema —
 * this is what gets published to the diapet-foods-data repo, and what old
 * clients will validate against.
 *
 * Doubles as the manifest GENERATOR (jest resolves the TS path aliases the
 * data files use, so a plain node script can't import them):
 *
 *   WRITE_FOODS_MANIFEST=1 npx jest foodsManifest
 *
 * writes ./foods-manifest.json (repo root) ready to be committed to the
 * diapet-foods-data repo.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  validateManifest,
  MANIFEST_SCHEMA_VERSION,
  BUNDLED_GENERATED_AT,
  type FoodsManifest,
} from '@features/encyclopedia/data/foodCatalog';
import { ALL_CAT_FOODS, ALL_DOG_FOODS } from '@features/encyclopedia/data/diabeticFoods';

function buildManifestFromBundled(): FoodsManifest {
  return {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    generatedAt: BUNDLED_GENERATED_AT,
    foods: { cat: ALL_CAT_FOODS, dog: ALL_DOG_FOODS },
  };
}

describe('foods manifest generation', () => {
  it('bundled data forms a valid manifest (nothing dropped by validation)', () => {
    const manifest = buildManifestFromBundled();
    const validated = validateManifest(JSON.parse(JSON.stringify(manifest)));
    expect(validated).not.toBeNull();
    expect(validated!.foods.cat.length).toBe(ALL_CAT_FOODS.length);
    expect(validated!.foods.dog.length).toBe(ALL_DOG_FOODS.length);
  });

  it('food ids are unique across the whole catalog', () => {
    const ids = [...ALL_CAT_FOODS, ...ALL_DOG_FOODS].map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  (process.env.WRITE_FOODS_MANIFEST ? it : it.skip)('writes foods-manifest.json', () => {
    const manifest = buildManifestFromBundled();
    const path = join(__dirname, '..', '..', 'foods-manifest.json');
    writeFileSync(path, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    // eslint-disable-next-line no-console
    console.log(`foods-manifest.json written: ${path}`);
  });
});
