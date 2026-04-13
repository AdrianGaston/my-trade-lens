import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Trade } from "@/types/trade";

interface TradeTableProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
}

export function TradeTable({ trades, onEdit, onDelete }: TradeTableProps) {
  if (trades.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
        Nenhum trade registrado ainda.
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {["Data", "Ativo", "Tipo", "Vol", "Setup", "Tend.", "Sent.", "Erro", "Pts", "Res. $", "Mud. %", "Ações"].map((h) => (
                <TableHead key={h} className="text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((t) => (
              <TableRow key={t.id} className="border-border text-sm">
                <TableCell className="font-mono text-xs whitespace-nowrap">{format(new Date(t.date), "dd/MM/yy")}</TableCell>
                <TableCell className="font-medium">{t.asset}</TableCell>
                <TableCell>
                  <span className={t.type === "Buy" ? "text-profit" : "text-loss"}>{t.type}</span>
                </TableCell>
                <TableCell className="font-mono">{t.volume}</TableCell>
                <TableCell className="text-xs">{t.setup}</TableCell>
                <TableCell className="text-xs">{t.trend}</TableCell>
                <TableCell className="text-xs">{t.sentiment}</TableCell>
                <TableCell className="text-xs">{t.error}</TableCell>
                <TableCell className="font-mono">{t.points}</TableCell>
                <TableCell className={`font-mono font-medium ${t.resultDollar >= 0 ? "text-profit" : "text-loss"}`}>
                  ${t.resultDollar.toFixed(2)}
                </TableCell>
                <TableCell className={`font-mono ${t.changePercent >= 0 ? "text-profit" : "text-loss"}`}>
                  {t.changePercent.toFixed(2)}%
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(t)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
