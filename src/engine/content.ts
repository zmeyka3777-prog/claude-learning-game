/**
 * Загрузка контента игры из /content/**.
 * Движок не знает о конкретных уроках: всё читается из JSON на этапе сборки
 * через import.meta.glob. Отсутствующий файл урока не роняет приложение —
 * карта просто показывает такой узел как «контент загружается».
 *
 * Локализация: базовый язык — ru (файлы в /content/**), английский — зеркало
 * под /content/en/** с теми же относительными путями и id. Геттеры принимают
 * активный язык; для 'en' берут запись из en-индекса, при отсутствии — фолбэк
 * на ru (частичный перевод не ломает игру). Сопоставление ru/en — по id
 * (для changelog — по стабильной дате).
 */
import type {
  Badge,
  BadgesFile,
  CardsFile,
  ChangelogEntry,
  ChangelogFile,
  FunctionCard,
  LangCode,
  Lesson,
  LibraryItem,
  PlacementFile,
  PlacementQuestion,
  World,
  WorldsFile,
} from './types';

// Все JSON контента (eager: включаются в бандл на этапе сборки).
// Glob захватывает и /content/en/**, если папка существует; если её нет —
// en-индексы просто пусты и все геттеры отдают ru.
const modules = import.meta.glob('/content/**/*.json', { eager: true }) as Record<
  string,
  { default: unknown }
>;

/** Локаль пути и его путь относительно корня локали */
interface LocalePath {
  locale: LangCode;
  /** Путь без префикса локали, напр. 'worlds.json' или 'world-1/lesson.json' */
  rel: string;
}

const EN_PREFIX = '/content/en/';
const RU_PREFIX = '/content/';

function classifyPath(path: string): LocalePath | null {
  if (path.startsWith(EN_PREFIX)) return { locale: 'en', rel: path.slice(EN_PREFIX.length) };
  if (path.startsWith(RU_PREFIX)) return { locale: 'ru', rel: path.slice(RU_PREFIX.length) };
  return null;
}

/** Прочитать конкретный файл локали по относительному пути */
function readByRel(locale: LangCode, rel: string): unknown | undefined {
  const path = locale === 'en' ? `${EN_PREFIX}${rel}` : `${RU_PREFIX}${rel}`;
  const mod = modules[path];
  if (!mod) return undefined;
  return (mod as { default?: unknown }).default ?? mod;
}

// ---------------------------------------------------------------------------
// Миры
// ---------------------------------------------------------------------------

function loadWorlds(locale: LangCode): World[] {
  const raw = readByRel(locale, 'worlds.json') as WorldsFile | undefined;
  if (!raw || !Array.isArray(raw.worlds)) return [];
  return [...raw.worlds].sort((a, b) => a.order - b.order);
}

// ru — базовый порядок и структура; en — оверлей по id (переопределяет тексты)
const WORLDS_RU: World[] = loadWorlds('ru');
const worldsEnById = new Map(loadWorlds('en').map((w) => [w.id, w]));

let WORLDS_EN_CACHE: World[] | null = null;
function worldsEn(): World[] {
  if (!WORLDS_EN_CACHE) {
    WORLDS_EN_CACHE = WORLDS_RU.map((w) => worldsEnById.get(w.id) ?? w);
  }
  return WORLDS_EN_CACHE;
}

/** Все миры активного языка, отсортированные по order (фолбэк на ru) */
export function getWorlds(lang: LangCode = 'ru'): World[] {
  return lang === 'en' ? worldsEn() : WORLDS_RU;
}

