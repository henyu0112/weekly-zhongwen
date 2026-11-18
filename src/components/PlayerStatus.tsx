'use client';

import Link from 'next/link';
import { Coins } from 'lucide-react';
import { FEATURES } from '@/lib/config';
import { levelFromXp } from '@/lib/economy';
import { useT } from '@/lib/i18n';
import { useProfile } from '@/lib/profile';

/** Level + coin counter in the header; links to the profile page. Hidden on phones (the tab bar has Profile). */
export function PlayerStatus() {
  const profile = useProfile();
  const { t } = useT();
  if (!FEATURES.economy) return null;
  const level = levelFromXp(profile.xp);
  return (
    <Link
      href="/profile"
      aria-label={`${t('status.level', { n: level })}, ${profile.coins} ${t('profile.coins')}`}
      className="hidden h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface pl-1.5 pr-3 text-sm font-extrabold hover:bg-soft sm:inline-flex"
    >
      <span className="rounded-full bg-brand px-2 py-0.5 text-xs text-brand-fg">Lv {level}</span>
      <span className="inline-flex items-center gap-1">
        <Coins className="size-4 text-amber-500" aria-hidden /> {profile.coins}
      </span>
    </Link>
  );
}
