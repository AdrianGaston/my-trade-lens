import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { EditableCard, SortableList } from "@/components/EditableCard";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { notesRepo, type NoteRow, type NoteSection } from "@/lib/repos/notesRepo";
import { toast } from "@/hooks/use-toast";

type TextItem = { id: string; text: string };
type TaskItem = { id: string; text: string; done: boolean };

type DeleteTarget = { kind: "goal" | "task" | "note"; id: string } | null;

function useNoteSection<T extends { id: string }>(
  section: NoteSection,
  mapIn: (r: NoteRow) => T,
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setItems((await notesRepo.list(section)).map(mapIn));
    } catch (e) {
      toast({ title: "Erro ao carregar", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [section, mapIn]);

  useEffect(() => { void load(); }, [load]);

  return { items, setItems, loading, reload: load };
}

export function NotesPage() {
  const goalsState = useNoteSection<TextItem>("goals", (r) => ({ id: r.id, text: r.content }));
  const tasksState = useNoteSection<TaskItem>("tasks", (r) => ({ id: r.id, text: r.content, done: r.completed }));
  const notesState = useNoteSection<TextItem>("notes", (r) => ({ id: r.id, text: r.content }));
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget>(null);

  const addGoal = async () => {
    const row = await notesRepo.create("goals", goalsState.items.length);
    goalsState.setItems((g) => [...g, { id: row.id, text: row.content }]);
  };
  const updateGoal = (id: string, text: string) => {
    goalsState.setItems((g) => g.map((i) => (i.id === id ? { ...i, text } : i)));
    void notesRepo.update(id, { content: text });
  };

  const addTask = async () => {
    const row = await notesRepo.create("tasks", tasksState.items.length);
    tasksState.setItems((t) => [...t, { id: row.id, text: row.content, done: row.completed }]);
  };
  const updateTask = (id: string, patch: Partial<TaskItem>) => {
    tasksState.setItems((t) => t.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    const dbPatch: { content?: string; completed?: boolean } = {};
    if (patch.text !== undefined) dbPatch.content = patch.text;
    if (patch.done !== undefined) dbPatch.completed = patch.done;
    void notesRepo.update(id, dbPatch);
  };

  const addNote = async () => {
    const row = await notesRepo.create("notes", notesState.items.length);
    notesState.setItems((n) => [...n, { id: row.id, text: row.content }]);
  };
  const updateNote = (id: string, text: string) => {
    notesState.setItems((n) => n.map((i) => (i.id === id ? { ...i, text } : i)));
    void notesRepo.update(id, { content: text });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { kind, id } = pendingDelete;
    setPendingDelete(null);
    if (kind === "goal") goalsState.setItems((g) => g.filter((i) => i.id !== id));
    if (kind === "task") tasksState.setItems((t) => t.filter((i) => i.id !== id));
    if (kind === "note") notesState.setItems((n) => n.filter((i) => i.id !== id));
    try { await notesRepo.remove(id); } catch (e) {
      toast({ title: "Erro ao excluir", description: String(e), variant: "destructive" });
    }
  };

  const deleteDescription = () => {
    if (!pendingDelete) return undefined;
    if (pendingDelete.kind === "goal") return "Tem certeza que deseja excluir este objetivo?";
    if (pendingDelete.kind === "task") return "Tem certeza que deseja excluir esta tarefa?";
    return "Tem certeza que deseja excluir esta anotação?";
  };

  const reorder = (section: NoteSection) => (next: Array<{ id: string }>) => {
    void notesRepo.reorder(next.map((i) => i.id));
    if (section === "goals") goalsState.setItems(next as TextItem[]);
    if (section === "tasks") tasksState.setItems(next as TaskItem[]);
    if (section === "notes") notesState.setItems(next as TextItem[]);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Objetivos semanais</CardTitle>
          <Button size="sm" variant="outline" onClick={addGoal} className="gap-1.5">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {goalsState.items.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum objetivo adicionado.</p>
          )}
          <SortableList items={goalsState.items} onReorder={reorder("goals")}>
            {goalsState.items.map((g) => (
              <EditableCard
                key={g.id}
                id={g.id}
                text={g.text}
                placeholder="Escreva um objetivo..."
                onChange={(text) => updateGoal(g.id, text)}
                onDelete={() => setPendingDelete({ kind: "goal", id: g.id })}
              />
            ))}
          </SortableList>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Tarefas pendentes</CardTitle>
          <Button size="sm" variant="outline" onClick={addTask} className="gap-1.5">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {tasksState.items.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma tarefa adicionada.</p>
          )}
          <SortableList items={tasksState.items} onReorder={reorder("tasks")}>
            {tasksState.items.map((t) => (
              <EditableCard
                key={t.id}
                id={t.id}
                text={t.text}
                placeholder="Descreva uma tarefa..."
                leading={
                  <Checkbox
                    checked={t.done}
                    onCheckedChange={(v) => updateTask(t.id, { done: Boolean(v) })}
                  />
                }
                textClassName={t.done ? "line-through text-muted-foreground" : ""}
                onChange={(text) => updateTask(t.id, { text })}
                onDelete={() => setPendingDelete({ kind: "task", id: t.id })}
              />
            ))}
          </SortableList>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Anotações</CardTitle>
          <Button size="sm" variant="outline" onClick={addNote} className="gap-1.5">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {notesState.items.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma anotação adicionada.</p>
          )}
          <SortableList items={notesState.items} onReorder={reorder("notes")}>
            {notesState.items.map((n) => (
              <EditableCard
                key={n.id}
                id={n.id}
                text={n.text}
                placeholder="Escreva uma anotação..."
                multiline
                onChange={(text) => updateNote(n.id, text)}
                onDelete={() => setPendingDelete({ kind: "note", id: n.id })}
              />
            ))}
          </SortableList>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(v) => { if (!v) setPendingDelete(null); }}
        onConfirm={confirmDelete}
        description={deleteDescription()}
      />
    </div>
  );
}
