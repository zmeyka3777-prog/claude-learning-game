/**
 * Рендер блоков теории урока (все типы из CONTENT_SCHEMA.md):
 * text (markdown), heading, code (+кнопка копирования), callout (3 вида),
 * table, example («плохо/хорошо» двумя колонками).
 */
import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { BookOpen, Check, Copy, Lightbulb, ThumbsDown, ThumbsUp, TriangleAlert } from 'lucide-react';
import type { CalloutKind, TheoryBlock } from '../../engine/types';
import { renderMarkdown } from '../../lib/markdown';

// --- Код с кнопкой «копировать» ---------------------------------------------

function CodePanel({ code, lang, title }: { code: string; lang: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard может быть недоступен — молча игнорируем
    }
  };

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ background: '#0d1117', border: '1px solid var(--border-glass)' }}
    >
      <div
        className="flex items-center justify-between gap-2 border-b px-4 py-2"
        style={{ borderColor: 'var(--border-glass)' }}
      >
        <span className="truncate font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          {title ?? lang}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors hover:bg-white/10"
          style={{ color: copied ? 'var(--success)' : 'var(--text-secondary)' }}
          aria-label="Копировать код"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Скопировано' : 'Копировать'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed" style={{ color: '#d6e2ff' }}>
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}

// --- Callout -----------------------------------------------------------------

const CALLOUTS: Record<
  CalloutKind,
  { icon: typeof Lightbulb; label: string; color: string; bg: string }
> = {
  tip: {
    icon: Lightbulb,
    label: '💡 Совет',
    color: 'var(--accent-cyan)',
    bg: 'rgba(34, 211, 238, 0.08)',
  },
  warning: {
    icon: TriangleAlert,
    label: '⚠️ Важно',
    color: 'var(--accent-amber)',
    bg: 'rgba(245, 158, 11, 0.08)',
  },
  docs: {
    icon: BookOpen,
    label: '📖 Из документации',
    color: 'var(--accent-violet)',
    bg: 'rgba(139, 92, 246, 0.1)',
  },
};

function Callout({ kind, md }: { kind: CalloutKind; md: string }) {
  const conf = CALLOUTS[kind];
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ borderColor: conf.color, background: conf.bg }}
    >
      <div className="mb-1.5 text-sm font-semibold" style={{ color: conf.color }}>
        {conf.label}
      </div>
      <div className="text-[15px]" style={{ color: 'var(--text-primary)' }}>
        {renderMarkdown(md)}
      </div>
    </div>
  );
}

// --- Пример «плохо/хорошо» ---------------------------------------------------

function ExampleBlockView({
  bad,
  good,
  explanation,
}: {
  bad: string;
  good: string;
  explanation: string;
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div
          className="rounded-2xl border p-4"
          style={{ borderColor: 'rgba(248, 113, 113, 0.4)', background: 'rgba(248, 113, 113, 0.07)' }}
        >
          <div
            className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase"
            style={{ color: 'var(--error)' }}
          >
            <ThumbsDown size={14} /> Плохо
          </div>
          <p className="font-mono text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
            {bad}
          </p>
        </div>
        <div
          className="rounded-2xl border p-4"
          style={{ borderColor: 'rgba(52, 211, 153, 0.4)', background: 'rgba(52, 211, 153, 0.07)' }}
        >
          <div
            className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase"
            style={{ color: 'var(--success)' }}
          >
            <ThumbsUp size={14} /> Хорошо
          </div>
          <p className="font-mono text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
            {good}
          </p>
        </div>
      </div>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {explanation}
      </p>
    </div>
  );
}

// --- Один блок ---------------------------------------------------------------

function TheoryBlockView({ block }: { block: TheoryBlock }) {
  switch (block.type) {
    case 'text':
      return (
        <div className="text-[15px] sm:text-base" style={{ color: 'var(--text-secondary)' }}>
          {renderMarkdown(block.md)}
        </div>
      );
    case 'heading':
      return (
        <h2 className="font-display text-xl font-semibold sm:text-2xl">
          <span className="gradient-text">{block.text}</span>
        </h2>
      );
    case 'code':
      return <CodePanel code={block.code} lang={block.lang} title={block.title} />;
    case 'callout':
      return <Callout kind={block.kind} md={block.md} />;
    case 'table':
      return (
        <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid var(--border-glass)' }}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ background: 'rgba(139, 92, 246, 0.12)' }}>
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-2.5 text-left font-semibold whitespace-nowrap"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr
                  key={r}
                  style={{ borderTop: '1px solid var(--border-glass)' }}
                >
                  {row.map((cell, c) => (
                    <td key={c} className="px-4 py-2.5 align-top" style={{ color: 'var(--text-secondary)' }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'example':
      return <ExampleBlockView bad={block.bad} good={block.good} explanation={block.explanation} />;
    default:
      return null;
  }
}

// --- Список блоков с появлением ---------------------------------------------

interface TheoryBlocksProps {
  blocks: TheoryBlock[];
}

export function TheoryBlocks({ blocks }: TheoryBlocksProps) {
  const reduced = useReducedMotion();

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => (
        <motion.div
          key={i}
          className="glass-card p-5"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.3) }}
        >
          <TheoryBlockView block={block} />
        </motion.div>
      ))}
    </div>
  );
}
