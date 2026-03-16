import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useMoreNavigation, useRootNavigation } from '@navigation/hooks';
import { useSubscription } from '@features/subscription/hooks/useSubscription';
import { usePetStore } from '@shared/stores/petStore';
import { storageUtils } from '@storage/mmkv/storage';
import { glucoseRepository, injectionRepository, scheduleRepository } from '@storage/database';
import { buildAiSystemPrompt, AiPetContext } from '../data/aiSystemPrompt';
import { sendChatMessage, ChatMessage } from '../utils/aiClient';
import { differenceInDays, parseISO } from 'date-fns';

const MAX_HISTORY = 50;

export default function AiAssistantScreen() {
  const navigation = useMoreNavigation();
  const rootNavigation = useRootNavigation();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const { isPro } = useSubscription();
  const activePet = usePetStore(s => s.activePet);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  const historyKey = activePet ? `aiChatHistory_${activePet.id}` : null;

  // Load chat history and build system prompt on mount
  useEffect(() => {
    if (!activePet) return;

    // Load persisted history
    const saved = storageUtils.getObject<ChatMessage[]>(historyKey!);
    if (saved && Array.isArray(saved)) {
      messagesRef.current = saved;
      setMessages(saved);
    }

    // Build system prompt asynchronously using pet context
    buildSystemPromptAsync();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePet?.id]);

  const buildSystemPromptAsync = useCallback(async () => {
    if (!activePet) return;

    try {
      const [glucoseResult, latestInjection, injectionSchedules, injectionCount] = await Promise.all([
        glucoseRepository.findByPetId(activePet.id, 5),
        injectionRepository.findLatest(activePet.id),
        scheduleRepository.getInjectionTimes(activePet.id),
        injectionRepository.countByPetId(activePet.id),
      ]);

      const lastGlucoseReadings = glucoseResult.data.map(r => ({
        value: r.valueMmol,
        unit: 'mmol/L',
        date: r.recordedAt.slice(0, 10),
      }));

      const daysSinceDiagnosis =
        activePet.diagnosisDate
          ? differenceInDays(new Date(), parseISO(activePet.diagnosisDate))
          : null;

      const injectionScheduleStr =
        injectionSchedules.length > 0
          ? injectionSchedules.map(s => s.timeOfDay).join(', ')
          : null;

      const context: AiPetContext = {
        petName: activePet.name,
        diagnosisDate: activePet.diagnosisDate ?? null,
        insulinType: activePet.insulinType ?? null,
        insulinDose: latestInjection?.doseUnits ?? null,
        injectionSchedule: injectionScheduleStr,
        lastGlucoseReadings,
        daysSinceDiagnosis,
        totalInjectionsLogged: injectionCount,
        language: i18n.language?.startsWith('en') ? 'en' : 'ru',
      };

      setSystemPrompt(buildAiSystemPrompt(context));
    } catch (e) {
      console.error('[AiAssistant] Failed to build system prompt:', e);
      // Fallback: minimal context
      const context: AiPetContext = {
        petName: activePet.name,
        diagnosisDate: activePet.diagnosisDate ?? null,
        insulinType: activePet.insulinType ?? null,
        insulinDose: null,
        injectionSchedule: null,
        lastGlucoseReadings: [],
        daysSinceDiagnosis: null,
        totalInjectionsLogged: 0,
        language: i18n.language?.startsWith('en') ? 'en' : 'ru',
      };
      setSystemPrompt(buildAiSystemPrompt(context));
    }
  }, [activePet, i18n.language]);

  const persistMessages = useCallback((msgs: ChatMessage[]) => {
    if (!historyKey) return;
    const limited = msgs.slice(-MAX_HISTORY);
    storageUtils.setObject(historyKey, limited);
  }, [historyKey]);

  const updateMessages = useCallback((updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setMessages(prev => {
      const next = updater(prev);
      messagesRef.current = next;
      persistMessages(next);
      return next;
    });
  }, [persistMessages]);

  const appendErrorMessage = useCallback((text: string) => {
    const errorMsg: ChatMessage = { role: 'assistant', content: `\u26a0\ufe0f ${text}` };
    updateMessages(prev => [...prev, errorMsg]);
  }, [updateMessages]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setInputText('');
    updateMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // messagesRef holds current messages synchronously after the update
      const history = [...messagesRef.current];
      const response = await sendChatMessage(systemPrompt, history);

      const assistantMsg: ChatMessage = { role: 'assistant', content: response };
      updateMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      const err = e as Error;
      if (err.message.includes('API key not configured')) {
        appendErrorMessage(
          i18n.language?.startsWith('en')
            ? 'API key not configured. Please contact support.'
            : 'API ключ не настроен. Обратитесь в поддержку.',
        );
      } else {
        appendErrorMessage(
          i18n.language?.startsWith('en')
            ? 'Failed to connect. Check your internet connection.'
            : 'Не удалось подключиться. Проверь интернет.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, systemPrompt, updateMessages, appendErrorMessage, i18n.language]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messagRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}>
        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.bubbleUser, { backgroundColor: theme.colors.primary }]
              : [styles.bubbleAssistant, { backgroundColor: theme.colors.surfaceSecondary }],
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              { color: isUser ? '#fff' : theme.colors.text, fontFamily: theme.fonts.regular },
            ]}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  }, [theme]);

  const headerGradientColors = theme.isDark
    ? [...theme.gradients.headerDark] as [string, string]
    : [...theme.gradients.header] as [string, string];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient
        colors={headerGradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={[styles.headerTitle, { fontFamily: theme.fonts.semibold }]}>
            {t('hints.aiAssistant')}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </LinearGradient>

      {/* Body */}
      {!isPro ? (
        <ProGate
          theme={theme}
          t={t}
          onUpgrade={() => rootNavigation.navigate('Paywall')}
        />
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => `${item.role}-${index}`}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color={theme.colors.textTertiary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
                  {t('hints.aiPlaceholder')}
                </Text>
              </View>
            }
          />

          {/* Loading indicator */}
          {isLoading && (
            <View style={[styles.loadingRow, { backgroundColor: theme.colors.background }]}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                {'...'}
              </Text>
            </View>
          )}

          {/* Disclaimer */}
          <Text style={[styles.disclaimer, { color: theme.colors.textTertiary }]}>
            {t('hints.aiDisclaimer')}
          </Text>

          {/* Input row */}
          <View style={[styles.inputRow, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceSecondary,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.regular,
                },
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={t('hints.aiPlaceholder')}
              placeholderTextColor={theme.colors.placeholder}
              multiline
              maxLength={1000}
              returnKeyType="default"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim() && !isLoading
                    ? theme.colors.primary
                    : theme.colors.surfaceSecondary,
                },
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.8}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() && !isLoading ? '#fff' : theme.colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

// ---- ProGate sub-component ----

interface ProGateProps {
  theme: ReturnType<typeof import('@shared/theme').useTheme>['theme'];
  t: ReturnType<typeof import('react-i18next').useTranslation>['t'];
  onUpgrade: () => void;
}

function ProGate({ theme, t, onUpgrade }: ProGateProps) {
  return (
    <View style={[styles.proGate, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.proCard, { backgroundColor: theme.colors.surface, ...theme.shadows.md }]}>
        <View style={[styles.proIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
          <Ionicons name="chatbubble-ellipses" size={40} color={theme.colors.primary} />
        </View>
        <Text style={[styles.proTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
          {t('hints.aiAssistant')}
        </Text>
        <Text style={[styles.proDesc, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
          {t('hints.aiAssistantDesc')}
        </Text>
        <Text style={[styles.proPremiumLabel, { color: theme.colors.textTertiary, fontFamily: theme.fonts.semibold }]}>
          {t('hints.aiAssistantPremium')}
        </Text>
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade} activeOpacity={0.85}>
          <LinearGradient
            colors={[...theme.gradients.primary] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.upgradeButtonInner}
          >
            <Ionicons name="star" size={18} color="#fff" />
            <Text style={[styles.upgradeButtonText, { fontFamily: theme.fonts.bold }]}>
              {t('subscription.upgrade')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    width: 36,
    alignItems: 'flex-start',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    color: '#fff',
  },
  headerRight: {
    width: 36,
  },

  // Messages
  messageList: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  messagRow: {
    marginBottom: 8,
    flexDirection: 'row',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },

  // Loading
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 260,
  },

  // Disclaimer
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 6,
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Pro gate
  proGate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  proCard: {
    width: '100%',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  proIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  proTitle: {
    fontSize: 22,
    textAlign: 'center',
  },
  proDesc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  proPremiumLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  upgradeButton: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 8,
  },
  upgradeButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 17,
  },
});
