// CENA 3 — DIFERENTES DEFICIÊNCIAS (33.70–51.56, local 0–17.85)
// Five Pathfinders, each doing a meaningful club activity, framed on its word:
// físicas (Pedro, knots), visuais (Clara, Braille card), auditivas (Rafael, signal flags),
// intelectuais (Bia, tent with picture instructions), múltiplas (Theo, AAC quiz).
// Hidden disabilities: Lia with the sunflower lanyard (Lei 14.624/2023). Then everyone together.
import * as THREE from 'three';
import { P, shade } from '../core/palette.js';
import { backdrop } from '../environments/outdoor.js';
import { Actor, ChairActor, camAt, path, wp } from './kit.js';
import { restPose, mixPose, wave, explain } from '../animations/cycles.js';
import { pulse, prog, ease, clamp, lerp } from '../core/math.js';
import { show, sparkle, check, heart, grp, badge } from '../objects/fx.js';
import { vpart, vreshape, rrectPts, circlePts, strokePts, roundPoly, curvePts, ellipsePts, setOpacity } from '../core/vector.js';

const ST = [0, 8, 16, 24, 32, 40], GX = 62;

function easel() {
  const g = new THREE.Group();
  for (const s of [-1, 1]) g.add(vpart({ pts: strokePts([[s * 0.55, 0], [s * 0.35, 2.3]], 0.08), color: P.woodDark, outline: 0.018, z: -0.02 }));
  g.add(vpart({ pts: rrectPts(1.5, 1.2, 0.06, 0, 1.75), color: P.wood, shade: P.woodDark, mode: 2, p: [1, -1, 0.4, 0], z: 0 }));
  const knotPts = curvePts([[-0.55, 1.95], [-0.2, 2.15], [0.1, 1.95], [-0.15, 1.6], [-0.35, 1.85], [0.05, 2.1], [0.35, 1.85], [0.15, 1.55], [0.55, 1.5]], 70);
  const rope = vpart({ pts: strokePts(knotPts.slice(0, 2), 0.07), color: '#E7C48A', outline: 0.02, z: 0.01 });
  g.add(rope);
  return { g, rope, knotPts };
}
function brailleCard() {
  const g = new THREE.Group();
  g.add(vpart({ pts: rrectPts(1.0, 0.7, 0.06), color: '#FFFFFF', shade: '#E8EEF6', mode: 2, p: [1, -1, 0.2, 0], z: 0 }));
  const cells = [[1, 0, 1, 1, 0, 0], [1, 1, 0, 0, 1, 0], [1, 0, 0, 1, 1, 1], [0, 1, 1, 0, 1, 0]];
  cells.forEach((c, i) => c.forEach((on, j) => { if (on) g.add(vpart({ pts: circlePts(0.035, 10, -0.36 + i * 0.24 + (j % 2) * 0.08, 0.15 - Math.floor(j / 2) * 0.1), color: '#B9C6DA', outline: 0.008, z: 0.005 })); }));
  return g;
}
function signalFlag(c1 = P.red, c2 = P.yellow) {
  const g = new THREE.Group();
  g.add(vpart({ pts: strokePts([[0, -0.1], [0, 0.95]], 0.045), color: P.woodDark, outline: 0.012, z: 0 }));
  g.add(vpart({ pts: rrectPts(0.55, 0.55, 0.02, 0.29, 0.68), color: c1, outline: 0.02, z: 0.002 }));
  g.add(vpart({ pts: [[0.02, 0.41], [0.56, 0.41], [0.02, 0.95]], color: c2, outline: 0, z: 0.004 }));
  return g;
}
function tent() {
  const g = new THREE.Group();
  const body = new THREE.Group(); g.add(body);
  body.add(vpart({ pts: roundPoly([[-1.3, 0], [1.3, 0], [0, 1.7]], 0.06), color: P.orange, shade: shade(P.orange, 0.82), mode: 2, p: [1, 0, 0.0, 0], z: 0 }));
  body.add(vpart({ pts: roundPoly([[-0.35, 0], [0.35, 0], [0, 1.0]], 0.03), color: shade(P.orange, 0.6), outline: 0, z: 0.01 }));
  body.add(vpart({ pts: strokePts([[0, 1.7], [0, 1.95]], 0.05), color: P.woodDark, outline: 0.012, z: 0.02 }));
  const rope = vpart({ pts: strokePts([[0, 1.85], [1.9, 0.05]], 0.03), color: '#F4E3C1', outline: 0.008, z: -0.01 }); g.add(rope);
  return { g, body, rope };
}
function pictoCard() {
  const g = new THREE.Group();
  g.add(vpart({ pts: strokePts([[0, 0], [0, 1.3]], 0.07), color: P.woodDark, outline: 0.016, z: -0.01 }));
  g.add(vpart({ pts: rrectPts(1.7, 0.8, 0.08, 0, 1.55), color: '#FFFFFF', z: 0 }));
  const steps = [];
  for (let i = 0; i < 3; i++) {
    const cx = -0.55 + i * 0.55;
    const f = vpart({ pts: rrectPts(0.46, 0.58, 0.05, cx, 1.55), color: '#EAF4FF', outline: 0.012, z: 0.002 }); g.add(f); steps.push(f);
    if (i === 0) g.add(vpart({ pts: strokePts([[cx - 0.08, 1.75], [cx + 0.05, 1.4]], 0.05), color: P.woodDark, outline: 0, z: 0.004 }));
    if (i === 1) g.add(vpart({ pts: strokePts([[cx, 1.35], [cx, 1.78]], 0.05), color: P.woodDark, outline: 0, z: 0.004 }));
    if (i === 2) g.add(vpart({ pts: roundPoly([[cx - 0.18, 1.35], [cx + 0.18, 1.35], [cx, 1.72]], 0.02), color: P.orange, outline: 0, z: 0.004 }));
    g.add(vpart({ pts: circlePts(0.07, 12, cx - 0.16, 1.77), color: [P.turquoise, P.green, P.yellow][i], outline: 0, z: 0.005 }));
  }
  return { g, steps };
}
function banner() {
  const g = new THREE.Group();
  for (const s of [-1, 1]) g.add(vpart({ pts: strokePts([[s * 1.3, 0], [s * 1.3, 2.4]], 0.08), color: P.woodDark, outline: 0.016, z: -0.02 }));
  g.add(vpart({ pts: rrectPts(2.5, 1.2, 0.04, 0, 1.75), color: '#FFFDF5', z: 0 }));
  const stripes = [P.royal, P.turquoise, P.green, P.yellow].map((c, i) => { const st = vpart({ pts: rrectPts(2.2, 0.18, 0.08, 0, 2.15 - i * 0.26), color: c, outline: 0, z: 0.003 }); g.add(st); return st; });
  return { g, stripes };
}

