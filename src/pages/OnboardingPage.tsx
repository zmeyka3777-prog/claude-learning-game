/**
 * Полноэкранный онбординг при первом входе:
 * 1) экран-приветствие с градиентным заголовком,
 * 2) выбор трека обучения (4 стеклянные карточки),
 * 3) предложение входного теста для тех, кто уже пользуется Claude.
 * После выбора трек сохраняется в progress store, игрок попадает
 * на входной тест или сразу на карту.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ClipboardCheck, Languages, Rocket, Compass } from 'lucide-react';
import { useProgressStore } from '../engine/progressStore';
import { TRACKS, type TrackInfo } from '../lib/tracks';
import { LANGUAGES } from '../i18n/languages';
import { useLang, useT } from '../i18n/useT';

/** Появление с задержкой: fade + slide-up 24px (stagger детей) */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/** Экран 0: выбор языка (первый шаг первого входа) */
function LanguageScreen({ onSelect }: { onSelect: () => void }) {
  const reduced = useReducedMotion();
  const t = useT();
  const { lang, setLang } = useLang();

  return (
    <motion.div
      key="lang"
      className="flex w-full max-w-xl flex-col items-center text-center"
      variants={containerVariants}
      initial={reduced ? 'visible' : 'hidden'}
      animate="visible"
      exit={reduced ? undefined : { opacity: 0, y: -24, transition: { duration: 0.3 } }}
    >
      <motion.span
        variants={itemVariants}
        className="mb-6 grid h-16 w-16 place-items-center rounded-3xl"
        style={{
          background: 'var(--gradient-brand)',
          boxShadow: '0 0 50px rgba(139, 92, 246, 0.45)',
        }}
      >
        <Languages size={30} className="text-white" />
      </motion.span>

      <motion.h1
        variants={itemVariants}
        className="font-display text-2xl font-semibold sm:text-4xl"
      >
        {t('onb.lang.title')}
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="mx-auto mt-3 max-w-md text-sm sm:text-base"
        style={{ color: 'var(--text-secondary)' }}
      >
        {t('onb.lang.subtitle')}
      </motion.p>

      <motion.div variants={itemVariants} className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {LANGUAGES.map((l) => {
          const active = l.code === lang;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className="glass-card flex items-center justify-between gap-3 p-4 text-left transition-shadow hover:shadow-[0_0_40px_rgba(139,92,246,0.25)]"
              style={{
                border: active
                  ? '1px solid rgba(139, 92, 246, 0.6)'
                  : '1px solid var(--border-glass)',
                cursor: 'pointer',
              }}
              aria-pressed={active}
            >
              <span className="font-display text-base font-semibold">{l.label}</span>
              <span
                className="grid h-8 min-w-8 place-items-center rounded-full px-2 text-xs font-bold"
                style={{
                  background: active ? 'var(--gradient-brand)' : 'var(--bg-card)',
                  color: active ? '#fff' : 'var(--text-muted)',
                  border: active ? 'none' : '1px solid var(--border-glass)',
                }}
              >
                {l.short}
              </span>
            </button>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="mt-8">
        <button
          type="button"
          onClick={onSelect}
          className="group flex items-center gap-2.5 rounded-full px-8 py-4 font-display text-base font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
          style={{
            background: 'var(--gradient-brand)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.45)',
          }}
        >
          {t('onb.welcome.start')}
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </motion.div>
  );
}

/** Экран 1: приветствие экспедиции */
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const reduced = useReducedMotion();
  const t = useT();

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
        <Compass size={38} className="text-white" />
      </motion.span>

      <motion.h1
        variants={itemVariants}
        className="font-display text-4xl leading-tight font-bold sm:text-6xl"
      >
        {t('brand.pre')} <span className="gradient-text">{t('brand.accent')}</span>
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="mx-auto mt-4 max-w-xl text-base sm:text-lg"
        style={{ color: 'var(--text-secondary)' }}
      >
        {t('brand.subtitle')}
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
          {t('onb.welcome.start')}
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </motion.div>
  );
}

/** Карточка трека: стекло + hover-свечение */
function TrackCard({ track, onSelect }: { track: TrackInfo; onSelect: () => void }) {
  const t = useT();
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
          {t(`track.${track.id}.title`)}
          <ArrowRight
            size={16}
            className="opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
            style={{ color: 'var(--accent-cyan)' }}
          />
        </span>
        <span className="mt-1 block text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {t(`track.${track.id}.desc`)}
        </span>
      </span>
    </motion.button>
  );
}

