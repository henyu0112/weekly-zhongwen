import { createPersistentStore, useStore } from './store';
import type { GameResult } from './types';

/** One entry in the reward history (kept for display and for the later move to cloud saves). */
export interface LedgerEntry {
  at: string; // ISO date
  /** 'dev' = a testing adjustment made with the staging tools in Settings. */
  kind: 'game' | 'purchase' | 'dev';
  /** Game slug or shop item id. */
  ref: string;
  xp: number;
  coins: number;
}

/**
 * The player's progress. Saved in this browser today (src/lib/store.ts).
 * When accounts arrive, the same shape is uploaded to the cloud.
 */
export interface PlayerProfile {
  version: 1;
  nickname: string;
  /** Avatar character (see AVATARS). */
  avatar: string;
  xp: number;
  level: number;
  coins: number;
  /** Shop item ids the player owns (free default items are not listed). */
  inventory: string[];
  /** Shop slot -> equipped item id. */
  equipped: Record<string, string>;
  quests: Record<string, { progress: number; completedOn?: string }>;
  stats: {
    gamesPlayed: number;
    bestScores: Record<string, number>;
    lastPlayedAt?: string;
  };
  totals: { correct: number; answered: number; xpEarned: number; coinsEarned: number };
  /** Word id -> 1 once the player has answered it correctly at least once. */
  wordsLearned: Record<string, 1>;
  /** Local date (YYYY-MM-DD) the daily bonus was last given. */
  lastDailyBonus?: string;
  recent: GameResult[];
  ledger: LedgerEntry[];
  /** Mistake book (错题本): word id -> how often it was wrong. */
  mistakes: Record<string, { count: number; lastAt: string }>;
}

export const defaultProfile: PlayerProfile = {
  version: 1,
  nickname: '',
  avatar: '学',
  xp: 0,
  level: 1,
  coins: 0,
  inventory: [],
  equipped: {},
  quests: {},
  stats: { gamesPlayed: 0, bestScores: {} },
  totals: { correct: 0, answered: 0, xpEarned: 0, coinsEarned: 0 },
  wordsLearned: {},
  recent: [],
  ledger: [],
  mistakes: {},
};

export const profileStore = createPersistentStore<PlayerProfile>('wz.profile', defaultProfile);
export const useProfile = () => useStore(profileStore);

/** Avatar characters with their tile colours. */
export const AVATARS: { char: string; gradient: string }[] = [
  { char: '学', gradient: 'from-sky-400 to-blue-700' },
  { char: '龙', gradient: 'from-rose-400 to-red-700' },
  { char: '虎', gradient: 'from-amber-400 to-orange-600' },
  { char: '猫', gradient: 'from-fuchsia-400 to-purple-700' },
  { char: '星', gradient: 'from-indigo-400 to-violet-700' },
  { char: '月', gradient: 'from-slate-400 to-slate-700' },
  { char: '山', gradient: 'from-emerald-400 to-green-700' },
  { char: '花', gradient: 'from-pink-400 to-rose-600' },
  { char: '鱼', gradient: 'from-cyan-400 to-teal-700' },
  { char: '火', gradient: 'from-orange-400 to-red-600' },
];

export const avatarGradient = (char: string) =>
  AVATARS.find((a) => a.char === char)?.gradient ?? AVATARS[0].gradient;

/** Local calendar date, YYYY-MM-DD. */
export function localDay(d = new Date()): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Checks that an imported backup looks like a profile, then fills any missing fields. */
export function parseBackup(text: string): PlayerProfile | null {
  try {
    const data = JSON.parse(text);
    const p = data?.profile ?? data;
    if (!p || typeof p !== 'object' || p.version !== 1) return null;
    if (typeof p.xp !== 'number' || typeof p.coins !== 'number' || !Array.isArray(p.inventory)) return null;
    return { ...defaultProfile, ...p };
  } catch {
    return null;
  }
}
