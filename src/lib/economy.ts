/**
 * XP, levels and coins: ALL tuning numbers live here.
 *
 * Rewards are calculated by one pure function (computeRewards) so the exact
 * same logic can later run on a server when progress moves to the cloud.
 * Games never calculate rewards themselves.
 */
export const ECONOMY = {
  xp: {
    correct: 2,
    /** First time ever getting a word right. */
    newWord: 3,
    /** A mistake-book word answered correctly in mistake practice. */
    mastered: 10,
    perfectRound: 5,
    finish: 5,
    /** Practice mode keeps this share of the XP. */
    practiceFactor: 0.5,
  },
  coins: {
    correct: 1,
    perfectRound: 5,
    star: 3,
    levelUp: 20,
    /** First non-practice game of the day. */
    daily: 10,
    difficulty: { easy: 1, normal: 1.25, hard: 1.5 } as Record<string, number>,
  },
  level: {
    /** XP needed to go from level 1 to 2. */
    base: 50,
    /** Each later level needs this much more than the one before. */
    step: 25,
  },
} as const;

/** XP needed to go from `level` to `level + 1`. */
export function xpToNext(level: number): number {
  return ECONOMY.level.base + ECONOMY.level.step * (level - 1);
}

/** Total XP needed to reach `level` from zero. */
export function totalXpForLevel(level: number): number {
  const n = level - 1;
  return ECONOMY.level.base * n + (ECONOMY.level.step * n * (n - 1)) / 2;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xp >= totalXpForLevel(level + 1)) level++;
  return level;
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const start = totalXpForLevel(level);
  const need = xpToNext(level);
  return { level, into: xp - start, need, ratio: (xp - start) / need };
}

export type RewardKey =
  | 'correct'
  | 'newWords'
  | 'mastered'
  | 'perfect'
  | 'finish'
  | 'stars'
  | 'difficulty'
  | 'practice'
  | 'daily'
  | 'levelUp';

export interface RewardLine {
  key: RewardKey;
  count?: number;
  xp: number;
  coins: number;
}

export interface RewardInput {
  correct: number;
  newWords: number;
  mastered: number;
  perfectRounds: number;
  stars: number;
  practice: boolean;
  difficulty?: string;
}

export interface RewardContext {
  xpBefore: number;
  /** True if the daily bonus has not been claimed today. */
  dailyAvailable: boolean;
}

export interface RewardSummary {
  xp: number;
  coins: number;
  lines: RewardLine[];
  xpBefore: number;
  xpAfter: number;
  levelBefore: number;
  levelAfter: number;
}

export function computeRewards(input: RewardInput, ctx: RewardContext): RewardSummary {
  const X = ECONOMY.xp;
  const C = ECONOMY.coins;
  const lines: RewardLine[] = [];
  const add = (key: RewardKey, count: number | undefined, xp: number, coins: number) => {
    if (xp !== 0 || coins !== 0) lines.push({ key, count, xp, coins });
  };
  const p = input.practice;

  add('correct', input.correct, input.correct * X.correct, p ? 0 : input.correct * C.correct);
  add('newWords', input.newWords, input.newWords * X.newWord, 0);
  add('mastered', input.mastered, input.mastered * X.mastered, 0);
  add('perfect', input.perfectRounds, input.perfectRounds * X.perfectRound, p ? 0 : input.perfectRounds * C.perfectRound);
  add('finish', undefined, X.finish, 0);
  if (!p) add('stars', input.stars, 0, input.stars * C.star);

  let xp = lines.reduce((s, l) => s + l.xp, 0);
  let coins = lines.reduce((s, l) => s + l.coins, 0);

  if (p) {
    const cut = xp - Math.floor(xp * X.practiceFactor);
    add('practice', undefined, -cut, 0);
    xp -= cut;
  } else {
    const mult = C.difficulty[input.difficulty ?? 'normal'] ?? 1;
    const extra = Math.round(coins * mult) - coins;
    add('difficulty', undefined, 0, extra);
    coins += extra;
    if (ctx.dailyAvailable) {
      add('daily', undefined, 0, C.daily);
      coins += C.daily;
    }
  }

  const xpAfter = ctx.xpBefore + xp;
  const levelBefore = levelFromXp(ctx.xpBefore);
  const levelAfter = levelFromXp(xpAfter);
  const gained = levelAfter - levelBefore;
  if (gained > 0) {
    add('levelUp', gained, 0, gained * C.levelUp);
    coins += gained * C.levelUp;
  }

  return { xp, coins, lines, xpBefore: ctx.xpBefore, xpAfter, levelBefore, levelAfter };
}
