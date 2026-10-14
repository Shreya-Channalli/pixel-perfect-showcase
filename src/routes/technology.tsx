import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { ModuleShell } from "@/components/technology/ModuleShell";
import { techModelQuery } from "@/lib/technology/model";

export const Route = createFileRoute("/technology")({
  loader: ({ context }) => context.queryClient.ensureQueryData(techModelQuery),
  component: () => (
    <ModuleShell>
      <Outlet />
    </ModuleShell>
  ),
  pendingComponent: () => (
    <ModuleShell>
      <div className="flex flex-col items-center gap-4 py-32" role="status">
        <span className="size-3 animate-pulse rounded-full bg-silo silo-glow" />
        <p className="metadata">Materializing technology sector…</p>
      </div>
    </ModuleShell>
  ),
  errorComponent: ({ error }) => {
    const router = useRouter();
    return (
      <ModuleShell>
        <div className="panel mx-auto mt-20 max-w-md p-8 text-center" role="alert">
          <p className="metadata !text-destructive">Connection interrupted</p>
          <p className="mt-3 font-display text-2xl font-light">Technology data could not be loaded.</p>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
          <button onClick={() => router.invalidate()} className="mt-6 rounded-sm border border-silo px-4 py-2 text-sm text-silo hover:bg-accent">
            Retry
          </button>
        </div>
      </ModuleShell>
    );
  },
});
