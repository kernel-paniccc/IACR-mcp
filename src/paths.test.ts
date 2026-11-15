import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { isAbsolute } from "node:path";
import { describe, it } from "node:test";
import { CATALOG_PATH } from "./paths.js";

describe("packaged catalog path", () => {
  it("is absolute and independent of process.cwd()", () => {
    assert.equal(isAbsolute(CATALOG_PATH), true);
    assert.equal(existsSync(CATALOG_PATH), true);
    assert.match(CATALOG_PATH, /data\/catalog\.db$/);
  });
});
