import type { CatalogEntry } from "./types.js";

const sectionKind: Record<string, string> = {
  books: "book", courses: "course", tutorials: "tutorial", misc: "resource",
  apps: "application", frameworks: "framework", primitives: "primitive",
  protocols: "protocol", tools: "tool", "retired software": "retired_software",
  workshops: "workshop",
};

function slug(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function parseAwesomeMpc(markdown: string, provenanceUrl: string): CatalogEntry[] {
  const entries: CatalogEntry[] = [];
  let section = "uncategorized";
  for (const rawLine of markdown.split(/\r?\n/)) {
    const heading = rawLine.match(/^#{2,3}\s+(.+?)\s*$/);
    if (heading?.[1]) { section = heading[1].trim().toLowerCase(); continue; }
    const item = rawLine.match(/^\s*[-*]\s+\[([^\]]+)]\((https?:\/\/[^)]+)\)\s*(?:[-–—:]\s*)?(.*)$/);
    if (!item?.[1] || !item[2]) continue;
    const name = item[1].trim();
    const description = (item[3] ?? "").trim();
    const links = [...description.matchAll(/https?:\/\/[^\s)>|]+/g)].map((match) => match[0]);
    entries.push({
      id: `awesome-mpc:${slug(section)}:${slug(name)}`,
      sourceId: "awesome-mpc",
      kind: sectionKind[section] ?? "resource",
      category: section,
      name,
      description: description.replace(/\[([^\]]+)]\([^)]+\)/g, "$1"),
      url: item[2], links: [item[2], ...links], provenanceUrl,
    });
  }
  return entries;
}
