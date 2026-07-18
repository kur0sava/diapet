/**
 * Firestore-слой сообщества (v2.6). Переиспользует уже подключённый Firebase
 * (`db` из auth/firebaseConfig). Требует задеплоенных security-rules
 * (см. firestore.rules в корне) и — для продовой модерации — серверной
 * Cloud/Edge-функции AI-модератора (пока НЕ задеплоена; клиентская эвристика
 * ставит moderation:'flagged', серверный слой позже пересматривает).
 *
 * Коллекции:
 *   communityProfiles/{uid}
 *   communityThreads/{threadId}
 *   communityThreads/{threadId}/messages/{messageId}
 *
 * Таймстемпы — Date.now() (клиентские) для MVP; при росте перейти на
 * serverTimestamp() ради устойчивости к рассинхрону часов.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@features/auth/utils/firebaseConfig';
import type { Thread, Message, CommunityProfile, RoomSpecies, ModerationStatus } from '../types';
import { moderateText, type ModerationResult } from '../utils/moderation';
import type { RoomDef } from '../types';
import type { PetSpecies } from '@storage/domain/types';

const THREADS = 'communityThreads';
const PROFILES = 'communityProfiles';

// ---------------------------------------------------------------------------
// Профиль
// ---------------------------------------------------------------------------

export async function getProfile(uid: string): Promise<CommunityProfile | null> {
  const snap = await getDoc(doc(db, PROFILES, uid));
  return snap.exists() ? (snap.data() as CommunityProfile) : null;
}

/** Создать профиль при первом входе, если его ещё нет. */
export async function ensureProfile(
  uid: string,
  displayName: string,
  species?: PetSpecies
): Promise<CommunityProfile> {
  const existing = await getProfile(uid);
  if (existing) return existing;
  const profile: CommunityProfile = {
    uid,
    displayName,
    species,
    trustLevel: 0,
    createdAt: Date.now(),
    messageCount: 0,
  };
  await setDoc(doc(db, PROFILES, uid), profile);
  return profile;
}

export async function acceptGuidelines(uid: string): Promise<void> {
  await updateDoc(doc(db, PROFILES, uid), { guidelinesAcceptedAt: Date.now() });
}

// ---------------------------------------------------------------------------
// Треды
// ---------------------------------------------------------------------------

/** Треды комнаты, свежие сверху. Языковой скоуп: только `lang` (или все). */
export async function listThreads(roomId: string, lang?: 'ru' | 'en', max = 50): Promise<Thread[]> {
  const base = collection(db, THREADS);
  const q = lang
    ? query(
        base,
        where('roomId', '==', roomId),
        where('lang', '==', lang),
        orderBy('lastMessageAt', 'desc'),
        limit(max)
      )
    : query(base, where('roomId', '==', roomId), orderBy('lastMessageAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Thread, 'id'>) }));
}

export interface NewThreadInput {
  room: RoomDef;
  title: string;
  firstMessage: string;
  authorUid: string;
  authorName: string;
  species: RoomSpecies;
  lang: 'ru' | 'en';
}

/**
 * Создать тред + первое сообщение. Возвращает id треда и вердикт модерации
 * первого сообщения (caller показывает мягкое предупреждение при 'warn').
 * При 'block' бросает — caller не должен был дать отправить.
 */
export async function createThread(
  input: NewThreadInput
): Promise<{ threadId: string; moderation: ModerationResult }> {
  const mod = moderateText(input.firstMessage, input.room);
  if (mod.level === 'block') {
    throw new Error('blocked');
  }
  const now = Date.now();
  const status: ModerationStatus = mod.level === 'warn' ? 'flagged' : 'visible';
  const threadRef = await addDoc(collection(db, THREADS), {
    roomId: input.room.id,
    title: input.title.trim().slice(0, 140),
    authorUid: input.authorUid,
    authorName: input.authorName,
    species: input.species,
    lang: input.lang,
    createdAt: now,
    lastMessageAt: now,
    messageCount: 1,
    moderation: 'visible' as ModerationStatus,
  });
  await addDoc(collection(db, THREADS, threadRef.id, 'messages'), {
    threadId: threadRef.id,
    authorUid: input.authorUid,
    authorName: input.authorName,
    text: input.firstMessage.trim(),
    createdAt: now,
    moderation: status,
    ...(mod.reasons.length > 0 ? { flagReason: mod.reasons[0] } : {}),
    serverTs: serverTimestamp(),
  });
  await bumpProfileMessageCount(input.authorUid);
  return { threadId: threadRef.id, moderation: mod };
}

// ---------------------------------------------------------------------------
// Сообщения
// ---------------------------------------------------------------------------

/** Real-time подписка на сообщения треда (по возрастанию времени). */
export function subscribeMessages(
  threadId: string,
  onData: (messages: Message[]) => void,
  onError?: (e: Error) => void
): () => void {
  const q = query(
    collection(db, THREADS, threadId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(200)
  );
  return onSnapshot(
    q,
    snap => onData(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Message, 'id'>) }))),
    err => onError?.(err)
  );
}

export async function sendMessage(
  threadId: string,
  room: RoomDef,
  text: string,
  authorUid: string,
  authorName: string
): Promise<ModerationResult> {
  const mod = moderateText(text, room);
  if (mod.level === 'block') throw new Error('blocked');
  const now = Date.now();
  const status: ModerationStatus = mod.level === 'warn' ? 'flagged' : 'visible';
  await addDoc(collection(db, THREADS, threadId, 'messages'), {
    threadId,
    authorUid,
    authorName,
    text: text.trim(),
    createdAt: now,
    moderation: status,
    ...(mod.reasons.length > 0 ? { flagReason: mod.reasons[0] } : {}),
    serverTs: serverTimestamp(),
  });
  await updateDoc(doc(db, THREADS, threadId), {
    lastMessageAt: now,
    messageCount: increment(1),
  });
  await bumpProfileMessageCount(authorUid);
  return mod;
}

/** Пожаловаться на сообщение — инкремент счётчика (серверный триггер разберёт). */
export async function reportMessage(threadId: string, messageId: string): Promise<void> {
  await updateDoc(doc(db, THREADS, threadId, 'messages', messageId), {
    reportCount: increment(1),
  });
}

/** История своих сообщений (для экрана «мои сообщения»). */
export async function getMyMessages(uid: string, max = 100): Promise<Message[]> {
  // collectionGroup был бы точнее, но требует индекса; для MVP — по последним
  // тредам пользователя. Здесь берём из корневого collectionGroup-подобного
  // обхода не делаем — оставляем заглушку под серверный индекс.
  const q = query(
    collection(db, THREADS),
    where('authorUid', '==', uid),
    orderBy('lastMessageAt', 'desc'),
    limit(max)
  );
  const snap = await getDocs(q);
  // Возвращаем «псевдо-сообщения» из тредов пользователя как его историю тем.
  return snap.docs.map(d => {
    const t = d.data() as Thread;
    return {
      id: d.id,
      threadId: d.id,
      authorUid: t.authorUid,
      authorName: t.authorName,
      text: t.title,
      createdAt: t.createdAt,
      moderation: t.moderation,
    } as Message;
  });
}

async function bumpProfileMessageCount(uid: string): Promise<void> {
  try {
    await updateDoc(doc(db, PROFILES, uid), { messageCount: increment(1) });
  } catch {
    // профиль ещё не создан — не критично
  }
}
