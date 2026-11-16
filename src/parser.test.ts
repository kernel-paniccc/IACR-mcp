import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { IacrClient } from "./iacr.js";
import { parseRecentRss } from "./parser.js";

const rss = `<?xml version="1.0"?><rss xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><item><title>Recent MPC Paper</title><link>https://eprint.iacr.org/2026/42</link><description>An abstract.</description><category>Cryptographic protocols</category><enclosure url="https://eprint.iacr.org/2026/42.pdf"/><pubDate>Sun, 15 Nov 2026 12:00:00 +0000</pubDate><dc:creator>Alice</dc:creator><dc:creator>Bob</dc:creator></item></channel></rss>`;

describe("recent papers and canonical links", () => {
  it("parses all RSS authors and canonical metadata", () => {
    const result = parseRecentRss(rss, "https://eprint.iacr.org/rss/rss.xml?order=recent", 10);
    assert.equal(result.total, 1);
    assert.deepEqual(result.papers[0]?.authors, ["Alice", "Bob"]);
    assert.equal(result.papers[0]?.updated, "2026-11-15");
    assert.equal(result.papers[0]?.pdfUrl, "https://eprint.iacr.org/2026/42.pdf");
  });

  it("validates IDs before generating URLs", () => {
    const client = new IacrClient();
    assert.deepEqual(client.getPaperUrls("https://eprint.iacr.org/2024/123.pdf"), {
      id: "2024/123",
      url: "https://eprint.iacr.org/2024/123",
      pdfUrl: "https://eprint.iacr.org/2024/123.pdf",
      bibtexUrl: "https://eprint.iacr.org/2024/123.bib",
    });
    assert.throws(() => client.getPaperUrls("../../etc/passwd"), /Invalid IACR/);
  });
});
