/**
 * Хранилище прогресса игрока: zustand + localStorage.
 * Ключ и структура — строго по docs/CONTENT_SCHEMA.md:
 * localStorage['academy_progress_v1'] = Progress (без обёрток).
 */
import { create } from 'zustand';
import type { LangCode, Lesson, Progress, ReviewEntry, Track } from './types';
import { getWorld } from './content';
import { isLangCode } from '../i18n/languages';
import { REVIEW_INTERVALS_DAYS, REVIEW_XP } from './review';

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

const VALID_TRACKS: readonly Track[] = ['novice', 'user', 'developer', 'business'];

function parseTrack(value: unknown): Track | null {
  return VALID_TRACKS.includes(value as Track) ? (value as Track) : null;
}

/** Язык из localStorage с валидацией; невалидное значение → 'ru' */
function parseLang(value: unknown): LangCode {
  return isLangCode(value) ? value : 'ru';
}

const DEFAULT_PROGRESS: Progress = {
  xp: 0,
  completedLessons: {},
  streak: { current: 0, best: 0, lastActiveDate: '' },
  badges: [],
  cards: [],
  // Трек не выбран — при первом входе игрок проходит онбординг
  track: null,
  passedWorlds: [],
  placementResult: null,
  playerName: null,
  reviewLog: {},
  lang: 'ru',
};

function parsePlacementResult(value: unknown): Record<string, number> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const result: Record<string, number> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === 'number') result[k] = v;
  }
  return result;
}

function parseReviewLog(value: unknown): Record<string, ReviewEntry> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
  const result: Record<string, ReviewEntry> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v !== 'object' || v === null) continue;
    const entry = v as Record<string, unknown>;
    if (typeof entry.lastReviewedAt === 'string' && typeof entry.stage === 'number') {
      result[k] = { lastReviewedAt: entry.lastReviewedAt, stage: entry.stage };
    }
  }
  return result;
}

/** Привести произвольный объект к валидному Progress (общая логика для load и import) */
function normalizeProgress(parsed: Partial<Progress>): Progress {
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
    track: parseTrack(parsed.track),
    passedWorlds: Array.isArray(parsed.passedWorlds)
      ? parsed.passedWorlds.filter((w): w is string => typeof w === 'string')
      : [],
    placementResult: parsePlacementResult(parsed.placementResult),
    playerName: typeof parsed.playerName === 'string' ? parsed.playerName : null,
    reviewLog: parseReviewLog(parsed.reviewLog),
    lang: parseLang(parsed.lang),
  };
}

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    return normalizeProgress(JSON.parse(raw) as Partial<Progress>);
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
      passedWorlds: p.passedWorlds,
      placementResult: p.placementResult,
      playerName: p.playerName,
      reviewLog: p.reviewLog,
      lang: p.lang,
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

/** Итог успешного испытания босса — для экрана результата */
export interface ChallengeResult {
  xpGained: number;
  newBadgeId: string | null;
  /** Мир уже был зачтён раньше — XP и награды не дублируем */
  alreadyPassed: boolean;
}

interface ProgressStore extends Progress {
  /** Начислить XP (например, бонус реальной миссии) */
  addXp: (amount: number) => void;
  /** Зафиксировать активность сегодня и пересчитать стрик по датам */
  touchStreak: () => void;
  setTrack: (track: Track) => void;
  /** Сменить язык интерфейса и контента (с валидацией) */
  setLang: (lang: LangCode) => void;
  unlockBadge: (badgeId: string) => boolean;
  unlockCard: (cardId: string) => boolean;
  /** Полный цикл завершения урока: XP, стрик, награды, бейджи-условия */
  completeLesson: (lesson: Lesson, mistakes: number) => LessonCompletionResult;
  /**
   * Зачесть мир испытанием босса: мир → passedWorlds, XP босса, бейдж мира.
   * Карточки уроков при этом НЕ выдаются — стимул вернуться и пройти уроки.
   */
  passWorldChallenge: (bossLesson: Lesson) => ChallengeResult;
  /** Сохранить результат входного теста: worldId → баллы (0–2) */
  setPlacementResult: (result: Record<string, number>) => void;
  /** Имя игрока для сертификатов */
  setPlayerName: (name: string) => void;
  /**
   * Зачесть сессию «Повторения дня»: +25 XP и stage+1 (до 2)
   * для всех затронутых уроков.
   */
  completeReview: (lessonIds: string[]) => void;
  /** Экспорт прогресса в JSON-строку (для резервной копии) */
  exportProgress: () => string;
  /** Импорт прогресса из JSON-строки резервной копии; true при успехе */
  importProgress: (raw: string) => boolean;
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

