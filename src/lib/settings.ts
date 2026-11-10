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
  language: 'en',
  theme: 'system',
  sound: true,
  textSize: 'medium',
  pinyin: false,
};

export const settingsStore = createPersistentStore<Settings>(
  'wz.settings',
  defaultSettings,
  () => ({
    language: navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en',
  }),
);

export const useSettings = () => useStore(settingsStore);
