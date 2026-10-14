import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { techModelQuery, statusDistribution, NO_STATUS_LABEL } from "@/lib/technology/model";
import { Coordinates, PageTitle, Panel } from "@/components/technology/ModuleShell";
import { BarList } from "@/components/technology/BarList";
import { Constellation } from "@/components/technology/Constellation";
import { toneDot } from "@/components/technology/StatusBadge";

export const Route = createFileRoute("/technology/")({
  head: () => ({
    meta: [
      { title: "Technology Overview — SiloVerse" },
      { name: "description", content: "Consilio technology sector: categories, usage status and asset relationships at a glance." },
      { property: "og:title", content: "Technology Overview — SiloVerse" },
      { property: "og:description", content: "Consilio technology sector: categories, usage status and asset relationships at a glance." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { data: m } = useSuspenseQuery(techModelQuery);
  const nav = useNavigate();
  const linkedAssets = m.assets.filter((a) => a.technologyIds.length).length;
  const metrics = [
    { label: "Technologies", value: m.technologies.length, to: "/technology/explorer" },
    { label: "Categories", value: m.categories.length, to: "/technology/categories" },
    { label: "Linked assets", value: linkedAssets, to: "/technology/assets" },
    { label: "Asset–technology relationships", value: m.relationshipCount, to: "/technology/assets" },
  ] as const;
  const status = statusDistribution(m);

  return (
    <>
      <Coordinates trail={[{ label: "Overview" }]} />
      <PageTitle title="Technology" statement="The stack beneath every Consilio asset" />

      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border lg:grid-cols-4">
        {metrics.map((k) => (
          <Link key={k.label} to={k.to} className="group bg-background/70 p-5 transition-colors hover:bg-accent">
            <div className="metadata">{k.label}</div>
            <div className="mt-2 font-display text-5xl font-extralight tabular-nums group-hover:text-silo">{k.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="Constellation" meta="Clusters = categories · nodes = technologies">
          <Constellation
            model={m}
            height={460}
            onSelectTech={(id) => nav({ to: "/technology/explorer", search: { tech: id, view: "spatial" } })}
            onSelectCategory={(id) => nav({ to: "/technology/categories/$categoryId", params: { categoryId: String(id) } })}
          />
        </Panel>
        <div className="space-y-6">
          <Panel title="Usage status" meta={`${m.technologies.length} technologies`}>
            <div className="mb-4 flex h-2 overflow-hidden rounded-full">
              {status.map((s) => (
                <span key={s.label} className={toneDot[s.tone]} style={{ width: `${(s.count / m.technologies.length) * 100}%` }} />
              ))}
            </div>
            <BarList
              unit="technologies"
              items={status.map((s) => ({
                key: s.label,
                label: <span className={s.label === NO_STATUS_LABEL ? "italic text-muted-foreground" : ""}>{s.label}</span>,
                value: s.count,
                barClass: toneDot[s.tone],
                hint: s.label,
                onSelect: () => nav({ to: "/technology/explorer", search: { status: s.label } }),
              }))}
            />
          </Panel>
          <Panel title="Category distribution" meta="Technologies per category">
            <BarList
              unit="technologies"
              items={[...m.categories]
                .sort((a, b) => b.technologyIds.length - a.technologyIds.length)
                .map((c) => ({ key: c.id, label: c.name, value: c.technologyIds.length, onSelect: () => nav({ to: "/technology/explorer", search: { cat: c.id } }) }))}
            />
          </Panel>
        </div>
      </div>

      <div className="mt-6 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/technology/explorer", n: "01", t: "Technology Explorer", d: "Search, filter and sort the catalogue" },
          { to: "/technology/categories", n: "02", t: "Category Explorer", d: "Browse the 13 category clusters" },
          { to: "/technology/assets", n: "03", t: "Asset ↔ Technology", d: "Trace stacks in both directions" },
          { to: "/technology/insights", n: "04", t: "Insights", d: "Coverage, gaps and concentration" },
        ].map((q) => (
          <Link key={q.to} to={q.to} className="group bg-background/70 p-5 transition-colors hover:bg-accent">
            <div className="metadata">Region {q.n}</div>
            <div className="mt-2 font-display text-xl font-light group-hover:text-silo">{q.t} →</div>
            <div className="mt-1 text-sm text-muted-foreground">{q.d}</div>
          </Link>
        ))}
      </div>
      <p className="metadata mt-6 !normal-case !tracking-normal">Data source: {m.sourceLabel}</p>
    </>
  );
}
