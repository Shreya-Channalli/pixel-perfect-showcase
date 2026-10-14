import { Blocks, BrainCircuit, Cloud, Code2, Database, FileText, GitBranch, Layers, LayoutTemplate, Package, Palette, Plug, Rocket, Sparkles, type LucideIcon } from "lucide-react";
import type { Category } from "@/lib/technology/model";

/** Presentation-only metadata keyed by category name. Unknown names fall back safely. */
const ICONS: Record<string, LucideIcon> = {
  Languages: Code2,
  Frameworks: Layers,
  "Libraries & SDKs": Package,
  "Frontend Technologies": LayoutTemplate,
  "Design Tools": Palette,
  "Databases & Storage": Database,
  "Document & Data Types": FileText,
  "AI Tools & Platforms": Sparkles,
  "AI Algorithms & Models": BrainCircuit,
  "SCM Tools": GitBranch,
  "Deployment Mechanisms": Rocket,
  "Cloud Infrastructure": Cloud,
  "APIs & Integrations": Plug,
};

export const CATEGORY_GROUPS: { name: string; members: string[] }[] = [
  { name: "Development", members: ["Languages", "Frameworks", "Libraries & SDKs", "Frontend Technologies", "Design Tools"] },
  { name: "Data & AI", members: ["Databases & Storage", "Document & Data Types", "AI Tools & Platforms", "AI Algorithms & Models"] },
  { name: "Delivery & Infrastructure", members: ["SCM Tools", "Deployment Mechanisms", "Cloud Infrastructure", "APIs & Integrations"] },
];

export function CategoryIcon({ name, className = "size-5" }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Blocks;
  return <Icon className={className} aria-hidden />;
}

/** Groups real categories; any category not in a known group goes to "Other". */
export function groupCategories(categories: Category[]) {
  const used = new Set<number>();
  const groups = CATEGORY_GROUPS.map((g) => {
    const cats = g.members.map((n) => categories.find((c) => c.name === n)).filter((c): c is Category => !!c);
    cats.forEach((c) => used.add(c.id));
    return { name: g.name, categories: cats };
  });
  const rest = categories.filter((c) => !used.has(c.id));
  if (rest.length) groups.push({ name: "Other", categories: rest });
  return groups.filter((g) => g.categories.length);
}
