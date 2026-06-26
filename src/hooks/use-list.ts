import { useCallback, useEffect, useState } from "react";
import { catalogRepo, type CatalogTable } from "@/lib/repos/catalogRepo";
import { toast } from "@/hooks/use-toast";

export type TextItem = { id: string; text: string };

/**
 * Remote-backed list of {id, text} items mapped to a Supabase catalog table.
 * API matches the previous local `useTextList` so call sites stay unchanged.
 */
export function useTextList(table: string, _initial: string[] = []) {
  const tbl = table as CatalogTable;
  const [items, setItemsState] = useState<TextItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await catalogRepo.list(tbl);
      setItemsState(rows.map((r) => ({ id: r.id, text: r.name })));
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao carregar dados";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [tbl]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = useCallback(
    async (text = "") => {
      try {
        const row = await catalogRepo.create(tbl, text, items.length);
        setItemsState((prev) => [...prev, { id: row.id, text: row.name }]);
      } catch (e) {
        toast({ title: "Erro ao adicionar", description: String(e), variant: "destructive" });
      }
    },
    [tbl, items.length],
  );

  const update = useCallback(
    async (id: string, text: string) => {
      setItemsState((prev) => prev.map((i) => (i.id === id ? { ...i, text } : i)));
      try {
        await catalogRepo.update(tbl, id, text);
      } catch (e) {
        toast({ title: "Erro ao atualizar", description: String(e), variant: "destructive" });
      }
    },
    [tbl],
  );

  const remove = useCallback(
    async (id: string) => {
      setItemsState((prev) => prev.filter((i) => i.id !== id));
      try {
        await catalogRepo.remove(tbl, id);
      } catch (e) {
        toast({ title: "Erro ao excluir", description: String(e), variant: "destructive" });
      }
    },
    [tbl],
  );

  const setItems = useCallback(
    (next: TextItem[] | ((prev: TextItem[]) => TextItem[])) => {
      setItemsState((prev) => {
        const resolved = typeof next === "function" ? (next as (p: TextItem[]) => TextItem[])(prev) : next;
        // Persist new order if it changed.
        const prevIds = prev.map((i) => i.id).join(",");
        const nextIds = resolved.map((i) => i.id).join(",");
        if (prevIds !== nextIds && resolved.length === prev.length) {
          void catalogRepo.reorder(tbl, resolved.map((i) => i.id));
        }
        return resolved;
      });
    },
    [tbl],
  );

  return { items, setItems, add, update, remove, loading, error };
}
