/**
 * Бейдж: шестиугольник со свечением.
 * BadgeHex — статичное отображение (профиль, оверлей).
 * BadgeUnlock — анимация выдачи: scale + rotate + конфетти.
 */
import { motion } from 'motion/react';
import type { Badge } from '../../engine/types';
import { getIcon } from '../../lib/icons';
import { useT } from '../../i18n/useT';
import { ConfettiBurst } from './ConfettiBurst';

const HEX_CLIP = 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)';

interface BadgeHexProps {
  badge: Badge;
  earned?: boolean;
  size?: number;
}

export function BadgeHex({ badge, earned = true, size = 72 }: BadgeHexProps) {
  const Icon = getIcon(badge.icon);
  return (
    <div
      className="grid place-items-center"
      style={{
        width: size,
        height: size,
        clipPath: HEX_CLIP,
        background: earned
          ? 'var(--gradient-brand)'
          : 'rgba(255,255,255,0.06)',
        filter: earned ? 'drop-shadow(0 0 14px rgba(139,92,246,0.5))' : 'none',
        opacity: earned ? 1 : 0.45,
      }}
      title={badge.title}
    >
      <div
        className="grid place-items-center"
        style={{
          width: size - 8,
          height: size - 8,
          clipPath: HEX_CLIP,
          background: earned ? 'rgba(11,14,26,0.55)' : 'var(--bg-nebula)',
        }}
      >
        <Icon
          size={size * 0.4}
          style={{ color: earned ? 'var(--accent-amber)' : 'var(--text-muted)' }}
        />
      </div>
    </div>
  );
}

interface BadgeUnlockProps {
  badge: Badge;
}

/** Анимация получения бейджа: scale + rotate + конфетти */
export function BadgeUnlock({ badge }: BadgeUnlockProps) {
  const t = useT();
  return (
    <div className="relative flex flex-col items-center gap-2">
      <ConfettiBurst count={18} spread={90} />
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 16, delay: 0.15 }}
      >
        <BadgeHex badge={badge} size={88} />
      </motion.div>
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <div className="text-sm font-semibold" style={{ color: 'var(--accent-amber)' }}>
          {t('badge.new')}
        </div>
        <div className="font-display text-sm">{badge.title}</div>
      </motion.div>
    </div>
  );
}
