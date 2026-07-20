/**
 * Типы контента «Академии Claude».
 * Должны точно соответствовать docs/CONTENT_SCHEMA.md (v1).
 */

// ---------------------------------------------------------------------------
// Миры
// ---------------------------------------------------------------------------

export interface World {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  /** Имя иконки (lucide), например "rocket" */
  icon: string;
  /** Акцентный цвет мира: violet | cyan | amber | pink */
  color: string;
  /** Список id уроков в порядке прохождения */
  lessons: string[];
  /** Мир ещё не наполнен контентом — показываем «Скоро» */
  comingSoon?: boolean;
}

export interface WorldsFile {
  worlds: World[];
}

// ---------------------------------------------------------------------------
// Блоки теории
// ---------------------------------------------------------------------------

export type CodeLang = 'text' | 'markdown' | 'bash' | 'json' | 'python' | 'typescript';

export type CalloutKind = 'tip' | 'warning' | 'docs';

export interface TextBlock {
  type: 'text';
  /** Markdown-текст. Заголовки внутри блока — h3 (###). */
  md: string;
}

export interface HeadingBlock {
  type: 'heading';
  text: string;
}

export interface CodeBlock {
  type: 'code';
  lang: CodeLang;
  /** Необязательная подпись панели кода */
  title?: string;
  code: string;
}

export interface CalloutBlock {
  type: 'callout';
  kind: CalloutKind;
  md: string;
}

export interface TableBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface ExampleBlock {
  type: 'example';
  /** Плохой пример (промпт/код) */
  bad: string;
  /** Хороший пример */
  good: string;
  /** Почему good лучше */
  explanation: string;
}

export type TheoryBlock =
  | TextBlock
  | HeadingBlock
  | CodeBlock
  | CalloutBlock
  | TableBlock
  | ExampleBlock;

// ---------------------------------------------------------------------------
// Задания (6 типов)
// ---------------------------------------------------------------------------

export interface QuizTask {
  type: 'quiz';
  question: string;
  options: string[];
  /** Индексы правильных ответов; больше одного = мультивыбор */
  correct: number[];
  /** Показывается после ответа */
  explanation: string;
  /** Подсказка (доступна после 1 ошибки) */
  hint?: string;
}

export interface BuildPromptTask {
  type: 'build-prompt';
  instruction: string;
  blocks: string[];
  /** Правильный порядок как индексы массива blocks */
  correctOrder: number[];
  /** Лишние блоки, не входящие в ответ */
  distractors?: string[];
  explanation: string;
}

export interface FindBugTask {
  type: 'find-bug';
  instruction: string;
  lang: string;
  lines: string[];
  bugLineIndex: number;
  explanation: string;
}

export interface ChatSimStep {
  /** Ввод засчитан, если содержит хотя бы minMatches ключевых слов */
  expect: string[];
  minMatches: number;
  /** Ответ «Claude» (markdown) */
  claudeReply: string;
  /** Подсказка, если ввод не подошёл */
  failHint: string;
}

export interface ChatSimTask {
  type: 'chat-sim';
  instruction: string;
  steps: ChatSimStep[];
  successMessage: string;
}

export interface TerminalSimStep {
  /** Regex для проверки ввода */
  expectPattern: string;
  /** Текст ответа терминала */
  output: string;
  failHint: string;
}

export interface TerminalSimTask {
  type: 'terminal-sim';
  instruction: string;
  steps: TerminalSimStep[];
  successMessage: string;
}

export interface RealMissionTask {
  type: 'real-mission';
  /** Пошаговая инструкция (markdown) */
  instruction: string;
  /** Пункты самопроверки */
  checklist: string[];
  xpBonus: number;
}

export type Task =
  | QuizTask
  | BuildPromptTask
  | FindBugTask
  | ChatSimTask
  | TerminalSimTask
  | RealMissionTask;

export type TaskType = Task['type'];

// ---------------------------------------------------------------------------
// Урок
// ---------------------------------------------------------------------------

export interface LessonSource {
  title: string;
  url: string;
}

