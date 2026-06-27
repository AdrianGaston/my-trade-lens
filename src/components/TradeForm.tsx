import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Save, RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TRENDS, type Trade } from "@/types/trade";
import { useTextList } from "@/hooks/use-list";
import { CATALOG_DEFAULTS, CATALOG_STORAGE, orderForDropdown } from "@/lib/catalogs";
import { toast } from "@/hooks/use-toast";

interface TradeFormProps {
  onSave: (trade: Omit<Trade, "id">) => void;
  onDelete?: () => void;
  editingTrade?: Trade | null;
  onCancelEdit?: () => void;
  hideTitle?: boolean;
}

const emptyForm = {
  date: undefined as Date | undefined,
  asset: "",
  type: "" as "Buy" | "Sell" | "",
  volume: "",
  setup: "",
  trend: "",
  sentiment: "Neutro",
  error: "Nenhum",
  entryPrice: "",
  exitPrice: "",
  points: "",
  resultDollar: "",
  changePercent: "",
};

export function TradeForm({ onSave, onDelete, editingTrade, onCancelEdit, hideTitle }: TradeFormProps) {
  const [form, setForm] = useState(emptyForm);

  const { items: assetsItems } = useTextList(CATALOG_STORAGE.assets, CATALOG_DEFAULTS.assets);
  const { items: setupsItems } = useTextList(CATALOG_STORAGE.setups, CATALOG_DEFAULTS.setups);
  const { items: errorsItems } = useTextList(CATALOG_STORAGE.errors, CATALOG_DEFAULTS.errors);
  const { items: sentimentsItems } = useTextList(CATALOG_STORAGE.sentiments, CATALOG_DEFAULTS.sentiments);

  const ASSETS_LIST = orderForDropdown("assets", assetsItems.map((i) => i.text));
  const SETUPS_LIST = orderForDropdown("setups", setupsItems.map((i) => i.text));
  const ERRORS_LIST = orderForDropdown("errors", errorsItems.map((i) => i.text));
  const SENTIMENTS_LIST = orderForDropdown("sentiments", sentimentsItems.map((i) => i.text));

  useEffect(() => {
    if (editingTrade) {
      setForm({
        date: new Date(editingTrade.date),
        asset: editingTrade.asset,
        type: editingTrade.type,
        volume: String(editingTrade.volume),
        setup: editingTrade.setup,
        trend: editingTrade.trend,
        sentiment: editingTrade.sentiment,
        error: editingTrade.error,
        entryPrice: editingTrade.entryPrice ? String(editingTrade.entryPrice) : "",
        exitPrice: editingTrade.exitPrice ? String(editingTrade.exitPrice) : "",
        points: String(editingTrade.points),
        resultDollar: String(editingTrade.resultDollar),
        changePercent: String(editingTrade.changePercent),
      });
    }
  }, [editingTrade]);

  const clear = () => {
    setForm(emptyForm);
    onCancelEdit?.();
  };

  const recalc = (next: typeof form) => {
    const entry = parseFloat(next.entryPrice);
    const exit = parseFloat(next.exitPrice);
    if (!Number.isFinite(entry) || !Number.isFinite(exit)) return next;
    const diff = exit - entry;
    const points = diff;
    const changePercent = exit !== 0 ? (diff / exit) * 100 : 0;
    const vol = parseFloat(next.volume) || 1;
    const signedDiff = next.type === "Sell" ? -diff : diff;
    const resultDollar = signedDiff * vol;
    const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "");
    return {
      ...next,
      points: fmt(points),
      changePercent: fmt(changePercent),
      resultDollar: fmt(resultDollar),
    };
  };

  const setEntry = (v: string) => setForm((f) => recalc({ ...f, entryPrice: v }));
  const setExit = (v: string) => setForm((f) => recalc({ ...f, exitPrice: v }));
  const setType = (v: "Buy" | "Sell") => setForm((f) => recalc({ ...f, type: v }));
  const setVolume = (v: string) => setForm((f) => recalc({ ...f, volume: v }));

  const handleSave = () => {
    if (!form.date || !form.asset || !form.type) {
      toast({ title: "Erro", description: "Preencha os campos obrigatórios (Data, Ativo, Tipo).", variant: "destructive" });
      return;
    }
    onSave({
      date: form.date.toISOString(),
      asset: form.asset,
      type: form.type as "Buy" | "Sell",
      volume: parseFloat(form.volume) || 0,
      setup: form.setup,
      trend: form.trend,
      sentiment: form.sentiment,
      error: form.error,
      entryPrice: parseFloat(form.entryPrice) || 0,
      exitPrice: parseFloat(form.exitPrice) || 0,
      points: parseFloat(form.points) || 0,
      resultDollar: parseFloat(form.resultDollar) || 0,
      changePercent: parseFloat(form.changePercent) || 0,
    });
    toast({ title: editingTrade ? "Trade atualizado!" : "Trade salvo!" });
    clear();
  };

  const field = (label: string, children: React.ReactNode) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );

  const sel = (placeholder: string, value: string, onChange: (v: string) => void, options: readonly string[]) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-secondary border-border h-9 text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-4">
      {!hideTitle && (
        <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">
          {editingTrade ? "Editar Trade" : "Novo Trade"}
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {field("Data *",
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left h-9 text-sm bg-secondary border-border", !form.date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {form.date ? format(form.date, "dd/MM/yyyy") : "Selecionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={form.date} onSelect={(d) => setForm({ ...form, date: d })} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        )}
        {field("Ativo *", sel("Selecionar", form.asset, (v) => setForm({ ...form, asset: v }), ASSETS_LIST))}
        {field("Tipo *", sel("Selecionar", form.type, (v) => setType(v as "Buy" | "Sell"), ["Buy", "Sell"]))}
        {field("Valor de entrada",
          <Input type="number" step="0.01" placeholder="0.00" value={form.entryPrice} onChange={(e) => setEntry(e.target.value)} className="bg-secondary border-border h-9 text-sm" />
        )}
        {field("Valor de saída",
          <Input type="number" step="0.01" placeholder="0.00" value={form.exitPrice} onChange={(e) => setExit(e.target.value)} className="bg-secondary border-border h-9 text-sm" />
        )}
        {field("Volume",
          <Input type="number" step="0.01" placeholder="0.00" value={form.volume} onChange={(e) => setVolume(e.target.value)} className="bg-secondary border-border h-9 text-sm" />
        )}
        {field("Pontos",
          <Input type="number" step="0.01" placeholder="0.00" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} className="bg-secondary border-border h-9 text-sm" />
        )}
        {field("Mudança %",
          <Input type="number" step="0.01" placeholder="0.00" value={form.changePercent} onChange={(e) => setForm({ ...form, changePercent: e.target.value })} className="bg-secondary border-border h-9 text-sm" />
        )}
        {field("Resultado $",
          <Input type="number" step="0.01" placeholder="0.00" value={form.resultDollar} onChange={(e) => setForm({ ...form, resultDollar: e.target.value })} className="bg-secondary border-border h-9 text-sm" />
        )}
        {field("Setup", sel("Selecionar", form.setup, (v) => setForm({ ...form, setup: v }), SETUPS_LIST))}
        {field("Tendência", sel("Selecionar", form.trend, (v) => setForm({ ...form, trend: v }), TRENDS))}
        {field("Erro", sel("Selecionar", form.error, (v) => setForm({ ...form, error: v }), ERRORS_LIST))}
        {field("Sentimento", sel("Selecionar", form.sentiment, (v) => setForm({ ...form, sentiment: v }), SENTIMENTS_LIST))}
      </div>
      <div className="flex gap-2 pt-1">
        <Button onClick={handleSave} className="gap-1.5">
          <Save className="h-3.5 w-3.5" />
          {editingTrade ? "Atualizar" : "Salvar Trade"}
        </Button>
        <Button variant="outline" onClick={clear} className="gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          Limpar
        </Button>
        {editingTrade && onDelete && (
          <Button variant="destructive" onClick={onDelete} className="gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />
            Excluir
          </Button>
        )}
      </div>
    </div>
  );
}
