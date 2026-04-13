import candlestickIcon from "@/assets/tradelens-icon.png";
import {
  Home,
  ClipboardList,
  CheckSquare,
  Settings,
  CalendarDays,
  StickyNote,
  LayoutDashboard,
  Plus,
  Flag,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export type TabId = "home" | "trading-plan" | "checklist" | "gerenciamento" | "calendario" | "anotacoes" | "dashboard";

interface AppSidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onAddTrade: () => void;
  onFinalizarDia: () => void;
}

const menuItems: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "trading-plan", label: "Trading Plan", icon: ClipboardList },
  { id: "checklist", label: "CheckList", icon: CheckSquare },
  { id: "gerenciamento", label: "Gerenciamento", icon: Settings },
  { id: "calendario", label: "Calendário", icon: CalendarDays },
  { id: "anotacoes", label: "Anotações", icon: StickyNote },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function AppSidebar({ activeTab, onTabChange, onAddTrade, onFinalizarDia }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <img src={candlestickIcon} alt="TradeLens" className="h-6 w-6 shrink-0" />
          {!collapsed && (
            <span className="text-sm font-bold text-foreground tracking-tight whitespace-nowrap">
              My Trade Lens
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    onClick={() => onTabChange(item.id)}
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
