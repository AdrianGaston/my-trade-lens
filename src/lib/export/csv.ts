import type { Trade } from "@/types/trade";
import { formatDateBR } from "@/lib/format";

const HEADERS = [
  "Data", "Ativo", "Tipo", "Volume", "Setup", "Tendência",
  "Sentimento", "Erro", "Pontos", "Resultado $", "Mudança %",
];

const escape = (v: string | number): string => {
  const s = String(v ?? "");
  if (s.includes(";") || s.includes("\"") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export function tradesToCsv(trades: Trade[]): string {
  const lines = [HEADERS.join(";")];
  trades.forEach((t) => {
    lines.push([
      formatDateBR(t.date),
      t.asset,
      t.type,
      t.volume,
      t.setup,
      t.trend,
      t.sentiment,
      t.error,
      t.points,
      t.resultDollar.toFixed(2),
      t.changePercent.toFixed(2),
    ].map(escape).join(";"));
  });
  return "\uFEFF" + lines.join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
