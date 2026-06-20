import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear, isAfter, isBefore, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, FunnelChart, Funnel, LabelList,
} from "recharts";
import type { Trade } from "@/types/trade";
import { ASSETS, SETUPS } from "@/types/trade";
import { StatsCards } from "./StatsCards";

type Period = "today" | "week" | "month" | "year" | "custom";
type PieLabelProps = {
  cx?: number | string;
  cy?: number | string;
  midAngle?: number | string;
  innerRadius?: number | string;
  outerRadius?: number | string;
  percent?: number;
};
type FunnelLabelProps = {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  payload?: { name?: string };
  value?: number | string;
};

const CHART_COLORS = [
  "hsl(142, 60%, 45%)",
  "hsl(217, 91%, 60%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)",
  "hsl(340, 75%, 55%)",
  "hsl(180, 60%, 45%)",
  "hsl(25, 95%, 53%)",
  "hsl(262, 83%, 58%)",
  "hsl(0, 72%, 55%)",
];
const CHART_TEXT = "hsl(var(--foreground))";
const CHART_MUTED = "hsl(var(--muted-foreground))";
const CHART_GRID = "hsl(var(--border))";
const PIE_MARGIN = { top: 16, right: 48, bottom: 20, left: 48 };
const FUNNEL_MARGIN = { top: 8, right: 144, bottom: 8, left: 12 };
const LEGEND_STYLE = { fontSize: 12, color: CHART_MUTED, paddingTop: 12 };
const MIN_PERCENT_LABEL = 0.08;
const RADIAN = Math.PI / 180;

const renderPiePercentLabel = ({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: PieLabelProps) => {
  if (percent < MIN_PERCENT_LABEL) return null;

  const inner = Number(innerRadius);
  const outer = Number(outerRadius);
  const radius = inner + (outer - inner) * 0.6;
  const angle = -Number(midAngle) * RADIAN;
  const x = Number(cx) + radius * Math.cos(angle);
  const y = Number(cy) + radius * Math.sin(angle);

  return (
    <text x={x} y={y} fill={CHART_TEXT} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

const wrapFunnelLabel = (text: string, maxChars = 16) => {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length <= maxChars || !currentLine) {
      currentLine = nextLine;
      return;
    }
    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 2);
};

const renderFunnelLabel = ({ x = 0, y = 0, width = 0, height = 0, payload, value }: FunnelLabelProps) => {
  const label = payload?.name ?? String(value ?? "");
  if (!label) return null;

  const lines = wrapFunnelLabel(label);
  const labelX = Number(x) + Number(width) + 12;
  const labelY = Number(y) + Number(height) / 2 - ((lines.length - 1) * 6);

  return (
    <text x={labelX} y={labelY} fill={CHART_TEXT} textAnchor="start" dominantBaseline="middle" fontSize={11}>
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={labelX} dy={index === 0 ? 0 : 12}>
          {line}
        </tspan>
      ))}
    </text>
  );
};

interface Props {
  trades: Trade[];
}

