import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListManager } from "@/components/ListManager";
import {
  CATALOG_DEFAULTS,
  CATALOG_LABELS,
  CATALOG_STORAGE,
  type CatalogKey,
} from "@/lib/catalogs";

const CATALOGS: CatalogKey[] = ["assets", "setups", "errors", "sentiments"];

export function SettingsPage() {
  return (
    <Tabs defaultValue="assets" className="w-full">
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
  );
}
