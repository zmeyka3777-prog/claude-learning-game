/**
 * Библиотека: каталог проверенных скиллов, плагинов и MCP-серверов
 * с командами установки. Данные — content/library/*.json (LIBRARY_ITEMS).
 * Если контента ещё нет, показываем заглушку «Библиотека пополняется».
 */
import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { getLibraryItems } from '../engine/content';
import { track } from '../lib/analytics';
import { useLang, useT } from '../i18n/useT';
import type { LibraryItem, LibraryKind, LibrarySource } from '../engine/types';

// --- Справочники оформления --------------------------------------------------

type TabId = 'all' | LibraryKind;

const TABS: Array<{ id: TabId; labelKey: string }> = [
  { id: 'all', labelKey: 'library.tab.all' },
  { id: 'skill', labelKey: 'library.tab.skill' },
  { id: 'plugin', labelKey: 'library.tab.plugin' },
  { id: 'mcp', labelKey: 'library.tab.mcp' },
];

const SOURCE_BADGES: Record<
  LibrarySource,
  { labelKey: string; color: string; background: string; border: string; Icon: typeof Sparkles }
> = {
  official: {
    labelKey: 'library.source.official',
    color: 'var(--accent-amber)',
    background: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
    Icon: Sparkles,
  },
  verified: {
    labelKey: 'library.source.verified',
    color: 'var(--accent-cyan)',
    background: 'rgba(34, 211, 238, 0.12)',
    border: 'rgba(34, 211, 238, 0.35)',
    Icon: ShieldCheck,
  },
  community: {
    labelKey: 'library.source.community',
    color: 'var(--text-secondary)',
    background: 'rgba(168, 176, 211, 0.1)',
    border: 'rgba(168, 176, 211, 0.3)',
    Icon: Users,
  },
};

// --- Копирование в буфер обмена (с fallback для старых браузеров) ------------

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // clipboard API недоступен (http, старый браузер) — пробуем fallback
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

// --- Карточка записи ---------------------------------------------------------

function LibraryCard({
  item,
  index,
  onCopy,
}: {
  item: LibraryItem;
  index: number;
  onCopy: (item: LibraryItem) => void;
}) {
  const reduced = useReducedMotion();
  const t = useT();
  const badge = SOURCE_BADGES[item.source];
  const BadgeIcon = badge.Icon;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(item.install);
    if (ok) {
      setCopied(true);
      onCopy(item);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.article
      className="glass-card glass-card-hover flex flex-col gap-3 p-5"
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: reduced ? 0 : Math.min(index * 0.06, 0.42) }}
      layout={reduced ? undefined : 'position'}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-display text-base font-semibold">{item.name}</h3>
        <span
          className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: badge.background, border: `1px solid ${badge.border}`, color: badge.color }}
        >
          <BadgeIcon size={11} />
          {t(badge.labelKey)}
        </span>
      </div>

      <span
        className="w-fit rounded-full px-2.5 py-0.5 text-xs font-medium"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          color: 'var(--text-secondary)',
        }}
      >
        {item.category}
      </span>

      <p className="flex-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {item.description}
      </p>

      <div
        className="rounded-xl p-3 text-sm"
        style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)' }}
      >
        <div
          className="mb-1 text-[11px] font-semibold tracking-wide uppercase"
          style={{ color: 'var(--accent-violet)' }}
        >
          {t('library.usefulFor')}
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>{item.useFor}</div>
      </div>

      <div
        className="flex items-center gap-2 rounded-xl p-3"
        style={{ background: '#0d1117', border: '1px solid var(--border-glass)' }}
      >
        <code
          className="min-w-0 flex-1 overflow-x-auto font-mono text-xs whitespace-nowrap"
          style={{ color: 'var(--accent-cyan)' }}
        >
          {item.install}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="btn-glass flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 text-xs"
          aria-label={t('library.copy.aria', { name: item.name })}
        >
          {copied ? (
            <Check size={13} style={{ color: 'var(--success)' }} />
          ) : (
            <Copy size={13} />
          )}
          {copied ? t('library.copy.done') : t('library.copy')}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 underline underline-offset-2 transition-colors hover:brightness-125"
          style={{ color: 'var(--accent-cyan)' }}
        >
          <ExternalLink size={14} />
          {t('library.repo')}
        </a>
        {item.docs && (
          <a
            href={item.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 underline underline-offset-2 transition-colors hover:brightness-125"
            style={{ color: 'var(--accent-cyan)' }}
          >
            <BookOpen size={14} />
            {t('library.docs')}
          </a>
        )}
      </div>
    </motion.article>
  );
}

