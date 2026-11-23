'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n';

export function Footer() {
  const { t } = useT();
  return (
    <footer className="border-t border-line px-4 py-6 text-center text-sm text-muted">
      {t('footer.rights', { year: 2026 })} ·{' '}
      <Link href="/about" className="font-bold text-brand hover:underline">
        {t('nav.about')}
      </Link>
    </footer>
  );
}
