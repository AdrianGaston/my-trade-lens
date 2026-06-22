// Generic persistent list repository.
// Isolated data-access layer to facilitate future migration to Supabase
// without rewriting UI components.

export interface ListRepo<T> {
  load(): T[];
  save(items: T[]): void;
}

export function localStorageRepo<T>(key: string, fallback: T[] = []): ListRepo<T> {
  return {
    load() {
      try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T[]) : fallback;
      } catch {
        return fallback;
      }
    },
    save(items: T[]) {
      try {
        localStorage.setItem(key, JSON.stringify(items));
      } catch {
        /* ignore */
      }
    },
  };
}

export const uid = () => Math.random().toString(36).slice(2, 10);
