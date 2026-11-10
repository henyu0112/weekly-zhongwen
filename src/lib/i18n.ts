'use client';

import { useCallback, useMemo } from 'react';
import { en, type MessageKey } from '@/messages/en';
import { zh } from '@/messages/zh';
import { useSettings, type Locale } from './settings';
import type { Localized } from './types';

const dictionaries: Record<Locale, Record<MessageKey, string>> = { en, zh };

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  let text = dictionaries[locale][key] ?? en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
}

export const loc = (value: Localized, locale: Locale): string => value[locale];

export function formatDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function useT() {
  const { language } = useSettings();
  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => translate(language, key, vars),
    [language],
  );
  return useMemo(() => ({ t, locale: language }), [t, language]);
}
