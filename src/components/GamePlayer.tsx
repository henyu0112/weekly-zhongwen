'use client';

import { lazy, Suspense, useMemo, useRef } from 'react';
import { Maximize2 } from 'lucide-react';
import { GAME_LOADERS } from '@/games/loaders';
import { useSettings } from '@/lib/settings';
import { useT } from '@/lib/i18n';
import { emit } from '@/lib/events';
import type { GameProps } from '@/lib/types';

/**
 * The single place where a game plugs into the platform.
 * Games receive language + settings, and report back only what happened.
 * XP / coins / quests will react to these events; games never touch them.
 */
export function GamePlayer({ slug }: { slug: string }) {
  const { t, locale } = useT();
  const settings = useSettings();
  const box = useRef<HTMLDivElement>(null);

  const Game = useMemo(() => {
    const loader = GAME_LOADERS[slug];
    return loader ? lazy(loader) : null;
  }, [slug]);

  if (!Game) return null;

  const props: GameProps = {
    locale,
    settings,
    onStart: () => emit('game_started', { gameSlug: slug }),
    onAnswer: (correct) => emit('answer', { gameSlug: slug, correct }),
    onComplete: (result) =>
      emit('game_completed', { ...result, gameSlug: slug, completedAt: new Date().toISOString() }),
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
