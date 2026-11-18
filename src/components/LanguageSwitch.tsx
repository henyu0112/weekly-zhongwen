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
  const index = Math.max(0, OPTIONS.findIndex((o) => o.value === language));
  return (
    <div
      role="group"
      aria-label={t('nav.language')}
      className="relative inline-flex rounded-full border border-line bg-surface p-0.5 text-sm font-bold"
    >
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 w-10 rounded-full sm:w-12 bg-brand shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)]"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-label={o.aria}
          aria-pressed={language === o.value}
          onClick={() => settingsStore.set({ language: o.value })}
          className={`relative z-10 w-10 whitespace-nowrap sm:w-12 rounded-full py-1.5 transition-colors duration-300 ${
            language === o.value ? 'text-brand-fg' : 'text-muted hover:text-fg'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
