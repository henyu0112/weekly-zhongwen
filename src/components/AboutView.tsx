'use client';

import { useT } from '@/lib/i18n';

export function AboutView() {
  const { t } = useT();
  return (
    <article className="mx-auto max-w-2xl space-y-4 text-lg">
      <h1 className="text-3xl font-black">{t('about.title')}</h1>
      <p>{t('about.p1')}</p>
      <p className="text-muted">{t('about.p2')}</p>
      <p className="text-muted">{t('about.p3')}</p>
      <p className="border-t border-line pt-4 text-sm text-muted">{t('about.credits')}</p>
    </article>
  );
}
