/**
 * Карта мира: вертикальная «звёздная тропа» — узлы уроков,
 * соединённые светящейся SVG-кривой.
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import type { World } from '../../engine/types';
import { getLesson, hasLessonContent } from '../../engine/content';
import { useProgressStore } from '../../engine/progressStore';
import { getAccentColor, getIcon } from '../../lib/icons';
import { LessonNode, type NodeStatus } from './LessonNode';

const NODE_SPACING = 132; // расстояние между узлами по вертикали, px
const TOP_OFFSET = 70;

interface WorldMapProps {
  world: World;
}

interface MapNode {
  lessonId: string;
  title: string;
  isBoss: boolean;
  status: NodeStatus;
  x: number; // %
  y: number; // px
}

export function WorldMap({ world }: WorldMapProps) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const WorldIcon = getIcon(world.icon);
  const accent = getAccentColor(world.color);

  const nodes = useMemo<MapNode[]>(() => {
    let previousDone = true; // первый урок доступен сразу
    return world.lessons.map((lessonId, i) => {
      const lesson = getLesson(lessonId);
      const hasContent = hasLessonContent(lessonId);
      const isDone = Boolean(completedLessons[lessonId]);

      let status: NodeStatus;
      if (isDone) {
        status = 'done';
      } else if (previousDone) {
        // Урок по порядку доступен, но если контент ещё не написан — «загрузка»
        status = hasContent ? 'available' : 'loading';
      } else {
        status = 'locked';
      }
      previousDone = isDone;

      return {
        lessonId,
        title: lesson?.title ?? lessonTitleFallback(lessonId),
        isBoss: lesson?.isBoss ?? i === world.lessons.length - 1,
        status,
        x: i % 2 === 0 ? 30 : 70,
        y: TOP_OFFSET + i * NODE_SPACING,
      };
    });
  }, [world, completedLessons]);

  const height = TOP_OFFSET + Math.max(nodes.length - 1, 0) * NODE_SPACING + 110;

  // Плавная кривая через центры узлов
  const pathD = useMemo(() => {
    if (nodes.length < 2) return '';
    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const cur = nodes[i];
      const midY = (prev.y + cur.y) / 2;
      d += ` C ${prev.x} ${midY}, ${cur.x} ${midY}, ${cur.x} ${cur.y}`;
    }
    return d;
  }, [nodes]);

  return (
    <div>
      {/* Заголовок мира — стеклянная плашка */}
      <motion.div
        className="glass-card mb-4 flex items-center gap-4 p-5"
        initial={reduced ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
          style={{ background: 'var(--gradient-brand)' }}
        >
          <WorldIcon size={24} className="text-white" />
        </span>
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-wide uppercase" style={{ color: accent }}>
            Сектор {world.order}
          </div>
          <h2 className="font-display text-xl font-semibold sm:text-2xl">
            <span className="gradient-text">{world.title}</span>
          </h2>
          <p className="mt-0.5 truncate text-sm" style={{ color: 'var(--text-secondary)' }}>
            {world.subtitle}
          </p>
        </div>
      </motion.div>

      {/* Тропа */}
      <div className="relative mx-auto max-w-xl" style={{ height }}>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`path-${world.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
          {/* Свечение под кривой */}
          <path
            d={pathD}
            fill="none"
            stroke={`url(#path-${world.id})`}
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.25"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={pathD}
            fill="none"
            stroke={`url(#path-${world.id})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="0.1 8"
            vectorEffect="non-scaling-stroke"
            opacity="0.9"
          />
        </svg>

        {nodes.map((node, i) => (
          <motion.div
            key={node.lessonId}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${node.x}%`, top: node.y }}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.4) }}
          >
            <LessonNode
              title={node.title}
              status={node.status}
              isBoss={node.isBoss}
              order={i + 1}
              onClick={() => navigate(`/lesson/${node.lessonId}`)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Человекочитаемый fallback, пока JSON урока не написан */
function lessonTitleFallback(lessonId: string): string {
  return lessonId
    .replace(/^basics-/, '')
    .replace(/-/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
}
