# IND game evaluation

## Specify the game

Record the scheme syntax and exact notion. For encryption, define `KeyGen`, `Enc`, and `Dec`; then state:

- public-key or secret-key setting;
- challenge messages and equal-length restriction;
- encryption/decryption oracle access before and after the challenge;
- adaptivity, nonce/IV rules, associated data, state, and multi-user setting;
- advantage convention, for example `|Pr[b'=b] - 1/2|`.

Do not use “IND-CPA” as a generic synonym for confidentiality of signatures, commitments, hashes, KEM composition, or an entire protocol. Select the appropriate game for the object.

## Evaluate

1. Check correctness and domain restrictions separately.
2. Attempt direct distinguishers first: determinism, repeated nonce, length leakage, malleable metadata, invalid randomness, or challenge-dependent failure.
3. Test boundary messages and adversarially chosen related messages permitted by the game.
4. If proving security, name the underlying assumption and construct the reduction's input, simulation, challenge embedding, output, and advantage loss.
5. Check that oracle simulation is possible and that challenge restrictions are enforced.
6. For composition, verify that the primitive's notion actually matches the surrounding protocol's usage.

## Report

Give an explicit adversary when the claim fails. When it holds conditionally, write the bound symbolically, including query and reduction losses. A successful toy experiment may demonstrate an attack or catch an error; it cannot establish asymptotic IND security.
