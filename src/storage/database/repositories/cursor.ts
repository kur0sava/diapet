/**
 * Composite pagination cursor (timestamp, id).
 *
 * A plain `timestamp < ?` cursor silently skips every row that shares the
 * page-boundary timestamp (bulk imports and manual backfills produce ties).
 * Encoding the row id alongside the timestamp makes the ordering total:
 * `ORDER BY ts DESC, id DESC` + `WHERE ts < ? OR (ts = ? AND id < ?)`.
 */
const SEP = '::';

export function encodeCursor(ts: string, id: string): string {
  return `${ts}${SEP}${id}`;
}

export function decodeCursor(cursor?: string): { ts: string | null; id: string | null } {
  if (!cursor) return { ts: null, id: null };
  const idx = cursor.indexOf(SEP);
  // Legacy plain-timestamp cursor (from a still-mounted list rendered before
  // the update): id '' makes the tie clause always false — degrades to the
  // old strict comparison instead of breaking.
  if (idx === -1) return { ts: cursor, id: '' };
  return { ts: cursor.slice(0, idx), id: cursor.slice(idx + SEP.length) };
}
