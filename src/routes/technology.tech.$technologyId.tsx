import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { techModelQuery } from "@/lib/technology/model";
import { Coordinates, EmptyState, PageTitle, Panel } from "@/components/technology/ModuleShell";
import { TechDetail } from "@/components/technology/TechDetail";

export const Route = createFileRoute("/technology/tech/$technologyId")({
  loader: async ({ context, params }) => {
    const m = await context.queryClient.ensureQueryData(techModelQuery);
    const t = m.techById.get(Number(params.technologyId));
    if (!t) throw notFound();
    return { name: t.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Technology"} — SiloVerse Technology` },
      { name: "description", content: `Usage status, categories and linked Consilio assets for ${loaderData?.name ?? "this technology"}.` },
      { property: "og:title", content: `${loaderData?.name ?? "Technology"} — SiloVerse` },
      { property: "og:description", content: `Usage status, categories and linked Consilio assets for ${loaderData?.name ?? "this technology"}.` },
    ],
  }),
  notFoundComponent: () => (
    <EmptyState title="This technology does not exist">
      <Link to="/technology/explorer" className="text-sm text-silo hover:underline">Back to explorer</Link>
    </EmptyState>
  ),
  component: Detail,
});

function Detail() {
  const { data: m } = useSuspenseQuery(techModelQuery);
  const t = m.techById.get(Number(Route.useParams().technologyId))!;
  return (
    <>
      <Coordinates trail={[{ label: "Explorer", to: "/technology/explorer" }, { label: `Node ${t.id}` }]} />
      <PageTitle title={t.name} statement="Technology detail" />
      <Panel><TechDetail model={m} tech={t} full /></Panel>
    </>
  );
}
