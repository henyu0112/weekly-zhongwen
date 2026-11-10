import type { GameResult } from './types';

/**
 * A minimal typed event bus.
 *
 * Games never know about XP, coins or quests. They just report what happened;
 * future systems (XP, currency, daily quests, achievements) subscribe here.
 */
export interface PlatformEvents {
  game_started: { gameSlug: string };
  answer: { gameSlug: string; correct: boolean };
  game_completed: GameResult;
  daily_visit: { date: string };
}

type Handler<K extends keyof PlatformEvents> = (payload: PlatformEvents[K]) => void;

// Loosely typed storage; the public on()/emit() signatures keep callers type-safe.
const handlers = new Map<keyof PlatformEvents, Set<(payload: never) => void>>();

export function on<K extends keyof PlatformEvents>(event: K, handler: Handler<K>): () => void {
  const set = handlers.get(event) ?? new Set<(payload: never) => void>();
  handlers.set(event, set);
  set.add(handler);
  return () => {
    set.delete(handler);
  };
}

export function emit<K extends keyof PlatformEvents>(event: K, payload: PlatformEvents[K]): void {
  handlers.get(event)?.forEach((h) => (h as Handler<K>)(payload));
}
