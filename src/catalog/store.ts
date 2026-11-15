import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { CatalogEntry, CatalogSearchHit, SourceDefinition, SourceTrust } from "./types.js";

interface SearchRow {
  id: string; source_id: string; kind: string; category: string; name: string;
  description: string; url: string | null; links: string; provenance_url: string;
  source_name: string; trust: SourceTrust; score: number;
}

export class CatalogStore {
  private readonly db: DatabaseSync;

  constructor(path = ":memory:", options: { readOnly?: boolean } = {}) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path, { readOnly: options.readOnly ?? false });
    if (options.readOnly) return;
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      CREATE TABLE IF NOT EXISTS sources (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL, trust TEXT NOT NULL,
        url TEXT NOT NULL, license TEXT NOT NULL, updated_at TEXT NOT NULL
      ) STRICT;
      CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY, source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
        kind TEXT NOT NULL, category TEXT NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL,
        url TEXT, links TEXT NOT NULL, provenance_url TEXT NOT NULL
      ) STRICT;
      CREATE VIRTUAL TABLE IF NOT EXISTS entries_fts USING fts5(
        id UNINDEXED, name, description, kind, category, tokenize='unicode61 remove_diacritics 2'
      );
    `);
  }

  replaceSource(source: SourceDefinition, entries: CatalogEntry[]): void {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      this.db.prepare(`INSERT INTO sources(id,name,kind,trust,url,license,updated_at) VALUES(?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name,kind=excluded.kind,trust=excluded.trust,url=excluded.url,license=excluded.license,updated_at=excluded.updated_at`)
        .run(source.id, source.name, source.kind, source.trust, source.url, source.license, new Date().toISOString());
      const oldIds = this.db.prepare("SELECT id FROM entries WHERE source_id = ?").all(source.id) as Array<{ id: string }>;
      const deleteFts = this.db.prepare("DELETE FROM entries_fts WHERE id = ?");
      for (const row of oldIds) deleteFts.run(row.id);
      this.db.prepare("DELETE FROM entries WHERE source_id = ?").run(source.id);
      const insert = this.db.prepare("INSERT INTO entries(id,source_id,kind,category,name,description,url,links,provenance_url) VALUES(?,?,?,?,?,?,?,?,?)");
      const insertFts = this.db.prepare("INSERT INTO entries_fts(id,name,description,kind,category) VALUES(?,?,?,?,?)");
      for (const entry of entries) {
        insert.run(entry.id, entry.sourceId, entry.kind, entry.category, entry.name, entry.description, entry.url ?? null, JSON.stringify(entry.links), entry.provenanceUrl);
        insertFts.run(entry.id, entry.name, entry.description, entry.kind, entry.category);
      }
      this.db.exec("COMMIT");
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }

  search(query: string, limit = 10): CatalogSearchHit[] {
    const normalized = query.trim().split(/\s+/).map((term) => `\"${term.replace(/\"/g, "\"\"")}\"`).join(" AND ");
    if (!normalized) return [];
    const rows = this.db.prepare(`
      SELECT e.*, s.name AS source_name, s.trust, bm25(entries_fts, 0, 8, 2, 1, 1) AS score
      FROM entries_fts f JOIN entries e ON e.id=f.id JOIN sources s ON s.id=e.source_id
      WHERE entries_fts MATCH ? ORDER BY score LIMIT ?
    `).all(normalized, Math.min(Math.max(limit, 1), 50)) as unknown as SearchRow[];
    return rows.map((row) => ({
      id: row.id, sourceId: row.source_id, kind: row.kind, category: row.category,
      name: row.name, description: row.description, ...(row.url ? { url: row.url } : {}),
      links: JSON.parse(row.links) as string[], provenanceUrl: row.provenance_url,
      sourceName: row.source_name, trust: row.trust, score: -row.score,
    }));
  }

  stats(): { sources: number; entries: number } {
    const sources = this.db.prepare("SELECT count(*) AS n FROM sources").get() as { n: number };
    const entries = this.db.prepare("SELECT count(*) AS n FROM entries").get() as { n: number };
    return { sources: sources.n, entries: entries.n };
  }

  close(): void { this.db.close(); }
}
