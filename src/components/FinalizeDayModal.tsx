import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { computeDayStats, todayISO, type DayStats } from "@/lib/dayStats";
import { dailySummaryRepo } from "@/lib/repos/dailySummaryRepo";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { Trade } from "@/types/trade";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trades: Trade[];
}

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export function FinalizeDayModal({ open, onOpenChange, trades }: Props) {
  const [stats, setStats] = useState<DayStats | null>(null);
  const [observation, setObservation] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const today = todayISO();
    setStats(computeDayStats(trades, today));
    void dailySummaryRepo.getByDate(today).then((row) => {
      setObservation(row?.observation ?? "");
    });
  }, [open, trades]);

  const handleConfirm = async () => {
    if (!stats) return;
    try {
      setSaving(true);
      await dailySummaryRepo.upsert(stats, observation);
      toast({ title: "Dia finalizado", description: "Resumo salvo com sucesso." });
      onOpenChange(false);
    } catch (e) {
      toast({ title: "Erro ao salvar", description: String(e), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Resumo do Dia</DialogTitle>
        </DialogHeader>

        {stats && (
          <div className="space-y-2">
            <Row label="Total de trades" value={stats.totalTrades} />
            <Row label="Resultado total" value={<span className={stats.totalResult >= 0 ? "text-profit" : "text-loss"}>{formatCurrency(stats.totalResult)}</span>} />
            <Row label="Mudança % total" value={formatPercent(stats.totalChangePct, 2)} />
            <Row label="Pontos totais" value={stats.totalPoints.toFixed(2)} />
            <Row label="Gains / Losses" value={`${stats.gains} / ${stats.losses}`} />
            <Row label="Assertividade" value={formatPercent(stats.assertiveness)} />
            <Row label="Setup mais usado" value={stats.topSetup ?? "—"} />
            <Row label="Erro mais cometido" value={stats.topError ?? "—"} />
            <Row label="Sentimento predominante" value={stats.topSentiment ?? "—"} />

            <div className="space-y-1 pt-2">
              <Label className="text-xs text-muted-foreground">Observação</Label>
              <Textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Como foi o seu dia operacional?"
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={saving || !stats}>
            Confirmar e Finalizar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
