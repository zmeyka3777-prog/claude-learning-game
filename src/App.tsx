import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { Sparkles, User, Zap } from 'lucide-react';
import { useProgressStore } from './engine/progressStore';
import { StreakFlame } from './components/gamification/StreakFlame';
import { XPToastHost } from './components/gamification/XPToast';
import MapPage from './pages/MapPage';
import LessonPage from './pages/LessonPage';
import ProfilePage from './pages/ProfilePage';

/** Верхняя панель: лого, XP, стрик, профиль */
function TopBar() {
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);
  const location = useLocation();

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
          <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="На карту миров">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
              style={{ background: 'var(--gradient-brand)' }}
            >
              <Sparkles size={18} className="text-white" />
            </span>
            <span className="truncate font-display text-sm font-semibold sm:text-base">
              Академия <span className="gradient-text">Claude</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
              style={{
                background: 'rgba(245, 158, 11, 0.12)',
                color: 'var(--accent-amber)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
              }}
              title="Опыт"
            >
              <Zap size={15} />
              {xp} XP
            </span>

            <StreakFlame days={streak.current} />

            <Link
              to="/profile"
              className="grid h-9 w-9 place-items-center rounded-full transition-colors"
              style={{
                background:
                  location.pathname === '/profile' ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
              }}
              aria-label="Профиль"
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
  return (
    <div className="relative min-h-screen">
      {/* Звёздный фон: 2 слоя параллакса */}
      <div className="stars" aria-hidden="true">
        <div className="stars-layer stars-layer--far" />
        <div className="stars-layer stars-layer--near" />
      </div>

      <div className="relative z-10">
        <TopBar />
        <main className="mx-auto max-w-5xl px-4 pb-24">
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<MapPage />} />
          </Routes>
        </main>
      </div>

      {/* Всплывающие XP-тосты */}
      <XPToastHost />
    </div>
  );
}
