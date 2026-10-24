// CENA 4 — DISCRIMINAÇÃO E BULLYING (51.56–69.97, local 0–18.41)
// A: unequal treatment — team cards handed to everyone except Rafael (rights denied).
// B: intentional, repeated aggression; humiliation and offensive nicknames (shown only as
//    scribbled symbols, never words). C: exclusion and cyberbullying (screen cards).
// D: peers interrupt, stand with João and bring in the director (responsible adult).
import * as THREE from 'three';
import { P, shade } from '../core/palette.js';
import { room, table } from '../environments/indoor.js';
import { Actor, camAt, path } from './kit.js';
import { restPose, mixPose, point, explain } from '../animations/cycles.js';
import { pulse, prog, ease, clamp, lerp } from '../core/math.js';
import { show, speechBubble, grawlix, person, cross, grp, heart } from '../objects/fx.js';
import { vpart, vring, rrectPts, circlePts, strokePts, roundPoly, setOpacity } from '../core/vector.js';
import { phone } from '../objects/accessibility.js';
import { screenLayer, board } from './ui.js';

const AX = -6, BX = 6;

function padlock(s = 1) {
  return grp(vring({ outer: [...Array(24)].map((_, i) => { const a = Math.PI * (i / 23); return [Math.cos(a) * 0.32 * s, 0.2 * s + Math.sin(a) * 0.32 * s]; }).concat([[-0.32 * s, 0.2 * s], [-0.32 * s, 0.0], [-0.22 * s, 0], [-0.22 * s, 0.2 * s]]).slice(0, 24), inner: [...Array(24)].map((_, i) => { const a = Math.PI * (i / 23); return [Math.cos(a) * 0.2 * s, 0.2 * s + Math.sin(a) * 0.2 * s]; }), color: '#9AA7B8', outline: 0.03 }),
    vpart({ pts: rrectPts(0.85 * s, 0.7 * s, 0.1 * s, 0, -0.1 * s), color: P.red, outline: 0.04, z: 0.01 }), vpart({ pts: circlePts(0.09 * s, 14, 0, -0.06 * s), color: P.ink, outline: 0, z: 0.02 }));
}
function notEqual(s = 1) {
  return grp(vpart({ pts: rrectPts(1.0 * s, 0.2 * s, 0.1 * s, 0, 0.2 * s), color: P.red, outline: 0.05 * s }), vpart({ pts: rrectPts(1.0 * s, 0.2 * s, 0.1 * s, 0, -0.2 * s), color: P.red, outline: 0.05 * s }), vpart({ pts: strokePts([[-0.3 * s, -0.55 * s], [0.3 * s, 0.55 * s]], 0.16 * s), color: P.red, outline: 0.05 * s, z: 0.01 }));
}

