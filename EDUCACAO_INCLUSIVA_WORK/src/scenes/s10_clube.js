// CENA 10 — O SEU CLUBE É INCLUSIVO? (160.60–180.00, local 0–19.40)
// Back at the club (now with a ramp). Observe barriers, write proposals, present them to
// the director, an activity planned for everyone, final line-up with equal prominence.
import * as THREE from 'three';
import { P, shade } from '../core/palette.js';
import { clubhouseSide, backdrop, flag } from '../environments/outdoor.js';
import { Actor, ChairActor, camAt, path } from './kit.js';
import { restPose, mixPose, explain, wave, point } from '../animations/cycles.js';
import { pulse, prog, ease, clamp, lerp } from '../core/math.js';
import { show, questionMark, check, cross, magnifier, sparkle, grp } from '../objects/fx.js';
import { vpart, rrectPts, circlePts, strokePts, roundPoly, setOpacity } from '../core/vector.js';
import { documentSheet, pencil } from '../objects/accessibility.js';
import { table } from '../environments/indoor.js';

const GATE = 11.5, TBL = 17.0, POLE = 25.5, LX = 2.4;

function fence(x0, x1, gapX, gapW) {
  const g = new THREE.Group();
  for (let x = x0; x <= x1; x += 0.55) { if (Math.abs(x - gapX) < gapW / 2 + 0.1) continue; g.add(vpart({ pts: roundPoly([[x - 0.13, 0], [x + 0.13, 0], [x + 0.13, 1.3], [x, 1.45], [x - 0.13, 1.3]], 0.03), color: '#FFFFFF', shade: '#DDE3EC', mode: 2, p: [1, 0, x + 0.05, 0], z: 0 })); }
  for (const y of [0.4, 1.0]) { g.add(vpart({ pts: rrectPts(gapX - gapW / 2 - x0 + 0.2, 0.12, 0.04, (x0 + gapX - gapW / 2) / 2, y), color: '#EEF1F6', z: -0.01 })); g.add(vpart({ pts: rrectPts(x1 - gapX - gapW / 2 + 0.2, 0.12, 0.04, (x1 + gapX + gapW / 2) / 2, y), color: '#EEF1F6', z: -0.01 })); }
  return g;
}

