import type { RewardSummary } from './economy';
import type { Locale, Settings } from './settings';

/** Standard result every game reports when a round ends. */
export interface GameResult {
  gameSlug: string;
  score: number;
  correct: number;
  wrong: number;
  durationSec: number;
  /** Ids of vocabulary items practised (for future progress tracking). */
  vocabIds: string[];
  /** Words the player got wrong or missed (feeds the mistake book). */
  mistakeIds?: string[];
  /** Words from the mistake book the player now got right. */
  masteredIds?: string[];
  /** Words answered correctly this game (first-time correct words earn bonus XP). */
  correctIds?: string[];
  perfectRounds?: number;
  stars?: number;
  /** Practice runs earn reduced XP and no coins. */
  practice?: boolean;
  difficulty?: string;
  completedAt: string; // ISO date
}

/** What the player has equipped, by shop slot (see src/data/shop.ts). */
export interface PlayerContext {
  equipped: Record<string, string>;
}

/** Props the platform passes to every game component. */
export interface GameProps {
  locale: Locale;
  settings: Settings;
  player: PlayerContext;
  onStart?: () => void;
  onAnswer?: (correct: boolean) => void;
  /**
   * Report the finished game. Returns the XP / coins earned when the game has
   * rewards switched on (catalog `rewards: true`), otherwise null.
   */
  onComplete: (result: Omit<GameResult, 'gameSlug' | 'completedAt'>) => RewardSummary | null;
}

export interface Localized {
  en: string;
  zh: string;
}
