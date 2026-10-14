import type { ReactNode } from "react";

export interface BarItem {
  key: string | number;
  label: ReactNode;
  value: number;
  barClass?: string;
  onSelect?: () => void;
  hint?: string;
}

/** Interactive 2D bar list. Each bar is a real button that navigates to filtered records. */
export function BarList({ items, unit, barClassDefault }: { items: BarItem[]; unit: string; barClassDefault?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length) return <p className="text-sm text-muted-foreground">No records.</p>;
  return (
    <ul className="space-y-1">
      {items.map((i) => (
        <li key={i.key}>
          <button
            onClick={i.onSelect}
            disabled={!i.onSelect}
            aria-label={`${typeof i.label === "string" ? i.label : ""} ${i.value} ${unit}${i.hint ? `, ${i.hint}` : ""}`}
            className="group grid w-full grid-cols-[minmax(0,11rem)_1fr_2.5rem] items-center gap-3 rounded-sm px-2 py-1.5 text-left transition-colors duration-200 hover:bg-accent disabled:cursor-default"
          >
            <span className="truncate text-sm">{i.label}</span>
            <span className="h-1.5 rounded-full bg-muted">
              <span
                className={`block h-full rounded-full transition-[width] duration-500 ${i.barClass ?? barClassDefault ?? "bg-silo"}`}
                style={{ width: `${(i.value / max) * 100}%` }}
              />
            </span>
            <span className="text-right font-mono text-xs tabular-nums text-muted-foreground group-hover:text-foreground">
              {i.value}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
