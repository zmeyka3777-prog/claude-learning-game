/**
 * Список поддерживаемых языков интерфейса.
 * Единый источник для тумблера в топбаре и шага выбора языка в онбординге.
 * Добавление языка = новый элемент здесь + файлы перевода content/<code>/ +
 * колонка в STRINGS (src/i18n/strings.ts).
 */
import type { LangCode } from '../engine/types';

export interface LanguageInfo {
  code: LangCode;
  /** Полное название языка на самом языке */
  label: string;
  /** Короткая метка для компактного тумблера (RU/EN) */
  short: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'en', label: 'English', short: 'EN' },
];

/** Валиден ли код языка (есть в LANGUAGES) */
export function isLangCode(value: unknown): value is LangCode {
  return typeof value === 'string' && LANGUAGES.some((l) => l.code === value);
}
