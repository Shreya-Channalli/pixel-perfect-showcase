import type { TechnologyDataSource, TechnologyDataset } from "./types";

/**
 * Prototype adapter: serves records exported from the uploaded
 * Consilio_Technologies_Module.xlsx workbook. Not connected to SQL Server.
 */
export const workbookDataSource: TechnologyDataSource = {
  label: "Workbook snapshot (prototype — not connected to the live database)",
  async load() {
    const mod = await import("@/data/technology/workbook.json");
    return (mod.default ?? mod) as TechnologyDataset;
  },
};

export const activeDataSource: TechnologyDataSource = workbookDataSource;
