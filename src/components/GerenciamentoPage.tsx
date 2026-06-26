import { useCallback, useEffect, useState } from "react";
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
import { managementRepo, type ManagementRow } from "@/lib/repos/managementRepo";
import { toast } from "@/hooks/use-toast";

type GerenciamentoItem = {
  id: string;
  title: string;
  bullets: string[];
  image?: string;
};

const toItem = (r: ManagementRow): GerenciamentoItem => ({
  id: r.id,
  title: r.title,
  bullets: r.items ?? [],
  image: r.image_url ?? undefined,
});

export function GerenciamentoPage() {
  const [items, setItems] = useState<GerenciamentoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GerenciamentoItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await managementRepo.list();
      setItems(rows.map(toItem));
    } catch (e) {
      toast({ title: "Erro ao carregar", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (item: GerenciamentoItem) => { setEditing(item); setFormOpen(true); };

  const handleSave = async (data: Omit<GerenciamentoItem, "id">) => {
    try {
      if (editing) {
        await managementRepo.update(editing.id, {
          title: data.title,
          items: data.bullets,
          image_url: data.image ?? null,
        });
        setItems((prev) => prev.map((i) => (i.id === editing.id ? { ...i, ...data } : i)));
      } else {
        const row = await managementRepo.create(
          { title: data.title, items: data.bullets, image_url: data.image ?? null },
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
      await managementRepo.remove(id);
    } catch (e) {
      toast({ title: "Erro ao excluir", description: String(e), variant: "destructive" });
      void load();
    }
  };

  const handleReorder = (next: GerenciamentoItem[]) => {
    setItems(next);
    void managementRepo.reorder(next.map((i) => i.id));
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
          {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
          {!loading && items.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum gerenciamento cadastrado.</p>
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
            folder="management"
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
