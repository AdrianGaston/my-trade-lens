import { supabase } from "@/lib/supabase";

export type TradingPlanRow = { id: string; content: string; order: number };

export const tradingPlanRepo = {
  async list(): Promise<TradingPlanRow[]> {
    const { data, error } = await supabase
      .from("trading_plan")
      .select('id, content, "order"')
      .order("order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as TradingPlanRow[];
  },
  async create(content: string, order: number): Promise<TradingPlanRow> {
    const { data, error } = await supabase
      .from("trading_plan")
      .insert({ content, order })
      .select('id, content, "order"')
      .single();
    if (error) throw error;
    return data as TradingPlanRow;
  },
  async update(id: string, content: string) {
    const { error } = await supabase.from("trading_plan").update({ content }).eq("id", id);
    if (error) throw error;
  },
  async remove(id: string) {
    const { error } = await supabase.from("trading_plan").delete().eq("id", id);
    if (error) throw error;
  },
  async reorder(ids: string[]) {
    await Promise.all(
      ids.map((id, idx) =>
        supabase.from("trading_plan").update({ order: idx }).eq("id", id),
      ),
    );
  },
};
