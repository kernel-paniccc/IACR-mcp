const PAPER_ID = /^(19|20)\d{2}\/[1-9]\d{0,4}$/;

export function normalizePaperId(value: string): string {
  const id = value.trim()
    .replace(/^https?:\/\/eprint\.iacr\.org\//i, "")
    .replace(/\.(?:pdf|ps)$/i, "")
    .replace(/\/$/, "");
  if (!PAPER_ID.test(id)) {
    throw new Error(`Invalid IACR ePrint identifier: ${value}`);
  }
  return id;
}
