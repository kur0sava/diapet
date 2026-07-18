/**
 * Community / Chat feature (v2.6) — типы данных мини-соцсети.
 * Хранилище: Firestore (см. api/). Клиент — Firebase JS SDK.
 */
import type { PetSpecies } from '@storage/domain/types';

export type RoomSpecies = PetSpecies | 'all';

/** Статичная (bundled) конфигурация комнаты — не хранится в Firestore. */
export interface RoomDef {
  id: string;
  /** Ключ i18n для названия комнаты (community.rooms.<key>.title). */
  key: string;
  icon: string;
  /** Видовой фокус: 'all' — общая, 'cat'/'dog' — преимущественно видовая (бейдж). */
  species: RoomSpecies;
  /** Приоритет AI/ручной модерации (влияет на пороги эвристик). */
  moderation: 'low' | 'medium' | 'high' | 'max';
  /** Входит ли в стартовый MVP-набор. */
  mvp: boolean;
}

export type ModerationStatus = 'visible' | 'flagged' | 'hidden' | 'pending';

/** Тред (тема) внутри комнаты. Firestore: communityThreads/{id}. */
export interface Thread {
  id: string;
  roomId: string;
  title: string;
  authorUid: string;
  authorName: string;
  species: RoomSpecies;
  /** Язык контента (для языкового скоупа лент). */
  lang: 'ru' | 'en';
  createdAt: number;
  lastMessageAt: number;
  messageCount: number;
  moderation: ModerationStatus;
}

/** Сообщение в треде. Firestore: communityThreads/{threadId}/messages/{id}. */
export interface Message {
  id: string;
  threadId: string;
  authorUid: string;
  authorName: string;
  text: string;
  createdAt: number;
  moderation: ModerationStatus;
  /** Причина флага (i18n-ключ community.moderation.reasons.<reason>), если flagged. */
  flagReason?: string;
  /** Кол-во жалоб от юзеров. */
  reportCount?: number;
}

/** Профиль участника сообщества. Firestore: communityProfiles/{uid}. */
export interface CommunityProfile {
  uid: string;
  displayName: string;
  species?: PetSpecies;
  /** Trust-level (0 новичок … 3 доверенный) — влияет на лимиты и модерацию. */
  trustLevel: 0 | 1 | 2 | 3;
  createdAt: number;
  messageCount: number;
  /** Принял ли правила сообщества (гейт входа). */
  guidelinesAcceptedAt?: number;
}
