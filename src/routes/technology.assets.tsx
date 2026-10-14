import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { techModelQuery, categoriesForAsset } from "@/lib/technology/model";
import { Coordinates, EmptyState, PageTitle, Panel } from "@/components/technology/ModuleShell";
import { StatusBadge } from "@/components/technology/StatusBadge";
import { RelationGraph } from "@/components/technology/RelationGraph";

export const Route = createFileRoute("/technology/assets")({
  validateSearch: z.object({
    asset: z.coerce.number().int().optional().catch(undefined),
    tech: z.coerce.number().int().optional().catch(undefined),
    view: z.enum(["table", "network"]).optional().catch(undefined),
  }),
  head: () => ({
    meta: [
      { title: "Asset–Technology Explorer — SiloVerse" },
      { name: "description", content: "Trace which technologies power each Consilio asset, and which assets use each technology." },
      { property: "og:title", content: "Asset–Technology Explorer — SiloVerse" },
      { property: "og:description", content: "Trace which technologies power each Consilio asset, and which assets use each technology." },
    ],
  }),
  component: AssetExplorer,
});

const fieldCls = "h-9 w-full rounded-sm border border-input bg-background/60 px-3 text-sm outline-none focus:border-silo";

function Picker<T extends { id: number }>({ label, items, render, sub, selected, onPick }: { label: string; items: T[]; render: (t: T) => string; sub: (t: T) => string; selected?: number | undefined; onPick: (id: number) => void }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => items.filter((i) => render(i).toLowerCase().includes(q.toLowerCase())), [items, q, render]);
  return (
    <Panel title={label} meta={`${list.length}`}>
      <label className="sr-only" htmlFor={`p-${label}`}>Search {label}</label>
      <input id={`p-${label}`} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${label.toLowerCase()}…`} className={fieldCls} />
      <ul className="mt-3 max-h-80 overflow-y-auto pr-1">
        {list.map((i) => (
          <li key={i.id}>
            <button onClick={() => onPick(i.id)} aria-pressed={selected === i.id} className={`flex w-full items-baseline justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent ${selected === i.id ? "bg-accent text-silo" : ""}`}>
              <span className="truncate">{render(i)}</span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{sub(i)}</span>
            </button>
          </li>
        ))}
        {!list.length && <li className="px-2 py-4 text-sm text-muted-foreground">No matches.</li>}
      </ul>
    </Panel>
  );
}

function AssetExplorer() {
  const { data: m } = useSuspenseQuery(techModelQuery);
  const s = Route.useSearch();
  const nav = useNavigate({ from: Route.fullPath });
  const view = s.view ?? "table";
  const assets = useMemo(() => [...m.assets].sort((a, b) => a.code.localeCompare(b.code)), [m]);
  const techs = useMemo(() => m.technologies.filter((t) => t.assetIds.length).sort((a, b) => a.name.localeCompare(b.name)), [m]);
  const asset = s.asset != null ? m.assetById.get(s.asset) : undefined;
  const tech = s.tech != null ? m.techById.get(s.tech) : undefined;
  const focus = asset ? "asset" : tech ? "tech" : null;

  return (
    <>
      <Coordinates trail={[{ label: "Asset ↔ Technology" }, ...(asset ? [{ label: asset.code }] : tech ? [{ label: tech.name }] : [])]} />
      <PageTitle title="Asset ↔ Technology" statement={`${m.relationshipCount} recorded relationships across ${m.assets.filter((a) => a.technologyIds.length).length} assets`}>
        {focus && (
          <div role="radiogroup" aria-label="View mode" className="flex overflow-hidden rounded-sm border border-border">
            {(["table", "network"] as const).map((v) => (
              <button key={v} role="radio" aria-checked={view === v} onClick={() => nav({ search: (p) => ({ ...p, view: v }), replace: true })} className={`metadata px-3 py-2 ${view === v ? "bg-accent !text-silo" : "hover:!text-foreground"}`}>
                {v === "table" ? "Table" : "Network"}
              </button>
            ))}
          </div>
        )}
      </PageTitle>
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <div className="space-y-6">
          <Picker label="Assets" items={assets} render={(a) => `${a.name}`} sub={(a) => `${a.code} · ${a.technologyIds.length}`} selected={s.asset} onPick={(id) => nav({ search: (p) => ({ asset: id, view: p.view }) })} />
          <Picker label="Technologies" items={techs} render={(t) => t.name} sub={(t) => `${t.assetIds.length}`} selected={s.tech} onPick={(id) => nav({ search: (p) => ({ tech: id, view: p.view }) })} />
        </div>

        <div className="min-w-0">
          {!focus && (
            <Panel>
              <EmptyState title="Select an asset or a technology">
                <p className="max-w-sm text-sm text-muted-foreground">Choose an asset to see its stack grouped by category, or a technology to see every asset that uses it.</p>
              </EmptyState>
            </Panel>
          )}

          {asset && (
            <Panel title={`${asset.name}`} meta={`${asset.code} · ${asset.technologyIds.length} technologies`}>
              {view === "network" ? (
                <RelationGraph center={asset.name} leafKind="technologies" leaves={asset.technologyIds.map((id) => ({ id, label: m.techById.get(id)!.name }))} onLeaf={(id) => nav({ search: { tech: id, view: "network" } })} />
              ) : asset.technologyIds.length === 0 ? (
                <EmptyState title="No technologies recorded for this asset" />
              ) : (
                <div className="space-y-6">
                  {categoriesForAsset(m, asset).map((g) => (
                    <div key={g.id}>
                      <div className="metadata mb-2 flex justify-between">
                        {g.id === -1 ? <span>{g.name}</span> : <Link to="/technology/categories/$categoryId" params={{ categoryId: String(g.id) }} className="hover:text-silo">{g.name}</Link>}
                        <span>{g.techs.length}</span>
                      </div>
                      <table className="w-full text-left text-sm">
                        <tbody>
                          {g.techs.map((t) => (
                            <tr key={t.id} className="border-b border-border/60 [&>td]:py-2">
                              <td className="pr-3"><Link to="/technology/tech/$technologyId" params={{ technologyId: String(t.id) }} className="font-medium hover:text-silo">{t.name}</Link></td>
                              <td className="pr-3"><StatusBadge status={t.status} /></td>
                              <td className="text-right"><button onClick={() => nav({ search: { tech: t.id } })} className="text-xs text-silo hover:underline">{t.assetIds.length} assets →</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">A technology linked to several categories appears under each of them; it is still one relationship.</p>
                </div>
              )}
            </Panel>
          )}

          {tech && !asset && (
            <Panel title={tech.name} meta={`${tech.assetIds.length} assets`}>
              <div className="mb-4 flex flex-wrap items-center gap-4"><StatusBadge status={tech.status} /><Link to="/technology/tech/$technologyId" params={{ technologyId: String(tech.id) }} className="text-sm text-silo hover:underline">Technology detail →</Link></div>
              {view === "network" ? (
                <RelationGraph center={tech.name} leafKind="assets" leaves={tech.assetIds.map((id) => ({ id, label: m.assetById.get(id)!.name }))} onLeaf={(id) => nav({ search: { asset: id, view: "network" } })} />
              ) : (
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b border-border"><th className="metadata py-2 font-normal">Asset code</th><th className="metadata py-2 font-normal">Asset</th><th className="metadata py-2 text-right font-normal">Technologies</th></tr></thead>
                  <tbody>
                    {tech.assetIds.map((id) => m.assetById.get(id)!).sort((a, b) => a.code.localeCompare(b.code)).map((a) => (
                      <tr key={a.id} className="border-b border-border/60 [&>td]:py-2">
                        <td className="font-mono text-xs text-muted-foreground">{a.code}</td>
                        <td><button onClick={() => nav({ search: { asset: a.id } })} className="font-medium hover:text-silo">{a.name}</button></td>
                        <td className="text-right font-mono tabular-nums">{a.technologyIds.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
