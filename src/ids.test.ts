import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizePaperId } from "./ids.js";

describe("normalizePaperId", () => {
  it("accepts IDs and canonical URLs", () => {
    assert.equal(normalizePaperId("2024/1234"), "2024/1234");
    assert.equal(normalizePaperId("https://eprint.iacr.org/2024/1234.pdf"), "2024/1234");
  });
  it("rejects arbitrary URLs and malformed IDs", () => {
    assert.throws(() => normalizePaperId("https://evil.test/2024/1234"));
    assert.throws(() => normalizePaperId("../../etc/passwd"));
  });
});
