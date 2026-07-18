import React, { useEffect, useRef, useState } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
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
import { ScreenHeader } from '@shared/components/ui';
import { useCommunityNavigation } from '@navigation/hooks';
import type { CommunityStackParamList } from '@navigation/types';
import { detectLang } from '@shared/translation';
import { getRoomById } from '../data/rooms';
import { createThread, ensureProfile } from '../api/communityApi';
import { validateMessageText } from '../utils/moderation';
import { checkRateLimit, recordSend } from '../utils/rateLimit';
import { useCommunityUser } from '../hooks/useCommunityUser';
import { areGuidelinesAccepted } from './GuidelinesScreen';
import type { RoomSpecies } from '../types';

export default function NewThreadScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useCommunityNavigation();
  const route = useRoute<RouteProp<CommunityStackParamList, 'NewThread'>>();
  const { roomId } = route.params;
  const room = getRoomById(roomId);
  const { uid, displayName, species } = useCommunityUser();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [posting, setPosting] = useState(false);
  const postingRef = useRef(false); // audit M2: ref-гард от даблтапа (дубль темы)

  // Гейт правил сообщества — при первом постинге
  useEffect(() => {
    if (!areGuidelinesAccepted()) {
      navigation.navigate('Guidelines');
    }
  }, [navigation]);

  const onPost = async () => {
    if (!room || postingRef.current) return;
    if (!uid) {
      Alert.alert(t('common.info'), t('community.loginRequiredBody'));
      return;
    }
    if (!areGuidelinesAccepted()) {
      navigation.navigate('Guidelines');
      return;
    }
    if (title.trim().length < 3 || validateMessageText(message) !== 'ok') {
      Alert.alert(t('common.error'), t('community.threadIncomplete'));
      return;
    }
    const rate = checkRateLimit();
    if (rate !== 'ok') {
      Alert.alert(t('common.info'), t('community.rateLimited'));
      return;
    }
    postingRef.current = true;
    setPosting(true);
    try {
      if (uid) await ensureProfile(uid, displayName, species).catch(() => {});
      // Вид темы наследуем от комнаты (all/cat/dog); язык — по тексту сообщения
      const threadSpecies: RoomSpecies = room.species;
      const { threadId } = await createThread({
        room,
        title,
        firstMessage: message,
        authorUid: uid,
        authorName: displayName,
        species: threadSpecies,
        lang: detectLang(message),
      });
      recordSend();
      navigation.replace('Thread', { threadId, roomId, title: title.trim().slice(0, 140) });
    } catch (e) {
      if (e instanceof Error && e.message === 'blocked') {
        Alert.alert(t('common.info'), t('community.blockedMessage'));
      } else {
        Alert.alert(t('common.error'), t('community.sendError'));
      }
    } finally {
      postingRef.current = false;
      setPosting(false);
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
        <ScreenHeader title={t('community.newThread')} onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextInput
            style={[
              styles.titleInput,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder={t('community.threadTitlePlaceholder')}
            placeholderTextColor={theme.colors.textTertiary}
            maxLength={140}
          />
          <TextInput
            style={[
              styles.bodyInput,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            value={message}
            onChangeText={setMessage}
            placeholder={t('community.firstMessagePlaceholder')}
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            maxLength={4000}
          />
          <Text style={[styles.disclaimer, { color: theme.colors.textTertiary }]}>
            {t('community.disclaimer')}
          </Text>
          <TouchableOpacity
            style={[
              styles.postBtn,
              { backgroundColor: theme.colors.primary, opacity: posting ? 0.6 : 1 },
            ]}
            onPress={onPost}
            disabled={posting}
            accessibilityRole="button"
          >
            <Text style={styles.postText}>{t('community.post')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  titleInput: {
    borderRadius: 12,
    borderWidth: 0.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  bodyInput: {
    borderRadius: 12,
    borderWidth: 0.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 140,
    textAlignVertical: 'top',
  },
  disclaimer: { fontSize: 12, lineHeight: 16 },
  postBtn: { paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  postText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
