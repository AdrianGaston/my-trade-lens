import { ReactNode, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Pencil, Trash2, X } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type EditableCardProps = {
  id: string;
  text: string;
  prefix?: ReactNode;
  leading?: ReactNode;
  placeholder?: string;
  multiline?: boolean;
  onChange: (text: string) => void;
  onDelete: () => void;
  textClassName?: string;
};

export function EditableCard({
  id,
  text,
  prefix,
  leading,
  placeholder = "Escreva aqui...",
  multiline = false,
  onChange,
  onDelete,
  textClassName,
}: EditableCardProps) {
  const [editing, setEditing] = useState(text === "");
  const [draft, setDraft] = useState(text);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: editing });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

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
    <div ref={setNodeRef} style={style}>
      <Card className="p-3 flex items-center gap-2">
        {prefix}
        {leading}
        <div
          className={`flex-1 min-w-0 ${editing ? "" : "cursor-grab active:cursor-grabbing"}`}
          {...(editing ? {} : { ...attributes, ...listeners })}
        >
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
              className={`text-sm whitespace-pre-wrap break-words select-none ${
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
      </Card>
    </div>
  );
}

type SortableListProps<T extends { id: string }> = {
  items: T[];
  onReorder: (items: T[]) => void;
  children: ReactNode;
};

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  children,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
