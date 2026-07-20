/**
 * Реальная миссия: инструкция (markdown) + чек-лист самопроверки.
 * Кнопка «Выполнил» активна, когда отмечены все пункты; даёт бонус XP.
 */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Compass, Copy, Zap } from 'lucide-react';
import type { RealMissionTask as RealMissionTaskType } from '../../engine/types';
import { renderMarkdown } from '../../lib/markdown';
import { ConfettiBurst } from '../gamification/ConfettiBurst';

interface RealMissionTaskProps {
  task: RealMissionTaskType;
  onSolved: (mistakes: number) => void;
}

/** Копирование в буфер: navigator.clipboard с fallback на скрытый textarea */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // переходим к fallback
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function RealMissionTask({ task, onSolved }: RealMissionTaskProps) {
  const [checked, setChecked] = useState<boolean[]>(() => task.checklist.map(() => false));
  const [solved, setSolved] = useState(false);
  const [mentorOpen, setMentorOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

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

  const copyForMentor = async () => {
    const text = [
      task.instruction,
      '',
      'Чек-лист:',
      ...task.checklist.map((item) => `- ${item}`),
      '',
      'Проверь миссию из Академии Claude по этому чек-листу',
    ].join('\n');
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedToast(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setCopiedToast(false), 2000);
    }
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

      {/* Подсказка про скилл «Наставник Академии» */}
      <div
        className="rounded-2xl border"
        style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-card)' }}
      >
        <button
          type="button"
          onClick={() => setMentorOpen((v) => !v)}
          aria-expanded={mentorOpen}
          className="flex w-full items-center justify-between gap-3 p-3.5 text-left text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span>🧑‍🚀 Хочешь настоящую проверку?</span>
          <ChevronDown
            size={16}
            className="shrink-0 transition-transform"
            style={{
              color: 'var(--text-muted)',
              transform: mentorOpen ? 'rotate(180deg)' : 'none',
            }}
          />
        </button>
        {mentorOpen && (
          <div className="space-y-3 px-3.5 pb-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>
              Установи скилл «Наставник Академии» (раздел Библиотека) — и настоящий Claude проверит
              твою миссию по этому чек-листу.
            </p>
            <div className="relative inline-block">
              <button
                type="button"
                onClick={copyForMentor}
                className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors"
                style={{
                  borderColor: 'var(--border-glass)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                }}
              >
                <Copy size={14} style={{ color: 'var(--accent-cyan)' }} />
                Скопировать миссию для наставника
              </button>
              <AnimatePresence>
                {copiedToast && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border px-3 py-1 text-xs font-semibold"
                    style={{
                      borderColor: 'rgba(52, 211, 153, 0.45)',
                      background: 'rgba(52, 211, 153, 0.12)',
                      color: 'var(--success)',
                    }}
                  >
                    Скопировано
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
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
