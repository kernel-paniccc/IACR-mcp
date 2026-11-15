import { fileURLToPath } from "node:url";

/** Stable repository/package-relative paths; independent of process.cwd(). */
export const CATALOG_PATH = fileURLToPath(new URL("../data/catalog.db", import.meta.url));
