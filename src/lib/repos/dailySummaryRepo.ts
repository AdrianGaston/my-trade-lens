import { supabase } from "@/lib/supabase";
import type { DayStats } from "@/lib/dayStats";

export type DailySummaryRow = {
  id: string;
  date: string;
  total_trades: number | null;
  total_result: number | null;
  total_change_pct: number | null;
  total_points: number | null;
  gains: number | null;
  losses: number | null;
  assertiveness: number | null;
  top_setup: string | null;
  top_error: string | null;
  top_sentiment: string | null;
  observation: string | null;
};

export const dailySummaryRepo = {
  async getByDate(date: string): Promise<DailySummaryRow | null> {
    const { data, error } = await supabase
      .from("daily_summary")
      .select("*")
      .eq("date", date)
      .maybeSingle();
    if (error) throw error;
    return (data as DailySummaryRow) ?? null;
  },
  async upsert(stats: DayStats, observation: string): Promise<DailySummaryRow> {
    const payload = {
      date: stats.date,
      total_trades: stats.totalTrades,
      total_result: stats.totalResult,
      total_change_pct: stats.totalChangePct,
      total_points: stats.totalPoints,
      gains: stats.gains,
      losses: stats.losses,
      assertiveness: stats.assertiveness,
      top_setup: stats.topSetup,
      top_error: stats.topError,
      top_sentiment: stats.topSentiment,
      observation,
    };
    const { data, error } = await supabase
      .from("daily_summary")
      .upsert(payload, { onConflict: "date" })
      .select("*")
      .single();
    if (error) throw error;
    return data as DailySummaryRow;
  },
};
