import { Article } from '../types';

import { whatIsDiabetes } from './articles/what-is-diabetes';
import { catLifeExpectancy } from './articles/cat-life-expectancy';
import { catWhyDiabetes } from './articles/cat-why-diabetes';
import { catDiabetesMyths } from './articles/cat-diabetes-myths';
import { remission } from './articles/remission';
import { catRemissionSigns } from './articles/cat-remission-signs';
import { catNoRemission } from './articles/cat-no-remission';
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
import { catFoodsToAvoid } from './articles/cat-foods-to-avoid';
import { catReadingFoodLabels } from './articles/cat-reading-food-labels';
import { catHomeDiet } from './articles/cat-home-diet';
import { catInsulinBrands } from './articles/cat-insulin-brands';
import { dogDiabetesBasics } from './articles/dog-diabetes-basics';
import { dogLifeExpectancy } from './articles/dog-life-expectancy';
import { dogWhyDiabetes } from './articles/dog-why-diabetes';
import { dogInsulinExplained } from './articles/dog-insulin-explained';
import { dogRemission } from './articles/dog-remission';
import { dogCataracts } from './articles/dog-cataracts';
import { dogDiet } from './articles/dog-diet';
import { dogInsulin } from './articles/dog-insulin';
import { dogHypoglycemia } from './articles/dog-hypoglycemia';
import { dogGlucoseMonitoring } from './articles/dog-glucose-monitoring';
import { dogDka } from './articles/dog-dka';
import { dogFirstDays } from './articles/dog-first-days';
import { dogCommonMistakes } from './articles/dog-common-mistakes';
import { dogFructosamine } from './articles/dog-fructosamine';
import { dogComorbidities } from './articles/dog-comorbidities';
import { dogPancreatitis } from './articles/dog-pancreatitis';
import { dogGlucoseCurves } from './articles/dog-glucose-curves';
import { dogKetoneTesting } from './articles/dog-ketone-testing';
import { dogInjectionTechnique } from './articles/dog-injection-technique';
import { dogSpayDiestrus } from './articles/dog-spay-diestrus';
import { dogRealLife } from './articles/dog-real-life';
import { dogChoosingVet } from './articles/dog-choosing-vet';
import { dogCostPlanning } from './articles/dog-cost-planning';
import { dogFoodsToAvoid } from './articles/dog-foods-to-avoid';
import { dogReadingFoodLabels } from './articles/dog-reading-food-labels';
import { dogHomeDiet } from './articles/dog-home-diet';
import { dogInsulinBrands } from './articles/dog-insulin-brands';
import { insulinStorage } from './articles/insulin-storage';
import { insulinSyringesU40U100 } from './articles/insulin-syringes-u40-u100';
import { cgmMonitoring } from './articles/cgm-monitoring';
import { dogCgmMonitoring } from './articles/dog-cgm-monitoring';
import { petGlucometerVsHuman } from './articles/pet-glucometer-vs-human';
import { somogyiRebound } from './articles/somogyi-rebound';
import { sickDayRules } from './articles/sick-day-rules';
import { missedDoubleInsulin } from './articles/missed-double-insulin';

export const articles: Article[] = [
  whatIsDiabetes,
  catLifeExpectancy,
  catWhyDiabetes,
  catDiabetesMyths,
  remission,
  catRemissionSigns,
  catNoRemission,
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
  catFoodsToAvoid,
  catReadingFoodLabels,
  catHomeDiet,
  catInsulinBrands,
  cgmMonitoring,
  // Dog-specific articles
  dogDiabetesBasics,
  dogLifeExpectancy,
  dogWhyDiabetes,
  dogInsulinExplained,
  dogRemission,
  dogCataracts,
  dogDiet,
  dogInsulin,
  dogHypoglycemia,
  dogGlucoseMonitoring,
  dogDka,
  dogFirstDays,
  dogCommonMistakes,
  dogFructosamine,
  dogComorbidities,
  dogPancreatitis,
  dogGlucoseCurves,
  dogKetoneTesting,
  dogInjectionTechnique,
  dogSpayDiestrus,
  dogRealLife,
  dogChoosingVet,
  dogCostPlanning,
  dogFoodsToAvoid,
  dogReadingFoodLabels,
  dogHomeDiet,
  dogInsulinBrands,
  dogCgmMonitoring,
  // Universal (both species) articles
  insulinStorage,
  insulinSyringesU40U100,
  petGlucometerVsHuman,
  somogyiRebound,
  sickDayRules,
  missedDoubleInsulin,
];
