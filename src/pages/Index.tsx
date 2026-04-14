import { useState } from "react";
import { useTrades } from "@/hooks/use-trades";
import { AppSidebar, type TabId } from "@/components/AppSidebar";
import { TradeFormModal } from "@/components/TradeFormModal";
import { TradeTable } from "@/components/TradeTable";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { CalendarPage } from "@/components/CalendarPage";
import { DashboardPage } from "@/components/DashboardPage";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Plus, Flag } from "lucide-react";
import type { Trade } from "@/types/trade";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { trades, stats, addTrade, updateTrade, deleteTrade } = useTrades();
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Trade | null>(null);

  const handleSave = (trade: Omit<Trade, "id">) => {
    if (editing) {
      updateTrade(editing.id, trade);
      setEditing(null);
    } else {
      addTrade(trade);
    }
  };

  const handleDelete = () => {
    if (editing) {
      deleteTrade(editing.id);
      setEditing(null);
    }
  };

  const handleEdit = (trade: Trade) => {
    setEditing(trade);
    setModalOpen(true);
  };

  const handleFinalizarDia = () => {
    toast({ title: "Finalizar Dia", description: "Funcionalidade será implementada em breve." });
  };

  const placeholders: Record<string, string> = {
    "trading-plan": "Trading Plan",
    checklist: "CheckList",
    gerenciamento: "Gerenciamento",
    anotacoes: "Anotações",
  };

  const renderContent = () => {
    if (activeTab === "home") {
      return <TradeTable trades={trades} onEdit={handleEdit} onDelete={deleteTrade} />;
    }
    if (activeTab === "dashboard") {
      return <DashboardPage trades={trades} />;
    }
    if (activeTab === "calendario") {
      return <CalendarPage />;
    }
    return <PlaceholderPage title={placeholders[activeTab] || activeTab} />;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center justify-between border-b border-border px-4 shrink-0">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <Button size="sm" className="gap-1.5 text-xs" onClick={() => { setEditing(null); setModalOpen(true); }}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Adicionar Trade</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleFinalizarDia}>
                <Flag className="h-4 w-4" />
                <span className="hidden sm:inline">Finalizar Dia</span>
              </Button>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 p-4 space-y-4 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>

      <TradeFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        editingTrade={editing}
        onDelete={handleDelete}
        onCancelEdit={() => setEditing(null)}
      />
    </SidebarProvider>
  );
};

export default Index;
