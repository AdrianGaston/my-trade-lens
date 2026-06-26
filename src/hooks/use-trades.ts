import { useCallback, useEffect, useMemo, useState } from "react";
import type { Trade } from "@/types/trade";
import { tradesRepo } from "@/lib/repos/tradesRepo";
import { toast } from "@/hooks/use-toast";

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tradesRepo.list();
      setTrades(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar trades");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addTrade = useCallback(async (trade: Omit<Trade, "id">) => {
    try {
      const created = await tradesRepo.create(trade);
      setTrades((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      toast({ title: "Erro ao salvar trade", description: String(e), variant: "destructive" });
      throw e;
    }
  }, []);

  const updateTrade = useCallback(async (id: string, trade: Omit<Trade, "id">) => {
    setTrades((prev) => prev.map((t) => (t.id === id ? { ...trade, id } : t)));
    try {
      await tradesRepo.update(id, trade);
    } catch (e) {
      toast({ title: "Erro ao atualizar trade", description: String(e), variant: "destructive" });
    }
  }, []);

  const deleteTrade = useCallback(async (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
    try {
      await tradesRepo.remove(id);
    } catch (e) {
      toast({ title: "Erro ao excluir trade", description: String(e), variant: "destructive" });
    }
  }, []);

  const sortedTrades = useMemo(
    () => [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [trades],
  );

  const stats = useMemo(
    () => ({
      total: trades.length,
      positive: trades.filter((t) => t.resultDollar > 0).length,
      negative: trades.filter((t) => t.resultDollar < 0).length,
      totalResult: trades.reduce((sum, t) => sum + t.resultDollar, 0),
      winRate:
        trades.length > 0
          ? (trades.filter((t) => t.resultDollar > 0).length / trades.length) * 100
          : 0,
    }),
    [trades],
  );

  return { trades: sortedTrades, stats, loading, error, addTrade, updateTrade, deleteTrade, reload: load };
}
