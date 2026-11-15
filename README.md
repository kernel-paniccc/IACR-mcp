# Open Cryptography Research MCP

Open, local-first research infrastructure for modern cryptography. The project builds a reproducible catalog from public sources and exposes low-latency retrieval through MCP. IACR is one source, not the product boundary.

## Tools

- `search_papers` — full-text IACR search with phrases, boolean operators, `title:`, `author:`, wildcards, category/year filters and structured results.
- `get_paper` — normalized metadata, abstract, canonical landing page and PDF URL.
- `get_bibtex` — canonical BibTeX from IACR.
- `research_search` — offline FTS5 search over the normalized public catalog with provenance and trust levels.
- `catalog_status` — indexed source and entry counts.

This is an unofficial client. ePrint papers are preprints and are not peer reviewed by IACR.

## Run

Requires Node.js 20+.

```bash
npm install
npm run setup
node dist/index.js
```

Example MCP client configuration:

```json
{
  "mcpServers": {
    "iacr": {
      "command": "node",
      "args": ["/absolute/path/to/IACR-mcp/dist/index.js"]
    }
  }
}
```

## Development

```bash
npm run check
```

## Research skills

The repository ships reusable agent methodology separately from retrieval:

- [`crypto-research-method`](skills/crypto-research-method/SKILL.md) routes bounded checks to real/ideal simulation, IND games, corruption-threshold calculations, or normalized cost comparisons. It produces a concise verdict with explicit assumptions and unproved obligations.
- [`explain-crypto-simply`](skills/explain-crypto-simply/SKILL.md) provides a compact technical refresher with intuition, a toy example, the essential definition, and the most likely conceptual trap.

These skills do not turn passing model tests into security proofs and do not treat secondary catalogs as evidence for cryptographic claims.

The first catalog adapter ingests [awesome-mpc](https://github.com/rdragos/awesome-mpc) as a secondary discovery registry. Claims from curated lists are never promoted to primary-source evidence. Personal notes and private corpora are outside the public index; optional local overlays will remain separate.

The repository includes a ready-to-query catalog snapshot at `data/catalog.db`. Runtime paths are resolved relative to the installed package, not the caller's current directory, and no catalog environment variable is required. `npm run ingest` refreshes the snapshot from the public source registry.

The server does not claim semantic/full-PDF search yet. Current search is deterministic SQLite FTS5; primary-source resolution, terminology aliases, graph traversal, and hybrid retrieval are subsequent layers.
