import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Pencil, Plus, Trash2, X } from "lucide-react";
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
import { localStorageRepo, uid } from "@/lib/listRepo";
import { imageStorage } from "@/lib/imageStorage";
import { toast } from "@/hooks/use-toast";

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  image?: string; // URL or base64 data URL
};

const STORAGE_KEY = "checklist.items";
const repo = localStorageRepo<ChecklistItem>(STORAGE_KEY);

export function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>(() => repo.load());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ChecklistItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    repo.save(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setItems(arrayMove(items, oldIndex, newIndex));
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (item: ChecklistItem) => {
    setEditing(item);
    setFormOpen(true);
  };
  const handleSave = (data: Omit<ChecklistItem, "id">) => {
    if (editing) {
      setItems((prev) =>
        prev.map((i) => (i.id === editing.id ? { ...i, ...data } : i)),
      );
    } else {
      setItems((prev) => [...prev, { id: uid(), ...data }]);
    }
    setFormOpen(false);
    setEditing(null);
  };
  const confirmDelete = () => {
    if (confirmDeleteId) setItems((prev) => prev.filter((i) => i.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">CheckList</CardTitle>
          <Button size="sm" variant="outline" onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum checklist cadastrado.</p>
          )}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((item) => (
                  <ChecklistCard
                    key={item.id}
                    item={item}
                    onEdit={() => openEdit(item)}
                    onDelete={() => setConfirmDeleteId(item.id)}
                    onImageClick={() => item.image && setLightbox(item.image)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      <ChecklistFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
        initial={editing}
        onSave={handleSave}
      />

      <ConfirmDeleteDialog
        open={confirmDeleteId !== null}
        onOpenChange={(v) => { if (!v) setConfirmDeleteId(null); }}
        onConfirm={confirmDelete}
        title="Excluir checklist"
        description="Tem certeza que deseja excluir este checklist?"
      />

      <Dialog open={lightbox !== null} onOpenChange={(v) => { if (!v) setLightbox(null); }}>
        <DialogContent className="max-w-4xl p-2 bg-background">
          {lightbox && (
            <img
              src={lightbox}
              alt="Imagem do setup"
              className="w-full h-auto max-h-[80vh] object-contain rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

type CardProps = {
  item: ChecklistItem;
  onEdit: () => void;
  onDelete: () => void;
  onImageClick: () => void;
};

function ChecklistCard({ item, onEdit, onDelete, onImageClick }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

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
          <h3 className="text-sm font-semibold flex-1 min-w-0 break-words">{item.title}</h3>
          <div className="flex items-center gap-1 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
            <Button size="icon" variant="ghost" onClick={onEdit} aria-label="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Excluir">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {item.image && (
          <button
            type="button"
            onClick={onImageClick}
            onPointerDown={(e) => e.stopPropagation()}
            className="block w-full bg-muted"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full max-h-64 object-contain"
            />
          </button>
        )}
        {item.description && (
          <div className="px-3 pb-3 pt-2">
            <p className="text-sm whitespace-pre-wrap break-words text-muted-foreground">
              {item.description}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

type FormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: ChecklistItem | null;
  onSave: (data: Omit<ChecklistItem, "id">) => void;
};

function ChecklistFormDialog({ open, onOpenChange, initial, onSave }: FormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setDescription(initial?.description ?? "");
      setImage(initial?.image);
    }
  }, [open, initial]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setUploading(true);
      const ref = await imageStorage.upload(file);
      setImage(ref);
    } catch {
      toast({ title: "Erro ao carregar imagem", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const submit = () => {
    if (!title.trim()) {
      toast({ title: "Título é obrigatório", variant: "destructive" });
      return;
    }
    onSave({ title: title.trim(), description, image });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar checklist" : "Novo checklist"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cl-title">Título</Label>
            <Input
              id="cl-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Pullback"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cl-desc">Descrição</Label>
            <Textarea
              id="cl-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as regras do setup..."
              className="min-h-[140px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cl-image">Imagem (opcional)</Label>
            <Input
              id="cl-image"
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {image && (
              <div className="relative mt-2">
                <img
                  src={image}
                  alt="Pré-visualização"
                  className="w-full max-h-56 object-contain rounded-md border border-border bg-muted"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => setImage(undefined)}
                  aria-label="Remover imagem"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={uploading}>
            {initial ? "Salvar" : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
