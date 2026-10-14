import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { TechModel } from "@/lib/technology/model";
import { TechDetail } from "./TechDetail";

export function TechDrawer({ model, techId, onClose }: { model: TechModel; techId?: number | undefined; onClose: () => void }) {
  const tech = techId != null ? model.techById.get(techId) : undefined;
  return (
    <Sheet open={!!tech} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto border-border bg-popover sm:max-w-lg">
        {tech && (
          <>
            <SheetHeader className="mb-6 text-left">
              <div className="metadata">Technology · Node {tech.id}</div>
              <SheetTitle className="display-title text-4xl">{tech.name}</SheetTitle>
              <SheetDescription asChild>
                <Link to="/technology/tech/$technologyId" params={{ technologyId: String(tech.id) }} className="text-sm text-silo hover:underline">
                  Open full detail view →
                </Link>
              </SheetDescription>
            </SheetHeader>
            <TechDetail model={model} tech={tech} />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