export function build() {
  const scene = new THREE.Scene();
  const S = { scene };
  const bdG = new THREE.Group(); scene.add(bdG);
  S.bd = backdrop(bdG, { seed: 21, w: 150, trees: [[-6, 1.1, 'round'], [4.2, 0.9, 'pine', -16], [12, 1.2, 'round'], [20.5, 1.0, 'pine', -16], [28.2, 1.15, 'round'], [36, 0.95, 'pine', -16], [44.5, 1.2, 'round'], [55, 1.1, 'round'], [68, 1.0, 'pine', -16]] });
  bdG.position.x = 30;
  // station 1: Pedro ties knots on a board
  S.easel = easel(); S.easel.g.position.set(ST[0] + 1.05, 0, 0.4); scene.add(S.easel.g);
  S.pedro = new ChairActor(scene, 'pedro', { kind: 'manual', x: ST[0] - 1.3, z: 2, dir: 1, seed: 3 });
  // station 2: Clara reads a Braille card at the nature table
  S.table = vpart({ pts: rrectPts(2.2, 0.12, 0.05, ST[1] + 0.9, 1.4), color: P.wood, z: 0.3 }); scene.add(S.table);
  for (const s of [-1, 1]) scene.add(vpart({ pts: strokePts([[ST[1] + 0.9 + s * 0.9, 1.35], [ST[1] + 0.9 + s * 0.95, 0]], 0.08), color: P.woodDark, outline: 0.016, z: 0.25 }));
  S.braille = brailleCard(); S.braille.position.set(ST[1] + 0.55, 1.62, 1.6); S.braille.rotation.z = 0.05; scene.add(S.braille);
  const leaf = vpart({ pts: roundPoly([[0, -0.25], [0.22, 0], [0, 0.32], [-0.22, 0]], 0.12), color: P.green, outline: 0.02, z: 0.31 }); leaf.position.set(ST[1] + 1.55, 1.58, 0); scene.add(leaf);
  S.clara = new Actor(scene, 'clara', { x: ST[1] - 0.15, z: 1, facing: 0.35, seed: 4 });
  // station 3: Rafael signals with flags to a partner
  S.rafael = new Actor(scene, 'rafael', { x: ST[2] - 0.6, z: 1, facing: 0.25, seed: 5 });
  S.flagL = signalFlag(); S.flagR = signalFlag(); scene.add(S.flagL, S.flagR);
  S.partner = new Actor(scene, 'joao', { x: ST[2] + 2.4, z: 0.2, facing: -0.45, seed: 9, scale: 0.9 });
  // station 4: Bia pitches a tent following picture instructions
  S.tent = tent(); S.tent.g.position.set(ST[3] + 1.4, 0, -0.3); scene.add(S.tent.g);
  S.card = pictoCard(); S.card.g.position.set(ST[3] - 1.65, 0, 0.2); scene.add(S.card.g);
  S.bia = new Actor(scene, 'bia', { x: ST[3] - 0.3, z: 1, facing: 0.3, seed: 6 });
  // station 5: Theo answers the club quiz with his AAC tablet
  S.theo = new ChairActor(scene, 'theo', { kind: 'power', x: ST[4] - 0.6, z: 2, dir: 1, seed: 7 });
  S.quiz = grp(vpart({ pts: rrectPts(1.5, 1.1, 0.1, 0, 1.9), color: P.navy, z: 0 }), ...[0, 1, 2].map((i) => vpart({ pts: rrectPts(1.1, 0.18, 0.08, 0, 2.2 - i * 0.3), color: i === 1 ? P.green : '#FFFFFF', outline: 0, z: 0.002 })), vpart({ pts: strokePts([[0, 0], [0, 1.4]], 0.08), color: P.woodDark, outline: 0.016, z: -0.01 }));
  S.quiz.position.set(ST[4] + 2.3, 0, 0.1); scene.add(S.quiz);
  S.quizOk = check(P.green, 0.6); S.quizOk.position.set(ST[4] + 2.3, 3.0, 0.5); scene.add(S.quizOk);
  // station 6: Lia paints the club banner (sunflower lanyard)
  S.banner = banner(); S.banner.g.position.set(ST[5] + 1.3, 0, 0.1); scene.add(S.banner.g);
  S.lia = new Actor(scene, 'lia', { x: ST[5] - 0.6, z: 1, facing: 0.35, seed: 10 });
  S.brush = vpart({ pts: strokePts([[0, 0], [0, 0.45]], 0.05), color: P.woodDark, outline: 0.012, z: 0 }); scene.add(S.brush);
  S.glow = sparkle(P.yellow, 0.55); scene.add(S.glow);
  // group (everyone, equal prominence)
  S.g = {
    clara: new Actor(scene, 'clara', { x: GX - 2.9, z: 0.3, facing: 0.15, seed: 14 }),
    rafael: new Actor(scene, 'rafael', { x: GX - 1.2, z: 0.25, facing: 0.05, seed: 15 }),
    lia: new Actor(scene, 'lia', { x: GX + 1.0, z: 0.2, facing: -0.05, seed: 16 }),
    ana: new Actor(scene, 'ana', { x: GX + 2.9, z: 0.35, facing: -0.15, seed: 12 }),
    pedro: new ChairActor(scene, 'pedro', { kind: 'manual', x: GX - 3.4, y: -1.2, z: 2.5, dir: 1, seed: 13, facing: 0.35 }),
    bia: new Actor(scene, 'bia', { x: GX + 0.0, y: -1.2, z: 2.4, facing: 0.0, seed: 17 }),
    theo: new ChairActor(scene, 'theo', { kind: 'power', x: GX + 3.3, y: -1.2, z: 2.6, dir: -1, seed: 18, facing: -0.35 }),
  };
  S.groundFront = vpart({ pts: rrectPts(24, 4, 0.01, GX, -2.8), color: P.grass, shade: P.grassDark, mode: 3, p: [-4.8, -0.8, 0, 0], outline: 0, z: -19 }); scene.add(S.groundFront);
  S.icons = ['clara', 'rafael', 'lia', 'ana', 'pedro', 'bia', 'theo'].map((k, i) => { const b = badge([P.yellow, P.turquoise, P.green, P.pink, P.royal, P.orange, P.yellow][i], 0.45, '#FFFFFF'); const st = sparkle('#FFFFFF', 0.35); st.position.z = 0.02; b.add(st); scene.add(b); return b; });
  return S;
}

