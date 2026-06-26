import type { Trade } from "@/types/trade";

export interface DayStats {
  date: string; // yyyy-mm-dd
  totalTrades: number;
  totalResult: number;
  totalChangePct: number;
  totalPoints: number;
  gains: number;
  losses: number;
  assertiveness: number; // 0-100
  topSetup: string | null;
  topError: string | null; // excludes "Nenhum"
  topSentiment: string | null; // excludes "Neutro"
}

const NONE_ERROR = "Nenhum";
const NEUTRAL_SENTIMENT = "Neutro";

const mostCommon = (values: string[], exclude?: string): string | null => {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    if (exclude && v.toLowerCase() === exclude.toLowerCase()) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  counts.forEach((c, v) => {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  });
  return best;
};

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function tradesOfDay(trades: Trade[], dayISO: string): Trade[] {
  return trades.filter((t) => t.date.slice(0, 10) === dayISO);
}

export function computeDayStats(trades: Trade[], dayISO: string): DayStats {
  const subset = tradesOfDay(trades, dayISO);
  const gains = subset.filter((t) => t.resultDollar > 0).length;
  const losses = subset.filter((t) => t.resultDollar < 0).length;
  return {
    date: dayISO,
    totalTrades: subset.length,
    totalResult: subset.reduce((s, t) => s + t.resultDollar, 0),
    totalChangePct: subset.reduce((s, t) => s + t.changePercent, 0),
    totalPoints: subset.reduce((s, t) => s + t.points, 0),
    gains,
    losses,
    assertiveness: subset.length > 0 ? (gains / subset.length) * 100 : 0,
    topSetup: mostCommon(subset.map((t) => t.setup)),
    topError: mostCommon(subset.map((t) => t.error), NONE_ERROR),
    topSentiment: mostCommon(subset.map((t) => t.sentiment), NEUTRAL_SENTIMENT),
  };
}
