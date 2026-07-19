/**
 * Полноэкранный онбординг при первом входе:
 * 1) экран-приветствие с градиентным заголовком,
 * 2) выбор трека обучения (4 стеклянные карточки).
 * После выбора трек сохраняется в progress store, игрок попадает на карту.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Rocket, Sparkles } from 'lucide-react';
import { useProgressStore } from '../engine/progressStore';
import { TRACKS, type TrackInfo } from '../lib/tracks';

/** Появление с задержкой: fade + slide-up 24px (stagger детей) */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/** Экран 1: приветствие экспедиции */
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      key="welcome"
      className="flex w-full max-w-2xl flex-col items-center text-center"
      variants={containerVariants}
      initial={reduced ? 'visible' : 'hidden'}
      animate="visible"
      exit={reduced ? undefined : { opacity: 0, y: -24, transition: { duration: 0.3 } }}
    >
      <motion.span
        variants={itemVariants}
        className="mb-8 grid h-20 w-20 place-items-center rounded-3xl"
        style={{
          background: 'var(--gradient-brand)',
          boxShadow: '0 0 60px rgba(139, 92, 246, 0.5)',
        }}
      >
        <Sparkles size={38} className="text-white" />
      </motion.span>

      <motion.h1
        variants={itemVariants}
        className="font-display text-4xl leading-tight font-bold sm:text-6xl"
      >
        Академия <span className="gradient-text">Claude</span>
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="mx-auto mt-4 max-w-md text-base sm:text-lg"
        style={{ color: 'var(--text-secondary)' }}
      >
        Изучи все возможности Claude — играя
      </motion.p>

      <motion.div variants={itemVariants} className="mt-10">
        <button
          type="button"
          onClick={onStart}
          className="group flex items-center gap-2.5 rounded-full px-8 py-4 font-display text-base font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
          style={{
            background: 'var(--gradient-brand)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.45)',
          }}
        >
          <Rocket size={20} />
          Начать экспедицию
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </motion.div>
  );
}

/** Карточка трека: стекло + hover-свечение */
function TrackCard({ track, onSelect }: { track: TrackInfo; onSelect: () => void }) {
  return (
    <motion.button
      type="button"
      variants={itemVariants}
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card group flex w-full items-start gap-4 p-5 text-left transition-shadow hover:shadow-[0_0_40px_rgba(139,92,246,0.25)] sm:p-6"
      style={{ cursor: 'pointer' }}
    >
      <span
        className="grid shrink-0 place-items-center rounded-2xl text-2xl"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          height: 52,
          width: 52,
        }}
        aria-hidden="true"
      >
        {track.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-display text-base font-semibold sm:text-lg">
          {track.title}
          <ArrowRight
            size={16}
            className="opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
            style={{ color: 'var(--accent-cyan)' }}
          />
        </span>
        <span className="mt-1 block text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {track.description}
        </span>
      </span>
    </motion.button>
  );
}

/** Экран 2: выбор трека */
function TrackScreen({ onSelect }: { onSelect: (track: TrackInfo) => void }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      key="tracks"
      className="w-full max-w-3xl"
      variants={containerVariants}
      initial={reduced ? 'visible' : 'hidden'}
      animate="visible"
    >
      <motion.h2
        variants={itemVariants}
        className="text-center font-display text-2xl font-semibold sm:text-4xl"
      >
        Выбери свой <span className="gradient-text">трек</span>
      </motion.h2>
      <motion.p
        variants={itemVariants}
        className="mx-auto mt-3 mb-8 max-w-md text-center text-sm sm:text-base"
        style={{ color: 'var(--text-secondary)' }}
      >
        От трека зависит рекомендованный маршрут по секторам галактики. Сменить его можно в любой
        момент в профиле.
      </motion.p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TRACKS.map((track) => (
          <TrackCard key={track.id} track={track} onSelect={() => onSelect(track)} />
        ))}
      </div>
    </motion.div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const setTrack = useProgressStore((s) => s.setTrack);
  const hasTrack = useProgressStore((s) => s.track !== null);
  // Если трек уже выбран (пришли «сменить трек») — сразу экран выбора
  const [step, setStep] = useState<'welcome' | 'tracks'>(hasTrack ? 'tracks' : 'welcome');

  const handleSelect = (track: TrackInfo) => {
    setTrack(track.id);
    // На карту с приветственным тостом
    navigate('/', { state: { welcome: true } });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <AnimatePresence mode="wait">
        {step === 'welcome' ? (
          <WelcomeScreen key="welcome" onStart={() => setStep('tracks')} />
        ) : (
          <TrackScreen key="tracks" onSelect={handleSelect} />
        )}
      </AnimatePresence>
    </div>
  );
}
