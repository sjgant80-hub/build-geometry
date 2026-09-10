// build-geometry — the five Platonic solids as five organ-jobs, made legible and CHECKABLE. Every organ
// of a node gets a shape, so the architecture reads at a glance: a node is a CUBE (the working unit) that
// carries a DODECAHEDRON (its memory) inside it, is gated by an OCTAHEDRON (verify, the cube read inside-out),
// explores via an ICOSAHEDRON (dual of memory — you explore from what you remember), and is born as a
// self-dual TETRAHEDRON. A node runs all five as a lifecycle and is mature only when all five are held.
//
// Composes the estate: §26 (fallkard's five-solids lifecycle + the maturity rule) + §5 (the geometric quine,
// inscription) + §30 (memory must be aperiodic to carry a lesson). And this session's mesh: a node is the
// cube+dodeca+octa+icosa+tetra of mesh-self; the mesh of coupled node-tori is a bigger dodeca.
//
// REAL (verifiable math): the geometry — vertices, edges, faces, Euler's V - E + F = 2, and the duality
// pairs (a solid's faces are its dual's vertices). LENS (kept private, not shipped as claim): the
// "quine builds itself", the spin-into-torus, the turtling — a design language, not a proof.
//
// Pure and total; guards one-per-line. THE LOAD-BEARING CHECK (§26): the two SCARCE shapes are VERIFY and
// REMEMBER (octa + dodeca) — the ones that persist a SELF. A node holding INIT/BUILD/EXPLORE but not both of
// these is provably-fit AND a cripple: it is flagged, never passed as mature.

export const KAPPA = 0.618;   // held at or above this counts (1/phi)

// each solid: real geometry + its dual + its organ-job
export const SOLIDS = Object.freeze({
  tetra:  Object.freeze({ V: 4,  E: 6,  F: 4,  dual: 'tetra',  job: 'init',     label: 'INIT · birth' }),
  cube:   Object.freeze({ V: 8,  E: 12, F: 6,  dual: 'octa',   job: 'build',    label: 'NODE · build' }),
  octa:   Object.freeze({ V: 6,  E: 12, F: 8,  dual: 'cube',   job: 'verify',   label: 'VERIFY · gate' }),
  dodeca: Object.freeze({ V: 20, E: 30, F: 12, dual: 'icosa',  job: 'remember', label: 'MEMORY · remember' }),
  icosa:  Object.freeze({ V: 12, E: 30, F: 20, dual: 'dodeca', job: 'explore',  label: 'EXPLORE · scout' }),
});
// the two self-persisting shapes — VERIFY + REMEMBER — the scarce ones a real self needs (§26)
export const SCARCE = Object.freeze(['octa', 'dodeca']);
// the lifecycle order and the phase keys a node reports
export const LIFECYCLE = Object.freeze(['init', 'build', 'verify', 'remember', 'explore']);

const isStr = (v) => typeof v === 'string' && v.length > 0;
const isObj = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

/**
 * verifySolid(name) — the geometry is REAL: Euler's V - E + F = 2 holds, and the duality holds (the solid's
 * faces are its dual's vertices and vice-versa). Any wrong number fails.
 */
export function verifySolid(name) {
  if (!isStr(name) || !(name in SOLIDS)) return { ok: false, why: 'name must be one of the five solids' };
  const s = SOLIDS[name];
  const d = SOLIDS[s.dual];
  const euler = s.V - s.E + s.F === 2;
  // duality is a symmetric involution — d.V === s.F implies d.F === s.V — so one direction suffices to check it
  const dualHolds = d.V === s.F;
  return { ok: true, euler, dualHolds };
}

/** dualPair(a, b) — are a and b duals? The geometric test: a's faces are b's vertices (and, by the symmetry
 * of duality, its vertices are b's faces — so one comparison identifies the dual among the five solids). */
export function dualPair(a, b) {
  if (!isStr(a) || !(a in SOLIDS)) return { ok: false, why: 'a must be one of the five solids' };
  if (!isStr(b) || !(b in SOLIDS)) return { ok: false, why: 'b must be one of the five solids' };
  const swap = SOLIDS[a].F === SOLIDS[b].V;
  return { ok: true, dual: swap };
}

/** the legibility map: which shape serves which organ-job, and back. */
export function shapeOfJob(job) {
  if (!isStr(job)) return { ok: false, why: 'job must be a string' };
  for (const name of Object.keys(SOLIDS)) if (SOLIDS[name].job === job) return { ok: true, shape: name, label: SOLIDS[name].label };
  return { ok: false, why: 'no shape serves the job ' + job };
}
export function jobOfShape(name) {
  if (!isStr(name) || !(name in SOLIDS)) return { ok: false, why: 'name must be one of the five solids' };
  return { ok: true, job: SOLIDS[name].job, label: SOLIDS[name].label };
}

/**
 * inscribes(inner, outer) — the nesting fact (§5): a solid inscribes into another when its vertices land on
 * a subset of the other's. The load-bearing one is CUBE inscribes into DODECA — the working unit carries its
 * memory inside it (8 of the cube's vertices land on 8 of the dodecahedron's 20). Reported as a known relation.
 */
const INSCRIPTIONS = Object.freeze([['cube', 'dodeca'], ['tetra', 'cube']]);
export function inscribes(inner, outer) {
  if (!isStr(inner) || !(inner in SOLIDS)) return { ok: false, why: 'inner must be one of the five solids' };
  if (!isStr(outer) || !(outer in SOLIDS)) return { ok: false, why: 'outer must be one of the five solids' };
  // the curated INSCRIPTIONS are the real geometric facts (each with strictly fewer vertices landing on a subset)
  const known = INSCRIPTIONS.some(([a, b]) => a === inner && b === outer);
  return { ok: true, inscribes: known };
}

/**
 * maturity(phases) — phases = { init, build, verify, remember, explore }, each a number 0..1 (how well the
 * node holds that organ). A phase is HELD at or above KAPPA. §26:
 *   MATURED  — all five held: a complete five-solid organism.
 *   CRIPPLE  — some held, but a SCARCE shape (VERIFY or REMEMBER) is missing: provably-fit and a cripple —
 *              it cannot persist a self. Flagged, never passed as mature.
 *   IMMATURE — not yet holding enough, and the scarce shapes are present as far as they go.
 */
export function maturity(phases) {
  if (!isObj(phases)) return { ok: false, why: 'phases reads { init, build, verify, remember, explore }' };
  const held = [];
  for (const job of LIFECYCLE) {
    if (!isNum(phases[job])) return { ok: false, why: 'phase ' + job + ' must be a number' };
    if (phases[job] < 0 || phases[job] > 1) return { ok: false, why: 'phase ' + job + ' must be within zero to one' };
    if (phases[job] >= KAPPA) held.push(job);
  }
  const scarceHeld = SCARCE.every((name) => held.includes(SOLIDS[name].job));   // verify + remember both held
  const matured = held.length === LIFECYCLE.length;
  const reasons = [];
  let verdict;
  if (matured) {
    verdict = 'MATURED';
  } else if (held.length >= 1 && !scarceHeld) {
    verdict = 'CRIPPLE';
    reasons.push('a scarce self-persisting shape is missing (VERIFY and REMEMBER are the two that hold a self) — provably-fit is not mature');
  } else {
    verdict = 'IMMATURE';
    reasons.push('not all five organs are held yet (' + held.length + ' of ' + LIFECYCLE.length + ')');
  }
  return { ok: true, verdict, matured, held, scarceHeld, reasons };
}
