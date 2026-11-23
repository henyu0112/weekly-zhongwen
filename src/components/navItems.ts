import { BookOpen, Gamepad2, House, Info, ListChecks, Settings, ShoppingBag, UserRound, type LucideIcon } from 'lucide-react';
import { FEATURES } from '@/lib/config';
import type { MessageKey } from '@/messages/en';

export interface NavItem {
  href: string;
  key: MessageKey;
  Icon: LucideIcon;
  show: boolean;
}

/** Main pages: the desktop header links and the top of the mobile drawer. */
export const NAV: NavItem[] = [
  { href: '/', key: 'nav.home', Icon: House, show: true },
  { href: '/games', key: 'nav.games', Icon: Gamepad2, show: true },
  { href: '/dictionary', key: 'nav.dictionary', Icon: BookOpen, show: true },
  { href: '/quests', key: 'nav.quests', Icon: ListChecks, show: FEATURES.quests },
  { href: '/shop', key: 'nav.shop', Icon: ShoppingBag, show: FEATURES.shop },
  { href: '/profile', key: 'nav.profile', Icon: UserRound, show: FEATURES.profile },
  // On desktop, About lives in the footer and on the Settings page once the nav has shop + profile.
  { href: '/about', key: 'nav.about', Icon: Info, show: !FEATURES.shop && !FEATURES.profile },
];

/** Extra links at the bottom of the mobile drawer. */
export const DRAWER_EXTRA: NavItem[] = [
  { href: '/settings', key: 'nav.settings', Icon: Settings, show: true },
  { href: '/about', key: 'nav.about', Icon: Info, show: FEATURES.shop || FEATURES.profile },
];

export const isActive = (pathname: string, href: string) => {
  const p = pathname.replace(/\/$/, '') || '/';
  return href === '/' ? p === '/' : p === href || p.startsWith(`${href}/`);
};
