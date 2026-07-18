/**
 * CSV export (v2.6 batch 4.1) — one unified event-log file: glucose,
 * injections (incl. inline doses on glucose rows), feedings, symptoms and
 * weight entries, sorted chronologically. Opens the system share sheet.
 *
 * Format notes: UTF-8 with BOM (so Excel detects the encoding), comma
 * separator, ISO-like local timestamps — friendly to both spreadsheet apps
 * and the FDMB-style community trackers.
 */
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import i18n from '@shared/i18n';
import type {
  Pet,
  GlucoseReading,
  InjectionLog,
  FeedingLog,
  SymptomEntry,
  WeightEntry,
} from '@storage/domain/types';

export interface CsvExportData {
  pet: Pet;
  glucoseReadings: GlucoseReading[];
  injections: InjectionLog[];
  feedings: FeedingLog[];
  symptoms: SymptomEntry[];
  weights: WeightEntry[];
}

const HEADER = [
  'type',
  'date_time',
  'glucose_mmol',
  'glucose_mgdl',
  'meal_relation',
  'insulin_type',
  'insulin_dose_u',
  'food',
  'amount_g',
  'weight_kg',
  'symptoms',
  'severity',
  'notes',
];

function esc(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function localDateTime(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : format(d, 'yyyy-MM-dd HH:mm');
}

type Row = { ts: string; cells: (string | number | null | undefined)[] };

function buildRows(data: CsvExportData): Row[] {
  const rows: Row[] = [];

  for (const r of data.glucoseReadings) {
    rows.push({
      ts: r.recordedAt,
      cells: [
        'glucose',
        localDateTime(r.recordedAt),
        r.valueMmol.toFixed(1),
        Math.round(r.valueMgdl),
        r.mealRelation === 'unspecified' ? '' : r.mealRelation,
        r.insulinType ?? '',
        r.insulinDose ?? '',
        '',
        '',
        '',
        '',
        '',
        r.notes ?? '',
      ],
    });
  }

  for (const inj of data.injections) {
    rows.push({
      ts: inj.administeredAt,
      cells: [
        'injection',
        localDateTime(inj.administeredAt),
        '',
        '',
        '',
        inj.insulinType,
        inj.doseUnits,
        '',
        '',
        '',
        '',
        '',
        inj.notes ?? '',
      ],
    });
  }

  for (const f of data.feedings) {
    const food = [f.foodBrand, f.foodProduct].filter(Boolean).join(' ') || f.foodType || '';
    rows.push({
      ts: f.fedAt,
      cells: [
        'feeding',
        localDateTime(f.fedAt),
        '',
        '',
        '',
        '',
        '',
        food,
        f.amountGrams ?? '',
        '',
        '',
        '',
        f.notes ?? '',
      ],
    });
  }

  for (const s of data.symptoms) {
    rows.push({
      ts: s.recordedAt,
      cells: [
        'symptom',
        localDateTime(s.recordedAt),
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        s.symptomTypes.join('; '),
        s.severity,
        s.notes ?? '',
      ],
    });
  }

  for (const w of data.weights) {
    rows.push({
      ts: w.recordedAt,
      cells: [
        'weight',
        localDateTime(w.recordedAt),
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        w.weightKg,
        '',
        '',
        w.notes ?? '',
      ],
    });
  }

  rows.sort((a, b) => a.ts.localeCompare(b.ts));
  return rows;
}

export function buildCsvString(data: CsvExportData): string {
  const lines = [HEADER.join(',')];
  for (const row of buildRows(data)) {
    lines.push(row.cells.map(esc).join(','));
  }
  return lines.join('\r\n');
}

export async function exportDiaryCsv(data: CsvExportData): Promise<void> {
  const csv = buildCsvString(data);
  const safeName = data.pet.name.replace(/[^\p{L}\p{N}]+/gu, '_').slice(0, 24) || 'pet';
  const fileName = `diapet_${safeName}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  const uri = `${FileSystem.cacheDirectory}${fileName}`;
  // BOM so Excel opens Cyrillic notes correctly
  await FileSystem.writeAsStringAsync(uri, String.fromCharCode(0xfeff) + csv);
  await Sharing.shareAsync(uri, {
    mimeType: 'text/csv',
    dialogTitle: i18n.t('glucose.exportCsvDialog'),
  });
}
