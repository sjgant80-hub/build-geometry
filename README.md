# build-geometry

**▶ Live: https://sjgant80-hub.github.io/build-geometry/**

The five Platonic solids as **five organ-jobs**, so the architecture reads at a glance. Every organ of a
node gets a shape:

| solid | V·E·F | organ-job |
|---|---|---|
| **tetrahedron** | 4·6·4 | INIT — birth (self-dual, authors itself) |
| **cube** | 8·12·6 | BUILD — the node / working unit |
| **octahedron** | 6·12·8 | VERIFY — the gate (dual of the cube) |
| **dodecahedron** | 20·30·12 | REMEMBER — memory (the golden-ratio solid) |
| **icosahedron** | 12·30·20 | EXPLORE — the scout (dual of memory) |

The two **dual pairs** are the mechanism, not decoration: **cube ⋈ octa** (build ⋈ verify — the gate is the
working unit read inside-out) and **dodeca ⋈ icosa** (remember ⋈ explore — you explore *from* what you
remember). The geometry is **real**: Euler's `V − E + F = 2` holds for each, and duality is the face↔vertex
swap (`verifySolid`, `dualPair` check it).

A node runs all five as a lifecycle and is **mature only when all five are held ≥ κ**. The two that persist a
**self** — VERIFY + REMEMBER (octa + dodeca) — are **scarce**: a node that builds, is born, and explores but
does not verify or remember is **provably-fit and a cripple** (`maturity` flags it `CRIPPLE`, never `MATURED`).

## The law (`kernel.mjs`)

- `verifySolid(name)` — Euler + duality hold (real geometry).
- `dualPair(a, b)` — the face↔vertex swap of duality.
- `shapeOfJob(job)` / `jobOfShape(name)` — the legibility map.
- `inscribes(inner, outer)` — the nesting: the **cube carries its dodeca** (memory inside the working unit).
- `maturity(phases)` — `MATURED` / `CRIPPLE` (missing a scarce self-shape) / `IMMATURE`.

Pure and total: the kernel never throws on garbage; it returns `{ ok: false, why }`.

## Composes the estate

- [fallkard](https://github.com/sjgant80-hub/fallkard) — the §26 five-solids lifecycle + maturity rule (composed, not rebuilt).
- [mesh-self](https://github.com/sjgant80-hub/mesh-self) — a node is a cube+dodeca+octa+icosa+tetra; the mesh of coupled node-tori is a bigger dodeca.
- [dream-gate](https://github.com/sjgant80-hub/dream-gate) — memory (the dodeca) that grows.

## Honest scope

**Real:** the geometry — vertices, edges, faces, Euler, the duality pairs. **Lens (kept private, not shipped
as claim):** the "quine builds itself", the spin-into-torus, the turtling — a design *language* that makes the
architecture legible, not a proof. Why the dodecahedron is memory: memory must be aperiodic (perfect recall
carries no lesson), and the dodecahedron is the golden-ratio solid that will not repeat.

## Proof of play

- **Mutation-gated CLEAN** — `node tools/witness.mjs mutate kernel.mjs --timeout 30000 --cap 500 --test node --test kernel.test.mjs`
- **The live page IS the gated kernel** — `make-page.mjs` injects `kernel.mjs` verbatim; CI regenerates and `git diff --exit-code`s.
- Run the tests: `node --test kernel.test.mjs`

MIT.
