'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, House, Info, Settings, X, type LucideIcon } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useSettingsToggle } from '@/lib/nav';
import { isActive } from './Header';
import type { MessageKey } from '@/messages/en';

const TABS: { href: string; key: MessageKey; Icon: LucideIcon }[] = [
  { href: '/', key: 'nav.home', Icon: House },
  { href: '/games', key: 'nav.games', Icon: Gamepad2 },
  { href: '/settings', key: 'nav.settings', Icon: Settings },
  { href: '/about', key: 'nav.about', Icon: Info },
];

/** Thumb-friendly bottom navigation, phones only. */
export function MobileTabBar() {
  const { t } = useT();
  const pathname = usePathname();
  const settingsToggle = useSettingsToggle();
  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {TABS.map((tab) => {
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
