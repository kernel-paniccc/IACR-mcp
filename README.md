# Cryptography Research Assistant MCP

This open-source MCP turns a general-purpose agent into a cryptography research assistant. It gives the agent fast access to papers, abstracts, citations, standards and framework documentation, together with reusable methods for checking REAL/IDEAL simulations, IND security games, corruption thresholds and protocol costs.

The goal is not to replace cryptographic proofs or expert review. The assistant keeps assumptions, adversary models, source provenance and unresolved proof obligations visible instead of presenting a plausible explanation as a security result.

## Knowledge base

The local, reproducible catalog is built from public sources:

- [IACR Cryptology ePrint Archive](https://eprint.iacr.org/) metadata and abstracts, harvested through the official OAI-PMH endpoint;
- [awesome-mpc](https://github.com/rdragos/awesome-mpc) as an open-source discovery registry;
- RFC Editor cryptography-related standards;
- official MP-SPDZ, MPyC and SecretFlow SPU documentation.

IACR metadata and official documentation are treated as primary metadata or primary sources. Curated repositories such as `awesome-mpc` are discovery aids, not evidence for a security claim. The repository contains a ready-to-query snapshot, source adapters, terminology aliases and research skills; it does not depend on a private knowledge base.

## Install

Requires Node.js 22.13+.

```bash
git clone https://github.com/kernel-paniccc/IACR-mcp.git
cd IACR-mcp
chmod +x install.sh
./install.sh
```

The installer uses the bundled offline catalog, installs pinned dependencies, builds the server, runs the tests and prints the MCP configuration with the correct absolute path. It does not silently modify an agent's global configuration.

## Tools

- `search_papers` — full-text IACR search with phrases, boolean operators, `title:`, `author:`, wildcards, category/year filters and structured results.
- `get_paper` — normalized metadata, abstract, canonical landing page and PDF URL.
- `get_recent_papers` — newest publications from the official publication-ordered IACR RSS feed.
- `get_paper_url` — validated canonical landing-page, PDF and BibTeX URLs without a network download.
- `get_bibtex` — canonical BibTeX from IACR.
- `research_search` — offline terminology-aware search over the normalized public catalog with provenance and trust levels. It expands common cryptographic acronyms and falls back to ranked partial matches when a natural-language query is too restrictive.
- `catalog_status` — indexed source and entry counts.

This is an unofficial client. ePrint papers are preprints and are not peer reviewed by IACR.

Example configuration printed by the installer:

```json
{
  "mcpServers": {
    "cryptography_research": {
      "command": "node",
      "args": ["/absolute/path/to/IACR-mcp/dist/index.js"]
    }
  }
}
```

## Development

```bash
npm run ingest  # refresh all public sources
npm run check
```

## Research skills

The repository ships reusable agent methodology separately from retrieval:

- [`crypto-research-method`](skills/crypto-research-method/SKILL.md) routes bounded checks to real/ideal simulation, IND games, corruption-threshold calculations, or normalized cost comparisons. It produces a concise verdict with explicit assumptions and unproved obligations.
- [`explain-crypto-simply`](skills/explain-crypto-simply/SKILL.md) provides a compact technical refresher with intuition, a toy example, the essential definition, and the most likely conceptual trap.

These skills do not turn passing model tests into security proofs and do not treat secondary catalogs as evidence for cryptographic claims.

The repository includes a ready-to-query catalog snapshot at `data/catalog.db`. Runtime paths are resolved relative to the installed package, not the caller's current directory, and no catalog environment variable is required. `npm run ingest` refreshes the snapshot from the public source registry.

The bundled snapshot contains public IACR ePrint metadata and abstracts harvested through the official OAI-PMH endpoint, plus standards, framework documentation, and curated discovery sources. Search is deterministic SQLite FTS5 with primary-source ranking and an explicit terminology layer (including OLE/VOLE, VRSS, TTP/TFP, FROST/TSS-related vocabulary). It does not index or claim semantic search over full PDF bodies.
