// CENA 5 — A INCLUSÃO É UM DIREITO (69.97–88.87, local 0–18.91)
// Inter-American Convention (OAS, Guatemala, 7 June 1999): calendar, globe with the
// Americas, document + signature, values icons; then Pathfinders read, debate, summarise.
import * as THREE from 'three';
import { P, shade } from '../core/palette.js';
import { room, table } from '../environments/indoor.js';
import { Actor, ChairActor, camAt } from './kit.js';
import { restPose, mixPose, explain } from '../animations/cycles.js';
import { pulse, prog, ease, clamp, lerp } from '../core/math.js';
import { show, equals, people, heart, sparkle, grp, check } from '../objects/fx.js';
import { vpart, vring, vreshape, rrectPts, circlePts, strokePts, roundPoly, blobPts, curvePts, setOpacity } from '../core/vector.js';
import { documentSheet, pencil } from '../objects/accessibility.js';
import { screenLayer, board } from './ui.js';

const AM = {
  na: [[-0.62, 0.62], [-0.45, 0.78], [-0.15, 0.84], [0.1, 0.76], [0.2, 0.6], [0.06, 0.5], [0.14, 0.38], [0.03, 0.26], [-0.1, 0.17], [-0.19, 0.06], [-0.29, 0.1], [-0.43, 0.25], [-0.56, 0.38], [-0.72, 0.5]],
  ca: [[-0.21, 0.07], [-0.12, 0.0], [-0.04, -0.07], [-0.07, -0.1], [-0.16, -0.03], [-0.24, 0.04]],
  sa: [[-0.06, -0.08], [0.12, -0.1], [0.3, -0.2], [0.36, -0.35], [0.22, -0.55], [0.08, -0.7], [-0.02, -0.86], [-0.09, -0.72], [-0.07, -0.5], [-0.16, -0.3], [-0.18, -0.14]],
  gl: [[0.2, 0.86], [0.38, 0.88], [0.42, 0.76], [0.3, 0.7], [0.2, 0.76]],
  af: [[0.62, 0.22], [0.8, 0.24], [0.9, 0.06], [0.84, -0.2], [0.74, -0.38], [0.66, -0.22], [0.58, 0.02]],
  eu: [[0.6, 0.38], [0.75, 0.52], [0.85, 0.46], [0.8, 0.34], [0.68, 0.3]],
};

function globe(R = 3) {
  const g = new THREE.Group();
  g.add(vpart({ pts: circlePts(R * 1.06, 80), color: '#FFFFFF', outline: 0.05, z: -0.02, opacity: 0.25 }));
  g.add(vpart({ pts: circlePts(R, 80), color: '#4FC3E8', shade: '#2A8FC0', mode: 1, p: [-R * 0.25, R * 0.25, R * 0.95, 0], hi: '#9FE3F7', q: [-R * 0.45, R * 0.5, R * 0.18, 0], outline: 0.06, z: 0 }));
  const land = {};
  for (const [k, pts] of Object.entries(AM)) {
    const am = !['af', 'eu'].includes(k);
    land[k] = vpart({ pts: blobPts(pts.map(([x, y]) => [x * R, y * R]), 60), color: am ? P.green : '#B8C4A8', shade: am ? shade(P.green, 0.8) : '#9AA68C', mode: 2, p: [1, -1, R * 0.2, 0], outline: 0.04, z: 0.01 });
    g.add(land[k]);
  }
  // meridians for a 3D hint
  for (const k of [0.35, 0.7]) g.add(vring({ outer: [...Array(64)].map((_, i) => { const a = (i / 64) * Math.PI * 2; return [Math.cos(a) * R * k, Math.sin(a) * R]; }), inner: [...Array(64)].map((_, i) => { const a = (i / 64) * Math.PI * 2; return [Math.cos(a) * (R * k - 0.035), Math.sin(a) * (R - 0.035)]; }), color: '#FFFFFF', opacity: 0.25, z: 0.005 }));
  return { g, land };
}

function calendar() {
  const g = new THREE.Group();
  g.add(vpart({ pts: rrectPts(4.2, 4.0, 0.25), color: '#FFFFFF', shade: '#E7EDF6', mode: 2, p: [1, -1, 1.0, 0], z: 0 }));
  g.add(vpart({ pts: rrectPts(4.2, 1.1, 0.25, 0, 1.45), color: P.red, outline: 0, z: 0.005 }));
  for (const x of [-1.2, 1.2]) g.add(vpart({ pts: rrectPts(0.22, 0.7, 0.1, x, 2.05), color: P.ink, outline: 0.02, z: 0.01 }));
  const flip = vpart({ pts: rrectPts(4.0, 2.6, 0.2, 0, -0.55), color: '#F4F7FC', outline: 0.03, z: 0.02 }); g.add(flip);
  return { g, flip };
}

