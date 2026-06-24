import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  id: string;
  title: string;
  image?: string;
  onEdit: () => void;
  onDelete: () => void;
  onImageClick?: () => void;
  children?: ReactNode;
};

/**
 * Draggable card with title, action icons, optional image, and free-form body.
 * Shared between Checklist and Gerenciamento.
 */
export function MediaCard({
  id,
  title,
  image,
  onEdit,
  onDelete,
  onImageClick,
  children,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="overflow-hidden">
        <div
          className="flex items-start justify-between gap-2 p-3 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <h3 className="text-sm font-semibold flex-1 min-w-0 break-words">{title}</h3>
          <div className="flex items-center gap-1 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
            <Button size="icon" variant="ghost" onClick={onEdit} aria-label="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Excluir">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {image && (
          <button
            type="button"
            onClick={onImageClick}
            onPointerDown={(e) => e.stopPropagation()}
            className="block w-full bg-muted"
          >
            <img src={image} alt={title} className="w-full max-h-64 object-contain" />
          </button>
        )}
        {children && <div className="px-3 pb-3 pt-2">{children}</div>}
      </Card>
    </div>
  );
}
