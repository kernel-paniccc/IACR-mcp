import { readFile } from "node:fs/promises";
import type { SourceDefinition } from "./types.js";

interface Registry { version: number; sources: SourceDefinition[] }

export async function loadRegistry(url = new URL("../../sources/registry.json", import.meta.url)): Promise<Registry> {
  const value = JSON.parse(await readFile(url, "utf8")) as Registry;
  if (value.version !== 1 || !Array.isArray(value.sources)) throw new Error("Unsupported source registry");
  return value;
}