export function build() {
  const scene = new THREE.Scene();
  const S = { scene };
  const bdG = new THREE.Group(); scene.add(bdG);
  S.bd = backdrop(bdG, { seed: 11, w: 120, trees: [[-10.5, 1.2, 'round'], [-7.4, 1.0, 'pine', -14], [9.6, 1.25, 'round'], [14.5, 0.9, 'pine'], [21, 1.2, 'round'], [30, 1.1, 'pine']] });
  bdG.position.x = 8;
  S.club = clubhouseSide({ x0: 0, w: 7.5 }); scene.add(S.club.g); S.club.entrance(1);
  S.q = questionMark(P.yellow, 1.1); S.q.position.set(3.8, 8.2, 2); scene.add(S.q);
  // inspection
  S.fence = fence(GATE - 2.6, GATE + 2.6, GATE, 0.6); S.fence.position.z = -1.2; scene.add(S.fence);
  S.okRamp = check(P.green, 0.7); S.okRamp.position.set(-3.2, 2.6, 3); scene.add(S.okRamp);
  S.noGate = cross(P.red, 0.6); S.noGate.position.set(GATE, 2.4, 3); scene.add(S.noGate);
  S.mag = magnifier(0.9); scene.add(S.mag);
  S.lucasI = new Actor(scene, 'lucas', { x: -6, z: 1.5, facing: 0.5, seed: 1 });
  S.clip = documentSheet({ w: 0.5, h: 0.65, lines: 3 }); scene.add(S.clip.root);
  // proposals + director
  S.tbl = table(2.4, 1.15); S.tbl.position.set(TBL, 0, 1.8); scene.add(S.tbl);
  S.prop = documentSheet({ w: 0.95, h: 1.2, lines: 6 }); scene.add(S.prop.root);
  S.pen = pencil(); scene.add(S.pen.root);
  S.anaP = new Actor(scene, 'ana', { x: TBL - 0.2, z: 1.0, facing: 0.2, seed: 2 });
  S.lucasP = new Actor(scene, 'lucas', { x: TBL - 1.9, z: 1.2, facing: 0.35, seed: 3 });
  S.claraP = new Actor(scene, 'clara', { x: TBL - 3.2, z: 1.3, facing: 0.35, seed: 4 });
  S.dirP = new Actor(scene, 'director', { x: TBL + 3.4, z: 0.6, facing: -0.4, seed: 8 });
  S.ideas = [0, 1, 2].map((i) => { const s = sparkle([P.yellow, P.turquoise, P.green][i], 0.35); scene.add(s); return s; });
  // flag raising together
  S.fl = flag(5.2); S.fl.g.position.set(POLE, 0, -0.5); scene.add(S.fl.g);
  S.cloth = S.fl.g.children[2];
  S.rope = vpart({ pts: strokePts([[0, 0], [0, 1]], 0.035), color: '#F4E3C1', outline: 0.008, z: 0.01 }); scene.add(S.rope);
  S.cleat = vpart({ pts: rrectPts(0.18, 0.1, 0.03, POLE + 0.1, 1.15), color: '#7E8AA0', outline: 0.016, z: 0.2 }); scene.add(S.cleat);
  S.pedroF = new ChairActor(scene, 'pedro', { kind: 'manual', x: POLE - 1.55, z: 1.6, dir: 1, seed: 13 });
  S.claraF = new Actor(scene, 'clara', { x: POLE + 1.1, z: 1.0, facing: -0.4, seed: 14 });
  S.rafaelF = new Actor(scene, 'rafael', { x: POLE + 2.6, z: 0.8, facing: -0.35, seed: 15 });
  S.theoF = new ChairActor(scene, 'theo', { kind: 'power', x: POLE + 4.3, z: 1.2, dir: -1, seed: 16, facing: -0.45 });
  S.anaF = new Actor(scene, 'ana', { x: POLE - 3.6, z: 0.6, facing: 0.4, seed: 17 });
  S.biaF = new Actor(scene, 'bia', { x: POLE - 5.0, z: 0.7, facing: 0.35, seed: 18 });
  S.liaF = new Actor(scene, 'lia', { x: POLE + 5.9, z: 0.5, facing: -0.35, seed: 19 });
  // final line-up (in front of the accessible clubhouse)
  S.L = {
    clara: new Actor(scene, 'clara', { x: LX - 4.4, z: 0.4, facing: 0.15, seed: 21 }),
    lucas: new Actor(scene, 'lucas', { x: LX - 2.6, z: 0.4, facing: 0.1, seed: 22 }),
    dir: new Actor(scene, 'director', { x: LX - 0.85, z: 0.3, facing: 0.0, seed: 23 }),
    ana: new Actor(scene, 'ana', { x: LX + 0.9, z: 0.4, facing: -0.05, seed: 24 }),
    rafael: new Actor(scene, 'rafael', { x: LX + 2.65, z: 0.4, facing: -0.1, seed: 25 }),
    joao: new Actor(scene, 'joao', { x: LX + 4.4, z: 0.4, facing: -0.15, seed: 26 }),
    pedro: new ChairActor(scene, 'pedro', { kind: 'manual', x: LX - 3.4, y: -1.25, z: 2.4, dir: 1, seed: 27, facing: 0.3 }),
    lia: new Actor(scene, 'lia', { x: LX - 1.2, y: -1.25, z: 2.3, facing: 0.05, seed: 28 }),
    theo: new ChairActor(scene, 'theo', { kind: 'power', x: LX + 1.75, y: -1.25, z: 2.5, dir: -1, seed: 29, facing: -0.3 }),
    bia: new Actor(scene, 'bia', { x: LX + 3.4, y: -1.25, z: 2.3, facing: -0.1, seed: 30 }),
  };
  S.front = vpart({ pts: rrectPts(30, 6, 0.01, LX, -3), color: P.grass, shade: P.grassDark, mode: 3, p: [-6, 0, 0, 0], outline: 0, z: -19 }); scene.add(S.front);
  S.conf = [...Array(14)].map((_, i) => { const s = sparkle([P.yellow, P.turquoise, P.green, '#FFFFFF', P.pink][i % 5], 0.22 + (i % 3) * 0.08); scene.add(s); return s; });
  return S;
}

