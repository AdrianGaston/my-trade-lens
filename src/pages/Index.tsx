import { useState } from "react";
import { useTrades } from "@/hooks/use-trades";
import { AppSidebar, type TabId } from "@/components/AppSidebar";
import { TradeFormModal } from "@/components/TradeFormModal";
import { TradeTable } from "@/components/TradeTable";
import { TradeFilters } from "@/components/TradeFilters";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { CalendarPage } from "@/components/CalendarPage";
import { DashboardPage } from "@/components/DashboardPage";
import { NotesPage } from "@/components/NotesPage";
import { TradingPlanPage } from "@/components/TradingPlanPage";
import { SettingsPage } from "@/components/SettingsPage";
import { ChecklistPage } from "@/components/ChecklistPage";
import { GerenciamentoPage } from "@/components/GerenciamentoPage";
import { JournalPage } from "@/components/JournalPage";
import { FinalizeDayModal } from "@/components/FinalizeDayModal";
import { ReportModal } from "@/components/ReportModal";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Flag, FileDown } from "lucide-react";
import type { Trade } from "@/types/trade";
import { toast } from "@/hooks/use-toast";
import { applyFilters, defaultFilters, type TradeFilters as TradeFiltersType } from "@/lib/filterTrades";
import { todayISO } from "@/lib/dayStats";

const Index = () => {
  const { trades, addTrade, updateTrade, deleteTrade } = useTrades();
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Trade | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TradeFiltersType>(defaultFilters);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const filteredTrades = applyFilters(trades, filters);
  const hasTradesToday = trades.some((t) => t.date.slice(0, 10) === todayISO());

  const handleSave = (trade: Omit<Trade, "id">) => {
    if (editing) { updateTrade(editing.id, trade); setEditing(null); }
    else { addTrade(trade); }
  };

  const requestDelete = (id: string) => setConfirmDeleteId(id);

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      deleteTrade(confirmDeleteId);
      if (editing?.id === confirmDeleteId) setEditing(null);
      toast({ title: "Trade excluído" });
    }
    setConfirmDeleteId(null);
  };

  const handleEdit = (trade: Trade) => { setEditing(trade); setModalOpen(true); };

  const handleModalDelete = () => {
    if (editing) { setModalOpen(false); setConfirmDeleteId(editing.id); }
  };

  const renderContent = () => {
    if (activeTab === "home") {
      return (
        <div className="space-y-4">
          <TradeFilters value={filters} onChange={setFilters} />
          <TradeTable trades={filteredTrades} onEdit={handleEdit} onDelete={requestDelete} />
        </div>
      );
    }
    if (activeTab === "dashboard") return <DashboardPage trades={trades} />;
    if (activeTab === "calendario") return <CalendarPage />;
    if (activeTab === "anotacoes") return <NotesPage />;
    if (activeTab === "trading-plan") return <TradingPlanPage />;
    if (activeTab === "configuracoes") return <SettingsPage />;
    if (activeTab === "checklist") return <ChecklistPage />;
    if (activeTab === "gerenciamento") return <GerenciamentoPage />;
    if (activeTab === "diario") return <JournalPage />;
    return <PlaceholderPage title={activeTab} />;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center justify-between border-b border-border px-4 shrink-0">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <Button size="sm" className="gap-1.5 text-xs" onClick={() => { setEditing(null); setModalOpen(true); }}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Adicionar Trade</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setReportOpen(true)}>
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">Gerar Relatório</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setFinalizeOpen(true)}
                disabled={!hasTradesToday}
                title={hasTradesToday ? "Finalizar dia" : "Sem trades hoje"}
              >
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
        onDelete={handleModalDelete}
        onCancelEdit={() => setEditing(null)}
      />

      <FinalizeDayModal open={finalizeOpen} onOpenChange={setFinalizeOpen} trades={trades} />
      <ReportModal open={reportOpen} onOpenChange={setReportOpen} trades={trades} />

      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(v) => { if (!v) setConfirmDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir trade</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este trade? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default Index;
