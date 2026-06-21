import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditableCard, useReorder } from "@/components/EditableCard";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

type Rule = { id: string; text: string };

const STORAGE_KEY = "tradingPlan.rules";
const uid = () => Math.random().toString(36).slice(2, 10);

const rulesRepo = {
  load(): Rule[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Rule[]) : [];
    } catch {
      return [];
    }
  },
  save(rules: Rule[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  },
};

export function TradingPlanPage() {
  const [rules, setRules] = useState<Rule[]>(() => rulesRepo.load());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const reorder = useReorder(setRules);

  useEffect(() => {
    rulesRepo.save(rules);
  }, [rules]);

  const addRule = () => setRules((r) => [...r, { id: uid(), text: "" }]);
  const updateRule = (id: string, text: string) =>
    setRules((r) => r.map((i) => (i.id === id ? { ...i, text } : i)));
  const confirmDelete = () => {
    if (confirmDeleteId) setRules((r) => r.filter((i) => i.id !== confirmDeleteId));
    setConfirmDeleteId(null);
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
          {rules.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma regra adicionada.</p>
          )}
          {rules.map((rule, idx) => (
            <EditableCard
              key={rule.id}
              text={rule.text}
              prefix={
                <span className="text-sm text-muted-foreground w-6 text-right">{idx + 1}.</span>
              }
              placeholder="Escreva uma regra do seu plano..."
              canMoveUp={idx > 0}
              canMoveDown={idx < rules.length - 1}
              onChange={(text) => updateRule(rule.id, text)}
              onDelete={() => setConfirmDeleteId(rule.id)}
              onMoveUp={() => reorder(idx, -1)}
              onMoveDown={() => reorder(idx, 1)}
            />
          ))}
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
