import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditableCard, SortableList } from "@/components/EditableCard";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { tradingPlanRepo, type TradingPlanRow } from "@/lib/repos/tradingPlanRepo";
import { toast } from "@/hooks/use-toast";

type Rule = { id: string; text: string };

const toRule = (r: TradingPlanRow): Rule => ({ id: r.id, text: r.content });

export function TradingPlanPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setRules((await tradingPlanRepo.list()).map(toRule));
    } catch (e) {
      toast({ title: "Erro ao carregar", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const addRule = async () => {
    try {
      const row = await tradingPlanRepo.create("", rules.length);
      setRules((r) => [...r, toRule(row)]);
    } catch (e) {
      toast({ title: "Erro ao adicionar", description: String(e), variant: "destructive" });
    }
  };

  const updateRule = (id: string, text: string) => {
    setRules((r) => r.map((i) => (i.id === id ? { ...i, text } : i)));
    void tradingPlanRepo.update(id, text);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setRules((r) => r.filter((i) => i.id !== id));
    try { await tradingPlanRepo.remove(id); } catch (e) {
      toast({ title: "Erro ao excluir", description: String(e), variant: "destructive" });
      void load();
    }
  };

  const handleReorder = (next: Rule[]) => {
    setRules(next);
    void tradingPlanRepo.reorder(next.map((i) => i.id));
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Trading Plan</CardTitle>
          <Button size="sm" variant="outline" onClick={addRule} className="gap-1.5">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
          {!loading && rules.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma regra adicionada.</p>
          )}
          <SortableList items={rules} onReorder={handleReorder}>
            {rules.map((rule, idx) => (
              <EditableCard
                key={rule.id}
                id={rule.id}
                text={rule.text}
                prefix={
                  <span className="text-sm text-muted-foreground w-6 text-right">{idx + 1}.</span>
                }
                placeholder="Escreva uma regra do seu plano..."
                onChange={(text) => updateRule(rule.id, text)}
                onDelete={() => setConfirmDeleteId(rule.id)}
              />
            ))}
          </SortableList>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={confirmDeleteId !== null}
        onOpenChange={(v) => { if (!v) setConfirmDeleteId(null); }}
        onConfirm={confirmDelete}
      />
    </>
  );
}
