import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import data from "@/data/technology/workbook.json";
import { buildModel, filterTechnologies, NO_STATUS_LABEL } from "./model";
import type { TechnologyDataset } from "./types";

const m = buildModel(data as TechnologyDataset);

describe("technology model (workbook source)", () => {
  it("preserves all records and relationships", () => {
    expect(m.technologies).toHaveLength(213);
    expect(m.categories).toHaveLength(13);
    expect(m.categoryLinkCount).toBe(231);
    expect(m.relationshipCount).toBe(971);
    expect(m.assets).toHaveLength(89);
  });

  it("keeps usage status values verbatim", () => {
    expect(m.statuses).toContain("Active (Legacy) - Migrating to .NET 8 / 10 LTS");
    expect(m.hasMissingStatus).toBe(true);
  });

  it("filters by category through the many-to-many links", () => {
    const langs = filterTechnologies(m, { cat: 1 });
    expect(langs).toHaveLength(m.catById.get(1)!.technologyIds.length);
    expect(filterTechnologies(m, { status: NO_STATUS_LABEL })).toHaveLength(1);
  });

  it("never ships excluded fields in data or UI source", () => {
    const banned = ["ReplacedByTechnologyId", "ReplacementNote", "Aliases", "EvidenceBasis", "SourceId"];
    const files: string[] = [];
    const walk = (d: string) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : files.push(p); });
    ["src/routes", "src/components/technology", "src/data/technology"].forEach(walk);
    const lower = banned.map((b) => b.toLowerCase());
    for (const f of files) {
      const text = readFileSync(f, "utf8").toLowerCase();
      for (const b of lower) expect(text.includes(b), `${b} in ${f}`).toBe(false);
    }
  });
});
