export type SourceTrust = "primary_metadata" | "primary_source" | "secondary";

export interface SourceDefinition {
  id: string;
  name: string;
  kind: "curated_registry" | "paper_archive" | "standards" | "software_registry" | "framework_documentation";
  trust: SourceTrust;
  url: string;
  contentUrl?: string;
  description?: string;
  license: string;
  enabled: boolean;
}

export interface CatalogEntry {
  id: string;
  sourceId: string;
  kind: string;
  category: string;
  name: string;
  description: string;
  url?: string;
  links: string[];
  provenanceUrl: string;
}

export interface CatalogSearchHit extends CatalogEntry {
  score: number;
  sourceName: string;
  trust: SourceTrust;
}
