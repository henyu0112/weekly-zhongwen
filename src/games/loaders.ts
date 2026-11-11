import type { ComponentType } from 'react';
import type { GameProps } from '@/lib/types';

/**
 * Each playable game is code-split: its code is only downloaded when
 * the player opens that game's page.
 */
export const GAME_LOADERS: Record<string, () => Promise<{ default: ComponentType<GameProps> }>> = {
  'hanzi-slash': () => import('./hanzi-slash/HanziSlash'),
  'word-pop': () => import('./word-pop/WordPop'),
};
