'use client';

import { useEffect } from 'react';
import { useSettings } from '@/lib/settings';
import { wireProfile } from '@/lib/profile';
import { emit } from '@/lib/events';

/** Applies settings to <html> and wires platform-wide event listeners. */
export function Providers({ children }: { children: React.ReactNode }) {
  const { language, theme, textSize } = useSettings();

  useEffect(() => {
    wireProfile();
    emit('daily_visit', { date: new Date().toISOString().slice(0, 10) });
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  }, [language]);

  useEffect(() => {
    document.documentElement.dataset.size = textSize;
  }, [textSize]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme;
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);

  return <>{children}</>;
}
