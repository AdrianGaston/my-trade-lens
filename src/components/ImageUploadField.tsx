import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { imageStorage } from "@/lib/imageStorage";
import { toast } from "@/hooks/use-toast";

type Props = {
  id?: string;
  label?: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  onUploadingChange?: (uploading: boolean) => void;
};

export function ImageUploadField({
  id = "image-upload",
  label = "Imagem (opcional)",
  value,
  onChange,
  onUploadingChange,
}: Props) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setUploading(true);
      onUploadingChange?.(true);
      const ref = await imageStorage.upload(file);
      onChange(ref);
    } catch {
      toast({ title: "Erro ao carregar imagem", variant: "destructive" });
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {value && (
        <div className="relative mt-2">
          <img
            src={value}
            alt="Pré-visualização"
            className="w-full max-h-56 object-contain rounded-md border border-border bg-muted"
          />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={() => onChange(undefined)}
            aria-label="Remover imagem"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
