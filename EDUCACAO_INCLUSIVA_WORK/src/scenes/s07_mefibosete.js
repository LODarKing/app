// CENA 7 — DAVI E MEFIBOSETE (108.73–129.87, local 0–21.14)  2 Samuel 9
// David asks about Jonathan's family; a messenger finds Mephibosheth in Lo-Debar;
// he bows before the king, insecure; David welcomes him; a permanent place at the king's table.
// His disability (feet) is not depicted with any invented mobility device.
import * as THREE from 'three';
import { P, shade } from '../core/palette.js';
import { warmSky, palace, throne, humbleHouse, palm, pavement } from '../environments/bible.js';
import { banquetTable } from '../environments/indoor.js';
import { Actor, camAt, path, kneelAt } from './kit.js';
import { restPose, mixPose, explain, sit, faceLife, idle } from '../animations/cycles.js';
import { pulse, prog, ease, clamp, lerp } from '../core/math.js';
import { show, sparkle, grp, heart } from '../objects/fx.js';
import { vpart, rrectPts, circlePts, strokePts, roundPoly, ellipsePts, setOpacity } from '../core/vector.js';
import { screenLayer, board } from './ui.js';

const LX = 40, TX = 80;   // Lo-Debar set and banquet set positions (palace at 0)

function scroll() {
  const g = new THREE.Group();
  const paper = vpart({ pts: rrectPts(6.4, 4.2, 0.05), color: '#F3E3BC', shade: '#E2CC9A', mode: 2, p: [1, -1, 2.0, 0], z: 0 }); g.add(paper);
  const lines = []; for (let i = 0; i < 6; i++) { const l = vpart({ pts: rrectPts(4.6, 0.08, 0.03, 0, 1.2 - i * 0.5), color: '#C2A774', outline: 0, z: 0.01 }); g.add(l); lines.push(l); }
  const rollL = vpart({ pts: rrectPts(0.5, 4.8, 0.25), color: '#8C5A34', shade: '#6E4426', mode: 2, p: [1, 0, 0.1, 0], z: 0.02 });
  const rollR = vpart({ pts: rrectPts(0.5, 4.8, 0.25), color: '#8C5A34', shade: '#6E4426', mode: 2, p: [1, 0, 0.1, 0], z: 0.02 });
  g.add(rollL, rollR);
  return { g, paper, lines, rollL, rollR, open(k) { paper.scale.x = Math.max(0.02, k); lines.forEach((l) => { l.scale.x = Math.max(0.02, k); }); rollL.position.x = -3.3 * k; rollR.position.x = 3.3 * k; } };
}
function food() {
  const g = new THREE.Group();
  const bread = (x) => g.add(vpart({ pts: ellipsePts(0.42, 0.2, 30, x, 1.55), color: '#D9A35B', shade: '#B97E3A', mode: 1, p: [-0.1, 0.1, 0.36, 0], outline: 0.03, z: 0.05 }));
  const grapes = (x) => { for (let i = 0; i < 7; i++) g.add(vpart({ pts: circlePts(0.09, 12, x + (i % 3) * 0.13 - 0.13, 1.6 - Math.floor(i / 3) * 0.12), color: '#7E3A7E', outline: 0.02, z: 0.06 + i * 0.001 })); };
  const cup = (x) => g.add(vpart({ pts: roundPoly([[x - 0.15, 1.85], [x + 0.15, 1.85], [x + 0.08, 1.55], [x + 0.03, 1.45], [x + 0.12, 1.42], [x - 0.12, 1.42], [x - 0.03, 1.45], [x - 0.08, 1.55]], 0.02), color: P.gold, outline: 0.02, z: 0.05 }));
  bread(-2.0); grapes(-0.9); cup(0.2); bread(1.2); grapes(2.3); cup(-2.8); cup(2.9);
  return g;
}

