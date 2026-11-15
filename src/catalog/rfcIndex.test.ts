import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseRfcIndex } from "./rfcIndex.js";

const xml = `<rfc-index xmlns="https://www.rfc-editor.org/rfc-index"><rfc-entry><doc-id>RFC9591</doc-id><title>The FROST Threshold Schnorr Signature Protocol</title><author><name>A. Researcher</name></author><date><year>2024</year></date><keywords><kw>threshold cryptography</kw></keywords><abstract><p>A signing protocol.</p></abstract><current-status>INFORMATIONAL</current-status></rfc-entry><rfc-entry><doc-id>RFC9999</doc-id><title>Unrelated Network Plumbing</title><abstract><p>Routing only.</p></abstract></rfc-entry></rfc-index>`;

describe("RFC index ingestion", () => {
  it("keeps cryptography RFCs and excludes unrelated entries", () => {
    const entries = parseRfcIndex(xml, "https://www.rfc-editor.org/");
    assert.equal(entries.length, 1);
    assert.equal(entries[0]?.id, "rfc:9591");
    assert.match(entries[0]?.description ?? "", /threshold cryptography/);
  });
});
