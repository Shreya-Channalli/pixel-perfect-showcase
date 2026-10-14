import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { techModelQuery, statusDistribution } from "@/lib/technology/model";
import { Coordinates, PageTitle, Panel } from "@/components/technology/ModuleShell";
import { BarList } from "@/components/technology/BarList";
import { StatusBadge, toneDot } from "@/components/technology/StatusBadge";

export const Route = createFileRoute("/technology/insights")({
  head: () => ({
    meta: [
      { title: "Technology Insights — SiloVerse" },
      { name: "description", content: "Where Consilio's technology inventory concentrates, and where coverage gaps exist." },
      { property: "og:title", content: "Technology Insights — SiloVerse" },
      { property: "og:description", content: "Where Consilio's technology inventory concentrates, and where coverage gaps exist." },
    ],
  }),
  component: Insights,
});

function Insights() {
  const { data: m } = useSuspenseQuery(techModelQuery);
  const nav = useNavigate();
  const topTech = [...m.technologies].sort((a, b) => b.assetIds.length - a.assetIds.length || a.name.localeCompare(b.name)).slice(0, 12);
  const topAssets = [...m.assets].sort((a, b) => b.technologyIds.length - a.technologyIds.length || a.code.localeCompare(b.code)).slice(0, 12);
  const noAssets = m.technologies.filter((t) => !t.assetIds.length);
  const noCats = m.technologies.filter((t) => !t.categoryIds.length);
  const noStatus = m.technologies.filter((t) => !t.status);

  const Gap = ({ title, items, empty }: { title: string; items: typeof noAssets; empty: string }) => (
    <Panel title={title} meta={`${items.length}`}>
      {items.length ? (
        <ul className="space-y-1">
          {items.map((t) => (
            <li key={t.id} className="flex items-baseline justify-between gap-3">
              <Link to="/technology/tech/$technologyId" params={{ technologyId: String(t.id) }} className="text-sm hover:text-silo">{t.name}</Link>
              <StatusBadge status={t.status} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </Panel>
  );

  return (
    <>
      <Coordinates trail={[{ label: "Insights" }]} />
      <PageTitle title="Insights" statement="Select any bar to open the underlying records" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Technologies by category" meta="Linked technologies">
          <BarList unit="technologies" items={[...m.categories].sort((a, b) => b.technologyIds.length - a.technologyIds.length).map((c) => ({ key: c.id, label: c.name, value: c.technologyIds.length, onSelect: () => nav({ to: "/technology/categories/$categoryId", params: { categoryId: String(c.id) } }) }))} />
        </Panel>
        <Panel title="Technologies by usage status" meta="Verbatim source values">
          <BarList unit="technologies" items={statusDistribution(m).map((s) => ({ key: s.label, label: s.label, value: s.count, barClass: toneDot[s.tone], onSelect: () => nav({ to: "/technology/explorer", search: { status: s.label } }) }))} />
        </Panel>
        <Panel title="Most widely used technologies" meta="By linked assets">
          <BarList unit="assets" items={topTech.map((t) => ({ key: t.id, label: t.name, value: t.assetIds.length, onSelect: () => nav({ to: "/technology/assets", search: { tech: t.id } }) }))} />
        </Panel>
        <Panel title="Assets with the broadest stacks" meta="By linked technologies">
          <BarList unit="technologies" barClassDefault="" items={topAssets.map((a) => ({ key: a.id, label: `${a.name}`, value: a.technologyIds.length, barClass: "bg-steel", onSelect: () => nav({ to: "/technology/assets", search: { asset: a.id } }) }))} />
        </Panel>
        <Gap title="Technologies with no linked assets" items={noAssets} empty="Every technology is linked to at least one asset." />
        <Gap title="Technologies without a category" items={noCats} empty="Every technology has at least one category." />
        {noStatus.length > 0 && <Gap title="Technologies with no usage status recorded" items={noStatus} empty="" />}
      </div>
    </>
  );
}