export function build() {
  const scene = new THREE.Scene();
  const S = { scene };
  palace(scene, { y: 0 });
  S.throne = throne(); S.throne.position.set(-2.2, 0, -1.5); scene.add(S.throne);
  S.david = new Actor(scene, 'david', { x: -2.2, z: 0.0, facing: 0.35, seed: 40 });
  S.msg = new Actor(scene, 'messenger', { x: 2.2, z: 0.6, facing: -0.45, seed: 41 });
  S.mef = new Actor(scene, 'mefibosete', { x: 3.4, z: 0.8, facing: -0.45, seed: 42 });
  // Lo-Debar (outdoor, warm, modest)
  const lo = new THREE.Group(); lo.position.x = LX; scene.add(lo);
  lo.add(vpart({ pts: rrectPts(40, 30, 0.01, 0, 9), color: '#F6C88A', shade: '#FBE7C0', mode: 3, p: [2, 12, 0, 0], outline: 0, z: -39.5 }));
  lo.add(vpart({ pts: rrectPts(40, 12, 0.01, 0, -6), color: '#D9BE8C', shade: '#B79A66', mode: 3, p: [-8, 0, 0, 0], outline: 0, z: -19.5 }));
  humbleHouse(lo, { x: 0.5, y: 0, z: -8 });
  const pl = palm(1.2); pl.position.set(-4.6, 0, -9); lo.add(pl);
  S.bench = vpart({ pts: rrectPts(1.8, 0.16, 0.05, LX - 0.6, 0.62), color: '#8C6440', z: 0.2 }); scene.add(S.bench);
  for (const s of [-1, 1]) scene.add(vpart({ pts: rrectPts(0.12, 0.62, 0.03, LX - 0.6 + s * 0.7, 0.31), color: '#6E4E30', z: 0.19 }));
  S.mefL = new Actor(scene, 'mefibosete', { x: LX - 0.6, z: 0.8, facing: 0.4, seed: 43 });
  S.msgL = new Actor(scene, 'messenger', { x: LX + 6, z: 0.6, facing: -0.45, seed: 44 });
  // banquet hall (same palace architecture, shifted)
  const bq = new THREE.Group(); bq.position.x = TX; scene.add(bq);
  palace(bq, { y: 0 });
  S.tbl = banquetTable(7.0, 1.35); S.tbl.position.set(TX, 0, 2.0); scene.add(S.tbl);
  S.food = food(); S.food.position.set(TX, 0, 2.0); scene.add(S.food);
  S.dT = new Actor(scene, 'david', { x: TX - 0.9, z: 0.4, facing: 0.25, seed: 45 });
  S.mT = new Actor(scene, 'mefibosete', { x: TX + 1.1, z: 0.5, facing: -0.25, seed: 46 });
  S.g1 = new Actor(scene, 'guest1', { x: TX - 2.75, z: 0.3, facing: 0.35, seed: 47 });
  S.g2 = new Actor(scene, 'guest2', { x: TX + 2.85, z: 0.3, facing: -0.35, seed: 48 });
  S.hearts = [0, 1, 2].map((i) => { const h = heart(i === 1 ? P.yellow : P.pink, 0.45); scene.add(h); return h; });
  // scroll (screen space)
  S.ui = screenLayer(scene, 20);
  S.bg = board('#2A1A3E', '#7E3A7E', 31); S.ui.g.add(S.bg);
  S.sc = scroll(); S.sc.g.position.set(0, 0.6, 0.4); S.ui.g.add(S.sc.g);
  return S;
}

function seated(a, t, x, seatY, opts = {}) {
  const h = a.h; h.root.visible = true;
  sit(h, [x, seatY], [x + (opts.dir || 1) * 0.6, 0.02], { dir: opts.dir || 1, base: idle(t, a.seed, opts.pose || { armL: [-0.25, -0.6, 0], armR: [0.25, 0.6, 0] }) });
  if (opts.face) faceLife(h, t, { seed: a.seed, ...opts.face });
}

