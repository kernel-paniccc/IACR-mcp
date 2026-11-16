import { IacrHttpClient } from "./http.js";
import { normalizePaperId } from "./ids.js";
import { parsePaper, parseRecentRss, parseSearch } from "./parser.js";
import type { Paper, PaperUrls, SearchResult } from "./types.js";

export interface SearchOptions {
  query: string;
  title?: string | undefined;
  author?: string | undefined;
  category?: string | undefined;
  year?: number | undefined;
  limit?: number | undefined;
}

export class IacrClient {
  constructor(private readonly http = new IacrHttpClient()) {}

  async search(options: SearchOptions): Promise<SearchResult> {
    const limit = Math.min(Math.max(options.limit ?? 10, 1), 50);
    const terms = [options.query.trim()];
    if (options.title) terms.push(`title:\"${options.title}\"`);
    if (options.author) terms.push(`author:\"${options.author}\"`);
    const url = new URL("https://eprint.iacr.org/search");
    url.searchParams.set("q", terms.filter(Boolean).join(" AND "));
    if (options.category) url.searchParams.set("category", options.category);
    const html = await this.http.text(url);
    const result = parseSearch(html, url.toString(), Math.max(limit * 3, limit));
    result.papers = result.papers.filter((paper) => !options.year || paper.id.startsWith(`${options.year}/`)).slice(0, limit);
    return result;
  }

  async getPaper(value: string): Promise<Paper> {
    const id = normalizePaperId(value);
    return parsePaper(await this.http.text(`https://eprint.iacr.org/${id}`), id);
  }

  async getRecentPapers(limit = 10): Promise<SearchResult> {
    const boundedLimit = Math.min(Math.max(limit, 1), 100);
    const url = "https://eprint.iacr.org/rss/rss.xml?order=recent";
    return parseRecentRss(await this.http.text(url, "application/rss+xml,application/xml,text/xml"), url, boundedLimit);
  }

  getPaperUrls(value: string): PaperUrls {
    const id = normalizePaperId(value);
    const url = `https://eprint.iacr.org/${id}`;
    return { id, url, pdfUrl: `${url}.pdf`, bibtexUrl: `${url}.bib` };
  }

  async getBibtex(value: string): Promise<string> {
    const id = normalizePaperId(value);
    return this.http.text(`https://eprint.iacr.org/${id}.bib`, "application/x-bibtex,text/plain");
  }
}
