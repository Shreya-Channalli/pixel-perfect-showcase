import { useMemo, useState } from "react";
import type { TechModel } from "@/lib/technology/model";
import { statusTone } from "@/lib/technology/model";
import { toneFill } from "./StatusBadge";

interface Props {
  model: TechModel;
  highlight?: Set<number> | undefined; // technology ids matching current filter
  focusCategory?: number | undefined;
  selectedTech?: number | undefined;
  onSelectTech: (id: number) => void;
  onSelectCategory: (id: number) => void;
  height?: number;
  compact?: boolean;
}

/**
 * Category clusters on an orbital ring; technologies are nodes in their first linked
 * category. Thin lines connect a technology to each additional category it is linked to
 * (real TechnologyCategoryLinks only). Node radius reflects linked-asset count.
 */
export function Constellation({ model, highlight, focusCategory, selectedTech, onSelectTech, onSelectCategory, height = 560, compact }: Props) {
  const W = 1000;
  const H = 640;
  const [hover, setHover] = useState<number | null>(null);

  const layout = useMemo(() => {
    const clusters = [...model.categories.map((c) => ({ id: c.id, name: c.name, count: c.technologyIds.length }))];
    const uncategorized = model.technologies.filter((t) => t.categoryIds.length === 0);
    if (uncategorized.length) clusters.push({ id: -1, name: "No category", count: uncategorized.length });
    const cx = W / 2, cy = H / 2, R = 245;
    const pos = new Map<number, { x: number; y: number }>();
    clusters.forEach((c, i) => {
      const a = (i / clusters.length) * Math.PI * 2 - Math.PI / 2;
      pos.set(c.id, { x: cx + Math.cos(a) * R * 1.45, y: cy + Math.sin(a) * R });
    });
    const nodes: { id: number; x: number; y: number; r: number; cluster: number }[] = [];
    for (const c of clusters) {
      const members = model.technologies.filter((t) => (t.categoryIds[0] ?? -1) === c.id);
      const p = pos.get(c.id)!;
      members.forEach((t, k) => {
        const ang = k * 2.399963; // golden angle spiral
        const rad = 9 + Math.sqrt(k) * 7.2;
        nodes.push({ id: t.id, x: p.x + Math.cos(ang) * rad, y: p.y + Math.sin(ang) * rad, r: 1.6 + Math.min(4, Math.sqrt(t.assetIds.length) * 0.75), cluster: c.id });
      });
    }
    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const extraLinks: { tech: number; cat: number }[] = [];
    for (const t of model.technologies) for (const c of t.categoryIds.slice(1)) extraLinks.push({ tech: t.id, cat: c });
    return { clusters, pos, nodes, nodeById, extraLinks };
  }, [model]);

  const active = hover ?? selectedTech;
  const dim = (id: number, cluster: number) => {
    if (highlight && !highlight.has(id)) return true;
    if (focusCategory !== undefined && cluster !== focusCategory && !model.techById.get(id)?.categoryIds.includes(focusCategory)) return true;
    return false;
  };
  const hoverTech = active != null ? model.techById.get(active) : undefined;

  return (
    <div className="relative grid-field rounded-sm" style={{ height }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="group" aria-label="Technology constellation: categories as clusters, technologies as nodes">
        <ellipse cx={W / 2} cy={H / 2} rx={245 * 1.45} ry={245} className="fill-none stroke-border" strokeDasharray="2 6" />
        {layout.extraLinks.map((l, i) => {
          const n = layout.nodeById.get(l.tech)!;
          const p = layout.pos.get(l.cat)!;
          const on = active === l.tech || focusCategory === l.cat;
          return <line key={i} x1={n.x} y1={n.y} x2={p.x} y2={p.y} className={on ? "stroke-silo" : "stroke-border"} strokeWidth={on ? 0.9 : 0.4} opacity={on ? 0.9 : 0.5} />;
        })}
        {layout.clusters.map((c) => {
          const p = layout.pos.get(c.id)!;
          const focused = focusCategory === c.id;
          return (
            <g key={c.id}>
              <circle cx={p.x} cy={p.y} r={18 + Math.sqrt(c.count) * 7.5} className={`fill-none ${focused ? "stroke-silo" : "stroke-border"}`} strokeWidth={focused ? 1.2 : 0.8} />
              {!compact && (
                <text
                  x={p.x}
                  y={p.y - (24 + Math.sqrt(c.count) * 7.5)}
                  textAnchor="middle"
                  tabIndex={c.id === -1 ? -1 : 0}
                  role={c.id === -1 ? undefined : "button"}
                  aria-label={`${c.name}, ${c.count} technologies`}
                  onClick={() => c.id !== -1 && onSelectCategory(c.id)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && c.id !== -1 && onSelectCategory(c.id)}
                  className={`cursor-pointer font-mono text-[11px] uppercase tracking-[0.14em] outline-none focus-visible:fill-silo ${focused ? "fill-silo" : "fill-muted-foreground hover:fill-foreground"}`}
                >
                  {c.name} · {c.count}
                </text>
              )}
            </g>
          );
        })}
        {layout.nodes.map((n) => {
          const t = model.techById.get(n.id)!;
          const isActive = active === n.id;
          const faded = dim(n.id, n.cluster);
          return (
            <circle
              key={n.id}
              cx={n.x}
              cy={n.y}
              r={isActive ? n.r + 2.5 : n.r}
              tabIndex={compact ? -1 : 0}
              role="button"
              aria-label={`${t.name}, ${t.assetIds.length} linked assets`}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(n.id)}
              onBlur={() => setHover(null)}
              onClick={() => onSelectTech(n.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelectTech(n.id)}
              className={`cursor-pointer outline-none transition-[r,opacity] duration-300 ${toneFill[statusTone(t.status)]} ${isActive ? "stroke-foreground" : ""}`}
              strokeWidth={isActive ? 1 : 0}
              opacity={faded ? 0.12 : 0.92}
            />
          );
        })}
      </svg>
      {hoverTech && (
        <div className="panel pointer-events-none absolute left-3 top-3 px-3 py-2 animate-materialize">
          <div className="metadata">Node {hoverTech.id}</div>
          <div className="font-display text-lg font-light">{hoverTech.name}</div>
          <div className="text-xs text-muted-foreground">
            {hoverTech.categoryIds.length} categories · {hoverTech.assetIds.length} assets
          </div>
        </div>
      )}
    </div>
  );
}
