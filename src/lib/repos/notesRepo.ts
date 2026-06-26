import { supabase } from "@/lib/supabase";

export type NoteSection = "goals" | "tasks" | "notes";

export type NoteRow = {
  id: string;
  section: NoteSection;
  content: string;
  completed: boolean;
  order: number;
};

export const notesRepo = {
  async list(section: NoteSection): Promise<NoteRow[]> {
    const { data, error } = await supabase
      .from("notes")
      .select('id, section, content, completed, "order"')
      .eq("section", section)
      .order("order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as NoteRow[];
  },
  async create(section: NoteSection, order: number): Promise<NoteRow> {
    const { data, error } = await supabase
      .from("notes")
      .insert({ section, content: "", completed: false, order })
      .select('id, section, content, completed, "order"')
      .single();
    if (error) throw error;
    return data as NoteRow;
  },
  async update(id: string, patch: Partial<Pick<NoteRow, "content" | "completed">>) {
    const { error } = await supabase.from("notes").update(patch).eq("id", id);
    if (error) throw error;
  },
  async remove(id: string) {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) throw error;
  },
  async reorder(ids: string[]) {
    await Promise.all(
      ids.map((id, idx) =>
        supabase.from("notes").update({ order: idx }).eq("id", id),
      ),
    );
  },
};
