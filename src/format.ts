import type { Paper, SearchResult } from "./types.js";

export function formatSearch(result: SearchResult): string {
  const rows = result.papers.map((p) => `### ${p.id} — ${p.title}\n${p.authors.join(", ")}\n${p.category ? `Category: ${p.category} · ` : ""}[paper](${p.url}) · [PDF](${p.pdfUrl})${p.abstract ? `\n\n${p.abstract}` : ""}`);
  return `Found ${result.total} result(s); returning ${result.papers.length}.\n\n${rows.join("\n\n")}`;
}

export function formatPaper(p: Paper): string {
  return `# ${p.title}\n\n**IACR ePrint ${p.id}** · ${p.authors.join(", ")}\n\n${p.category ? `Category: ${p.category}\n\n` : ""}${p.abstract ?? "No abstract found."}\n\n[Landing page](${p.url}) · [PDF](${p.pdfUrl})`;
}
