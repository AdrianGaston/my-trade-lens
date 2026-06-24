import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type GerenciamentoItem = {
  id: string;
  title: string;
  bullets: string[];
  image?: string;
};

const STORAGE_KEY = "gerenciamento.items";
const repo = localStorageRepo<GerenciamentoItem>(STORAGE_KEY);

export function GerenciamentoPage() {
  const [items, setItems] = useState<GerenciamentoItem[]>(() => repo.load());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GerenciamentoItem | null>(null);
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
  const openEdit = (item: GerenciamentoItem) => {
    setEditing(item);
    setFormOpen(true);
  };
  const handleSave = (data: Omit<GerenciamentoItem, "id">) => {
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
    if (confirmDeleteId)
      setItems((prev) => prev.filter((i) => i.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Gerenciamento</CardTitle>
          <Button size="sm" variant="outline" onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum gerenciamento cadastrado.</p>
          )}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((item) => (
                  <GerenciamentoCard
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

      <GerenciamentoFormDialog
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
        title="Excluir gerenciamento"
        description="Tem certeza que deseja excluir este item?"
      />

      <Dialog open={lightbox !== null} onOpenChange={(v) => { if (!v) setLightbox(null); }}>
        <DialogContent className="max-w-4xl p-2 bg-background">
          {lightbox && (
            <img
              src={lightbox}
              alt="Imagem do gerenciamento"
              className="w-full h-auto max-h-[80vh] object-contain rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

type CardProps = {
  item: GerenciamentoItem;
  onEdit: () => void;
  onDelete: () => void;
  onImageClick: () => void;
};

function GerenciamentoCard({ item, onEdit, onDelete, onImageClick }: CardProps) {
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
        {item.bullets.length > 0 && (
          <div className="px-3 pb-3 pt-2">
            <ul className="space-y-1">
              {item.bullets.map((b, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex gap-2 break-words">
                  <span aria-hidden className="text-foreground">•</span>
                  <span className="flex-1 whitespace-pre-wrap">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}

type FormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: GerenciamentoItem | null;
  onSave: (data: Omit<GerenciamentoItem, "id">) => void;
};

function GerenciamentoFormDialog({ open, onOpenChange, initial, onSave }: FormProps) {
  const [title, setTitle] = useState("");
  const [bullets, setBullets] = useState<string[]>([""]);
  const [image, setImage] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setBullets(initial?.bullets?.length ? [...initial.bullets] : [""]);
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

  const updateBullet = (idx: number, value: string) =>
    setBullets((prev) => prev.map((b, i) => (i === idx ? value : b)));
  const addBullet = () => setBullets((prev) => [...prev, ""]);
  const removeBullet = (idx: number) =>
    setBullets((prev) => (prev.length === 1 ? [""] : prev.filter((_, i) => i !== idx)));

  const submit = () => {
    if (!title.trim()) {
      toast({ title: "Título é obrigatório", variant: "destructive" });
      return;
    }
    const cleaned = bullets.map((b) => b.trim()).filter(Boolean);
    onSave({ title: title.trim(), bullets: cleaned, image });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar gerenciamento" : "Novo gerenciamento"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="gr-title">Título</Label>
            <Input
              id="gr-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Lote Leve"
            />
          </div>
          <div className="grid gap-2">
            <Label>Itens</Label>
            <div className="space-y-2">
              {bullets.map((b, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span aria-hidden className="text-muted-foreground">•</span>
                  <Input
                    value={b}
                    onChange={(e) => updateBullet(idx, e.target.value)}
                    placeholder="Regra ou condição"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeBullet(idx)}
                    aria-label="Remover item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={addBullet} className="gap-1.5">
                <Plus className="h-4 w-4" /> Adicionar item
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gr-image">Imagem (opcional)</Label>
            <Input
              id="gr-image"
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