  setLang: (lang) => set({ lang: isLangCode(lang) ? lang : 'ru' }),

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
      // Прохождение босс-урока автоматически «зачитывает» весь мир
      passedWorlds:
        lesson.isBoss && !s.passedWorlds.includes(lesson.world)
          ? [...s.passedWorlds, lesson.world]
          : s.passedWorlds,
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

  passWorldChallenge: (bossLesson) => {
    const state = get();
    // Мир уже зачтён (испытанием или обычным прохождением босса) — не дублируем
    const alreadyPassed =
      state.passedWorlds.includes(bossLesson.world) ||
      Boolean(state.completedLessons[bossLesson.id]);

    // Испытание — активность за день
    get().touchStreak();

    if (!state.passedWorlds.includes(bossLesson.world)) {
      set((s) => ({ passedWorlds: [...s.passedWorlds, bossLesson.world] }));
    }

    if (alreadyPassed) {
      return { xpGained: 0, newBadgeId: null, alreadyPassed: true };
    }

    set((s) => ({ xp: s.xp + bossLesson.xp }));

    // Бейдж мира выдаётся; карточки уроков — нет (стимул вернуться)
    let newBadgeId: string | null = null;
    if (bossLesson.reward.badgeId && get().unlockBadge(bossLesson.reward.badgeId)) {
      newBadgeId = bossLesson.reward.badgeId;
    }

    // Условные бейджи, которые могло затронуть испытание
    const after = get();
    if (after.streak.current >= 3) after.unlockBadge('badge-streak-3');
    if (after.streak.current >= 7) after.unlockBadge('badge-streak-7');
    if (after.xp >= 500) after.unlockBadge('badge-500-xp');

    return { xpGained: bossLesson.xp, newBadgeId, alreadyPassed: false };
  },

  setPlacementResult: (result) => set({ placementResult: { ...result } }),

  setPlayerName: (name) => {
    const trimmed = name.trim();
    set({ playerName: trimmed.length > 0 ? trimmed : null });
  },

  completeReview: (lessonIds) => {
    if (lessonIds.length === 0) return;
    // Повторение — тоже активность за день
    get().touchStreak();
    const maxStage = REVIEW_INTERVALS_DAYS.length - 1;
    set((s) => {
      const now = new Date().toISOString();
      const reviewLog = { ...s.reviewLog };
      for (const id of lessonIds) {
        const prevStage = reviewLog[id]?.stage ?? 0;
        reviewLog[id] = {
          lastReviewedAt: now,
          stage: Math.min(prevStage + 1, maxStage),
        };
      }
      return { reviewLog, xp: s.xp + REVIEW_XP };
    });
  },

  exportProgress: () => {
    const s = get();
    const data: Progress = {
      xp: s.xp,
      completedLessons: s.completedLessons,
      streak: s.streak,
      badges: s.badges,
      cards: s.cards,
      track: s.track,
      passedWorlds: s.passedWorlds,
      placementResult: s.placementResult,
      playerName: s.playerName,
      reviewLog: s.reviewLog,
      lang: s.lang,
    };
    return JSON.stringify(data, null, 2);
  },

  importProgress: (raw) => {
    try {
      const parsed = JSON.parse(raw) as Partial<Progress>;
      // Минимальная проверка, что это похоже на нашу копию
      if (typeof parsed !== 'object' || parsed === null) return false;
      set({ ...normalizeProgress(parsed) });
      return true;
    } catch {
      return false;
    }
  },

  resetProgress: () =>
    set({
      ...DEFAULT_PROGRESS,
      completedLessons: {},
      badges: [],
      cards: [],
      passedWorlds: [],
      placementResult: null,
      playerName: null,
      reviewLog: {},
      // Язык не сбрасываем — это настройка, а не прогресс
      lang: get().lang,
    }),
}));

// Автосохранение: любое изменение стора пишем в localStorage
useProgressStore.subscribe((state) => {
  saveProgress(state);
});
