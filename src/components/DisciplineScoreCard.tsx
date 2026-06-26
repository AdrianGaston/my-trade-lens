import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { computeDisciplineScore, scoreColor } from "@/lib/disciplineScore";
import { goalsRepo } from "@/lib/repos/goalsRepo";
import type { Trade } from "@/types/trade";

interface Props { trades: Trade[]; }

export function DisciplineScoreCard({ trades }: Props) {
  const [maxDaily, setMaxDaily] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void goalsRepo.get().then((g) => setMaxDaily(g.max_daily_trades));
  }, []);

  const result = useMemo(() => computeDisciplineScore(trades, maxDaily), [trades, maxDaily]);

  return (
    <>
      <Card className="bg-card border-border cursor-pointer hover:bg-card/80 transition-colors" onClick={() => setOpen(true)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Score de Disciplina (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-bold">{result.score}</span>
            <span className="text-sm text-muted-foreground">{result.label}</span>
          </div>
          <Progress value={result.score} indicatorClassName={scoreColor(result.score)} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">Clique para ver o detalhamento.</p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Detalhamento — {result.label}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {result.breakdown.map((b) => (
              <div key={b.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{b.label}</span>
                <span className={`font-mono ${b.delta > 0 ? "text-profit" : b.delta < 0 ? "text-loss" : ""}`}>
                  {b.delta > 0 ? "+" : ""}{b.delta}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
              <span className="font-medium">Score final</span>
              <span className="font-bold">{result.score} / 100</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
