import { load } from "cheerio";
import type { CatalogEntry } from "./types.js";

const CRYPTO_TERMS = /\b(cryptograph|cipher|signature|signing|zero[- ]knowledge|secret sharing|threshold|elliptic[- ]curve|curve25519|ed25519|ed448|hash function|key derivation|key exchange|authenticated encryption|message authentication|post[- ]quantum|lattice|kem\b|commitment|oblivious|randomness|random number|hkdf|hmac|aead)\w*/i;
const clean = (value: string) => value.replace(/\s+/g, " ").trim();

export function parseRfcIndex(xml: string, provenanceUrl: string): CatalogEntry[] {
  const $ = load(xml, { xmlMode: true });
  const result: CatalogEntry[] = [];
  $("rfc-entry").each((_, node) => {
    const entry = $(node);
    const docId = clean(entry.children("doc-id").first().text());
    const title = clean(entry.children("title").first().text());
    const abstract = clean(entry.children("abstract").first().text());
    const keywords = entry.find("keywords > kw").map((__, kw) => clean($(kw).text())).get();
    const searchable = `${title} ${keywords.join(" ")} ${abstract}`;
    if (!docId || !title || !CRYPTO_TERMS.test(searchable)) return;
    const number = docId.replace(/^RFC/i, "");
    const authors = entry.children("author").map((__, author) => clean($(author).find("name").first().text())).get();
    const year = clean(entry.find("date > year").first().text());
    const status = clean(entry.children("current-status").first().text());
    const description = [authors.length ? `Authors: ${authors.join(", ")}.` : "", year ? `Published: ${year}.` : "", status ? `Status: ${status}.` : "", keywords.length ? `Keywords: ${keywords.join(", ")}.` : "", abstract].filter(Boolean).join(" ");
    result.push({
      id: `rfc:${number}`, sourceId: "rfc-editor-crypto", kind: "standard", category: "rfc/cryptography",
      name: `${docId}: ${title}`, description,
      url: `https://www.rfc-editor.org/rfc/rfc${number.toLowerCase()}.html`,
      links: [`https://www.rfc-editor.org/info/rfc${number.toLowerCase()}/`, `https://www.rfc-editor.org/rfc/rfc${number.toLowerCase()}.pdf`],
      provenanceUrl,
    });
  });
  return result;
}
