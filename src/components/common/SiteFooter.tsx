import { Send, MessageCircle } from 'lucide-react';
import { useT } from '../../i18n/useT';

const CHANNEL_URL = 'https://t.me/evgenia_vaibkoding';
const CONTACT_URL = 'https://t.me/Evgenia_Malina';

/**
 * Подвал сайта: авторство, ссылки на Telegram-канал и личку.
 * Показывается на всех экранах, кроме онбординга (см. App.tsx).
 */
export function SiteFooter() {
  const t = useT();

  return (
    <footer
      className="mt-8 border-t"
      style={{ borderColor: 'var(--border-glass)' }}
      aria-label={t('footer.madeBy')}
    >
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div
          className="flex flex-col items-center gap-4 rounded-2xl px-5 py-6 text-center"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              {t('footer.madeBy')}
            </p>
            <p className="mt-1 font-display text-lg font-semibold">
              <span className="gradient-text">{t('footer.authorName')}</span>
            </p>
          </div>

          <p
            className="max-w-md text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t('footer.tagline')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              style={{ background: 'var(--gradient-brand)' }}
            >
              <Send size={16} />
              {t('footer.channel')}
            </a>

            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={{
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
              }}
            >
              <MessageCircle size={16} style={{ color: 'var(--accent-cyan)' }} />
              @Evgenia_Malina
            </a>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  );
}