export function DashboardPage({ trades }: Props) {
  const [period, setPeriod] = useState<Period>("year");
  const [customFrom, setCustomFrom] = useState<Date>();
  const [customTo, setCustomTo] = useState<Date>();
  const [assetFilter, setAssetFilter] = useState("all");
  const [setupFilter, setSetupFilter] = useState("all");

  const filtered = useMemo(() => {
    const now = new Date();
    let from: Date | undefined;
    let to: Date | undefined = now;

    switch (period) {
      case "today": from = startOfDay(now); break;
      case "week": from = startOfWeek(now, { weekStartsOn: 1 }); break;
      case "month": from = startOfMonth(now); break;
      case "year": from = startOfYear(now); break;
      case "custom": from = customFrom; to = customTo || now; break;
    }

    return trades.filter((t) => {
      const d = parseISO(t.date);
      if (from && isBefore(d, startOfDay(from))) return false;
      if (to && isAfter(d, new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59))) return false;
      if (assetFilter !== "all" && t.asset !== assetFilter) return false;
      if (setupFilter !== "all" && t.setup !== setupFilter) return false;
      return true;
    });
  }, [trades, period, customFrom, customTo, assetFilter, setupFilter]);

  const stats = useMemo(() => {
    const positive = filtered.filter((t) => t.resultDollar > 0);
    const negative = filtered.filter((t) => t.resultDollar < 0);
    const totalResult = filtered.reduce((s, t) => s + t.resultDollar, 0);
    const uniqueDays = new Set(filtered.map((t) => t.date)).size;

    return {
      total: filtered.length,
      positive: positive.length,
      negative: negative.length,
      totalResult,
      winRate: filtered.length > 0 ? (positive.length / filtered.length) * 100 : 0,
      avgResult: filtered.length > 0 ? totalResult / filtered.length : 0,
      avgOpsPerDay: uniqueDays > 0 ? filtered.length / uniqueDays : 0,
      avgDay: uniqueDays > 0 ? totalResult / uniqueDays : 0,
      avgGain: positive.length > 0 ? positive.reduce((s, t) => s + t.resultDollar, 0) / positive.length : 0,
      avgLoss: negative.length > 0 ? negative.reduce((s, t) => s + t.resultDollar, 0) / negative.length : 0,
      maxGain: positive.length > 0 ? Math.max(...positive.map((t) => t.resultDollar)) : 0,
      maxLoss: negative.length > 0 ? Math.min(...negative.map((t) => t.resultDollar)) : 0,
    };
  }, [filtered]);

  const evolutionData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(new Date().getFullYear(), i).toLocaleString("pt-BR", { month: "short" }),
      resultado: 0,
    }));
    const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
    let acc = 0;
    sorted.forEach((t) => {
      const m = parseISO(t.date).getMonth();
      acc += t.resultDollar;
      months[m].resultado = acc;
    });
    for (let i = 1; i < 12; i++) {
      if (months[i].resultado === 0 && months[i - 1].resultado !== 0) {
        months[i].resultado = months[i - 1].resultado;
      }
    }
    return months;
  }, [filtered]);

  const countBy = (key: keyof Trade, values: readonly string[]) =>
    values.map((v) => ({ name: v, value: filtered.filter((t) => t[key] === v).length })).filter((d) => d.value > 0);

  const operationsData = useMemo(() => countBy("type", ["Buy", "Sell"]), [filtered]);
  const trendData = useMemo(() => countBy("trend", ["Favor", "Contra", "Sem Tendência"]), [filtered]);
  const setupData = useMemo(() => countBy("setup", SETUPS), [filtered]);
  const errorsData = useMemo(() =>
    countBy("error", ["Setup", "Gerenciamento", "Stop", "Foco", "Quantidade", "Hesitar", "Entrada antecipada", "Saída antecipada"]),
    [filtered]
  );
  const sentimentData = useMemo(() =>
    countBy("sentiment", ["Neutro", "Ansiedade", "Medo", "Ego", "Ganância", "Raiva", "Confiança", "Disciplina", "Impaciência"]),
    [filtered]
  );

  const sortedErrorsData = useMemo(
    () => [...errorsData].sort((a, b) => b.value - a.value).map((d, i) => ({ ...d, fill: CHART_COLORS[(i + 4) % CHART_COLORS.length] })),
    [errorsData]
  );

  const sortedSentimentData = useMemo(
    () => [...sentimentData].sort((a, b) => b.value - a.value).map((d, i) => ({ ...d, fill: CHART_COLORS[i % CHART_COLORS.length] })),
    [sentimentData]
  );

  const resultData = useMemo(() => {
    const gain = filtered.filter((t) => t.resultDollar > 0).length;
    const loss = filtered.filter((t) => t.resultDollar < 0).length;
    const zero = filtered.filter((t) => t.resultDollar === 0).length;
    return [
      { name: "Gain", value: gain },
      { name: "Loss", value: loss },
      { name: "0 x 0", value: zero },
    ].filter((d) => d.value > 0);
  }, [filtered]);

  const tooltipStyle = {
    contentStyle: { backgroundColor: "hsl(var(--card))", border: `1px solid ${CHART_GRID}`, borderRadius: 8 },
    labelStyle: { color: CHART_TEXT },
    itemStyle: { color: CHART_TEXT },
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="flex gap-1">
            {(["today", "week", "month", "year", "custom"] as Period[]).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={period === p ? "default" : "secondary"}
                onClick={() => setPeriod(p)}
              >
                {{ today: "Hoje", week: "Semana", month: "Mês", year: "Ano", custom: "Personalizado" }[p]}
              </Button>
            ))}
          </div>

          {period === "custom" && (
            <div className="flex gap-2 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn(!customFrom && "text-muted-foreground")}>
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {customFrom ? format(customFrom, "dd/MM/yyyy") : "De"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={customFrom} onSelect={setCustomFrom} className="pointer-events-auto" /></PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn(!customTo && "text-muted-foreground")}>
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {customTo ? format(customTo, "dd/MM/yyyy") : "Até"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={customTo} onSelect={setCustomTo} className="pointer-events-auto" /></PopoverContent>
              </Popover>
            </div>
          )}

          <Select value={assetFilter} onValueChange={setAssetFilter}>
            <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Ativo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Ativos</SelectItem>
              {ASSETS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={setupFilter} onValueChange={setSetupFilter}>
            <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Setup" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Setups</SelectItem>
              {SETUPS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Evolução Anual - full width */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Evolução Anual</CardTitle></CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData} margin={{ top: 12, right: 20, bottom: 8, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="month" stroke={CHART_MUTED} fontSize={12} axisLine={false} tickLine={false} tickMargin={8} />
                <YAxis stroke={CHART_MUTED} fontSize={12} axisLine={false} tickLine={false} tickMargin={8} width={64} />
              <Tooltip {...tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="resultado"
                  stroke="hsl(142, 60%, 45%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(142, 60%, 45%)", r: 4, stroke: "none" }}
                  activeDot={{ r: 5, fill: "hsl(142, 60%, 45%)", stroke: "none" }}
                  name="Resultado $"
                />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Row 1: Resultado das Operações + Operações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Resultado das Operações</CardTitle></CardHeader>
          <CardContent className="h-[300px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={PIE_MARGIN}>
                <Pie
                  data={resultData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="46%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  stroke="none"
                  labelLine={false}
                  label={renderPiePercentLabel}
                >
                  <Cell fill="hsl(142, 60%, 45%)" stroke="none" />
                  <Cell fill="hsl(0, 72%, 55%)" stroke="none" />
                  <Cell fill="hsl(215, 15%, 55%)" stroke="none" />
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={LEGEND_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Operações</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={operationsData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="name" stroke={CHART_MUTED} fontSize={12} axisLine={false} tickLine={false} tickMargin={8} />
                <YAxis stroke={CHART_MUTED} fontSize={12} width={48} axisLine={false} tickLine={false} tickMargin={8} allowDecimals={false} domain={[0, (dataMax: number) => Math.max(1, Math.ceil(dataMax))]} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Quantidade" radius={[4, 4, 0, 0]} stroke="none" barSize={56}>
                  {operationsData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Setup + Tendência */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Setup</CardTitle></CardHeader>
          <CardContent className="h-[300px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={PIE_MARGIN}>
                <Pie
                  data={setupData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="46%"
                  outerRadius={100}
                  paddingAngle={2}
                  stroke="none"
                  labelLine={false}
                  label={renderPiePercentLabel}
                >
                  {setupData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={LEGEND_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Tendência</CardTitle></CardHeader>
          <CardContent className="h-[300px] md:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={PIE_MARGIN}>
                <Pie
                  data={trendData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="46%"
                  innerRadius={56}
                  outerRadius={100}
                  paddingAngle={2}
                  stroke="none"
                  labelLine={false}
                  label={renderPiePercentLabel}
                >
                  {trendData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={LEGEND_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Erros Operacionais + Sentimentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Erros Operacionais</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedErrorsData} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
                <XAxis type="number" stroke={CHART_MUTED} fontSize={12} axisLine={false} tickLine={false} tickMargin={8} allowDecimals={false} domain={[0, (dataMax: number) => Math.max(1, Math.ceil(dataMax))]} />
                <YAxis dataKey="name" type="category" stroke={CHART_MUTED} fontSize={12} width={110} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Quantidade" radius={[0, 4, 4, 0]} stroke="none" barSize={20}>
                  {sortedErrorsData.map((d, i) => <Cell key={i} fill={d.fill} stroke="none" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Sentimentos</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedSentimentData} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
                <XAxis type="number" stroke={CHART_MUTED} fontSize={12} axisLine={false} tickLine={false} tickMargin={8} />
                <YAxis dataKey="name" type="category" stroke={CHART_MUTED} fontSize={12} width={110} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Quantidade" radius={[0, 4, 4, 0]} stroke="none" barSize={20}>
                  {sortedSentimentData.map((d, i) => <Cell key={i} fill={d.fill} stroke="none" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
