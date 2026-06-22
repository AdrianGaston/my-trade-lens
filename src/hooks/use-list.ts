import { useEffect, useState } from "react";
import { localStorageRepo, uid } from "@/lib/listRepo";

export type TextItem = { id: string; text: string };

/**
 * Hook for managing a persistent ordered list of {id,text} items.
 * Storage is localStorage today; swap by replacing the repo internally later.
 */
export function useTextList(storageKey: string, initial: string[] = []) {
  const repo = localStorageRepo<TextItem>(storageKey);
  const [items, setItems] = useState<TextItem[]>(() => {
    const existing = repo.load();
    if (existing.length > 0) return existing;
    return initial.map((text) => ({ id: uid(), text }));
  });

  useEffect(() => {
    repo.save(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const add = (text = "") => setItems((prev) => [...prev, { id: uid(), text }]);
  const update = (id: string, text: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, text } : i)));
  const remove = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  return { items, setItems, add, update, remove };
}
