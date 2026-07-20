/**
 * «Повторение дня» — интервальное повторение пройденных уроков.
 * Урок становится due, когда с момента прохождения (или последнего
 * повторения) прошёл интервал текущего этапа: 3 → 7 → 30 дней.
 */
import type { CompletedLesson, LangCode, ReviewEntry } from './types';

/** Интервалы этапов повторения в днях: этап 0 → 3 дня, 1 → 7, 2 → 30 */
export const REVIEW_INTERVALS_DAYS = [3, 7, 30] as const;

/** XP за завершённую сессию повторения */
export const REVIEW_XP = 25;

/** Максимум заданий в одной сессии повторения */
export const REVIEW_MAX_TASKS = 5;

const DAY_MS = 86_400_000;

/** Текущий этап повторения урока (с защитой от битых данных) */
export function getReviewStage(entry: ReviewEntry | undefined): number {
  const stage = entry?.stage ?? 0;
  if (!Number.isFinite(stage) || stage < 0) return 0;
  return Math.min(Math.floor(stage), REVIEW_INTERVALS_DAYS.length - 1);
}

/** Наступил ли интервал повторения для пройденного урока */
export function isLessonDue(
  completed: CompletedLesson,
  entry: ReviewEntry | undefined,
  now: Date = new Date(),
): boolean {
  const reference = entry?.lastReviewedAt ?? completed.completedAt;
  const referenceTime = Date.parse(reference);
  if (Number.isNaN(referenceTime)) return false;
  const intervalDays = REVIEW_INTERVALS_DAYS[getReviewStage(entry)];
  return now.getTime() - referenceTime >= intervalDays * DAY_MS;
}

/** Id пройденных уроков, у которых наступил интервал повторения */
export function getDueLessonIds(
  completedLessons: Record<string, CompletedLesson>,
  reviewLog: Record<string, ReviewEntry>,
  now: Date = new Date(),
): string[] {
  return Object.entries(completedLessons)
    .filter(([id, completed]) => isLessonDue(completed, reviewLog[id], now))
    .map(([id]) => id);
}

/**
 * Ключ строки-склонения для счётчика due-уроков.
 * Возвращает семантический ключ ('review.due.one' | 'few' | 'many'),
 * а сам текст берётся из словаря через useT — так работает и pluralization ru,
 * и простое множественное число en.
 */
export function dueLessonsKey(count: number, lang: LangCode = 'ru'): string {
  if (lang === 'ru') {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return 'review.due.one';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'review.due.few';
    return 'review.due.many';
  }
  return count === 1 ? 'review.due.one' : 'review.due.many';
}
