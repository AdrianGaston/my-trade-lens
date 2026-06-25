import { supabase } from "@/lib/supabase";

export type CatalogTable = "assets" | "setups" | "errors" | "sentiments";

export interface CatalogRow {
  id: string;
  name: string;
  order: number;
}

export const catalogRepo = {
  async list(table: CatalogTable): Promise<CatalogRow[]> {
    const { data, error } = await supabase
      .from(table)
      .select('id, name, "order"')
      .order("order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as CatalogRow[];
  },
  async create(table: CatalogTable, name: string, order: number) {
    const { data, error } = await supabase
      .from(table)
      .insert({ name, order })
      .select('id, name, "order"')
      .single();
    if (error) throw error;
    return data as CatalogRow;
  },
  async update(table: CatalogTable, id: string, name: string) {
    const { error } = await supabase.from(table).update({ name }).eq("id", id);
    if (error) throw error;
  },
  async remove(table: CatalogTable, id: string) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
  },
  async reorder(table: CatalogTable, ids: string[]) {
    await Promise.all(
      ids.map((id, idx) =>
        supabase.from(table).update({ order: idx }).eq("id", id),
      ),
    );
  },
};
