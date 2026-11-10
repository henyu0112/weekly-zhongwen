'use client';

import Link from 'next/link';
import { GameCard } from './GameCard';
import { useT } from '@/lib/i18n';
import { useReleasedGames } from '@/lib/games';

export function HomeView() {
  const { t } = useT();
  const games = useReleasedGames();
  const [featured, ...past] = games;

  const steps = [
    { icon: '🗓️', title: t('home.how.1.title'), desc: t('home.how.1.desc') },
    { icon: '🎲', title: t('home.how.2.title'), desc: t('home.how.2.desc') },
    { icon: '📱', title: t('home.how.3.title'), desc: t('home.how.3.desc') },
  ];

  return (
    <div className="space-y-14">
      <section className="text-center">
        <h1 className="text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
          <span className="text-brand">{t('home.hero.title')}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">{t('home.hero.sub')}</p>
      </section>

      {featured && (
        <section aria-labelledby="this-week">
          <h2 id="this-week" className="mb-4 text-xl font-extrabold">
            ⭐ {t('home.thisWeek')}
          </h2>
          <GameCard game={featured} featured />
        </section>
      )}

      <section aria-labelledby="how">
        <h2 id="how" className="mb-4 text-xl font-extrabold">
          {t('home.how.title')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.title} className="rounded-3xl border border-line bg-surface p-5">
              <div aria-hidden className="text-4xl">
                {s.icon}
              </div>
              <h3 className="mt-2 font-extrabold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {past.length > 0 && (
        <section aria-labelledby="past">
          <div className="mb-4 flex items-end justify-between">
            <h2 id="past" className="text-xl font-extrabold">
              {t('home.recent')}
            </h2>
            <Link href="/games" className="text-sm font-bold text-brand">
              {t('home.viewAll')} →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {past.slice(0, 3).map((g) => (
              <GameCard key={g.slug} game={g} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
