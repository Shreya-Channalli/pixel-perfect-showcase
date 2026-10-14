import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { techModelQuery } from "@/lib/technology/model";
import { Coordinates, PageTitle } from "@/components/technology/ModuleShell";

export const Route = createFileRoute("/technology/categories")({
  head: () => ({
    meta: [
      { title: "Category Explorer — SiloVerse" },
      { name: "description", content: "Browse Consilio technology categories and the technologies linked to each." },
      { property: "og:title", content: "Category Explorer — SiloVerse" },
      { property: "og:description", content: "Browse Consilio technology categories and the technologies linked to each." },
    ],
  }),
  component: Categories,
});

function Categories() {
  const child = useMatch({ from: "/technology/categories/$categoryId", shouldThrow: false });
  if (child) return <Outlet />;
  return <CategoryGrid />;
}

function CategoryGrid() {
  const { data: m } = useSuspenseQuery(techModelQuery);
  const max = Math.max(...m.categories.map((c) => c.technologyIds.length));
  const multi = m.technologies.filter((t) => t.categoryIds.length > 1).length;
  return (
    <>
      <Coordinates trail={[{ label: "Categories" }]} />
      <PageTitle title="Categories" statement={`${m.categories.length} clusters · ${m.categoryLinkCount} category links · ${multi} technologies span more than one`} />
      <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {m.categories.map((c, i) => {
          const size = c.technologyIds.length / max;
          return (
            <Link key={c.id} to="/technology/categories/$categoryId" params={{ categoryId: String(c.id) }} className="group relative flex min-h-40 flex-col justify-between bg-background/75 p-5 transition-colors hover:bg-accent animate-materialize" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="flex items-baseline justify-between">
                <span className="metadata">{c.code}</span>
                <span aria-hidden className="relative grid place-items-center" style={{ width: 44, height: 44 }}>
                  <span className="absolute rounded-full border border-border group-hover:border-silo" style={{ width: 12 + size * 32, height: 12 + size * 32 }} />
                  <span className="size-1.5 rounded-full bg-silo" />
                </span>
              </div>
              <div>
                <div className="font-display text-xl font-light group-hover:text-silo">{c.name}</div>
                <div className="mt-1 text-sm text-muted-foreground"><span className="font-mono tabular-nums text-foreground">{c.technologyIds.length}</span> technologies</div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
