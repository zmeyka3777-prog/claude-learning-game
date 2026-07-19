/**
 * Взрыв конфетти на CSS/Motion-частицах. Без внешних библиотек.
 * Используется при верных ответах (micro) и на оверлее завершения (full).
 */
import { motion, useReducedMotion } from 'motion/react';
import { useMemo } from 'react';

const COLORS = ['#8B5CF6', '#22D3EE', '#F59E0B', '#EC4899', '#34D399', '#6366F1'];

interface ConfettiBurstProps {
  /** Количество частиц */
  count?: number;
  /** Радиус разлёта, px */
  spread?: number;
}

interface Particle {
  x: number;
  y: number;
  rotate: number;
  color: string;
  delay: number;
  size: number;
  round: boolean;
}

export function ConfettiBurst({ count = 24, spread = 140 }: ConfettiBurstProps) {
  const reduced = useReducedMotion();

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const dist = spread * (0.5 + Math.random() * 0.5);
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - spread * 0.25,
          rotate: Math.random() * 540 - 270,
          color: COLORS[i % COLORS.length],
          delay: Math.random() * 0.12,
          size: 5 + Math.random() * 5,
          round: Math.random() > 0.5,
        };
      }),
    [count, spread],
  );

  if (reduced) return null;

  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 z-10" aria-hidden="true">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{
            width: p.size,
            height: p.round ? p.size : p.size * 0.45,
            background: p.color,
            borderRadius: p.round ? '9999px' : '2px',
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: p.y + spread * 0.6, opacity: 0, rotate: p.rotate, scale: 0.6 }}
          transition={{ duration: 1.1, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}
