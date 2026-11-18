'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, House, Settings, ShoppingBag, UserRound, X, type LucideIcon } from 'lucide-react';
import { FEATURES } from '@/lib/config';
import { useT } from '@/lib/i18n';
import { useSettingsToggle } from '@/lib/nav';
import { isActive } from './Header';
import type { MessageKey } from '@/messages/en';

const TABS: { href: string; key: MessageKey; Icon: LucideIcon; show: boolean }[] = [
  { href: '/', key: 'nav.home', Icon: House, show: true },
  { href: '/games', key: 'nav.games', Icon: Gamepad2, show: true },
  { href: '/shop', key: 'nav.shop', Icon: ShoppingBag, show: FEATURES.shop },
  { href: '/profile', key: 'nav.profile', Icon: UserRound, show: FEATURES.profile },
  { href: '/settings', key: 'nav.settings', Icon: Settings, show: true },
];

/** Thumb-friendly bottom navigation, phones only. */
export function MobileTabBar() {
  const { t } = useT();
  const pathname = usePathname();
  const settingsToggle = useSettingsToggle();
  const tabs = TABS.filter((tab) => tab.show);
  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 grid border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((tab) => {
        const active = isActive(pathname, tab.href);
        const isSettingsTab = tab.href === '/settings';
        const Icon = isSettingsTab && settingsToggle.open ? X : tab.Icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            onClick={isSettingsTab ? settingsToggle.onClick : undefined}
            aria-current={active ? 'page' : undefined}
            aria-label={isSettingsTab && settingsToggle.open ? t('nav.closeSettings') : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-bold ${
              active ? 'text-brand' : 'text-muted'
            }`}
          >
            <Icon aria-hidden className="size-6" strokeWidth={active ? 2.4 : 2} />
            {t(tab.key)}
          </Link>
        );
      })}
    </nav>
  );
}
