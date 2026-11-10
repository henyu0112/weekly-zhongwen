import type { ComponentType } from 'react';
import type { GameProps } from '@/lib/types';

/**
 * Each playable game is code-split: its code is only downloaded when
 * the player opens that game's page.
 */
export const GAME_LOADERS: Record<string, () => Promise<{ default: ComponentType<GameProps> }>> = {
  'word-pop': () => import('./word-pop/WordPop'),
};
