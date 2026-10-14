import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/siloverse/theme";

const NAV = [
  { to: "/technology", label: "Overview", exact: true },
  { to: "/technology/explorer", label: "Technologies" },
  { to: "/technology/categories", label: "Categories" },
  { to: "/technology/assets", label: "Asset ↔ Technology" },
  { to: "/technology/insights", label: "Insights" },
] as const;

export function ModuleShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-5 py-3">
          <Link to="/technology" className="flex items-center gap-3">
            <span aria-hidden className="relative grid size-7 place-items-center">
              <span className="absolute inset-0 rounded-full border border-silo/60" />
              <span className="size-2 rounded-full bg-silo silo-glow" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-base font-light tracking-wide">SiloVerse</span>
              <span className="metadata block !text-[0.58rem]">A universe of possibilities</span>
            </span>
          </Link>
          <nav aria-label="Technology module" className="hidden flex-1 items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: "exact" in n, includeSearch: false }}
                className="rounded-sm px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-silo"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
        <nav aria-label="Technology module" className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: "exact" in n, includeSearch: false }} className="shrink-0 rounded-sm px-3 py-1 text-sm text-muted-foreground data-[status=active]:bg-accent data-[status=active]:text-silo">
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-[1400px] px-5 pb-20 pt-6">{children}</main>
    </div>
  );
}

/** Spatial coordinates breadcrumb (Guide §27). */
export function Coordinates({ trail }: { trail: { label: string; to?: string; params?: Record<string, string> }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="metadata mb-4 flex flex-wrap items-center gap-2">
      <span>SiloVerse</span>
      <span aria-hidden>/</span>
      <Link to="/technology" className="hover:text-silo">Technology</Link>
      {trail.map((t, i) => (
        <span key={i} className="flex items-center gap-2">
          <span aria-hidden>/</span>
          {t.to ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <Link to={t.to as any} params={t.params as any} className="hover:text-silo">{t.label}</Link>
          ) : (
            <span aria-current="page" className="text-silo">{t.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageTitle({ title, statement, children }: { title: string; statement?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-materialize">
      <div>
        <h1 className="display-title text-5xl md:text-6xl">{title}</h1>
        {statement && <p className="mt-2 font-display text-lg font-light text-muted-foreground">{statement}</p>}
      </div>
      {children}
    </div>
  );
}

export function Panel({ title, meta, children, className = "" }: { title?: string; meta?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`panel p-5 ${className}`}>
      {(title || meta) && (
        <div className="mb-4 flex items-baseline justify-between gap-3">
          {title && <h2 className="metadata !text-foreground">{title}</h2>}
          {meta && <div className="metadata">{meta}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span aria-hidden className="size-10 rounded-full border border-dashed border-border" />
      <p className="font-display text-xl font-light">{title}</p>
      {children}
    </div>
  );
}
