import { parseAwesomeMpc } from "./awesomeMpc.js";
import { parseDocumentation } from "./documentation.js";
import { parseRfcIndex } from "./rfcIndex.js";
import { loadRegistry } from "./registry.js";
import { CatalogStore } from "./store.js";

export interface IngestReport {
  updated: Array<{ sourceId: string; entries: number }>;
  failed: Array<{ sourceId: string; error: string }>;
}

export async function ingestPublicCatalog(store: CatalogStore, fetchFn: typeof fetch = fetch): Promise<IngestReport> {
  const registry = await loadRegistry();
  const report: IngestReport = { updated: [], failed: [] };
  for (const source of registry.sources.filter((item) => item.enabled && item.contentUrl && item.id !== "iacr-eprint")) {
    try {
      if (!source.contentUrl) throw new Error(`${source.id} has no contentUrl`);
      const response = await fetchFn(source.contentUrl, { signal: AbortSignal.timeout(20_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const content = await response.text();
      const entries = source.id === "awesome-mpc"
        ? parseAwesomeMpc(content, source.url)
        : source.id === "rfc-editor-crypto"
          ? parseRfcIndex(content, source.url)
          : source.kind === "framework_documentation"
            ? parseDocumentation(content, source)
            : [];
      store.replaceSource(source, entries);
      report.updated.push({ sourceId: source.id, entries: entries.length });
    } catch (error) {
      report.failed.push({ sourceId: source.id, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return report;
}
