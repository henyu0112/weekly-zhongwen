import { Suspense } from 'react';
import type { Metadata } from 'next';
import { GamesView } from '@/components/GamesView';

export const metadata: Metadata = { title: 'Games 游戏' };

export default function GamesPage() {
  // useSearchParams (for ?q=) needs a Suspense boundary in static export.
  return (
    <Suspense>
      <GamesView />
    </Suspense>
  );
}