const BEATS = { ins: [0, 5.0], prop: [5.0, 8.9], flag: [8.9, 14.85], line: [14.85, 99] };
function vis(objs, on) { for (const o of objs) { if (o.chair) { o.chair.root.visible = on; o.h.root.visible = on; } else if (o.root) o.root.visible = on; else o.visible = on; } }

export function update(S, t) {
  S.bd.drift(t + 160); S.fl.wave(t);
  const inB = (k) => t >= BEATS[k][0] - 0.05 && t < BEATS[k][1] + 0.05;
  // A: is your club inclusive?
  show(S.q, t, 1.4, 3.1); S.q.position.y = 8.2 + Math.sin(t * 3) * 0.1;
  // B: Lucas observes barriers
  const lx = [[0, -7.6], [3.0, -7.0], [3.6, -4.6], [4.4, GATE - 1.6]];
  S.lucasI.update(t, { x: lx, ground: (x) => (x > -6.6 && x < -0.2 ? S.club.ground(x) : 0), facing: 0.5, pose: { ...restPose(), armL: [0.4, 1.3, 0], handL: 'hold', armR: [1.1, 0.6, 0], handR: 'hold' }, smile: 0.7, look: [0.7, -0.1] });
  const lw = new THREE.Vector3(); S.lucasI.h.J.wrL.getWorldPosition(lw); S.clip.root.position.set(lw.x + 0.15, lw.y + 0.25, 2.6); S.clip.write(prog(t, 3.3, 1.6));
  const mw = new THREE.Vector3(); S.lucasI.h.J.wrR.getWorldPosition(mw); S.mag.position.set(mw.x + 0.35, mw.y + 0.35, 2.7);
  show(S.okRamp, t, 3.45, 5.3); show(S.noGate, t, 4.5, 5.3);
  // C: proposals written and presented to the director
  const w = prog(t, 5.0, 1.6, ease.linear);
  S.anaP.update(t, { x: [[0, TBL - 0.2], [6.7, TBL - 0.2], [7.6, TBL + 1.7]], facing: t < 6.7 ? 0.15 : 0.4, pose: t < 6.7 ? { ...restPose(), armR: [0.85, 1.25, 0], handR: 'hold', spine: 0.05, head: -0.1 } : mixPose(restPose(), { armR: [1.3, 0.2, 0], handR: 'hold' }, prog(t, 7.4, 0.4)), smile: 0.8, look: t < 6.7 ? [0, -0.7] : [0.8, 0.1], talk: (tt) => tt > 7.7 && tt < 8.7 });
  S.prop.write(w);
  if (t < 6.7) { S.prop.root.position.set(TBL + 0.35, 1.45, 2.0); S.prop.root.rotation.z = -0.1; S.anaP.h.reach('R', TBL + 0.05 + w * 0.6 + Math.sin(t * 22) * 0.03 * (w < 1 ? 1 : 0), 1.85 - Math.floor(w * 6) * 0.13, 1); }
  else { const aw = new THREE.Vector3(); S.anaP.h.J.wrR.getWorldPosition(aw); const k = prog(t, 7.9, 0.4); const dw = new THREE.Vector3(); S.dirP.h.J.wrL.getWorldPosition(dw); S.prop.root.position.set(lerp(aw.x + 0.25, dw.x - 0.2, k), lerp(aw.y + 0.1, dw.y + 0.35, k), 2.0); S.prop.root.rotation.z = 0.1; }
  const pw = new THREE.Vector3(); S.anaP.h.J.wrR.getWorldPosition(pw); S.pen.root.position.set(pw.x, pw.y - 0.08, 2.1); S.pen.root.rotation.z = 0.5; S.pen.root.visible = t < 6.7;
  S.lucasP.update(t, { x: [[0, TBL - 1.9], [6.6, TBL - 1.9], [7.6, TBL + 0.3]], facing: 0.35, smile: 0.8, look: [0.7, 0] });
  S.claraP.update(t, { x: [[0, TBL - 3.2], [6.6, TBL - 3.2], [7.7, TBL - 1.1]], facing: 0.35, smile: 0.8, look: [0.6, 0], pose: { ...restPose(), armL: [-0.15, -0.3, 0] } });
  S.dirP.update(t, { x: TBL + 3.4, facing: -0.4, pose: t < 8.1 ? restPose() : { ...restPose(), armL: [-0.55, -1.35, 0.2], handL: 'hold', armR: [0.4, 1.4, -0.2], handR: 'hold', head: Math.sin(t * 5) * 0.06 * pulse(t, 8.4, 9.2, 0.2, 0.2) }, smile: 0.85, talk: (tt) => tt > 8.5 && tt < 8.95, look: t < 8.3 ? [-0.8, 0] : [-0.2, -0.5] });
  S.ideas.forEach((s, i) => { s.position.set(TBL - 0.6 + i * 0.6, 4.0 + Math.sin(t * 3 + i) * 0.1, 3); s.rotation.z = t + i; show(s, t, 5.3 + i * 0.3, 7.0, 0.3); });
  // D: flag raised together — rope cleat at an accessible height
  const raise = prog(t, 9.2, 4.4, ease.inOutSine);
  const clothH = lerp(1.4, 5.0, raise);
  S.cloth.position.y = clothH;
  const rx = POLE + 0.1;
  S.rope.position.set(rx, 1.15, 0.3); S.rope.scale.y = clothH - 1.15;
  const pull = Math.sin(t * 5) * 0.12 * (raise > 0 && raise < 1 ? 1 : 0);
  S.pedroF.update(t, { x: POLE - 1.55, hands: (tt, h) => { h.reach(h.facing > 0 ? 'L' : 'R', rx - 0.05, 1.7 + pull, 1); h.reach(h.facing > 0 ? 'R' : 'L', rx - 0.08, 1.35 - pull, 1); h.setHand('L', 'hold'); h.setHand('R', 'hold'); }, smile: 0.9, look: [0.5, 0.6] });
  S.claraF.update(t, { x: POLE + 1.1, facing: -0.4, after: (tt, h) => { h.reach(h.facing > 0 ? 'L' : 'R', rx + 0.04, 2.15 - pull, -1); h.setHand(h.facing > 0 ? 'L' : 'R', 'hold'); }, smile: 0.85, look: [-0.2, 0.2] });
  S.rafaelF.update(t, { x: POLE + 2.6, facing: -0.35, pose: mixPose(restPose(), { armR: [2.6, 0.3, 0] }, pulse(t, 13.6, 30, 0.3, 0.3)), smile: 0.85, look: [-0.5, 0.6] });
  S.theoF.update(t, { x: POLE + 4.3, hands: (tt, h, chair) => { const pk = pulse(tt, 9.0, 9.8, 0.2, 0.3) + pulse(tt, 13.5, 14.3, 0.2, 0.3); const c = chair.tablet.cells[3]; const v = new THREE.Vector3(); c.getWorldPosition(v); h.reach(h.facing > 0 ? 'L' : 'R', v.x, v.y + 0.04 + (1 - pk) * 0.3, 1); h.setHand(h.facing > 0 ? 'L' : 'R', 'point'); chair.tablet.press(3, pk); }, smile: 0.85, look: [-0.5, 0.4] });
  S.anaF.update(t, { x: POLE - 3.6, facing: 0.4, pose: mixPose(restPose(), { armL: [-2.7, -0.2, 0], handL: 'open' }, pulse(t, 9.0, 10.0, 0.25, 0.3) + pulse(t, 13.5, 30, 0.3, 0.3)), smile: 0.85, look: [0.6, 0.4] });
  S.biaF.update(t, { x: POLE - 5.0, facing: 0.35, pose: mixPose(restPose(), { armR: [2.6, 0.3, 0], armL: [-2.6, -0.3, 0] }, pulse(t, 13.6, 30, 0.3, 0.3)), smile: 0.9, mouth: t > 13.7 ? 0.35 : null });
  S.liaF.update(t, { x: POLE + 5.9, facing: -0.35, pose: mixPose(restPose(), { armL: [-2.6, -0.3, 0] }, pulse(t, 13.6, 30, 0.3, 0.3)), smile: 0.9 });
  // E: final line-up, everyone with equal prominence
  const L = S.L; const cheer = pulse(t, 15.4, 40, 0.4, 0.4);
  const hi = (s) => (s === 'R' ? { armR: [2.6, 0.4, 0] } : { armL: [-2.6, -0.4, 0] });
  const wv = (s, seed) => mixPose(restPose(), wave(t + seed, s, 0.8), cheer);
  L.clara.update(t, { x: LX - 4.4, pose: wv('R', 1), smile: 0.9 }); L.lucas.update(t, { x: LX - 2.6, pose: wv('L', 2), smile: 0.95, mouth: cheer > 0.5 ? 0.35 : null });
  L.dir.update(t, { x: LX - 0.85, pose: mixPose(restPose(), { ...hi('L'), ...hi('R') }, cheer * 0.8), smile: 0.9 }); L.ana.update(t, { x: LX + 0.9, pose: wv('R', 3), smile: 0.95, mouth: cheer > 0.5 ? 0.3 : null });
  L.rafael.update(t, { x: LX + 2.65, pose: wv('R', 4), smile: 0.9 }); L.joao.update(t, { x: LX + 4.4, pose: wv('L', 5), smile: 0.9 });
  L.pedro.update(t, { x: LX - 3.4, hands: 'rest', pose: mixPose({ armL: [0.5, 0.9, 0], armR: [0.5, 0.9, 0] }, { armL: [-2.5, -0.4 - Math.sin(t * 9) * 0.3, 0] }, cheer), smile: 0.95, mouth: cheer > 0.5 ? 0.35 : null });
  L.lia.update(t, { x: LX - 1.2, y: -1.25, pose: wv('L', 6), smile: 0.9 });
  L.theo.update(t, { x: LX + 1.75, hands: (tt, h, chair) => chair.tablet.press(5, pulse(tt, 15.2, 16.0, 0.2, 0.3)), pose: mixPose({ armL: [-0.3, -0.9, 0], armR: [-0.3, -0.9, 0] }, { armR: [2.4, 0.5, 0] }, cheer), smile: 0.9 });
  L.bia.update(t, { x: LX + 3.4, y: -1.25, pose: wv('R', 7), smile: 0.95, mouth: cheer > 0.5 ? 0.3 : null });
  S.conf.forEach((s, i) => { const ph = (t * 0.25 + i / 14) % 1; s.position.set(LX - 5 + (i * 0.77) % 10, 7.5 - ph * 7 + Math.sin(t * 2 + i) * 0.2, 4); s.rotation.z = t * 2 + i; s.visible = t > 15.0; });
  vis([S.lucasI, S.clip.root, S.mag], inB('ins'));
  vis([S.anaP, S.lucasP, S.claraP, S.dirP, S.prop.root], inB('prop'));
  vis([S.pedroF, S.claraF, S.rafaelF, S.theoF, S.anaF, S.biaF, S.liaF], inB('flag'));
  vis(Object.values(S.L), inB('line'));
  vis(S.conf, t > 15.0);
  // camera
  if (t < 3.0) return camAt([[0, [3.6, 7.2, 0.95]], [3.0, [0.4, 3.4, 1.15]]], t);
  if (t < 5.0) return camAt([[3.0, [-2.6, 2.1, 1.8]], [3.6, [-2.6, 2.1, 1.8]], [4.45, [GATE - 0.6, 2.1, 1.85]], [5.0, [GATE - 0.4, 2.1, 1.85]]], t);
  if (t < 8.9) return camAt([[5.0, [TBL + 0.2, 2.1, 1.95]], [6.6, [TBL + 0.4, 2.2, 1.8]], [8.9, [TBL + 0.8, 2.25, 1.7]]], t);
  if (t < 14.85) return camAt([[8.9, [POLE + 0.4, 3.1, 1.3]], [14.85, [POLE + 0.4, 3.3, 1.22]]], t);
  return camAt([[14.85, [LX, 2.3, 1.3]], [17.0, [LX, 2.55, 1.12]], [19.4, [LX, 2.7, 1.05]]], t);
}
