/**
 * Реальная миссия: инструкция (markdown) + чек-лист самопроверки.
 * Кнопка «Выполнил» активна, когда отмечены все пункты; даёт бонус XP.
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Compass, Zap } from 'lucide-react';
import type { RealMissionTask as RealMissionTaskType } from '../../engine/types';
import { renderMarkdown } from '../../lib/markdown';
import { ConfettiBurst } from '../gamification/ConfettiBurst';

interface RealMissionTaskProps {
  task: RealMissionTaskType;
  onSolved: (mistakes: number) => void;
}

export function RealMissionTask({ task, onSolved }: RealMissionTaskProps) {
  const [checked, setChecked] = useState<boolean[]>(() => task.checklist.map(() => false));
  const [solved, setSolved] = useState(false);

  const allChecked = checked.every(Boolean);

  const toggle = (index: number) => {
    if (solved) return;
    setChecked((c) => c.map((v, i) => (i === index ? !v : v)));
  };

  const complete = () => {
    if (!allChecked || solved) return;
    setSolved(true);
    onSolved(0);
  };

  return (
    <div className="relative space-y-4">
      {solved && <ConfettiBurst count={24} spread={140} />}

      <div className="flex items-start gap-2.5">
        <Compass size={22} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-amber)' }} />
        <div>
          <h3 className="font-display text-lg font-semibold">Реальная миссия</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Задание в настоящем Claude — самый ценный опыт и бонусный XP.
          </p>
        </div>
      </div>

      <div
        className="rounded-2xl border p-4 text-[15px]"
        style={{
          borderColor: 'rgba(245, 158, 11, 0.35)',
          background: 'rgba(245, 158, 11, 0.06)',
          color: 'var(--text-secondary)',
        }}
      >
        {renderMarkdown(task.instruction)}
      </div>

      {/* Чек-лист самопроверки */}
      <div className="space-y-2">
        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Проверь себя:
        </div>
        {task.checklist.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            disabled={solved}
            className="flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors disabled:cursor-default"
            style={{
              borderColor: checked[i] ? 'rgba(52, 211, 153, 0.45)' : 'var(--border-glass)',
              background: checked[i] ? 'rgba(52, 211, 153, 0.08)' : 'var(--bg-card)',
            }}
          >
            <span
              className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border"
              style={{
                borderColor: checked[i] ? 'var(--success)' : 'var(--text-muted)',
                background: checked[i] ? 'var(--success)' : 'transparent',
              }}
            >
              {checked[i] && <Check size={13} style={{ color: '#0B0E1A' }} />}
            </span>
            <span style={{ color: checked[i] ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {item}
            </span>
          </button>
        ))}
      </div>

      {!solved ? (
        <button
          type="button"
          onClick={complete}
          disabled={!allChecked}
          className="btn-gradient flex items-center gap-2 px-6 py-3 text-sm"
        >
          <Check size={16} />
          Выполнил
          <span
            className="ml-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
            style={{ background: 'rgba(0,0,0,0.25)' }}
          >
            <Zap size={11} /> +{task.xpBonus} XP
          </span>
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-4 text-sm"
          style={{ borderColor: 'rgba(52, 211, 153, 0.4)', background: 'rgba(52, 211, 153, 0.07)' }}
        >
          <div className="mb-1 font-semibold" style={{ color: 'var(--success)' }}>
            Миссия выполнена! +{task.xpBonus} бонусного XP
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Реальная практика — лучший способ закрепить навык. Так держать!
          </p>
        </motion.div>
      )}
    </div>
  );
}
