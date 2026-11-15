import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAwesomeMpc } from "./awesomeMpc.js";
import { CatalogStore } from "./store.js";
import type { SourceDefinition } from "./types.js";

const markdown = `## Software\n### Frameworks\n- [MP-SPDZ](https://github.com/data61/MP-SPDZ) - MPC supporting malicious or semi-honest adversaries. | [paper](https://eprint.iacr.org/2020/521)\n### Protocols\n- [FROST](https://example.test/frost) - Threshold Schnorr signing.`;

const source: SourceDefinition = { id: "awesome-mpc", name: "awesome-mpc", kind: "curated_registry", trust: "secondary", url: "https://github.com/rdragos/awesome-mpc", license: "waiver", enabled: true };

describe("awesome-mpc ingestion", () => {
  it("extracts typed entries with provenance", () => {
    const entries = parseAwesomeMpc(markdown, source.url);
    assert.equal(entries.length, 2);
    assert.equal(entries[0]?.kind, "framework");
    assert.equal(entries[0]?.sourceId, "awesome-mpc");
  });
  it("indexes entries with FTS5", () => {
    const store = new CatalogStore();
    store.replaceSource(source, parseAwesomeMpc(markdown, source.url));
    const hits = store.search("malicious adversaries");
    assert.equal(hits[0]?.name, "MP-SPDZ");
    assert.equal(hits[0]?.trust, "secondary");
    store.close();
  });
});
