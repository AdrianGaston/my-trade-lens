import { supabase } from "@/lib/supabase";
import type { Trade } from "@/types/trade";

type Row = {
  id: string;
  date: string | null;
  asset: string | null;
  type: string | null;
  volume: number | null;
  setup: string | null;
  trend: string | null;
  sentiment: string | null;
  error: string | null;
  entry_price: number | null;
  exit_price: number | null;
  points: number | null;
  result: number | null;
  change_pct: number | null;
};

const toTrade = (r: Row): Trade => ({
  id: r.id,
  date: r.date ? new Date(`${r.date}T00:00:00`).toISOString() : new Date().toISOString(),
  asset: r.asset ?? "",
  type: (r.type as "Buy" | "Sell") ?? "Buy",
  volume: Number(r.volume ?? 0),
  setup: r.setup ?? "",
  trend: r.trend ?? "",
  sentiment: r.sentiment ?? "",
  error: r.error ?? "",
  entryPrice: Number(r.entry_price ?? 0),
  exitPrice: Number(r.exit_price ?? 0),
  points: Number(r.points ?? 0),
  resultDollar: Number(r.result ?? 0),
  changePercent: Number(r.change_pct ?? 0),
});

const toRow = (t: Omit<Trade, "id">) => ({
  date: t.date ? t.date.slice(0, 10) : null,
  asset: t.asset,
  type: t.type,
  volume: t.volume,
  setup: t.setup,
  trend: t.trend,
  sentiment: t.sentiment,
  error: t.error,
  entry_price: t.entryPrice,
  exit_price: t.exitPrice,
  points: t.points,
  result: t.resultDollar,
  change_pct: t.changePercent,
});

export const tradesRepo = {
  async list(): Promise<Trade[]> {
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => toTrade(r as Row));
  },
  async create(t: Omit<Trade, "id">): Promise<Trade> {
    const { data, error } = await supabase
      .from("trades")
      .insert(toRow(t))
      .select("*")
      .single();
    if (error) throw error;
    return toTrade(data as Row);
  },
  async update(id: string, t: Omit<Trade, "id">) {
    const { error } = await supabase.from("trades").update(toRow(t)).eq("id", id);
    if (error) throw error;
  },
  async remove(id: string) {
    const { error } = await supabase.from("trades").delete().eq("id", id);
    if (error) throw error;
  },
};
