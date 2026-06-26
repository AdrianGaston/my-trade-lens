import type { Trade } from "@/types/trade";

export interface Insight {
  id: string;
  title: string;
  description: string;
}

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const tallyMax = <K extends string>(entries: Array<[K, number]>): [K, number] | null => {
  if (entries.length === 0) return null;
  return entries.reduce((best, e) => (e[1] > best[1] ? e : best));
};

export function buildInsights(trades: Trade[]): Insight[] {
  const insights: Insight[] = [];
  if (trades.length === 0) return insights;

  // Dia da semana com mais losses
  const lossByDow = new Map<number, number>();
  trades.filter((t) => t.resultDollar < 0).forEach((t) => {
    const dow = new Date(t.date).getDay();
    lossByDow.set(dow, (lossByDow.get(dow) ?? 0) + 1);
  });
  const topLossDay = tallyMax(Array.from(lossByDow.entries()));
  if (topLossDay && topLossDay[1] > 0) {
    insights.push({
      id: "loss-weekday",
      title: "Dia com mais perdas",
      description: `${WEEKDAYS[topLossDay[0]]} concentra ${topLossDay[1]} loss(es) no período.`,
    });
  }

  // Setup com menor assertividade (mínimo 3 trades)
  const bySetup = new Map<string, { total: number; gain: number }>();
  trades.forEach((t) => {
    if (!t.setup) return;
    const e = bySetup.get(t.setup) ?? { total: 0, gain: 0 };
    e.total += 1;
    if (t.resultDollar > 0) e.gain += 1;
    bySetup.set(t.setup, e);
  });
  let worstSetup: { name: string; rate: number; total: number } | null = null;
  bySetup.forEach((v, name) => {
    if (v.total < 3) return;
    const rate = (v.gain / v.total) * 100;
    if (!worstSetup || rate < worstSetup.rate) worstSetup = { name, rate, total: v.total };
  });
  if (worstSetup) {
    insights.push({
      id: "worst-setup",
      title: "Setup com menor assertividade",
      description: `${worstSetup.name}: ${worstSetup.rate.toFixed(0)}% de acerto em ${worstSetup.total} trades.`,
    });
  }

  // Sentimento predominante em dias de loss
  const sentLoss = new Map<string, number>();
  trades.filter((t) => t.resultDollar < 0 && t.sentiment).forEach((t) => {
    sentLoss.set(t.sentiment, (sentLoss.get(t.sentiment) ?? 0) + 1);
  });
  const topSentLoss = tallyMax(Array.from(sentLoss.entries()));
  if (topSentLoss) {
    insights.push({
      id: "loss-sentiment",
      title: "Sentimento predominante em perdas",
      description: `"${topSentLoss[0]}" aparece em ${topSentLoss[1]} trade(s) de loss.`,
    });
  }

  // Ativo com pior desempenho
  const byAsset = new Map<string, number>();
  trades.forEach((t) => {
    if (!t.asset) return;
    byAsset.set(t.asset, (byAsset.get(t.asset) ?? 0) + t.resultDollar);
  });
  let worstAsset: [string, number] | null = null;
  byAsset.forEach((v, k) => {
    if (!worstAsset || v < worstAsset[1]) worstAsset = [k, v];
  });
  if (worstAsset && worstAsset[1] < 0) {
    insights.push({
      id: "worst-asset",
      title: "Ativo com pior desempenho",
      description: `${worstAsset[0]} acumula ${worstAsset[1].toFixed(2)} no período.`,
    });
  }

  // Sequência de losses consecutivos hoje
  const today = new Date().toISOString().slice(0, 10);
  const todayTrades = trades
    .filter((t) => t.date.slice(0, 10) === today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let streak = 0;
  for (let i = todayTrades.length - 1; i >= 0; i--) {
    if (todayTrades[i].resultDollar < 0) streak += 1;
    else break;
  }
  if (streak >= 2) {
    insights.push({
      id: "loss-streak",
      title: "Sequência de losses hoje",
      description: `Você teve ${streak} losses consecutivos. Considere pausar.`,
    });
  }

  return insights;
}
