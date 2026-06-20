import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

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

export function NotesPage() {
  const [goals, setGoals] = useState<TextItem[]>(() => load(KEYS.goals, []));
  const [tasks, setTasks] = useState<TaskItem[]>(() => load(KEYS.tasks, []));
  const [notes, setNotes] = useState<TextItem[]>(() => load(KEYS.notes, []));

  useEffect(() => localStorage.setItem(KEYS.goals, JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem(KEYS.tasks, JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem(KEYS.notes, JSON.stringify(notes)), [notes]);

  const addGoal = () => setGoals((g) => [...g, { id: uid(), text: "" }]);
  const updateGoal = (id: string, text: string) =>
    setGoals((g) => g.map((i) => (i.id === id ? { ...i, text } : i)));
  const removeGoal = (id: string) => setGoals((g) => g.filter((i) => i.id !== id));

  const addTask = () => setTasks((t) => [...t, { id: uid(), text: "", done: false }]);
  const updateTask = (id: string, patch: Partial<TaskItem>) =>
    setTasks((t) => t.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const removeTask = (id: string) => setTasks((t) => t.filter((i) => i.id !== id));

  const addNote = () => setNotes((n) => [...n, { id: uid(), text: "" }]);
  const updateNote = (id: string, text: string) =>
    setNotes((n) => n.map((i) => (i.id === id ? { ...i, text } : i)));
  const removeNote = (id: string) => setNotes((n) => n.filter((i) => i.id !== id));

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
          {goals.map((g) => (
            <div key={g.id} className="flex items-center gap-2">
              <Input
                value={g.text}
                placeholder="Escreva um objetivo..."
                onChange={(e) => updateGoal(g.id, e.target.value)}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeGoal(g.id)}
                aria-label="Remover"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-2">
              <Checkbox
                checked={t.done}
                onCheckedChange={(v) => updateTask(t.id, { done: Boolean(v) })}
              />
              <Input
                value={t.text}
                placeholder="Descreva uma tarefa..."
                onChange={(e) => updateTask(t.id, { text: e.target.value })}
                className={t.done ? "line-through text-muted-foreground" : ""}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeTask(t.id)}
                aria-label="Remover"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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
          {notes.map((n) => (
            <div key={n.id} className="flex items-start gap-2">
              <Textarea
                value={n.text}
                placeholder="Escreva uma anotação..."
                onChange={(e) => updateNote(n.id, e.target.value)}
                className="min-h-[60px]"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeNote(n.id)}
                aria-label="Remover"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
