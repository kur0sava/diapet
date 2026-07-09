/**
 * Test-only replacement for expo-localization. Matches the API surface the
 * app uses (regionConfig.detectRegionFromDevice).
 */
export interface MockLocale {
  languageCode: string | null;
  regionCode: string | null;
}

let locales: MockLocale[] = [{ languageCode: 'ru', regionCode: 'RU' }];

export function getLocales(): MockLocale[] {
  return locales;
}

/** Test helper: override the device locale for a scenario. */
export function __setLocales(next: MockLocale[]): void {
  locales = next;
}
