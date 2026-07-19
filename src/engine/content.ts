/**
 * Загрузка контента игры из /content/**.
 * Движок не знает о конкретных уроках: всё читается из JSON на этапе сборки
 * через import.meta.glob. Отсутствующий файл урока не роняет приложение —
 * карта просто показывает такой узел как «контент загружается».
 */
import type {
  Badge,
  BadgesFile,
  CardsFile,
  FunctionCard,
  Lesson,
  World,
  WorldsFile,
} from './types';

// Все JSON контента (eager: включаются в бандл на этапе сборки)
const modules = import.meta.glob('/content/**/*.json', { eager: true }) as Record<
  string,
  { default: unknown }
>;

function readJson(path: string): unknown | undefined {
  const mod = modules[path];
  if (!mod) return undefined;
  // Vite отдаёт JSON и как default-экспорт, и как namespace
  return (mod as { default?: unknown }).default ?? mod;
}

// ---------------------------------------------------------------------------
// Миры
// ---------------------------------------------------------------------------

function loadWorlds(): World[] {
  const raw = readJson('/content/worlds.json') as WorldsFile | undefined;
  if (!raw || !Array.isArray(raw.worlds)) return [];
  return [...raw.worlds].sort((a, b) => a.order - b.order);
}

/** Все миры, отсортированные по order */
export const WORLDS: World[] = loadWorlds();

export function getWorld(worldId: string): World | undefined {
  return WORLDS.find((w) => w.id === worldId);
}

// ---------------------------------------------------------------------------
// Уроки
// ---------------------------------------------------------------------------

function isLesson(value: unknown): value is Lesson {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.world === 'string' &&
    Array.isArray(v.theory) &&
    Array.isArray(v.tasks)
  );
}

function loadLessons(): Map<string, Lesson> {
  const lessons = new Map<string, Lesson>();
  for (const [path, mod] of Object.entries(modules)) {
    // Уроки лежат в подпапках: /content/<world-id>/<lesson-id>.json
    if (!/^\/content\/[^/]+\/[^/]+\.json$/.test(path)) continue;
    try {
      const data = (mod as { default?: unknown }).default ?? mod;
      if (isLesson(data)) {
        lessons.set(data.id, data);
      }
    } catch {
      // Битый JSON не должен ронять приложение — просто пропускаем файл
    }
  }
  return lessons;
}

const LESSONS: Map<string, Lesson> = loadLessons();

/** Урок по id; undefined, если файл контента ещё не написан */
export function getLesson(lessonId: string): Lesson | undefined {
  return LESSONS.get(lessonId);
}

/** Есть ли контент урока (написан ли JSON-файл) */
export function hasLessonContent(lessonId: string): boolean {
  return LESSONS.has(lessonId);
}

/** Уроки мира в порядке из worlds.json (undefined на месте ненаписанных) */
export function getWorldLessons(world: World): Array<Lesson | undefined> {
  return world.lessons.map((id) => LESSONS.get(id));
}

// ---------------------------------------------------------------------------
// Карточки и бейджи
// ---------------------------------------------------------------------------

function loadCards(): FunctionCard[] {
  const raw = readJson('/content/cards.json') as CardsFile | undefined;
  return raw && Array.isArray(raw.cards) ? raw.cards : [];
}

function loadBadges(): Badge[] {
  const raw = readJson('/content/badges.json') as BadgesFile | undefined;
  return raw && Array.isArray(raw.badges) ? raw.badges : [];
}

export const CARDS: FunctionCard[] = loadCards();
export const BADGES: Badge[] = loadBadges();

export function getCard(cardId: string): FunctionCard | undefined {
  return CARDS.find((c) => c.id === cardId);
}

export function getBadge(badgeId: string): Badge | undefined {
  return BADGES.find((b) => b.id === badgeId);
}
