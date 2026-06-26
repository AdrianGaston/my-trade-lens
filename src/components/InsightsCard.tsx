import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { buildInsights } from "@/lib/insights";
import type { Trade } from "@/types/trade";

interface Props { trades: Trade[]; }

export function InsightsCard({ trades }: Props) {
  const insights = useMemo(() => buildInsights(trades), [trades]);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem padrões identificados ainda.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {insights.map((i) => (
              <div key={i.id} className="flex gap-3 p-3 rounded-md border border-border bg-secondary/40">
                <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{i.title}</p>
                  <p className="text-xs text-muted-foreground">{i.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
