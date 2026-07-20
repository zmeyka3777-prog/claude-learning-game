/**
 * Стрик: пламя (pink→amber градиент) + счётчик дней подряд.
 */
import { Flame } from 'lucide-react';
import { useT } from '../../i18n/useT';

interface StreakFlameProps {
  days: number;
  /** Крупный вариант для профиля */
  size?: 'sm' | 'lg';
}

export function StreakFlame({ days, size = 'sm' }: StreakFlameProps) {
  const t = useT();
  const active = days > 0;
  const iconSize = size === 'lg' ? 28 : 15;

  return (
    <span
      className={
        size === 'lg'
          ? 'flex items-center gap-2 rounded-2xl px-4 py-2 font-display text-xl font-semibold'
          : 'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold'
      }
      style={{
        background: active ? 'rgba(236, 72, 153, 0.12)' : 'var(--bg-card)',
        border: `1px solid ${active ? 'rgba(236, 72, 153, 0.3)' : 'var(--border-glass)'}`,
        color: active ? 'var(--accent-pink)' : 'var(--text-muted)',
      }}
      title={active ? t('streak.active', { days }) : t('streak.start')}
    >
      <span
        style={
          active
            ? {
                background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-amber))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                display: 'inline-flex',
              }
            : { display: 'inline-flex' }
        }
      >
        <Flame
          size={iconSize}
          style={active ? { stroke: 'var(--accent-pink)', fill: 'rgba(245,158,11,0.55)' } : undefined}
        />
      </span>
      {days}
    </span>
  );
}
