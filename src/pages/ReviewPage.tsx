/**
 * «Повторение дня»: до 5 случайных заданий (quiz / find-bug) из пройденных
 * уроков, у которых наступил интервал повторения (3/7/30 дней).
 * После сессии: +25 XP, stage+1 для затронутых уроков, экран «Память укреплена».
 */
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Brain, RefreshCw, Zap } from 'lucide-react';
import { getLesson } from '../engine/content';
import { useProgressStore } from '../engine/progressStore';
import { getDueLessonIds, REVIEW_MAX_TASKS, REVIEW_XP } from '../engine/review';
import { useLang, useT } from '../i18n/useT';
import type { FindBugTask as FindBugTaskType, LangCode, QuizTask as QuizTaskType } from '../engine/types';
import { QuizTask } from '../components/tasks/QuizTask';
import { FindBugTask } from '../components/tasks/FindBugTask';
import { ConfettiBurst } from '../components/gamification/ConfettiBurst';
import { showXpToast } from '../components/gamification/XPToast';
import { track } from '../lib/analytics';

/** Задание сессии повторения с привязкой к уроку */
interface ReviewItem {
  lessonId: string;
  lessonTitle: string;
  task: QuizTaskType | FindBugTaskType;
}

/** Fisher–Yates перемешивание (копия массива) */
function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Собрать сессию: случайные quiz/find-bug из due-уроков */
function buildSession(lang: LangCode): ReviewItem[] {
  const { completedLessons, reviewLog } = useProgressStore.getState();
  const dueIds = getDueLessonIds(completedLessons, reviewLog);
  const pool: ReviewItem[] = [];
  for (const lessonId of dueIds) {
    const lesson = getLesson(lessonId, lang);
    if (!lesson) continue;
    for (const task of lesson.tasks) {
      if (task.type === 'quiz' || task.type === 'find-bug') {
        pool.push({ lessonId, lessonTitle: lesson.title, task });
      }
    }
  }
  return shuffle(pool).slice(0, REVIEW_MAX_TASKS);
}

/** Сегментный прогресс сессии */
function SessionProgress({ total, current }: { total: number; current: number }) {
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

/** Итоговый экран «Память укреплена» */
function ReviewDoneOverlay({ onContinue }: { onContinue: () => void }) {
  const t = useT();
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
        <ConfettiBurst count={28} spread={180} />
        <div className="mb-3 text-4xl" aria-hidden="true">
          🧠
        </div>
        <h2 className="font-display text-xl font-semibold sm:text-2xl">{t('review.done.title')}</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('review.done.body')}
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
          +{REVIEW_XP} XP
        </motion.div>
        <motion.button
          type="button"
          onClick={onContinue}
          className="btn-gradient mt-7 w-full px-6 py-3.5 text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {t('nav.toGalaxy')}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default function ReviewPage() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const t = useT();
  const { lang } = useLang();
  const completeReview = useProgressStore((s) => s.completeReview);

  // Сессия собирается один раз при входе — обновления стора её не меняют
  const [session] = useState<ReviewItem[]>(() => buildSession(lang));
  const [step, setStep] = useState(0);
  const [solvedSteps, setSolvedSteps] = useState<Record<number, boolean>>({});
  const [done, setDone] = useState(false);

  const touchedLessonIds = useMemo(
    () => [...new Set(session.map((item) => item.lessonId))],
    [session],
  );

  const current = session[step];
  const canContinue = Boolean(solvedSteps[step]);

  const handleSolved = useCallback(() => {
    setSolvedSteps((s) => ({ ...s, [step]: true }));
  }, [step]);

  const goNext = () => {
    if (!canContinue) return;
    if (step < session.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    } else {
      completeReview(touchedLessonIds);
      showXpToast(REVIEW_XP);
      track('review_completed');
      setDone(true);
    }
  };

  // --- Повторять нечего ----------------------------------------------------
  if (session.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-10">
        <div className="glass-card max-w-md p-8 text-center">
          <Brain size={40} className="mx-auto mb-4" style={{ color: 'var(--accent-cyan)' }} />
          <h1 className="font-display text-xl font-semibold">{t('review.empty.title')}</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('review.empty.body')}
          </p>
          <Link to="/" className="btn-gradient mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm">
            <ArrowLeft size={16} />
            {t('common.toMap')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-6" style={{ maxWidth: 720 }}>
      {/* Шапка */}
      <div className="mb-4 flex items-center gap-3">
        <Link
          to="/"
          className="btn-glass grid h-10 w-10 shrink-0 place-items-center"
          aria-label={t('lesson.back.aria')}
        >
          <ArrowLeft size={17} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-semibold sm:text-xl">
            🔁 {t('review.daily.pre')} <span className="gradient-text">{t('review.daily.accent')}</span>
          </h1>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <RefreshCw size={11} />
              {t('lesson.taskOf', { n: step + 1, total: session.length })}
            </span>
            <span className="flex items-center gap-1" style={{ color: 'var(--accent-amber)' }}>
              <Zap size={11} /> {t('review.perSession', { n: REVIEW_XP })}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <SessionProgress total={session.length} current={canContinue ? step + 1 : step} />
      </div>

      {/* Текущее задание */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
        >
          {current && (
            <div className="glass-card p-5 sm:p-6">
              <div
                className="mb-3 text-xs font-semibold tracking-wide uppercase"
                style={{ color: 'var(--text-muted)' }}
              >
                {t('review.fromLesson', { title: current.lessonTitle })}
              </div>
              {current.task.type === 'quiz' ? (
                <QuizTask task={current.task} onSolved={handleSolved} />
              ) : (
                <FindBugTask task={current.task} onSolved={handleSolved} />
              )}
            </div>
          )}
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
          {step < session.length - 1 ? t('common.continue') : t('review.finish')}
          <ArrowRight size={17} />
        </button>
      </div>

      <AnimatePresence>
        {done && <ReviewDoneOverlay onContinue={() => navigate('/')} />}
      </AnimatePresence>
    </div>
  );
}
