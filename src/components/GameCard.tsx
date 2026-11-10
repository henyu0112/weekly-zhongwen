'use client';

import Link from 'next/link';
import { TOPICS, type GameMeta } from '@/games/catalog';
import { formatDate, loc, useT } from '@/lib/i18n';
import { standardsLabelKey } from '@/lib/games';

export function GameCard({ game, featured = false }: { game: GameMeta; featured?: boolean }) {
  const { t, locale } = useT();
  const [a, b] = game.standards;

  return (
    <Link
      href={`/games/${game.slug}/`}
      className={`group flex overflow-hidden rounded-3xl border border-line bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
        featured ? 'flex-col md:flex-row' : 'flex-col'
      }`}
    >
      <div
        className={`relative grid place-items-center bg-gradient-to-br ${game.gradient} ${
          featured ? 'h-44 md:h-auto md:w-2/5' : 'h-32'
        }`}
      >
        <span
          aria-hidden
          className={`transition-transform group-hover:scale-110 ${featured ? 'text-7xl md:text-8xl' : 'text-6xl'}`}
        >
          {game.emoji}
        </span>
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-extrabold ${
            game.playable ? 'bg-white text-emerald-700' : 'bg-black/40 text-white'
          }`}
        >
          {game.playable ? t('game.playable') : t('game.soon')}
        </span>
      </div>

      <div className={`flex flex-1 flex-col gap-2 p-4 ${featured ? 'md:p-7' : ''}`}>
        <p className="text-xs font-bold uppercase tracking-wide text-muted">
          {t('game.week', { date: formatDate(game.releaseDate, locale) })}
        </p>
        <h3 className={`font-extrabold ${featured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          {loc(game.title, locale)}
          <span className="ml-2 text-base font-semibold text-muted">{loc(game.title, locale === 'en' ? 'zh' : 'en')}</span>
        </h3>
        <p className={`text-muted ${featured ? 'text-base' : 'line-clamp-2 text-sm'}`}>
          {loc(game.description, locale)}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          <span className="rounded-full bg-soft px-2.5 py-1 text-xs font-bold text-brand">
            {t(standardsLabelKey(game), { a, b })}
          </span>
          {game.topics.map((tp) => (
            <span key={tp} className="rounded-full bg-soft px-2.5 py-1 text-xs font-bold">
              {TOPICS[tp].emoji} {loc(TOPICS[tp].label, locale)}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
