import { supabase } from "@/lib/supabase";

export type ChecklistRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  order: number;
};

export type ChecklistInput = {
  title: string;
  description?: string;
  image_url?: string | null;
};

export const checklistRepo = {
  async list(): Promise<ChecklistRow[]> {
    const { data, error } = await supabase
      .from("checklists")
      .select('id, title, description, image_url, "order"')
      .order("order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as ChecklistRow[];
  },
  async create(input: ChecklistInput, order: number): Promise<ChecklistRow> {
    const { data, error } = await supabase
      .from("checklists")
      .insert({
        title: input.title,
        description: input.description ?? null,
        image_url: input.image_url ?? null,
        order,
      })
      .select('id, title, description, image_url, "order"')
      .single();
    if (error) throw error;
    return data as ChecklistRow;
  },
  async update(id: string, input: ChecklistInput) {
    const { error } = await supabase
      .from("checklists")
      .update({
        title: input.title,
        description: input.description ?? null,
        image_url: input.image_url ?? null,
      })
      .eq("id", id);
    if (error) throw error;
  },
  async remove(id: string) {
    const { error } = await supabase.from("checklists").delete().eq("id", id);
    if (error) throw error;
  },
  async reorder(ids: string[]) {
    await Promise.all(
      ids.map((id, idx) =>
        supabase.from("checklists").update({ order: idx }).eq("id", id),
      ),
    );
  },
};
