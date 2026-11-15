import { ingestPublicCatalog } from "../catalog/ingest.js";
import { CatalogStore } from "../catalog/store.js";
import { CATALOG_PATH } from "../paths.js";

const store = new CatalogStore(CATALOG_PATH);
const report = await ingestPublicCatalog(store);
console.log(JSON.stringify({ path: CATALOG_PATH, ...store.stats(), ...report }, null, 2));
store.close();
if (report.updated.length === 0 && report.failed.length > 0) process.exitCode = 1;
