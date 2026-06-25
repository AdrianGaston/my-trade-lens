import { supabase } from "@/lib/supabase";

export type ManagementRow = {
  id: string;
  title: string;
  items: string[];
  image_url: string | null;
  order: number;
};

export type ManagementInput = {
  title: string;
  items: string[];
  image_url?: string | null;
};

type DBRow = Omit<ManagementRow, "items"> & { items: unknown };

const toRow = (r: DBRow): ManagementRow => ({
  ...r,
  items: Array.isArray(r.items) ? (r.items as string[]) : [],
});

export const managementRepo = {
  async list(): Promise<ManagementRow[]> {
    const { data, error } = await supabase
      .from("management")
      .select('id, title, items, image_url, "order"')
      .order("order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r) => toRow(r as DBRow));
  },
  async create(input: ManagementInput, order: number): Promise<ManagementRow> {
    const { data, error } = await supabase
      .from("management")
      .insert({
        title: input.title,
        items: input.items,
        image_url: input.image_url ?? null,
        order,
      })
      .select('id, title, items, image_url, "order"')
      .single();
    if (error) throw error;
    return toRow(data as DBRow);
  },
  async update(id: string, input: ManagementInput) {
    const { error } = await supabase
      .from("management")
      .update({
        title: input.title,
        items: input.items,
        image_url: input.image_url ?? null,
      })
      .eq("id", id);
    if (error) throw error;
  },
  async remove(id: string) {
    const { error } = await supabase.from("management").delete().eq("id", id);
    if (error) throw error;
  },
  async reorder(ids: string[]) {
    await Promise.all(
      ids.map((id, idx) =>
        supabase.from("management").update({ order: idx }).eq("id", id),
      ),
    );
  },
};
