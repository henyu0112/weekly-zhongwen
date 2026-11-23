import { useSyncExternalStore } from 'react';

/**
 * A tiny persistent store (localStorage today).
 *
 * Everything the player owns (settings, and later XP / coins / inventory /
 * quests) goes through stores like this. When accounts arrive, only the
 * load/save part of this file needs to talk to a backend instead.
 */
export interface PersistentStore<T> {
  get(): T;
  getServer(): T;
  set(patch: Partial<T> | ((state: T) => T)): void;
  reset(): void;
  subscribe(listener: () => void): () => void;
}

export function createPersistentStore<T extends object>(
  key: string,
  defaults: T,
  clientDefaults?: () => Partial<T>,
  /** Fields remembered only until the tab or browser is closed. */
  sessionFields: (keyof T)[] = [],
): PersistentStore<T> {
  let current: T | null = null;
  const sessionKey = `${key}.session`;

  const readSession = (): Partial<T> => {
    if (!sessionFields.length) return {};
    try {
      return JSON.parse(window.sessionStorage.getItem(sessionKey) ?? '{}');
    } catch {
      return {};
    }
  };
  const listeners = new Set<() => void>();

  const load = (): T => {
    if (typeof window === 'undefined') return defaults;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw);
        for (const f of sessionFields) delete saved[f];
        return { ...defaults, ...saved, ...readSession() };
      }
    } catch {
      /* storage blocked or corrupt: fall through to defaults */
    }
    return { ...defaults, ...(clientDefaults?.() ?? {}), ...readSession() };
  };

  const notify = () => listeners.forEach((l) => l());

  const persist = (value: T) => {
    try {
      const lasting: Partial<T> = { ...value };
      const session: Partial<T> = {};
      for (const f of sessionFields) {
        session[f] = value[f];
        delete lasting[f];
      }
      window.localStorage.setItem(key, JSON.stringify(lasting));
      if (sessionFields.length) window.sessionStorage.setItem(sessionKey, JSON.stringify(session));
    } catch {
      /* ignore quota / private mode errors */
    }
  };

  if (typeof window !== 'undefined') {
    // Keep multiple tabs in sync.
    window.addEventListener('storage', (e) => {
      if (e.key === key) {
        current = null;
        notify();
      }
    });
  }

  return {
    get: () => (current ??= load()),
    getServer: () => defaults,
    set(patch) {
      const prev = (current ??= load());
      current = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
      persist(current);
      notify();
    },
    reset() {
      current = { ...defaults, ...(clientDefaults?.() ?? {}) };
      persist(current);
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function useStore<T>(store: PersistentStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.getServer);
}
