import { load, type CheerioAPI } from "cheerio";
import type { Paper, PaperSummary, SearchResult } from "./types.js";

const clean = (value: string) => value.replace(/\s+/g, " ").trim();
const authors = (value: string) => clean(value).split(/,\s*|\s+and\s+/i).filter(Boolean);

function paperLinks($: CheerioAPI): Array<{ id: string; element: import("cheerio").Cheerio<import("domhandler").AnyNode> }> {
  const result: Array<{ id: string; element: import("cheerio").Cheerio<import("domhandler").AnyNode> }> = [];
  $("a[href]").each((_, node) => {
    const href = $(node).attr("href") ?? "";
    const match = href.match(/(?:^|\/)\b((?:19|20)\d{2}\/\d{1,5})\/?$/);
    if (match?.[1] && !result.some((item) => item.id === match[1])) result.push({ id: match[1], element: $(node) });
  });
  return result;
}

export function parseSearch(html: string, queryUrl: string, limit: number): SearchResult {
  const $ = load(html);
  const heading = clean($("h4").filter((_, el) => /results/i.test($(el).text())).first().text());
  const total = Number(heading.match(/([\d,]+)\s+results/i)?.[1]?.replace(/,/g, "") ?? 0);
  const papers: PaperSummary[] = paperLinks($).slice(0, limit).map(({ id, element }) => {
    const container = element.closest("article, li, .paper, .entry").length
      ? element.closest("article, li, .paper, .entry")
      : element.parent().parent();
    const lines = container.text().split("\n").map(clean).filter(Boolean);
    const idIndex = lines.findIndex((line) => line.includes(id));
    const tail = lines.slice(Math.max(0, idIndex + 1));
    const updated = container.text().match(/Last updated:\s*(\d{4}-\d{2}-\d{2})/i)?.[1];
    const useful = tail.filter((line) => !/^\(PDF\)|^Last updated:/i.test(line));
    const title = useful[0] ?? clean(element.text());
    const authorLine = useful[1] ?? "";
    const category = useful[2];
    const abstract = useful.slice(3).join(" ") || undefined;
    return {
      id, title, authors: authors(authorLine),
      ...(category ? { category } : {}), ...(abstract ? { abstract } : {}), ...(updated ? { updated } : {}),
      url: `https://eprint.iacr.org/${id}`, pdfUrl: `https://eprint.iacr.org/${id}.pdf`,
    };
  });
  return { total: total || papers.length, papers, queryUrl };
}

export function parseRecentRss(xml: string, feedUrl: string, limit: number): SearchResult {
  const $ = load(xml, { xmlMode: true });
  const papers: PaperSummary[] = [];
  $("channel > item").slice(0, limit).each((_index, item) => {
    const node = $(item);
    const url = clean(node.children("link").first().text());
    const id = url.match(/((?:19|20)\d{2}\/\d{1,5})\/?$/)?.[1];
    if (!id) return;
    const creators = node.children("dc\\:creator").map((_i, creator) => clean($(creator).text())).get().filter(Boolean);
    const category = clean(node.children("category").first().text());
    const abstract = clean(node.children("description").first().text());
    const pubDate = clean(node.children("pubDate").first().text());
    const parsedDate = pubDate ? new Date(pubDate) : undefined;
    const updated = parsedDate && !Number.isNaN(parsedDate.valueOf()) ? parsedDate.toISOString().slice(0, 10) : undefined;
    const pdfUrl = node.children("enclosure").attr("url") || `${url}.pdf`;
    papers.push({
      id,
      title: clean(node.children("title").first().text()),
      authors: creators,
      ...(category ? { category } : {}),
      ...(abstract ? { abstract } : {}),
      ...(updated ? { updated } : {}),
      url,
      pdfUrl,
    });
  });
  return { total: papers.length, papers, queryUrl: feedUrl };
}

export function parsePaper(html: string, id: string): Paper {
  const $ = load(html);
  const title = clean($("h2, h1").filter((_, el) => !/lovely hat|cryptology eprint/i.test($(el).text())).first().text());
  const body = $("main, article, body").first();
  const text = body.text();
  const abstractHeading = $("h3, h4").filter((_, el) => /^abstract$/i.test(clean($(el).text()))).first();
  const abstract = clean(abstractHeading.nextUntil("h2, h3, h4").text());
  const labeled = (label: string) => {
    const match = text.match(new RegExp(`${label}\\s*:?\\s*([^\\n]+)`, "i"));
    return match?.[1] ? clean(match[1]) : undefined;
  };
  const authorText = clean($("h2, h1").filter((_, el) => clean($(el).text()) === title).next().text()) || labeled("Authors?") || "";
  const updated = text.match(/Last updated:\s*(\d{4}-\d{2}-\d{2})/i)?.[1];
  const submitted = text.match(/(?:Submitted|Received):\s*(\d{4}-\d{2}-\d{2})/i)?.[1];
  const category = labeled("Category");
  const version = labeled("Version");
  const keywords = (labeled("Keywords?") ?? "").split(/[,;]/).map(clean).filter(Boolean);
  return {
    id, title, authors: authors(authorText), keywords,
    ...(abstract ? { abstract } : {}), ...(category ? { category } : {}),
    ...(updated ? { updated } : {}), ...(submitted ? { submitted } : {}), ...(version ? { version } : {}),
    url: `https://eprint.iacr.org/${id}`, pdfUrl: `https://eprint.iacr.org/${id}.pdf`,
  };
}
