import { ASSETS, SETUPS, SENTIMENTS, ERRORS } from "@/types/trade";

export type CatalogKey = "assets" | "setups" | "errors" | "sentiments";

export const CATALOG_STORAGE: Record<CatalogKey, string> = {
  assets: "catalog.assets",
  setups: "catalog.setups",
  errors: "catalog.errors",
  sentiments: "catalog.sentiments",
};

export const CATALOG_DEFAULTS: Record<CatalogKey, string[]> = {
  assets: [...ASSETS],
  setups: [...SETUPS],
  errors: [...ERRORS],
  sentiments: [...SENTIMENTS],
};

export const CATALOG_LABELS: Record<CatalogKey, string> = {
  assets: "Ativos",
  setups: "Setups",
  errors: "Erros",
  sentiments: "Sentimentos",
};

/**
 * Apply dropdown ordering rules:
 *  - errors: "Nenhum" first, then alphabetical
 *  - sentiments: "Neutro" first, then alphabetical
 *  - others: preserved order from storage (user-defined via drag-and-drop)
 */
export function orderForDropdown(key: CatalogKey, items: string[]): string[] {
  const cleaned = items.map((s) => s.trim()).filter(Boolean);
  if (key === "errors") return pinnedFirst(cleaned, "Nenhum");
  if (key === "sentiments") return pinnedFirst(cleaned, "Neutro");
  return cleaned;
}

function pinnedFirst(items: string[], pinned: string) {
  const rest = items.filter((i) => i.toLowerCase() !== pinned.toLowerCase());
  rest.sort((a, b) => a.localeCompare(b, "pt-BR"));
  const hasPinned = items.some((i) => i.toLowerCase() === pinned.toLowerCase());
  return hasPinned ? [pinned, ...rest] : rest;
}
