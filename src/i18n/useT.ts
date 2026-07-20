/**
 * Хук локализации интерфейса.
 * useT() → t('key', vars?) — берёт строку активного языка из progress store,
 * фолбэк ru → сам ключ; подставляет {placeholder} из vars.
 * useLang() → { lang, setLang } — активный язык и его смена.
 */
import { useProgressStore } from '../engine/progressStore';
import type { LangCode } from '../engine/types';
import { STRINGS } from './strings';

export type TVars = Record<string, string | number>;

/** Подстановка {placeholder} → vars[placeholder] */
function interpolate(template: string, vars?: TVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

/**
 * Перевод строки для явно заданного языка (для мест вне React —
 * например, canvas-рендер сертификата).
 */
export function translate(lang: LangCode, key: string, vars?: TVars): string {
  const table = STRINGS[lang] ?? STRINGS.ru;
  const template = table[key] ?? STRINGS.ru[key] ?? key;
  return interpolate(template, vars);
}

/** Хук-переводчик: t('key', vars?) реактивен к смене языка */
export function useT(): (key: string, vars?: TVars) => string {
  const lang = useProgressStore((s) => s.lang);
  return (key: string, vars?: TVars) => translate(lang, key, vars);
}

/** Активный язык и экшен его смены */
export function useLang(): { lang: LangCode; setLang: (lang: LangCode) => void } {
  const lang = useProgressStore((s) => s.lang);
  const setLang = useProgressStore((s) => s.setLang);
  return { lang, setLang };
}
