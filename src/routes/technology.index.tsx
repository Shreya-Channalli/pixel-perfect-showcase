import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { techModelQuery, statusDistribution } from "@/lib/technology/model";
import { Coordinates, PageTitle, Stat } from "@/components/technology/ModuleShell";
import { toneDot } from "@/components/technology/StatusBadge";
import { CategoryIcon, groupCategories } from "@/components/technology/categoryMeta";

export const Route = createFileRoute("/technology/")({
  head: () => ({
    meta: [
      { title: "Technology Overview — SiloVerse" },
      { name: "description", content: "Consilio technology categories, usage status and application relationships at a glance." },
      { property: "og:title", content: "Technology Overview — SiloVerse" },
      { property: "og:description", content: "Consilio technology categories, usage status and application relationships at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { data: m } = useSuspenseQuery(techModelQuery);
  const linkedApps = m.assets.filter((a) => a.technologyIds.length).length;
  // Overview shows only the first two usage statuses (ordered by technology count).
  const topStatuses = statusDistribution(m).slice(0, 2);
  const total = m.technologies.length;
  const groups = groupCategories(m.categories);

  return (
    <>
      <Coordinates trail={[{ label: "Overview" }]} />
      <PageTitle title="Technology Overview" statement="The technology stack behind every Consilio application">
        <Link to="/technology/explorer" className="inline-flex items-center gap-2 rounded-sm border border-silo px-3 py-2 text-sm font-medium text-silo hover:bg-accent">
          Browse technologies <ArrowRight className="size-4" />
        </Link>
      </PageTitle>

      <section aria-label="Summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat value={total} label="Technologies" to="/technology/explorer" />
        <Stat value={m.categories.length} label="Categories" to="/technology/categories" />
        <Stat value={linkedApps} label="Applications" hint={`of ${m.assets.length} with technologies linked`} to="/technology/assets" />
        <Stat value={m.relationshipCount} label="Application–technology links" to="/technology/assets" />
      </section>

      <section aria-labelledby="usage-h" className="mt-6">
        <h2 id="usage-h" className="mb-3 font-display text-lg font-semibold">Usage status</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {topStatuses.map((s) => (
            <Link key={s.label} to="/technology/explorer" search={{ status: s.label }} className="panel flex items-center gap-4 p-4 transition-colors hover:border-silo hover:bg-accent">
              <span aria-hidden className={`h-12 w-1.5 shrink-0 rounded-full ${toneDot[s.tone]}`} />
              <div className="min-w-0 flex-1">
                <div className="stat-value">{s.count}</div>
                <div className="mt-1 text-sm font-medium">{s.label}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-xl font-semibold tabular-nums">{((s.count / total) * 100).toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">of technologies</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="cats-h" className="mt-8">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id="cats-h" className="font-display text-lg font-semibold">Technology categories</h2>
          <Link to="/technology/categories" className="text-sm text-silo hover:underline">All categories →</Link>
        </div>
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.name}>
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">{g.name}</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {g.categories.map((c) => (
                  <Link key={c.id} to="/technology/categories/$categoryId" params={{ categoryId: String(c.id) }} className="panel group flex flex-col gap-3 p-4 transition-colors hover:border-silo hover:bg-accent">
                    <span className="grid size-10 place-items-center rounded-sm bg-accent text-silo"><CategoryIcon name={c.name} /></span>
                    <div>
                      <div className="stat-value">{c.technologyIds.length}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">technologies</div>
                    </div>
                    <div className="font-medium leading-snug group-hover:text-silo">{c.name}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs text-muted-foreground">Data source: {m.sourceLabel}. Technologies linked to several categories are counted in each.</p>
    </>
  );
}
