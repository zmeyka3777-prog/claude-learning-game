/**
 * XP-тост: всплывает «+N XP» с амбер-свечением и разлетающимися частицами.
 * Вызов из любого места: showXpToast(50).
 */
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Zap } from 'lucide-react';
import { create } from 'zustand';

interface XpToast {
  id: number;
  amount: number;
}

interface ToastStore {
  toasts: XpToast[];
  push: (amount: number) => void;
  remove: (id: number) => void;
}

let nextToastId = 1;

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (amount) => {
    const id = nextToastId++;
    set((s) => ({ toasts: [...s.toasts, { id, amount }] }));
    window.setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2200);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Показать тост «+N XP» */
export function showXpToast(amount: number): void {
  if (amount > 0) useToastStore.getState().push(amount);
}

const PARTICLES = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  return { x: Math.cos(angle) * 42, y: Math.sin(angle) * 42, delay: i * 0.02 };
});

function ToastItem({ toast }: { toast: XpToast }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className="relative flex items-center gap-2 rounded-full px-5 py-2.5 font-display text-base font-semibold"
      style={{
        background: 'rgba(19, 26, 51, 0.92)',
        border: '1px solid rgba(245, 158, 11, 0.45)',
        color: 'var(--accent-amber)',
        boxShadow: '0 0 32px rgba(245, 158, 11, 0.4)',
      }}
    >
      {/* Частицы */}
      {!reduced &&
        PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute top-1/2 left-1/2 h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--accent-amber)' }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.8, delay: p.delay, ease: 'easeOut' }}
          />
        ))}
      <Zap size={18} />
      +{toast.amount} XP
    </motion.div>
  );
}

/** Хост тостов — монтируется один раз в App */
export function XPToastHost() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed top-20 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
