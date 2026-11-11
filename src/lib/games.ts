'use client';

import { useEffect, useMemo, useState } from 'react';
import { GAMES, TOPICS, type GameMeta } from '@/games/catalog';
import type { Locale } from './settings';

const BUILD_NOW = new Date(process.env.NEXT_PUBLIC_BUILD_DATE ?? Date.now());

/** "Today": build time on the server / first render, real time after mount. */
export function useNow(): Date {
  const [now, setNow] = useState(BUILD_NOW);
  useEffect(() => setNow(new Date()), []);
  return now;
}

const dayOf = (d: Date) => d.toISOString().slice(0, 10);

export const isReleased = (g: GameMeta, now: Date) => g.releaseDate <= dayOf(now);

/** Released games, newest first. */
export function useReleasedGames(): GameMeta[] {
  const now = useNow();
  return useMemo(
    () => GAMES.filter((g) => isReleased(g, now)).sort((a, b) => b.releaseDate.localeCompare(a.releaseDate)),
    [now],
  );
}

const strip = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** Case-insensitive search across titles (EN/中文), pinyin, topics, tags, descriptions. */
export function searchGames(games: GameMeta[], query: string, _locale: Locale): GameMeta[] {
  const tokens = strip(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return games;

  const scored = games.map((g) => {
    const primary = strip(
      [g.title.en, g.title.zh, g.pinyin, g.inspiredBy ?? '', g.slug, ...g.tags].join(' '),
    );
    const secondary = strip(
      [
        g.description.en,
        g.description.zh,
        ...g.topics.flatMap((t) => [TOPICS[t].label.en, TOPICS[t].label.zh]),
      ].join(' '),
    );
    let score = 0;
    for (const tok of tokens) {
      if (primary.includes(tok)) score += 3;
      else if (secondary.includes(tok)) score += 1;
      else return { g, score: 0 }; // every word must match somewhere
    }
    return { g, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.g);
}
