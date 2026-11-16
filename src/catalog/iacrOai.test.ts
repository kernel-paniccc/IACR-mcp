import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseIacrOaiPage } from "./iacrOai.js";
import type { SourceDefinition } from "./types.js";

const source: SourceDefinition = { id: "iacr-eprint", name: "IACR ePrint", kind: "paper_archive", trust: "primary_metadata", url: "https://eprint.iacr.org/", license: "metadata", enabled: true };
const fixture = `<?xml version="1.0"?><OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/" xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:dc="http://purl.org/dc/elements/1.1/"><ListRecords><record><header><identifier>oai:eprint.iacr.org:2024/123</identifier></header><metadata><oai_dc:dc><dc:title>Fast VOLE for MPC</dc:title><dc:creator>Alice</dc:creator><dc:creator>Bob</dc:creator><dc:subject>Cryptographic protocols</dc:subject><dc:description>Vector oblivious linear evaluation.</dc:description><dc:date>2024-01-02</dc:date></oai_dc:dc></metadata></record><resumptionToken completeListSize="42" cursor="1">next token</resumptionToken></ListRecords></OAI-PMH>`;

describe("IACR OAI-PMH ingestion", () => {
  it("normalizes paper metadata and pagination", () => {
    const page = parseIacrOaiPage(fixture, source);
    assert.equal(page.completeListSize, 42);
    assert.equal(page.resumptionToken, "next token");
    assert.equal(page.entries[0]?.id, "iacr-eprint:2024/123");
    assert.match(page.entries[0]?.description ?? "", /Alice, Bob/);
    assert.equal(page.entries[0]?.url, "https://eprint.iacr.org/2024/123");
  });
});
