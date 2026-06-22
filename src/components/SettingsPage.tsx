import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListManager } from "@/components/ListManager";
import { NotesPage } from "@/components/NotesPage";
import { TradingPlanPage } from "@/components/TradingPlanPage";
import {
  CATALOG_DEFAULTS,
  CATALOG_LABELS,
  CATALOG_STORAGE,
  type CatalogKey,
} from "@/lib/catalogs";

const CATALOGS: CatalogKey[] = ["assets", "setups", "errors", "sentiments"];

export function SettingsPage() {
  return (
    <Tabs defaultValue="cadastros" className="w-full">
      <TabsList>
        <TabsTrigger value="cadastros">Cadastros</TabsTrigger>
        <TabsTrigger value="pessoal">Conteúdo pessoal</TabsTrigger>
      </TabsList>

      <TabsContent value="cadastros" className="mt-4">
        <Tabs defaultValue="assets">
          <TabsList>
            {CATALOGS.map((k) => (
              <TabsTrigger key={k} value={k}>
                {CATALOG_LABELS[k]}
              </TabsTrigger>
            ))}
          </TabsList>
          {CATALOGS.map((k) => (
            <TabsContent key={k} value={k} className="mt-4">
              <ListManager
                title={CATALOG_LABELS[k]}
                storageKey={CATALOG_STORAGE[k]}
                initial={CATALOG_DEFAULTS[k]}
                placeholder={`Novo ${CATALOG_LABELS[k].slice(0, -1).toLowerCase()}...`}
                emptyText="Nenhum item cadastrado."
              />
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>

      <TabsContent value="pessoal" className="mt-4">
        <Tabs defaultValue="trading-plan">
          <TabsList>
            <TabsTrigger value="trading-plan">Trading Plan</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="gerenciamento">Gerenciamento</TabsTrigger>
            <TabsTrigger value="anotacoes">Anotações</TabsTrigger>
          </TabsList>

          <TabsContent value="trading-plan" className="mt-4">
            <TradingPlanPage />
          </TabsContent>

          <TabsContent value="checklist" className="mt-4">
            <ListManager
              title="Checklist"
              storageKey="personal.checklist"
              placeholder="Novo item do checklist..."
              numbered
            />
          </TabsContent>

          <TabsContent value="gerenciamento" className="mt-4">
            <ListManager
              title="Gerenciamento"
              storageKey="personal.management"
              placeholder="Nova regra de gerenciamento..."
              numbered
              multiline
            />
          </TabsContent>

          <TabsContent value="anotacoes" className="mt-4">
            <NotesPage />
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  );
}
