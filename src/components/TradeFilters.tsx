import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { useTextList } from "@/hooks/use-list";
import { CATALOG_DEFAULTS, CATALOG_STORAGE } from "@/lib/catalogs";
import { defaultFilters, type TradeFilters } from "@/lib/filterTrades";

interface Props {
  value: TradeFilters;
  onChange: (next: TradeFilters) => void;
}

const PERIODS: { value: TradeFilters["period"]; label: string }[] = [
  { value: "month", label: "Mês atual" },
  { value: "week", label: "Semana atual" },
  { value: "last7", label: "Últimos 7 dias" },
  { value: "last30", label: "Últimos 30 dias" },
  { value: "custom", label: "Personalizado" },
];

export function TradeFilters({ value, onChange }: Props) {
  const { items: assets } = useTextList(CATALOG_STORAGE.assets, CATALOG_DEFAULTS.assets);
  const { items: setups } = useTextList(CATALOG_STORAGE.setups, CATALOG_DEFAULTS.setups);

  const set = (patch: Partial<TradeFilters>) => onChange({ ...value, ...patch });

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-3 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Ativo</Label>
          <Select value={value.asset} onValueChange={(v) => set({ asset: v })}>
            <SelectTrigger className="h-9 w-[140px] text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {assets.map((a) => <SelectItem key={a.id} value={a.text}>{a.text}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Tipo</Label>
          <Select value={value.type} onValueChange={(v) => set({ type: v as TradeFilters["type"] })}>
            <SelectTrigger className="h-9 w-[120px] text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Buy">Buy</SelectItem>
              <SelectItem value="Sell">Sell</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Setup</Label>
          <Select value={value.setup} onValueChange={(v) => set({ setup: v })}>
            <SelectTrigger className="h-9 w-[150px] text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {setups.map((s) => <SelectItem key={s.id} value={s.text}>{s.text}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Resultado</Label>
          <Select value={value.result} onValueChange={(v) => set({ result: v as TradeFilters["result"] })}>
            <SelectTrigger className="h-9 w-[120px] text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="gain">Gain</SelectItem>
              <SelectItem value="loss">Loss</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Período</Label>
          <Select value={value.period} onValueChange={(v) => set({ period: v as TradeFilters["period"] })}>
            <SelectTrigger className="h-9 w-[160px] text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {value.period === "custom" && (
          <>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">De</Label>
              <Input
                type="date"
                value={value.customFrom ?? ""}
                onChange={(e) => set({ customFrom: e.target.value })}
                className="h-9 text-sm w-[150px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Até</Label>
              <Input
                type="date"
                value={value.customTo ?? ""}
                onChange={(e) => set({ customTo: e.target.value })}
                className="h-9 text-sm w-[150px]"
              />
            </div>
          </>
        )}

        <Button variant="outline" size="sm" onClick={() => onChange(defaultFilters)} className="gap-1.5 ml-auto">
          <X className="h-3.5 w-3.5" />
          Limpar filtros
        </Button>
      </CardContent>
    </Card>
  );
}
