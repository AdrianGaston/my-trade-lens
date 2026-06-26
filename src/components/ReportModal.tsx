import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfDay } from "date-fns";
import { tradesToCsv, downloadCsv } from "@/lib/export/csv";
import { exportTradesPdf } from "@/lib/export/pdf";
import type { Trade } from "@/types/trade";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trades: Trade[];
}

type RangePreset = "month" | "custom";

export function ReportModal({ open, onOpenChange, trades }: Props) {
  const [preset, setPreset] = useState<RangePreset>("month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [format_, setFormat] = useState<"pdf" | "csv">("pdf");

  useEffect(() => {
    if (!open) return;
    const now = new Date();
    setFrom(format(startOfMonth(now), "yyyy-MM-dd"));
    setTo(format(now, "yyyy-MM-dd"));
    setPreset("month");
    setFormat("pdf");
  }, [open]);

  const resolvedRange = () => {
    if (preset === "month") {
      const now = new Date();
      return { from: startOfMonth(now), to: endOfDay(now) };
    }
    return {
      from: from ? new Date(`${from}T00:00:00`) : undefined,
      to: to ? endOfDay(new Date(`${to}T00:00:00`)) : undefined,
    };
  };

  const handleExport = () => {
    const { from: fromD, to: toD } = resolvedRange();
    const filtered = trades.filter((t) => {
      const d = new Date(t.date);
      if (fromD && d < fromD) return false;
      if (toD && d > toD) return false;
      return true;
    });

    if (filtered.length === 0) {
      toast({ title: "Sem dados", description: "Nenhum trade no período selecionado.", variant: "destructive" });
      return;
    }

    const label = fromD && toD ? `${format(fromD, "dd/MM/yyyy")} – ${format(toD, "dd/MM/yyyy")}` : "Todos";
    const base = `tradelens-${format(new Date(), "yyyyMMdd-HHmm")}`;

    if (format_ === "csv") {
      downloadCsv(`${base}.csv`, tradesToCsv(filtered));
    } else {
      exportTradesPdf(`${base}.pdf`, label, filtered);
    }
    toast({ title: "Relatório gerado" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Gerar Relatório</DialogTitle></DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Formato</Label>
            <Select value={format_} onValueChange={(v) => setFormat(v as "pdf" | "csv")}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">Excel / CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Período</Label>
            <Select value={preset} onValueChange={(v) => setPreset(v as RangePreset)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mês atual</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {preset === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">De</Label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Até</Label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9" />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleExport}>Exportar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
