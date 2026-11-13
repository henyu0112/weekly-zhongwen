'use client';

import Link from 'next/link';
import { ScrollText, ShoppingBag, UserRound } from 'lucide-react';
import { useT } from '@/lib/i18n';
import type { MessageKey } from '@/messages/en';

const ICONS = { shop: ShoppingBag, quests: ScrollText, profile: UserRound };

/** Placeholder for features that are planned but not built yet (shop, quests, profile). */
export function ComingSoon({ titleKey, icon }: { titleKey: MessageKey; icon: keyof typeof ICONS }) {
  const { t } = useT();
  const Icon = ICONS[icon];
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-line bg-surface p-10 text-center">
      <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-soft text-brand">
        <Icon className="size-10" aria-hidden strokeWidth={1.7} />
      </span>
      <h1 className="mt-4 text-2xl font-extrabold">{t(titleKey)}</h1>
      <p className="mt-1 font-bold text-brand">{t('soon.title')}</p>
      <p className="mt-3 text-muted">{t('soon.desc')}</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-bold text-brand-fg">
        {t('soon.home')}
      </Link>
    </div>
  );
}
