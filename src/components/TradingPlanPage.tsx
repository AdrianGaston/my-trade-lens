import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Rule = { id: string; text: string };

const STORAGE_KEY = "tradingPlan.rules";
const uid = () => Math.random().toString(36).slice(2, 10);

// Repositório abstrato — facilita troca futura por Supabase
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
            <div key={rule.id} className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-6 text-right">{idx + 1}.</span>
              <Input
                value={rule.text}
                placeholder="Escreva uma regra do seu plano..."
                onChange={(e) => updateRule(rule.id, e.target.value)}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setConfirmDeleteId(rule.id)}
                aria-label="Remover"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={(v) => { if (!v) setConfirmDeleteId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir item</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
