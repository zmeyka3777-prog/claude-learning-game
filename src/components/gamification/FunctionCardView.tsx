/**
 * «Голографическая» карточка функции с градиентной рамкой по редкости
 * и лёгким 3D-tilt при наведении (CSS, см. .holo-card).
 */
import type { CardRarity, FunctionCard } from '../../engine/types';
import { getIcon } from '../../lib/icons';
import { useT } from '../../i18n/useT';

/** Ключ строки-редкости для словаря (перевод берётся через useT) */
export const RARITY_KEYS: Record<CardRarity, string> = {
  common: 'rarity.common',
  rare: 'rarity.rare',
  epic: 'rarity.epic',
  legendary: 'rarity.legendary',
};

const RARITY_BORDERS: Record<CardRarity, string> = {
  common: 'linear-gradient(135deg, #6B7399, #A8B0D3)',
  rare: 'linear-gradient(135deg, #22D3EE, #0891B2)',
  epic: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
  legendary: 'linear-gradient(135deg, #F59E0B, #EC4899)',
};

const RARITY_GLOW: Record<CardRarity, string> = {
  common: 'none',
  rare: '0 0 24px rgba(34, 211, 238, 0.25)',
  epic: '0 0 28px rgba(139, 92, 246, 0.35)',
  legendary: '0 0 32px rgba(245, 158, 11, 0.4)',
};

const RARITY_TEXT: Record<CardRarity, string> = {
  common: 'var(--text-secondary)',
  rare: 'var(--accent-cyan)',
  epic: 'var(--accent-violet)',
  legendary: 'var(--accent-amber)',
};

interface FunctionCardViewProps {
  card: FunctionCard;
  earned?: boolean;
}

export function FunctionCardView({ card, earned = true }: FunctionCardViewProps) {
  const t = useT();
  const Icon = getIcon(card.icon);

  return (
    <div
      className={earned ? 'holo-card rounded-2xl p-[2px]' : 'rounded-2xl p-[2px]'}
      style={{
        background: earned ? RARITY_BORDERS[card.rarity] : 'var(--border-glass)',
        boxShadow: earned ? RARITY_GLOW[card.rarity] : 'none',
      }}
    >
      <div
        className="flex h-full flex-col gap-2 rounded-[14px] p-4"
        style={{ background: 'var(--bg-nebula)', opacity: earned ? 1 : 0.55 }}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className="grid h-10 w-10 place-items-center rounded-xl"
            style={{
              background: earned ? RARITY_BORDERS[card.rarity] : 'var(--bg-card)',
            }}
          >
            <Icon size={20} className="text-white" style={earned ? undefined : { color: 'var(--text-muted)' }} />
          </span>
          <span
            className="text-[11px] font-semibold tracking-wide uppercase"
            style={{ color: earned ? RARITY_TEXT[card.rarity] : 'var(--text-muted)' }}
          >
            {t(RARITY_KEYS[card.rarity])}
          </span>
        </div>
        <div className="font-display text-sm font-semibold">
          {earned ? card.title : '???'}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {earned ? card.description : t('card.locked.desc')}
        </p>
      </div>
    </div>
  );
}
