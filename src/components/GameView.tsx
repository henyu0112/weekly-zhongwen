'use client';

import Link from 'next/link';
import { TOPICS, getGame } from '@/games/catalog';
import { GamePlayer } from './GamePlayer';
import { formatDate, loc, useT } from '@/lib/i18n';
import { isReleased, useNow } from '@/lib/games';
import { levelRangeText } from '@/lib/levels';
import { useProfile } from '@/lib/profile';

export function GameView({ slug }: { slug: string }) {
  const { t, locale } = useT();
  const now = useNow();
  const profile = useProfile();
  const game = getGame(slug);
  if (!game) return null;

  const released = isReleased(game, now);
  const best = profile.stats.bestScores[slug];

  return (
    <div className="space-y-6">
      <Link href="/games" className="inline-block text-sm font-bold text-brand">
        ← {t('game.back')}
      </Link>

      <header className="flex items-center gap-4">
        <div
          aria-hidden
          className={`grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-4xl ${game.gradient}`}
        >
          {game.emoji}
        </div>
        <div>
          <h1 className="text-3xl font-black">
            {loc(game.title, locale)}{' '}
            <span className="text-lg font-semibold text-muted">{loc(game.title, locale === 'en' ? 'zh' : 'en')}</span>
          </h1>
          <p className="text-sm font-bold text-muted">
            {t('game.week', { date: formatDate(game.releaseDate, locale) })}
            {game.inspiredBy && <> · {t('game.inspiredBy', { name: game.inspiredBy })}</>}
          </p>
        </div>
      </header>

      {!released ? (
        <div className="rounded-3xl border border-dashed border-line p-10 text-center text-muted">
          🔒 {t('game.notReleased', { date: formatDate(game.releaseDate, locale) })}
        </div>
      ) : game.playable ? (
        <GamePlayer slug={slug} />
      ) : (
        <div className="rounded-3xl border border-dashed border-line bg-surface p-10 text-center">
          <div aria-hidden className="text-6xl">
            🚧
          </div>
          <h2 className="mt-3 text-xl font-extrabold">{t('game.underConstruction')}</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">{t('game.underConstructionDesc')}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-3xl border border-line bg-surface p-5">
          <h2 className="font-extrabold">{t('game.about')}</h2>
          <p className="mt-2 text-muted">{loc(game.description, locale)}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-soft px-2.5 py-1 text-xs font-bold text-brand">
              {levelRangeText(game.standards, locale)}
            </span>
            {game.topics.map((tp) => (
              <span key={tp} className="rounded-full bg-soft px-2.5 py-1 text-xs font-bold">
                {TOPICS[tp].emoji} {loc(TOPICS[tp].label, locale)}
              </span>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-line bg-surface p-5">
          <h2 className="font-extrabold">{t('game.howTo')}</h2>
          <p className="mt-2 text-muted">{loc(game.howTo, locale)}</p>
          {best !== undefined && <p className="mt-3 font-bold text-brand">🏆 {t('game.best', { n: best })}</p>}
        </section>
      </div>
    </div>
  );
}
