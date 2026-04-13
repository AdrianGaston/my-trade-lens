import { TrendingUp, TrendingDown, BarChart3, DollarSign, Target, Activity, CalendarDays, ArrowUpCircle, ArrowDownCircle, ChevronsUp, ChevronsDown, Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Stats {
  total: number;
  positive: number;
  negative: number;
  totalResult: number;
  winRate: number;
  avgResult?: number;
  avgOpsPerDay?: number;
  avgDay?: number;
  avgGain?: number;
  avgLoss?: number;
  maxGain?: number;
  maxLoss?: number;
}

function fmt(v: number) {
  return `$${v.toFixed(2)}`;
}

export function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Total de Trades", value: stats.total, icon: BarChart3, color: "text-foreground" },
    { label: "Trades Positivos", value: stats.positive, icon: TrendingUp, color: "text-profit" },
    { label: "Trades Negativos", value: stats.negative, icon: TrendingDown, color: "text-loss" },
    { label: "Resultado Total", value: fmt(stats.totalResult), icon: DollarSign, color: stats.totalResult >= 0 ? "text-profit" : "text-loss" },
    { label: "Win Rate", value: `${stats.winRate.toFixed(1)}%`, icon: Target, color: stats.winRate >= 50 ? "text-profit" : "text-warn" },
  ];

  const extraCards = stats.avgResult !== undefined ? [
    { label: "Média de Res. $", value: fmt(stats.avgResult!), icon: Calculator, color: stats.avgResult! >= 0 ? "text-profit" : "text-loss" },
    { label: "Média Ops/Dia", value: stats.avgOpsPerDay!.toFixed(1), icon: CalendarDays, color: "text-foreground" },
    { label: "Média do Dia", value: fmt(stats.avgDay!), icon: Activity, color: stats.avgDay! >= 0 ? "text-profit" : "text-loss" },
    { label: "Gain Médio", value: fmt(stats.avgGain!), icon: ArrowUpCircle, color: "text-profit" },
    { label: "Loss Médio", value: fmt(stats.avgLoss!), icon: ArrowDownCircle, color: "text-loss" },
    { label: "Máximo Gain", value: fmt(stats.maxGain!), icon: ChevronsUp, color: "text-profit" },
    { label: "Máximo Loss", value: fmt(stats.maxLoss!), icon: ChevronsDown, color: "text-loss" },
  ] : [];

  const allCards = [...cards, ...extraCards];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {allCards.map((c) => (
        <Card key={c.label} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{c.label}</span>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </div>
            <p className={`text-xl font-mono font-bold ${c.color}`}>{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
