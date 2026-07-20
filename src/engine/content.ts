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
  ChangelogEntry,
  ChangelogFile,
  FunctionCard,
  Lesson,
  LibraryItem,
  PlacementFile,
  PlacementQuestion,
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
    // Файлы библиотеки (/content/library/*.json) — не уроки, пропускаем сразу
    if (path.startsWith('/content/library/')) continue;
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

/**
 * Босс-урок мира; undefined, если контент босса ещё не написан.
 * Ищем по isBoss, fallback — последний урок списка.
 */
export function getBossLesson(world: World): Lesson | undefined {
  for (const id of world.lessons) {
    const lesson = LESSONS.get(id);
    if (lesson?.isBoss) return lesson;
  }
  const lastId = world.lessons[world.lessons.length - 1];
  return lastId ? LESSONS.get(lastId) : undefined;
}

// ---------------------------------------------------------------------------
// Входной тест
// ---------------------------------------------------------------------------

function isPlacementQuestion(value: unknown): value is PlacementQuestion {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.worldId === 'string' &&
    typeof v.question === 'string' &&
    Array.isArray(v.options) &&
    typeof v.correct === 'number'
  );
}

function loadPlacementQuestions(): PlacementQuestion[] {
  const raw = readJson('/content/placement.json') as PlacementFile | undefined;
  if (!raw || !Array.isArray(raw.questions)) return [];
  return raw.questions.filter(isPlacementQuestion);
}

/** Вопросы входного теста (по 2 на мир) */
export const PLACEMENT_QUESTIONS: PlacementQuestion[] = loadPlacementQuestions();

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

// ---------------------------------------------------------------------------
// Лента «Что нового» (content/changelog.json)
// ---------------------------------------------------------------------------

function isChangelogEntry(value: unknown): value is ChangelogEntry {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.date === 'string' &&
    typeof v.title === 'string' &&
    typeof v.summary === 'string'
  );
}

function loadChangelog(): ChangelogEntry[] {
  const raw = readJson('/content/changelog.json') as ChangelogFile | undefined;
  if (!raw || !Array.isArray(raw.entries)) return [];
  // Битые записи не роняют приложение; свежие — первыми (даты YYYY-MM-DD)
  return raw.entries.filter(isChangelogEntry).sort((a, b) => b.date.localeCompare(a.date));
}

/** Записи ленты «Что нового», свежие первыми */
export const CHANGELOG: ChangelogEntry[] = loadChangelog();

// ---------------------------------------------------------------------------
// Библиотека расширений (content/library/*.json)
// ---------------------------------------------------------------------------

const LIBRARY_KINDS = ['skill', 'plugin', 'mcp'] as const;
const LIBRARY_SOURCES = ['official', 'verified', 'community'] as const;

function isLibraryItem(value: unknown): value is LibraryItem {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.kind === 'string' &&
    (LIBRARY_KINDS as readonly string[]).includes(v.kind) &&
    typeof v.source === 'string' &&
    (LIBRARY_SOURCES as readonly string[]).includes(v.source) &&
    typeof v.category === 'string' &&
    typeof v.description === 'string' &&
    typeof v.useFor === 'string' &&
    typeof v.install === 'string' &&
    typeof v.link === 'string' &&
    (v.docs === undefined || typeof v.docs === 'string')
  );
}

// Отдельный glob библиотеки: файлы пишутся параллельно и могут отсутствовать —
// в этом случае glob просто вернёт пустой объект, приложение не падает.
const libraryModules = import.meta.glob('/content/library/*.json', { eager: true }) as Record<
  string,
  { default?: unknown }
>;

function loadLibraryItems(): LibraryItem[] {
  const items: LibraryItem[] = [];
  const seen = new Set<string>();
  for (const mod of Object.values(libraryModules)) {
    const data = (mod as { default?: unknown }).default ?? mod;
    if (typeof data !== 'object' || data === null) continue;
    const raw = (data as { items?: unknown }).items;
    if (!Array.isArray(raw)) continue;
    for (const entry of raw) {
      // Битые записи не роняют приложение — просто пропускаем
      if (isLibraryItem(entry) && !seen.has(entry.id)) {
        seen.add(entry.id);
        items.push(entry);
      }
    }
  }
  return items;
}

/** Все записи библиотеки: скиллы, плагины, MCP-серверы */
export const LIBRARY_ITEMS: LibraryItem[] = loadLibraryItems();
