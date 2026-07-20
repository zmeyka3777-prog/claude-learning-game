/**
 * Симулятор терминала Claude Code: окно macOS-стиля, JetBrains Mono,
 * мигающий курсор, проверка ввода по regex expectPattern.
 */
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Lightbulb, SquareTerminal } from 'lucide-react';
import type { TerminalSimTask as TerminalSimTaskType } from '../../engine/types';
import { useT } from '../../i18n/useT';
import { ConfettiBurst } from '../gamification/ConfettiBurst';

interface TermLine {
  id: number;
  kind: 'cmd' | 'out' | 'err';
  text: string;
}

let termLineId = 1;

interface TerminalSimTaskProps {
  task: TerminalSimTaskType;
  onSolved: (mistakes: number) => void;
}

export function TerminalSimTask({ task, onSolved }: TerminalSimTaskProps) {
  const t = useT();
  const [lines, setLines] = useState<TermLine[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [solved, setSolved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const finished = stepIndex >= task.steps.length;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const submit = () => {
    const cmd = input.trim();
    if (!cmd || finished) return;

    const step = task.steps[stepIndex];
    setLines((l) => [...l, { id: termLineId++, kind: 'cmd', text: cmd }]);
    setInput('');

    let ok = false;
    try {
      ok = new RegExp(step.expectPattern).test(cmd);
    } catch {
      // Некорректный regex в контенте не должен ронять приложение
      ok = cmd === step.expectPattern;
    }

    if (ok) {
      setHint(null);
      setLines((l) => [...l, { id: termLineId++, kind: 'out', text: step.output }]);
      const next = stepIndex + 1;
      setStepIndex(next);
      if (next >= task.steps.length) {
        setSolved(true);
        onSolved(mistakes);
      }
    } else {
      setMistakes((m) => m + 1);
      setHint(step.failHint);
      setLines((l) => [...l, { id: termLineId++, kind: 'err', text: t('term.err') }]);
    }
  };

  return (
    <div className="relative space-y-4">
      {solved && <ConfettiBurst count={20} spread={120} />}

      <div className="flex items-start gap-2.5">
        <SquareTerminal size={22} className="mt-0.5 shrink-0" style={{ color: 'var(--success)' }} />
        <h3 className="font-display text-lg font-semibold">{task.instruction}</h3>
      </div>

      {/* Окно терминала macOS-стиля */}
      <div
        className="overflow-hidden rounded-2xl shadow-2xl"
        style={{ background: '#0d1117', border: '1px solid var(--border-glass)' }}
        onClick={() => inputRef.current?.focus()}
      >
        <div
          className="flex items-center gap-2 border-b px-4 py-2.5"
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
        >
          <span className="h-3 w-3 rounded-full" style={{ background: '#ff5f57' }} />
          <span className="h-3 w-3 rounded-full" style={{ background: '#febc2e' }} />
          <span className="h-3 w-3 rounded-full" style={{ background: '#28c840' }} />
          <span className="ml-2 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            terminal — claude
          </span>
        </div>

        <div ref={scrollRef} className="max-h-72 overflow-y-auto p-4 font-mono text-sm leading-relaxed">
          {lines.map((line) => (
            <div key={line.id} className="whitespace-pre-wrap">
              {line.kind === 'cmd' ? (
                <span>
                  <span style={{ color: 'var(--success)' }}>➜ ~ $ </span>
                  <span style={{ color: '#ffffff' }}>{line.text}</span>
                </span>
              ) : (
                <span style={{ color: line.kind === 'err' ? 'var(--error)' : '#9fe8a8' }}>
                  {line.text}
                </span>
              )}
            </div>
          ))}

          {/* Строка ввода с мигающим курсором */}
          {!finished && (
            <form
              className="flex items-center"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <span className="shrink-0" style={{ color: 'var(--success)' }}>
                ➜ ~ ${' '}
              </span>
              <div className="relative ml-2 min-w-0 flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  autoFocus
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full bg-transparent font-mono text-sm text-white caret-transparent outline-none"
                  aria-label={t('term.input.aria')}
                />
                <span
                  className="terminal-cursor pointer-events-none absolute top-0 inline-block"
                  style={{
                    left: `${input.length}ch`,
                    width: '8px',
                    height: '1.2em',
                    background: '#9fe8a8',
                  }}
                />
              </div>
            </form>
          )}
        </div>
      </div>

      {hint && !finished && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 rounded-2xl border p-3.5 text-sm"
          style={{ borderColor: 'rgba(34, 211, 238, 0.4)', background: 'rgba(34, 211, 238, 0.08)' }}
        >
          <Lightbulb size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-cyan)' }} />
          {hint}
        </motion.div>
      )}

      {solved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-4 text-sm"
          style={{ borderColor: 'rgba(52, 211, 153, 0.4)', background: 'rgba(52, 211, 153, 0.07)' }}
        >
          <div className="mb-1 font-semibold" style={{ color: 'var(--success)' }}>
            {t('term.solved')}
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{task.successMessage}</p>
        </motion.div>
      )}
    </div>
  );
}
