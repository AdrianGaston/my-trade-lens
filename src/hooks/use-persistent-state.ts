import { useEffect, useState } from "react";
import { localStorageRepo } from "@/lib/listRepo";

/**
 * Persist any JSON-serializable state in localStorage.
 * Centralizes read/write so a future swap to Supabase only touches this hook.
 */
export function usePersistentState<T>(key: string, initial: T) {
  const repo = localStorageRepo<T>(key, [] as unknown as T[]);
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore */
    }
    // repo reference is stable per key
    void repo;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, key]);

  return [state, setState] as const;
}
