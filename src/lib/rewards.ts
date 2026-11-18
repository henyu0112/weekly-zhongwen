import { computeRewards, type RewardSummary } from './economy';
import { localDay, profileStore } from './profile';
import type { GameResult } from './types';

/**
 * Records a finished game in the profile: stats, best score, mistake book,
 * learned words, and (when the game has rewards on) XP, level and coins.
 * Returns what was earned so the game can show it.
 */
export function recordGameResult(r: GameResult, opts: { rewards: boolean }): RewardSummary | null {
  let summary: RewardSummary | null = null;

  profileStore.set((p) => {
    const mistakes = { ...p.mistakes };
    for (const id of r.mistakeIds ?? []) {
      mistakes[id] = { count: (mistakes[id]?.count ?? 0) + 1, lastAt: r.completedAt };
    }
    for (const id of r.masteredIds ?? []) delete mistakes[id];

    const wordsLearned = { ...p.wordsLearned };
    let newWords = 0;
    for (const id of new Set(r.correctIds ?? [])) {
      if (!wordsLearned[id]) {
        wordsLearned[id] = 1;
        newWords++;
      }
    }

    const next = {
      ...p,
      mistakes,
      wordsLearned,
      stats: {
        gamesPlayed: p.stats.gamesPlayed + 1,
        bestScores: {
          ...p.stats.bestScores,
          [r.gameSlug]: Math.max(p.stats.bestScores[r.gameSlug] ?? 0, r.score),
        },
        lastPlayedAt: r.completedAt,
      },
      totals: {
        ...p.totals,
        correct: p.totals.correct + r.correct,
        answered: p.totals.answered + r.correct + r.wrong,
      },
      recent: [r, ...p.recent].slice(0, 20),
    };

    if (!opts.rewards) return next;

    const today = localDay();
    summary = computeRewards(
      {
        correct: r.correct,
        newWords,
        mastered: r.masteredIds?.length ?? 0,
        perfectRounds: r.perfectRounds ?? 0,
        stars: r.stars ?? 0,
        practice: !!r.practice,
        difficulty: r.difficulty,
      },
      { xpBefore: p.xp, dailyAvailable: p.lastDailyBonus !== today },
    );
    const gotDaily = summary.lines.some((l) => l.key === 'daily');

    return {
      ...next,
      xp: summary.xpAfter,
      level: summary.levelAfter,
      coins: p.coins + summary.coins,
      lastDailyBonus: gotDaily ? today : p.lastDailyBonus,
      totals: {
        ...next.totals,
        xpEarned: p.totals.xpEarned + summary.xp,
        coinsEarned: p.totals.coinsEarned + summary.coins,
      },
      ledger: [
        { at: r.completedAt, kind: 'game' as const, ref: r.gameSlug, xp: summary.xp, coins: summary.coins },
        ...p.ledger,
      ].slice(0, 100),
    };
  });

  return summary;
}
