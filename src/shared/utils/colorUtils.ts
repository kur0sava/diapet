/**
 * Safely apply alpha to a hex color string.
 * Handles both 6-char (#RRGGBB) and 8-char (#RRGGBBAA) hex colors.
 */
export function withAlpha(hex: string, alpha: number): string {
  // Ensure we have a valid 7-char hex (#RRGGBB)
  let base = hex;
  if (base.length === 9) base = base.slice(0, 7);       // #RRGGBBAA → #RRGGBB
  else if (base.length === 4) base = `#${base[1]}${base[1]}${base[2]}${base[2]}${base[3]}${base[3]}`; // #RGB → #RRGGBB
  else if (base.length === 5) base = `#${base[1]}${base[1]}${base[2]}${base[2]}${base[3]}${base[3]}`; // #RGBA → #RRGGBB
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${base}${a}`;
}
