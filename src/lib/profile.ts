import { createPersistentStore, useStore } from './store';
import { on } from './events';
import type { GameResult } from './types';

/**
 * The player's progress. Today it only records play history.
 * The empty-but-present fields are the hooks for the upcoming systems:
 *   xp / level      -> XP & level system
 *   coins           -> currency
 *   inventory       -> shop purchases
 *   quests          -> daily quests
 * They live here from day one so adding them later needs no data migration.
 */
export interface PlayerProfile {
  version: 1;
  xp: number;
  level: number;
  coins: number;
  inventory: string[];
  quests: Record<string, { progress: number; completedOn?: string }>;
  stats: {
    gamesPlayed: number;
    bestScores: Record<string, number>;
    lastPlayedAt?: string;
  };
  recent: GameResult[];
  /** Mistake book (错题本): word id -> how often it was wrong. */
  mistakes: Record<string, { count: number; lastAt: string }>;
}

export const defaultProfile: PlayerProfile = {
  version: 1,
  xp: 0,
  level: 1,
  coins: 0,
  inventory: [],
  quests: {},
  stats: { gamesPlayed: 0, bestScores: {} },
  recent: [],
  mistakes: {},
};

export const profileStore = createPersistentStore<PlayerProfile>('wz.profile', defaultProfile);
export const useProfile = () => useStore(profileStore);

let wired = false;
/** Subscribe the profile (and later XP / quest engines) to platform events. */
export function wireProfile(): void {
  if (wired) return;
  wired = true;
  on('game_completed', (r) => {
    profileStore.set((p) => {
      const mistakes = { ...p.mistakes };
      for (const id of r.mistakeIds ?? []) {
        mistakes[id] = { count: (mistakes[id]?.count ?? 0) + 1, lastAt: r.completedAt };
      }
      for (const id of r.masteredIds ?? []) delete mistakes[id];
      return {
        ...p,
        mistakes,
        stats: {
          gamesPlayed: p.stats.gamesPlayed + 1,
          bestScores: {
            ...p.stats.bestScores,
            [r.gameSlug]: Math.max(p.stats.bestScores[r.gameSlug] ?? 0, r.score),
          },
          lastPlayedAt: r.completedAt,
        },
        recent: [r, ...p.recent].slice(0, 20),
      };
    });
    // Future: award XP + coins here (src/lib/rewards.ts), check quests.
  });
}
