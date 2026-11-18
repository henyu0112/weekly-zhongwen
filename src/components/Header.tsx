'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, House, Info, ListChecks, Search, Settings, ShoppingBag, UserRound, X, type LucideIcon } from 'lucide-react';
import { useSettingsToggle } from '@/lib/nav';
import { Logo } from './Logo';
import { SearchBox } from './SearchBox';
import { LanguageSwitch } from './LanguageSwitch';
import { PlayerStatus } from './PlayerStatus';
import { useT } from '@/lib/i18n';
import { FEATURES } from '@/lib/config';
import type { MessageKey } from '@/messages/en';

export const NAV: { href: string; key: MessageKey; Icon: LucideIcon; show: boolean }[] = [
  { href: '/', key: 'nav.home', Icon: House, show: true },
  { href: '/games', key: 'nav.games', Icon: Gamepad2, show: true },
  { href: '/quests', key: 'nav.quests', Icon: ListChecks, show: FEATURES.quests },
  { href: '/shop', key: 'nav.shop', Icon: ShoppingBag, show: FEATURES.shop },
  { href: '/profile', key: 'nav.profile', Icon: UserRound, show: FEATURES.profile },
  // About lives in the footer and on the Settings page once the nav has shop + profile.
  { href: '/about', key: 'nav.about', Icon: Info, show: !FEATURES.shop && !FEATURES.profile },
];

export const isActive = (pathname: string, href: string) => {
  const p = pathname.replace(/\/$/, '') || '/';
  return href === '/' ? p === '/' : p === href || p.startsWith(`${href}/`);
};

/** True once the page is scrolled down. Hysteresis stops flicker when the header shrinks. */
function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled((s) => (s ? y > 4 : y > 32));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return scrolled;
}

/** Desktop nav with a pill that slides to the active link. */
function MainNav({ pathname, compact }: { pathname: string; compact: boolean }) {
  const { t, locale } = useT();
  const navRef = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const [animate, setAnimate] = useState(false);
  const items = NAV.filter((n) => n.show);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const el = nav.querySelector<HTMLElement>('[aria-current="page"]');
      setPill(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [pathname, locale, compact]);

  // Only slide after the first placement, so the pill doesn't fly in from the left on load.
  useEffect(() => {
    if (pill && !animate) requestAnimationFrame(() => setAnimate(true));
  }, [pill, animate]);

  return (
    <nav ref={navRef} aria-label="Main" className="relative ml-3 hidden items-center gap-1 md:flex">
      <span
        aria-hidden
        className={`absolute inset-y-0 rounded-full bg-soft shadow-[inset_0_0_0_1px_var(--line)] ${
          animate ? 'transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)]' : ''
        } ${pill ? 'opacity-100' : 'opacity-0'}`}
        style={{ left: pill?.left ?? 0, width: pill?.width ?? 0 }}
      />
      {items.map(({ href, key, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`nav-link relative z-10 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold transition-colors ${
              active ? 'text-brand' : 'text-muted hover:text-fg'
            }`}
          >
            <Icon className="nav-icon size-4" aria-hidden strokeWidth={active ? 2.5 : 2} />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}

export function Header() {
  const { t } = useT();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const settingsToggle = useSettingsToggle();
  const scrolled = useScrolled();

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? 'border-line bg-bg/75 shadow-[0_6px_24px_-12px_rgba(15,40,90,0.35)] backdrop-blur-lg'
          : 'border-transparent bg-bg'
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center gap-2 px-4 transition-[height] duration-300 sm:gap-3 ${
          scrolled ? 'h-14' : 'h-[72px]'
        }`}
      >
        <Logo compact={scrolled} />

        <MainNav pathname={pathname} compact={scrolled} />

        {/* Full search box only on wide screens (xl); smaller and phones use the search button. */}
        <div className="ml-auto hidden w-full max-w-xs xl:block">
          <SearchBox />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-0">
          <PlayerStatus />
          <button
            type="button"
            aria-label={t('nav.search')}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full border border-line bg-surface transition hover:bg-soft active:scale-95 xl:hidden"
          >
            <Search className="size-5" aria-hidden />
          </button>
          <LanguageSwitch />
          {/* Phones use the Settings tab in the bottom bar. */}
          <Link
            href="/settings"
            onClick={settingsToggle.onClick}
            aria-label={settingsToggle.open ? t('nav.closeSettings') : t('nav.settings')}
            aria-pressed={settingsToggle.open}
            className={`group hidden size-10 place-items-center rounded-full border transition-colors md:grid ${
              settingsToggle.open
                ? 'border-brand bg-brand text-brand-fg'
                : 'border-line bg-surface hover:bg-soft'
            }`}
          >
            {settingsToggle.open ? (
              <X className="size-5" aria-hidden />
            ) : (
              <Settings className="size-5 transition-transform duration-500 group-hover:rotate-90" aria-hidden />
            )}
          </Link>
          {FEATURES.accounts && (
            <Link href="/profile" className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-brand-fg">
              {t('nav.login')}
            </Link>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line px-4 py-3 xl:hidden">
          <SearchBox autoFocus onDone={() => setSearchOpen(false)} />
        </div>
      )}
    </header>
  );
}