export function build() {
  const scene = new THREE.Scene();
  const S = { scene };
  // world: club room with a table (part E)
  room(scene, { x0: -14, x1: 14, wall: '#E4ECD8', floor: '#C9A27A', windows: [-7], boards: [5.5] });
  S.tbl = table(4.6, 1.2); S.tbl.position.set(0, 0, 1.3); scene.add(S.tbl);
  S.ana = new Actor(scene, 'ana', { x: -2.3, z: 0.4, facing: 0.35, seed: 2 });
  S.rafael = new Actor(scene, 'rafael', { x: -0.7, z: 0.2, facing: 0.3, seed: 5 });
  S.lucas = new Actor(scene, 'lucas', { x: 0.85, z: 0.3, facing: -0.2, seed: 1 });
  S.theo = new ChairActor(scene, 'theo', { kind: 'power', x: 3.0, z: 0.5, dir: -1, seed: 7, facing: -0.45 });
  S.docA = documentSheet({ w: 0.8, h: 1.0, lines: 5 }); scene.add(S.docA.root);
  S.sum = documentSheet({ w: 0.9, h: 0.65, lines: 4, title: false }); S.sum.root.position.set(0.8, 1.45, 1.6); S.sum.root.rotation.z = -0.08; scene.add(S.sum.root);
  S.pen = pencil(); scene.add(S.pen.root);
  S.bubbles = [0, 1].map((i) => { const b = grp(vpart({ pts: rrectPts(1.0, 0.6, 0.28), color: '#FFFFFF', outline: 0.035 }), ...[0, 1, 2].map((j) => vpart({ pts: circlePts(0.07, 12, -0.25 + j * 0.25, 0), color: i ? P.turquoise : P.royal, outline: 0, z: 0.01 }))); scene.add(b); return b; });
  // screen board (parts A–D)
  const ui = S.ui = screenLayer(scene, 20);
  const B = S.B = new THREE.Group(); ui.g.add(B);
  B.add(board(P.navy, P.royal, 13));
  S.cal = calendar(); S.cal.g.position.set(0, 0.4, 0); S.cal.g.userData.s = 1.35; B.add(S.cal.g);
  S.gl = globe(3.4); S.gl.g.position.set(0, 0.6, 0); B.add(S.gl.g);
  S.doc = documentSheet({ w: 4.4, h: 5.6, lines: 10 }); S.doc.root.position.set(0, 0.9, 0); B.add(S.doc.root);
  S.sign = vpart({ pts: strokePts([[0, 0], [0.01, 0]], 0.07), color: P.royal, outline: 0, z: 0.03 }); S.sign.position.set(-1.6, -1.25, 0); S.doc.root.add(S.sign);
  S.signPts = curvePts([[0, 0], [0.3, 0.35], [0.45, -0.1], [0.75, 0.3], [0.95, -0.15], [1.3, 0.2], [1.6, -0.05], [2.0, 0.15], [2.4, 0.0]], 80);
  S.seal = grp(vpart({ pts: [...Array(28)].map((_, i) => { const a = (i / 28) * Math.PI * 2, r = i % 2 ? 0.62 : 0.72; return [Math.cos(a) * r, Math.sin(a) * r]; }), color: P.gold, outline: 0.04 }), vpart({ pts: circlePts(0.45, 30), color: '#FFE38A', outline: 0, z: 0.01 }), (() => { const c = check(P.royal, 0.38); c.position.z = 0.02; return c; })());
  S.seal.position.set(1.5, -2.2, 0.05); S.doc.root.add(S.seal);
  S.pen2 = pencil(); S.pen2.root.scale.setScalar(2.2); S.doc.root.add(S.pen2.root);
  S.vals = [equals(P.turquoise, 2.0), people(1.7, [P.green, P.yellow, P.pink]), heart(P.red, 2.4)];
  S.vals.forEach((v, i) => { v.position.set(-3.35 + i * 3.35, 0.4, 0.1); B.add(v); });
  return S;
}

