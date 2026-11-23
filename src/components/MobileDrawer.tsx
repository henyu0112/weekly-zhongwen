'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coins, Menu, X } from 'lucide-react';
import { FEATURES } from '@/lib/config';
import { levelProgress } from '@/lib/economy';
import { useT } from '@/lib/i18n';
import { useProfile } from '@/lib/profile';
import { equippedAll } from '@/lib/shop';
import { Avatar } from './Avatar';
import { LanguageSwitch } from './LanguageSwitch';
import { Logo } from './Logo';
import { DRAWER_EXTRA, NAV, isActive, type NavItem } from './navItems';

/** Phone navigation: a menu button that slides a drawer in from the left. */
export function MobileDrawer() {
  const { t } = useT();
  const pathname = usePathname();
  const profile = useProfile();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  // The header's blur would trap a fixed element, so the drawer renders on <body>.
  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const opener = menuRef.current;
    const scroll = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = panelRef.current.querySelectorAll<HTMLElement>('a[href], button');
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    // Rotating or widening past phone size switches to the desktop header.
    const wide = window.matchMedia('(min-width: 768px)');
    const onWide = () => wide.matches && setOpen(false);
    document.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => {
      document.body.style.overflow = scroll;
      document.removeEventListener('keydown', onKey);
      wide.removeEventListener('change', onWide);
      opener?.focus({ preventScroll: true });
    };
  }, [open]);

  const prog = levelProgress(profile.xp);
  const close = () => setOpen(false);

  const link = ({ href, key, Icon }: NavItem) => {
    const active = isActive(pathname, href);
    return (
      <li key={href}>
        <Link
          href={href}
          onClick={close}
          aria-current={active ? 'page' : undefined}
          className={`flex min-h-12 items-center gap-3 rounded-2xl px-3 font-bold transition-colors ${
            active ? 'bg-soft text-brand' : 'hover:bg-soft'
          }`}
        >
          <Icon className="size-5 shrink-0" aria-hidden strokeWidth={active ? 2.5 : 2} />
          {t(key)}
        </Link>
      </li>
    );
  };

  return (
    <>
      <button
        ref={menuRef}
        type="button"
        aria-label={t('nav.menu')}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="-ml-1 grid size-10 shrink-0 place-items-center rounded-full transition hover:bg-soft active:scale-95 md:hidden"
      >
        <Menu className="size-6" aria-hidden />
      </button>

      {mounted &&
        createPortal(
          <div className={`fixed inset-0 z-50 md:hidden ${open ? '' : 'pointer-events-none'}`} inert={!open}>
            <div
              aria-hidden
              onClick={close}
              className={`absolute inset-0 bg-slate-950/55 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
            />
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={t('nav.menu')}
              className={`absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col bg-surface shadow-2xl transition-[transform,visibility] duration-300 ease-out ${
                open ? 'visible translate-x-0' : 'invisible -translate-x-full'
              }`}
            >
              <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-line px-4">
                <span onClick={close}>
                  <Logo />
                </span>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label={t('nav.closeMenu')}
                  onClick={close}
                  className="grid size-10 place-items-center rounded-full hover:bg-soft"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain p-3">
                {FEATURES.economy && (
                  <Link href="/profile" onClick={close} className="mb-3 block rounded-2xl bg-soft p-3">
                    <span className="flex items-center gap-3">
                      <Avatar char={profile.avatar} frame={equippedAll(profile).frame} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-black">{profile.nickname || t('profile.defaultName')}</span>
                        <span className="block text-xs font-bold text-brand">{t('profile.level', { n: prog.level })}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 font-black">
                        <Coins className="size-4 text-amber-500" aria-hidden /> {profile.coins}
                      </span>
                    </span>
                    <span className="mt-2 block h-2 overflow-hidden rounded-full bg-line">
                      <span
                        className="block h-full rounded-full bg-brand"
                        style={{ width: `${Math.round(prog.ratio * 100)}%` }}
                      />
                    </span>
                  </Link>
                )}

                <nav aria-label={t('nav.menu')}>
                  <ul className="space-y-1">{NAV.filter((n) => n.show).map(link)}</ul>
                  <ul className="mt-3 space-y-1 border-t border-line pt-3">{DRAWER_EXTRA.filter((n) => n.show).map(link)}</ul>
                </nav>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <span className="text-sm font-extrabold">{t('nav.language')}</span>
                <LanguageSwitch />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
