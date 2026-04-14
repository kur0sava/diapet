import { Article } from '../types';

import { whatIsDiabetes } from './articles/what-is-diabetes';
import { remission } from './articles/remission';
import { neuropathy } from './articles/neuropathy';
import { diet } from './articles/diet';
import { commonMistakes } from './articles/common-mistakes';
import { insulinTypes } from './articles/insulin_types';
import { glucoseMonitoring } from './articles/glucose_monitoring';
import { fructosamine } from './articles/fructosamine';
import { dka } from './articles/dka';
import { injectionTechnique } from './articles/injection-technique';
import { hypoglycemia } from './articles/hypoglycemia';
import { pancreatitisDiabetes } from './articles/pancreatitis-diabetes';
import { firstDays } from './articles/first-days';
import { flexibleMonitoring } from './articles/flexible-monitoring';
import { realLifeManagement } from './articles/real-life-management';
import { stressHyperglycemia } from './articles/stress-hyperglycemia';
import { comorbidities } from './articles/comorbidities';
import { ketoneTesting } from './articles/ketone-testing';
import { dentalDisease } from './articles/dental-disease';
import { glucoseCurvesPractice } from './articles/glucose-curves-practice';
import { costPlanning } from './articles/cost-planning';
import { choosingVet } from './articles/choosing-vet';
import { dogDiabetesBasics } from './articles/dog-diabetes-basics';
import { dogCataracts } from './articles/dog-cataracts';
import { dogDiet } from './articles/dog-diet';
import { dogInsulin } from './articles/dog-insulin';
import { dogHypoglycemia } from './articles/dog-hypoglycemia';

export const articles: Article[] = [
  whatIsDiabetes,
  remission,
  neuropathy,
  diet,
  commonMistakes,
  insulinTypes,
  glucoseMonitoring,
  fructosamine,
  dka,
  injectionTechnique,
  hypoglycemia,
  pancreatitisDiabetes,
  firstDays,
  flexibleMonitoring,
  realLifeManagement,
  stressHyperglycemia,
  comorbidities,
  ketoneTesting,
  dentalDisease,
  glucoseCurvesPractice,
  costPlanning,
  choosingVet,
  // Dog-specific articles
  dogDiabetesBasics,
  dogCataracts,
  dogDiet,
  dogInsulin,
  dogHypoglycemia,
];
