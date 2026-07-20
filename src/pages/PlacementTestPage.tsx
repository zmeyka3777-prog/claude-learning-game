/**
 * Входной тест для практиков: 16 вопросов (по 2 на каждый из 8 миров),
 * по одному вопросу за раз, без подсказок и без промежуточной обратной связи.
 * В конце — карта знаний: миры с 2/2 предлагаем зачесть испытанием босса,
 * миры с 0–1 балл — «слепые зоны», с которых стоит начать.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, Compass, Eye, Map as MapIcon, Zap } from 'lucide-react';
import { getBossLesson, PLACEMENT_QUESTIONS, WORLDS } from '../engine/content';
import { useProgressStore } from '../engine/progressStore';
import { getAccentColor, getIcon } from '../lib/icons';
import type { World } from '../engine/types';

/** Тонкий прогресс-бар теста */
function TestProgress({ total, current }: { total: number; current: number }) {
  return (
    <div
      className="h-2 overflow-hidden rounded-full"
      style={{ background: 'rgba(255,255,255,0.08)' }}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemax={total}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: 'var(--gradient-brand)' }}
        initial={false}
        animate={{ width: `${(current / total) * 100}%` }}
        transition={{ type: 'spring', stiffness: 160, damping: 24 }}
      />
    </div>
  );
}

/** Строка результата по одному миру */
function WorldResultRow({ world, score }: { world: World; score: number }) {
  const navigate = useNavigate();
  const passedWorlds = useProgressStore((s) => s.passedWorlds);
  const Icon = getIcon(world.icon);
  const accent = getAccentColor(world.color);
  const known = score >= 2;
  const passed = passedWorlds.includes(world.id);
  const boss = getBossLesson(world);
  const challengeReady = Boolean(boss) && !world.comingSoon;

  return (
    <div className="glass-card flex flex-wrap items-center gap-4 p-4 sm:p-5">
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}
      >
        <Icon size={20} style={{ color: accent }} />
      </span>
      <div className="min-w-0 flex-1" style={{ minWidth: 180 }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: accent }}>
            Сектор {world.order}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={
              known
                ? {
                    background: 'rgba(52, 211, 153, 0.12)',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    color: 'var(--success)',
                  }
                : {
                    background: 'rgba(236, 72, 153, 0.12)',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    color: 'var(--accent-pink)',
                  }
            }
          >
            {score} / 2
          </span>
        </div>
        <div className="truncate font-display text-sm font-semibold sm:text-base">{world.title}</div>
        <p className="mt-0.5 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
          {known
            ? 'Похоже, ты это знаешь: пройди Испытание босса, чтобы зачесть мир'
            : 'Слепая зона — начни отсюда'}
        </p>
      </div>
      <div className="shrink-0">
        {known ? (
          passed ? (
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                background: 'rgba(52, 211, 153, 0.12)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                color: 'var(--success)',
              }}
            >
              <Zap size={12} />
              Мир зачтён
            </span>
          ) : challengeReady && boss ? (
            <button
              type="button"
              onClick={() => navigate(`/lesson/${boss.id}?challenge=1`)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:scale-[1.04] active:scale-[0.97]"
              style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                color: 'var(--accent-amber)',
              }}
            >
              <Zap size={12} />
              Испытание босса
            </button>
          ) : (
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-muted)',
              }}
              title="Босс-урок мира ещё пишется"
            >
              <Zap size={12} />
              Скоро
            </span>
          )
        ) : (
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:scale-[1.04] active:scale-[0.97]"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(139, 92, 246, 0.45)',
              color: 'var(--accent-violet)',
            }}
          >
            <MapIcon size={12} />
            На карту
          </button>
        )}
      </div>
    </div>
  );
}

/** Экран результатов теста */
function ResultsScreen({ scores }: { scores: Record<string, number> }) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const knownCount = WORLDS.filter((w) => (scores[w.id] ?? 0) >= 2).length;

  return (
    <motion.div
      key="results"
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">
          Твоя карта <span className="gradient-text">знаний</span>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
          {knownCount > 0
            ? `Уверенно: ${knownCount} из ${WORLDS.length} секторов. Зачти их испытаниями боссов и сосредоточься на слепых зонах.`
            : 'Все сектора пока — неизведанная территория. Отличный повод пройти экспедицию с самого начала!'}
        </p>
      </div>

      <div className="space-y-3">
        {WORLDS.map((world) => (
          <WorldResultRow key={world.id} world={world} score={scores[world.id] ?? 0} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-gradient flex items-center gap-2 px-7 py-3 text-sm sm:text-base"
        >
          <Compass size={17} />
          На карту галактики
        </button>
      </div>
    </motion.div>
  );
}

export default function PlacementTestPage() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const setPlacementResult = useProgressStore((s) => s.setPlacementResult);

  const questions = PLACEMENT_QUESTIONS;
  const [index, setIndex] = useState(0);
  /** Индексы выбранных ответов по вопросам */
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

  /** Баллы по мирам: worldId → 0..2 */
  const scores = useMemo(() => {
    const result: Record<string, number> = {};
    for (const q of questions) {
      if (!(q.worldId in result)) result[q.worldId] = 0;
      if (answers[q.id] === q.correct) result[q.worldId] += 1;
    }
    return result;
  }, [questions, answers]);

  const handleAnswer = (optionIndex: number) => {
    const question = questions[index];
    const nextAnswers = { ...answers, [question.id]: optionIndex };
    setAnswers(nextAnswers);

    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      // Тест завершён: считаем и сохраняем баллы по мирам
      const finalScores: Record<string, number> = {};
      for (const q of questions) {
        if (!(q.worldId in finalScores)) finalScores[q.worldId] = 0;
        if (nextAnswers[q.id] === q.correct) finalScores[q.worldId] += 1;
      }
      setPlacementResult(finalScores);
      setFinished(true);
    }
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  // Контент теста ещё не загружен — не роняем приложение
  if (questions.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-10">
        <div className="glass-card max-w-md p-8 text-center">
          <Eye size={40} className="mx-auto mb-4" style={{ color: 'var(--accent-cyan)' }} />
          <h1 className="font-display text-xl font-semibold">Тест готовится</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Вопросы входного теста ещё пишутся. Загляни позже!
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-gradient mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm"
          >
            <ArrowLeft size={16} />
            На карту миров
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <ResultsScreen scores={scores} />
      </div>
    );
  }

  const question = questions[index];

  return (
    <div className="mx-auto max-w-2xl py-8">
      {/* Шапка теста */}
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-glass grid h-10 w-10 shrink-0 place-items-center"
          aria-label="Назад"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-semibold sm:text-xl">
            Входной <span className="gradient-text">тест</span>
          </h1>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Вопрос {index + 1} из {questions.length} · без подсказок
          </div>
        </div>
      </div>

      <div className="mb-6">
        <TestProgress total={questions.length} current={index} />
      </div>

      {/* Текущий вопрос */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="glass-card p-5 sm:p-6"
        >
          <h2 className="font-display text-base leading-snug font-semibold sm:text-lg">
            {question.question}
          </h2>
          <div className="mt-5 space-y-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAnswer(i)}
                className="block w-full rounded-2xl border p-4 text-left text-sm transition-all hover:scale-[1.01] active:scale-[0.99] sm:text-base"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-glass)',
                  color: 'var(--text-primary)',
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="mt-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        Не знаешь — выбирай наугад: тест лишь показывает, с чего начать.
      </p>
    </div>
  );
}
