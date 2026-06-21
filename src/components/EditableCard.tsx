import { ReactNode, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDown, ArrowUp, Check, Pencil, Trash2, X } from "lucide-react";

type EditableCardProps = {
  text: string;
  prefix?: ReactNode;
  leading?: ReactNode;
  placeholder?: string;
  multiline?: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (text: string) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  textClassName?: string;
};

export function EditableCard({
  text,
  prefix,
  leading,
  placeholder = "Escreva aqui...",
  multiline = false,
  canMoveUp,
  canMoveDown,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  textClassName,
}: EditableCardProps) {
  const [editing, setEditing] = useState(text === "");
  const [draft, setDraft] = useState(text);

  const startEdit = () => {
    setDraft(text);
    setEditing(true);
  };
  const save = () => {
    onChange(draft);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(text);
    setEditing(false);
  };

  return (
    <Card className="group relative p-3 flex items-center gap-2">
      {prefix}
      {leading}
      <div className="flex-1 min-w-0">
        {editing ? (
          multiline ? (
            <textarea
              autoFocus
              value={draft}
              placeholder={placeholder}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full min-h-[60px] bg-transparent border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          ) : (
            <Input
              autoFocus
              value={draft}
              placeholder={placeholder}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
            />
          )
        ) : (
          <p
            className={`text-sm whitespace-pre-wrap break-words ${
              text ? "" : "text-muted-foreground italic"
            } ${textClassName ?? ""}`}
          >
            {text || placeholder}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        {editing ? (
          <>
            <Button size="icon" variant="ghost" onClick={save} aria-label="Salvar">
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={cancel} aria-label="Cancelar">
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button size="icon" variant="ghost" onClick={startEdit} aria-label="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Remover">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex-col gap-1 hidden group-hover:flex">
        <Button
          size="icon"
          variant="outline"
          className="h-6 w-6"
          disabled={!canMoveUp}
          onClick={onMoveUp}
          aria-label="Mover para cima"
        >
          <ArrowUp className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-6 w-6"
          disabled={!canMoveDown}
          onClick={onMoveDown}
          aria-label="Mover para baixo"
        >
          <ArrowDown className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}

export function useReorder<T>(setItems: React.Dispatch<React.SetStateAction<T[]>>) {
  return (index: number, direction: -1 | 1) => {
    setItems((items) => {
      const target = index + direction;
      if (target < 0 || target >= items.length) return items;
      const next = [...items];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
}
