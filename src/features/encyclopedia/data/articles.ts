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
];
