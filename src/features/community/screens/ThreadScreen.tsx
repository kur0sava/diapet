import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Icon, ScreenHeader } from '@shared/components/ui';
import { useCommunityNavigation } from '@navigation/hooks';
import type { CommunityStackParamList } from '@navigation/types';
import { getRoomById } from '../data/rooms';
import { subscribeMessages, sendMessage, ensureProfile } from '../api/communityApi';
import { validateMessageText } from '../utils/moderation';
import { checkRateLimit, recordSend } from '../utils/rateLimit';
import { useCommunityUser } from '../hooks/useCommunityUser';
import { MessageBubble } from '../components/MessageBubble';
import type { Message } from '../types';

export default function ThreadScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useCommunityNavigation();
  const route = useRoute<RouteProp<CommunityStackParamList, 'Thread'>>();
  const { threadId, roomId, title } = route.params;
  const room = getRoomById(roomId);
  const { uid, displayName, userLang, species } = useCommunityUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  // Audit M2: ref-гард от даблтапа (state обновляется после ре-рендера —
  // два быстрых тапа оба читают sending=false и шлют дубль). Как savingRef
  // во всех формах проекта.
  const sendingRef = useRef(false);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (uid) void ensureProfile(uid, displayName, species).catch(() => {});
  }, [uid, displayName, species]);

  useEffect(() => {
    const unsub = subscribeMessages(threadId, setMessages);
    return unsub;
  }, [threadId]);

  const onSend = async () => {
    if (!room || sendingRef.current) return;
    // Audit L5: сессия могла отвалиться внутри треда — без uid писать нельзя
    // (правила отклонят, но лучше не пытаться и не плодить '' -авторов).
    if (!uid) {
      Alert.alert(t('common.info'), t('community.loginRequiredBody'));
      return;
    }
    const valid = validateMessageText(text);
    if (valid === 'empty') return;
    if (valid === 'too_long') {
      Alert.alert(t('common.error'), t('common.error'));
      return;
    }
    const rate = checkRateLimit();
    if (rate !== 'ok') {
      Alert.alert(t('common.info'), t('community.rateLimited'));
      return;
    }
    sendingRef.current = true;
    setSending(true);
    try {
      const mod = await sendMessage(threadId, room, text, uid, displayName);
      recordSend();
      setText('');
      if (mod.level === 'warn') {
        Alert.alert(t('common.info'), t('community.flaggedNotice'));
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'blocked') {
        Alert.alert(t('common.info'), t('community.blockedMessage'));
      } else {
        Alert.alert(t('common.error'), t('community.translationUnavailable'));
      }
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['top', 'left', 'right']}
      >
        <ScreenHeader title={title} onBack={() => navigation.goBack()} />
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              threadId={threadId}
              isOwn={item.authorUid === uid}
              userLang={userLang}
            />
          )}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.colors.textTertiary }]}>
              {t('community.emptyThread')}
            </Text>
          }
        />
        <View
          style={[
            styles.composer,
            { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.text, backgroundColor: theme.colors.background },
            ]}
            value={text}
            onChangeText={setText}
            placeholder={t('community.messagePlaceholder')}
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            maxLength={4000}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: theme.colors.primary, opacity: sending || !text.trim() ? 0.5 : 1 },
            ]}
            onPress={onSend}
            disabled={sending || !text.trim()}
            accessibilityRole="button"
            accessibilityLabel={t('community.send')}
          >
            <Icon name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 12, paddingBottom: 12, flexGrow: 1 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 8,
    borderTopWidth: 0.5,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
