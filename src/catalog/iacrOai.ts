import { load } from "cheerio";
import type { CatalogEntry, SourceDefinition } from "./types.js";

export interface OaiPage {
  entries: CatalogEntry[];
  resumptionToken?: string;
  completeListSize?: number;
}

const clean = (value: string) => value.replace(/\s+/g, " ").trim();

export function parseIacrOaiPage(xml: string, source: SourceDefinition): OaiPage {
  const $ = load(xml, { xmlMode: true });
  const error = $("error").first();
  if (error.length) throw new Error(`IACR OAI-PMH: ${error.attr("code") ?? "error"}: ${clean(error.text())}`);

  const entries: CatalogEntry[] = [];
  $("record").each((_index, record) => {
    const header = $(record).children("header");
    if (header.attr("status") === "deleted") return;
    const identifier = clean(header.children("identifier").text()).replace(/^oai:eprint\.iacr\.org:/, "");
    const metadata = $(record).children("metadata");
    const title = clean(metadata.find("dc\\:title").first().text());
    if (!identifier || !title) return;
    const authors = metadata.find("dc\\:creator").map((_i, node) => clean($(node).text())).get().filter(Boolean);
    const subjects = metadata.find("dc\\:subject").map((_i, node) => clean($(node).text())).get().filter(Boolean);
    const abstract = clean(metadata.find("dc\\:description").first().text());
    const dates = metadata.find("dc\\:date").map((_i, node) => clean($(node).text())).get().filter(Boolean);
    const rights = clean(metadata.find("dc\\:rights").first().text());
    const url = `https://eprint.iacr.org/${identifier}`;
    const description = [
      authors.length ? `Authors: ${authors.join(", ")}.` : "",
      dates[0] ? `Date: ${dates[0]}.` : "",
      subjects.length ? `Subjects: ${subjects.join(", ")}.` : "",
      abstract,
    ].filter(Boolean).join("\n");
    entries.push({
      id: `${source.id}:${identifier}`,
      sourceId: source.id,
      kind: "research_paper",
      category: subjects.join(" / ") || "cryptography",
      name: title,
      description,
      url,
      links: [url, `${url}.pdf`, ...(rights ? [rights] : [])],
      provenanceUrl: "https://eprint.iacr.org/oai",
    });
  });

  const tokenNode = $("resumptionToken").first();
  const token = clean(tokenNode.text());
  const size = Number(tokenNode.attr("completeListSize"));
  return {
    entries,
    ...(token ? { resumptionToken: token } : {}),
    ...(Number.isFinite(size) ? { completeListSize: size } : {}),
  };
}

export async function harvestIacrOai(
  source: SourceDefinition,
  fetchFn: typeof fetch = fetch,
): Promise<CatalogEntry[]> {
  const entries: CatalogEntry[] = [];
  let token: string | undefined;
  do {
    const query = token
      ? `verb=ListRecords&resumptionToken=${encodeURIComponent(token)}`
      : "verb=ListRecords&metadataPrefix=oai_dc";
    const response = await fetchFn(`https://eprint.iacr.org/oai?${query}`, { signal: AbortSignal.timeout(60_000) });
    if (!response.ok) throw new Error(`IACR OAI-PMH HTTP ${response.status}`);
    const page = parseIacrOaiPage(await response.text(), source);
    entries.push(...page.entries);
    token = page.resumptionToken;
  } while (token);
  return entries;
}