export interface LessonReward {
  cardId: string | null;
  badgeId: string | null;
}

export interface Lesson {
  id: string;
  world: string;
  order: number;
  title: string;
  subtitle: string;
  xp: number;
  durationMin: number;
  isBoss: boolean;
  sources: LessonSource[];
  /** Дата последней сверки с первоисточником, YYYY-MM-DD */
  verifiedAt: string;
  theory: TheoryBlock[];
  tasks: Task[];
  reward: LessonReward;
}

// ---------------------------------------------------------------------------
// Прогресс (localStorage, ключ academy_progress_v1)
// ---------------------------------------------------------------------------

export type Track = 'novice' | 'user' | 'developer' | 'business';

/** Код языка интерфейса и контента. Расширяется добавлением кода в LANGUAGES. */
export type LangCode = 'ru' | 'en';

export interface CompletedLesson {
  /** ISO-время завершения */
  completedAt: string;
  mistakes: number;
}

export interface StreakState {
  current: number;
  best: number;
  /** YYYY-MM-DD последнего активного дня */
  lastActiveDate: string;
}

/** Запись журнала повторений (интервальное повторение) */
export interface ReviewEntry {
  /** ISO-время последнего повторения */
  lastReviewedAt: string;
  /** Этап повторения: 0 → 1 → 2 (интервалы 3/7/30 дней) */
  stage: number;
}

export interface Progress {
  xp: number;
  completedLessons: Record<string, CompletedLesson>;
  streak: StreakState;
  badges: string[];
  cards: string[];
  /** null — трек ещё не выбран (первый вход, показываем онбординг) */
  track: Track | null;
  /** Миры, зачтённые испытанием босса или прохождением босс-урока */
  passedWorlds: string[];
  /** Результат входного теста: worldId → баллы (0–2); null — тест не пройден */
  placementResult: Record<string, number> | null;
  /** Имя игрока для сертификатов; null — ещё не введено */
  playerName: string | null;
  /** Журнал повторений: lessonId → этап и время последнего повторения */
  reviewLog: Record<string, ReviewEntry>;
  /** Выбранный язык интерфейса и контента (по умолчанию 'ru') */
  lang: LangCode;
}

// ---------------------------------------------------------------------------
// Входной тест (content/placement.json)
// ---------------------------------------------------------------------------

export interface PlacementQuestion {
  id: string;
  /** Мир, знание которого проверяет вопрос */
  worldId: string;
  question: string;
  /** Ровно 4 варианта ответа */
  options: string[];
  /** Индекс правильного варианта */
  correct: number;
}

export interface PlacementFile {
  questions: PlacementQuestion[];
}

// ---------------------------------------------------------------------------
// Карточки и бейджи
// ---------------------------------------------------------------------------

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface FunctionCard {
  id: string;
  title: string;
  rarity: CardRarity;
  description: string;
  icon: string;
}

export interface CardsFile {
  cards: FunctionCard[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Человекочитаемое условие получения */
  condition: string;
}

export interface BadgesFile {
  badges: Badge[];
}

// ---------------------------------------------------------------------------
// Лента «Что нового» (content/changelog.json)
// ---------------------------------------------------------------------------

export interface ChangelogEntry {
  /** Дата записи, YYYY-MM-DD */
  date: string;
  title: string;
  summary: string;
}

export interface ChangelogFile {
  entries: ChangelogEntry[];
}

// ---------------------------------------------------------------------------
// Библиотека расширений (content/library/*.json)
// ---------------------------------------------------------------------------

export type LibraryKind = 'skill' | 'plugin' | 'mcp';

export type LibrarySource = 'official' | 'verified' | 'community';

export interface LibraryItem {
  id: string;
  name: string;
  kind: LibraryKind;
  source: LibrarySource;
  category: string;
  description: string;
  /** Для чего пригодится (короткий сценарий использования) */
  useFor: string;
  /** Команда установки */
  install: string;
  /** Ссылка на репозиторий/страницу */
  link: string;
  /** Ссылка на документацию (опционально) */
  docs?: string;
}

export interface LibraryFile {
  items: LibraryItem[];
}