// --- Страница ----------------------------------------------------------------

export default function LibraryPage() {
  const reduced = useReducedMotion();
  const t = useT();
  const { lang } = useLang();
  const items = useMemo(() => getLibraryItems(lang), [lang]);
  const [tab, setTab] = useState<TabId>('all');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTimer, setToastTimer] = useState<number | null>(null);

  const countByKind = useMemo(() => {
    const counts: Record<TabId, number> = { all: items.length, skill: 0, plugin: 0, mcp: 0 };
    for (const item of items) counts[item.kind] += 1;
    return counts;
  }, [items]);

  // Категории — только по записям активной вкладки
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (tab === 'all' || item.kind === tab) set.add(item.category);
    }
    return [...set].sort((a, b) => a.localeCompare(b, lang));
  }, [tab, items, lang]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (tab !== 'all' && item.kind !== tab) return false;
      if (category !== null && item.category !== category) return false;
      if (q !== '' && !item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [tab, query, category, items]);

  const showCopyToast = (item: LibraryItem) => {
    track('library_install_copied', { itemId: item.id });
    if (toastTimer !== null) window.clearTimeout(toastTimer);
    setToastVisible(true);
    setToastTimer(window.setTimeout(() => setToastVisible(false), 2200));
  };

  const selectTab = (next: TabId) => {
    setTab(next);
    setCategory(null); // набор категорий меняется вместе с вкладкой
  };

  return (
    <div className="py-8">
      {/* Заголовок */}
      <motion.div
        className="mb-8 text-center"
        initial={reduced ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-2xl font-semibold sm:text-4xl">
          <span className="gradient-text">{t('topbar.library')}</span>
        </h1>
        <p
          className="mx-auto mt-2 max-w-md text-sm sm:text-base"
          style={{ color: 'var(--text-secondary)' }}
        >
          {t('library.subtitle')}
        </p>
      </motion.div>

      {items.length === 0 ? (
        // Контент пишется параллельно и мог ещё не появиться
        <motion.div
          className="glass-card mx-auto max-w-md p-10 text-center"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-3 text-4xl" aria-hidden="true">
            📚
          </div>
          <h2 className="font-display text-lg font-semibold">{t('library.empty.title')}</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('library.empty.body')}
          </p>
        </motion.div>
      ) : (
        <>
          {/* Табы */}
          <div className="mb-4 flex flex-wrap justify-center gap-2" role="tablist" aria-label={t('library.tablist.aria')}>
            {TABS.map(({ id, labelKey }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectTab(id)}
                  className={`${active ? 'btn-gradient' : 'btn-glass'} px-4 py-2 text-sm`}
                >
                  {t(labelKey)}
                  <span className="ml-1.5 opacity-70">{countByKind[id]}</span>
                </button>
              );
            })}
          </div>

          {/* Поиск */}
          <div className="mx-auto mb-4 max-w-md">
            <label className="glass-card flex items-center gap-2.5 px-4 py-2.5">
              <Search size={16} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('library.search.placeholder')}
                aria-label={t('library.search.aria')}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </label>
          </div>

          {/* Фильтр-чипы категорий */}
          {categories.length > 1 && (
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {categories.map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(active ? null : cat)}
                    className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{
                      background: active ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-card)',
                      border: `1px solid ${active ? 'rgba(139, 92, 246, 0.55)' : 'var(--border-glass)'}`,
                      color: active ? 'var(--accent-violet)' : 'var(--text-secondary)',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}

          {/* Сетка карточек */}
          {filtered.length === 0 ? (
            <div className="glass-card mx-auto max-w-md p-8 text-center">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t('library.nothingFound')}
              </p>
              <button
                type="button"
                className="btn-glass mt-4 px-4 py-2 text-sm"
                onClick={() => {
                  setQuery('');
                  setCategory(null);
                  setTab('all');
                }}
              >
                {t('library.resetFilters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item, i) => (
                <LibraryCard key={item.id} item={item} index={i} onCopy={showCopyToast} />
              ))}
            </div>
          )}

          {/* Дисклеймер */}
          <div
            className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            {t('library.disclaimer')}
          </div>
        </>
      )}

      {/* Тост «Скопировано» */}
      <div className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
        <AnimatePresence>
          {toastVisible && (
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              style={{
                background: 'rgba(19, 26, 51, 0.94)',
                border: '1px solid rgba(52, 211, 153, 0.45)',
                boxShadow: '0 0 32px rgba(52, 211, 153, 0.3)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: 'var(--success)',
              }}
              role="status"
            >
              <Check size={15} />
              {t('common.copied')}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
