import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Trade } from "@/types/trade";
import { formatDateBR, formatCurrency } from "@/lib/format";

const countBy = (values: string[]): Array<[string, number]> => {
  const map = new Map<string, number>();
  values.forEach((v) => { if (v) map.set(v, (map.get(v) ?? 0) + 1); });
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
};

export function exportTradesPdf(filename: string, periodLabel: string, trades: Trade[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("My Trade Lens — Relatório", 14, 16);
  doc.setFontSize(10);
  doc.text(`Período: ${periodLabel}`, 14, 24);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 30);

  const total = trades.length;
  const gains = trades.filter((t) => t.resultDollar > 0).length;
  const losses = trades.filter((t) => t.resultDollar < 0).length;
  const totalResult = trades.reduce((s, t) => s + t.resultDollar, 0);
  const assertiveness = total > 0 ? (gains / total) * 100 : 0;

  autoTable(doc, {
    startY: 36,
    head: [["Métrica", "Valor"]],
    body: [
      ["Total de trades", String(total)],
      ["Gains", String(gains)],
      ["Losses", String(losses)],
      ["Assertividade", `${assertiveness.toFixed(1)}%`],
      ["Resultado total", formatCurrency(totalResult)],
    ],
    theme: "striped",
    styles: { fontSize: 9 },
  });

  const errors = countBy(trades.map((t) => t.error).filter((e) => e && e !== "Nenhum"));
  const sentiments = countBy(trades.map((t) => t.sentiment).filter((s) => s && s !== "Neutro"));

  if (errors.length > 0) {
    autoTable(doc, {
      head: [["Erros", "Qtd"]],
      body: errors,
      theme: "grid",
      styles: { fontSize: 9 },
    });
  }
  if (sentiments.length > 0) {
    autoTable(doc, {
      head: [["Sentimentos", "Qtd"]],
      body: sentiments,
      theme: "grid",
      styles: { fontSize: 9 },
    });
  }

  autoTable(doc, {
    head: [["Data", "Ativo", "Tipo", "Setup", "Pts", "Res. $", "Mud. %"]],
    body: trades.map((t) => [
      formatDateBR(t.date),
      t.asset,
      t.type,
      t.setup,
      t.points.toString(),
      t.resultDollar.toFixed(2),
      `${t.changePercent.toFixed(2)}%`,
    ]),
    theme: "striped",
    styles: { fontSize: 8 },
    headStyles: { fillColor: [40, 40, 40] },
  });

  doc.save(filename);
}
