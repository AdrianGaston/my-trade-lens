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
import { MediaCard } from "@/components/MediaCard";
import { ImageLightbox } from "@/components/ImageLightbox";
import { ImageUploadField } from "@/components/ImageUploadField";
import { SortableList } from "@/components/EditableCard";
import { Plus } from "lucide-react";
import { uid } from "@/lib/listRepo";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { toast } from "@/hooks/use-toast";

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  image?: string;
};

const STORAGE_KEY = "checklist.items";

export function ChecklistPage() {
  const [items, setItems] = usePersistentState<ChecklistItem[]>(STORAGE_KEY, []);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ChecklistItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (item: ChecklistItem) => { setEditing(item); setFormOpen(true); };

  const handleSave = (data: Omit<ChecklistItem, "id">) => {
    if (editing) {
      setItems((prev) => prev.map((i) => (i.id === editing.id ? { ...i, ...data } : i)));
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
          <SortableList items={items} onReorder={setItems}>
            <div className="grid gap-3 md:grid-cols-2">
              {items.map((item) => (
                <MediaCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  image={item.image}
                  onEdit={() => openEdit(item)}
                  onDelete={() => setConfirmDeleteId(item.id)}
                  onImageClick={() => item.image && setLightbox(item.image)}
                >
                  {item.description && (
                    <p className="text-sm whitespace-pre-wrap break-words text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </MediaCard>
              ))}
            </div>
          </SortableList>
        </CardContent>
      </Card>

      <ChecklistFormDialog
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setEditing(null); }}
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

      <ImageLightbox src={lightbox} alt="Imagem do setup" onClose={() => setLightbox(null)} />
    </>
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
          <ImageUploadField
            id="cl-image"
            value={image}
            onChange={setImage}
            onUploadingChange={setUploading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={uploading}>
            {initial ? "Salvar" : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
