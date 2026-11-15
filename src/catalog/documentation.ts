import { load } from "cheerio";
import type { CatalogEntry, SourceDefinition } from "./types.js";

const clean = (value: string) => value.replace(/\s+/g, " ").trim();
const slug = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function parseDocumentation(html: string, source: SourceDefinition): CatalogEntry[] {
  const $ = load(html);
  $("script, style, nav, header, footer").remove();
  const root = $("main, article, [role=main], .document, .rst-content").first().length
    ? $("main, article, [role=main], .document, .rst-content").first()
    : $("body");
  const sections: CatalogEntry[] = [];
  root.find("h1, h2, h3").each((index, heading) => {
    const name = clean($(heading).text());
    if (!name) return;
    const content = clean($(heading).nextUntil("h1, h2, h3").text());
    if (content.length < 30) return;
    const anchor = $(heading).attr("id") ?? $(heading).find("[id]").first().attr("id");
    const url = anchor ? `${source.contentUrl}#${encodeURIComponent(anchor)}` : source.contentUrl;
    sections.push({
      id: `${source.id}:${slug(name)}:${index}`, sourceId: source.id, kind: "documentation_section",
      category: "framework/documentation", name: `${source.name}: ${name}`,
      description: content.slice(0, 12_000), ...(url ? { url } : {}), links: url ? [url] : [], provenanceUrl: source.url,
    });
  });
  if (sections.length === 0) {
    sections.push({ id: `${source.id}:overview`, sourceId: source.id, kind: "framework_documentation", category: "framework/documentation", name: source.name, description: clean(root.text()).slice(0, 12_000) || source.description || "Official framework documentation.", ...(source.contentUrl ? { url: source.contentUrl } : {}), links: source.contentUrl ? [source.contentUrl] : [], provenanceUrl: source.url });
  }
  return sections;
}
