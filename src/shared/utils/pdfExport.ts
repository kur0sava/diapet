import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type {
  Pet,
  GlucoseReading,
  InjectionLog,
  SymptomEntry,
  MealRelation,
  SymptomType,
  SymptomSeverity,
} from '@storage/domain/types';

const ACCENT = '#4F8EF7';
const ACCENT_LIGHT = '#E8F0FE';
const TEXT = '#1C1C1E';
const TEXT_SEC = '#6D6D72';
const BORDER = '#E5E5EA';
const BG = '#F8F9FA';

const mealLabels: Record<MealRelation, string> = {
  before_meal: 'До еды',
  after_meal: 'После еды',
  fasting: 'Натощак',
  unspecified: '—',
};

const symptomLabels: Record<SymptomType, string> = {
  hindLimbWeakness: 'Слабость задних лап',
  weightLoss: 'Потеря веса',
  polyuria: 'Полиурия',
  polydipsia: 'Полидипсия',
  lossOfAppetite: 'Потеря аппетита',
  behavioralChanges: 'Поведенческие изменения',
  lethargy: 'Вялость',
  vomiting: 'Рвота',
  diarrhea: 'Диарея',
  other: 'Другое',
};

const severityLabels: Record<SymptomSeverity, string> = {
  mild: 'Лёгкая',
  moderate: 'Умеренная',
  severe: 'Тяжёлая',
};

function formatDate(iso: string): string {
  try {
    return format(new Date(iso), 'dd.MM.yyyy HH:mm', { locale: ru });
  } catch {
    return iso;
  }
}

function formatDateShort(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return format(new Date(iso), 'dd.MM.yyyy', { locale: ru });
  } catch {
    return iso;
  }
}

function buildHtml(
  pet: Pet,
  glucoseReadings: GlucoseReading[],
  injections: InjectionLog[],
  symptoms: SymptomEntry[],
): string {
  const now = format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: ru });

  // Glucose table rows
  const glucoseRows = glucoseReadings
    .map(
      (r) => `
      <tr>
        <td>${formatDate(r.recordedAt)}</td>
        <td><strong>${r.valueMmol.toFixed(1)}</strong></td>
        <td>${r.valueMgdl}</td>
        <td>${mealLabels[r.mealRelation]}</td>
        <td>${r.notes ?? ''}</td>
      </tr>`,
    )
    .join('');

  // Injection table rows (last 10)
  const injectionRows = injections
    .slice(0, 10)
    .map(
      (inj) => `
      <tr>
        <td>${formatDate(inj.administeredAt)}</td>
        <td>${inj.doseUnits} ед.</td>
        <td>${inj.insulinType}</td>
        <td>${inj.notes ?? ''}</td>
      </tr>`,
    )
    .join('');

  // Symptom rows
  const symptomRows = symptoms
    .map(
      (s) => `
      <tr>
        <td>${formatDate(s.recordedAt)}</td>
        <td>${s.symptomTypes.map((t) => symptomLabels[t] ?? t).join(', ')}</td>
        <td>${severityLabels[s.severity]}</td>
        <td>${s.notes ?? ''}</td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
      color: ${TEXT};
      background: #fff;
      font-size: 12px;
      line-height: 1.5;
      padding: 32px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid ${ACCENT};
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header h1 {
      font-size: 22px;
      color: ${ACCENT};
      margin-bottom: 4px;
    }
    .header .subtitle {
      font-size: 14px;
      color: ${TEXT_SEC};
    }
    .pet-info {
      display: flex;
      justify-content: space-between;
      background: ${ACCENT_LIGHT};
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
    }
    .pet-info .col {
      flex: 1;
    }
    .pet-info .label {
      font-size: 10px;
      color: ${TEXT_SEC};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .pet-info .value {
      font-size: 13px;
      font-weight: 600;
    }
    .section {
      margin-bottom: 24px;
    }
    .section h2 {
      font-size: 15px;
      color: ${ACCENT};
      border-bottom: 1px solid ${BORDER};
      padding-bottom: 6px;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    th {
      background: ${BG};
      color: ${TEXT_SEC};
      font-weight: 600;
      text-align: left;
      padding: 8px 6px;
      border-bottom: 2px solid ${BORDER};
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    td {
      padding: 6px;
      border-bottom: 1px solid ${BORDER};
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: ${BG};
    }
    .empty {
      color: ${TEXT_SEC};
      font-style: italic;
      padding: 12px 0;
    }
    .footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid ${BORDER};
      text-align: center;
      font-size: 10px;
      color: ${TEXT_SEC};
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>DiaPet &mdash; Медицинский отчёт</h1>
    <div class="subtitle">Дневник диабета для ветеринара</div>
  </div>

  <div class="pet-info">
    <div class="col">
      <div class="label">Имя</div>
      <div class="value">${pet.name}</div>
    </div>
    <div class="col">
      <div class="label">Порода</div>
      <div class="value">${pet.breed ?? '—'}</div>
    </div>
    <div class="col">
      <div class="label">Дата диагноза</div>
      <div class="value">${formatDateShort(pet.diagnosisDate)}</div>
    </div>
    <div class="col">
      <div class="label">Тип диабета</div>
      <div class="value">${pet.diabetesType === 'type1' ? 'Тип 1' : pet.diabetesType === 'type2' ? 'Тип 2' : 'Неизвестен'}</div>
    </div>
    <div class="col">
      <div class="label">Инсулин</div>
      <div class="value">${pet.insulinType ?? '—'}</div>
    </div>
  </div>

  <div class="section">
    <h2>Показания глюкозы (${glucoseReadings.length} записей)</h2>
    ${
      glucoseReadings.length > 0
        ? `<table>
        <thead>
          <tr>
            <th>Дата / время</th>
            <th>ммоль/л</th>
            <th>мг/дл</th>
            <th>Приём пищи</th>
            <th>Заметки</th>
          </tr>
        </thead>
        <tbody>${glucoseRows}</tbody>
      </table>`
        : '<p class="empty">Нет данных за выбранный период</p>'
    }
  </div>

  <div class="section">
    <h2>Последние инъекции (до 10)</h2>
    ${
      injections.length > 0
        ? `<table>
        <thead>
          <tr>
            <th>Дата / время</th>
            <th>Доза</th>
            <th>Тип инсулина</th>
            <th>Заметки</th>
          </tr>
        </thead>
        <tbody>${injectionRows}</tbody>
      </table>`
        : '<p class="empty">Нет данных об инъекциях</p>'
    }
  </div>

  <div class="section">
    <h2>Симптомы (${symptoms.length} записей)</h2>
    ${
      symptoms.length > 0
        ? `<table>
        <thead>
          <tr>
            <th>Дата / время</th>
            <th>Симптомы</th>
            <th>Тяжесть</th>
            <th>Заметки</th>
          </tr>
        </thead>
        <tbody>${symptomRows}</tbody>
      </table>`
        : '<p class="empty">Нет записей о симптомах</p>'
    }
  </div>

  <div class="footer">
    Сгенерировано в DiaPet &bull; ${now}
  </div>
</body>
</html>`;
}

export interface VetReportData {
  pet: Pet;
  glucoseReadings: GlucoseReading[];
  injections: InjectionLog[];
  symptoms: SymptomEntry[];
}

export async function generateVetReportPdf(data: VetReportData): Promise<void> {
  const html = buildHtml(
    data.pet,
    data.glucoseReadings,
    data.injections,
    data.symptoms,
  );

  const { uri } = await Print.printToFileAsync({ html });

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'DiaPet — Медицинский отчёт',
    UTI: 'com.adobe.pdf',
  });
}
