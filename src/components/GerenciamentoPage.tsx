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
import { MediaCard } from "@/components/MediaCard";
import { ImageLightbox } from "@/components/ImageLightbox";
import { ImageUploadField } from "@/components/ImageUploadField";
import { SortableList } from "@/components/EditableCard";
import { Plus, Trash2 } from "lucide-react";
import { uid } from "@/lib/listRepo";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { toast } from "@/hooks/use-toast";

type GerenciamentoItem = {
  id: string;
  title: string;
  bullets: string[];
  image?: string;
};

const STORAGE_KEY = "gerenciamento.items";

export function GerenciamentoPage() {
  const [items, setItems] = usePersistentState<GerenciamentoItem[]>(STORAGE_KEY, []);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GerenciamentoItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (item: GerenciamentoItem) => { setEditing(item); setFormOpen(true); };

  const handleSave = (data: Omit<GerenciamentoItem, "id">) => {
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
          <CardTitle className="text-base">Gerenciamento</CardTitle>
          <Button size="sm" variant="outline" onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum gerenciamento cadastrado.</p>
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
                  {item.bullets.length > 0 && (
                    <ul className="space-y-1">
                      {item.bullets.map((b, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex gap-2 break-words">
                          <span aria-hidden className="text-foreground">•</span>
                          <span className="flex-1 whitespace-pre-wrap">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </MediaCard>
              ))}
            </div>
          </SortableList>
        </CardContent>
      </Card>

      <GerenciamentoFormDialog
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setEditing(null); }}
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

      <ImageLightbox src={lightbox} alt="Imagem do gerenciamento" onClose={() => setLightbox(null)} />
    </>
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
          <ImageUploadField
            id="gr-image"
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