export function build() {
  const scene = new THREE.Scene();
  const S = { scene };
  room(scene, { x0: -16, x1: 18, wall: '#D5E0EC', floor: '#BF9A74', windows: [-9.5, 9.5], boards: [-2.5, 4.2, 14] });
  S.table = table(3.0, 1.25); S.table.position.set(AX + 0.9, 0, 0.6); scene.add(S.table);
  S.stack = vpart({ pts: rrectPts(0.6, 0.18, 0.04, 0, 0), color: P.yellow, z: 0 }); S.stack.position.set(AX + 1.3, 1.42, 0.7); scene.add(S.stack);
  S.cards = [0, 1, 2].map(() => { const c = vpart({ pts: rrectPts(0.42, 0.3, 0.05), color: P.yellow, outline: 0.02 }); scene.add(c); return c; });
  S.caio = new Actor(scene, 'caio', { x: AX + 1.3, z: -0.4, facing: -0.35, seed: 21 });
  S.ana = new Actor(scene, 'ana', { x: AX - 1.2, z: 1.2, facing: 0.5, seed: 2 });
  S.lucas = new Actor(scene, 'lucas', { x: AX - 2.8, z: 1.4, facing: 0.5, seed: 1 });
  S.rafael = new Actor(scene, 'rafael', { x: AX - 4.2, z: 1.6, facing: 0.5, seed: 5 });
  S.neq = notEqual(0.7); scene.add(S.neq);
  S.lock = padlock(0.9); scene.add(S.lock);
  S.joao = new Actor(scene, 'joao', { x: BX + 0.6, z: 0.8, facing: -0.35, seed: 9 });
  S.nina = new Actor(scene, 'nina', { x: BX - 3.5, z: 1.0, facing: 0.45, seed: 22 });
  S.dir = new Actor(scene, 'director', { x: BX + 8, z: 0.3, facing: -0.45, seed: 8 });
  S.bub = [0, 1, 2].map((i) => { const b = grp(speechBubble(1.5, 0.95, '#FFFFFF', i === 1 ? 1 : -1, true), (() => { const g = grawlix(0.9); g.position.set(-0.05, 0.02, 0.02); return g; })()); scene.add(b); return b; });
  S.tally = [0, 1, 2].map((i) => { const g = grp(vpart({ pts: rrectPts(0.75, 0.85, 0.06), color: '#FFFFFF', z: 0 }), vpart({ pts: rrectPts(0.75, 0.22, 0.05, 0, 0.32), color: P.red, outline: 0, z: 0.002 }), vpart({ pts: strokePts([[-0.15, -0.25], [0.15, 0.08]], 0.07), color: P.ink, outline: 0, z: 0.004 })); g.position.set(BX - 1.2 + i * 0.95, 5.3, -20); scene.add(g); return g; });
  S.stopHand = null;
  // screen-space: mood dimmer + exclusion card + phone card
  const ui = S.ui = screenLayer(scene, 20);
  S.dim = vpart({ pts: rrectPts(12, 21, 0.01), color: '#190C3C', outline: 0, z: -2, opacity: 0.3 }); ui.g.add(S.dim);
  S.exG = new THREE.Group(); ui.g.add(S.exG);
  S.exG.add(board('#3A1E4F', '#5B3A8C', 8));
  const ring = new THREE.Group(); ring.position.set(-0.7, 0.6, 0); ring.scale.setScalar(1.35); S.exG.add(ring);
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.3; const p = person([P.royal, P.turquoise, P.green, P.pink, P.orange][i], 1.0); p.position.set(Math.cos(a) * 1.5, Math.sin(a) * 1.3, 0); ring.add(p); }
  ring.add(vring({ outer: [...Array(48)].map((_, i) => { const a = (i / 48) * Math.PI * 2; return [Math.cos(a) * 2.6, Math.sin(a) * 2.35]; }), inner: [...Array(48)].map((_, i) => { const a = (i / 48) * Math.PI * 2; return [Math.cos(a) * 2.45, Math.sin(a) * 2.2]; }), color: '#FFFFFF', z: -0.1 }));
  S.alone = person(P.yellow, 1.35); S.alone.position.set(3.4, -3.2, 0); S.exG.add(S.alone);
  S.phG = new THREE.Group(); ui.g.add(S.phG);
  S.phG.add(board('#3A1E4F', '#5B3A8C', 9));
  S.ph = phone({ w: 4.6, h: 8.6 }); S.ph.root.position.set(0, -0.3, 0); S.phG.add(S.ph.root);
  S.msgs = [0, 1, 2, 3, 4].map((i) => {
    const g = new THREE.Group(); const left = i % 2 === 0;
    g.add(vpart({ pts: rrectPts(3.2, 1.0, 0.4), color: left ? '#FFE3E6' : '#FFD0D6', outline: 0.03 }));
    const gl = grawlix(0.9); gl.position.set(-0.4, 0, 0.01); g.add(gl);
    const ang = vpart({ pts: circlePts(0.3, 24, 1.0, 0), color: P.red, outline: 0.03, z: 0.01 }); g.add(ang);
    g.add(vpart({ pts: strokePts([[0.85, 0.1], [0.97, 0.03]], 0.05), color: P.ink, outline: 0, z: 0.02 }), vpart({ pts: strokePts([[1.15, 0.1], [1.03, 0.03]], 0.05), color: P.ink, outline: 0, z: 0.02 }), vpart({ pts: strokePts([[0.88, -0.14], [1.0, -0.08], [1.12, -0.14]], 0.05), color: P.ink, outline: 0, z: 0.02 }));
    g.position.set(left ? -0.35 : 0.35, 2.6 - i * 1.25, 0.05); S.ph.root.add(g); return g;
  });
  S.badgeN = grp(vpart({ pts: circlePts(0.5, 30), color: P.red, outline: 0.04 })); S.badgeN.position.set(2.1, 3.9, 0.1); S.ph.root.add(S.badgeN);
  return S;
}

