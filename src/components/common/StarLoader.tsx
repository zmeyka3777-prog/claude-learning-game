/**
 * Звёздный спиннер по дизайн-системе «Neural Galaxy» —
 * fallback для Suspense при ленивой загрузке страниц.
 */
import { motion, useReducedMotion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export function StarLoader() {
  const reduced = useReducedMotion();

  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <div className="relative grid place-items-center">
        {/* Орбита из точек-звёзд */}
        <motion.div
          className="absolute h-20 w-20"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        >
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 90}deg) translateX(38px)`,
                background: i % 2 === 0 ? 'var(--accent-violet)' : 'var(--accent-cyan)',
                boxShadow: '0 0 8px currentColor',
                opacity: 0.9,
              }}
            />
          ))}
        </motion.div>

        {/* Пульсирующая звезда в центре */}
        <motion.span
          className="grid h-14 w-14 place-items-center rounded-2xl"
          style={{
            background: 'var(--gradient-brand)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.45)',
          }}
          animate={reduced ? undefined : { scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles size={26} className="text-white" />
        </motion.span>
      </div>

      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        Загрузка сектора…
      </span>
    </div>
  );
}
