/**
 * Треки обучения (см. docs/CURRICULUM.md, раздел 0).
 * Единый источник данных для онбординга, профиля и бейджей
 * «Рекомендовано» на карте галактики.
 */
import type { Track } from '../engine/types';

export interface TrackInfo {
  id: Track;
  emoji: string;
  title: string;
  description: string;
  /** Номера (order) миров, рекомендованных для трека */
  recommendedWorlds: number[];
}

export const TRACKS: TrackInfo[] = [
  {
    id: 'novice',
    emoji: '🌱',
    title: 'С нуля',
    description: 'Никогда не пользовался ИИ — начнём с самых основ',
    recommendedWorlds: [1, 2, 3],
  },
  {
    id: 'user',
    emoji: '💬',
    title: 'Пользователь',
    description: 'Пользуюсь чатом, хочу открыть всё остальное',
    recommendedWorlds: [2, 3, 8],
  },
  {
    id: 'developer',
    emoji: '👨‍💻',
    title: 'Разработчик',
    description: 'Пишу код — хочу Claude Code, MCP и API',
    recommendedWorlds: [4, 5, 6, 7],
  },
  {
    id: 'business',
    emoji: '💼',
    title: 'Бизнес',
    description: 'Хочу автоматизировать рабочие задачи',
    recommendedWorlds: [2, 3, 8],
  },
];

/** Информация о треке; undefined, если трек не выбран */
export function getTrackInfo(track: Track | null | undefined): TrackInfo | undefined {
  return TRACKS.find((t) => t.id === track);
}

/** Рекомендован ли мир (по order) для трека */
export function isWorldRecommended(track: Track | null | undefined, worldOrder: number): boolean {
  const info = getTrackInfo(track);
  return Boolean(info?.recommendedWorlds.includes(worldOrder));
}
