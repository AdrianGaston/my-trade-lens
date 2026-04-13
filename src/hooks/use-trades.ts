import { useState, useEffect, useCallback } from "react";
import type { Trade } from "@/types/trade";

const STORAGE_KEY = "trade-journal-trades";

function loadTrades(): Trade[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTrades(trades: Trade[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
}

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>(loadTrades);

  useEffect(() => {
    saveTrades(trades);
  }, [trades]);

  const addTrade = useCallback((trade: Omit<Trade, "id">) => {
    const newTrade: Trade = { ...trade, id: crypto.randomUUID() };
    setTrades((prev) => [newTrade, ...prev]);
    return newTrade;
  }, []);

  const updateTrade = useCallback((id: string, trade: Omit<Trade, "id">) => {
    setTrades((prev) => prev.map((t) => (t.id === id ? { ...trade, id } : t)));
  }, []);

  const deleteTrade = useCallback((id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const sortedTrades = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const stats = {
    total: trades.length,
    positive: trades.filter((t) => t.resultDollar > 0).length,
    negative: trades.filter((t) => t.resultDollar < 0).length,
    totalResult: trades.reduce((sum, t) => sum + t.resultDollar, 0),
    winRate: trades.length > 0 ? (trades.filter((t) => t.resultDollar > 0).length / trades.length) * 100 : 0,
  };

  return { trades: sortedTrades, stats, addTrade, updateTrade, deleteTrade };
}
