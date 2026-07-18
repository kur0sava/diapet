import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Icon } from '@shared/components/ui';
import { formatRelative } from '@shared/utils/dateUtils';
import {
  detectLang,
  translateText,
  isTranslationAvailable,
  type ContentLang,
} from '@shared/translation';
import { reportMessage } from '../api/communityApi';
import { blockUser } from '../utils/blocklist';
import type { Message } from '../types';

interface Props {
  message: Message;
  threadId: string;
  isOwn: boolean;
  userLang: ContentLang;
  /** Вызывается после блокировки автора — родитель пере-фильтрует ленту. */
  onBlocked?: () => void;
}

export function MessageBubble({ message, threadId, isOwn, userLang, onBlocked }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [translated, setTranslated] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [translating, setTranslating] = useState(false);

  const foreign = detectLang(message.text) !== userLang;
  const canTranslate = foreign && isTranslationAvailable();
  const flagged = message.moderation === 'flagged';

  const onTranslate = async () => {
    if (translated) {
      setShowOriginal(v => !v);
      return;
    }
    setTranslating(true);
    try {
      const res = await translateText(message.text, userLang);
      setTranslated(res.text);
      setShowOriginal(false);
    } catch {
      Alert.alert(t('common.info'), t('community.translationUnavailable'));
    } finally {
      setTranslating(false);
    }
  };

  const onActions = () => {
    Alert.alert(t('community.messageActions'), message.authorName, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('community.report'),
        onPress: async () => {
          try {
            await reportMessage(threadId, message.id);
            Alert.alert(t('common.info'), t('community.reported'));
          } catch {
            /* best-effort */
          }
        },
      },
      {
        text: t('community.blockUser'),
        style: 'destructive',
        onPress: () => {
          Alert.alert(t('community.blockUser'), t('community.blockConfirm'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('community.blockUser'),
              style: 'destructive',
              onPress: () => {
                blockUser(message.authorUid);
                Alert.alert(t('common.info'), t('community.blocked'));
                onBlocked?.();
              },
            },
          ]);
        },
      },
    ]);
  };

  const body = translated && !showOriginal ? translated : message.text;

  return (
    <View style={[styles.wrap, isOwn ? styles.own : styles.other]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isOwn ? theme.colors.primary + '18' : theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {!isOwn && (
          <Text
            style={[
              styles.author,
              { color: theme.colors.primary, fontFamily: theme.fonts.semibold },
            ]}
          >
            {message.authorName}
          </Text>
        )}
        {flagged && (
          <View style={[styles.flag, { backgroundColor: theme.colors.warning + '22' }]}>
            <Icon name="warning-outline" size={13} color={theme.colors.warning} />
            <Text style={[styles.flagText, { color: theme.colors.warning }]}>
              {t('community.flaggedNotice')}
            </Text>
          </View>
        )}
        <Text style={[styles.text, { color: theme.colors.text }]}>{body}</Text>
        {translated && !showOriginal && (
          <Text style={[styles.translatedMark, { color: theme.colors.textTertiary }]}>
            {t('community.translate')} · AI
          </Text>
        )}
        <View style={styles.footer}>
          <Text style={[styles.time, { color: theme.colors.textTertiary }]}>
            {isOwn ? t('community.you') : ''}{' '}
            {Number.isFinite(message.createdAt)
              ? formatRelative(new Date(message.createdAt).toISOString())
              : ''}
          </Text>
          <View style={styles.actions}>
            {canTranslate && (
              <TouchableOpacity
                onPress={onTranslate}
                disabled={translating}
                hitSlop={8}
                accessibilityRole="button"
              >
                {translating ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Text style={[styles.action, { color: theme.colors.primary }]}>
                    {translated
                      ? showOriginal
                        ? t('community.translate')
                        : t('community.showOriginal')
                      : t('community.translate')}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            {!isOwn && (
              <TouchableOpacity onPress={onActions} hitSlop={8} accessibilityRole="button">
                <Icon name="ellipsis-vertical" size={15} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 4, maxWidth: '88%' },
  own: { alignSelf: 'flex-end' },
  other: { alignSelf: 'flex-start' },
  bubble: { borderRadius: 14, borderWidth: 0.5, padding: 10, gap: 4 },
  author: { fontSize: 12 },
  text: { fontSize: 15, lineHeight: 21 },
  translatedMark: { fontSize: 11, fontStyle: 'italic' },
  flag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  flagText: { fontSize: 11, flexShrink: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 2,
  },
  time: { fontSize: 11 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  action: { fontSize: 12, fontWeight: '600' },
});
