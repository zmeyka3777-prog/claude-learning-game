/**
 * Экран урока: шаги теория → задания → завершение.
 * Сверху сегментный прогресс-бар, внизу ссылки «Читать оригинал».
 *
 * Режим испытания (?challenge=1, только босс-уроки): теория пропускается,
 * сразу задания; больше одной ошибки — испытание провалено. Успех зачитывает
 * весь мир (XP босса + бейдж мира), карточки уроков при этом не выдаются.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  ExternalLink,
  Hourglass,
  RotateCcw,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { getBadge, getLesson, getWorld } from '../engine/content';
import {
  useProgressStore,
  type ChallengeResult,
  type LessonCompletionResult,
} from '../engine/progressStore';
import type { Lesson } from '../engine/types';
import { TheoryBlocks } from '../components/theory/TheoryBlocks';
import { TaskView } from '../components/tasks/TaskView';
import { LessonCompleteOverlay } from '../components/gamification/LessonCompleteOverlay';
import { BadgeUnlock } from '../components/gamification/BadgeUnlock';
import { ConfettiBurst } from '../components/gamification/ConfettiBurst';
import { showXpToast } from '../components/gamification/XPToast';
import { track } from '../lib/analytics';

/** Сегментный прогресс-бар урока */
function SegmentedProgress({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1.5" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-2 flex-1 overflow-hidden rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--gradient-brand)' }}
            initial={false}
            animate={{ width: i < current ? '100%' : '0%' }}
            transition={{ type: 'spring', stiffness: 180, damping: 24 }}
          />
        </div>
      ))}
    </div>
  );
}

/** Допустимое число ошибок в испытании: вторая ошибка = провал */
const CHALLENGE_MAX_MISTAKES = 1;

