/**
 * Профиль исследователя: XP, уровень, стрик, бейджи,
 * альбом карточек функций с редкостями.
 */
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Award, BookOpenCheck, ClipboardCheck, Compass, Layers, Zap } from 'lucide-react';
import { BADGES, CARDS } from '../engine/content';
import { getLevel, useProgressStore, XP_PER_LEVEL } from '../engine/progressStore';
import { getTrackInfo } from '../lib/tracks';
import { BadgeHex } from '../components/gamification/BadgeUnlock';
import { StreakFlame } from '../components/gamification/StreakFlame';
import { FunctionCardView } from '../components/gamification/FunctionCardView';

export default function ProfilePage() {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const track = useProgressStore((s) => s.track);
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);
  const earnedBadges = useProgressStore((s) => s.badges);
  const earnedCards = useProgressStore((s) => s.cards);
  const completedLessons = useProgressStore((s) => s.completedLessons);

  const trackInfo = getTrackInfo(track);
  const level = getLevel(xp);
  const xpInLevel = xp % XP_PER_LEVEL;
  const levelProgress = (xpInLevel / XP_PER_LEVEL) * 100;

  const fadeUp = (delay = 0) => ({
    initial: reduced ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay },
  });

  return (
    <div className="space-y-6 py-8">
      <motion.h1 className="font-display text-2xl font-semibold sm:text-3xl" {...fadeUp()}>
        Профиль <span className="gradient-text">исследователя</span>
      </motion.h1>

      {/* Сводка: уровень, XP, стрик */}
      <motion.div className="glass-card p-6" {...fadeUp(0.05)}>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div className="flex items-center gap-4">
            <span
              className="grid h-16 w-16 place-items-center rounded-2xl font-display text-2xl font-bold text-white"
              style={{ background: 'var(--gradient-brand)', boxShadow: '0 0 32px rgba(139,92,246,0.4)' }}
            >
              {level}
            </span>
            <div>
              <div className="font-display text-lg font-semibold">Уровень {level}</div>
              <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--accent-amber)' }}>
                <Zap size={14} /> {xp} XP всего
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StreakFlame days={streak.current} size="lg" />
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div>дней подряд</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                рекорд: {streak.best}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <BookOpenCheck size={18} style={{ color: 'var(--accent-cyan)' }} />
            Пройдено уроков: {Object.keys(completedLessons).length}
          </div>
        </div>

        {/* Прогресс к следующему уровню */}
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>До уровня {level + 1}</span>
            <span>
              {xpInLevel} / {XP_PER_LEVEL} XP
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--gradient-brand)' }}
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 22, delay: 0.3 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Трек обучения */}
      <motion.section className="glass-card p-6" {...fadeUp(0.08)}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}
              aria-hidden="true"
            >
              {trackInfo ? trackInfo.emoji : <Compass size={22} style={{ color: 'var(--text-muted)' }} />}
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold">
                Трек: {trackInfo ? `«${trackInfo.title}»` : 'не выбран'}
              </h2>
              <p className="truncate text-sm" style={{ color: 'var(--text-secondary)' }}>
                {trackInfo
                  ? trackInfo.description
                  : 'Выбери трек — и на карте появятся рекомендованные сектора'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/placement')}
              className="flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(34, 211, 238, 0.45)',
                color: 'var(--accent-cyan)',
              }}
              title="16 вопросов — покажут, какие миры можно зачесть испытанием"
            >
              <ClipboardCheck size={16} />
              Входной тест
            </button>
            <button
              type="button"
              onClick={() => navigate('/onboarding')}
              className="flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(139, 92, 246, 0.45)',
                color: 'var(--accent-violet)',
              }}
            >
              <Compass size={16} />
              Сменить трек
            </button>
          </div>
        </div>
      </motion.section>

      {/* Бейджи */}
      <motion.section className="glass-card p-6" {...fadeUp(0.1)}>
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
          <Award size={20} style={{ color: 'var(--accent-amber)' }} />
          Бейджи
          <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>
            {earnedBadges.length} / {BADGES.length}
          </span>
        </h2>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {BADGES.map((badge) => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <div key={badge.id} className="flex flex-col items-center gap-2 text-center">
                <BadgeHex badge={badge} earned={earned} />
                <div>
                  <div
                    className="text-xs leading-tight font-semibold"
                    style={{ color: earned ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  >
                    {badge.title}
                  </div>
                  <div className="mt-0.5 text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>
                    {earned ? badge.description : badge.condition}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Альбом карточек */}
      <motion.section className="glass-card p-6" {...fadeUp(0.15)}>
        <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold">
          <Layers size={20} style={{ color: 'var(--accent-cyan)' }} />
          Альбом карточек
          <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>
            {earnedCards.length} / {CARDS.length}
          </span>
        </h2>
        <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Каждая карточка — освоенная функция Claude. Собери весь альбом!
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <FunctionCardView key={card.id} card={card} earned={earnedCards.includes(card.id)} />
          ))}
        </div>
      </motion.section>
    </div>
  );
}
