# Real/ideal simulation check

## Required specification

Extract or define:

- functionality `F`, including outputs, allowed leakage, abort behavior, and delivery guarantees;
- real protocol `π` and each party's inputs, randomness, messages, state, and outputs;
- environment/distinguisher and whether the model is standalone, sequential, concurrent, or UC;
- adversary: passive/active, static/adaptive, rushing/non-rushing, corruption bound;
- authenticated/private channels, broadcast, CRS/PKI/RO, preprocessing, erasures, and synchrony;
- computational, statistical, or perfect indistinguishability.

If the ideal functionality is absent, security cannot be evaluated as a real/ideal claim. Drafting a candidate functionality is useful, but label it as an assumption rather than the paper's definition.

## Check

1. Write the real and ideal experiments with identical external interfaces.
2. Enumerate the corrupted view: inputs learned by definition, randomness, messages, abort timing, and outputs.
3. For each item in the view, state how the simulator obtains or generates it without unavailable honest secrets.
4. Check consistency of simulated messages with later openings, corruptions, commitments, MAC checks, and outputs.
5. Identify the assumption or hybrid transition supporting each distribution change.
6. Check selective failure, input extraction, equivocation, rushing, malformed messages, and adaptive state exposure when applicable.
7. Verify that the ideal execution exposes the same abort/fairness/output behavior as the real protocol.
8. State the distinguishing advantage or the exact unresolved transition.

## Verdict rules

- Passing honest execution proves correctness only.
- Producing transcripts with the right shape is not simulation unless their joint distribution and consistency are justified.
- A simulator using an honest party's secret without extraction or ideal leakage invalidates the argument.
- A proof in the random-oracle, CRS, preprocessing, or erasure model must not be reported as plain-model security.
- Standalone simulation does not imply UC security.
