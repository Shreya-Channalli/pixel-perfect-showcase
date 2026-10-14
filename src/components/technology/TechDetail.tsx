import { Link } from "@tanstack/react-router";
import type { TechModel, Technology } from "@/lib/technology/model";
import { StatusBadge } from "./StatusBadge";

/** Shared detail body used by the drawer and the dedicated detail page. */
export function TechDetail({ model, tech, full }: { model: TechModel; tech: Technology; full?: boolean }) {
  const cats = tech.categoryIds.map((c) => model.catById.get(c)!);
  const assets = tech.assetIds.map((a) => model.assetById.get(a)!).sort((a, b) => a.code.localeCompare(b.code));
  return (
    <div className="space-y-8">
      <section>
        <div className="metadata">Consilio usage status</div>
        <div className="mt-2"><StatusBadge status={tech.status} /></div>
      </section>
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border">
        <div className="bg-card p-4"><div className="metadata">Categories</div><div className="mt-1 font-display text-3xl font-extralight">{cats.length}</div></div>
        <div className="bg-card p-4"><div className="metadata">Linked assets</div><div className="mt-1 font-display text-3xl font-extralight">{assets.length}</div></div>
      </section>
      <section>
        <div className="metadata mb-3">Technology categories</div>
        {cats.length ? (
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <Link key={c.id} to="/technology/categories/$categoryId" params={{ categoryId: String(c.id) }} className="rounded-sm border border-border px-2.5 py-1 text-sm transition-colors hover:border-silo hover:text-silo">
                {c.name} <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-muted-foreground">No category association recorded.</p>
        )}
      </section>
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <span className="metadata">Linked assets</span>
          {assets.length > 0 && (
            <Link to="/technology/assets" search={{ tech: tech.id }} className="text-xs text-silo hover:underline">Open in relationship explorer →</Link>
          )}
        </div>
        {assets.length ? (
          <ul className={`grid gap-1 ${full ? "sm:grid-cols-2 lg:grid-cols-3" : ""}`}>
            {assets.map((a) => (
              <li key={a.id}>
                <Link to="/technology/assets" search={{ asset: a.id }} className="flex items-baseline justify-between gap-3 rounded-sm px-2 py-1.5 text-sm hover:bg-accent">
                  <span className="truncate">{a.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{a.code}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic text-muted-foreground">No asset relationships recorded.</p>
        )}
      </section>
    </div>
  );
}
