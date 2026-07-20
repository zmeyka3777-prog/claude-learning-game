/**
 * Симулятор чата в стиле claude.ai: пузыри пользователя справа (violet glass),
 * ответы «Claude» слева с аватаром-звёздочкой и эффектом печати.
 * Проверка ввода: содержит >= minMatches ключевых слов из expect.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Lightbulb, MessageCircle, SendHorizontal, Sparkles } from 'lucide-react';
import type { ChatSimTask as ChatSimTaskType } from '../../engine/types';
import { renderMarkdown } from '../../lib/markdown';
import { useT } from '../../i18n/useT';
import { ConfettiBurst } from '../gamification/ConfettiBurst';

interface ChatMessage {
  id: number;
  role: 'user' | 'claude';
  text: string;
}

/** Эффект печати для ответа «Claude» */
function Typewriter({ text, onDone }: { text: string; onDone?: () => void }) {
  const reduced = useReducedMotion();
  const [len, setLen] = useState(reduced ? text.length : 0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (reduced) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
      return;
    }
    if (len >= text.length) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
      return;
    }
    const timer = window.setTimeout(() => setLen((l) => Math.min(l + 2, text.length)), 18);
    return () => window.clearTimeout(timer);
  }, [len, text, reduced, onDone]);

  return <div className="text-[15px]">{renderMarkdown(text.slice(0, len))}</div>;
}

interface ChatSimTaskProps {
  task: ChatSimTaskType;
  onSolved: (mistakes: number) => void;
}

let chatMsgId = 1;

export function ChatSimTask({ task, onSolved }: ChatSimTaskProps) {
  const t = useT();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [typing, setTyping] = useState(false);
  const [solved, setSolved] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const finished = stepIndex >= task.steps.length;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, hint]);

  const submit = () => {
    const text = input.trim();
    if (!text || typing || finished) return;

    const step = task.steps[stepIndex];
    const lower = text.toLowerCase();
    const matches = step.expect.filter((kw) => lower.includes(kw.toLowerCase())).length;

    setMessages((m) => [...m, { id: chatMsgId++, role: 'user', text }]);
    setInput('');

    if (matches >= step.minMatches) {
      setHint(null);
      setTyping(true);
      // Небольшая пауза «Claude печатает…»
      window.setTimeout(() => {
        setMessages((m) => [...m, { id: chatMsgId++, role: 'claude', text: step.claudeReply }]);
      }, 500);
    } else {
      setMistakes((k) => k + 1);
      setHint(step.failHint);
    }
  };

  const handleReplyDone = () => {
    setTyping(false);
    const next = stepIndex + 1;
    setStepIndex(next);
    if (next >= task.steps.length && !solved) {
      setSolved(true);
      onSolved(mistakes);
    }
  };

  return (
    <div className="relative space-y-4">
      {solved && <ConfettiBurst count={20} spread={120} />}

      <div className="flex items-start gap-2.5">
        <MessageCircle size={22} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-violet)' }} />
        <h3 className="font-display text-lg font-semibold">{task.instruction}</h3>
      </div>

      {/* Окно чата в стиле claude.ai */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: 'rgba(11, 14, 26, 0.6)', border: '1px solid var(--border-glass)' }}
      >
        <div
          className="flex items-center gap-2 border-b px-4 py-2.5"
          style={{ borderColor: 'var(--border-glass)' }}
        >
          <span
            className="grid h-6 w-6 place-items-center rounded-full"
            style={{ background: 'var(--gradient-brand)' }}
          >
            <Sparkles size={13} className="text-white" />
          </span>
          <span className="text-sm font-semibold">Claude</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('chat.header.sim')}
          </span>
        </div>

        <div ref={scrollRef} className="max-h-80 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              {t('chat.empty')}
            </p>
          )}
          {messages.map((msg, i) => {
            const isLast = i === messages.length - 1;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'claude' && (
                  <span
                    className="mt-1 mr-2 grid h-7 w-7 shrink-0 place-items-center rounded-full"
                    style={{ background: 'var(--gradient-brand)' }}
                  >
                    <Sparkles size={14} className="text-white" />
                  </span>
                )}
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px]"
                  style={
                    msg.role === 'user'
                      ? {
                          background: 'rgba(139, 92, 246, 0.18)',
                          border: '1px solid rgba(139, 92, 246, 0.35)',
                          backdropFilter: 'blur(12px)',
                        }
                      : { background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }
                  }
                >
                  {msg.role === 'claude' ? (
                    isLast ? (
                      <Typewriter text={msg.text} onDone={handleReplyDone} />
                    ) : (
                      <div className="text-[15px]">{renderMarkdown(msg.text)}</div>
                    )
                  ) : (
                    msg.text
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Поле ввода */}
        {!finished && (
          <form
            className="flex items-center gap-2 border-t p-3"
            style={{ borderColor: 'var(--border-glass)' }}
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chat.placeholder')}
              disabled={typing}
              className="min-w-0 flex-1 rounded-xl border bg-transparent px-4 py-2.5 text-[15px] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent-violet)]"
              style={{ borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="btn-gradient grid h-10 w-10 shrink-0 place-items-center"
              aria-label={t('chat.send.aria')}
            >
              <SendHorizontal size={17} />
            </button>
          </form>
        )}
      </div>

      {hint && !finished && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 rounded-2xl border p-3.5 text-sm"
          style={{
            borderColor: 'rgba(34, 211, 238, 0.4)',
            background: 'rgba(34, 211, 238, 0.08)',
          }}
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
            {t('chat.solved')}
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{task.successMessage}</p>
        </motion.div>
      )}
    </div>
  );
}