export function update(S, t) {
  // ---- E (world): reading, debating, summarising
  S.ana.update(t, { x: -2.3, pose: { ...restPose(), armL: [-0.5, -1.5, 0.2], armR: [0.5, 1.5, -0.2], handL: 'hold', handR: 'hold', head: -0.08 }, smile: 0.6, look: [0.2, -0.6] });
  const wl = new THREE.Vector3(), wr = new THREE.Vector3(); S.ana.h.J.wrL.getWorldPosition(wl); S.ana.h.J.wrR.getWorldPosition(wr);
  S.docA.root.position.set((wl.x + wr.x) / 2, (wl.y + wr.y) / 2 + 0.3, 1.8); S.docA.root.rotation.z = 0.05;
  S.rafael.update(t, { x: -0.7, pose: mixPose(restPose(), explain(t, 1.0, 4), pulse(t, 14.6, 18.9, 0.4, 0.4)), smile: 0.7, talk: (tt) => tt > 14.8 && tt < 16.6, look: [0.6, 0] });
  S.theo.update(t, { x: 3.0, hands: (tt, h, chair) => { const pk = pulse(tt, 16.0, 16.9, 0.2, 0.3); const c = chair.tablet.cells[1]; const v = new THREE.Vector3(); c.getWorldPosition(v); h.reach(h.facing > 0 ? 'L' : 'R', v.x, v.y + 0.04 + (1 - pk) * 0.3, 1); h.setHand(h.facing > 0 ? 'L' : 'R', 'point'); chair.tablet.press(1, pk); }, smile: 0.75, look: [-0.6, -0.1] });
  S.lucas.update(t, { x: 0.85, pose: { ...restPose(), armR: [0.95, 1.35, 0], handR: 'hold', spine: 0.05, head: -0.1 }, smile: 0.65, look: [-0.1, -0.7] });
  const pk = prog(t, 16.3, 2.4, ease.linear); S.sum.write(pk);
  const pw = new THREE.Vector3(); S.lucas.h.J.wrR.getWorldPosition(pw);
  S.pen.root.position.set(pw.x - 0.02, pw.y - 0.1, 2.0); S.pen.root.rotation.z = 0.5;
  S.lucas.h.reach('R', S.sum.root.position.x - 0.3 + (pk * 0.6) + Math.sin(t * 20) * 0.03 * (pk > 0 && pk < 1 ? 1 : 0), S.sum.root.position.y + 0.12 - Math.floor(pk * 4) * 0.1, 1);
  S.bubbles.forEach((b, i) => { b.position.set(i ? 2.3 : -0.3, i ? 4.3 : 4.45, 3); show(b, t, i ? 16.1 : 14.9, 18.5, 0.35); });
  // ---- board A–D
  const cam = camAt([[0, [0.3, 2.3, 1.55]], [12.8, [0.3, 2.3, 1.55]], [14.0, [0.3, 2.25, 1.62]], [18.9, [0.35, 2.3, 1.68]]], t);
  S.ui.lock(cam);
  const out = prog(t, 12.65, 0.55, ease.inCubic);
  S.B.visible = out < 1; S.B.position.y = out * 21;
  // A: calendar flipping toward 1999
  const ca = 1 - prog(t, 2.0, 0.4);
  S.cal.g.visible = ca > 0.01; S.cal.g.scale.setScalar(1.35 * Math.max(0.01, ca) * (0.9 + 0.1 * prog(t, 0, 0.4, ease.outBack)));
  const fl = (t * 6) % 1; S.cal.flip.scale.y = t < 1.2 ? Math.max(0.05, 1 - fl) : 1; S.cal.flip.position.y = t < 1.2 ? (1 - S.cal.flip.scale.y) * 1.3 : 0;
  // B: globe with the Americas highlighted
  const gk = prog(t, 2.1, 0.5, ease.outBack) * (1 - prog(t, 4.1, 0.35));
  S.gl.g.visible = gk > 0.01; S.gl.g.scale.setScalar(Math.max(0.01, gk)); S.gl.g.rotation.z = Math.sin(t * 1.4) * 0.04;
  const hl = pulse(t, 3.0, 4.2, 0.25, 0.2);
  for (const k of ['na', 'ca', 'sa', 'gl']) { S.gl.land[k].userData.fill.material.uniforms.uColor.value.set(hl > 0.5 ? P.yellow : P.green); S.gl.land[k].scale.setScalar(1 + hl * 0.04); }
  // C: the convention document is signed
  const dk = prog(t, 4.2, 0.5, ease.outBack) * (1 - prog(t, 9.35, 0.35));
  S.doc.root.visible = dk > 0.01; S.doc.root.scale.setScalar(Math.max(0.01, dk));
  S.doc.write(prog(t, 4.4, 1.6, ease.linear));
  const sk = prog(t, 6.0, 1.6, ease.inOutSine), n = Math.max(2, Math.floor(sk * S.signPts.length));
  vreshape(S.sign, strokePts(S.signPts.slice(0, n), 0.07), 0); S.sign.visible = sk > 0;
  const tip = S.signPts[n - 1]; S.pen2.root.position.set(-1.6 + tip[0] + 0.05, -1.25 + tip[1] + 0.05, 0.1); S.pen2.root.rotation.z = 0.5; S.pen2.root.visible = sk > 0 && sk < 1;
  show(S.seal, t, 7.7, 99, 0.4);
  // D: values
  [9.7, 10.9, 12.1].forEach((ta, i) => { show(S.vals[i], t, ta, 99); S.vals[i].rotation.z = Math.sin(t * 2 + i) * 0.05; });
  return cam;
}
