import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { EditableCard, SortableList } from "@/components/EditableCard";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { uid } from "@/lib/listRepo";

type TextItem = { id: string; text: string };
type TaskItem = { id: string; text: string; done: boolean };

const KEYS = {
  goals: "notes.weeklyGoals",
  tasks: "notes.pendingTasks",
  notes: "notes.generalNotes",
} as const;

type DeleteTarget = { kind: "goal" | "task" | "note"; id: string } | null;

export function NotesPage() {
  const [goals, setGoals] = usePersistentState<TextItem[]>(KEYS.goals, []);
  const [tasks, setTasks] = usePersistentState<TaskItem[]>(KEYS.tasks, []);
  const [notes, setNotes] = usePersistentState<TextItem[]>(KEYS.notes, []);
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget>(null);

  const addGoal = () => setGoals((g) => [...g, { id: uid(), text: "" }]);
  const updateGoal = (id: string, text: string) =>
    setGoals((g) => g.map((i) => (i.id === id ? { ...i, text } : i)));

  const addTask = () => setTasks((t) => [...t, { id: uid(), text: "", done: false }]);
  const updateTask = (id: string, patch: Partial<TaskItem>) =>
    setTasks((t) => t.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const addNote = () => setNotes((n) => [...n, { id: uid(), text: "" }]);
  const updateNote = (id: string, text: string) =>
    setNotes((n) => n.map((i) => (i.id === id ? { ...i, text } : i)));

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const { kind, id } = pendingDelete;
    if (kind === "goal") setGoals((g) => g.filter((i) => i.id !== id));
    if (kind === "task") setTasks((t) => t.filter((i) => i.id !== id));
    if (kind === "note") setNotes((n) => n.filter((i) => i.id !== id));
    setPendingDelete(null);
  };

  const deleteDescription = () => {
    if (!pendingDelete) return undefined;
    if (pendingDelete.kind === "note") return "Tem certeza que deseja excluir esta anotação?";
    if (pendingDelete.kind === "task") return "Tem certeza que deseja excluir esta tarefa?";
    return "Tem certeza que deseja excluir este objetivo?";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Objetivos semanais</CardTitle>
          <Button size="sm" variant="outline" onClick={addGoal} className="gap-1.5">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {goals.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum objetivo adicionado.</p>
          )}
          <SortableList items={goals} onReorder={setGoals}>
            {goals.map((g) => (
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
          {tasks.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma tarefa adicionada.</p>
          )}
          <SortableList items={tasks} onReorder={setTasks}>
            {tasks.map((t) => (
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
          {notes.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma anotação adicionada.</p>
          )}
          <SortableList items={notes} onReorder={setNotes}>
            {notes.map((n) => (
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
