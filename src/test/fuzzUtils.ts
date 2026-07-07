/** Shared helpers for the user-scenario fuzz. */
export const MGDL_PER_MMOLL = 18.0156;

/** Local-timezone YYYY-MM-DD without importing app dateUtils (keeps the fuzz
 *  independent from the code under test). */
export function toDateOnlySafe(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
