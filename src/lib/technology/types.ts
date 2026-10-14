// Row shapes mirror the consolidated SQL schema (dbo.Technologies, dbo.TechnologyCategories,
// dbo.TechnologyCategoryLinks, dbo.AssetTechnologies, dbo.Assets) restricted to the columns
// this module is allowed to display. Excluded columns are intentionally absent.

export interface TechnologyRow {
  technologyId: number;
  technologyName: string;
  consilioUsageStatus: string | null;
}
export interface TechnologyCategoryRow {
  technologyCategoryId: number;
  categoryCode: string;
  categoryName: string;
}
export interface TechnologyCategoryLinkRow {
  technologyId: number;
  technologyCategoryId: number;
}
export interface AssetTechnologyRow {
  assetTechnologyId: number;
  assetId: number;
  technologyId: number;
}
export interface AssetRow {
  assetId: number;
  assetCode: string;
  assetName: string;
}

export interface TechnologyDataset {
  technologies: TechnologyRow[];
  technologyCategories: TechnologyCategoryRow[];
  technologyCategoryLinks: TechnologyCategoryLinkRow[];
  assetTechnologies: AssetTechnologyRow[];
  assets: AssetRow[];
}

/** Swap this for a live SQL-backed implementation later. */
export interface TechnologyDataSource {
  readonly label: string;
  load(): Promise<TechnologyDataset>;
}
