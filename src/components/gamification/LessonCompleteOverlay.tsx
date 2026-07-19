/**
 * Полноэкранный оверлей завершения урока: звёздный взрыв, итог XP,
 * награды (карточка, бейджи), кнопка «Дальше».
 */
import { motion } from 'motion/react';
import { Star, Zap } from 'lucide-react';
import type { LessonCompletionResult } from '../../engine/progressStore';
import type { Lesson } from '../../engine/types';
import { getBadge, getCard } from '../../engine/content';
import { BadgeUnlock } from './BadgeUnlock';
import { ConfettiBurst } from './ConfettiBurst';
import { FunctionCardView } from './FunctionCardView';

interface LessonCompleteOverlayProps {
  lesson: Lesson;
  result: LessonCompletionResult;
  mistakes: number;
  bonusXp: number;
  onContinue: () => void;
}

export function LessonCompleteOverlay({
  lesson,
  result,
  mistakes,
  bonusXp,
  onContinue,
}: LessonCompleteOverlayProps) {
  const card = result.newCardId ? getCard(result.newCardId) : undefined;
  const badges = result.newBadgeIds
    .map((id) => getBadge(id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  // Звёзды за аккуратность: 3 — без ошибок, 2 — до двух, 1 — больше
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      style={{ background: 'rgba(11, 14, 26, 0.88)', backdropFilter: 'blur(12px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="glass-card relative w-full max-w-md p-6 text-center sm:p-8"
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        <ConfettiBurst count={36} spread={220} />

        {/* Звёзды */}
        <div className="mb-4 flex justify-center gap-2">
          {[1, 2, 3].map((n) => (
            <motion.span
              key={n}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.2 + n * 0.15 }}
            >
              <Star
                size={40}
                style={
                  n <= stars
                    ? {
                        color: 'var(--accent-amber)',
                        fill: 'var(--accent-amber)',
                        filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.6))',
                      }
                    : { color: 'var(--text-muted)' }
                }
              />
            </motion.span>
          ))}
        </div>

        <h2 className="font-display text-xl font-semibold sm:text-2xl">
          {lesson.isBoss ? 'Босс повержен!' : 'Экспедиция завершена!'}
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {lesson.title}
        </p>

        {/* Итог XP */}
        <motion.div
          className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full px-5 py-2 font-display text-lg font-semibold"
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: 'var(--accent-amber)',
          }}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 18 }}
        >
          <Zap size={20} />
          {result.alreadyCompleted ? 'Урок уже был пройден' : `+${result.xpGained + bonusXp} XP`}
        </motion.div>

        {result.streakCurrent > 0 && (
          <p className="mt-2 text-sm" style={{ color: 'var(--accent-pink)' }}>
            🔥 Стрик: {result.streakCurrent} дн.
          </p>
        )}

        {/* Новая карточка */}
        {card && (
          <motion.div
            className="mx-auto mt-5 max-w-[260px] text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div
              className="mb-2 text-center text-xs font-semibold tracking-wide uppercase"
              style={{ color: 'var(--accent-cyan)' }}
            >
              Новая карточка в альбоме
            </div>
            <FunctionCardView card={card} />
          </motion.div>
        )}

        {/* Новые бейджи */}
        {badges.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            {badges.map((b) => (
              <BadgeUnlock key={b.id} badge={b} />
            ))}
          </div>
        )}

        <motion.button
          type="button"
          onClick={onContinue}
          className="btn-gradient mt-7 w-full px-6 py-3.5 text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Дальше
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
