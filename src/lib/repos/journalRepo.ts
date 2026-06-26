import { supabase } from "@/lib/supabase";

export interface JournalEntry {
  id: string;
  date: string;
  title: string | null;
  content: string;
  mood: string | null;
  daily_summary_id: string | null;
  order: number;
}

export const journalRepo = {
  async list(): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from("journal")
      .select('id, date, title, content, mood, daily_summary_id, "order"')
      .order("date", { ascending: false })
      .order("order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as JournalEntry[];
  },
  async create(entry: Omit<JournalEntry, "id">): Promise<JournalEntry> {
    const { data, error } = await supabase
      .from("journal")
      .insert({
        date: entry.date,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        daily_summary_id: entry.daily_summary_id,
        order: entry.order,
      })
      .select('id, date, title, content, mood, daily_summary_id, "order"')
      .single();
    if (error) throw error;
    return data as JournalEntry;
  },
  async update(id: string, patch: Partial<Omit<JournalEntry, "id">>) {
    const { error } = await supabase.from("journal").update(patch).eq("id", id);
    if (error) throw error;
  },
  async remove(id: string) {
    const { error } = await supabase.from("journal").delete().eq("id", id);
    if (error) throw error;
  },
  async reorder(ids: string[]) {
    await Promise.all(
      ids.map((id, idx) => supabase.from("journal").update({ order: idx }).eq("id", id)),
    );
  },
};
