interface Leaf {
  id: number;
  label: string;
}
const ROW = 30;
const clip = (s: string, n = 30) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

/**
 * Ego network: every edge is one real AssetTechnologies row. Leaves are stacked in two
 * columns (left/right of the centre) at a fixed row pitch, so labels never overlap no
 * matter how many relationships exist.
 */
export function RelationGraph({ center, leaves, onLeaf, leafKind }: { center: string; leaves: Leaf[]; onLeaf: (id: number) => void; leafKind: string }) {
  const n = leaves.length;
  if (!n) return <p className="p-6 text-sm text-muted-foreground">No relationships recorded.</p>;
  const sorted = [...leaves].sort((a, b) => a.label.localeCompare(b.label));
  const half = Math.ceil(n / 2);
  const left = sorted.slice(0, half);
  const right = sorted.slice(half);
  const W = 900;
  const H = Math.max(260, half * ROW + 40);
  const cx = W / 2, cy = H / 2;
  const lx = 250, rx = W - 250;
  const yFor = (i: number, count: number) => cy - ((count - 1) * ROW) / 2 + i * ROW;

  const node = (l: Leaf, x: number, y: number, side: "l" | "r") => (
    <g key={l.id} role="button" tabIndex={0} aria-label={l.label} onClick={() => onLeaf(l.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onLeaf(l.id)} className="group cursor-pointer outline-none">
      <title>{l.label}</title>
      <path d={`M${cx},${cy} C${(cx + x) / 2},${cy} ${(cx + x) / 2},${y} ${x},${y}`} className="fill-none stroke-border group-hover:stroke-silo group-focus-visible:stroke-silo" strokeWidth={1} />
      <circle cx={x} cy={y} r={5} className="fill-steel group-hover:fill-silo group-focus-visible:fill-silo" />
      <text x={side === "l" ? x - 12 : x + 12} y={y + 5} textAnchor={side === "l" ? "end" : "start"} className="fill-foreground text-[14px] group-hover:fill-silo group-focus-visible:fill-silo">
        {clip(l.label)}
      </text>
    </g>
  );

  return (
    <div className="max-h-[70vh] overflow-y-auto rounded-sm">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[640px] grid-field" role="group" aria-label={`${center} connected to ${n} ${leafKind}`}>
        {left.map((l, i) => node(l, lx, yFor(i, left.length), "l"))}
        {right.map((l, i) => node(l, rx, yFor(i, right.length), "r"))}
        <circle cx={cx} cy={cy} r={12} className="fill-silo silo-glow" />
        <circle cx={cx} cy={cy} r={22} className="fill-none stroke-silo" strokeWidth={0.8} opacity={0.6} />
        <text x={cx} y={cy + 42} textAnchor="middle" className="fill-foreground font-display text-[16px] font-semibold">{clip(center, 34)}</text>
      </svg>
    </div>
  );
}
