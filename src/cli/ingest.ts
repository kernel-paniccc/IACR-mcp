import { resolve } from "node:path";
import { ingestPublicCatalog } from "../catalog/ingest.js";
import { CatalogStore } from "../catalog/store.js";

const path = resolve(process.env.IACR_MCP_DB ?? "data/catalog.db");
const store = new CatalogStore(path);
const report = await ingestPublicCatalog(store);
console.log(JSON.stringify({ path, ...store.stats(), ...report }, null, 2));
store.close();
if (report.updated.length === 0 && report.failed.length > 0) process.exitCode = 1;
