import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { z } from "zod";
import { techModelQuery, statusDistribution } from "@/lib/technology/model";
import { Coordinates, EmptyState, PageTitle, Panel, Stat } from "@/components/technology/ModuleShell";
import { StatusBadge } from "@/components/technology/StatusBadge";
import { TechDrawer } from "@/components/technology/TechDrawer";
import { CategoryIcon } from "@/components/technology/categoryMeta";

export const Route = createFileRoute("/technology/categories/$categoryId")({
  validateSearch: z.object({ tech: z.coerce.number().int().optional().catch(undefined) }),
  loader: async ({ context, params }) => {
    const m = await context.queryClient.ensureQueryData(techModelQuery);
    const c = m.catById.get(Number(params.categoryId));
    if (!c) throw notFound();
    return { name: c.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Category"} — Technology Categories — SiloVerse` },
      { name: "description", content: `Technologies linked to the ${loaderData?.name ?? ""} category at Consilio.` },
      { property: "og:title", content: `${loaderData?.name ?? "Category"} — SiloVerse` },
      { property: "og:description", content: `Technologies linked to the ${loaderData?.name ?? ""} category at Consilio.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  notFoundComponent: () => (
    <EmptyState title="This category does not exist">
      <Link to="/technology/categories" className="text-sm text-silo hover:underline">Back to categories</Link>
    </EmptyState>
  ),
  component: CategoryDetail,
});

function CategoryDetail() {
  const { data: m } = useSuspenseQuery(techModelQuery);
  const { categoryId } = Route.useParams();
  const { tech } = Route.useSearch();
  const nav = useNavigate({ from: Route.fullPath });
  const c = m.catById.get(Number(categoryId))!;
  const techs = c.technologyIds.map((id) => m.techById.get(id)!).sort((a, b) => a.name.localeCompare(b.name));
  const appSet = new Set(techs.flatMap((t) => t.assetIds));
  const shared = techs.filter((t) => t.categoryIds.length > 1).length;
  const sub = { ...m, technologies: techs };
  const topStatus = statusDistribution(sub)[0];
  const idx = m.categories.findIndex((x) => x.id === c.id);
  const prev = m.categories[(idx - 1 + m.categories.length) % m.categories.length]!;
  const next = m.categories[(idx + 1) % m.categories.length]!;

  return (
    <>
      <Coordinates trail={[{ label: "Categories", to: "/technology/categories" }, { label: c.name }]} />
      <PageTitle title={c.name} statement={`Category ${c.code}`} icon={<CategoryIcon name={c.name} />}>
        <Link to="/technology/categories/$categoryId" params={{ categoryId: String(prev.id) }} aria-label={`Previous category: ${prev.name}`} className="inline-flex items-center gap-1 rounded-sm border border-border px-3 py-1.5 text-sm hover:border-silo"><ChevronLeft className="size-4" />{prev.name}</Link>
        <Link to="/technology/categories/$categoryId" params={{ categoryId: String(next.id) }} aria-label={`Next category: ${next.name}`} className="inline-flex items-center gap-1 rounded-sm border border-border px-3 py-1.5 text-sm hover:border-silo">{next.name}<ChevronRight className="size-4" /></Link>
      </PageTitle>

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat value={techs.length} label="Technologies" />
        <Stat value={appSet.size} label="Applications reached" />
        <Stat value={shared} label="Also in other categories" />
        <Stat value={topStatus ? topStatus.count : 0} label={topStatus ? `Most common: ${topStatus.label}` : "No status"} />
      </section>

      <Panel title="Technologies in this category" meta={<Link to="/technology/explorer" search={{ cat: c.id }} className="text-silo hover:underline">Open in Technologies →</Link>}>
        {techs.length === 0 ? (
          <EmptyState title="No technologies linked to this category" />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {techs.map((t) => (
              <li key={t.id}>
                <button onClick={() => nav({ search: { tech: t.id }, replace: true })} className="flex h-full w-full flex-col gap-1.5 rounded-sm border border-border/60 px-3 py-2.5 text-left transition-colors hover:border-silo hover:bg-accent">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{t.name}</span>
                    <span className="shrink-0 text-sm"><span className="font-semibold tabular-nums">{t.assetIds.length}</span> <span className="text-muted-foreground">apps</span></span>
                  </span>
                  <StatusBadge status={t.status} />
                  {t.categoryIds.length > 1 && (
                    <span className="text-xs text-muted-foreground">Also in {t.categoryIds.filter((x) => x !== c.id).map((x) => m.catById.get(x)!.name).join(", ")}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <TechDrawer model={m} techId={tech} onClose={() => nav({ search: {}, replace: true })} />
    </>
  );
}