const CAM = [[0, [ST[0] + 0.1, 2.4, 1.55]], [1.9, [ST[0] + 0.1, 1.95, 2.15]],
  [2.6, [ST[0] + 0.1, 1.95, 2.15]], [3.0, [ST[1] + 0.4, 1.95, 2.15], ease.inOutCubic],
  [3.5, [ST[1] + 0.4, 1.95, 2.15]], [3.9, [ST[2] + 0.35, 2.05, 1.95], ease.inOutCubic],
  [4.5, [ST[2] + 0.35, 2.05, 1.95]], [4.9, [ST[3] - 0.15, 1.95, 2.0], ease.inOutCubic],
  [5.5, [ST[3] - 0.15, 1.95, 2.0]], [5.9, [ST[4] + 0.6, 1.95, 2.15], ease.inOutCubic],
  [6.4, [ST[4] + 0.6, 1.95, 2.15]], [6.9, [ST[5] + 0.3, 1.95, 2.1], ease.inOutCubic],
  [8.3, [ST[5] + 0.2, 1.95, 2.1]], [8.9, [ST[5] - 0.45, 2.55, 3.4]], [9.9, [ST[5] - 0.45, 2.55, 3.4]], [10.6, [ST[5] + 0.2, 1.95, 2.1]]];

export function update(S, t) {
  S.bd.drift(t + 33);
  // station 1 — knot tying
  S.pedro.update(t, { x: ST[0] - 1.3, hands: (tt, h) => {
    const k = prog(tt, 0.8, 3.0, ease.linear), i = Math.floor(lerp(1, S.easel.knotPts.length - 1, k));
    const p = S.easel.knotPts[i];
    const gp = S.easel.g.position;
    h.reach(h.facing > 0 ? 'L' : 'R', gp.x + p[0] + 0.02, gp.y + p[1] - 0.05, 1); h.reach(h.facing > 0 ? 'R' : 'L', gp.x - 0.45, gp.y + 1.9 + Math.sin(tt * 5) * 0.04, 1);
    h.setHand('L', 'hold'); h.setHand('R', 'hold');
  }, smile: 0.85, look: [0.6, 0.25], pose: { spine: -0.12 } });
  const kk = prog(t, 0.8, 3.0, ease.linear); vreshape(S.easel.rope, strokePts(S.easel.knotPts.slice(0, Math.max(2, Math.floor(lerp(2, S.easel.knotPts.length, kk)))), 0.07), 0.02);
  // station 2 — Braille reading (fingertips move along the dots)
  S.clara.update(t, { x: ST[1] - 0.15, pose: { ...restPose(), spine: -0.08, head: -0.06 }, smile: 0.75, look: [0.1, -0.2], after: (tt, h) => {
    const bx = S.braille.position.x, by = S.braille.position.y;
    h.reach('R', bx - 0.25 + ((tt * 0.35) % 0.6), by + 0.18, 1); h.reach('L', bx - 0.35 + ((tt * 0.35) % 0.6) * 0.8, by + 0.12, 1);
    h.setHand('R', 'point'); h.setHand('L', 'point');
  } });
  S.clara.h.root.position.z = 1;
  // station 3 — semaphore flags (arm positions alternate in a rhythm)
  const sem = [[2.4, 2.2], [1.6, 3.0], [3.0, 1.0], [2.2, 2.4]];
  const si = Math.floor(t * 1.6) % sem.length, sj = (si + 1) % sem.length, sk = ease.inOutCubic(clamp(((t * 1.6) % 1) * 2.2 - 1.2));
  const aR = lerp(sem[si][0], sem[sj][0], sk), aL = lerp(sem[si][1], sem[sj][1], sk);
  S.rafael.update(t, { x: ST[2] - 0.6, pose: { armR: [aR, -0.1, 0], armL: [-aL, 0.1, 0], handL: 'hold', handR: 'hold' }, smile: 0.8, look: [0.6, 0.1], idle: true });
  for (const [s, fl] of [['R', S.flagR], ['L', S.flagL]]) {
    const w = S.rafael.h.J['wr' + s]; w.updateWorldMatrix(true, false); const v = new THREE.Vector3(); w.getWorldPosition(v);
    const ang = w.getWorldQuaternion(new THREE.Quaternion()); const e = new THREE.Euler().setFromQuaternion(ang);
    fl.position.set(v.x, v.y, S.rafael.root.position.z + (s === 'R' ? 0.25 : -0.35)); fl.rotation.z = e.z + Math.PI; fl.scale.x = s === 'R' ? 1 : -1;
  }
  S.partner.update(t, { x: ST[2] + 2.4, pose: mixPose(restPose(), wave(t, 'L', 0.6), pulse(t, 1.0, 6, 0.4, 0.4)), smile: 0.8, look: [-0.7, 0.1] });
  // station 4 — tent following the picture card
  const tk = prog(t, 4.6, 1.8, ease.outBack);
  S.tent.body.scale.set(1, Math.max(0.15, 0.15 + 0.85 * tk), 1); S.tent.rope.scale.set(1, Math.max(0.15, 0.15 + 0.85 * tk), 1);
  S.card.steps.forEach((f, i) => { const on = t > 4.4 + i * 0.6; f.userData.fill.material.uniforms.uColor.value.set(on ? '#FFF6A8' : '#EAF4FF'); });
  S.bia.update(t, { x: ST[3] - 0.3, pose: mixPose({ ...restPose(), armR: [1.9, -0.4, 0], armL: [-0.3, -0.2, 0], handR: 'hold' }, { armR: [1.4, -0.2, 0], spine: 0.06 }, pulse(t, 4.6, 6.4, 0.6, 0.6)), smile: 0.85, look: t < 4.6 ? [-0.7, 0.1] : [0.7, 0.1], facing: t < 4.6 ? -0.2 : 0.35 });
  // station 5 — AAC answer
  S.theo.update(t, { x: ST[4] - 0.6, hands: (tt, h, chair) => {
    const cell = chair.tablet.cells[4]; const v = new THREE.Vector3(); cell.getWorldPosition(v);
    const pk = pulse(tt, 5.4, 6.2, 0.25, 0.3);
    h.reach(h.facing > 0 ? 'L' : 'R', v.x, v.y + 0.04 + (1 - pk) * 0.3, -1); h.setHand(h.facing > 0 ? 'L' : 'R', 'point');
    chair.tablet.press(4, pk);
  }, smile: 0.6 + pulse(t, 6.0, 9, 0.3, 0.5) * 0.35, look: [0.5, -0.4] });
  show(S.quizOk, t, 6.05, 7.2);
  // station 6 — Lia paints; lanyard sparkle on "não imediatamente visíveis"
  const pk = prog(t, 6.9, 3.2, ease.linear);
  S.banner.stripes.forEach((st, i) => { const v = clamp(pk * 4 - i); st.scale.x = Math.max(0.001, v); st.position.x = -1.1 * (1 - v); });
  S.lia.update(t, { x: ST[5] - 0.6, pose: { ...restPose(), armR: [1.7 + Math.sin(t * 4) * 0.25, 0.4, 0], handR: 'hold' }, smile: 0.8, look: [0.6, 0.15], facing: t > 8.3 && t < 10.2 ? 0.1 : 0.35 });
  const w = new THREE.Vector3(); S.lia.h.J.wrR.getWorldPosition(w); S.brush.position.set(w.x, w.y - 0.05, S.lia.root.position.z + 0.3); S.brush.rotation.z = -0.6;
  const ch = new THREE.Vector3(); S.lia.h.J.chest.getWorldPosition(ch);
  S.glow.position.set(ch.x + 0.3, ch.y + S.lia.h.A.torso - 0.45, 3); S.glow.rotation.z = t * 2; show(S.glow, t, 8.6, 10.0, 0.3);
  // group shot (from 10.75): all seven together, equal prominence
  const G = S.g; const gp = t - 10.75;
  const cheer = pulse(t, 16.2, 30, 0.35, 0.5);
  const hi = (side) => (side === 'R' ? { armR: [2.7, 0.3, 0], handR: 'open' } : { armL: [-2.7, -0.3, 0], handL: 'open' });
  G.clara.update(t, { x: GX - 2.9, pose: mixPose(restPose(), hi('R'), cheer), smile: 0.8 + cheer * 0.2, mouth: cheer > 0.5 ? 0.35 : null });
  G.rafael.update(t, { x: GX - 1.2, pose: mixPose(mixPose(restPose(), explain(t, 0.8, 3), pulse(t, 11, 14.5, 0.5, 0.5)), { ...hi('L'), ...hi('R') }, cheer), smile: 0.85, talk: (tt) => tt > 11.2 && tt < 13.8 });
  G.lia.update(t, { x: GX + 1.0, pose: mixPose(restPose(), hi('L'), cheer), smile: 0.85, mouth: cheer > 0.5 ? 0.3 : null });
  G.ana.update(t, { x: GX + 2.9, pose: mixPose(restPose(), { ...hi('L'), ...hi('R') }, cheer), smile: 0.9, look: [-0.5, 0] });
  G.pedro.update(t, { x: GX - 3.4, hands: 'rest', pose: mixPose({ armL: [0.5, 0.9, 0], armR: [0.5, 0.9, 0] }, { armL: [-2.6, -0.3, 0], armR: [2.4, 0.5, 0] }, cheer), smile: 0.9, mouth: cheer > 0.5 ? 0.4 : null });
  G.bia.update(t, { x: GX + 0.0, y: -1.2, pose: mixPose(restPose(), { ...hi('L'), ...hi('R') }, cheer), smile: 0.9, mouth: cheer > 0.5 ? 0.4 : null });
  G.theo.update(t, { x: GX + 3.3, hands: (tt, h, chair) => { chair.tablet.press(2, pulse(tt, 16.3, 17.2, 0.2, 0.3)); }, pose: mixPose({ armL: [-0.3, -0.9, 0], armR: [-0.3, -0.9, 0] }, { armL: [-2.4, -0.4, 0] }, cheer), smile: 0.8 + cheer * 0.2 });
  const keys = ['clara', 'rafael', 'lia', 'ana', 'pedro', 'bia', 'theo'];
  S.icons.forEach((b, i) => { const a = G[keys[i]]; const h = a.h; const hp = new THREE.Vector3(); h.J.head.getWorldPosition(hp); b.position.set(hp.x + 0.55, hp.y + h.R * 2.2, 4); b.rotation.z = Math.sin(t * 2 + i) * 0.08; show(b, t, 11.6 + i * 0.22, 15.0); });
  // camera
  if (t < 10.75) return camAt(CAM, t);
  return camAt([[10.75, [GX + 0.1, 1.55, 1.2]], [14.6, [GX + 0.1, 1.5, 1.26]], [17.9, [GX + 0.1, 1.6, 1.2]]], t);
}
