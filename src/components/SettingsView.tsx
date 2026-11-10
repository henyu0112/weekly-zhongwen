'use client';

import { settingsStore, useSettings, type Locale, type TextSize, type Theme } from '@/lib/settings';
import { useT } from '@/lib/i18n';
import { Hanzi } from './Hanzi';

function Row({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-extrabold">{title}</h2>
        {desc && <p className="text-sm text-muted">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-full border border-line bg-bg p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-10 min-w-16 rounded-full px-4 text-sm font-bold transition-colors ${
            value === o.value ? 'bg-brand text-brand-fg' : 'text-muted hover:text-fg'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${checked ? 'bg-brand' : 'bg-line'}`}
    >
      <span
        className={`absolute top-1 size-6 rounded-full bg-white shadow transition-all ${
          checked ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  );
}

export function SettingsView() {
  const { t } = useT();
  const s = useSettings();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-black">{t('settings.title')}</h1>
      <p className="mt-1 text-muted">{t('settings.sub')}</p>

      <div className="mt-6 divide-y divide-line rounded-3xl border border-line bg-surface px-5">
        <Row title={t('settings.language')} desc={t('settings.language.desc')}>
          <Segmented<Locale>
            label={t('settings.language')}
            value={s.language}
            onChange={(v) => settingsStore.set({ language: v })}
            options={[
              { value: 'en', label: 'English' },
              { value: 'zh', label: '中文' },
            ]}
          />
        </Row>

        <Row title={t('settings.theme')}>
          <Segmented<Theme>
            label={t('settings.theme')}
            value={s.theme}
            onChange={(v) => settingsStore.set({ theme: v })}
            options={[
              { value: 'light', label: `☀️ ${t('settings.theme.light')}` },
              { value: 'dark', label: `🌙 ${t('settings.theme.dark')}` },
              { value: 'system', label: t('settings.theme.system') },
            ]}
          />
        </Row>

        <Row title={t('settings.textSize')}>
          <Segmented<TextSize>
            label={t('settings.textSize')}
            value={s.textSize}
            onChange={(v) => settingsStore.set({ textSize: v })}
            options={[
              { value: 'small', label: t('settings.size.small') },
              { value: 'medium', label: t('settings.size.medium') },
              { value: 'large', label: t('settings.size.large') },
            ]}
          />
        </Row>

        <Row title={t('settings.pinyin')} desc={t('settings.pinyin.desc')}>
          <div className="flex items-center gap-4">
            <span className="rounded-2xl bg-soft px-4 py-2 text-xl font-bold" aria-label={t('settings.pinyin.preview')}>
              <Hanzi text="你好" pinyin="nǐ hǎo" />
            </span>
            <Toggle checked={s.pinyin} label={t('settings.pinyin')} onChange={(v) => settingsStore.set({ pinyin: v })} />
          </div>
        </Row>

        <Row title={t('settings.sound')} desc={t('settings.sound.desc')}>
          <Toggle checked={s.sound} label={t('settings.sound')} onChange={(v) => settingsStore.set({ sound: v })} />
        </Row>
      </div>

      <button
        type="button"
        onClick={() => settingsStore.reset()}
        className="mt-6 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-bold hover:bg-soft"
      >
        ↺ {t('settings.reset')}
      </button>
    </div>
  );
}
