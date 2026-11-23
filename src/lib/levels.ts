import type { Locale } from './settings';
import type { Localized } from './types';

/** Levels 1–6 = Standard 1–6 (primary). Levels 7–11 = Form 1–5 (secondary). */
export const LEVEL_MIN = 1;
export const LEVEL_MAX = 11;

export type LevelGroupId = 'lower' | 'upper' | 'junior' | 'senior';

export interface LevelGroup {
  id: LevelGroupId;
  name: Localized;
  /** The school years it covers. */
  years: Localized;
  levels: [number, number];
}

/**
 * What players choose from. Words and games keep their exact level (1–11),
 * so these groups can be changed here without re-tagging any content.
 */
export const LEVEL_GROUPS: LevelGroup[] = [
  { id: 'lower', name: { en: 'Lower Primary', zh: '初小' }, years: { en: 'S1–3', zh: '一至三年级' }, levels: [1, 3] },
  { id: 'upper', name: { en: 'Upper Primary', zh: '高小' }, years: { en: 'S4–6', zh: '四至六年级' }, levels: [4, 6] },
  { id: 'junior', name: { en: 'Lower Secondary', zh: '初中' }, years: { en: 'F1–3', zh: '中一至中三' }, levels: [7, 9] },
  { id: 'senior', name: { en: 'Upper Secondary', zh: '高中' }, years: { en: 'F4–5', zh: '中四至中五' }, levels: [10, 11] },
];

export const levelGroup = (id: string) => LEVEL_GROUPS.find((g) => g.id === id);

/** Does a level, or an inclusive range of levels, fall inside this group? */
export const inGroup = (g: LevelGroup, [from, to]: [number, number]) => from <= g.levels[1] && to >= g.levels[0];

const ZH_STD = ['一', '二', '三', '四', '五', '六'];
const ZH_FORM = ['一', '二', '三', '四', '五'];

export function levelName(n: number, locale: Locale): string {
  if (n <= 6) return locale === 'zh' ? `${ZH_STD[n - 1]}年级` : `Standard ${n}`;
  return locale === 'zh' ? `中${ZH_FORM[n - 7]}` : `Form ${n - 6}`;
}

export function levelRangeText([a, b]: [number, number], locale: Locale): string {
  if (a === LEVEL_MIN && b === LEVEL_MAX) {
    return locale === 'zh' ? '一年级至中五' : 'Standard 1 – Form 5';
  }
  if (a === b) return levelName(a, locale);
  return `${levelName(a, locale)} – ${levelName(b, locale)}`;
}
