'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays, Layers, Smartphone, Star } from 'lucide-react';
import { GameCard } from './GameCard';
import { useT } from '@/lib/i18n';
import { useReleasedGames } from '@/lib/games';

/** Decorative row of character tiles for the hero. */
function HeroTiles() {
  const tiles = ['每', '周', '中', '文'];
  return (
    <div aria-hidden className="mb-6 flex justify-center gap-2.5 sm:gap-3">
      {tiles.map((ch, i) => (
        <span
          key={ch}
          className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-700 text-3xl font-black text-white shadow-lg shadow-blue-900/20 sm:size-16 sm:text-4xl"
          style={{ transform: `rotate(${[-6, 4, -3, 6][i]}deg) translateY(${[0, -6, 2, -4][i]}px)` }}
        >
          {ch}
        </span>
      ))}
    </div>
  );
}

export function HomeView() {
  const { t } = useT();
  const games = useReleasedGames();
  const [featured, ...past] = games;

  const steps = [
    { Icon: CalendarDays, title: t('home.how.1.title'), desc: t('home.how.1.desc') },
    { Icon: Layers, title: t('home.how.2.title'), desc: t('home.how.2.desc') },
    { Icon: Smartphone, title: t('home.how.3.title'), desc: t('home.how.3.desc') },
  ];

  return (
    <div className="space-y-14">
      <section className="text-center">
        <HeroTiles />
        <h1 className="text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
          <span className="text-brand">{t('home.hero.title')}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">{t('home.hero.sub')}</p>
      </section>

      {featured && (
        <section aria-labelledby="this-week">
          <h2 id="this-week" className="mb-4 flex items-center gap-2 text-xl font-extrabold">
            <Star className="size-5 fill-amber-400 text-amber-500" aria-hidden /> {t('home.thisWeek')}
          </h2>
          <GameCard game={featured} featured />
        </section>
      )}

      <section aria-labelledby="how">
        <h2 id="how" className="mb-4 text-xl font-extrabold">
          {t('home.how.title')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-3xl border border-line bg-surface p-5">
              <span className="grid size-12 place-items-center rounded-2xl bg-soft text-brand">
                <Icon className="size-6" aria-hidden strokeWidth={2} />
              </span>
              <h3 className="mt-3 font-extrabold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{desc}</p>
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
            <Link href="/games" className="inline-flex items-center gap-1 text-sm font-bold text-brand">
              {t('home.viewAll')} <ArrowRight className="size-4" aria-hidden />
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
