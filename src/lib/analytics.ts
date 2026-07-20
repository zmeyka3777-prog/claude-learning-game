/**
 * Аналитика PostHog. Все вызовы — fail-silent: в средах со строгим CSP
 * (например, однофайловый артефакт claude.ai) сеть заблокирована, и
 * приложение не должно ни ломаться, ни сыпать ошибки в консоль.
 * Персональные данные (имя игрока и т.п.) не отправляем.
 */
import posthog from 'posthog-js';

const POSTHOG_TOKEN = 'phc_op6kmq8viVso9NhCEMUuGL2tmD8rNm7P479yrhGkKGne';
const POSTHOG_HOST = 'https://us.i.posthog.com';

let ready = false;

/** Инициализация. Вызывается один раз в main.tsx до рендера. */
export function initAnalytics(): void {
  try {
    posthog.init(POSTHOG_TOKEN, {
      api_host: POSTHOG_HOST,
      autocapture: false,
      // SPA: $pageview шлём вручную на смену маршрута
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      // Не ходим за remote-конфигом и фича-флагами — меньше сетевых запросов
      // и меньше шума в консоли, когда сеть заблокирована CSP
      advanced_disable_flags: true,
      persistence: 'localStorage',
    });
    ready = true;
  } catch {
    // PostHog недоступен (CSP, блокировщик) — работаем как no-op
    ready = false;
  }
}

/** Отправить событие; при недоступном PostHog — no-op */
export function track(event: string, properties?: Record<string, unknown>): void {
  if (!ready) return;
  try {
    posthog.capture(event, properties);
  } catch {
    // fail-silent
  }
}

/** Ручной $pageview для SPA-роутинга */
export function trackPageview(path: string): void {
  track('$pageview', { path });
}
