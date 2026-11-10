'use client';

import { useT } from '@/lib/i18n';

export function Footer() {
  const { t } = useT();
  return (
    <footer className="hidden border-t border-line py-6 text-center text-sm text-muted md:block">
      {t('footer.rights', { year: 2026 })}
    </footer>
  );
}
