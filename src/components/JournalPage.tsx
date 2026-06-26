import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { journalRepo, type JournalEntry } from "@/lib/repos/journalRepo";
import { dailySummaryRepo } from "@/lib/repos/dailySummaryRepo";
import { toast } from "@/hooks/use-toast";

const MOODS = [
  { value: "great", emoji: "😄", label: "Ótimo" },
  { value: "good", emoji: "🙂", label: "Bom" },
  { value: "neutral", emoji: "😐", label: "Neutro" },
  { value: "bad", emoji: "🙁", label: "Ruim" },
  { value: "awful", emoji: "😫", label: "Péssimo" },
];

const todayISO = () => new Date().toISOString().slice(0, 10);
const emptyDraft = () => ({ date: todayISO(), title: "", content: "", mood: "neutral" });

export function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft());
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    void journalRepo.list()
      .then(setEntries)
      .catch((e) => toast({ title: "Erro ao carregar", description: String(e), variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const startCreate = () => {
    setDraft(emptyDraft());
    setCreating(true);
    setEditing(null);
  };

  const startEdit = (e: JournalEntry) => {
    setDraft({ date: e.date, title: e.title ?? "", content: e.content, mood: e.mood ?? "neutral" });
    setEditing(e.id);
    setCreating(false);
  };

  const cancel = () => {
    setCreating(false);
    setEditing(null);
    setDraft(emptyDraft());
  };

  const save = async () => {
    if (!draft.content.trim()) {
      toast({ title: "Conteúdo obrigatório", variant: "destructive" });
      return;
    }
    try {
      const summary = await dailySummaryRepo.getByDate(draft.date).catch(() => null);
      const payload = {
        date: draft.date,
        title: draft.title || null,
        content: draft.content,
        mood: draft.mood,
        daily_summary_id: summary?.id ?? null,
        order: editing ? (entries.find((e) => e.id === editing)?.order ?? 0) : entries.length,
      };
      if (editing) {
        await journalRepo.update(editing, payload);
        setEntries((prev) => prev.map((e) => (e.id === editing ? { ...e, ...payload } : e)));
        toast({ title: "Atualizado" });
      } else {
        const created = await journalRepo.create(payload);
        setEntries((prev) => [created, ...prev]);
        toast({ title: "Registro adicionado" });
      }
      cancel();
    } catch (e) {
      toast({ title: "Erro ao salvar", description: String(e), variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete;
    setPendingDelete(null);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try { await journalRepo.remove(id); } catch (e) {
      toast({ title: "Erro ao excluir", description: String(e), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Diário de Bordo</CardTitle>
          {!creating && !editing && (
            <Button size="sm" onClick={startCreate} className="gap-1.5">
              <Plus className="h-4 w-4" /> Nova entrada
            </Button>
          )}
        </CardHeader>
        {(creating || editing) && (
          <CardContent className="space-y-3 border-t border-border pt-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Data</Label>
                <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Título (opcional)</Label>
                <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="h-9" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Humor</Label>
              <div className="flex gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setDraft({ ...draft, mood: m.value })}
                    className={`text-2xl p-2 rounded-md border transition-colors ${draft.mood === m.value ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"}`}
                    aria-label={m.label}
                    title={m.label}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Reflexão</Label>
              <Textarea
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                rows={5}
                placeholder="Como foi o dia? O que aprendeu?"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={save} className="gap-1.5"><Save className="h-4 w-4" /> Salvar</Button>
              <Button variant="outline" onClick={cancel}>Cancelar</Button>
            </div>
          </CardContent>
        )}
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem registros ainda.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => {
            const moodEmoji = MOODS.find((m) => m.value === e.mood)?.emoji ?? "";
            return (
              <Card key={e.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{moodEmoji}</span>
                        <span className="text-sm font-medium">
                          {format(new Date(`${e.date}T00:00:00`), "PPP", { locale: ptBR })}
                        </span>
                        {e.daily_summary_id && (
                          <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            vinculado ao resumo
                          </span>
                        )}
                      </div>
                      {e.title && <p className="font-medium mt-1">{e.title}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(e)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setPendingDelete(e.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{e.content}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(v) => { if (!v) setPendingDelete(null); }}
        onConfirm={confirmDelete}
        description="Tem certeza que deseja excluir esta entrada do diário?"
      />
    </div>
  );
}
