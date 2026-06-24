import { Dialog, DialogContent } from "@/components/ui/dialog";

type Props = {
  src: string | null;
  alt?: string;
  onClose: () => void;
};

export function ImageLightbox({ src, alt = "Imagem", onClose }: Props) {
  return (
    <Dialog open={src !== null} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-4xl p-2 bg-background">
        {src && (
          <img
            src={src}
            alt={alt}
            className="w-full h-auto max-h-[80vh] object-contain rounded-md"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
