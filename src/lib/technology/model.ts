import { queryOptions } from "@tanstack/react-query";
import { activeDataSource } from "./data-source";
import type { AssetRow, TechnologyCategoryRow, TechnologyDataset } from "./types";

export const NO_STATUS_LABEL = "Not recorded";

export interface Technology {
  id: number;
  name: string;
  status: string | null;
  categoryIds: number[];
  assetIds: number[];
}
export interface Category {
  id: number;
  code: string;
  name: string;
  technologyIds: number[];
}
export interface Asset {
  id: number;
  code: string;
  name: string;
  technologyIds: number[];
}
export interface TechModel {
  technologies: Technology[];
  categories: Category[];
  assets: Asset[];
  techById: Map<number, Technology>;
  catById: Map<number, Category>;
  assetById: Map<number, Asset>;
  relationshipCount: number;
  categoryLinkCount: number;
  statuses: string[]; // distinct verbatim values (excludes null)
  hasMissingStatus: boolean;
  sourceLabel: string;
}

export function buildModel(ds: TechnologyDataset, sourceLabel = ""): TechModel {
  const technologies: Technology[] = ds.technologies.map((t) => ({
    id: t.technologyId,
    name: t.technologyName,
    status: t.consilioUsageStatus ?? null,
    categoryIds: [],
    assetIds: [],
  }));
  const techById = new Map(technologies.map((t) => [t.id, t]));

  const categories: Category[] = ds.technologyCategories.map((c: TechnologyCategoryRow) => ({
    id: c.technologyCategoryId,
    code: c.categoryCode,
    name: c.categoryName,
    technologyIds: [],
  }));
  const catById = new Map(categories.map((c) => [c.id, c]));

  const seenLink = new Set<string>();
  for (const l of ds.technologyCategoryLinks) {
    const key = `${l.technologyId}:${l.technologyCategoryId}`;
    if (seenLink.has(key)) continue;
    const t = techById.get(l.technologyId);
    const c = catById.get(l.technologyCategoryId);
    if (!t || !c) continue;
    seenLink.add(key);
    t.categoryIds.push(c.id);
    c.technologyIds.push(t.id);
  }

  const assets: Asset[] = ds.assets.map((a: AssetRow) => ({
    id: a.assetId,
    code: a.assetCode,
    name: a.assetName,
    technologyIds: [],
  }));
  const assetById = new Map(assets.map((a) => [a.id, a]));

  const seenRel = new Set<string>();
  for (const r of ds.assetTechnologies) {
    const key = `${r.assetId}:${r.technologyId}`;
    if (seenRel.has(key)) continue;
    const t = techById.get(r.technologyId);
    let a = assetById.get(r.assetId);
    if (!t) continue;
    if (!a) {
      // Asset name not available in source: show the identifier only, never invent a name.
      a = { id: r.assetId, code: `AssetId ${r.assetId}`, name: `AssetId ${r.assetId}`, technologyIds: [] };
      assetById.set(a.id, a);
      assets.push(a);
    }
    seenRel.add(key);
    t.assetIds.push(a.id);
    a.technologyIds.push(t.id);
  }

  const statuses = [...new Set(technologies.map((t) => t.status).filter((s): s is string => !!s))].sort();
  return {
    technologies,
    categories,
    assets,
    techById,
    catById,
    assetById,
    relationshipCount: seenRel.size,
    categoryLinkCount: seenLink.size,
    statuses,
    hasMissingStatus: technologies.some((t) => !t.status),
    sourceLabel,
  };
}

export const techModelQuery = queryOptions({
  queryKey: ["technology-model", activeDataSource.label],
  queryFn: async () => buildModel(await activeDataSource.load(), activeDataSource.label),
  staleTime: Infinity,
});

/* ---------- Status presentation (values shown verbatim; tone is only a color hint) ---------- */
export type StatusTone = "consilio" | "vendor" | "transition" | "inactive" | "none";
export function statusTone(status: string | null): StatusTone {
  if (!status) return "none";
  const s = status.toLowerCase();
  if (s.startsWith("inactive") || s.startsWith("phasing")) return "inactive";
  if (s.includes("legacy") || s.includes("pending")) return "transition";
  if (s.includes("vendor")) return "vendor";
  return "consilio";
}
export const statusLabel = (s: string | null) => s ?? NO_STATUS_LABEL;

/* ---------- Catalogue querying ---------- */
export type SortKey = "name" | "status" | "category" | "assets";
export interface CatalogueQuery {
  q?: string | undefined;
  cat?: number | undefined; // -1 = no category
  status?: string | undefined; // NO_STATUS_LABEL = null status
  sort?: SortKey | undefined;
  dir?: "asc" | "desc" | undefined;
}

export function filterTechnologies(m: TechModel, query: CatalogueQuery): Technology[] {
  const q = query.q?.trim().toLowerCase();
  let list = m.technologies.filter((t) => {
    if (q) {
      const catHit = t.categoryIds.some((c) => m.catById.get(c)?.name.toLowerCase().includes(q));
      if (!t.name.toLowerCase().includes(q) && !catHit) return false;
    }
    if (query.cat !== undefined) {
      if (query.cat === -1 ? t.categoryIds.length > 0 : !t.categoryIds.includes(query.cat)) return false;
    }
    if (query.status !== undefined && statusLabel(t.status) !== query.status) return false;
    return true;
  });
  const dir = query.dir === "desc" ? -1 : 1;
  const firstCat = (t: Technology) => (t.categoryIds.length ? m.catById.get(t.categoryIds[0]!)!.name : "\uffff");
  const sort = query.sort ?? "name";
  list = [...list].sort((a, b) => {
    let r = 0;
    if (sort === "assets") r = a.assetIds.length - b.assetIds.length;
    else if (sort === "status") r = statusLabel(a.status).localeCompare(statusLabel(b.status));
    else if (sort === "category") r = firstCat(a).localeCompare(firstCat(b));
    if (r === 0) r = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    return r * dir;
  });
  return list;
}

export function statusDistribution(m: TechModel) {
  const counts = new Map<string, number>();
  for (const t of m.technologies) counts.set(statusLabel(t.status), (counts.get(statusLabel(t.status)) ?? 0) + 1);
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count, tone: statusTone(label === NO_STATUS_LABEL ? null : label) }))
    .sort((a, b) => b.count - a.count);
}

export function categoriesForAsset(m: TechModel, asset: Asset) {
  const groups = new Map<number, Technology[]>();
  for (const tid of asset.technologyIds) {
    const t = m.techById.get(tid)!;
    const cats = t.categoryIds.length ? t.categoryIds : [-1];
    for (const c of cats) groups.set(c, [...(groups.get(c) ?? []), t]);
  }
  return [...groups.entries()]
    .map(([id, techs]) => ({ id, name: id === -1 ? "No category" : m.catById.get(id)!.name, techs }))
    .sort((a, b) => b.techs.length - a.techs.length);
}
