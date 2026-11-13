'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import { GameArt } from './GameArt';
import { useT, loc } from '@/lib/i18n';
import { searchGames, useReleasedGames } from '@/lib/games';

export function SearchBox({ autoFocus = false, onDone }: { autoFocus?: boolean; onDone?: () => void }) {
  const { t, locale } = useT();
  const router = useRouter();
  const games = useReleasedGames();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => (q.trim() ? searchGames(games, q, locale).slice(0, 5) : []), [games, q, locale]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/games/?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
    onDone?.();
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className="relative w-full"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted"
        strokeWidth={2.2}
      />
      <input
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={t('search.placeholder')}
        aria-label={t('nav.search')}
        className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-base outline-none placeholder:text-muted focus:border-brand"
      />
      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">{t('search.noResults')}</p>
          ) : (
            <>
              <ul>
                {results.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/games/${g.slug}/`}
                      onClick={() => {
                        setOpen(false);
                        setQ('');
                        onDone?.();
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-soft"
                    >
                      <span
                        aria-hidden
                        className={`grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${g.gradient}`}
                      >
                        <GameArt slug={g.slug} className="size-7" />
                      </span>
                      <span className="font-bold">{loc(g.title, locale)}</span>
                      <span className="text-sm text-muted">{loc(g.title, locale === 'en' ? 'zh' : 'en')}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="submit"
                className="flex w-full items-center gap-1.5 border-t border-line px-4 py-2.5 text-left text-sm font-bold text-brand hover:bg-soft"
              >
                {t('search.viewAll')} <ArrowRight className="size-4" aria-hidden />
              </button>
            </>
          )}
        </div>
      )}
    </form>
  );
}
