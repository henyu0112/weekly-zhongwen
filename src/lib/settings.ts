import { createPersistentStore, useStore } from './store';

export type Locale = 'en' | 'zh';
export type Theme = 'light' | 'dark' | 'system';
export type TextSize = 'small' | 'medium' | 'large';

export interface Settings {
  language: Locale;
  theme: Theme;
  sound: boolean;
  textSize: TextSize;
  /** Show pinyin above Chinese characters. */
  pinyin: boolean;
}

export const defaultSettings: Settings = {
  language: 'zh',
  theme: 'system',
  sound: true,
  textSize: 'medium',
  pinyin: false,
};

export const settingsStore = createPersistentStore<Settings>(
  'wz.settings',
  defaultSettings,
  undefined,
  // Every new visit starts in Chinese. Switching to English lasts until the tab is closed.
  ['language'],
);

export const useSettings = () => useStore(settingsStore);
