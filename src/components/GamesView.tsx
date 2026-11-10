'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameCard } from './GameCard';
import { TOPICS, type TopicId } from '@/games/catalog';
import { loc, useT } from '@/lib/i18n';
import { searchGames, useReleasedGames } from '@/lib/games';

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-10 rounded-full border px-4 text-sm font-bold transition-colors ${
        active ? 'border-brand bg-brand text-brand-fg' : 'border-line bg-surface hover:bg-soft'
      }`}
    >
      {children}
    </button>
  );
}

export function GamesView() {
  const { t, locale } = useT();
  const all = useReleasedGames();
  const q = useSearchParams().get('q') ?? '';
  const [standard, setStandard] = useState<number | null>(null);
  const [topic, setTopic] = useState<TopicId | null>(null);

  const games = useMemo(
    () =>
      searchGames(all, q, locale).filter(
        (g) =>
          (standard === null || (g.standards[0] <= standard && standard <= g.standards[1])) &&
          (topic === null || g.topics.includes(topic)),
      ),
    [all, q, locale, standard, topic],
  );

  const filtered = standard !== null || topic !== null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black">{t('games.title')}</h1>
        <p className="mt-1 text-muted">{q ? t('games.searchResultsFor', { q }) : t('games.sub')}</p>
      </header>

      <div className="space-y-3 rounded-3xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-extrabold">{t('games.filter.standard')}</span>
          <Chip active={standard === null} onClick={() => setStandard(null)}>
            {t('games.filter.all')}
          </Chip>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Chip key={n} active={standard === n} onClick={() => setStandard(standard === n ? null : n)}>
              {n}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-extrabold">{t('games.filter.topic')}</span>
          <Chip active={topic === null} onClick={() => setTopic(null)}>
            {t('games.filter.all')}
          </Chip>
          {(Object.keys(TOPICS) as TopicId[]).map((id) => (
            <Chip key={id} active={topic === id} onClick={() => setTopic(topic === id ? null : id)}>
              {TOPICS[id].emoji} {loc(TOPICS[id].label, locale)}
            </Chip>
          ))}
        </div>
      </div>

      <p className="text-sm font-bold text-muted" aria-live="polite">
        {t('games.count', { n: games.length })}
      </p>

      {games.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line p-10 text-center">
          <p className="text-muted">{t('games.empty')}</p>
          {filtered && (
            <button
              type="button"
              onClick={() => {
                setStandard(null);
                setTopic(null);
              }}
              className="mt-4 rounded-full bg-brand px-5 py-2.5 font-bold text-brand-fg"
            >
              {t('games.clear')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      )}
    </div>
  );
}
