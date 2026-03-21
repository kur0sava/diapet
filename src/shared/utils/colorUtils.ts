/**
 * Safely apply alpha to a hex color string.
 * Handles both 6-char (#RRGGBB) and 8-char (#RRGGBBAA) hex colors.
 */
export function withAlpha(hex: string, alpha: number): string {
  // Strip existing alpha from 8-char hex
  const base = hex.length === 9 ? hex.slice(0, 7) : hex;
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${base}${a}`;
}
