import { statusLabel, statusTone, type StatusTone } from "@/lib/technology/model";

export const toneDot: Record<StatusTone, string> = {
  consilio: "bg-status-consilio",
  vendor: "bg-status-vendor",
  transition: "bg-status-transition",
  inactive: "bg-status-inactive",
  none: "bg-status-none",
};
export const toneFill: Record<StatusTone, string> = {
  consilio: "fill-status-consilio",
  vendor: "fill-status-vendor",
  transition: "fill-status-transition",
  inactive: "fill-status-inactive",
  none: "fill-status-none",
};

export function StatusBadge({ status }: { status: string | null }) {
  const tone = statusTone(status);
  return (
    <span className={`inline-flex items-center gap-2 text-sm ${status ? "" : "italic text-muted-foreground"}`}>
      <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${toneDot[tone]}`} />
      {statusLabel(status)}
    </span>
  );
}
