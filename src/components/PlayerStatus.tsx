'use client';

import { Coins } from 'lucide-react';
import { FEATURES } from '@/lib/config';
import { useProfile } from '@/lib/profile';

/**
 * Level + coin counter shown in the header once the XP / currency systems
 * exist. Hidden today (FEATURES.economy = false); the slot is already wired.
 */
export function PlayerStatus() {
  const profile = useProfile();
  if (!FEATURES.economy) return null;
  return (
    <div className="flex items-center gap-2 text-sm font-bold">
      <span className="rounded-full bg-soft px-3 py-1.5">Lv {profile.level}</span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1.5">
        <Coins className="size-4 text-amber-500" aria-hidden /> {profile.coins}
      </span>
    </div>
  );
}