export function update(S, t) {
  // scroll intro
  S.sc.open(prog(t, 0.1, 0.8, ease.outCubic));
  const so = 1 - prog(t, 1.55, 0.45);
  S.bg.visible = S.sc.g.visible = so > 0.01; setOpacity(S.bg, so); setOpacity(S.sc.g, so);
  // B (palace): David on the throne sends the messenger
  const inPal1 = t < 4.45, inLo = t >= 4.45 && t < 7.55, inPal2 = t >= 7.55 && t < 13.35;
  S.david.root.visible = S.msg.root.visible = inPal1 || inPal2; S.mef.root.visible = inPal2;
  if (inPal1) {
    seated(S.david, t, -2.2, 1.25, { pose: mixPose({ armL: [-0.3, -0.7, 0], armR: [0.3, 0.7, 0] }, { armR: [1.4, 0.3, 0], handR: 'point' }, pulse(t, 2.1, 3.6, 0.3, 0.4)), face: { talk: (tt) => tt > 2.0 && tt < 3.6, smile: 0.5, look: [0.7, 0] } });
    S.msg.update(t, { x: [[0, 1.6], [3.5, 1.6], [4.6, 4.8]], facing: t < 3.5 ? -0.45 : 0.5, pose: { ...restPose(), spine: t > 2.9 && t < 3.5 ? 0.25 : 0 }, smile: 0.5, look: [-0.8, 0] });
  }
  // C (Lo-Debar): the messenger finds Mephibosheth
  S.mefL.root.visible = S.msgL.root.visible = inLo;
  if (inLo) {
    seated(S.mefL, t, LX - 0.6, 0.78, { pose: { armL: [-0.2, -0.5, 0], armR: [0.3, 0.6, 0] }, face: { smile: t < 6.3 ? 0.1 : 0.35, look: t < 5.6 ? [0.2, -0.3] : [0.8, 0.05], brow: t > 5.6 ? 0.5 : 0, browTilt: t > 6.3 ? 0.4 : 0 } });
    S.mefL.h.setFacing(0.4);
    S.msgL.update(t, { x: [[4.45, LX + 5], [6.0, LX + 1.6]], facing: -0.45, pose: mixPose(restPose(), { armL: [-1.5, -0.3, 0], handL: 'open', spine: 0.1 }, pulse(t, 6.2, 7.6, 0.3, 0.3)), talk: (tt) => tt > 6.3 && tt < 7.4, smile: 0.6, look: [-0.8, -0.1] });
  }
  // D/E (palace): bows, insecure; David rises and welcomes him
  if (inPal2) {
    const rise = prog(t, 9.9, 1.0, ease.inOutCubic);
    if (rise <= 0) seated(S.david, t, -2.2, 1.25, { pose: { armL: [-0.3, -0.7, 0], armR: [0.3, 0.7, 0] }, face: { smile: 0.4, look: [0.8, -0.3] } });
    else S.david.update(t, { x: [[9.9, -2.0], [11.4, 0.2]], y: [[9.9, 0.5], [11.0, 0]], facing: 0.4, pose: mixPose(restPose(), { armR: [1.3, 0.25, 0], handR: 'open' }, prog(t, 10.9, 0.6)), smile: 0.85, talk: (tt) => tt > 11.3 && tt < 12.6, look: [0.8, -0.2] });
    const bow = pulse(t, 7.9, 11.5, 0.7, 0.8);
    if (t < 8.3) { S.mef.h.root.position.y = 0; if (S.mef.h.J.skirt) S.mef.h.J.skirt.scale.y = 1; S.mef.update(t, { x: [[7.55, 2.7], [8.3, 2.1]], facing: -0.45, smile: -0.1, browTilt: 0.7, look: [-0.5, -0.3] }); }
    else {
      kneelAt(S.mef.h, 2.1, 0, bow, -1, t, 42, { spine: 0.35 * bow, head: 0.25 * bow, armL: [0.3 * bow, 0.6, 0], armR: [0.6 * bow, 0.4, 0] });
      faceLife(S.mef.h, t, { seed: 42, smile: lerp(-0.25, 0.85, prog(t, 11.4, 0.8)), browTilt: lerp(0.85, 0, prog(t, 11.2, 0.8)), look: t < 11.0 ? [-0.3, -0.85] : [-0.8, 0.25] });
    }
    S.msg.update(t, { x: 4.3, facing: -0.45, smile: 0.5 });
  }
  // F (banquet): a permanent place at the king's table
  const inBq = t >= 13.35;
  for (const a of [S.dT, S.mT, S.g1, S.g2]) a.root.visible = inBq;
  S.hearts.forEach((h) => { h.visible = false; });
  if (inBq) {
    seated(S.dT, t, TX - 0.9, 0.95, { pose: mixPose({ armL: [-0.4, -0.9, 0], armR: [0.6, 1.2, 0] }, explain(t, 0.7, 4), pulse(t, 15.0, 17.5, 0.4, 0.4)), face: { smile: 0.85, talk: (tt) => tt > 15.2 && tt < 17.2, look: [0.7, 0] } });
    seated(S.mT, t, TX + 1.1, 0.95, { dir: -1, pose: { armL: [-0.6, -1.2, 0], armR: [0.4, 0.9, 0] }, face: { smile: 0.9, look: [-0.7, 0.05] } });
    S.mT.h.setFacing(-0.25); S.dT.h.setFacing(0.25);
    seated(S.g1, t, TX - 2.75, 0.95, { pose: { armL: [-0.4, -0.9, 0], armR: [0.5, 1.1, 0] }, face: { smile: 0.75, look: [0.8, 0], talk: (tt) => tt > 18.2 && tt < 19.2 } });
    seated(S.g2, t, TX + 2.85, 0.95, { dir: -1, pose: { armL: [-0.5, -1.1, 0], armR: [0.4, 0.9, 0] }, face: { smile: 0.8, look: [-0.8, 0] } });
    S.hearts.forEach((h, i) => { h.position.set(TX - 1.5 + i * 1.5 + Math.sin(t + i) * 0.1, 4.6 + i % 2 * 0.3 + Math.sin(t * 2 + i) * 0.1, 3); show(h, t, 18.5 + i * 0.35, 99); });
  }
  // camera
  if (t < 4.45) return camAt([[0, [0.2, 2.6, 1.5]], [1.8, [0.2, 2.6, 1.5]], [4.45, [-0.2, 2.5, 1.6]]], t);
  if (t < 7.55) return camAt([[4.45, [LX + 1.2, 2.2, 1.7]], [7.55, [LX + 0.8, 2.15, 1.85]]], t);
  if (t < 13.35) return camAt([[7.55, [0.3, 2.4, 1.6]], [10.0, [0.6, 2.3, 1.75]], [13.35, [0.1, 2.35, 1.9]]], t);
  return camAt([[13.35, [TX, 2.35, 1.5]], [21.2, [TX, 2.4, 1.62]]], t);
}
