# Protocol cost comparison

## Normalize before counting

Specify:

- functionality or circuit and its numbers of additions, scalar multiplications, secret multiplications, openings, and comparisons;
- field/ring and element size;
- party count `n`, corruption threshold `t`, and sharing representation;
- offline versus online phase;
- local operations, communication volume, message count, rounds, preprocessing, memory, and setup as separate metrics;
- amortized or single-instance execution and LAN/WAN assumptions.

## Symbolic accounting

Derive costs using named variables before inserting numbers. With ordinary linear secret sharing, adding two shared values is normally local: each party adds its share. This suggests `n` local field additions and no communication for one logical addition, but replicated representations may require more local component operations.

BGW multiplication is not comparable to addition by counting only arithmetic instructions: multiplying shares raises polynomial degree, and degree reduction introduces communication and additional field operations. State the exact BGW variant and whether preprocessing or batching is present.

## Comparison rules

- Compare protocols at the same security level and output guarantee.
- Do not mix field operations with bit operations without an explicit conversion model.
- Do not hide preprocessing or trusted-dealer work.
- Treat asymptotic equality as distinct from practical equality; constants, serialization, networking, and vectorization matter.
- If implementation benchmarks are used, report hardware, network, parameters, batch size, compiler/version, and variance.
- When data is missing, give symbolic crossover conditions rather than inventing constants.
