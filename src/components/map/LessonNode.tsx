/**
 * Узел урока на звёздной тропе.
 * Состояния: заблокирован / доступен (пульс) / пройден / босс.
 * Отдельное состояние loading — контент урока ещё не написан.
 * Состояние passed — мир зачтён испытанием босса: полупрозрачная галочка,
 * урок остаётся доступным (за карточку и XP).
 */
import { motion, useReducedMotion } from 'motion/react';
import { Check, Crown, Hourglass, Lock } from 'lucide-react';
import { useT } from '../../i18n/useT';

export type NodeStatus = 'locked' | 'available' | 'done' | 'loading' | 'passed';

interface LessonNodeProps {
  title: string;
  status: NodeStatus;
  isBoss: boolean;
  order: number;
  onClick?: () => void;
}

export function LessonNode({ title, status, isBoss, order, onClick }: LessonNodeProps) {
  const reduced = useReducedMotion();
  const t = useT();
  const size = isBoss ? 72 : 64;
  const clickable = status === 'available' || status === 'done' || status === 'passed';

  const circleStyle = (): React.CSSProperties => {
    switch (status) {
      case 'done':
        return {
          background: 'var(--gradient-brand)',
          boxShadow: '0 0 24px rgba(139, 92, 246, 0.45)',
          border: isBoss ? '3px solid var(--accent-amber)' : 'none',
        };
      case 'passed':
        // Зачтено испытанием: полупрозрачная галочка, но узел кликабелен
        return {
          background: 'var(--gradient-brand)',
          border: isBoss ? '3px solid rgba(245, 158, 11, 0.5)' : 'none',
          opacity: 0.45,
        };
      case 'available':
        return {
          background: 'rgba(139, 92, 246, 0.2)',
          border: isBoss ? '3px solid var(--accent-amber)' : '2px solid var(--accent-violet)',
          boxShadow: '0 0 32px rgba(139, 92, 246, 0.55)',
        };
      default:
        return {
          background: 'rgba(255, 255, 255, 0.05)',
          border: isBoss ? '3px solid rgba(245, 158, 11, 0.35)' : '2px solid var(--border-glass)',
          opacity: 0.7,
        };
    }
  };

  const icon = () => {
    const iconColor =
      status === 'done' ? '#fff' : status === 'available' ? 'var(--accent-violet)' : 'var(--text-muted)';
    if (status === 'done' || status === 'passed')
      return <Check size={isBoss ? 30 : 26} color="#fff" strokeWidth={3} />;
    if (isBoss)
      return (
        <Crown
          size={30}
          style={{ color: status === 'available' ? 'var(--accent-amber)' : iconColor }}
        />
      );
    if (status === 'loading') return <Hourglass size={22} style={{ color: iconColor }} />;
    if (status === 'locked') return <Lock size={22} style={{ color: iconColor }} />;
    return (
      <span className="font-display text-lg font-semibold" style={{ color: iconColor }}>
        {order}
      </span>
    );
  };

  return (
    <button
      type="button"
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      className="group flex w-40 flex-col items-center gap-2 disabled:cursor-not-allowed"
      aria-label={`${isBoss ? t('node.aria.boss') : ''}${title}${
        status === 'locked' ? t('node.aria.locked') : ''
      }`}
    >
      <motion.span
        className={`grid place-items-center rounded-full ${
          status === 'available' && !reduced ? 'node-pulse' : ''
        }`}
        style={{ width: size, height: size, ...circleStyle() }}
        whileHover={clickable ? { scale: 1.1 } : undefined}
        whileTap={clickable ? { scale: 0.95 } : undefined}
      >
        {icon()}
      </motion.span>
      <span
        className="max-w-full text-center text-xs leading-snug font-medium"
        style={{
          color:
            status === 'available'
              ? 'var(--text-primary)'
              : status === 'done'
                ? 'var(--text-secondary)'
                : 'var(--text-muted)',
        }}
      >
        {title}
        {status === 'loading' && (
          <span className="block text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {t('node.loading')}
          </span>
        )}
        {status === 'passed' && (
          <span className="block text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {t('node.passed')}
          </span>
        )}
      </span>
    </button>
  );
}
