import { useCallback, useEffect, useState } from "react";
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
import { checklistRepo, type ChecklistRow } from "@/lib/repos/checklistRepo";
import { toast } from "@/hooks/use-toast";

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  image?: string;
};

const toItem = (r: ChecklistRow): ChecklistItem => ({
  id: r.id,
  title: r.title,
  description: r.description ?? "",
  image: r.image_url ?? undefined,
});

export function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ChecklistItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await checklistRepo.list();
      setItems(rows.map(toItem));
    } catch (e) {
      toast({ title: "Erro ao carregar checklist", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (item: ChecklistItem) => { setEditing(item); setFormOpen(true); };

  const handleSave = async (data: Omit<ChecklistItem, "id">) => {
    try {
      if (editing) {
        await checklistRepo.update(editing.id, {
          title: data.title,
          description: data.description,
          image_url: data.image ?? null,
        });
        setItems((prev) => prev.map((i) => (i.id === editing.id ? { ...i, ...data } : i)));
      } else {
        const row = await checklistRepo.create(
          { title: data.title, description: data.description, image_url: data.image ?? null },
          items.length,
        );
        setItems((prev) => [...prev, toItem(row)]);
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      toast({ title: "Erro ao salvar", description: String(e), variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await checklistRepo.remove(id);
    } catch (e) {
      toast({ title: "Erro ao excluir", description: String(e), variant: "destructive" });
      void load();
    }
  };

  const handleReorder = (next: ChecklistItem[]) => {
    setItems(next);
    void checklistRepo.reorder(next.map((i) => i.id));
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
          {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
          {!loading && items.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum checklist cadastrado.</p>
          )}
          <SortableList items={items} onReorder={handleReorder}>
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
            folder="checklists"
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
