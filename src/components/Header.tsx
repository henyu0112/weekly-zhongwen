'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { SearchBox } from './SearchBox';
import { LanguageSwitch } from './LanguageSwitch';
import { PlayerStatus } from './PlayerStatus';
import { useT } from '@/lib/i18n';
import { FEATURES } from '@/lib/config';
import type { MessageKey } from '@/messages/en';

export const NAV: { href: string; key: MessageKey; show: boolean }[] = [
  { href: '/', key: 'nav.home', show: true },
  { href: '/games', key: 'nav.games', show: true },
  { href: '/quests', key: 'nav.quests', show: FEATURES.quests },
  { href: '/shop', key: 'nav.shop', show: FEATURES.shop },
  { href: '/about', key: 'nav.about', show: true },
];

export const isActive = (pathname: string, href: string) => {
  const p = pathname.replace(/\/$/, '') || '/';
  return href === '/' ? p === '/' : p === href || p.startsWith(`${href}/`);
};

export function Header() {
  const { t } = useT();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Logo />

        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.filter((n) => n.show).map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(pathname, n.href) ? 'page' : undefined}
              className={`rounded-full px-3.5 py-2 text-sm font-bold transition-colors ${
                isActive(pathname, n.href) ? 'bg-soft text-brand' : 'text-muted hover:text-fg'
              }`}
            >
              {t(n.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden w-full max-w-sm md:block">
          <SearchBox />
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {/* Reserved slot: level bar + coins appear here when FEATURES.economy is on. */}
          <PlayerStatus />
          <button
            type="button"
            aria-label={t('nav.search')}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full border border-line bg-surface text-lg md:hidden"
          >
            🔍
          </button>
          <LanguageSwitch />
          <Link
            href="/settings"
            aria-label={t('nav.settings')}
            className="grid size-10 place-items-center rounded-full border border-line bg-surface text-lg hover:bg-soft"
          >
            ⚙️
          </Link>
          {FEATURES.accounts && (
            <Link href="/profile" className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-brand-fg">
              {t('nav.login')}
            </Link>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line px-4 py-3 md:hidden">
          <SearchBox autoFocus onDone={() => setSearchOpen(false)} />
        </div>
      )}
    </header>
  );
}
