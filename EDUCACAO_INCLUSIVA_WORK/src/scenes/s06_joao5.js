// CENA 6 — O EXEMPLO DE JESUS (88.87–108.73, local 0–19.86)  João 5:1–18
// Bible opens -> pool of Bethesda (colonnades). Jesus finds a man who had lived with a
// limitation for 38 years, kneels to his eye level, listens, speaks; the healing told in
// the text; leaders question it because it is the Sabbath; Jesus' attention to the person.
import * as THREE from 'three';
import { P, shade } from '../core/palette.js';
import { warmSky, cityWall, colonnade, pool, pavement, restingFigures, mat, rolledMat } from '../environments/bible.js';
import { Actor, camAt, path } from './kit.js';
import { restPose, mixPose, explain, sit, faceLife, idle } from '../animations/cycles.js';
import { pulse, prog, ease, clamp, lerp } from '../core/math.js';
import { show, sparkle, grp } from '../objects/fx.js';
import { vpart, rrectPts, circlePts, strokePts, roundPoly, setOpacity } from '../core/vector.js';
import { screenLayer, board } from './ui.js';

const GY = 0;

function bigBible() {
  const g = new THREE.Group();
  const pages = new THREE.Group(); g.add(pages);
  for (const s of [-1, 1]) {
    pages.add(vpart({ pts: roundPoly([[0, -2.6], [s * 3.6, -2.4], [s * 3.6, 2.7], [0, 2.5]], 0.1), color: '#FFFDF4', shade: '#EFE6CF', mode: 2, p: [-s, 0, -3.2, 0], outline: 0.05, z: 0.01 }));
    for (let i = 0; i < 9; i++) pages.add(vpart({ pts: rrectPts(2.6, 0.07, 0.03, s * 1.8, 1.8 - i * 0.45), color: '#CFC3A6', outline: 0, z: 0.02 }));
  }
  pages.add(vpart({ pts: roundPoly([[-3.8, -2.75], [0, -2.95], [3.8, -2.75], [3.8, -2.5], [0, -2.7], [-3.8, -2.5]], 0.05), color: '#6A2E2A', outline: 0.04, z: 0.0 }));
  const cover = new THREE.Group(); g.add(cover);
  cover.add(vpart({ pts: rrectPts(3.8, 5.4, 0.2, 1.9, 0.0), color: '#6A2E2A', shade: '#4E2220', mode: 2, p: [1, 0, 3.2, 0], z: 0.05 }));
  cover.add(vpart({ pts: rrectPts(0.22, 1.4, 0.04, 1.9, 0.4), color: P.gold, outline: 0, z: 0.06 }));
  cover.add(vpart({ pts: rrectPts(0.9, 0.22, 0.04, 1.9, 0.75), color: P.gold, outline: 0, z: 0.06 }));
  return { g, cover, pages };
}

export function build() {
  const scene = new THREE.Scene();
  const S = { scene };
  warmSky(scene, 8, 90);
  cityWall(scene, { y: GY + 3.6, x0: -40, x1: 40 });
  pavement(scene, { y: GY });
  colonnade(scene, { x0: -16, n: 13, gap: 2.7, y: GY + 0.6, h: 4.6, z: -12 });
  restingFigures(scene, [-14.6, -9.2, -3.8, 4.3, 9.8, 15.0], { y: GY + 0.6 });
  S.pool = pool(scene, { x: 2.0, y: GY - 0.6, w: 10, d: 2.6, z: -6 });
  S.mat = mat(); S.mat.position.set(-1.4, GY + 0.08, 0.2); scene.add(S.mat);
  S.roll = rolledMat(); scene.add(S.roll);
  S.man = new Actor(scene, 'bethesdaMan', { x: -2.4, z: 0.8, facing: 0.55, seed: 31 });
  S.jesus = new Actor(scene, 'jesus', { x: 8, z: 1.2, facing: -0.5, seed: 30 });
  S.l1 = new Actor(scene, 'leader1', { x: -9.4, z: -2.0, facing: 0.45, seed: 32 });
  S.l2 = new Actor(scene, 'leader2', { x: -11.2, z: -2.2, facing: 0.5, seed: 33 });
  S.sun = grp(vpart({ pts: circlePts(0.45, 30), color: P.gold, outline: 0.04 }), ...[...Array(8)].map((_, i) => { const a = (i / 8) * Math.PI * 2; return vpart({ pts: strokePts([[Math.cos(a) * 0.62, Math.sin(a) * 0.62], [Math.cos(a) * 0.85, Math.sin(a) * 0.85]], 0.1), color: P.gold, outline: 0.03, z: -0.01 }); }));
  scene.add(S.sun);
  S.glow = [...Array(7)].map((_, i) => { const s = sparkle(i % 2 ? '#FFFFFF' : P.yellow, 0.35 + (i % 3) * 0.12); scene.add(s); return s; });
  // the Bible opening (screen space)
  S.ui = screenLayer(scene, 20);
  S.bg = board('#2A1A3E', '#5B3A8C', 21); S.ui.g.add(S.bg);
  S.bible = bigBible(); S.bible.g.position.set(0, 0.6, 0.5); S.ui.g.add(S.bible.g);
  return S;
}

