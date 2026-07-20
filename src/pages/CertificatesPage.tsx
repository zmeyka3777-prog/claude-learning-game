/**
 * Сертификаты: главный «Мастер Claude» (за бейдж badge-world-8) и по одному
 * за каждый зачтённый мир. Клик по доступному открывает модал с вводом имени,
 * предпросмотром на <canvas> и скачиванием PNG.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Award, Download, Lock, Share2, X } from 'lucide-react';
import { WORLDS } from '../engine/content';
import { useProgressStore } from '../engine/progressStore';
import {
  canShareCertificate,
  downloadCertificate,
  renderCertificate,
  shareCertificate,
  CERT_HEIGHT,
  CERT_WIDTH,
} from '../lib/certificate';
import { track } from '../lib/analytics';

interface CertDef {
  id: string;
  title: string;
  subtitle?: string;
  available: boolean;
  /** Условие получения — показывается на заблокированных */
  lockCondition: string;
  /** Главный сертификат — крупная карточка с амбер-акцентом */
  isMaster?: boolean;
}

/** Модал: имя, предпросмотр, скачивание */
function CertificateModal({ cert, onClose }: { cert: CertDef; onClose: () => void }) {
  const playerName = useProgressStore((s) => s.playerName);
  const setPlayerName = useProgressStore((s) => s.setPlayerName);
  const xp = useProgressStore((s) => s.xp);
  const lessonsCompleted = useProgressStore((s) => Object.keys(s.completedLessons).length);

  const [name, setName] = useState(playerName ?? '');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shareAvailable = canShareCertificate();

  // Перерисовываем предпросмотр при изменении имени
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    void renderCertificate(canvas, {
      certId: cert.id,
      title: cert.title,
      subtitle: cert.subtitle,
      playerName: name,
      xp,
      lessonsCompleted,
      date: new Date(),
    });
  }, [cert, name, xp, lessonsCompleted]);

  const commitName = () => {
    if (name.trim() && name.trim() !== playerName) setPlayerName(name);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    commitName();
    if (downloadCertificate(canvas, cert.id)) {
      track('certificate_downloaded', { certId: cert.id });
    }
  };

  const handleShare = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    commitName();
    void shareCertificate(canvas, `Академия Claude — ${cert.title}`);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      style={{ background: 'rgba(11, 14, 26, 0.88)', backdropFilter: 'blur(12px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-card relative w-full max-w-2xl p-5 sm:p-7"
        style={{ background: 'rgba(19, 26, 51, 0.96)' }}
        initial={{ scale: 0.9, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Сертификат «${cert.title}»`}
      >
        <button
          type="button"
          onClick={onClose}
          className="btn-glass absolute top-4 right-4 grid h-9 w-9 place-items-center"
          aria-label="Закрыть"
        >
          <X size={16} />
        </button>

        <h2 className="pr-10 font-display text-lg font-semibold sm:text-xl">
          Сертификат: <span className="gradient-text">{cert.title}</span>
        </h2>

        {/* Имя игрока */}
        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
            Имя на сертификате
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitName}
            maxLength={60}
            placeholder="Например: Евгения Малина"
            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none sm:text-base"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-glass)',
              color: 'var(--text-primary)',
            }}
          />
        </label>

        {/* Предпросмотр */}
        <div
          className="mt-4 overflow-hidden rounded-2xl border"
          style={{ borderColor: 'var(--border-glass)', aspectRatio: `${CERT_WIDTH} / ${CERT_HEIGHT}` }}
        >
          <canvas
            ref={canvasRef}
            className="block h-full w-full"
            aria-label="Предпросмотр сертификата"
          />
        </div>

        {/* Действия */}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={name.trim().length === 0}
            className="btn-gradient flex flex-1 items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base"
          >
            <Download size={16} />
            Скачать PNG
          </button>
          {shareAvailable && (
            <button
              type="button"
              onClick={handleShare}
              disabled={name.trim().length === 0}
              className="btn-glass flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base"
            >
              <Share2 size={16} />
              Поделиться
            </button>
          )}
        </div>
        {name.trim().length === 0 && (
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            Введи имя, чтобы скачать сертификат.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

/** Карточка сертификата в списке */
function CertCard({
  cert,
  index,
  onOpen,
}: {
  cert: CertDef;
  index: number;
  onOpen: (cert: CertDef) => void;
}) {
  const reduced = useReducedMotion();

  const accentBorder = cert.isMaster
    ? '1px solid rgba(245, 158, 11, 0.45)'
    : '1px solid var(--border-glass)';

  const inner = (
    <>
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
        style={{
          background: cert.available
            ? cert.isMaster
              ? 'rgba(245, 158, 11, 0.14)'
              : 'rgba(139, 92, 246, 0.14)'
            : 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
        }}
      >
        {cert.available ? (
          <Award
            size={22}
            style={{ color: cert.isMaster ? 'var(--accent-amber)' : 'var(--accent-violet)' }}
          />
        ) : (
          <Lock size={20} style={{ color: 'var(--text-muted)' }} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <h3
          className="font-display text-base font-semibold"
          style={{ color: cert.available ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          {cert.title}
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {cert.available ? (cert.subtitle ?? 'Доступен — нажми, чтобы получить') : cert.lockCondition}
        </p>
      </div>
      {cert.available && (
        <span
          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{
            background: 'rgba(52, 211, 153, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            color: 'var(--success)',
          }}
        >
          Доступен
        </span>
      )}
    </>
  );

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: reduced ? 0 : Math.min(index * 0.05, 0.3) }}
    >
      {cert.available ? (
        <button
          type="button"
          onClick={() => onOpen(cert)}
          className="glass-card glass-card-hover flex w-full items-center gap-4 p-5 text-left"
          style={{ border: accentBorder }}
        >
          {inner}
        </button>
      ) : (
        <div className="glass-card flex items-center gap-4 p-5" style={{ opacity: 0.7 }}>
          {inner}
        </div>
      )}
    </motion.div>
  );
}

export default function CertificatesPage() {
  const reduced = useReducedMotion();
  const badges = useProgressStore((s) => s.badges);
  const passedWorlds = useProgressStore((s) => s.passedWorlds);
  const [openCert, setOpenCert] = useState<CertDef | null>(null);

  const certs = useMemo<CertDef[]>(() => {
    const master: CertDef = {
      id: 'master-claude',
      title: 'Мастер Claude',
      subtitle: 'Вся галактика исследована',
      available: badges.includes('badge-world-8'),
      lockCondition: 'Пройди финальный экзамен сектора 8 «Экосистема» и получи бейдж «Сектор 8 исследован»',
      isMaster: true,
    };
    const worldCerts: CertDef[] = WORLDS.map((world) => ({
      id: `world-${world.order}`,
      title: `Сектор ${world.order} исследован`,
      subtitle: world.title,
      available: passedWorlds.includes(world.id),
      lockCondition: `Одолей босса сектора ${world.order} — «${world.title}»`,
    }));
    return [master, ...worldCerts];
  }, [badges, passedWorlds]);

  const availableCount = certs.filter((c) => c.available).length;

  return (
    <div className="py-8">
      <motion.div
        className="mb-8 text-center"
        initial={reduced ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-2xl font-semibold sm:text-4xl">
          <span className="gradient-text">Сертификаты</span> экспедиции
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
          {availableCount > 0
            ? `Доступно: ${availableCount} из ${certs.length}. Скачай PNG и покажи, что галактика покорена!`
            : 'Проходи боссов секторов — за каждый зачтённый мир откроется сертификат.'}
        </p>
      </motion.div>

      <div className="mx-auto max-w-2xl space-y-3">
        {certs.map((cert, i) => (
          <CertCard key={cert.id} cert={cert} index={i} onOpen={setOpenCert} />
        ))}
      </div>

      <AnimatePresence>
        {openCert && <CertificateModal cert={openCert} onClose={() => setOpenCert(null)} />}
      </AnimatePresence>
    </div>
  );
}
