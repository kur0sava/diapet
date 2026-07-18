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
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment,
  serverTimestamp,
  writeBatch,
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

const LEVEL_RANK = { ok: 0, warn: 1, block: 2 } as const;

/**
 * Создать тред + первое сообщение атомарно (writeBatch — иначе при обрыве сети
 * между записями оставался бы орфан-тред с messageCount:1 и нулём сообщений).
 * Модерируем И заголовок, И первое сообщение (заголовок — самый видимый текст,
 * раньше проходил мимо проверок): берём худший вердикт. При 'block' бросает.
 */
export async function createThread(
  input: NewThreadInput
): Promise<{ threadId: string; moderation: ModerationResult }> {
  const titleMod = moderateText(input.title, input.room);
  const msgMod = moderateText(input.firstMessage, input.room);
  const worst = LEVEL_RANK[titleMod.level] >= LEVEL_RANK[msgMod.level] ? titleMod : msgMod;
  if (worst.level === 'block') {
    throw new Error('blocked');
  }
  const now = Date.now();
  const threadStatus: ModerationStatus = worst.level === 'warn' ? 'flagged' : 'visible';
  const msgStatus: ModerationStatus = msgMod.level === 'warn' ? 'flagged' : 'visible';

  const batch = writeBatch(db);
  const threadRef = doc(collection(db, THREADS));
  batch.set(threadRef, {
    roomId: input.room.id,
    title: input.title.trim().slice(0, 140),
    authorUid: input.authorUid,
    authorName: input.authorName,
    species: input.species,
    lang: input.lang,
    createdAt: now,
    lastMessageAt: now,
    messageCount: 1,
    moderation: threadStatus,
  });
  const msgRef = doc(collection(db, THREADS, threadRef.id, 'messages'));
  batch.set(msgRef, {
    threadId: threadRef.id,
    authorUid: input.authorUid,
    authorName: input.authorName,
    text: input.firstMessage.trim(),
    createdAt: now,
    moderation: msgStatus,
    ...(msgMod.reasons.length > 0 ? { flagReason: msgMod.reasons[0] } : {}),
    serverTs: serverTimestamp(),
  });
  await batch.commit();
  await bumpProfileMessageCount(input.authorUid);
  return { threadId: threadRef.id, moderation: worst };
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
  // Атомарно: сообщение + счётчик/время треда одним батчем (иначе счётчик мог
  // разъехаться с реальным числом сообщений при обрыве между записями).
  const batch = writeBatch(db);
  const msgRef = doc(collection(db, THREADS, threadId, 'messages'));
  batch.set(msgRef, {
    threadId,
    authorUid,
    authorName,
    text: text.trim(),
    createdAt: now,
    moderation: status,
    ...(mod.reasons.length > 0 ? { flagReason: mod.reasons[0] } : {}),
    serverTs: serverTimestamp(),
  });
  batch.update(doc(db, THREADS, threadId), {
    lastMessageAt: now,
    messageCount: increment(1),
  });
  await batch.commit();
  await bumpProfileMessageCount(authorUid);
  return mod;
}

/** Пожаловаться на сообщение — инкремент счётчика (серверный триггер разберёт). */
export async function reportMessage(threadId: string, messageId: string): Promise<void> {
  await updateDoc(doc(db, THREADS, threadId, 'messages', messageId), {
    reportCount: increment(1),
  });
}

/** Свои темы (экран «Мои темы»). Требует индекс authorUid+lastMessageAt
 *  (см. firestore.indexes.json). */
export async function getMyThreads(uid: string, max = 100): Promise<Thread[]> {
  const q = query(
    collection(db, THREADS),
    where('authorUid', '==', uid),
    orderBy('lastMessageAt', 'desc'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Thread, 'id'>) }));
}

async function bumpProfileMessageCount(uid: string): Promise<void> {
  try {
    await updateDoc(doc(db, PROFILES, uid), { messageCount: increment(1) });
  } catch {
    // профиль ещё не создан — не критично
  }
}
