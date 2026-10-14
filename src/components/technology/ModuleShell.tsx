import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { BarChart3, ChevronLeft, ChevronRight, Cpu, LayoutDashboard, Menu, Network, Shapes, X } from "lucide-react";
import { ThemeToggle } from "@/components/siloverse/theme";

const NAV = [
  { to: "/technology", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/technology/explorer", label: "Technologies", icon: Cpu },
  { to: "/technology/categories", label: "Categories", icon: Shapes },
  { to: "/technology/assets", label: "Application–Technology", icon: Network },
  { to: "/technology/insights", label: "Insights", icon: BarChart3 },
] as const;

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link to="/technology" className="flex items-center gap-3" aria-label="SiloVerse Technology home">
      <span aria-hidden className="relative grid size-8 shrink-0 place-items-center">
        <span className="absolute inset-0 rounded-full border border-silo/60" />
        <span className="size-2 rounded-full bg-silo silo-glow" />
      </span>
      {!collapsed && (
        <span className="leading-tight">
          <span className="block font-display text-base font-medium tracking-wide">SiloVerse</span>
          <span className="block text-xs text-muted-foreground">Technology module</span>
        </span>
      )}
    </Link>
  );
}

function NavList({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  return (
    <nav aria-label="Technology module" className="flex flex-col gap-1">
      {NAV.map((n) => {
        const Icon = n.icon;
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            title={collapsed ? n.label : undefined}
            aria-label={collapsed ? n.label : undefined}
            activeOptions={{ exact: "exact" in n, includeSearch: false }}
            className={`flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:bg-accent data-[status=active]:font-medium data-[status=active]:text-silo ${collapsed ? "justify-center px-0" : ""}`}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {!collapsed && <span>{n.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function ModuleShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-surface backdrop-blur-md transition-[width] duration-200 md:flex ${collapsed ? "w-16" : "w-60"}`}>
        <div className={`flex items-center border-b border-border py-3 ${collapsed ? "justify-center px-2" : "px-4"}`}>
          <Brand collapsed={collapsed} />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <NavList collapsed={collapsed} />
        </div>
        <div className={`flex flex-col gap-2 border-t border-border p-2 ${collapsed ? "items-center" : ""}`}>
          {!collapsed && <ThemeToggle />}
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex items-center justify-center gap-2 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {collapsed ? <ChevronRight className="size-4" /> : <><ChevronLeft className="size-4" /> Collapse</>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-2.5 backdrop-blur-md md:hidden">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="rounded-sm p-1.5 hover:bg-accent"><Menu className="size-5" /></button>
          <Brand />
          <div className="ml-auto"><ThemeToggle /></div>
        </header>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button aria-label="Close menu" className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <aside className="absolute inset-y-0 left-0 flex w-64 flex-col gap-4 border-r border-border bg-popover p-4">
              <div className="flex items-center justify-between">
                <Brand />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="rounded-sm p-1.5 hover:bg-accent"><X className="size-5" /></button>
              </div>
              <NavList onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}
        <main className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-5 md:px-6">{children}</main>
      </div>
    </div>
  );
}

/** Breadcrumb trail. */
export function Coordinates({ trail }: { trail: { label: string; to?: string; params?: Record<string, string>; search?: Record<string, unknown> }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <Link to="/technology" className="hover:text-silo">Technology</Link>
      {trail.map((t, i) => (
        <span key={i} className="flex items-center gap-2">
          <span aria-hidden>/</span>
          {t.to ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <Link to={t.to as any} params={t.params as any} search={t.search as any} className="hover:text-silo">{t.label}</Link>
          ) : (
            <span aria-current="page" className="font-medium text-foreground">{t.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageTitle({ title, statement, children, icon }: { title: string; statement?: string; children?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 animate-materialize">
      <div className="flex min-w-0 items-center gap-3">
        {icon && <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-border bg-accent text-silo">{icon}</span>}
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          {statement && <p className="mt-0.5 text-sm text-muted-foreground md:text-base">{statement}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Panel({ title, meta, children, className = "" }: { title?: string; meta?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`panel p-5 ${className}`}>
      {(title || meta) && (
        <div className="mb-4 flex items-baseline justify-between gap-3">
          {title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
          {meta && <div className="text-sm text-muted-foreground">{meta}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Large number with a smaller label underneath. Renders as a link when `to` is given. */
export function Stat({ value, label, hint, to, search, tone }: { value: number | string; label: string; hint?: string; to?: string; search?: Record<string, unknown>; tone?: string }) {
  const body = (
    <>
      <div className={`stat-value ${tone ?? ""}`}>{typeof value === "number" ? value.toLocaleString() : value}</div>
      <div className="mt-1.5 text-sm font-medium text-foreground/90">{label}</div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </>
  );
  const cls = "panel block p-4";
  return to ? (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link to={to as any} search={search as any} className={`${cls} transition-colors hover:border-silo hover:bg-accent`}>{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span aria-hidden className="size-10 rounded-full border border-dashed border-border" />
      <p className="font-display text-xl">{title}</p>
      {children}
    </div>
  );
}
