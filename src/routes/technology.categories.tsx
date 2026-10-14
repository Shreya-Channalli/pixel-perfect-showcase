import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Shapes } from "lucide-react";
import { techModelQuery } from "@/lib/technology/model";
import { Coordinates, PageTitle, Stat } from "@/components/technology/ModuleShell";
import { CategoryIcon, groupCategories } from "@/components/technology/categoryMeta";

export const Route = createFileRoute("/technology/categories")({
  head: () => ({
    meta: [
      { title: "Technology Categories — SiloVerse" },
      { name: "description", content: "Consilio technology categories, the technologies in each, and the applications they reach." },
      { property: "og:title", content: "Technology Categories — SiloVerse" },
      { property: "og:description", content: "Consilio technology categories, the technologies in each, and the applications they reach." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Categories,
});

function Categories() {
  const child = useMatch({ from: "/technology/categories/$categoryId", shouldThrow: false });
  if (child) return <Outlet />;
  return <CategoryList />;
}

function CategoryList() {
  const { data: m } = useSuspenseQuery(techModelQuery);
  const multi = m.technologies.filter((t) => t.categoryIds.length > 1).length;
  const uncategorized = m.technologies.filter((t) => !t.categoryIds.length).length;
  const groups = groupCategories(m.categories);
  return (
    <>
      <Coordinates trail={[{ label: "Categories" }]} />
      <PageTitle title="Categories" statement="Select a category to see its technologies and the applications they reach" icon={<Shapes className="size-5" />} />
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat value={m.categories.length} label="Categories" />
        <Stat value={m.categoryLinkCount} label="Category links" />
        <Stat value={multi} label="Technologies in 2+ categories" />
        <Stat value={uncategorized} label="Technologies without a category" to={uncategorized ? "/technology/explorer" : undefined} search={{ cat: -1 }} />
      </section>
      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.name} className="panel overflow-hidden">
            <h2 className="border-b border-border px-4 py-3 font-display text-lg font-semibold">{g.name}</h2>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground [&>th]:px-4 [&>th]:py-2 [&>th]:font-medium">
                  <th>Category</th><th className="hidden sm:table-cell">Code</th><th className="text-right">Technologies</th><th className="hidden text-right sm:table-cell">Applications</th>
                </tr>
              </thead>
              <tbody>
                {g.categories.map((c) => {
                  const apps = new Set(c.technologyIds.flatMap((id) => m.techById.get(id)!.assetIds)).size;
                  return (
                    <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-accent [&>td]:px-4 [&>td]:py-3">
                      <td>
                        <Link to="/technology/categories/$categoryId" params={{ categoryId: String(c.id) }} className="flex items-center gap-3 font-medium hover:text-silo">
                          <span className="text-silo"><CategoryIcon name={c.name} /></span>{c.name}
                        </Link>
                      </td>
                      <td className="hidden font-mono text-sm text-muted-foreground sm:table-cell">{c.code}</td>
                      <td className="text-right font-display text-xl font-semibold tabular-nums">{c.technologyIds.length}</td>
                      <td className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">{apps}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </>
  );
}
