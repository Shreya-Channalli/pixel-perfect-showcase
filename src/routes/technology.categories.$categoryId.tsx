import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { techModelQuery } from "@/lib/technology/model";
import { Coordinates, EmptyState, PageTitle, Panel } from "@/components/technology/ModuleShell";
import { StatusBadge } from "@/components/technology/StatusBadge";
import { TechDrawer } from "@/components/technology/TechDrawer";

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
  const assetSet = new Set(techs.flatMap((t) => t.assetIds));
  const idx = m.categories.findIndex((x) => x.id === c.id);
  const prev = m.categories[(idx - 1 + m.categories.length) % m.categories.length]!;
  const next = m.categories[(idx + 1) % m.categories.length]!;

  return (
    <>
      <Coordinates trail={[{ label: "Categories", to: "/technology/categories" }, { label: `${c.code} · ${c.name}` }]} />
      <PageTitle title={c.name} statement={`${techs.length} technologies · reaching ${assetSet.size} assets`}>
        <div className="flex gap-2 text-sm">
          <Link to="/technology/categories/$categoryId" params={{ categoryId: String(prev.id) }} className="rounded-sm border border-border px-3 py-1.5 hover:border-silo">← {prev.name}</Link>
          <Link to="/technology/categories/$categoryId" params={{ categoryId: String(next.id) }} className="rounded-sm border border-border px-3 py-1.5 hover:border-silo">{next.name} →</Link>
        </div>
      </PageTitle>
      <Panel meta={<Link to="/technology/explorer" search={{ cat: c.id }} className="hover:text-silo">Open in explorer →</Link>} title="Technologies in this cluster">
        {techs.length === 0 ? (
          <EmptyState title="No technologies linked to this category" />
        ) : (
          <ul className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {techs.map((t) => (
              <li key={t.id}>
                <button onClick={() => nav({ search: { tech: t.id }, replace: true })} className="flex w-full flex-col gap-1 rounded-sm px-3 py-2.5 text-left hover:bg-accent">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{t.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{t.assetIds.length} assets</span>
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
