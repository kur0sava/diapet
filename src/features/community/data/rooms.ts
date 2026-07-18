import type { RoomDef } from '../types';

/**
 * Комнаты сообщества (v2.6). Структура и приоритеты модерации обоснованы
 * реальными форумами по диабету животных: FDMB (felinediabetes.com),
 * k9diabetes.com, Canine Support Group.
 *
 * Логика: воронка по стадии болезни (паника → регуляция → стабильность/
 * ремиссия/потеря) + тематические узлы (инсулин, диета, мониторинг) +
 * эмоциональные (истории, победы, радуга). Названия — через i18n
 * (community.rooms.<key>.title/.desc); тут только структура.
 *
 * MVP-набор — 6 комнат (mvp:true); остальные включаются по мере роста
 * (пустые комнаты выглядят мёртвыми). Видовость — тег на треде, не
 * дублирование комнат: 'all' общая, 'cat'/'dog' — преимущественно видовая.
 */
export const COMMUNITY_ROOMS: RoomDef[] = [
  {
    id: 'welcome',
    key: 'welcome',
    icon: 'heart-outline',
    species: 'all',
    moderation: 'low',
    mvp: true,
  },
  {
    id: 'newly_diagnosed',
    key: 'newlyDiagnosed',
    icon: 'sparkles-outline',
    species: 'all',
    moderation: 'high',
    mvp: true,
  },
  {
    id: 'questions',
    key: 'questions',
    icon: 'help-circle-outline',
    species: 'all',
    moderation: 'high',
    mvp: true,
  },
  {
    id: 'insulin',
    key: 'insulin',
    icon: 'fitness-outline',
    species: 'all',
    moderation: 'max',
    mvp: true,
  },
  {
    id: 'diet',
    key: 'diet',
    icon: 'restaurant-outline',
    species: 'all',
    moderation: 'medium',
    mvp: false,
  },
  {
    id: 'monitoring',
    key: 'monitoring',
    icon: 'analytics-outline',
    species: 'all',
    moderation: 'medium',
    mvp: false,
  },
  {
    id: 'remission',
    key: 'remission',
    icon: 'star-outline',
    species: 'cat',
    moderation: 'medium',
    mvp: false,
  },
  {
    id: 'stories',
    key: 'stories',
    icon: 'book-outline',
    species: 'all',
    moderation: 'low',
    mvp: true,
  },
  {
    id: 'complications',
    key: 'complications',
    icon: 'warning-outline',
    species: 'all',
    moderation: 'max',
    mvp: false,
  },
  { id: 'wins', key: 'wins', icon: 'trophy', species: 'all', moderation: 'low', mvp: true },
  {
    id: 'rainbow',
    key: 'rainbow',
    icon: 'heart',
    species: 'all',
    moderation: 'medium',
    mvp: false,
  },
  {
    id: 'lounge',
    key: 'lounge',
    icon: 'chatbubble-ellipses-outline',
    species: 'all',
    moderation: 'low',
    mvp: false,
  },
];

export function getRoomById(id: string): RoomDef | undefined {
  return COMMUNITY_ROOMS.find(r => r.id === id);
}

/** Комнаты для показа: MVP по умолчанию; при флаге — все. */
export function getVisibleRooms(showAll = false): RoomDef[] {
  return showAll ? COMMUNITY_ROOMS : COMMUNITY_ROOMS.filter(r => r.mvp);
}
