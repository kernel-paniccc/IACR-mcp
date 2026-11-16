import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CatalogStore } from "./store.js";
import { planSearch } from "./terminology.js";
import type { SourceDefinition } from "./types.js";

const source: SourceDefinition = { id: "test", name: "Primary", kind: "paper_archive", trust: "primary_metadata", url: "https://example.test", license: "test", enabled: true };

describe("terminology-aware search", () => {
  it("expands ambiguous research acronyms", () => {
    const plan = planSearch("VRSS active adversary");
    assert.ok(plan.expandedTerms.includes("verifiable replicated secret sharing"));
    assert.ok(plan.expandedTerms.includes("verifiable random secret sharing"));
  });

  it("falls back to ranked partial matches for natural compound queries", () => {
    const store = new CatalogStore();
    store.replaceSource(source, [{ id: "test:1", sourceId: "test", kind: "documentation", category: "MPC", name: "Trusted preprocessing", description: "A trusted third party (TTP) generates correlated randomness.", url: "https://example.test/ttp", links: [], provenanceUrl: "https://example.test" }]);
    const result = store.searchDetailed("CrypTen TTP TFP", 10);
    assert.equal(result.strategy, "broad");
    assert.equal(result.total, 1);
    assert.equal(result.hits[0]?.name, "Trusted preprocessing");
    store.close();
  });

  it("finds acronym queries through their long form", () => {
    const store = new CatalogStore();
    store.replaceSource(source, [{ id: "test:2", sourceId: "test", kind: "paper", category: "MPC", name: "Linear correlations", description: "We construct vector oblivious linear evaluation correlations.", links: [], provenanceUrl: "https://example.test" }]);
    assert.equal(store.search("VOLE")[0]?.name, "Linear correlations");
    store.close();
  });
});
