/**
 * Маппинг строковых имён иконок из контента (worlds.json, cards.json, badges.json)
 * на компоненты lucide-react.
 */
import {
  Bot,
  Code2,
  Cpu,
  Crown,
  FileStack,
  Flag,
  Flame,
  Globe,
  LayoutDashboard,
  MessagesSquare,
  PenLine,
  Plug,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Terminal,
  Wand2,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  bot: Bot,
  code: Code2,
  cpu: Cpu,
  crown: Crown,
  'file-stack': FileStack,
  flag: Flag,
  flame: Flame,
  globe: Globe,
  'layout-dashboard': LayoutDashboard,
  'messages-square': MessagesSquare,
  'pen-line': PenLine,
  plug: Plug,
  rocket: Rocket,
  'shield-check': ShieldCheck,
  smartphone: Smartphone,
  sparkles: Sparkles,
  star: Star,
  terminal: Terminal,
  wand: Wand2,
  zap: Zap,
};

/** Иконка по имени из контента; безопасный fallback — звезда */
export function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? Star;
}

/** Акцентный цвет мира по токену из контента */
export function getAccentColor(color: string): string {
  switch (color) {
    case 'cyan':
      return 'var(--accent-cyan)';
    case 'amber':
      return 'var(--accent-amber)';
    case 'pink':
      return 'var(--accent-pink)';
    case 'violet':
    default:
      return 'var(--accent-violet)';
  }
}
