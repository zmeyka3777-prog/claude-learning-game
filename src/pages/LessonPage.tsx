/**
 * Экран урока: шаги теория → задания → завершение.
 * Сверху сегментный прогресс-бар, внизу ссылки «Читать оригинал».
 */
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, BookOpen, Clock, ExternalLink, Hourglass, Zap } from 'lucide-react';
import { getLesson } from '../engine/content';
import {
  useProgressStore,
  type LessonCompletionResult,
} from '../engine/progressStore';
import { TheoryBlocks } from '../components/theory/TheoryBlocks';
import { TaskView } from '../components/tasks/TaskView';
import { LessonCompleteOverlay } from '../components/gamification/LessonCompleteOverlay';
import { showXpToast } from '../components/gamification/XPToast';

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

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const completeLesson = useProgressStore((s) => s.completeLesson);
  const addXp = useProgressStore((s) => s.addXp);

  const lesson = lessonId ? getLesson(lessonId) : undefined;

  // Шаг 0 — теория, шаги 1..N — задания
  const [step, setStep] = useState(0);
  const [solvedSteps, setSolvedSteps] = useState<Record<number, boolean>>({});
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [bonusXp, setBonusXp] = useState(0);
  const [result, setResult] = useState<LessonCompletionResult | null>(null);

  const totalSteps = lesson ? 1 + lesson.tasks.length : 1;
  const currentTask = lesson && step >= 1 ? lesson.tasks[step - 1] : undefined;
  const canContinue = step === 0 || Boolean(solvedSteps[step]);

  const handleSolved = useCallback(
    (mistakes: number) => {
      setSolvedSteps((s) => ({ ...s, [step]: true }));
      setTotalMistakes((m) => m + mistakes);
      if (currentTask?.type === 'real-mission') {
        setBonusXp((b) => b + currentTask.xpBonus);
        addXp(currentTask.xpBonus);
        showXpToast(currentTask.xpBonus);
      }
    },
    [step, currentTask, addXp],
  );

  const goNext = () => {
    if (!lesson || !canContinue) return;
    if (step < totalSteps - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    } else {
      // Завершение урока
      const res = completeLesson(lesson, totalMistakes);
      if (res.xpGained > 0) showXpToast(res.xpGained);
      setResult(res);
    }
  };

  const stepKey = useMemo(() => `step-${step}`, [step]);

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
            {lesson.isBoss && <span style={{ color: 'var(--accent-amber)' }}>🏆 </span>}
            {lesson.title}
          </h1>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {lesson.durationMin} мин
            </span>
            <span className="flex items-center gap-1" style={{ color: 'var(--accent-amber)' }}>
              <Zap size={11} /> {lesson.xp} XP
            </span>
          </div>
        </div>
      </div>

      {/* Сегментный прогресс */}
      <div className="mb-6">
        <SegmentedProgress total={totalSteps} current={canContinue ? step + 1 : step} />
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
              : 'Завершить урок'}
          <ArrowRight size={17} />
        </button>
      </div>

      {/* Первоисточники */}
      {lesson.sources.length > 0 && (
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
      </AnimatePresence>
    </div>
  );
}
