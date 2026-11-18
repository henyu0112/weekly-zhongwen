'use client';

import { lazy, Suspense, useMemo, useRef } from 'react';
import { Maximize2 } from 'lucide-react';
import { getGame } from '@/games/catalog';
import { GAME_LOADERS } from '@/games/loaders';
import { useSettings } from '@/lib/settings';
import { useT } from '@/lib/i18n';
import { emit } from '@/lib/events';
import { useProfile } from '@/lib/profile';
import { recordGameResult } from '@/lib/rewards';
import { equippedAll } from '@/lib/shop';
import type { GameProps, GameResult } from '@/lib/types';

/**
 * The single place where a game plugs into the platform.
 * Games receive language, settings and the player's equipped cosmetics, and
 * report back only what happened. XP, coins and stats are worked out here,
 * never inside a game.
 */
export function GamePlayer({ slug }: { slug: string }) {
  const { t, locale } = useT();
  const settings = useSettings();
  const profile = useProfile();
  const box = useRef<HTMLDivElement>(null);
  const rewards = !!getGame(slug)?.rewards;

  const Game = useMemo(() => {
    const loader = GAME_LOADERS[slug];
    return loader ? lazy(loader) : null;
  }, [slug]);

  const equipped = useMemo(() => equippedAll(profile), [profile]);

  if (!Game) return null;

  const props: GameProps = {
    locale,
    settings,
    player: { equipped },
    onStart: () => emit('game_started', { gameSlug: slug }),
    onAnswer: (correct) => emit('answer', { gameSlug: slug, correct }),
    onComplete: (result) => {
      const full: GameResult = { ...result, gameSlug: slug, completedAt: new Date().toISOString() };
      const summary = recordGameResult(full, { rewards });
      emit('game_completed', full);
      return summary;
    },
  };

  return (
    <div ref={box} className="overflow-hidden rounded-3xl border border-line bg-surface">
      <div className="flex justify-end border-b border-line px-3 py-1.5">
        <button
          type="button"
          onClick={() => {
            if (document.fullscreenElement) void document.exitFullscreen();
            else void box.current?.requestFullscreen?.();
          }}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-muted hover:bg-soft hover:text-fg"
        >
          <Maximize2 className="size-4" aria-hidden /> {t('game.fullscreen')}
        </button>
      </div>
      <Suspense fallback={<div className="grid h-80 place-items-center text-muted">{t('game.loading')}</div>}>
        <Game {...props} />
      </Suspense>
    </div>
  );
}