/** Экран «Испытание не пройдено» */
function ChallengeFailOverlay({
  lesson,
  onRetry,
  onStudy,
}: {
  lesson: Lesson;
  onRetry: () => void;
  onStudy: () => void;
}) {
  const worldTitle = getWorld(lesson.world)?.title ?? lesson.world;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      style={{ background: 'rgba(11, 14, 26, 0.88)', backdropFilter: 'blur(12px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="glass-card w-full max-w-md p-6 text-center sm:p-8"
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        <span
          className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl"
          style={{
            background: 'rgba(248, 113, 113, 0.12)',
            border: '1px solid rgba(248, 113, 113, 0.35)',
          }}
        >
          <ShieldAlert size={32} style={{ color: 'var(--error)' }} />
        </span>
        <h2 className="font-display text-xl font-semibold sm:text-2xl">Испытание не пройдено</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Больше одной ошибки — босс сектора «{worldTitle}» устоял. Ничего страшного: попробуй ещё
          раз или пройди уроки мира по порядку.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="btn-gradient flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base"
          >
            <RotateCcw size={16} />
            Попробовать ещё раз
          </button>
          <button
            type="button"
            onClick={onStudy}
            className="btn-glass flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base"
          >
            <BookOpen size={16} />
            Учиться по порядку
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Экран успешного испытания: мир зачтён */
function ChallengeSuccessOverlay({
  lesson,
  result,
  onContinue,
}: {
  lesson: Lesson;
  result: ChallengeResult;
  onContinue: () => void;
}) {
  const worldTitle = getWorld(lesson.world)?.title ?? lesson.world;
  const badge = result.newBadgeId ? getBadge(result.newBadgeId) : undefined;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      style={{ background: 'rgba(11, 14, 26, 0.88)', backdropFilter: 'blur(12px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="glass-card relative w-full max-w-md p-6 text-center sm:p-8"
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        <ConfettiBurst count={36} spread={220} />
        <div className="mb-3 text-4xl" aria-hidden="true">
          ⚡
        </div>
        <h2 className="font-display text-xl font-semibold sm:text-2xl">Испытание пройдено!</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Мир «{worldTitle}» зачтён. Уроки мира остаются открытыми — вернись за карточками функций
          и дополнительным XP.
        </p>
        <motion.div
          className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full px-5 py-2 font-display text-lg font-semibold"
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: 'var(--accent-amber)',
          }}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 18 }}
        >
          <Zap size={20} />
          {result.alreadyPassed ? 'Мир уже был зачтён' : `+${result.xpGained} XP`}
        </motion.div>
        {badge && (
          <div className="mt-5 flex justify-center">
            <BadgeUnlock badge={badge} />
          </div>
        )}
        <motion.button
          type="button"
          onClick={onContinue}
          className="btn-gradient mt-7 w-full px-6 py-3.5 text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          На карту галактики
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reduced = useReducedMotion();
  const completeLesson = useProgressStore((s) => s.completeLesson);
  const passWorldChallenge = useProgressStore((s) => s.passWorldChallenge);
  const addXp = useProgressStore((s) => s.addXp);

  const lesson = lessonId ? getLesson(lessonId) : undefined;

  // Режим испытания: только босс-уроки с заданиями, ?challenge=1
  const isChallenge =
    searchParams.get('challenge') === '1' && Boolean(lesson?.isBoss) && (lesson?.tasks.length ?? 0) > 0;

  // Шаг 0 — теория, шаги 1..N — задания (в испытании теория пропускается)
  const [step, setStep] = useState(() => (isChallenge ? 1 : 0));
  const [attempt, setAttempt] = useState(1);
  const [solvedSteps, setSolvedSteps] = useState<Record<number, boolean>>({});
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [bonusXp, setBonusXp] = useState(0);
  const [result, setResult] = useState<LessonCompletionResult | null>(null);
  const [challengeResult, setChallengeResult] = useState<ChallengeResult | null>(null);
  const [challengeFailed, setChallengeFailed] = useState(false);

  // Аналитика: урок открыт
  useEffect(() => {
    if (lesson) track('lesson_started', { lessonId: lesson.id });
  }, [lesson]);

  const totalSteps = lesson ? 1 + lesson.tasks.length : 1;
  const currentTask = lesson && step >= 1 ? lesson.tasks[step - 1] : undefined;
  const canContinue = step === 0 || Boolean(solvedSteps[step]);
  // В испытании прогресс считаем по заданиям (теории нет)
  const challengeTotal = lesson ? lesson.tasks.length : 0;

  const handleSolved = useCallback(
    (mistakes: number) => {
      setSolvedSteps((s) => ({ ...s, [step]: true }));
      const nextMistakes = totalMistakes + mistakes;
      setTotalMistakes(nextMistakes);
      if (isChallenge && nextMistakes > CHALLENGE_MAX_MISTAKES) {
        // Вторая ошибка — испытание провалено
        setChallengeFailed(true);
        if (lesson) track('challenge_failed', { worldId: lesson.world });
        return;
      }
      if (!isChallenge && currentTask?.type === 'real-mission') {
        setBonusXp((b) => b + currentTask.xpBonus);
        addXp(currentTask.xpBonus);
        showXpToast(currentTask.xpBonus);
      }
    },
    [step, currentTask, addXp, isChallenge, totalMistakes, lesson],
  );

  const goNext = () => {
    if (!lesson || !canContinue) return;
    if (step < totalSteps - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    } else if (isChallenge) {
      // Успех испытания: мир зачтён, XP босса, бейдж мира
      const res = passWorldChallenge(lesson);
      if (res.xpGained > 0) showXpToast(res.xpGained);
      track('challenge_passed', { worldId: lesson.world });
      setChallengeResult(res);
    } else {
      // Завершение урока
      const res = completeLesson(lesson, totalMistakes);
      if (res.xpGained > 0) showXpToast(res.xpGained);
      track('lesson_completed', { lessonId: lesson.id, mistakes: totalMistakes });
      setResult(res);
    }
  };

  /** Новая попытка испытания: всё обнуляем, задания перемонтируются */
  const retryChallenge = () => {
    setChallengeFailed(false);
    setChallengeResult(null);
    setSolvedSteps({});
    setTotalMistakes(0);
    setStep(1);
    setAttempt((a) => a + 1);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const stepKey = useMemo(() => `attempt-${attempt}-step-${step}`, [attempt, step]);

  // --- Контент урока ещё не написан --------------------------------------
  if (!lesson) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-10">
        <div className="glass-card max-w-md p-8 text-center">
          <Hourglass size={40} className="mx-auto mb-4" style={{ color: 'var(--accent-cyan)' }} />
          <h1 className="font-display text-xl font-semibold">Контент загружается</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Этот урок ещё пишется. Экспедиция скоро продолжится — загляни позже!
          </p>
          <Link to="/" className="btn-gradient mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm">
            <ArrowLeft size={16} />
            На карту миров
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-6" style={{ maxWidth: 720 }}>
      {/* Шапка урока */}
      <div className="mb-4 flex items-center gap-3">
        <Link
          to="/"
          className="btn-glass grid h-10 w-10 shrink-0 place-items-center"
          aria-label="Назад на карту"
        >
          <ArrowLeft size={17} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-semibold sm:text-xl">
            {isChallenge ? (
              <span style={{ color: 'var(--accent-amber)' }}>⚡ </span>
            ) : (
              lesson.isBoss && <span style={{ color: 'var(--accent-amber)' }}>🏆 </span>
            )}
            {lesson.title}
          </h1>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            {isChallenge ? (
              <span className="font-semibold" style={{ color: 'var(--accent-amber)' }}>
                Испытание босса: без теории, максимум 1 ошибка
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock size={11} /> {lesson.durationMin} мин
              </span>
            )}
            <span className="flex items-center gap-1" style={{ color: 'var(--accent-amber)' }}>
              <Zap size={11} /> {lesson.xp} XP
            </span>
          </div>
        </div>
      </div>

      {/* Сегментный прогресс (в испытании — только задания) */}
      <div className="mb-6">
        {isChallenge ? (
          <SegmentedProgress total={challengeTotal} current={canContinue ? step : step - 1} />
        ) : (
          <SegmentedProgress total={totalSteps} current={canContinue ? step + 1 : step} />
        )}
      </div>

      {/* Текущий шаг */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepKey}
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
        >
          {step === 0 ? (
            <>
              <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {lesson.subtitle}
              </p>
              <TheoryBlocks blocks={lesson.theory} />
            </>
          ) : currentTask ? (
            <div className="glass-card p-5 sm:p-6">
              <div className="mb-3 text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
                Задание {step} из {lesson.tasks.length}
              </div>
              <TaskView task={currentTask} onSolved={handleSolved} />
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* Кнопка далее */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={goNext}
          disabled={!canContinue}
          className="btn-gradient flex items-center gap-2 px-7 py-3 text-sm sm:text-base"
        >
          {step === 0
            ? lesson.tasks.length > 0
              ? 'К заданиям'
              : 'Завершить'
            : step < totalSteps - 1
              ? 'Продолжить'
              : isChallenge
                ? 'Завершить испытание'
                : 'Завершить урок'}
          <ArrowRight size={17} />
        </button>
      </div>

      {/* Первоисточники (в испытании скрыты — без подсказок) */}
      {!isChallenge && lesson.sources.length > 0 && (
        <div
          className="mt-10 rounded-2xl border p-4"
          style={{ borderColor: 'var(--border-glass)', background: 'rgba(255,255,255,0.03)' }}
        >
          <div
            className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            <BookOpen size={13} />
            Читать оригинал
          </div>
          <ul className="space-y-1.5">
            {lesson.sources.map((src, i) => (
              <li key={i}>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm underline-offset-2 hover:underline"
                  style={{ color: 'var(--accent-cyan)' }}
                >
                  <ExternalLink size={13} />
                  {src.title}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Проверено: {lesson.verifiedAt}
          </p>
        </div>
      )}

      {/* Обратная связь: нашёл ошибку в уроке */}
      {!isChallenge && (
        <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <a
            href={`https://github.com/zmeyka3777-prog/claude-learning-game/issues/new?title=${encodeURIComponent(
              `Ошибка в уроке ${lesson.id}`,
            )}&body=${encodeURIComponent('Что не так:\n\n')}`}
            target="_blank"
            rel="noreferrer"
            className="underline-offset-2 hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            ⚑ Нашёл ошибку в уроке?
          </a>{' '}
          <span aria-hidden="true">·</span>{' '}
          <a
            href={`mailto:zmeyka3777@gmail.com?subject=${encodeURIComponent(
              `Ошибка в уроке ${lesson.id}`,
            )}`}
            className="underline-offset-2 hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            или напиши на почту
          </a>
        </p>
      )}

      {/* Оверлей завершения */}
      <AnimatePresence>
        {result && (
          <LessonCompleteOverlay
            lesson={lesson}
            result={result}
            mistakes={totalMistakes}
            bonusXp={bonusXp}
            onContinue={() => navigate('/')}
          />
        )}
        {challengeFailed && (
          <ChallengeFailOverlay
            key="challenge-fail"
            lesson={lesson}
            onRetry={retryChallenge}
            onStudy={() => navigate('/')}
          />
        )}
        {challengeResult && (
          <ChallengeSuccessOverlay
            key="challenge-success"
            lesson={lesson}
            result={challengeResult}
            onContinue={() => navigate('/')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
