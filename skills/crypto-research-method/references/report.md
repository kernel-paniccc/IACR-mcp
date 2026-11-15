# Report contract

Return this compact structure, omitting empty fields:

```text
Verdict: PASS | FAIL | CONDITIONAL | INSUFFICIENT-SPECIFICATION
Claim: one precise sentence
Model: n, t, adversary, setup/network, security notion

Decisive checks:
- check → result → evidence or derivation

Counterexample/attack: smallest witness, if found
Unproved obligations: what remains before the claim is established
Sources: primary citations with exact theorem/section when available
Confidence: high | medium | low, with one reason
```

`PASS` means the requested bounded check passed under the stated model. It does not certify an implementation or replace peer review. Use `CONDITIONAL` when the result follows only after explicit assumptions. Use `INSUFFICIENT-SPECIFICATION` when different reasonable models change the answer.

For numeric comparisons, add a small table with symbolic expressions before substituting parameters. State the counted unit: field/ring operation, bit operation, message, field element, byte, round, or wall-clock measurement.
