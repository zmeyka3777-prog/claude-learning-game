/**
 * Программный рендер сертификата на <canvas> (1600×1131) в стиле
 * Neural Galaxy: фон-градиент, звёзды, рамка violet→cyan, типографика
 * Unbounded/Manrope (self-hosted через @fontsource).
 */

export const CERT_WIDTH = 1600;
export const CERT_HEIGHT = 1131;

export interface CertificateData {
  /** Id сертификата (для имени файла и аналитики) */
  certId: string;
  /** Название сертификата, например «Мастер Claude» */
  title: string;
  /** Подзаголовок (необязательный), например название сектора */
  subtitle?: string;
  playerName: string;
  xp: number;
  lessonsCompleted: number;
  /** Дата выдачи */
  date: Date;
}

/** Детерминированный ГПСЧ — звёзды рисуются одинаково при каждом рендере */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Подбор размера шрифта, чтобы текст влез в maxWidth */
function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  baseSize: number,
  minSize: number,
  maxWidth: number,
  fontTemplate: (size: number) => string,
): number {
  let size = baseSize;
  while (size > minSize) {
    ctx.font = fontTemplate(size);
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 4;
  }
  return size;
}

/** Дождаться загрузки шрифтов перед рисованием (fail-silent) */
async function ensureFonts(): Promise<void> {
  try {
    // Явно просим нужные начертания, затем ждём готовности всех шрифтов
    await Promise.all([
      document.fonts.load('600 60px Unbounded'),
      document.fonts.load('700 90px Unbounded'),
      document.fonts.load('500 30px Manrope'),
    ]);
    await document.fonts.ready;
  } catch {
    // Шрифты не загрузились — рисуем с fallback, это не ошибка
  }
}

