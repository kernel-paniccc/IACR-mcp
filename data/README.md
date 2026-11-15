# Catalog snapshot

`catalog.db` is the ready-to-query SQLite FTS5 snapshot shipped with the repository. It is derived from the public sources declared in `sources/registry.json`; every indexed entry retains its source and provenance URL.

Refresh it with:

```bash
npm run ingest
```

The database is a derived search artifact, not an authoritative copy of the underlying publications or documentation. Source-specific rights remain with their respective authors and publishers.
