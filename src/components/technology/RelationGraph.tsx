interface Leaf {
  id: number;
  label: string;
}
/** Radial ego network: every edge is one real AssetTechnologies row. */
export function RelationGraph({ center, leaves, onLeaf, leafKind }: { center: string; leaves: Leaf[]; onLeaf: (id: number) => void; leafKind: string }) {
  const W = 720, H = 460, cx = W / 2, cy = H / 2;
  const n = leaves.length;
  const R = Math.min(190, 90 + n * 3);
  if (!n) return <p className="p-6 text-sm text-muted-foreground">No relationships recorded.</p>;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full grid-field rounded-sm" role="group" aria-label={`${center} connected to ${n} ${leafKind}`}>
      {leaves.map((l, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * R * 1.5, y = cy + Math.sin(a) * R;
        const anchor = Math.cos(a) > 0.2 ? "start" : Math.cos(a) < -0.2 ? "end" : "middle";
        return (
          <g key={l.id} role="button" tabIndex={0} aria-label={l.label} onClick={() => onLeaf(l.id)} onKeyDown={(e) => e.key === "Enter" && onLeaf(l.id)} className="group cursor-pointer outline-none">
            <line x1={cx} y1={cy} x2={x} y2={y} className="stroke-border group-hover:stroke-silo group-focus-visible:stroke-silo" strokeWidth={0.8} />
            <circle cx={x} cy={y} r={4} className="fill-steel group-hover:fill-silo group-focus-visible:fill-silo" />
            {n <= 40 && (
              <text x={x + (anchor === "start" ? 8 : anchor === "end" ? -8 : 0)} y={y + (anchor === "middle" ? (y < cy ? -9 : 15) : 4)} textAnchor={anchor} className="fill-muted-foreground text-[11px] group-hover:fill-foreground">
                {l.label}
              </text>
            )}
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={11} className="fill-silo silo-glow" />
      <circle cx={cx} cy={cy} r={20} className="fill-none stroke-silo" strokeWidth={0.6} opacity={0.6} />
      <text x={cx} y={cy + 38} textAnchor="middle" className="fill-foreground font-display text-base">{center}</text>
    </svg>
  );
}
