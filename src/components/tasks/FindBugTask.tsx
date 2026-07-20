/**
 * «Найди ошибку»: клик по строке кода/промпта/конфига.
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { Bug } from 'lucide-react';
import type { FindBugTask as FindBugTaskType } from '../../engine/types';
import { useT } from '../../i18n/useT';
import { ConfettiBurst } from '../gamification/ConfettiBurst';

interface FindBugTaskProps {
  task: FindBugTaskType;
  onSolved: (mistakes: number) => void;
}

export function FindBugTask({ task, onSolved }: FindBugTaskProps) {
  const t = useT();
  const [wrongPicks, setWrongPicks] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [shakeLine, setShakeLine] = useState<number | null>(null);

  const pick = (index: number) => {
    if (solved) return;
    if (index === task.bugLineIndex) {
      setSolved(true);
      onSolved(mistakes);
    } else if (!wrongPicks.includes(index)) {
      setWrongPicks((w) => [...w, index]);
      setMistakes((m) => m + 1);
      setShakeLine(index);
      window.setTimeout(() => setShakeLine(null), 500);
    }
  };

  return (
    <div className="relative space-y-4">
      {solved && <ConfettiBurst count={20} spread={120} />}

      <div className="flex items-start gap-2.5">
        <Bug size={22} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-pink)' }} />
        <h3 className="font-display text-lg font-semibold">{task.instruction}</h3>
      </div>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {t('findbug.hint')}
      </p>

      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: '#0d1117', border: '1px solid var(--border-glass)' }}
      >
        <div
          className="border-b px-4 py-2 font-mono text-xs"
          style={{ borderColor: 'var(--border-glass)', color: 'var(--text-muted)' }}
        >
          {task.lang}
        </div>
        <div className="overflow-x-auto py-2">
          {task.lines.map((line, i) => {
            const isBug = solved && i === task.bugLineIndex;
            const isWrong = wrongPicks.includes(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                disabled={solved}
                className={`flex w-full items-stretch gap-3 px-4 py-1 text-left font-mono text-sm transition-colors disabled:cursor-default ${
                  shakeLine === i ? 'shake' : ''
                } ${!solved ? 'hover:bg-white/5' : ''}`}
                style={{
                  background: isBug
                    ? 'rgba(52, 211, 153, 0.14)'
                    : isWrong
                      ? 'rgba(248, 113, 113, 0.1)'
                      : 'transparent',
                }}
              >
                <span
                  className="w-6 shrink-0 text-right select-none"
                  style={{ color: isBug ? 'var(--success)' : 'var(--text-muted)' }}
                >
                  {i + 1}
                </span>
                <span
                  className="whitespace-pre"
                  style={{
                    color: isBug ? 'var(--success)' : isWrong ? 'var(--error)' : '#d6e2ff',
                  }}
                >
                  {line || ' '}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {wrongPicks.length > 0 && !solved && (
        <p className="text-sm" style={{ color: 'var(--error)' }}>
          {t('findbug.wrong')}
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
            {t('findbug.solved')}
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{task.explanation}</p>
        </motion.div>
      )}
    </div>
  );
}
