/**
 * «Собери промпт»: клик по блокам в правильном порядке (без drag-and-drop —
 * работает и на мобильных). Блоки перемешаны, среди них есть дистракторы.
 */
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Blocks, RotateCcw, X } from 'lucide-react';
import type { BuildPromptTask as BuildPromptTaskType } from '../../engine/types';
import { useT } from '../../i18n/useT';
import { ConfettiBurst } from '../gamification/ConfettiBurst';

interface PoolItem {
  /** Уникальный ключ элемента пула */
  key: string;
  text: string;
  /** Дистрактор — не входит в правильный ответ */
  isDistractor: boolean;
}

/** Детерминированное перемешивание, чтобы порядок не скакал при ре-рендерах */
function shuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface BuildPromptTaskProps {
  task: BuildPromptTaskType;
  onSolved: (mistakes: number) => void;
}

export function BuildPromptTask({ task, onSolved }: BuildPromptTaskProps) {
  const t = useT();
  const pool = useMemo<PoolItem[]>(() => {
    const items: PoolItem[] = [
      ...task.blocks.map((text, i) => ({ key: `b${i}`, text, isDistractor: false })),
      ...(task.distractors ?? []).map((text, i) => ({ key: `d${i}`, text, isDistractor: true })),
    ];
    return shuffle(items, task.blocks.length * 7 + items.length * 13 + 42);
  }, [task]);

  const [answer, setAnswer] = useState<PoolItem[]>([]);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [mistakes, setMistakes] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);

  const solved = status === 'correct';
  const available = pool.filter((p) => !answer.some((a) => a.key === p.key));

  const pick = (item: PoolItem) => {
    if (solved) return;
    setStatus('idle');
    setAnswer((a) => [...a, item]);
  };

  const unpick = (item: PoolItem) => {
    if (solved) return;
    setStatus('idle');
    setAnswer((a) => a.filter((x) => x.key !== item.key));
  };

  const check = () => {
    const expected = task.correctOrder.map((i) => task.blocks[i]);
    const got = answer.map((a) => a.text);
    const ok = got.length === expected.length && expected.every((t, i) => got[i] === t);
    if (ok) {
      setStatus('correct');
      onSolved(mistakes);
    } else {
      setStatus('wrong');
      setMistakes((m) => m + 1);
      setShakeKey((k) => k + 1);
    }
  };

  return (
    <div className="relative space-y-4">
      {solved && <ConfettiBurst count={20} spread={120} />}

      <div className="flex items-start gap-2.5">
        <Blocks size={22} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-cyan)' }} />
        <h3 className="font-display text-lg font-semibold">{task.instruction}</h3>
      </div>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {t('build.hint')}
      </p>

      {/* Зона ответа */}
      <div
        key={shakeKey}
        className={`min-h-24 rounded-2xl border-2 border-dashed p-3 ${status === 'wrong' ? 'shake' : ''}`}
        style={{
          borderColor:
            status === 'wrong'
              ? 'var(--error)'
              : solved
                ? 'var(--success)'
                : 'rgba(139, 92, 246, 0.4)',
          background: 'rgba(139, 92, 246, 0.05)',
        }}
      >
        {answer.length === 0 ? (
          <p className="p-2 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('build.placeholder')}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {answer.map((item, i) => (
              <motion.button
                key={item.key}
                layout
                type="button"
                onClick={() => unpick(item)}
                disabled={solved}
                className="flex w-full items-center gap-2.5 rounded-xl border p-3 text-left text-sm transition-colors disabled:cursor-default"
                style={{
                  borderColor: solved ? 'var(--success)' : 'var(--accent-violet)',
                  background: solved ? 'rgba(52, 211, 153, 0.1)' : 'rgba(139, 92, 246, 0.14)',
                }}
              >
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                  style={{ background: 'var(--gradient-brand)' }}
                >
                  {i + 1}
                </span>
                <span className="flex-1">{item.text}</span>
                {!solved && <X size={15} style={{ color: 'var(--text-muted)' }} />}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Пул блоков */}
      {!solved && available.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {available.map((item) => (
            <motion.button
              key={item.key}
              layout
              type="button"
              onClick={() => pick(item)}
              className="glass-card glass-card-hover rounded-xl p-3 text-left text-sm"
            >
              {item.text}
            </motion.button>
          ))}
        </div>
      )}

      {!solved && (
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            className="btn-gradient px-6 py-2.5 text-sm"
            disabled={answer.length === 0}
            onClick={check}
          >
            {t('common.check')}
          </button>
          <button
            type="button"
            className="btn-glass flex items-center gap-1.5 px-4 py-2.5 text-sm"
            disabled={answer.length === 0}
            onClick={() => {
              setAnswer([]);
              setStatus('idle');
            }}
          >
            <RotateCcw size={14} />
            {t('common.reset')}
          </button>
        </div>
      )}

      {status === 'wrong' && (
        <p className="text-sm" style={{ color: 'var(--error)' }}>
          {t('build.wrong')}
        </p>
      )}

      {solved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-4 text-sm"
          style={{ borderColor: 'rgba(52, 211, 153, 0.4)', background: 'rgba(52, 211, 153, 0.07)' }}
        >
          <div className="mb-1 font-semibold" style={{ color: 'var(--success)' }}>
            {t('build.solved')}
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{task.explanation}</p>
        </motion.div>
      )}
    </div>
  );
}
