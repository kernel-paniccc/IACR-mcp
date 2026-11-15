---
name: crypto-research-method
description: Run bounded, reproducible cryptographic analysis tasks such as real/ideal simulation checks, IND security games, corruption-threshold calculations, and protocol cost comparisons. Use for a concrete claim, construction, parameter set, or comparison; do not invoke for a general literature survey or a request to implement a production cryptosystem.
---

# Cryptography Research Method

Turn the request into a small analysis job with explicit inputs, assumptions, checks, and a concise verdict. A successful run may find an unresolved proof obligation; never turn missing definitions or a plausible sketch into a security proof.

## Route the task

Read only the matching method:

- Real/ideal security, simulation, leakage, ideal functionality, UC/standalone: [references/real-ideal.md](references/real-ideal.md).
- IND-CPA, IND-CCA, indistinguishability games, reductions or attacks: [references/ind-games.md](references/ind-games.md).
- Compute or validate `t`, honest/dishonest majority, resilience bounds: [references/thresholds.md](references/thresholds.md).
- Compare additive/multiplicative work, rounds, communication, preprocessing, or BGW costs: [references/cost-comparison.md](references/cost-comparison.md).

For mixed requests, read each applicable method but produce one report. Always read [references/report.md](references/report.md) before delivering the result.

## Shared invariants

1. Restate the exact object and property being evaluated. Separate a protocol, an implementation, and a paper's claim.
2. Make the model explicit: parties, corruption type and timing, threshold, network, setup, abort/fairness/output guarantees, computational or statistical setting, and composition model.
3. Identify missing inputs. Continue with clearly labeled conditional cases when that is more useful than stopping; never silently choose a stronger or weaker model.
4. Use primary sources for attributed security claims. Treat catalogs, notes, blogs, and implementations as discovery evidence until resolved to a specification or paper.
5. Check correctness separately from privacy, authenticity, robustness, fairness, and availability.
6. Distinguish a calculation, an executable experiment, a proof sketch, a reduction, and a complete proof.
7. Prefer the smallest counterexample or distinguishing strategy when a claim fails.
8. Keep the final report short enough to delegate: result first, assumptions and decisive reasoning next, open obligations last.

If code or algebra can test a finite claim, run it with boundary cases and record what it establishes. Do not present finite testing as a proof for unbounded parameters.