export function getWorld(worldId: string, lang: LangCode = 'ru'): World | undefined {
  return getWorlds(lang).find((w) => w.id === worldId);
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

function loadLessons(locale: LangCode): Map<string, Lesson> {
  const lessons = new Map<string, Lesson>();
  for (const [path, mod] of Object.entries(modules)) {
    const info = classifyPath(path);
    if (!info || info.locale !== locale) continue;
    // Уроки лежат в подпапках: <world-id>/<lesson-id>.json (ровно один слэш)
    if (!/^[^/]+\/[^/]+\.json$/.test(info.rel)) continue;
    // Файлы библиотеки — не уроки, пропускаем
    if (info.rel.startsWith('library/')) continue;
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

const LESSONS_RU: Map<string, Lesson> = loadLessons('ru');
const LESSONS_EN: Map<string, Lesson> = loadLessons('en');

/** Урок по id для активного языка; undefined, если контента ещё нет. Фолбэк на ru. */
export function getLesson(lessonId: string, lang: LangCode = 'ru'): Lesson | undefined {
  if (lang === 'en') return LESSONS_EN.get(lessonId) ?? LESSONS_RU.get(lessonId);
  return LESSONS_RU.get(lessonId);
}

/** Есть ли контент урока (написан ли ru-JSON-файл) */
export function hasLessonContent(lessonId: string): boolean {
  return LESSONS_RU.has(lessonId);
}

/** Уроки мира в порядке из worlds.json (undefined на месте ненаписанных) */
export function getWorldLessons(world: World, lang: LangCode = 'ru'): Array<Lesson | undefined> {
  return world.lessons.map((id) => getLesson(id, lang));
}

/**
 * Босс-урок мира; undefined, если контент босса ещё не написан.
 * Ищем по isBoss, fallback — последний урок списка.
 */
export function getBossLesson(world: World, lang: LangCode = 'ru'): Lesson | undefined {
  for (const id of world.lessons) {
    const lesson = getLesson(id, lang);
    if (lesson?.isBoss) return lesson;
  }
  const lastId = world.lessons[world.lessons.length - 1];
  return lastId ? getLesson(lastId, lang) : undefined;
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

function loadPlacementQuestions(locale: LangCode): PlacementQuestion[] {
  const raw = readByRel(locale, 'placement.json') as PlacementFile | undefined;
  if (!raw || !Array.isArray(raw.questions)) return [];
  return raw.questions.filter(isPlacementQuestion);
}

const PLACEMENT_RU: PlacementQuestion[] = loadPlacementQuestions('ru');
const placementEnById = new Map(loadPlacementQuestions('en').map((q) => [q.id, q]));

/** Вопросы входного теста активного языка (по 2 на мир). Фолбэк на ru по id. */
export function getPlacementQuestions(lang: LangCode = 'ru'): PlacementQuestion[] {
  if (lang === 'en') return PLACEMENT_RU.map((q) => placementEnById.get(q.id) ?? q);
  return PLACEMENT_RU;
}

// ---------------------------------------------------------------------------
// Карточки и бейджи
// ---------------------------------------------------------------------------

function loadCards(locale: LangCode): FunctionCard[] {
  const raw = readByRel(locale, 'cards.json') as CardsFile | undefined;
  return raw && Array.isArray(raw.cards) ? raw.cards : [];
}

function loadBadges(locale: LangCode): Badge[] {
  const raw = readByRel(locale, 'badges.json') as BadgesFile | undefined;
  return raw && Array.isArray(raw.badges) ? raw.badges : [];
}

const CARDS_RU: FunctionCard[] = loadCards('ru');
const cardsEnById = new Map(loadCards('en').map((c) => [c.id, c]));
const BADGES_RU: Badge[] = loadBadges('ru');
const badgesEnById = new Map(loadBadges('en').map((b) => [b.id, b]));

/** Все карточки активного языка (фолбэк на ru по id) */
export function getCards(lang: LangCode = 'ru'): FunctionCard[] {
  if (lang === 'en') return CARDS_RU.map((c) => cardsEnById.get(c.id) ?? c);
  return CARDS_RU;
}

/** Все бейджи активного языка (фолбэк на ru по id) */
export function getBadges(lang: LangCode = 'ru'): Badge[] {
  if (lang === 'en') return BADGES_RU.map((b) => badgesEnById.get(b.id) ?? b);
  return BADGES_RU;
}

export function getCard(cardId: string, lang: LangCode = 'ru'): FunctionCard | undefined {
  if (lang === 'en') return cardsEnById.get(cardId) ?? CARDS_RU.find((c) => c.id === cardId);
  return CARDS_RU.find((c) => c.id === cardId);
}

export function getBadge(badgeId: string, lang: LangCode = 'ru'): Badge | undefined {
  if (lang === 'en') return badgesEnById.get(badgeId) ?? BADGES_RU.find((b) => b.id === badgeId);
  return BADGES_RU.find((b) => b.id === badgeId);
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

function loadChangelog(locale: LangCode): ChangelogEntry[] {
  const raw = readByRel(locale, 'changelog.json') as ChangelogFile | undefined;
  if (!raw || !Array.isArray(raw.entries)) return [];
  // Битые записи не роняют приложение; свежие — первыми (даты YYYY-MM-DD)
  return raw.entries.filter(isChangelogEntry).sort((a, b) => b.date.localeCompare(a.date));
}

const CHANGELOG_RU: ChangelogEntry[] = loadChangelog('ru');
// Сопоставление ru/en — по стабильной дате (дата не переводится)
const changelogEnByDate = new Map(loadChangelog('en').map((e) => [e.date, e]));

/** Записи ленты «Что нового» активного языка, свежие первыми (фолбэк на ru) */
export function getChangelog(lang: LangCode = 'ru'): ChangelogEntry[] {
  if (lang === 'en') return CHANGELOG_RU.map((e) => changelogEnByDate.get(e.date) ?? e);
  return CHANGELOG_RU;
}

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

function loadLibraryItems(locale: LangCode): LibraryItem[] {
  const items: LibraryItem[] = [];
  const seen = new Set<string>();
  for (const [path, mod] of Object.entries(modules)) {
    const info = classifyPath(path);
    if (!info || info.locale !== locale) continue;
    // Файлы библиотеки: library/<name>.json (ровно один уровень вложенности)
    if (!/^library\/[^/]+\.json$/.test(info.rel)) continue;
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

const LIBRARY_RU: LibraryItem[] = loadLibraryItems('ru');
const libraryEnById = new Map(loadLibraryItems('en').map((it) => [it.id, it]));

/** Все записи библиотеки активного языка: скиллы, плагины, MCP (фолбэк на ru) */
export function getLibraryItems(lang: LangCode = 'ru'): LibraryItem[] {
  if (lang === 'en') return LIBRARY_RU.map((it) => libraryEnById.get(it.id) ?? it);
  return LIBRARY_RU;
}
