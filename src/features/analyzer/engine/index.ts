export { analyzeTrends, type TrendResult, type TrendDirection, type TrendAcceleration } from './trendEngine';
export { detectPatterns, type DetectedPattern, type PatternType } from './patternDetector';
export { calculateRiskScore, type RiskScoreResult, type RiskLevel, type FactorScore } from './riskScoreCalculator';
export { sanitizeRecommendation, checkEmergencyThresholds, getAnalyzerDisclaimer, sanitizePatterns, type EmergencyAlert } from './safetyGuard';
export { generateSmartAlerts, type SmartAlert, type AlertType } from './smartAlerts';
