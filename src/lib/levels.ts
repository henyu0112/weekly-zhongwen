import type { Locale } from './settings';

/** Levels 1–6 = Standard 1–6 (primary). Levels 7–11 = Form 1–5 (secondary). */
export const LEVEL_MIN = 1;
export const LEVEL_MAX = 11;
export const LEVELS = Array.from({ length: LEVEL_MAX }, (_, i) => i + 1);

const ZH_STD = ['一', '二', '三', '四', '五', '六'];
const ZH_FORM = ['一', '二', '三', '四', '五'];

export function levelName(n: number, locale: Locale): string {
  if (n <= 6) return locale === 'zh' ? `${ZH_STD[n - 1]}年级` : `Standard ${n}`;
  return locale === 'zh' ? `中${ZH_FORM[n - 7]}` : `Form ${n - 6}`;
}

/** Short label for filter chips. */
export function levelShort(n: number, locale: Locale): string {
  if (n <= 6) return locale === 'zh' ? `${n}年级` : `S${n}`;
  return locale === 'zh' ? `中${n - 6}` : `F${n - 6}`;
}

export function levelRangeText([a, b]: [number, number], locale: Locale): string {
  if (a === LEVEL_MIN && b === LEVEL_MAX) {
    return locale === 'zh' ? '一年级至中五' : 'Standard 1 – Form 5';
  }
  if (a === b) return levelName(a, locale);
  return `${levelName(a, locale)} – ${levelName(b, locale)}`;
}
