export const formatCurrency = (n: number) =>
  `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatPercent = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

export const formatDateBR = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
};