/** man: seated on the mat -> standing (k 0..1) */
function manPose(S, t, k) {
  const h = S.man.h, x = -2.4, dir = 1;
  h.root.position.z = 0.8;
  if (k <= 0.001) {
    const r = h.root; r.position.x = x;
    sit(h, [x, GY + 0.32], [x + 1.15, GY + 0.02], { dir, base: idle(t, 31, { spine: 0.12, head: -0.05, armL: [0.25, 0.25, 0], armR: [0.6, 0.5, 0] }) });
    for (const s of ['L', 'R']) { h.plant(s, x + 1.25 + (s === 'L' ? -0.04 : 0.04), GY + h.A.ankle + 0.03, -1); h.J['ankle' + s].rotation.z = -(h.J['hip' + s].rotation.z + h.J['knee' + s].rotation.z); }
  } else {
    const hipStand = h.hipY - 0.05, hipSit = 0.32;
    const hy = lerp(hipSit, hipStand, ease.inOutCubic(k));
    h.root.position.set(x + 0.55 * ease.inOutCubic(k), GY + hy - h.hipY, 0.8);
    h.setPose(idle(t, 31, { spine: lerp(0.35, 0.0, k) * (k < 1 ? 1 : 0), head: 0.05, armL: [-0.1, 0.1, 0], armR: [0.5 - 0.3 * k, 0.9, 0] }));
    const fx = lerp(x + 1.25, x + 0.55, ease.inOutCubic(Math.min(1, k * 1.6)));
    for (const s of ['L', 'R']) { h.plant(s, fx + (s === 'L' ? -0.12 : 0.12), GY + h.A.ankle, -1); h.J['ankle' + s].rotation.z = -(h.J['hip' + s].rotation.z + h.J['knee' + s].rotation.z + h.J.hips.rotation.z); }
  }
}
/** Jesus kneels on one knee at x facing left (k 0..1) */
function kneel(h, x, k, t) {
  const dir = -1, A = h.A;
  const drop = ease.inOutCubic(k) * (A.thigh * 1.08);
  h.root.position.set(x, GY - drop, 1.2);
  h.setPose(idle(t, 30, { spine: dir * 0.1 * k, head: -dir * 0.08 * k, armL: [-0.2, -0.3, 0], armR: [0.3, 0.3, 0] }));
  if (h.J.skirt) h.J.skirt.scale.y = 1 - 0.42 * ease.inOutCubic(k);
  h.plant('R', x + dir * 0.45, GY + A.ankle, -dir);                       // front foot
  h.plant('L', x - dir * 0.55, GY + A.ankle + 0.02 * k, -dir);            // back knee toward ground
  for (const s of ['L', 'R']) h.J['ankle' + s].rotation.z = -(h.J['hip' + s].rotation.z + h.J['knee' + s].rotation.z + h.J.hips.rotation.z);
}

