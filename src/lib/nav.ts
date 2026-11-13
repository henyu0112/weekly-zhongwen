'use client';

import { usePathname, useRouter } from 'next/navigation';

const KEY = 'wz.lastPage';

const isSettings = (path: string) => path.replace(/\/$/, '') === '/settings';

/** Remember the last page the player was on, so Settings can return to it. */
export function rememberPage(path: string): void {
  if (isSettings(path)) return;
  try {
    window.sessionStorage.setItem(KEY, path + window.location.search);
  } catch {
    /* storage unavailable: fall back to home */
  }
}

function lastPage(): string {
  try {
    return window.sessionStorage.getItem(KEY) || '/';
  } catch {
    return '/';
  }
}

/**
 * Behaviour for every "Settings" button: opens /settings, and when Settings
 * is already open, closes it and returns to the page the player came from.
 */
export function useSettingsToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const open = isSettings(pathname);
  const onClick = (e: React.MouseEvent) => {
    if (!open) return;
    e.preventDefault();
    router.push(lastPage());
  };
  return { open, onClick };
}
