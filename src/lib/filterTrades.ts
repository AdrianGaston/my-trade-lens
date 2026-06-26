import { startOfDay, endOfDay, startOfWeek, startOfMonth, subDays } from "date-fns";
import type { Trade } from "@/types/trade";

export type PeriodPreset = "month" | "week" | "last7" | "last30" | "custom";
export type ResultFilter = "all" | "gain" | "loss";

export interface TradeFilters {
  asset: string; // "all" or asset name
  type: "all" | "Buy" | "Sell";
  setup: string;
  result: ResultFilter;
  period: PeriodPreset;
  customFrom?: string; // yyyy-mm-dd
  customTo?: string;
}

export const defaultFilters: TradeFilters = {
  asset: "all",
  type: "all",
  setup: "all",
  result: "all",
  period: "month",
};

export function resolvePeriod(f: TradeFilters): { from?: Date; to?: Date } {
  const now = new Date();
  switch (f.period) {
    case "month":
      return { from: startOfMonth(now), to: endOfDay(now) };
    case "week":
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfDay(now) };
    case "last7":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case "last30":
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
    case "custom":
      return {
        from: f.customFrom ? startOfDay(new Date(`${f.customFrom}T00:00:00`)) : undefined,
        to: f.customTo ? endOfDay(new Date(`${f.customTo}T00:00:00`)) : undefined,
      };
  }
}

export function applyFilters(trades: Trade[], f: TradeFilters): Trade[] {
  const { from, to } = resolvePeriod(f);
  return trades.filter((t) => {
    const d = new Date(t.date);
    if (from && d < from) return false;
    if (to && d > to) return false;
    if (f.asset !== "all" && t.asset !== f.asset) return false;
    if (f.type !== "all" && t.type !== f.type) return false;
    if (f.setup !== "all" && t.setup !== f.setup) return false;
    if (f.result === "gain" && t.resultDollar <= 0) return false;
    if (f.result === "loss" && t.resultDollar >= 0) return false;
    return true;
  });
}
