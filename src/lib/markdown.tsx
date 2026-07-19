/**
 * Простой markdown-рендер без внешних зависимостей.
 * Поддерживает: заголовки ###, списки (-, *, 1.), **жирный**, *курсив*,
 * `код`, [ссылки](url), ```блоки кода``` и параграфы.
 * Этого достаточно для теории уроков; полноценный md-парсер не нужен.
 */
import type { ReactNode } from 'react';
import { Fragment } from 'react';

// --- Инлайновая разметка -----------------------------------------------------

const INLINE_RE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string): ReactNode {
  const parts = text.split(INLINE_RE).filter((p) => p !== '');
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-txt">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="rounded-md px-1.5 py-0.5 text-[0.875em]"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--accent-cyan)' }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      return (
        <a
          key={i}
          href={link[2]}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 transition-colors hover:brightness-125"
          style={{ color: 'var(--accent-cyan)' }}
        >
          {link[1]}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

// --- Блочная разметка --------------------------------------------------------

export function renderMarkdown(md: string): ReactNode {
  const lines = md.split('\n');
  const out: ReactNode[] = [];
  let key = 0;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Пустая строка — разделитель блоков
    if (line.trim() === '') {
      i += 1;
      continue;
    }

    // Блок кода ```
    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1; // закрывающая ```
      out.push(
        <pre
          key={key++}
          className="my-3 overflow-x-auto rounded-xl p-4 text-sm leading-relaxed"
          style={{ background: '#0d1117', border: '1px solid var(--border-glass)' }}
        >
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    // Заголовки (### и ниже — все как h3 по схеме контента)
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      out.push(
        <h3 key={key++} className="mt-5 mb-2 text-lg font-semibold text-txt">
          {renderInline(heading[2])}
        </h3>,
      );
      i += 1;
      continue;
    }

    // Маркированный список
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i += 1;
      }
      out.push(
        <ul key={key++} className="my-2 list-disc space-y-1.5 pl-6 marker:text-violet-accent">
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Нумерованный список
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i += 1;
      }
      out.push(
        <ol key={key++} className="my-2 list-decimal space-y-1.5 pl-6 marker:text-cyan-accent">
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Параграф: собираем подряд идущие непустые строки
    const para: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^#{1,6}\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith('```')
    ) {
      para.push(lines[i]);
      i += 1;
    }
    out.push(
      <p key={key++} className="my-2">
        {renderInline(para.join(' '))}
      </p>,
    );
  }

  return <>{out}</>;
}
