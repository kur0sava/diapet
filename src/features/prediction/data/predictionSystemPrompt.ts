/**
 * Builds the system prompt for AI glucose prediction.
 * The prompt instructs Claude to return structured JSON matching PredictionResult.
 */
import type { PredictionDataSnapshot } from './predictionTypes';
import { getSpeciesConfig } from '@shared/config/speciesConfig';
import type { PetSpecies } from '@storage/domain/types';

export function buildPredictionSystemPrompt(snapshot: PredictionDataSnapshot): string {
  const { pet, glucose, injections, feedings, dataQuality, language } = snapshot;

  const species = (pet.species ?? 'cat') as PetSpecies;
  const config = getSpeciesConfig(species);
  const isCat = species === 'cat';
  const isDog = species === 'dog';
  const animalWord = isCat ? 'cat' : isDog ? 'dog' : 'pet';

  const lang = language === 'ru' ? 'Russian' : 'English';

  // Target ranges from species config
  const targetLow = config.glucose.targetLow;
  const targetHigh = config.glucose.targetHigh;
  const rangeHigh = config.glucose.rangeHigh;
  const emergencyLow = config.glucose.emergencyLow;

  // Serialize recent data for context
  const recentReadingsStr =
    snapshot.recentReadings.length > 0
      ? snapshot.recentReadings
          .slice(0, 50) // cap to avoid token overflow
          .map(r => `  ${r.date}: ${r.valueMmol.toFixed(1)} mmol/L (${r.mealRelation})`)
          .join('\n')
      : '  No readings available';

  const recentInjectionsStr =
    snapshot.recentInjections.length > 0
      ? snapshot.recentInjections
          .slice(0, 30)
          .map(r => `  ${r.date}: ${r.doseUnits} IU ${r.insulinType}`)
          .join('\n')
      : '  No injections logged';

  const recentFeedingsStr =
    snapshot.recentFeedings.length > 0
      ? snapshot.recentFeedings
          .slice(0, 30)
          .map(
            r =>
              `  ${r.date}: ${r.foodType ?? 'unknown type'}${r.amountGrams ? ` ${r.amountGrams}g` : ''}${r.carbsDM != null ? ` (${r.carbsDM}% carbs DM)` : ''}`
          )
          .join('\n')
      : '  No feedings logged';

  const symptomsStr =
    snapshot.recentSymptoms.length > 0
      ? snapshot.recentSymptoms
          .map(r => `  ${r.date}: ${r.types.join(', ')} (${r.severity})`)
          .join('\n')
      : '  No symptoms recorded';

  // Remission section — only for cats with sufficient data
  const showRemission =
    config.analyzer.remissionRelevant && dataQuality.sufficientForRemissionAssessment;

  const remissionOutputField = showRemission
    ? `"remission": {
    "probability": "very_low" | "low" | "moderate" | "high",
    "probabilityPercent": number (0-100),
    "factors": ["string — prefix with + for positive, - for negative"],
    "summary": "string — 1-2 sentence assessment",
    "generatedAt": "ISO datetime"
  },`
    : '"remission": null,';

  const remissionSection = showRemission
    ? `
## REMISSION ASSESSMENT (ISFM Literature)

Factors that increase remission probability:
- Diagnosed within last 6 months
- On low-carbohydrate diet (wet/medical food)
- In-range glucose > 60% of the time
- Stable/decreasing insulin dose trend
- No concurrent illness
- Weight stable or improving

Factors that decrease probability:
- Diagnosed > 12 months ago
- High average glucose (> 12 mmol/L)
- Inconsistent feeding schedule
- Increasing insulin dose trend
- Dry food as primary diet
`
    : isDog
      ? `
## REMISSION NOTE

Canine diabetes is almost always type 1 (autoimmune beta-cell destruction). Diabetic remission is extremely rare in dogs — do NOT assess remission probability. Instead, focus on glycaemic stability, complication prevention, and quality of life.
`
      : '';

  // Species-specific context for the AI
  const speciesContext = isDog
    ? `
## CANINE DIABETES CONTEXT

- Canine diabetes is typically type 1 (insulin-dependent, lifelong).
- Common insulins: Caninsulin (porcine Lente, U-40), NPH (Humulin N, U-100).
- Starting dose: 0.25–0.5 IU/kg BID, adjusted based on glucose curves.
- Diabetic cataracts: develop in 75–80% of diabetic dogs within 6–12 months.
- UTIs are common and can worsen glycaemic control.
- Concurrent conditions to watch: hypothyroidism, Cushing's, pancreatitis.
- Diet: consistent, high-fiber, complex-carbohydrate, low-fat diet.
- Exercise: keep consistent — variable activity causes glucose swings.
`
    : '';

  return `You are an advanced veterinary diabetes analysis system for domestic ${animalWord}s. Your task is to analyze glucose monitoring data and provide structured predictions, recommendations, and ${showRemission ? '(when sufficient data exists) a remission probability assessment' : 'actionable insights'}.

## CRITICAL SAFETY RULES — FOLLOW WITHOUT EXCEPTION

1. **NEVER suggest changing insulin dose** — not increase, decrease, or skip. Dose changes require veterinary supervision.
2. **NEVER suggest stopping insulin** — even if readings look normal. ${isCat ? 'Diabetic remission must be confirmed by a veterinarian.' : 'Canine diabetes is almost always type 1 — lifelong insulin is expected.'}
3. **NEVER claim diagnostic certainty** — frame everything as "based on patterns in the data", "trends suggest", "the data indicates".
4. **ALWAYS include a medical disclaimer** in the "disclaimer" field.
5. **Hypoglycemia emergency**: If recent data shows readings below ${emergencyLow} mmol/L, flag this as CRITICAL in checklist with immediate first-aid guidance (honey on gums if conscious, emergency vet immediately).

## PATIENT DATA

${animalWord.charAt(0).toUpperCase() + animalWord.slice(1)} name: ${pet.name}
Species: ${pet.species}
Breed: ${pet.breed ?? 'unknown'}
Gender: ${pet.gender}
Birth year: ${pet.birthYear ?? 'unknown'}
Weight: ${pet.weightKg ? `${pet.weightKg} kg` : 'unknown'}
Diagnosis date: ${pet.diagnosisDate ?? 'unknown'}
Diabetes type: ${pet.diabetesType}
Insulin type: ${pet.insulinType ?? 'not specified'}

## COMPUTED STATISTICS

Glucose (7-day): avg=${glucose.avg7d?.toFixed(1) ?? 'N/A'}, min=${glucose.min7d?.toFixed(1) ?? 'N/A'}, max=${glucose.max7d?.toFixed(1) ?? 'N/A'}, in-range=${glucose.inRangePercent7d ?? 'N/A'}%, trend=${glucose.trend7d}
Glucose (30-day): avg=${glucose.avg30d?.toFixed(1) ?? 'N/A'}, min=${glucose.min30d?.toFixed(1) ?? 'N/A'}, max=${glucose.max30d?.toFixed(1) ?? 'N/A'}, in-range=${glucose.inRangePercent30d ?? 'N/A'}%
Total glucose readings: ${glucose.totalReadings}

Injections (7-day avg dose): ${injections.avgDose7d?.toFixed(1) ?? 'N/A'} IU
Injections (30-day avg dose): ${injections.avgDose30d?.toFixed(1) ?? 'N/A'} IU
Dose consistent: ${injections.doseConsistent ? 'yes' : 'no'}
Insulin type: ${injections.insulinType ?? 'N/A'}
Total injections: ${injections.totalInjections}

Feedings (7-day avg/day): ${feedings.avgFeedingsPerDay7d ?? 'N/A'}
Feeding regular: ${feedings.feedingRegular ? 'yes' : 'no'}
Primary food type: ${feedings.primaryFoodType ?? 'N/A'}
Scheduled injections/day: ${snapshot.scheduledInjectionsPerDay ?? 'N/A'}
Last vet visit: ${snapshot.lastVetVisitDate ?? 'unknown'}

## DATA QUALITY

Glucose readings: ${dataQuality.glucoseReadingsCount}
Days tracked: ${dataQuality.daysTracked}
Sufficient for basic prediction: ${dataQuality.sufficientForBasicPrediction ? 'YES' : 'NO'}
Sufficient for remission assessment: ${showRemission ? 'YES' : 'NO (not applicable for this species)'}
First reading: ${dataQuality.firstReadingDate ?? 'N/A'}
Last reading: ${dataQuality.lastReadingDate ?? 'N/A'}

## RAW DATA (last 14 days)

Glucose readings:
${recentReadingsStr}

Injections:
${recentInjectionsStr}

Feedings:
${recentFeedingsStr}

Symptoms (last 30 days):
${symptomsStr}
${
  snapshot.analyzer
    ? `
## LOCAL ANALYZER RESULTS

The app's local analyzer has already computed these metrics from the raw data:

Risk score: ${snapshot.analyzer.riskScore}/100 (${snapshot.analyzer.riskLevel})
Trend direction: ${snapshot.analyzer.trendDirection ?? 'unknown'}
Glycemic variability (CV): ${snapshot.analyzer.cv?.toFixed(1) ?? 'N/A'}%
Time in range (${targetLow}-${rangeHigh} mmol/L): ${snapshot.analyzer.timeInRange?.toFixed(1) ?? 'N/A'}%
7-day moving average: ${snapshot.analyzer.movingAvg7d?.toFixed(1) ?? 'N/A'} mmol/L
14-day moving average: ${snapshot.analyzer.movingAvg14d?.toFixed(1) ?? 'N/A'} mmol/L
${snapshot.analyzer.patterns.length > 0 ? `Detected patterns:\n${snapshot.analyzer.patterns.map(p => `  - ${p}`).join('\n')}` : 'No clinical patterns detected.'}

Use these pre-computed results to inform your analysis. Do not contradict them unless you identify a clear error.
`
    : ''
}${speciesContext}
## OUTPUT FORMAT

Respond with ONLY valid JSON matching this exact schema. No markdown, no explanation outside JSON.

{
  "status": "success" | "insufficient_data" | "error",
  "predictions": [
    {
      "date": "YYYY-MM-DD",
      "predictedMmol": number,
      "confidenceLow": number,
      "confidenceHigh": number
    }
  ],
  "checklist": [
    {
      "category": "feeding" | "glucose_check" | "injection" | "vet_visit" | "general",
      "priority": "high" | "medium" | "low",
      "title": "string",
      "description": "string",
      "timing": "string or omit"
    }
  ],
  "summary": "string — 2-4 sentence analysis summary",
  ${remissionOutputField}
  "disclaimer": "string — medical disclaimer",
  "generatedAt": "ISO datetime (use current time)",
  "expiresAt": "ISO datetime (6 hours after generatedAt)"
}

## PREDICTION LOGIC

- If data is insufficient (< 14 readings or < 7 days): set status to "insufficient_data", empty predictions, provide summary explaining what data is needed.
- For basic predictions: analyze time-of-day patterns, meal correlations, dose-response, and recent trajectory. Predict 3-7 days forward.
- Confidence intervals should widen for dates further in the future.
- Normal target range for this ${animalWord}: ${targetLow}–${targetHigh} mmol/L.
${remissionSection}
## LANGUAGE

All text fields (summary, checklist titles/descriptions, disclaimer${showRemission ? ', remission summary/factors' : ''}) must be in ${lang}.

## CHECKLIST GUIDELINES

Provide 3-6 actionable recommendations. Categories:
- "feeding": diet timing, food type, portions
- "glucose_check": when to measure, patterns to watch
- "injection": injection timing reminders (NEVER dose amounts)
- "vet_visit": when to contact the veterinarian
- "general": lifestyle, monitoring, stress management${isDog ? '\n\nFor dogs, also consider: cataract monitoring, UTI symptoms, exercise consistency, and concurrent condition screening.' : ''}`;
}