/** Нарисовать сертификат на canvas (устанавливает его размеры сам) */
export async function renderCertificate(
  canvas: HTMLCanvasElement,
  data: CertificateData,
): Promise<void> {
  await ensureFonts();

  canvas.width = CERT_WIDTH;
  canvas.height = CERT_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = CERT_WIDTH;
  const H = CERT_HEIGHT;
  const cx = W / 2;

  // --- Фон: градиент Neural Galaxy ----------------------------------------
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0B0E1A');
  bg.addColorStop(1, '#131A33');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Лёгкое «свечение туманности» сверху
  const glow = ctx.createRadialGradient(cx, -100, 100, cx, -100, H * 0.9);
  glow.addColorStop(0, 'rgba(139, 92, 246, 0.18)');
  glow.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // --- Звёзды-точки (детерминированные) -----------------------------------
  const rand = mulberry32(42);
  for (let i = 0; i < 160; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const r = 0.6 + rand() * 1.6;
    const alpha = 0.15 + rand() * 0.6;
    const tint = rand();
    ctx.fillStyle =
      tint < 0.75
        ? `rgba(238, 241, 255, ${alpha})`
        : tint < 0.9
          ? `rgba(139, 92, 246, ${alpha})`
          : `rgba(34, 211, 238, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Рамка с градиентом violet→cyan --------------------------------------
  const frame = ctx.createLinearGradient(0, 0, W, H);
  frame.addColorStop(0, '#8B5CF6');
  frame.addColorStop(0.5, '#6366F1');
  frame.addColorStop(1, '#22D3EE');

  ctx.strokeStyle = frame;
  ctx.lineWidth = 6;
  roundRect(ctx, 44, 44, W - 88, H - 88, 28);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.6;
  roundRect(ctx, 64, 64, W - 128, H - 128, 20);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // --- Тексты ---------------------------------------------------------------
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const displayFont = (weight: number, size: number) =>
    `${weight} ${size}px Unbounded, Manrope, system-ui, sans-serif`;
  const bodyFont = (weight: number, size: number) =>
    `${weight} ${size}px Manrope, system-ui, sans-serif`;

  // letterSpacing поддерживается не везде — включаем аккуратно
  const spacedCtx = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  const setLetterSpacing = (value: string) => {
    if ('letterSpacing' in spacedCtx) spacedCtx.letterSpacing = value;
  };

  // Шапка «АКАДЕМИЯ CLAUDE»
  setLetterSpacing('14px');
  ctx.font = displayFont(600, 38);
  ctx.fillStyle = '#A8B0D3';
  ctx.fillText('АКАДЕМИЯ CLAUDE', cx, 176);
  setLetterSpacing('0px');

  // Разделитель под шапкой
  const divider = ctx.createLinearGradient(cx - 220, 0, cx + 220, 0);
  divider.addColorStop(0, 'rgba(139, 92, 246, 0)');
  divider.addColorStop(0.5, 'rgba(139, 92, 246, 0.9)');
  divider.addColorStop(1, 'rgba(34, 211, 238, 0)');
  ctx.fillStyle = divider;
  ctx.fillRect(cx - 220, 222, 440, 3);

  // «СЕРТИФИКАТ»
  setLetterSpacing('8px');
  ctx.font = bodyFont(600, 26);
  ctx.fillStyle = '#6B7399';
  ctx.fillText('СЕРТИФИКАТ', cx, 292);
  setLetterSpacing('0px');

  // Название сертификата — фирменным градиентом
  const titleSize = fitFontSize(ctx, data.title, 68, 40, W - 320, (s) => displayFont(600, s));
  ctx.font = displayFont(600, titleSize);
  ctx.fillStyle = frame;
  ctx.fillText(data.title, cx, 382);

  if (data.subtitle) {
    ctx.font = bodyFont(500, 30);
    ctx.fillStyle = '#A8B0D3';
    ctx.fillText(data.subtitle, cx, 452);
  }

  // «Настоящим подтверждается, что»
  ctx.font = bodyFont(400, 28);
  ctx.fillStyle = '#6B7399';
  ctx.fillText('Настоящим подтверждается, что', cx, 545);

  // Имя игрока — крупно
  const name = data.playerName.trim() || 'Исследователь';
  const nameSize = fitFontSize(ctx, name, 92, 44, W - 300, (s) => displayFont(700, s));
  ctx.font = displayFont(700, nameSize);
  ctx.fillStyle = '#EEF1FF';
  ctx.shadowColor = 'rgba(139, 92, 246, 0.55)';
  ctx.shadowBlur = 36;
  ctx.fillText(name, cx, 650);
  ctx.shadowBlur = 0;

  // «успешно прошёл(ла) экспедицию…»
  ctx.font = bodyFont(400, 28);
  ctx.fillStyle = '#A8B0D3';
  ctx.fillText('успешно прошёл(ла) экспедицию по галактике знаний Claude', cx, 745);

  // Статистика: XP и уроки
  ctx.font = bodyFont(600, 32);
  ctx.fillStyle = '#F59E0B';
  ctx.fillText(
    `⚡ ${data.xp} XP   ·   пройдено уроков: ${data.lessonsCompleted}`,
    cx,
    830,
  );

  // Дата выдачи
  let dateStr: string;
  try {
    dateStr = data.date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    dateStr = data.date.toISOString().slice(0, 10);
  }
  ctx.font = bodyFont(500, 26);
  ctx.fillStyle = '#6B7399';
  ctx.fillText(dateStr, cx, 905);

  // Нижний разделитель + дисклеймер
  ctx.fillStyle = divider;
  ctx.fillRect(cx - 220, 960, 440, 2);

  ctx.font = bodyFont(400, 20);
  ctx.fillStyle = '#6B7399';
  ctx.globalAlpha = 0.85;
  ctx.fillText('Неофициальный образовательный проект', cx, 1020);
  ctx.globalAlpha = 1;
}

/** Скачать содержимое canvas как PNG */
export function downloadCertificate(canvas: HTMLCanvasElement, certId: string): boolean {
  try {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `academy-claude-${certId}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  } catch {
    return false;
  }
}

/** Есть ли у браузера системный шеринг */
export function canShareCertificate(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/** Поделиться сертификатом через navigator.share (файлом, если можно) */
export async function shareCertificate(
  canvas: HTMLCanvasElement,
  title: string,
): Promise<void> {
  try {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    );
    if (blob) {
      const file = new File([blob], 'certificate.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title });
        return;
      }
    }
    await navigator.share({ title, text: title });
  } catch {
    // Пользователь отменил шеринг или он недоступен — молча игнорируем
  }
}