export function update(S, t) {
  // ---- A: unequal treatment at the team table
  const giveTo = [[0.35, S.ana], [1.35, S.lucas]];
  S.caio.update(t, {
    x: [[0, AX + 1.3], [5.9, AX + 1.3], [7.3, BX - 1.8]], facing: t < 5.9 ? -0.35 : 0.5,
    pose: (tt) => {
      if (tt < 2.0) return mixPose({ ...restPose(), armL: [-0.3, -1.4, 0], handL: 'hold' }, { armL: [-1.3, -0.4, 0] }, pulse(tt, 0.2, 0.7, 0.2, 0.25) + pulse(tt, 1.2, 1.7, 0.2, 0.25));
      if (tt < 5.9) return { ...restPose(), armL: [0.9, -2.3, 0], armR: [-0.9, 2.3, 0], head: Math.sin(tt * 9) * 0.12 * pulse(tt, 2.5, 3.6, 0.2, 0.3) };
      return tt < 13.4 ? mixPose(restPose(), point(-1, 'L', 0.1), pulse(tt, 7.6, 13.0, 0.3, 0.3)) : restPose();
    },
    smile: t < 2 ? 0.4 : t < 5.9 ? -0.2 : t < 13.5 ? 0.35 : -0.1, brow: t > 2.3 && t < 5.9 ? -0.3 : 0, browTilt: t > 6 && t < 13.5 ? -0.5 : 0,
    mouth: t > 7.6 && t < 13 ? 0.25 + 0.2 * Math.abs(Math.sin(t * 7)) : null,
  });
  S.ana.update(t, { x: [[0, AX - 0.7], [0.9, AX - 0.7], [2.2, AX + 3.6], [15.2, AX + 3.6], [16.5, BX - 1.0]], facing: t > 15.4 ? 0.45 : 0.5, smile: t < 6 ? 0.7 : 0.3,
    pose: mixPose(restPose(), { armL: [-1.6, -0.1, 0], handL: 'open', armR: [0.3, -1.2, 0] }, pulse(t, 16.2, 30, 0.3, 0.3)), brow: t > 16 ? -0.2 : 0, talk: (tt) => tt > 16.5 && tt < 17.6 });
  S.lucas.update(t, { x: [[0, AX - 2.6], [0.9, AX - 2.6], [1.3, AX - 0.8], [2.3, AX - 0.8], [3.6, AX + 4.6], [15.2, AX + 4.6], [16.7, BX + 1.45]], facing: t > 15.5 ? -0.3 : 0.5, smile: t < 6 ? 0.7 : 0.4 });
  S.rafael.update(t, { x: [[0, AX - 4.1], [1.6, AX - 4.1], [2.3, AX - 0.85]], pose: mixPose(restPose(), { armR: [1.2, -0.3, 0], handR: 'open' }, pulse(t, 2.3, 3.2, 0.25, 0.4)),
    smile: lerp(0.7, -0.25, prog(t, 2.8, 0.6)), brow: t > 3 ? 0.1 : 0, browTilt: lerp(0, 0.65, prog(t, 3.0, 0.6)), look: t > 3.6 ? [0.2, -0.6] : [0.6, 0.1] });
  // cards: stack -> Ana, -> Lucas; none for Rafael
  S.cards.forEach((c, i) => {
    if (i >= giveTo.length) { c.visible = false; return; }
    const [ta, who] = giveTo[i];
    const k = prog(t, ta, 0.45, ease.inOutCubic);
    const w = new THREE.Vector3(); who.h.J.wrR.getWorldPosition(w);
    c.visible = t > ta - 0.05 && t < 5.8; c.position.set(lerp(AX + 1.2, w.x, k), lerp(1.55, w.y - 0.1, k), 2.5); c.rotation.z = k * 0.3;
  });
  S.stack.position.x = AX + 1.3 - prog(t, 2.6, 0.3) * 0.5;
  S.neq.position.set(AX - 0.85, 4.25, 3); show(S.neq, t, 2.75, 5.9);
  S.lock.position.set(AX + 0.6, 2.35, 3); show(S.lock, t, 4.8, 5.9);
  // ---- B: repeated, intentional aggression toward João
  S.joao.update(t, { x: [[0, BX + 0.6], [8.0, BX + 0.6], [8.6, BX + 1.0], [15.8, BX + 1.0], [16.6, BX + 0.35]], facing: -0.35,
    pose: (tt) => ({ ...restPose(), armL: [-0.05, 0.9, 0], armR: [0.05, -0.9, 0], spine: tt > 8 && tt < 15.8 ? 0.06 : 0, head: tt > 8.5 && tt < 15.8 ? -0.12 : 0 }),
    smile: t < 7.5 ? 0.3 : t < 16.2 ? -0.35 : 0.3, browTilt: t > 7.8 && t < 16.4 ? 0.8 : 0, look: t > 8.5 && t < 16 ? [-0.3, -0.7] : [-0.5, 0], talk: (tt) => tt > 17.2 && tt < 18.2 });
  S.nina.update(t, { x: [[0, BX - 5.6], [6.0, BX - 5.6], [7.4, BX - 2.9], [16.6, BX - 2.9], [17.8, BX - 4.4]], facing: t > 16.8 ? -0.5 : 0.45,
    pose: mixPose(restPose(), point(1, 'R', 0.15), pulse(t, 7.8, 13.2, 0.3, 0.3)), smile: t < 13.6 ? 0.35 : -0.2, browTilt: t > 7 && t < 13.6 ? -0.5 : 0,
    mouth: t > 10.4 && t < 12.9 ? 0.25 + 0.2 * Math.abs(Math.sin(t * 8)) : null });
  if (t > 16.6) S.caio.update(t, { x: [[16.6, BX - 1.8], [17.8, BX - 3.4]], facing: -0.5, smile: -0.2, browTilt: 0.3 });
  S.dir.update(t, { x: [[0, BX + 8], [15.9, BX + 8], [17.4, BX + 2.85]], facing: -0.45, pose: mixPose(restPose(), explain(t, 0.6, 2), pulse(t, 17.3, 30, 0.3, 0.3)), smile: 0.4, brow: 0.2, talk: (tt) => tt > 17.6 });
  S.tally.forEach((g, i) => show(g, t, 9.25 + i * 0.22, 13.4));
  const bubAt = [[10.5, -2.1, 4.15], [11.6, -0.9, 4.65], [12.25, -2.5, 5.0]];
  S.bub.forEach((b, i) => { const [ta, x, y] = bubAt[i]; b.position.set(BX + x, y, 3); show(b, t, ta, 13.4); b.rotation.z = Math.sin(t * 6 + i) * 0.05; });
  // ---- C/D: screen cards (exclusion 13.4–14.45, phone 14.45–15.85)
  const cam = t < 5.9 ? camAt([[0, [AX - 1.6, 1.95, 1.85]], [2.4, [AX - 1.2, 2.0, 2.05]], [5.9, [AX - 0.9, 2.1, 2.15]]], t)
    : t < 15.85 ? camAt([[5.9, [AX - 0.9, 2.1, 2.15]], [7.0, [BX - 1.4, 2.1, 2.0]], [13.4, [BX - 1.2, 2.2, 2.15]]], t)
      : camAt([[15.85, [BX - 0.2, 2.15, 1.6]], [18.5, [BX + 0.5, 2.2, 1.62]]], t);
  S.ui.lock(cam);
  const dimK = 0.08 + 0.22 * pulse(t, 5.9, 15.85, 0.8, 0.6);
  S.dim.visible = true; setOpacity(S.dim, dimK);
  const ex = pulse(t, 13.35, 14.45, 0.2, 0.15);
  S.exG.visible = ex > 0.01; S.exG.position.x = (1 - ex) * (t < 14 ? 12 : -12);
  S.alone.position.x = 3.6 + Math.sin(t * 6) * 0.05;
  const ph = pulse(t, 14.45, 15.85, 0.2, 0.25);
  S.phG.visible = ph > 0.01; S.phG.position.y = (1 - ph) * (t < 15 ? -21 : 21);
  S.msgs.forEach((m, i) => show(m, t, 14.55 + i * 0.2, 99, 0.25));
  show(S.badgeN, t, 14.6, 99, 0.3); S.badgeN.scale.multiplyScalar(1 + 0.15 * Math.sin(t * 12));
  return cam;
}
