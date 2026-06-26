import { supabase } from "@/lib/supabase";

export interface Goals {
  id?: string;
  daily_result: number | null;
  weekly_result: number | null;
  monthly_result: number | null;
  assertiveness: number | null;
  max_daily_loss: number | null;
  max_daily_trades: number | null;
}

export const emptyGoals: Goals = {
  daily_result: null,
  weekly_result: null,
  monthly_result: null,
  assertiveness: null,
  max_daily_loss: null,
  max_daily_trades: null,
};

export const goalsRepo = {
  async get(): Promise<Goals> {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data as Goals) ?? { ...emptyGoals };
  },
  async save(goals: Goals): Promise<Goals> {
    if (goals.id) {
      const { data, error } = await supabase
        .from("goals")
        .update({
          daily_result: goals.daily_result,
          weekly_result: goals.weekly_result,
          monthly_result: goals.monthly_result,
          assertiveness: goals.assertiveness,
          max_daily_loss: goals.max_daily_loss,
          max_daily_trades: goals.max_daily_trades,
        })
        .eq("id", goals.id)
        .select("*")
        .single();
      if (error) throw error;
      return data as Goals;
    }
    const { data, error } = await supabase
      .from("goals")
      .insert({
        daily_result: goals.daily_result,
        weekly_result: goals.weekly_result,
        monthly_result: goals.monthly_result,
        assertiveness: goals.assertiveness,
        max_daily_loss: goals.max_daily_loss,
        max_daily_trades: goals.max_daily_trades,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as Goals;
  },
};
