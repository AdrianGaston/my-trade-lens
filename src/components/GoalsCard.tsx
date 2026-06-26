import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Pencil, Save, X } from "lucide-react";
import { startOfDay, startOfWeek, startOfMonth, endOfDay } from "date-fns";
import { goalsRepo, emptyGoals, type Goals } from "@/lib/repos/goalsRepo";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { Trade } from "@/types/trade";
import { toast } from "@/hooks/use-toast";

interface Props {
  trades: Trade[];
}

const sumResult = (trades: Trade[], from: Date, to: Date) =>
  trades.filter((t) => {
    const d = new Date(t.date);
    return d >= from && d <= to;
  }).reduce((s, t) => s + t.resultDollar, 0);

const gainColor = (value: number, goal: number | null): string => {
  if (!goal || goal <= 0) return "bg-primary";
  const ratio = value / goal;
  if (ratio >= 1) return "bg-green-500";
  if (ratio >= 0.8) return "bg-yellow-500";
  return "bg-destructive";
};

const lossColor = (value: number, max: number | null): string => {
  if (!max || max <= 0) return "bg-primary";
  const loss = Math.abs(Math.min(0, value));
  const ratio = loss / max;
  if (ratio >= 1) return "bg-destructive";
  if (ratio >= 0.8) return "bg-yellow-500";
  return "bg-green-500";
};

export function GoalsCard({ trades }: Props) {
  const [goals, setGoals] = useState<Goals>(emptyGoals);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Goals>(emptyGoals);

  useEffect(() => {
    void goalsRepo.get().then((g) => { setGoals(g); setDraft(g); });
  }, []);

  const now = new Date();
  const today = useMemo(() => sumResult(trades, startOfDay(now), endOfDay(now)), [trades]);
  const week = useMemo(() => sumResult(trades, startOfWeek(now, { weekStartsOn: 1 }), endOfDay(now)), [trades]);
  const month = useMemo(() => sumResult(trades, startOfMonth(now), endOfDay(now)), [trades]);

  const totalTrades = trades.length;
  const gains = trades.filter((t) => t.resultDollar > 0).length;
  const assertiveness = totalTrades > 0 ? (gains / totalTrades) * 100 : 0;

  const handleSave = async () => {
    try {
      const saved = await goalsRepo.save(draft);
      setGoals(saved);
      setEditing(false);
      toast({ title: "Metas atualizadas" });
    } catch (e) {
      toast({ title: "Erro ao salvar metas", description: String(e), variant: "destructive" });
    }
  };

  const numInput = (label: string, key: keyof Goals) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        value={(draft[key] as number | null) ?? ""}
        onChange={(e) => setDraft({ ...draft, [key]: e.target.value === "" ? null : Number(e.target.value) })}
        className="h-9"
      />
    </div>
  );

  const Bar = ({ label, value, goal, kind }: { label: string; value: number; goal: number | null; kind: "gain" | "loss" | "pct" }) => {
    let pct = 0;
    let color = "bg-primary";
    let valueText = "";
    if (kind === "gain") {
      pct = goal && goal > 0 ? Math.max(0, Math.min(100, (value / goal) * 100)) : 0;
      color = gainColor(value, goal);
      valueText = `${formatCurrency(value)} / ${goal ? formatCurrency(goal) : "—"}`;
    } else if (kind === "loss") {
      const loss = Math.abs(Math.min(0, value));
      pct = goal && goal > 0 ? Math.max(0, Math.min(100, (loss / goal) * 100)) : 0;
      color = lossColor(value, goal);
      valueText = `${formatCurrency(loss)} / ${goal ? formatCurrency(goal) : "—"}`;
    } else {
      pct = goal && goal > 0 ? Math.max(0, Math.min(100, (value / goal) * 100)) : 0;
      color = gainColor(value, goal);
      valueText = `${formatPercent(value)} / ${goal ? formatPercent(goal) : "—"}`;
    }
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-mono">{valueText}</span>
        </div>
        <Progress value={pct} indicatorClassName={color} className="h-2" />
      </div>
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Metas</CardTitle>
        {editing ? (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={handleSave} className="gap-1.5"><Save className="h-3.5 w-3.5" /> Salvar</Button>
            <Button size="sm" variant="ghost" onClick={() => { setDraft(goals); setEditing(false); }}><X className="h-4 w-4" /></Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="gap-1.5"><Pencil className="h-3.5 w-3.5" /> Editar</Button>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {numInput("Meta diária ($)", "daily_result")}
            {numInput("Meta semanal ($)", "weekly_result")}
            {numInput("Meta mensal ($)", "monthly_result")}
            {numInput("Assertividade (%)", "assertiveness")}
            {numInput("Loss máx. diário ($)", "max_daily_loss")}
            {numInput("Máx. trades por dia", "max_daily_trades")}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Bar label="Resultado diário" value={today} goal={goals.daily_result} kind="gain" />
            <Bar label="Resultado semanal" value={week} goal={goals.weekly_result} kind="gain" />
            <Bar label="Resultado mensal" value={month} goal={goals.monthly_result} kind="gain" />
            <Bar label="Assertividade" value={assertiveness} goal={goals.assertiveness} kind="pct" />
            <Bar label="Loss máx. diário" value={today} goal={goals.max_daily_loss} kind="loss" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
