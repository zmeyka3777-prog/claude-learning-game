/**
 * Карта миров: активный мир с полной звёздной тропой,
 * миры 2–8 — карточки «Скоро» с замком.
 */
import { motion, useReducedMotion } from 'motion/react';
import { Lock } from 'lucide-react';
import { WORLDS } from '../engine/content';
import { useProgressStore } from '../engine/progressStore';
import { WorldMap } from '../components/map/WorldMap';
import { getAccentColor, getIcon } from '../lib/icons';
import type { World } from '../engine/types';

function ComingSoonWorld({ world, index }: { world: World; index: number }) {
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
    </motion.div>
  );
}

export default function MapPage() {
  const reduced = useReducedMotion();
  const completedCount = useProgressStore((s) => Object.keys(s.completedLessons).length);

  const activeWorlds = WORLDS.filter((w) => !w.comingSoon);
  const upcomingWorlds = WORLDS.filter((w) => w.comingSoon);

  return (
    <div className="py-8">
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
          <WorldMap key={world.id} world={world} />
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
              <ComingSoonWorld key={world.id} world={world} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
