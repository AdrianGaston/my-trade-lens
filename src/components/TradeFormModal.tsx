import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TradeForm } from "@/components/TradeForm";
import type { Trade } from "@/types/trade";

interface TradeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (trade: Omit<Trade, "id">) => void;
  editingTrade?: Trade | null;
  onDelete?: () => void;
  onCancelEdit?: () => void;
}

export function TradeFormModal({ open, onOpenChange, onSave, editingTrade, onDelete, onCancelEdit }: TradeFormModalProps) {
  const handleSave = (trade: Omit<Trade, "id">) => {
    onSave(trade);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancelEdit?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleCancel(); else onOpenChange(v); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingTrade ? "Editar Trade" : "Novo Trade"}</DialogTitle>
        </DialogHeader>
        <TradeForm
          onSave={handleSave}
          editingTrade={editingTrade}
          onDelete={() => { onDelete?.(); onOpenChange(false); }}
          onCancelEdit={handleCancel}
          hideTitle
        />
      </DialogContent>
    </Dialog>
  );
}
