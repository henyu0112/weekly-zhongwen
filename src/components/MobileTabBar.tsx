'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/lib/i18n';
import { isActive } from './Header';
import type { MessageKey } from '@/messages/en';

const TABS: { href: string; key: MessageKey; icon: string }[] = [
  { href: '/', key: 'nav.home', icon: '🏠' },
  { href: '/games', key: 'nav.games', icon: '🎮' },
  { href: '/settings', key: 'nav.settings', icon: '⚙️' },
  { href: '/about', key: 'nav.about', icon: 'ℹ️' },
];

/** Thumb-friendly bottom navigation, phones only. */
export function MobileTabBar() {
  const { t } = useT();
  const pathname = usePathname();
  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {TABS.map((tab) => {
        const active = isActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-bold ${
              active ? 'text-brand' : 'text-muted'
            }`}
          >
            <span aria-hidden className="text-xl leading-none">
              {tab.icon}
            </span>
            {t(tab.key)}
          </Link>
        );
      })}
    </nav>
  );
}
