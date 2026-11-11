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
  completedAt: string; // ISO date
}

/** Props the platform passes to every game component. */
export interface GameProps {
  locale: Locale;
  settings: Settings;
  onStart?: () => void;
  onAnswer?: (correct: boolean) => void;
  onComplete: (result: Omit<GameResult, 'gameSlug' | 'completedAt'>) => void;
}

export interface Localized {
  en: string;
  zh: string;
}