/** Экран 2: выбор трека */
function TrackScreen({ onSelect }: { onSelect: (track: TrackInfo) => void }) {
  const reduced = useReducedMotion();
  const t = useT();

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
        {t('onb.tracks.titlePre')}{' '}
        <span className="gradient-text">{t('onb.tracks.titleAccent')}</span>
      </motion.h2>
      <motion.p
        variants={itemVariants}
        className="mx-auto mt-3 mb-8 max-w-md text-center text-sm sm:text-base"
        style={{ color: 'var(--text-secondary)' }}
      >
        {t('onb.tracks.subtitle')}
      </motion.p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TRACKS.map((track) => (
          <TrackCard key={track.id} track={track} onSelect={() => onSelect(track)} />
        ))}
      </div>
    </motion.div>
  );
}

/** Экран 3: предложение входного теста для практиков */
function PlacementOfferScreen({
  onTakeTest,
  onSkip,
}: {
  onTakeTest: () => void;
  onSkip: () => void;
}) {
  const reduced = useReducedMotion();
  const t = useT();

  return (
    <motion.div
      key="placement"
      className="flex w-full max-w-xl flex-col items-center text-center"
      variants={containerVariants}
      initial={reduced ? 'visible' : 'hidden'}
      animate="visible"
    >
      <motion.span
        variants={itemVariants}
        className="mb-6 grid h-16 w-16 place-items-center rounded-3xl"
        style={{
          background: 'var(--gradient-brand)',
          boxShadow: '0 0 50px rgba(139, 92, 246, 0.45)',
        }}
      >
        <ClipboardCheck size={30} className="text-white" />
      </motion.span>

      <motion.h2
        variants={itemVariants}
        className="font-display text-2xl font-semibold sm:text-4xl"
      >
        {t('onb.placement.titlePre')} <span className="gradient-text">Claude</span>?
      </motion.h2>

      <motion.p
        variants={itemVariants}
        className="mx-auto mt-3 max-w-md text-sm sm:text-base"
        style={{ color: 'var(--text-secondary)' }}
      >
        {t('onb.placement.subtitle')}
      </motion.p>

      <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onTakeTest}
          className="flex items-center gap-2.5 rounded-full px-8 py-4 font-display text-base font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
          style={{
            background: 'var(--gradient-brand)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.45)',
          }}
        >
          <ClipboardCheck size={19} />
          {t('onb.placement.take')}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-full px-8 py-4 font-display text-base font-semibold transition-transform hover:scale-[1.03] active:scale-[0.98]"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-secondary)',
          }}
        >
          {t('onb.placement.skip')}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const setTrack = useProgressStore((s) => s.setTrack);
  const hasTrack = useProgressStore((s) => s.track !== null);
  // Первый вход: шаг языка → приветствие → трек → тест.
  // Если трек уже выбран (пришли «сменить трек») — сразу экран выбора трека
  // (язык меняется в топбаре/профиле, шаг языка не нужен).
  const [step, setStep] = useState<'lang' | 'welcome' | 'tracks' | 'placement'>(
    hasTrack ? 'tracks' : 'lang',
  );

  const handleSelect = (track: TrackInfo) => {
    setTrack(track.id);
    // После выбора трека предлагаем входной тест для практиков
    setStep('placement');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <AnimatePresence mode="wait">
        {step === 'lang' ? (
          <LanguageScreen key="lang" onSelect={() => setStep('welcome')} />
        ) : step === 'welcome' ? (
          <WelcomeScreen key="welcome" onStart={() => setStep('tracks')} />
        ) : step === 'tracks' ? (
          <TrackScreen key="tracks" onSelect={handleSelect} />
        ) : (
          <PlacementOfferScreen
            key="placement"
            onTakeTest={() => navigate('/placement')}
            onSkip={() => navigate('/', { state: { welcome: true } })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
