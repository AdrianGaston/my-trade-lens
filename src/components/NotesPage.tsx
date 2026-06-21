import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { EditableCard, useReorder } from "@/components/EditableCard";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

type TextItem = { id: string; text: string };
type TaskItem = { id: string; text: string; done: boolean };

const KEYS = {
  goals: "notes.weeklyGoals",
  tasks: "notes.pendingTasks",
  notes: "notes.generalNotes",
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);

type DeleteTarget = { kind: "goal" | "task" | "note"; id: string } | null;

export function NotesPage() {
  const [goals, setGoals] = useState<TextItem[]>(() => load(KEYS.goals, []));
  const [tasks, setTasks] = useState<TaskItem[]>(() => load(KEYS.tasks, []));
  const [notes, setNotes] = useState<TextItem[]>(() => load(KEYS.notes, []));
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget>(null);

  const reorderGoals = useReorder(setGoals);
  const reorderTasks = useReorder(setTasks);
  const reorderNotes = useReorder(setNotes);

  useEffect(() => localStorage.setItem(KEYS.goals, JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem(KEYS.tasks, JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem(KEYS.notes, JSON.stringify(notes)), [notes]);

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

  const descriptionFor = (kind: DeleteTarget extends infer T ? T : never) => {
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
          {goals.map((g, idx) => (
            <EditableCard
              key={g.id}
              text={g.text}
              placeholder="Escreva um objetivo..."
              canMoveUp={idx > 0}
              canMoveDown={idx < goals.length - 1}
              onChange={(text) => updateGoal(g.id, text)}
              onDelete={() => setPendingDelete({ kind: "goal", id: g.id })}
              onMoveUp={() => reorderGoals(idx, -1)}
              onMoveDown={() => reorderGoals(idx, 1)}
            />
          ))}
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
          {tasks.map((t, idx) => (
            <EditableCard
              key={t.id}
              text={t.text}
              placeholder="Descreva uma tarefa..."
              leading={
                <Checkbox
                  checked={t.done}
                  onCheckedChange={(v) => updateTask(t.id, { done: Boolean(v) })}
                />
              }
              textClassName={t.done ? "line-through text-muted-foreground" : ""}
              canMoveUp={idx > 0}
              canMoveDown={idx < tasks.length - 1}
              onChange={(text) => updateTask(t.id, { text })}
              onDelete={() => setPendingDelete({ kind: "task", id: t.id })}
              onMoveUp={() => reorderTasks(idx, -1)}
              onMoveDown={() => reorderTasks(idx, 1)}
            />
          ))}
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
          {notes.map((n, idx) => (
            <EditableCard
              key={n.id}
              text={n.text}
              placeholder="Escreva uma anotação..."
              multiline
              canMoveUp={idx > 0}
              canMoveDown={idx < notes.length - 1}
              onChange={(text) => updateNote(n.id, text)}
              onDelete={() => setPendingDelete({ kind: "note", id: n.id })}
              onMoveUp={() => reorderNotes(idx, -1)}
              onMoveDown={() => reorderNotes(idx, 1)}
            />
          ))}
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(v) => { if (!v) setPendingDelete(null); }}
        onConfirm={confirmDelete}
        description={descriptionFor(pendingDelete)}
      />
    </div>
  );
}
