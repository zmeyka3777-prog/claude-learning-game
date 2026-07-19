/**
 * Хранилище прогресса игрока: zustand + localStorage.
 * Ключ и структура — строго по docs/CONTENT_SCHEMA.md:
 * localStorage['academy_progress_v1'] = Progress (без обёрток).
 */
import { create } from 'zustand';
import type { Lesson, Progress, Track } from './types';
import { getWorld } from './content';

export const STORAGE_KEY = 'academy_progress_v1';

/** XP на уровень: уровень = floor(xp / 500) + 1 */
export const XP_PER_LEVEL = 500;

export function getLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Разница в календарных днях между двумя датами YYYY-MM-DD */
function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

const DEFAULT_PROGRESS: Progress = {
  xp: 0,
  completedLessons: {},
  streak: { current: 0, best: 0, lastActiveDate: '' },
  badges: [],
  cards: [],
  track: 'novice',
};

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
      completedLessons: parsed.completedLessons ?? {},
      streak: {
        current: parsed.streak?.current ?? 0,
        best: parsed.streak?.best ?? 0,
        lastActiveDate: parsed.streak?.lastActiveDate ?? '',
      },
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
      cards: Array.isArray(parsed.cards) ? parsed.cards : [],
      track: (parsed.track as Track) ?? 'novice',
    };
  } catch {
    // Битые данные не должны ронять приложение
    return { ...DEFAULT_PROGRESS };
  }
}

function saveProgress(p: Progress): void {
  try {
    const data: Progress = {
      xp: p.xp,
      completedLessons: p.completedLessons,
      streak: p.streak,
      badges: p.badges,
      cards: p.cards,
      track: p.track,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage может быть недоступен (private mode) — игра просто не сохранит прогресс
  }
}

/** Итог завершения урока — для оверлея наград */
export interface LessonCompletionResult {
  xpGained: number;
  newBadgeIds: string[];
  newCardId: string | null;
  streakCurrent: number;
  alreadyCompleted: boolean;
}

interface ProgressStore extends Progress {
  /** Начислить XP (например, бонус реальной миссии) */
  addXp: (amount: number) => void;
  /** Зафиксировать активность сегодня и пересчитать стрик по датам */
  touchStreak: () => void;
  setTrack: (track: Track) => void;
  unlockBadge: (badgeId: string) => boolean;
  unlockCard: (cardId: string) => boolean;
  /** Полный цикл завершения урока: XP, стрик, награды, бейджи-условия */
  completeLesson: (lesson: Lesson, mistakes: number) => LessonCompletionResult;
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  ...loadProgress(),

  addXp: (amount) => {
    if (amount <= 0) return;
    set((s) => ({ xp: s.xp + amount }));
  },

  touchStreak: () => {
    const { streak } = get();
    const today = todayISO();
    if (streak.lastActiveDate === today) return; // сегодня уже отмечено

    let current: number;
    if (streak.lastActiveDate && daysBetween(streak.lastActiveDate, today) === 1) {
      current = streak.current + 1; // вчера тоже занимались — стрик растёт
    } else {
      current = 1; // пропуск дня (или первый день) — стрик начинается заново
    }
    set({
      streak: {
        current,
        best: Math.max(streak.best, current),
        lastActiveDate: today,
      },
    });
  },

  setTrack: (track) => set({ track }),

  unlockBadge: (badgeId) => {
    const { badges } = get();
    if (badges.includes(badgeId)) return false;
    set({ badges: [...badges, badgeId] });
    return true;
  },

  unlockCard: (cardId) => {
    const { cards } = get();
    if (cards.includes(cardId)) return false;
    set({ cards: [...cards, cardId] });
    return true;
  },

  completeLesson: (lesson, mistakes) => {
    const state = get();
    const alreadyCompleted = Boolean(state.completedLessons[lesson.id]);

    // Стрик отмечаем при любом прохождении (активность за день)
    get().touchStreak();

    if (alreadyCompleted) {
      // Повторное прохождение: XP и награды не дублируем
      return {
        xpGained: 0,
        newBadgeIds: [],
        newCardId: null,
        streakCurrent: get().streak.current,
        alreadyCompleted: true,
      };
    }

    set((s) => ({
      xp: s.xp + lesson.xp,
      completedLessons: {
        ...s.completedLessons,
        [lesson.id]: { completedAt: new Date().toISOString(), mistakes },
      },
    }));

    const newBadgeIds: string[] = [];
    const tryBadge = (id: string, condition: boolean) => {
      if (condition && get().unlockBadge(id)) newBadgeIds.push(id);
    };

    // Награда урока: карточка + бейдж из reward
    let newCardId: string | null = null;
    if (lesson.reward.cardId && get().unlockCard(lesson.reward.cardId)) {
      newCardId = lesson.reward.cardId;
    }
    if (lesson.reward.badgeId) {
      tryBadge(lesson.reward.badgeId, true);
    }

    const after = get();

    // Условные бейджи (см. content/badges.json)
    tryBadge('badge-first-lesson', Object.keys(after.completedLessons).length >= 1);
    tryBadge('badge-first-prompt', lesson.id === 'basics-first-prompt');

    const world1 = getWorld('world-1-basics');
    tryBadge(
      'badge-world-1',
      Boolean(
        world1 &&
          world1.lessons.length > 0 &&
          world1.lessons.every((id) => after.completedLessons[id]),
      ),
    );

    tryBadge('badge-streak-3', after.streak.current >= 3);
    tryBadge('badge-streak-7', after.streak.current >= 7);
    tryBadge('badge-500-xp', after.xp >= 500);

    return {
      xpGained: lesson.xp,
      newBadgeIds,
      newCardId,
      streakCurrent: after.streak.current,
      alreadyCompleted: false,
    };
  },

  resetProgress: () => set({ ...DEFAULT_PROGRESS, completedLessons: {}, badges: [], cards: [] }),
}));

// Автосохранение: любое изменение стора пишем в localStorage
useProgressStore.subscribe((state) => {
  saveProgress(state);
});
