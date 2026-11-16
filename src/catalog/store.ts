import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { CatalogEntry, CatalogSearchHit, SourceDefinition, SourceTrust } from "./types.js";
import { planSearch, type SearchPlan } from "./terminology.js";

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
        name, description, kind, category, content='', contentless_delete=1,
        tokenize='unicode61 remove_diacritics 2'
      );
    `);
  }

  replaceSource(source: SourceDefinition, entries: CatalogEntry[]): void {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      this.db.prepare(`INSERT INTO sources(id,name,kind,trust,url,license,updated_at) VALUES(?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name,kind=excluded.kind,trust=excluded.trust,url=excluded.url,license=excluded.license,updated_at=excluded.updated_at`)
        .run(source.id, source.name, source.kind, source.trust, source.url, source.license, new Date().toISOString());
      const oldIds = this.db.prepare("SELECT rowid FROM entries WHERE source_id = ?").all(source.id) as Array<{ rowid: number }>;
      const deleteFts = this.db.prepare("DELETE FROM entries_fts WHERE rowid = ?");
      for (const row of oldIds) deleteFts.run(row.rowid);
      this.db.prepare("DELETE FROM entries WHERE source_id = ?").run(source.id);
      const insert = this.db.prepare("INSERT INTO entries(id,source_id,kind,category,name,description,url,links,provenance_url) VALUES(?,?,?,?,?,?,?,?,?)");
      const insertFts = this.db.prepare("INSERT INTO entries_fts(rowid,name,description,kind,category) VALUES(?,?,?,?,?)");
      for (const entry of entries) {
        const result = insert.run(entry.id, entry.sourceId, entry.kind, entry.category, entry.name, entry.description, entry.url ?? null, JSON.stringify(entry.links), entry.provenanceUrl);
        insertFts.run(result.lastInsertRowid, entry.name, entry.description, entry.kind, entry.category);
      }
      this.db.exec("COMMIT");
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }

  private runSearch(expression: string, limit: number): CatalogSearchHit[] {
    const rows = this.db.prepare(`
      SELECT e.*, s.name AS source_name, s.trust,
        bm25(entries_fts, 0, 10, 3, 1, 1) - CASE s.trust WHEN 'primary_source' THEN 2.0 WHEN 'primary_metadata' THEN 1.5 ELSE 0 END AS score
      FROM entries_fts f JOIN entries e ON e.rowid=f.rowid JOIN sources s ON s.id=e.source_id
      WHERE entries_fts MATCH ? ORDER BY score LIMIT ?
    `).all(expression, Math.min(Math.max(limit, 1), 50)) as unknown as SearchRow[];
    return rows.map((row) => ({
      id: row.id, sourceId: row.source_id, kind: row.kind, category: row.category,
      name: row.name, description: row.description, ...(row.url ? { url: row.url } : {}),
      links: JSON.parse(row.links) as string[], provenanceUrl: row.provenance_url,
      sourceName: row.source_name, trust: row.trust, score: -row.score,
    }));
  }

  private countSearch(expression: string): number {
    const row = this.db.prepare("SELECT count(*) AS n FROM entries_fts WHERE entries_fts MATCH ?").get(expression) as { n: number };
    return row.n;
  }

  searchDetailed(query: string, limit = 10): { hits: CatalogSearchHit[]; total: number; strategy: "strict" | "broad" | "none"; plan: SearchPlan } {
    const plan = planSearch(query);
    if (!plan.strict) return { hits: [], total: 0, strategy: "none", plan };
    const strict = this.runSearch(plan.strict, limit);
    if (strict.length > 0) return { hits: strict, total: this.countSearch(plan.strict), strategy: "strict", plan };
    const broad = this.runSearch(plan.broad, limit);
    return { hits: broad, total: broad.length ? this.countSearch(plan.broad) : 0, strategy: broad.length ? "broad" : "none", plan };
  }

  search(query: string, limit = 10): CatalogSearchHit[] {
    return this.searchDetailed(query, limit).hits;
  }

  stats(): { sources: number; entries: number } {
    const sources = this.db.prepare("SELECT count(*) AS n FROM sources").get() as { n: number };
    const entries = this.db.prepare("SELECT count(*) AS n FROM entries").get() as { n: number };
    return { sources: sources.n, entries: entries.n };
  }

  close(): void { this.db.close(); }
}
