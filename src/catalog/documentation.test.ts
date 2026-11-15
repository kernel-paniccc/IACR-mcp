import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseDocumentation } from "./documentation.js";
import type { SourceDefinition } from "./types.js";

const source: SourceDefinition = { id: "docs-test", name: "Test MPC", kind: "framework_documentation", trust: "primary_source", url: "https://docs.test/", contentUrl: "https://docs.test/protocols", license: "test", enabled: true };

describe("framework documentation ingestion", () => {
  it("indexes sections instead of one monolithic page", () => {
    const entries = parseDocumentation(`<main><h1 id="protocols">Protocols</h1><p>Supports malicious secure computation using preprocessing.</p><h2 id="setup">Setup</h2><p>The setup assumptions must be selected explicitly by the operator.</p></main>`, source);
    assert.equal(entries.length, 2);
    assert.match(entries[0]?.url ?? "", /#protocols$/);
    assert.match(entries[1]?.description ?? "", /setup assumptions/i);
  });
});
