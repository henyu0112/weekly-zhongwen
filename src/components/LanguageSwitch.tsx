'use client';

import { settingsStore, useSettings, type Locale } from '@/lib/settings';
import { useT } from '@/lib/i18n';

const OPTIONS: { value: Locale; label: string; aria: string }[] = [
  { value: 'en', label: 'EN', aria: 'English' },
  { value: 'zh', label: '中文', aria: '中文' },
];

export function LanguageSwitch() {
  const { language } = useSettings();
  const { t } = useT();
  return (
    <div
      role="group"
      aria-label={t('nav.language')}
      className="inline-flex rounded-full border border-line bg-surface p-0.5 text-sm font-bold"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-label={o.aria}
          aria-pressed={language === o.value}
          onClick={() => settingsStore.set({ language: o.value })}
          className={`min-w-11 rounded-full px-3 py-1.5 transition-colors ${
            language === o.value ? 'bg-brand text-brand-fg' : 'text-muted hover:text-fg'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
