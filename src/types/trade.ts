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
export const SETUPS = ["Abertura", "Pullback", "Barra Elefante", "Gap & Go", "Região", "MM200", "Bull 180/Bear 180"] as const;
export const TRENDS = ["Favor", "Contra", "Sem Tendência"] as const;
export const SENTIMENTS = ["Neutro", "Ansiedade", "Dúvida", "Esperança", "Euforia", "Ganância", "Medo", "Raiva"] as const;
export const ERRORS = ["Nenhum", "Emocional", "Foco", "Gerenciamento", "Hesitação", "Quantidade", "Setup", "Stop"] as const;
