import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditableCard, SortableList } from "@/components/EditableCard";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { useTextList } from "@/hooks/use-list";

interface ListManagerProps {
  title: string;
  storageKey: string;
  initial?: string[];
  placeholder?: string;
  emptyText?: string;
  addLabel?: string;
  numbered?: boolean;
  multiline?: boolean;
  deleteDescription?: string;
}

export function ListManager({
  title,
  storageKey,
  initial = [],
  placeholder = "Escreva aqui...",
  emptyText = "Nenhum item adicionado.",
  addLabel = "Adicionar",
  numbered = false,
  multiline = false,
  deleteDescription,
}: ListManagerProps) {
  const { items, setItems, add, update, remove } = useTextList(storageKey, initial);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (pendingDelete) remove(pendingDelete);
    setPendingDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{title}</CardTitle>
          <Button size="sm" variant="outline" onClick={() => add()} className="gap-1.5">
            <Plus className="h-4 w-4" /> {addLabel}
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">{emptyText}</p>
          )}
          <SortableList items={items} onReorder={setItems}>
            {items.map((item, idx) => (
              <EditableCard
                key={item.id}
                id={item.id}
                text={item.text}
                placeholder={placeholder}
                multiline={multiline}
                prefix={
                  numbered ? (
                    <span className="text-sm text-muted-foreground w-6 text-right">
                      {idx + 1}.
                    </span>
                  ) : undefined
                }
                onChange={(text) => update(item.id, text)}
                onDelete={() => setPendingDelete(item.id)}
              />
            ))}
          </SortableList>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(v) => { if (!v) setPendingDelete(null); }}
        onConfirm={confirmDelete}
        description={deleteDescription}
      />
    </>
  );
}