export function update(S, t) {
  S.pool.animate(t);
  // ---- Bible opens (0–1.5), then fades into Bethesda
  const open = prog(t, 0.15, 0.7, ease.inOutCubic);
  S.bible.cover.scale.x = Math.cos(open * Math.PI); S.bible.cover.visible = Math.abs(S.bible.cover.scale.x) > 0.02;
  const bo = 1 - prog(t, 1.15, 0.45);
  S.bg.visible = S.bible.g.visible = bo > 0.01; setOpacity(S.bg, bo); setOpacity(S.bible.g, bo); S.bible.g.scale.setScalar(1 + prog(t, 1.0, 0.6, ease.inCubic) * 1.8);
  // ---- man & Jesus
  const rise = prog(t, 9.35, 1.3, ease.inOutCubic);
  manPose(S, t, rise);
  S.mat.visible = rise < 0.6; S.roll.visible = rise >= 0.6;
  const wr = new THREE.Vector3(); S.man.h.J.wrR.getWorldPosition(wr); S.roll.position.set(wr.x + 0.1, wr.y - 0.05, 1.5); S.roll.rotation.z = 0.25;
  const talkMan = (tt) => (tt > 6.6 && tt < 7.7) || (tt > 14.4 && tt < 15.4);
  faceLife(S.man.h, t, { seed: 31, talk: talkMan, smile: t < 6.2 ? 0.0 : t < 9.4 ? 0.3 : 0.9, brow: t > 9.6 ? 0.6 : 0.1, browTilt: t < 6.2 ? 0.45 : 0, look: t < 2.4 ? [0.2, -0.3] : [0.7, 0.15] });
  const jx = [[0, 8.4], [1.4, 8.4], [5.0, -0.1, ease.inOutSine]];
  const kn = pulse(t, 5.9, 9.2, 0.7, 0.6);
  if (kn > 0.001) { kneel(S.jesus.h, -0.1, kn, t); S.jesus.h.setFacing(-0.5); faceLife(S.jesus.h, t, { seed: 30, talk: (tt) => tt > 7.8 && tt < 8.9, smile: 0.6, look: [-0.7, -0.2], brow: 0.15 }); if (t > 8.6) S.jesus.h.reach('L', -1.25, GY + 1.55, 1); }
  else { if (S.jesus.h.J.skirt) S.jesus.h.J.skirt.scale.y = 1; S.jesus.update(t, { x: jx, facing: -0.5, smile: 0.65, look: t > 12 ? [-0.8, 0.1] : [-0.8, -0.1], pose: t > 13.6 ? mixPose(restPose(), { armL: [-0.95, -0.35, 0] }, pulse(t, 13.8, 19.5, 0.5, 0.5)) : undefined, talk: (tt) => tt > 15.5 && tt < 16.9 }); }
  // healing: soft light (no halo on Jesus)
  S.glow.forEach((s, i) => { const a = (i / 7) * Math.PI * 2 + t; s.position.set(-1.8 + Math.cos(a) * 1.1, GY + 1.9 + Math.sin(a) * 1.2, 3); s.rotation.z = t * 2 + i; show(s, t, 8.85 + i * 0.05, 10.9, 0.3); });
  // leaders question it (Sabbath)
  const lp = (tt) => mixPose(restPose(), { armR: [1.5, 0.1, 0], handR: 'point' }, pulse(tt, 11.7, 13.6, 0.3, 0.4));
  S.l1.update(t, { x: [[0, -9.4], [10.4, -9.4], [11.6, -7.8]], facing: 0.45, pose: lp, smile: -0.4, browTilt: -0.6, brow: -0.2, talk: (tt) => tt > 11.8 && tt < 13.2, look: [0.8, -0.1] });
  S.l2.update(t, { x: [[0, -10.6], [10.6, -10.6], [11.8, -9.3]], facing: 0.5, pose: { ...restPose(), armL: [0.9, -2.3, 0], armR: [-0.9, 2.3, 0] }, smile: -0.3, browTilt: -0.5, look: [0.8, -0.1] });
  S.sun.position.set(-6.2, 6.6, -5); S.sun.rotation.z = t * 0.4; show(S.sun, t, 12.75, 14.3);
  // camera
  return camAt([[0, [1.0, 2.3, 1.45]], [1.5, [1.0, 2.3, 1.45]], [3.6, [-0.4, 2.0, 1.6]], [5.8, [-1.0, 1.8, 1.9]], [9.0, [-1.2, 1.75, 2.05]], [10.4, [-1.6, 2.2, 1.8]],
    [11.4, [-6.6, 2.6, 1.55]], [13.6, [-6.4, 2.6, 1.55]], [14.6, [-1.1, 2.2, 2.0]], [17.6, [-1.1, 2.3, 2.05]], [19.9, [-0.6, 3.0, 1.45]]], t);
}
