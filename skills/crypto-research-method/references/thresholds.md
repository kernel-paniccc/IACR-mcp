# Corruption-threshold calculation

Never infer `t` from `n` alone. First identify the protocol family, adversary, network/setup, and required guarantee.

## Integer bounds

For a strict condition `n > k t`, the largest integer threshold is:

```text
t_max = floor((n - 1) / k)
```

Common reference points, not universal laws:

| Setting | Typical condition | Maximum integer `t` |
|---|---:|---:|
| Shamir privacy before reconstruction | threshold follows the sharing degree | protocol-dependent |
| BGW-style passive multiplication | `n > 2t` | `floor((n-1)/2)` |
| Synchronous information-theoretic active MPC with guaranteed output | `n > 3t` | `floor((n-1)/3)` |
| Computational MPC with abort and dishonest majority | often `t < n` | protocol/setup-dependent |

Do not apply the BGW bound automatically to SPDZ, two-party computation, threshold signatures, asynchronous MPC, identifiable abort, or protocols with trusted preprocessing.

## Procedure

1. State whether `t` counts corrupted parties, faulty processes, or unavailable signers.
2. Separate privacy, correctness, reconstruction, robustness, fairness, and guaranteed output; they may have different bounds.
3. Translate the protocol's strict/non-strict inequality carefully.
4. Substitute `n`, compute the integer boundary, and test `t_max` and `t_max + 1`.
5. Explain the structural reason for the bound, such as degree after multiplication, quorum intersection, error correction, or honest-majority requirement.
