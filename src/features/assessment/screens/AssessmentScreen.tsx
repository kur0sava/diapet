import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMoreNavigation, useRootNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import * as Haptics from 'expo-haptics';

const QUESTIONS = [
  'polyuria',
  'polydipsia',
  'weightLoss',
  'appetite',
  'energy',
  'hindLimbs',
  'ketoneSmell',
  'vomiting',
] as const;

type QuestionKey = (typeof QUESTIONS)[number];

type AnswerValue = 0 | 1 | 2;

type Stage = 'mild' | 'moderate' | 'severe';

const ANSWER_OPTIONS: { value: AnswerValue; labelKey: string }[] = [
  { value: 0, labelKey: 'assessment.no' },
  { value: 1, labelKey: 'assessment.sometimes' },
  { value: 2, labelKey: 'assessment.always' },
];

const STAGE_COLORS: Record<Stage, string> = {
  mild: '#34C759',
  moderate: '#FF9500',
  severe: '#FF3B30',
};

const STAGE_EMOJIS: Record<Stage, string> = {
  mild: '\u2705',
  moderate: '\u26A0\uFE0F',
  severe: '\uD83D\uDEA8',
};

function getStage(score: number): Stage {
  if (score <= 5) return 'mild';
  if (score <= 11) return 'moderate';
  return 'severe';
}

export default function AssessmentScreen() {
  const navigation = useMoreNavigation();
  const rootNavigation = useRootNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [showResult, setShowResult] = useState(false);

  const totalQuestions = QUESTIONS.length;
  const currentQuestion: QuestionKey | undefined = QUESTIONS[currentIndex];

  const totalScore = Object.values(answers).reduce<number>((sum, v) => sum + v, 0);
  const stage = getStage(totalScore);
  const stageColor = STAGE_COLORS[stage];

  const handleAnswer = useCallback((value: AnswerValue) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const key = QUESTIONS[currentIndex];
    setAnswers(prev => ({ ...prev, [key]: value }));

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  }, [currentIndex, totalQuestions]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleRestart = useCallback(() => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
  }, []);

  const progress = showResult ? 1 : currentIndex / totalQuestions;

  if (showResult) {
    const actions = t(`assessment.actions.${stage}`, { returnObjects: true }) as string[];

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: theme.colors.primary }}>{'\u2190'} {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('assessment.title')}</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Progress bar full */}
          <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceSecondary }]}>
            <View style={[styles.progressFill, { width: '100%', backgroundColor: stageColor }]} />
          </View>

          {/* Result card */}
          <View style={[styles.resultCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
            <Text style={styles.resultEmoji}>{STAGE_EMOJIS[stage]}</Text>

            <View style={[styles.stageBadge, { backgroundColor: stageColor }]}>
              <Text style={styles.stageBadgeText}>{t(`assessment.stages.${stage}`)}</Text>
            </View>

            <Text style={[styles.scoreText, { color: theme.colors.textSecondary }]}>
              {totalScore} / {totalQuestions * 2}
            </Text>

            <Text style={[styles.stageDescription, { color: theme.colors.text }]}>
              {t(`assessment.stageDescriptions.${stage}`)}
            </Text>

            {Array.isArray(actions) && actions.length > 0 && (
              <View style={styles.actionsList}>
                {actions.map((action, i) => (
                  <View key={i} style={styles.actionItem}>
                    <Text style={styles.actionCheckmark}>{'\u2705'}</Text>
                    <Text style={[styles.actionText, { color: theme.colors.text }]}>{action}</Text>
                  </View>
                ))}
              </View>
            )}

            {stage === 'severe' && (
              <TouchableOpacity
                style={[styles.emergencyBtn, { backgroundColor: STAGE_COLORS.severe }]}
                onPress={() => rootNavigation.navigate('Emergency')}
                activeOpacity={0.8}
              >
                <Text style={styles.emergencyBtnText}>{'\uD83D\uDEA8'} {t('emergency.emergencyMode')}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.reassessBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={handleRestart}
              activeOpacity={0.8}
            >
              <Text style={[styles.reassessBtnText, { color: theme.colors.primary }]}>
                {t('assessment.reassess')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={currentIndex > 0 ? handleBack : () => navigation.goBack()}>
          <Text style={{ color: theme.colors.primary }}>{'\u2190'} {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('assessment.title')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Progress bar */}
        <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: theme.colors.primary }]} />
        </View>

        <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
          {t('assessment.question', { current: currentIndex + 1, total: totalQuestions })}
        </Text>

        {/* Question */}
        <Text style={[styles.questionText, { color: theme.colors.text }]}>
          {t(`assessment.questions.${currentQuestion}`)}
        </Text>

        {/* Answer chips */}
        <View style={styles.answerRow}>
          {ANSWER_OPTIONS.map(opt => {
            const selected = answers[currentQuestion!] === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.answerChip,
                  {
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceSecondary,
                    flex: 1,
                  },
                ]}
                onPress={() => handleAnswer(opt.value)}
                activeOpacity={0.8}
              >
                <Text style={{
                  color: selected ? '#fff' : theme.colors.text,
                  fontWeight: '600',
                  textAlign: 'center',
                }}>
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0.5,
  },
  title: { fontSize: 17, fontWeight: '600' },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 28,
  },
  answerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  answerChip: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resultCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  resultEmoji: {
    fontSize: 56,
  },
  stageBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  stageBadgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stageDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 4,
  },
  actionsList: {
    width: '100%',
    marginTop: 12,
    gap: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  actionCheckmark: {
    fontSize: 16,
    marginTop: 1,
  },
  actionText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  emergencyBtn: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  emergencyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  reassessBtn: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  reassessBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
