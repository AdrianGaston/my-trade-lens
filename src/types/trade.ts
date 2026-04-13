export interface Trade {
  id: string;
  date: string;
  asset: string;
  type: "Buy" | "Sell";
  volume: number;
  setup: string;
  trend: string;
  sentiment: string;
  error: string;
  points: number;
  resultDollar: number;
  changePercent: number;
}

export const ASSETS = ["UsaInd", "UsaTec", "Usa500", "UsaRus", "MinDol", "HKInd"] as const;
export const SETUPS = ["Abertura", "Pullback", "Barra Elefante", "Gap & Go", "Região", "MM20", "Bull 180/Bear 180"] as const;
export const TRENDS = ["Favor", "Contra", "Sem Tendência"] as const;
export const SENTIMENTS = ["Neutro", "Ansiedade", "Medo", "Ego", "Ganância", "Raiva", "Confiança", "Disciplina", "Impaciência"] as const;
export const ERRORS = ["Nenhum", "Setup", "Gerenciamento", "Stop", "Foco", "Quantidade", "Hesitar", "Entrada antecipada", "Saída antecipada"] as const;
