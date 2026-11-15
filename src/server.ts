import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { formatPaper, formatSearch } from "./format.js";
import { IacrClient } from "./iacr.js";
import { CatalogStore } from "./catalog/store.js";
import { CATALOG_PATH } from "./paths.js";

const output = (text: string, data: unknown) => ({ content: [{ type: "text" as const, text }], structuredContent: data as Record<string, unknown> });
const failure = (error: unknown) => ({ isError: true, content: [{ type: "text" as const, text: error instanceof Error ? error.message : String(error) }] });

export function createServer(client = new IacrClient(), catalog = new CatalogStore(CATALOG_PATH, { readOnly: true })): McpServer {
  const server = new McpServer({ name: "iacr-research", version: "0.1.0" });
  server.registerTool("search_papers", {
    description: "Search titles, authors, abstracts, and keywords in the IACR Cryptology ePrint Archive. Supports IACR syntax such as quoted phrases, AND/OR/NOT, title:, author:, +required, -excluded, and prefix*.",
    inputSchema: z.object({
      query: z.string().min(1).describe("IACR full-text query"),
      title: z.string().min(1).optional(), author: z.string().min(1).optional(),
      category: z.string().min(1).optional(), year: z.number().int().min(1996).max(2100).optional(),
      limit: z.number().int().min(1).max(50).default(10),
    }),
  }, async (args) => { try { const result = await client.search(args); return output(formatSearch(result), result); } catch (e) { return failure(e); } });

  server.registerTool("get_paper", {
    description: "Get normalized metadata and abstract for one IACR ePrint paper.",
    inputSchema: z.object({ paper_id: z.string().describe("ID such as 2024/1234, or an eprint.iacr.org URL") }),
  }, async ({ paper_id }) => { try { const paper = await client.getPaper(paper_id); return output(formatPaper(paper), paper); } catch (e) { return failure(e); } });

  server.registerTool("get_bibtex", {
    description: "Get the canonical BibTeX citation for one IACR ePrint paper.",
    inputSchema: z.object({ paper_id: z.string() }),
  }, async ({ paper_id }) => { try { const bibtex = await client.getBibtex(paper_id); return output(bibtex, { paperId: paper_id, bibtex }); } catch (e) { return failure(e); } });

  server.registerTool("research_search", {
    description: "Search the local, reproducible cryptography research catalog. Results retain source provenance and trust level; secondary registries are discovery aids, not security evidence.",
    inputSchema: z.object({
      query: z.string().min(1).max(500),
      limit: z.number().int().min(1).max(50).default(10),
    }),
  }, async ({ query, limit }) => {
    try {
      const hits = catalog.search(query, limit);
      const text = hits.length
        ? hits.map((hit) => `### ${hit.name}\n${hit.kind} · ${hit.sourceName} · trust: ${hit.trust}\n\n${hit.description}\n\n${hit.url ?? hit.provenanceUrl}`).join("\n\n")
        : "No local catalog results. Run `npm run ingest` to build or refresh the public index.";
      return output(text, { query, hits });
    } catch (e) { return failure(e); }
  });

  server.registerTool("catalog_status", {
    description: "Report the number of indexed public sources and research entries.",
    inputSchema: z.object({}),
  }, async () => { try { const stats = catalog.stats(); return output(JSON.stringify(stats), stats); } catch (e) { return failure(e); } });
  return server;
}
