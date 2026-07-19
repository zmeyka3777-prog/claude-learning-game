/**
 * Квиз: одиночный и мультивыбор. Объяснение после ответа,
 * подсказка доступна после 1 ошибки.
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, CircleHelp, Lightbulb, X } from 'lucide-react';
import type { QuizTask as QuizTaskType } from '../../engine/types';
import { ConfettiBurst } from '../gamification/ConfettiBurst';

interface QuizTaskProps {
  task: QuizTaskType;
  onSolved: (mistakes: number) => void;
}

export function QuizTask({ task, onSolved }: QuizTaskProps) {
  const isMulti = task.correct.length > 1;
  const [selected, setSelected] = useState<number[]>([]);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [mistakes, setMistakes] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const solved = status === 'correct';

  const evaluate = (choice: number[]) => {
    const ok =
      choice.length === task.correct.length && task.correct.every((c) => choice.includes(c));
    if (ok) {
      setStatus('correct');
      onSolved(mistakes);
    } else {
      setStatus('wrong');
      setMistakes((m) => m + 1);
      setShakeKey((k) => k + 1);
    }
  };

  const pick = (index: number) => {
    if (solved) return;
    if (isMulti) {
      setStatus('idle');
      setSelected((sel) =>
        sel.includes(index) ? sel.filter((i) => i !== index) : [...sel, index],
      );
    } else {
      setSelected([index]);
      evaluate([index]);
    }
  };

  const optionStyle = (index: number): React.CSSProperties => {
    const isSelected = selected.includes(index);
    if (solved && task.correct.includes(index)) {
      return {
        borderColor: 'var(--success)',
        background: 'rgba(52, 211, 153, 0.12)',
        boxShadow: '0 0 24px rgba(52, 211, 153, 0.25)',
      };
    }
    if (status === 'wrong' && isSelected) {
      return { borderColor: 'var(--error)', background: 'rgba(248, 113, 113, 0.1)' };
    }
    if (isSelected) {
      return {
        borderColor: 'var(--accent-violet)',
        background: 'rgba(139, 92, 246, 0.12)',
      };
    }
    return { borderColor: 'var(--border-glass)', background: 'var(--bg-card)' };
  };

  return (
    <div className="relative space-y-4">
      {solved && <ConfettiBurst count={20} spread={120} />}

      <div className="flex items-start gap-2.5">
        <CircleHelp size={22} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-violet)' }} />
        <h3 className="font-display text-lg font-semibold">{task.question}</h3>
      </div>

      {isMulti && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Выбери несколько вариантов и нажми «Проверить».
        </p>
      )}

      <div key={shakeKey} className={status === 'wrong' ? 'shake space-y-3' : 'space-y-3'}>
        {task.options.map((option, i) => (
          <button
            key={i}
            type="button"
            onClick={() => pick(i)}
            disabled={solved}
            className="flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-[15px] transition-all disabled:cursor-default"
            style={optionStyle(i)}
          >
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center border text-xs font-semibold ${
                isMulti ? 'rounded-md' : 'rounded-full'
              }`}
              style={{
                borderColor: selected.includes(i) ? 'var(--accent-violet)' : 'var(--text-muted)',
                background: selected.includes(i) ? 'var(--accent-violet)' : 'transparent',
                color: selected.includes(i) ? '#fff' : 'var(--text-muted)',
              }}
            >
              {solved && task.correct.includes(i) ? (
                <Check size={14} />
              ) : status === 'wrong' && selected.includes(i) ? (
                <X size={14} />
              ) : (
                String.fromCharCode(1040 + i) /* А, Б, В, Г... */
              )}
            </span>
            {option}
          </button>
        ))}
      </div>

      {isMulti && !solved && (
        <button
          type="button"
          className="btn-gradient px-6 py-2.5 text-sm"
          disabled={selected.length === 0}
          onClick={() => evaluate(selected)}
        >
          Проверить
        </button>
      )}

      {/* Подсказка после первой ошибки */}
      {!solved && mistakes >= 1 && task.hint && (
        <div>
          {showHint ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 rounded-2xl border p-3.5 text-sm"
              style={{
                borderColor: 'rgba(34, 211, 238, 0.4)',
                background: 'rgba(34, 211, 238, 0.08)',
                color: 'var(--text-primary)',
              }}
            >
              <Lightbulb size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-cyan)' }} />
              {task.hint}
            </motion.div>
          ) : (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="btn-glass flex items-center gap-1.5 px-4 py-2 text-sm"
            >
              <Lightbulb size={15} style={{ color: 'var(--accent-cyan)' }} />
              Показать подсказку
            </button>
          )}
        </div>
      )}

      {/* Объяснение после верного ответа */}
      {solved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-4 text-sm"
          style={{
            borderColor: 'rgba(52, 211, 153, 0.4)',
            background: 'rgba(52, 211, 153, 0.07)',
          }}
        >
          <div className="mb-1 font-semibold" style={{ color: 'var(--success)' }}>
            Верно!
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{task.explanation}</p>
        </motion.div>
      )}
    </div>
  );
}
