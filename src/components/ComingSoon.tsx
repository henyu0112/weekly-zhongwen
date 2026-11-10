'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n';
import type { MessageKey } from '@/messages/en';

/** Placeholder for features that are planned but not built yet (shop, quests, profile). */
export function ComingSoon({ titleKey, emoji }: { titleKey: MessageKey; emoji: string }) {
  const { t } = useT();
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-line bg-surface p-10 text-center">
      <div aria-hidden className="text-6xl">
        {emoji}
      </div>
      <h1 className="mt-4 text-2xl font-extrabold">{t(titleKey)}</h1>
      <p className="mt-1 font-bold text-brand">{t('soon.title')}</p>
      <p className="mt-3 text-muted">{t('soon.desc')}</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-bold text-brand-fg">
        {t('soon.home')}
      </Link>
    </div>
  );
}
