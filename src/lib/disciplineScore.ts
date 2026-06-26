import { subDays, startOfDay } from "date-fns";
import type { Trade } from "@/types/trade";

const NEGATIVE_SENTIMENTS = ["Ansiedade", "Medo", "Ganância", "Raiva", "Euforia"];
const NONE_ERROR = "Nenhum";
const NEUTRAL_SENTIMENT = "Neutro";

export interface DisciplineBreakdown {
  label: string;
  delta: number;
}

export interface DisciplineResult {
  score: number; // 0-100
  label: string;
  breakdown: DisciplineBreakdown[];
}

const labelFor = (score: number): string => {
  if (score <= 20) return "Iniciante";
  if (score <= 40) return "Em desenvolvimento";
  if (score <= 70) return "Consistente";
  if (score <= 90) return "Disciplinado";
  return "Exemplar";
};

export function computeDisciplineScore(
  trades: Trade[],
  maxDailyTrades: number | null,
): DisciplineResult {
  const since = startOfDay(subDays(new Date(), 30));
  const subset = trades.filter((t) => new Date(t.date) >= since);

  const cleanTrades = subset.filter((t) => t.error === NONE_ERROR).length;
  const errorTrades = subset.filter((t) => t.error && t.error !== NONE_ERROR).length;
  const neutralSent = subset.filter((t) => t.sentiment === NEUTRAL_SENTIMENT).length;
  const negativeSent = subset.filter((t) => NEGATIVE_SENTIMENTS.includes(t.sentiment)).length;

  let daysOverLimit = 0;
  if (maxDailyTrades && maxDailyTrades > 0) {
    const perDay = new Map<string, number>();
    subset.forEach((t) => {
      const k = t.date.slice(0, 10);
      perDay.set(k, (perDay.get(k) ?? 0) + 1);
    });
    perDay.forEach((count) => {
      if (count > maxDailyTrades) daysOverLimit += 1;
    });
  }

  const breakdown: DisciplineBreakdown[] = [
    { label: `Trades sem erro (+2 cada)`, delta: cleanTrades * 2 },
    { label: `Sentimento Neutro (+2 cada)`, delta: neutralSent * 2 },
    { label: `Trades com erro (-3 cada)`, delta: -errorTrades * 3 },
    { label: `Sentimento negativo (-2 cada)`, delta: -negativeSent * 2 },
    { label: `Dias acima do limite de trades (-5 cada)`, delta: -daysOverLimit * 5 },
  ];

  const sum = breakdown.reduce((s, b) => s + b.delta, 0);
  const score = Math.max(0, Math.min(100, Math.round(50 + sum)));

  return { score, label: labelFor(score), breakdown };
}

export function scoreColor(score: number): string {
  if (score <= 40) return "bg-destructive";
  if (score <= 70) return "bg-yellow-500";
  return "bg-green-500";
}
