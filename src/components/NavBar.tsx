import candlestickIcon from "@/assets/tradelens-icon.png";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  CheckSquare,
  Settings,
  CalendarDays,
  StickyNote,
  Plus,
  Flag,
  LayoutDashboard,
} from "lucide-react";

export type TabId = "trading-plan" | "checklist" | "gerenciamento" | "calendario" | "anotacoes" | "dashboard";

interface NavBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onAddTrade: () => void;
  onFinalizarDia: () => void;
}

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "trading-plan", label: "Trading Plan", icon: <ClipboardList className="h-4 w-4" /> },
  { id: "checklist", label: "CheckList", icon: <CheckSquare className="h-4 w-4" /> },
  { id: "gerenciamento", label: "Gerenciamento", icon: <Settings className="h-4 w-4" /> },
  { id: "calendario", label: "Calendário", icon: <CalendarDays className="h-4 w-4" /> },
  { id: "anotacoes", label: "Anotações", icon: <StickyNote className="h-4 w-4" /> },
];

export function NavBar({ activeTab, onTabChange, onAddTrade, onFinalizarDia }: NavBarProps) {
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-1 overflow-x-auto">
        <div className="flex items-center gap-2 mr-4 shrink-0">
          <img src={candlestickIcon} alt="TradeLens" className="h-6 w-6" />
          <span className="text-sm font-bold text-foreground tracking-tight hidden sm:inline">My Trade Lens</span>
        </div>

        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "secondary" : "ghost"}
            size="sm"
            className="gap-1.5 shrink-0 text-xs"
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon}
            <span className="hidden md:inline">{tab.label}</span>
          </Button>
        ))}

        <Button size="sm" className="gap-1.5 shrink-0 text-xs" onClick={onAddTrade}>
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">Adicionar Trade</span>
        </Button>

        <Button variant="outline" size="sm" className="gap-1.5 shrink-0 text-xs" onClick={onFinalizarDia}>
          <Flag className="h-4 w-4" />
          <span className="hidden md:inline">Finalizar Dia</span>
        </Button>

        <Button
          variant={activeTab === "dashboard" ? "secondary" : "ghost"}
          size="sm"
          className="gap-1.5 shrink-0 text-xs"
          onClick={() => onTabChange("dashboard")}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden md:inline">Dashboard</span>
        </Button>
      </div>
    </header>
  );
}
