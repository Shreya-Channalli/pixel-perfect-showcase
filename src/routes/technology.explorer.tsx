import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { techModelQuery, filterTechnologies, NO_STATUS_LABEL, type SortKey } from "@/lib/technology/model";
import { Coordinates, EmptyState, PageTitle, Panel } from "@/components/technology/ModuleShell";
import { StatusBadge } from "@/components/technology/StatusBadge";
import { TechDrawer } from "@/components/technology/TechDrawer";

const PAGE = 25;
const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  cat: z.coerce.number().int().optional().catch(undefined),
  status: z.string().optional().catch(undefined),
  sort: z.enum(["name", "status", "category", "assets"]).optional().catch(undefined),
  dir: z.enum(["asc", "desc"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  tech: z.coerce.number().int().optional().catch(undefined),
});

export const Route = createFileRoute("/technology/explorer")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Technology Explorer — SiloVerse" },
      { name: "description", content: "Search, filter and sort every Consilio technology by category and usage status." },
      { property: "og:title", content: "Technology Explorer — SiloVerse" },
      { property: "og:description", content: "Search, filter and sort every Consilio technology by category and usage status." },
    ],
  }),
  component: Explorer,
});

const fieldCls = "h-10 rounded-sm border border-input bg-background px-3 text-sm outline-none focus:border-silo";

function Explorer() {
  const { data: m } = useSuspenseQuery(techModelQuery);
  const s = Route.useSearch();
  const nav = useNavigate({ from: Route.fullPath });
  const set = (patch: Partial<z.infer<typeof searchSchema>>, resetPage = true) =>
    nav({ search: (prev) => ({ ...prev, ...(resetPage ? { page: undefined } : {}), ...patch }), replace: true });

  const results = useMemo(() => filterTechnologies(m, s), [m, s.q, s.cat, s.status, s.sort, s.dir]); // eslint-disable-line react-hooks/exhaustive-deps
  const pages = Math.max(1, Math.ceil(results.length / PAGE));
  const page = Math.min(s.page ?? 1, pages);
  const rows = results.slice((page - 1) * PAGE, page * PAGE);
  const filtered = !!(s.q || s.cat !== undefined || s.status);
  const hasUncategorized = m.technologies.some((t) => !t.categoryIds.length);

  const sortBtn = (key: SortKey, label: string, align = "") => {
    const active = (s.sort ?? "name") === key;
    const dir = active ? s.dir ?? "asc" : undefined;
    return (
      <th scope="col" aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none"} className={`py-2 font-normal ${align}`}>
        <button onClick={() => set({ sort: key, dir: active && dir === "asc" ? "desc" : "asc" })} className={`metadata hover:!text-foreground ${active ? "!text-silo" : ""}`}>
          {label} {active ? (dir === "asc" ? "↑" : "↓") : ""}
        </button>
      </th>
    );
  };

  return (
    <>
      <Coordinates trail={[{ label: "Technologies" }]} />
      <PageTitle title="Technologies" statement={`${m.technologies.length} technologies across ${m.categories.length} categories`}>
        <Link to="/technology/categories" className="rounded-sm border border-border px-3 py-2 text-sm hover:border-silo">Browse by category</Link>
      </PageTitle>

      <div className="panel mb-4 flex flex-wrap items-center gap-3 p-3">
        <label className="sr-only" htmlFor="tq">Search technologies</label>
        <input id="tq" type="search" placeholder="Search technology or category…" value={s.q ?? ""} onChange={(e) => set({ q: e.target.value || undefined })} className={`${fieldCls} min-w-56 flex-1`} />
        <label className="sr-only" htmlFor="tc">Category</label>
        <select id="tc" value={s.cat ?? ""} onChange={(e) => set({ cat: e.target.value === "" ? undefined : Number(e.target.value) })} className={fieldCls}>
          <option value="">All categories</option>
          {m.categories.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.technologyIds.length})</option>)}
          {hasUncategorized && <option value={-1}>No category</option>}
        </select>
        <label className="sr-only" htmlFor="ts">Usage status</label>
        <select id="ts" value={s.status ?? ""} onChange={(e) => set({ status: e.target.value || undefined })} className={`${fieldCls} max-w-72`}>
          <option value="">All usage statuses</option>
          {m.statuses.map((st) => <option key={st} value={st}>{st}</option>)}
          {m.hasMissingStatus && <option value={NO_STATUS_LABEL}>{NO_STATUS_LABEL}</option>}
        </select>
        <span className="ml-auto text-sm text-muted-foreground" aria-live="polite"><span className="font-display text-lg font-semibold text-foreground tabular-nums">{results.length}</span> of {m.technologies.length}</span>
        {filtered && (
          <button onClick={() => set({ q: undefined, cat: undefined, status: undefined })} className="text-sm text-silo hover:underline">Reset filters</button>
        )}
      </div>

      {results.length === 0 ? (
        <Panel>
          <EmptyState title="No technologies match these filters">
            <button onClick={() => set({ q: undefined, cat: undefined, status: undefined })} className="text-sm text-silo hover:underline">Clear search and filters</button>
          </EmptyState>
        </Panel>
      ) : (
        <Panel className="!p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-border">
                <tr className="[&>th]:px-4">
                  {sortBtn("name", "Technology")}
                  {sortBtn("status", "Usage status")}
                  {sortBtn("category", "Categories")}
                  {sortBtn("assets", "Applications", "text-right")}
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} onClick={() => set({ tech: t.id }, false)} className={`cursor-pointer border-b border-border/60 transition-colors hover:bg-accent [&>td]:px-4 [&>td]:py-3 ${s.tech === t.id ? "bg-accent" : ""}`}>
                    <td>
                      <button onClick={(e) => { e.stopPropagation(); set({ tech: t.id }, false); }} className="text-left font-medium hover:text-silo">{t.name}</button>
                    </td>
                    <td><StatusBadge status={t.status} /></td>
                    <td className="text-sm text-muted-foreground">
                      {t.categoryIds.length ? t.categoryIds.map((c) => m.catById.get(c)!.name).join(", ") : <span className="italic">None</span>}
                    </td>
                    <td className="text-right font-display text-base font-semibold tabular-nums">{t.assetIds.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => set({ page: page - 1 }, false)} className="rounded-sm border border-border px-3 py-1 text-sm disabled:opacity-40 enabled:hover:border-silo">Previous</button>
              <button disabled={page >= pages} onClick={() => set({ page: page + 1 }, false)} className="rounded-sm border border-border px-3 py-1 text-sm disabled:opacity-40 enabled:hover:border-silo">Next</button>
            </div>
          </div>
        </Panel>
      )}
      <TechDrawer model={m} techId={s.tech} onClose={() => set({ tech: undefined }, false)} />
    </>
  );
}
