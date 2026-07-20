import { lazy, Suspense, useEffect } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Library, Sparkles, User, Zap } from 'lucide-react';
import { useProgressStore } from './engine/progressStore';
import { trackPageview } from './lib/analytics';
import { StreakFlame } from './components/gamification/StreakFlame';
import { XPToastHost } from './components/gamification/XPToast';
import { StarLoader } from './components/common/StarLoader';
import { LANGUAGES } from './i18n/languages';
import { useLang, useT } from './i18n/useT';

/** Компактный сегментный тумблер языка (RU/EN), расширяем по списку LANGUAGES */
function LanguageToggle() {
  const { lang, setLang } = useLang();
  const t = useT();

  return (
    <div
      className="flex items-center rounded-full p-0.5"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}
      role="group"
      aria-label={t('lang.switch')}
    >
      {LANGUAGES.map((l) => {
        const active = l.code === lang;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={active}
            title={l.label}
            className="rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
            style={{
              background: active ? 'var(--gradient-brand)' : 'transparent',
              color: active ? '#fff' : 'var(--text-muted)',
            }}
          >
            {l.short}
          </button>
        );
      })}
    </div>
  );
}

// Код-сплиттинг: каждая страница — отдельный чанк
const MapPage = lazy(() => import('./pages/MapPage'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const PlacementTestPage = lazy(() => import('./pages/PlacementTestPage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const CertificatesPage = lazy(() => import('./pages/CertificatesPage'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));

/** Верхняя панель: лого, XP, стрик, профиль */
function TopBar() {
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);
  const location = useLocation();
  const t = useT();

  return (
    <header className="sticky top-0 z-40">
      <div
        className="border-b"
        style={{
          background: 'rgba(11, 14, 26, 0.72)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'var(--border-glass)',
        }}
      >
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label={t('topbar.toMap')}>
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
              style={{ background: 'var(--gradient-brand)' }}
            >
              <Sparkles size={18} className="text-white" />
            </span>
            <span className="truncate font-display text-sm font-semibold sm:text-base">
              {t('brand.academy')} <span className="gradient-text">Claude</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />

            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
              style={{
                background: 'rgba(245, 158, 11, 0.12)',
                color: 'var(--accent-amber)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
              }}
              title={t('topbar.xp')}
            >
              <Zap size={15} />
              {xp} XP
            </span>

            <StreakFlame days={streak.current} />

            <Link
              to="/library"
              className="grid h-9 w-9 place-items-center rounded-full transition-colors"
              style={{
                background:
                  location.pathname === '/library' ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
              }}
              aria-label={t('topbar.library')}
              title={t('topbar.library')}
            >
              <Library size={17} style={{ color: 'var(--text-secondary)' }} />
            </Link>

            <Link
              to="/profile"
              className="grid h-9 w-9 place-items-center rounded-full transition-colors"
              style={{
                background:
                  location.pathname === '/profile' ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
              }}
              aria-label={t('topbar.profile')}
            >
              <User size={17} style={{ color: 'var(--text-secondary)' }} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const track = useProgressStore((s) => s.track);
  const location = useLocation();
  const isOnboarding = location.pathname === '/onboarding';

  // SPA-аналитика: ручной $pageview на каждую смену маршрута (fail-silent)
  useEffect(() => {
    trackPageview(location.pathname);
  }, [location.pathname]);

  // Первый вход: пока трек не выбран — только онбординг
  if (track === null && !isOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="relative min-h-screen">
      {/* Звёздный фон: 2 слоя параллакса */}
      <div className="stars" aria-hidden="true">
        <div className="stars-layer stars-layer--far" />
        <div className="stars-layer stars-layer--near" />
      </div>

      <div className="relative z-10">
        {isOnboarding ? (
          // Онбординг — полноэкранный, без шапки
          <Suspense fallback={<StarLoader />}>
            <Routes>
              <Route path="/onboarding" element={<OnboardingPage />} />
            </Routes>
          </Suspense>
        ) : (
          <>
            <TopBar />
            <main className="mx-auto max-w-5xl px-4 pb-24">
              <Suspense fallback={<StarLoader />}>
                <Routes>
                  <Route path="/" element={<MapPage />} />
                  <Route path="/lesson/:lessonId" element={<LessonPage />} />
                  <Route path="/placement" element={<PlacementTestPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/certificates" element={<CertificatesPage />} />
                  <Route path="/review" element={<ReviewPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="*" element={<MapPage />} />
                </Routes>
              </Suspense>
            </main>
          </>
        )}
      </div>

      {/* Всплывающие XP-тосты */}
      <XPToastHost />
    </div>
  );
}
