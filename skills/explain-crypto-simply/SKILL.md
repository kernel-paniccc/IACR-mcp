---
name: explain-crypto-simply
description: Give a short, technically accurate refresher for a cryptographic concept using intuition, a minimal worked example, essential notation, and common traps. Use when someone asks for a simple explanation, has forgotten a prerequisite, or needs terminology connected to a larger protocol; do not use when a formal proof or security audit is requested.
---

# Explain Cryptography Simply

Explain for a technically capable reader who may have forgotten the prerequisite. Optimize for rapid recovery of the concept, not for childlike wording or encyclopedic coverage.

Use this order:

1. **One sentence:** what the object does and what it does not guarantee.
2. **Intuition:** one concrete mental model. Mark where the analogy stops being exact.
3. **Minimal example:** use tiny symbolic or toy numeric values. Say explicitly that toy parameters are insecure.
4. **Exact core:** give the smallest definition, equation, or game needed to prevent misunderstanding.
5. **Why it appears here:** connect it to the user's surrounding protocol or question.
6. **Common trap:** name the most likely confusion.

Default to roughly 150–350 words. Expand only when the user asks or when omitting a prerequisite would make the explanation false.

Preserve distinctions that analogies often erase: hiding versus binding, correctness versus security, information-theoretic versus computational, passive versus active corruption, proof of knowledge versus proof of statement, and local computation versus communication.

For a forgotten primitive such as a Pedersen commitment, a good refresher includes `C = g^m h^r`, explains that fresh `r` hides `m`, identifies the discrete-log relation assumption behind binding, mentions its homomorphism, and warns that knowing `log_g(h)` breaks binding. Do not bury this core under historical context.

If terminology varies, list at most three common aliases and say whether they are exact synonyms. Cite a primary specification or paper when the explanation depends on a protocol-specific claim.
