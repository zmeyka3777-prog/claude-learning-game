/**
 * Карта миров: активный мир с полной звёздной тропой,
 * миры 2–8 — карточки «Скоро» с замком.
 * Миры выбранного трека отмечены бейджем «Рекомендовано».
 */
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Compass, Lock } from 'lucide-react';
import { WORLDS } from '../engine/content';
import { useProgressStore } from '../engine/progressStore';
import { WorldMap, RecommendedBadge } from '../components/map/WorldMap';
import { getAccentColor, getIcon } from '../lib/icons';
import { getTrackInfo, isWorldRecommended } from '../lib/tracks';
import type { World } from '../engine/types';

/** Приветственный тост после выбора трека в онбординге */
function WelcomeToast() {
  const track = useProgressStore((s) => s.track);
  const location = useLocation();
  const [visible, setVisible] = useState(
    () => Boolean((location.state as { welcome?: boolean } | null)?.welcome),
  );

  useEffect(() => {
    if (!visible) return;
    // Чистим state, чтобы тост не всплывал при обновлении страницы
    window.history.replaceState({}, '');
    const timer = window.setTimeout(() => setVisible(false), 4500);
    return () => window.clearTimeout(timer);
  }, [visible]);

  const info = getTrackInfo(track);

  return (
    <div className="pointer-events-none fixed top-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
      <AnimatePresence>
        {visible && info && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="flex items-start gap-3 rounded-2xl p-4"
            style={{
              background: 'rgba(19, 26, 51, 0.94)',
              border: '1px solid rgba(139, 92, 246, 0.45)',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            role="status"
          >
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
              style={{ background: 'var(--gradient-brand)' }}
            >
              <Compass size={20} className="text-white" />
            </span>
            <div className="min-w-0 text-sm">
              <div className="font-display font-semibold">
                Добро пожаловать в экспедицию, исследователь!
              </div>
              <div className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Трек {info.emoji} «{info.title}» выбран — рекомендованные сектора отмечены на карте.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ComingSoonWorld({
  world,
  index,
  recommended,
}: {
  world: World;
  index: number;
  recommended: boolean;
}) {
  const reduced = useReducedMotion();
  const Icon = getIcon(world.icon);
  const accent = getAccentColor(world.color);

  return (
    <motion.div
      className="glass-card flex items-center gap-4 p-5"
      style={{ opacity: 0.75 }}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 0.75, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25) }}
    >
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}
      >
        <Icon size={22} style={{ color: 'var(--text-muted)' }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold tracking-wide uppercase" style={{ color: accent }}>
          Сектор {world.order}
        </div>
        <h3 className="font-display text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {world.title}
        </h3>
        <p className="truncate text-sm" style={{ color: 'var(--text-muted)' }}>
          {world.subtitle}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {recommended && <RecommendedBadge />}
        <span
          className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-muted)',
          }}
        >
          <Lock size={12} />
          Скоро
        </span>
      </div>
    </motion.div>
  );
}

export default function MapPage() {
  const reduced = useReducedMotion();
  const completedCount = useProgressStore((s) => Object.keys(s.completedLessons).length);
  const track = useProgressStore((s) => s.track);

  const activeWorlds = WORLDS.filter((w) => !w.comingSoon);
  const upcomingWorlds = WORLDS.filter((w) => w.comingSoon);

  return (
    <div className="py-8">
      <WelcomeToast />

      <motion.div
        className="mb-8 text-center"
        initial={reduced ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-2xl font-semibold sm:text-4xl">
          Карта <span className="gradient-text">галактики</span>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
          {completedCount === 0
            ? 'Твоя экспедиция начинается. Выбери первый урок сектора 1!'
            : `Пройдено уроков: ${completedCount}. Продолжай экспедицию!`}
        </p>
      </motion.div>

      <div className="space-y-6">
        {activeWorlds.map((world) => (
          <WorldMap
            key={world.id}
            world={world}
            recommended={isWorldRecommended(track, world.order)}
          />
        ))}

        {upcomingWorlds.length > 0 && (
          <div className="space-y-3 pt-4">
            <h2
              className="text-center text-xs font-semibold tracking-widest uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              Следующие сектора галактики
            </h2>
            {upcomingWorlds.map((world, i) => (
              <ComingSoonWorld
                key={world.id}
                world={world}
                index={i}
                recommended={isWorldRecommended(track, world.order)}
              />
            ))}
          </div>
        )}

        {/* Баннер библиотеки — после списка миров */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.4 }}
          className="pt-2"
        >
          <Link
            to="/library"
            className="glass-card glass-card-hover flex items-center gap-4 p-5"
            style={{ border: '1px solid rgba(34, 211, 238, 0.3)' }}
          >
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}
              aria-hidden="true"
            >
              📚
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base font-semibold">
                <span className="gradient-text">Библиотека</span>: готовые скиллы, плагины и MCP
              </h3>
              <p className="truncate text-sm" style={{ color: 'var(--text-secondary)' }}>
                Проверенные расширения с командами установки — прокачай свой арсенал.
              </p>
            </div>
            <ArrowRight size={18} className="shrink-0" style={{ color: 'var(--accent-cyan)' }} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
