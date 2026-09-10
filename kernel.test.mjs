import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KAPPA, SOLIDS, SCARCE, LIFECYCLE, verifySolid, dualPair, shapeOfJob, jobOfShape, inscribes, maturity } from './kernel.mjs';

// ── the geometry is REAL: pin the numbers, and Euler + duality must hold
test('SOLIDS: the vertex/edge/face counts are the true Platonic numbers', () => {
  assert.deepEqual([SOLIDS.tetra.V, SOLIDS.tetra.E, SOLIDS.tetra.F], [4, 6, 4]);
  assert.deepEqual([SOLIDS.cube.V, SOLIDS.cube.E, SOLIDS.cube.F], [8, 12, 6]);
  assert.deepEqual([SOLIDS.octa.V, SOLIDS.octa.E, SOLIDS.octa.F], [6, 12, 8]);
  assert.deepEqual([SOLIDS.dodeca.V, SOLIDS.dodeca.E, SOLIDS.dodeca.F], [20, 30, 12]);
  assert.deepEqual([SOLIDS.icosa.V, SOLIDS.icosa.E, SOLIDS.icosa.F], [12, 30, 20]);
});

test('verifySolid: Euler V - E + F = 2 and duality hold for every solid', () => {
  for (const name of Object.keys(SOLIDS)) {
    const r = verifySolid(name);
    assert.equal(r.euler, true, name + ' fails Euler');
    assert.equal(r.dualHolds, true, name + ' fails duality');
  }
  assert.equal(verifySolid('sphere').ok, false);   // a string that is not a solid is refused, never proceeds
  assert.equal(verifySolid(null).ok, false);
});

test('dualPair: the two mechanism pairs, tetra self-dual, non-duals rejected', () => {
  assert.equal(dualPair('cube', 'octa').dual, true);     // BUILD <-> VERIFY
  assert.equal(dualPair('octa', 'cube').dual, true);
  assert.equal(dualPair('dodeca', 'icosa').dual, true);  // REMEMBER <-> EXPLORE
  assert.equal(dualPair('tetra', 'tetra').dual, true);   // self-dual (INIT authors itself)
  assert.equal(dualPair('cube', 'dodeca').dual, false);
  assert.equal(dualPair('sphere', 'cube').ok, false);    // bad FIRST arg refused (kills the a-guard || -> &&)
  assert.equal(dualPair('cube', 'sphere').ok, false);    // bad second arg refused
});

// ── the legibility map
test('shapeOfJob / jobOfShape: each organ has its shape and back', () => {
  assert.equal(shapeOfJob('remember').shape, 'dodeca');   // memory is the phi-solid
  assert.equal(shapeOfJob('verify').shape, 'octa');
  assert.equal(shapeOfJob('build').shape, 'cube');
  assert.equal(shapeOfJob('init').shape, 'tetra');
  assert.equal(shapeOfJob('explore').shape, 'icosa');
  assert.equal(jobOfShape('dodeca').job, 'remember');
  assert.equal(jobOfShape('octa').job, 'verify');
  assert.equal(shapeOfJob('fly').ok, false);
  assert.ok(shapeOfJob('').why.includes('string'));   // an empty job is a type error, not a missing-shape (kills length > 0 -> >= 0)
  assert.equal(jobOfShape('sphere').ok, false);
});

// ── nesting (the cube carries its memory)
test('inscribes: the cube carries a dodeca; memory does not fit the other way', () => {
  assert.equal(inscribes('cube', 'dodeca').inscribes, true);   // the working unit holds its memory
  assert.equal(inscribes('tetra', 'cube').inscribes, true);
  assert.equal(inscribes('dodeca', 'cube').inscribes, false);  // 20 vertices do not fit in 8
  assert.equal(inscribes('icosa', 'tetra').inscribes, false);
  assert.equal(inscribes('tetra', 'icosa').inscribes, false);  // fits (4 <= 12) but NOT a known inscription (kills known && fits -> ||)
  assert.equal(inscribes('sphere', 'cube').ok, false);         // bad first arg refused (kills the inner-guard || -> &&)
  assert.equal(inscribes('cube', 'sphere').ok, false);         // bad second arg refused
});

// ── the load-bearing organ check (§26 maturity + the scarce shapes)
const held = (v) => ({ init: v, build: v, verify: v, remember: v, explore: v });

test('maturity: all five held is MATURED', () => {
  const r = maturity(held(0.7));
  assert.equal(r.verdict, 'MATURED');
  assert.equal(r.matured, true);
  assert.equal(r.held.length, 5);
});

test('maturity RED LINE: fit but missing VERIFY or REMEMBER is a CRIPPLE, never mature', () => {
  const noVerify = { ...held(0.7), verify: 0.5 };        // holds init/build/remember/explore = "fit"
  assert.equal(maturity(noVerify).verdict, 'CRIPPLE');
  assert.equal(maturity(noVerify).matured, false);
  const noRemember = { ...held(0.7), remember: 0.5 };
  assert.equal(maturity(noRemember).verdict, 'CRIPPLE');
  const neither = { init: 0.7, build: 0.7, explore: 0.7, verify: 0.5, remember: 0.5 };  // the selection-only agent
  assert.equal(maturity(neither).verdict, 'CRIPPLE');
  assert.ok(maturity(neither).reasons.some((x) => x.includes('scarce')));
  const oneHeld = { init: 0.5, build: 0.7, verify: 0.5, remember: 0.5, explore: 0.5 };   // exactly ONE held, none scarce
  assert.equal(maturity(oneHeld).verdict, 'CRIPPLE');   // one held with no scarce is still a cripple (kills >= 1 -> > 1)
});

test('maturity: missing a NON-scarce organ while the scarce two are held is IMMATURE (not CRIPPLE)', () => {
  const noExplore = { ...held(0.7), explore: 0.5 };   // verify + remember still held
  const r = maturity(noExplore);
  assert.equal(r.verdict, 'IMMATURE');
  assert.equal(r.scarceHeld, true);
});

test('maturity: the KAPPA boundary is inclusive (kills >= vs >)', () => {
  const atKappa = { ...held(0.7), verify: KAPPA };       // verify exactly at kappa -> held -> all five
  assert.equal(maturity(atKappa).verdict, 'MATURED');
  const underKappa = { ...held(0.7), verify: 0.617 };    // just under -> not held -> a scarce shape missing
  assert.equal(maturity(underKappa).verdict, 'CRIPPLE');
});

test('maturity: total on garbage, endpoints valid', () => {
  assert.equal(maturity(null).ok, false);
  assert.equal(maturity({ ...held(0.7), verify: 'x' }).ok, false);
  assert.equal(maturity({ ...held(0.7), verify: NaN }).ok, false);    // not-a-finite-number rejected (kills isNum && -> ||)
  assert.equal(maturity({ ...held(0.7), verify: 1 }).ok, true);       // exactly 1 is a valid phase (kills > 1 -> >= 1)
  assert.equal(maturity({ ...held(0.7), verify: 1 }).verdict, 'MATURED');
  assert.equal(maturity({ ...held(0.7), verify: 1.5 }).ok, false);
  assert.equal(maturity({ ...held(0.7), verify: -0.1 }).ok, false);
  assert.equal(maturity(held(0)).verdict, 'IMMATURE');   // zeros valid, nothing held
});

test('exports: the scarce shapes and lifecycle are the expected sets', () => {
  assert.deepEqual([...SCARCE], ['octa', 'dodeca']);
  assert.deepEqual([...LIFECYCLE], ['init', 'build', 'verify', 'remember', 'explore']);
  assert.equal(KAPPA, 0.618);
});
