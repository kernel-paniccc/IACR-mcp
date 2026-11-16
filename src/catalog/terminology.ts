const ALIASES: ReadonlyArray<ReadonlyArray<string>> = [
  ["TTP", "trusted third party"],
  ["TFP", "trusted first party"],
  ["OLE", "oblivious linear evaluation", "oblivious linear function evaluation"],
  ["VOLE", "vector oblivious linear evaluation", "vector OLE"],
  ["VRSS", "verifiable replicated secret sharing", "verifiable random secret sharing"],
  ["VSS", "verifiable secret sharing"],
  ["RSS", "replicated secret sharing"],
  ["PRSS", "pseudorandom secret sharing"],
  ["MPC", "secure multiparty computation", "multi-party computation"],
  ["TSS", "threshold signature scheme", "threshold signatures"],
  ["DKG", "distributed key generation"],
  ["ZK", "zero knowledge"],
];

const escape = (value: string) => `"${value.replace(/"/g, "\"")}"`;
const words = (query: string) => query.match(/[\p{L}\p{N}_+-]+/gu) ?? [];
const phraseClause = (value: string) => {
  const parts = words(value);
  if (parts.length < 2) return escape(value);
  return `(${escape(value)} OR (${parts.map(escape).join(" AND ")}))`;
};

export interface SearchPlan {
  original: string;
  expandedTerms: string[];
  strict: string;
  broad: string;
}

export function planSearch(query: string): SearchPlan {
  const rawTerms = words(query);
  const groups: string[][] = [];
  const consumed = new Set<string>();
  for (const term of rawTerms) {
    const key = term.toLocaleLowerCase("en-US");
    if (consumed.has(key)) continue;
    const aliases = ALIASES.find((group) => group.some((alias) => alias.toLocaleLowerCase("en-US") === key));
    const group = aliases ? [...aliases] : [term];
    group.forEach((item) => item.split(/\s+/).forEach((part) => consumed.add(part.toLocaleLowerCase("en-US"))));
    groups.push(group);
  }
  const clauses = groups.map((group) => group.length === 1
    ? escape(group[0]!)
    : `(${group.map(phraseClause).join(" OR ")})`);
  return {
    original: query,
    expandedTerms: [...new Set(groups.flat())],
    strict: clauses.join(" AND "),
    broad: clauses.join(" OR "),
  };
}
