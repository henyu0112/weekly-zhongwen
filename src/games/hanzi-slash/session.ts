import { WORDS, type Word } from '@/data/words';
import { makeRound, missReason, wrongReason, type Round, type RoundItem } from './rules';

export type DifficultyId = 'easy' | 'normal' | 'hard';
export type GameMode = 'normal' | 'practice' | 'mistakes';
export type InputMode = 'swipe' | 'tap';

export interface DifficultyParams {
  id: DifficultyId;
  label: string;
  desc: string;
  lives: number;
  /** Seconds a fruit stays in the air. */
  airtime: number;
  /** Average seconds between fruit launches. */
  interval: number;
  /** Chance of launching two fruits at once. */
  pairChance: number;
  roundSize: number;
  /** Share of fruits in a round that follow the rule. */
  correctRatio: number;
  bannerSec: number;
  forcePinyin: boolean;
  /** Hard mode: missing a correct fruit also costs a life. */
  missCostsLife: boolean;
}

export const DIFFICULTIES: Record<DifficultyId, DifficultyParams> = {
  easy: {
    id: 'easy',
    label: '简单',
    desc: '5条命 · 速度慢 · 显示拼音',
    lives: 5,
    airtime: 4.6,
    interval: 1.7,
    pairChance: 0,
    roundSize: 8,
    correctRatio: 0.5,
    bannerSec: 2.8,
    forcePinyin: true,
    missCostsLife: false,
  },
  normal: {
    id: 'normal',
    label: '普通',
    desc: '3条命 · 速度适中',
    lives: 3,
    airtime: 3.7,
    interval: 1.3,
    pairChance: 0.2,
    roundSize: 10,
    correctRatio: 0.45,
    bannerSec: 2.2,
    forcePinyin: false,
    missCostsLife: false,
  },
  hard: {
    id: 'hard',
    label: '困难',
    desc: '3条命 · 速度快 · 漏切也扣命',
    lives: 3,
    airtime: 3.0,
    interval: 0.95,
    pairChance: 0.4,
    roundSize: 12,
    correctRatio: 0.4,
    bannerSec: 1.8,
    forcePinyin: false,
    missCostsLife: true,
  },
};

export interface GameConfig {
  levelMin: number;
  levelMax: number;
  difficulty: DifficultyId;
  mode: GameMode;
  input: InputMode;
  /** Mistake-book word ids to practise (mode = 'mistakes'). */
  focusIds: string[];
}

export interface MistakeEntry {
  word: Word;
  kind: 'wrong' | 'missed';
  /** The rule that was active, e.g. 切出所有「形容词」. */
  rule: string;
  reason: string;
}

export interface Snapshot {
  lives: number;
  maxLives: number | null; // null = unlimited (practice)
  score: number;
  combo: number;
  bestCombo: number;
  round: number;
  correct: number;
  wrong: number;
}

export interface CutResult {
  ok: boolean;
  delta: number;
  reason?: string;
  over: boolean;
}

const PERFECT_BONUS = 30;
const WRONG_PENALTY = 10;

export class Session {
  readonly params: DifficultyParams;
  readonly practice: boolean;
  readonly pool: Word[];
  readonly focus: Set<string>;

  lives: number;
  score = 0;
  combo = 0;
  bestCombo = 0;
  round = 0;
  correct = 0;
  wrong = 0;
  elapsed = 0;
  mistakes: MistakeEntry[] = [];
  mastered = new Set<string>();
  seen = new Set<string>();
  over = false;

  private current: Round | null = null;
  private prevKey?: string;
  private roundFlawless = true;
  private listener: (s: Snapshot) => void;

  constructor(readonly config: GameConfig, onChange: (s: Snapshot) => void) {
    this.params = DIFFICULTIES[config.difficulty];
    this.practice = config.mode === 'practice';
    this.focus = new Set(config.mode === 'mistakes' ? config.focusIds : []);
    this.lives = this.params.lives;
    this.listener = onChange;

    const inRange = WORDS.filter((w) => w.level >= config.levelMin && w.level <= config.levelMax);
    const extra = WORDS.filter((w) => this.focus.has(w.id) && !inRange.includes(w));
    this.pool = [...inRange, ...extra];
  }

  snapshot(): Snapshot {
    return {
      lives: this.lives,
      maxLives: this.practice ? null : this.params.lives,
      score: this.score,
      combo: this.combo,
      bestCombo: this.bestCombo,
      round: this.round,
      correct: this.correct,
      wrong: this.wrong,
    };
  }

  private emit() {
    this.listener(this.snapshot());
  }

  nextRound(): Round {
    this.round += 1;
    this.roundFlawless = true;
    const round = makeRound(this.pool, {
      size: this.params.roundSize,
      ratio: this.params.correctRatio,
      roundNo: this.round,
      prevKey: this.prevKey,
      focus: this.focus,
    });
    this.prevKey = round.key;
    this.current = round;
    round.items.forEach((i) => this.seen.add(i.word.id));
    this.emit();
    return round;
  }

  private multiplier() {
    return 1 + Math.min(Math.floor(this.combo / 3), 4) * 0.5;
  }

  cut(item: RoundItem): CutResult {
    if (this.over || !this.current) return { ok: item.correct, delta: 0, over: this.over };
    const rule = this.current.rule;

    if (item.correct) {
      const delta = Math.round(10 * this.multiplier());
      this.score += delta;
      this.combo += 1;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      this.correct += 1;
      if (this.focus.has(item.word.id)) this.mastered.add(item.word.id);
      this.emit();
      return { ok: true, delta, over: false };
    }

    // Wrong cut: lose points and a life, combo resets.
    const before = this.score;
    this.score = Math.max(0, this.score - WRONG_PENALTY);
    this.combo = 0;
    this.wrong += 1;
    this.roundFlawless = false;
    this.mastered.delete(item.word.id);
    const reason = wrongReason(rule, item.word);
    this.mistakes.push({ word: item.word, kind: 'wrong', rule: this.current.title, reason });
    if (!this.practice) {
      this.lives -= 1;
      if (this.lives <= 0) this.over = true;
    }
    this.emit();
    return { ok: false, delta: this.score - before, reason, over: this.over };
  }

  /** A correct fruit fell without being cut. */
  miss(item: RoundItem): { lifeLost: boolean; reason: string; over: boolean } {
    if (this.over || !this.current) return { lifeLost: false, reason: '', over: this.over };
    const reason = missReason(this.current.rule, item.word);
    this.combo = 0;
    this.roundFlawless = false;
    this.mistakes.push({ word: item.word, kind: 'missed', rule: this.current.title, reason });
    this.mastered.delete(item.word.id);
    let lifeLost = false;
    if (this.params.missCostsLife && !this.practice) {
      lifeLost = true;
      this.lives -= 1;
      if (this.lives <= 0) this.over = true;
    }
    this.emit();
    return { lifeLost, reason, over: this.over };
  }

  /** Called when every fruit in the round has been resolved. Returns bonus points. */
  endRound(): number {
    if (this.over) return 0;
    if (!this.roundFlawless) return 0;
    this.score += PERFECT_BONUS;
    this.emit();
    return PERFECT_BONUS;
  }

  accuracy(): number {
    const total = this.correct + this.wrong;
    return total ? this.correct / total : 0;
  }

  stars(): number {
    if (this.practice || this.correct + this.wrong === 0) return 0;
    const a = this.accuracy();
    return a >= 0.9 ? 3 : a >= 0.7 ? 2 : 1;
  }
}
