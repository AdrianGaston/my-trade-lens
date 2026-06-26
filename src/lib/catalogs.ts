import { ERRORS, SENTIMENTS } from "@/types/trade";

export type CatalogKey = "assets" | "setups" | "errors" | "sentiments";

// Storage key now equals the Supabase table name (back-compat alias kept).
export const CATALOG_STORAGE: Record<CatalogKey, string> = {
  assets: "assets",
  setups: "setups",
  errors: "errors",
  sentiments: "sentiments",
};

// Initial values are now seeded in the database migration; kept for tests/UI hints.
export const CATALOG_DEFAULTS: Record<CatalogKey, string[]> = {
  assets: [],
  setups: [],
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
 * Dropdown ordering rules:
 *  - errors: "Nenhum" first, then alphabetical
 *  - sentiments: "Neutro" first, then alphabetical
 *  - others: preserve order from storage (user-defined via drag-and-drop)
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
