'use client';

import Link from 'next/link';
import { Compass } from 'lucide-react';
import { useT } from '@/lib/i18n';

export default function NotFound() {
  const { t } = useT();
  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <span className="mx-auto grid size-24 place-items-center rounded-3xl bg-soft text-brand">
        <Compass className="size-12" aria-hidden strokeWidth={1.6} />
      </span>
      <h1 className="mt-4 text-3xl font-black">{t('notfound.title')}</h1>
      <p className="mt-2 text-muted">{t('notfound.desc')}</p>
      <Link href="/games" className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-bold text-brand-fg">
        {t('nav.games')}
      </Link>
    </div>
  );
}
