// CENA 9 — LEI BRASILEIRA DE INCLUSÃO (144.54–160.60, local 0–16.07)  Lei nº 13.146/2015
// Map of Brazil + rights icons on the words; then a school where barriers are removed:
// ramp, captioned video, communication resources (AAC), adapted instructions, participation.
import * as THREE from 'three';
import { P, shade } from '../core/palette.js';
import { room, table } from '../environments/indoor.js';
import { Actor, ChairActor, camAt } from './kit.js';
import { restPose, mixPose, explain } from '../animations/cycles.js';
import { pulse, prog, ease, clamp, lerp } from '../core/math.js';
import { show, scales, ramp as rampIcon, book, people, equals, brick, sparkle, grp } from '../objects/fx.js';
import { vpart, rrectPts, circlePts, strokePts, roundPoly, setOpacity } from '../core/vector.js';
import { documentSheet } from '../objects/accessibility.js';
import { screenLayer, board } from './ui.js';

const BR = [[-73.9, -7.3], [-72.4, -10.0], [-69.5, -11.0], [-65.4, -9.8], [-65.3, -11.5], [-62.0, -13.7], [-60.0, -13.6], [-60.3, -16.3], [-58.3, -16.3], [-57.6, -18.0], [-58.1, -20.2], [-55.8, -22.3], [-54.6, -25.6], [-53.7, -26.9], [-55.7, -28.0], [-57.6, -30.2], [-56.0, -30.9], [-53.4, -33.7], [-52.1, -32.2], [-50.7, -30.4], [-48.6, -28.5], [-48.4, -25.9], [-46.4, -24.0], [-44.0, -23.0], [-41.0, -22.0], [-39.7, -19.5], [-39.0, -16.0], [-38.9, -13.0], [-37.0, -11.0], [-35.1, -9.0], [-34.8, -7.1], [-35.5, -5.2], [-37.2, -4.7], [-39.0, -3.0], [-41.8, -2.8], [-44.4, -2.4], [-46.0, -1.0], [-48.5, -0.9], [-50.0, 0.2], [-50.9, 2.0], [-51.6, 4.2], [-52.9, 2.2], [-54.5, 2.3], [-56.0, 1.9], [-58.0, 1.6], [-59.8, 1.6], [-60.1, 4.5], [-62.0, 4.1], [-63.0, 3.8], [-64.0, 4.0], [-64.8, 2.4], [-66.8, 1.2], [-69.4, 1.5], [-70.0, 0.6], [-69.5, -1.0], [-69.9, -4.2], [-70.6, -3.8], [-72.9, -5.3]];
const SX = 40;  // school set

function screenTV() {
  const g = new THREE.Group();
  g.add(vpart({ pts: rrectPts(3.0, 1.9, 0.1), color: '#2B2238', z: 0 }));
  g.add(vpart({ pts: rrectPts(2.75, 1.65, 0.06), color: '#4FB6E8', shade: '#2A8FC0', mode: 3, p: [-0.8, 0.8, 0, 0], outline: 0, z: 0.01 }));
  g.add(vpart({ pts: circlePts(0.22, 20, -0.6, 0.25), color: P.yellow, outline: 0.02, z: 0.02 }));
  g.add(vpart({ pts: roundPoly([[-0.2, 0.0], [0.6, 0.0], [0.2, 0.55]], 0.03), color: P.green, outline: 0.02, z: 0.02 }));
  const caps = [0, 1].map((i) => { const c = vpart({ pts: rrectPts(i ? 1.6 : 2.2, 0.14, 0.05, 0, -0.42 - i * 0.22), color: '#FFFFFF', outline: 0.012, z: 0.03 }); g.add(c); return c; });
  g.add(vpart({ pts: rrectPts(2.75, 0.55, 0.0, 0, -0.52), color: '#190C3C', outline: 0, z: 0.025, opacity: 0.55 }));
  return { g, caps };
}

export function build() {
  const scene = new THREE.Scene();
  const S = { scene };
  // school (world)
  const sc = new THREE.Group(); sc.position.x = SX; scene.add(sc);
  room(sc, { x0: -12, x1: 12, wall: '#F3E9D2', floor: '#B88E66', windows: [8.0], boards: [] });
  sc.add(vpart({ pts: rrectPts(4.4, 2.3, 0.1, -2.2, 4.8), color: '#2E5A46', z: -28 }));
  sc.add(vpart({ pts: rrectPts(4.6, 0.15, 0.05, -2.2, 3.6), color: '#8C6440', z: -27.9 }));
  sc.add(vpart({ pts: rrectPts(2.0, 3.2, 0.1, -9.0, 1.6), color: '#FFD98A', z: -28 }));
  S.tv = screenTV(); S.tv.g.position.set(SX + 2.0, 4.9, -20); scene.add(S.tv.g);
  S.threshold = vpart({ pts: [[SX - 9.9, 0], [SX - 8.1, 0], [SX - 8.1, 0.06]], color: P.concrete, outline: 0.02, z: -1 }); scene.add(S.threshold);
  S.desk1 = table(2.2, 1.15); S.desk1.position.set(SX - 1.1, 0, 1.6); scene.add(S.desk1);
  S.desk2 = table(2.2, 1.15); S.desk2.position.set(SX + 1.5, 0, 1.6); scene.add(S.desk2);
  S.teacher = new Actor(scene, 'teacher', { x: SX - 4.3, z: 0.2, facing: 0.35, seed: 60 });
  S.pedro = new ChairActor(scene, 'pedro', { kind: 'manual', x: SX - 11, z: 1.0, dir: 1, seed: 61 });
  S.rafael = new Actor(scene, 'rafael', { x: SX + 1.0, z: 0.6, facing: 0.3, seed: 62 });
  S.bia = new Actor(scene, 'bia', { x: SX - 0.9, z: 0.7, facing: 0.2, seed: 63 });
  S.theo = new ChairActor(scene, 'theo', { kind: 'power', x: SX + 3.15, z: 0.9, dir: -1, seed: 64, facing: -0.4 });
  S.card = documentSheet({ w: 0.55, h: 0.7, lines: 3 }); scene.add(S.card.root);
  S.wall = new THREE.Group(); S.wall.position.set(SX - 0.5, 0, 3.4); scene.add(S.wall);
  S.bricks = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) { const b = brick(0.95, 0.5, r % 2 ? '#C8553D' : '#B84A35'); b.userData.home = [-4.2 + c * 1.0 + (r % 2) * 0.5, 0.25 + r * 0.52]; S.wall.add(b); S.bricks.push(b); }
  S.hands = [];
  // board (screen space): Brazil + icons
  S.ui = screenLayer(scene, 20);
  S.B = new THREE.Group(); S.ui.g.add(S.B);
  S.B.add(board(P.navy, P.green, 41));
  const k = 0.165;
  const pts = BR.map(([lo, la]) => [(lo + 53.5) * k, (la + 14.5) * k]);
  S.map = new THREE.Group(); S.map.position.set(0, 1.25, 0); S.B.add(S.map);
  S.map.add(vpart({ pts, color: P.green, shade: '#4FA63A', mode: 1, p: [-0.8, 0.8, 3.6, 0], outline: 0.06, oc: P.yellow, z: 0 }));
  S.map.add(vpart({ pts: circlePts(0.85, 40, 0.5, 0.2), color: P.yellow, outline: 0.04, z: 0.01, opacity: 0.0 }));
  S.pin = grp(vpart({ pts: roundPoly([[-0.3, 0.3], [0.3, 0.3], [0, -0.45]], 0.1), color: P.red, outline: 0.04 }), vpart({ pts: circlePts(0.32, 24, 0, 0.32), color: P.red, outline: 0.04 }), vpart({ pts: circlePts(0.13, 16, 0, 0.32), color: '#FFFFFF', outline: 0, z: 0.01 }));
  S.pin.position.set(0.75, 0.2, 0.1); S.map.add(S.pin);
  S.icons = [scales(P.gold, 0.9), rampIcon(1.0), book(P.royal, 1.0), people(0.85), equals(P.turquoise, 1.1)];
  const pos = [[-3.7, 4.0], [3.7, 4.0], [-3.9, -1.7], [3.9, -1.7], [0, -2.9]];
  S.icons.forEach((g, i) => { const bg = vpart({ pts: circlePts(1.15, 40), color: '#FFFFFF', outline: 0.05, z: -0.05 }); g.add(bg); g.position.set(pos[i][0], pos[i][1], 0.2); S.B.add(g); });
  return S;
}

export function update(S, t) {
  // ---- board 0–9.1
  const pin = prog(t, 0.5, 0.5, ease.outBack); S.pin.scale.setScalar(Math.max(0.01, pin)); S.pin.position.y = 0.2 + (1 - pin) * 2;
  S.map.scale.setScalar(Math.max(0.01, prog(t, 0.0, 0.6, ease.outBack)));
  [3.45, 4.45, 5.45, 6.55, 7.65].forEach((ta, i) => { show(S.icons[i], t, ta); S.icons[i].rotation.z = Math.sin(t * 2 + i) * 0.04; });
  const out = prog(t, 9.0, 0.5, ease.inCubic);
  // ---- school 9.1–16.07: barriers crumble, everyone participates
  const pd = t < 9.3 ? 0 : (prog(t, 9.3, 3.0, ease.inOutSine)) * 7.6;
  S.pedro.update(t, { x: SX - 10.5 + pd, smile: 0.85, look: [0.7, 0.1], pose: t > 13.2 ? mixPose({}, { armL: [-2.7, -0.2, 0], handL: 'open' }, pulse(t, 13.4, 30, 0.3, 0.3)) : undefined, hands: t > 13.2 ? 'rest' : undefined });
  S.teacher.update(t, { x: SX - 4.3, facing: 0.35, pose: mixPose(restPose(), explain(t, 1, 2), 0.8), talk: (tt) => tt > 9.4 && tt < 12.5, smile: 0.8, look: [0.7, 0] });
  const hand = (side) => (side === 'R' ? { armR: [2.7, 0.2, 0] } : { armL: [-2.7, -0.2, 0] });
  S.rafael.update(t, { x: SX + 1.0, facing: 0.35, pose: mixPose(restPose(), hand('R'), pulse(t, 13.5, 30, 0.3, 0.3)), smile: 0.8, look: [0.4, 0.6] });
  S.bia.update(t, { x: SX - 0.9, facing: 0.2, pose: mixPose({ ...restPose(), armL: [-0.25, -1.4, 0.1], armR: [0.25, 1.4, -0.1] }, { ...restPose(), ...hand('L') }, pulse(t, 13.7, 30, 0.3, 0.3)), smile: 0.85, look: t < 13.5 ? [0, -0.8] : [0.2, 0.3] });
  const wl = new THREE.Vector3(), wr = new THREE.Vector3(); S.bia.h.J.wrL.getWorldPosition(wl); S.bia.h.J.wrR.getWorldPosition(wr);
  S.card.root.position.set((wl.x + wr.x) / 2, (wl.y + wr.y) / 2 + 0.25, 1.9); S.card.root.visible = t < 13.7; S.card.write(1);
  S.theo.update(t, { x: SX + 3.15, hands: (tt, h, chair) => { const pk = pulse(tt, 13.9, 15.3, 0.25, 0.3); const c = chair.tablet.cells[0]; const v = new THREE.Vector3(); c.getWorldPosition(v); h.reach(h.facing > 0 ? 'L' : 'R', v.x, v.y + 0.04 + (1 - pk) * 0.3, 1); h.setHand(h.facing > 0 ? 'L' : 'R', 'point'); chair.tablet.press(0, pk); }, smile: 0.8, look: [-0.5, -0.2] });
  S.tv.caps.forEach((c, i) => { c.scale.x = 0.6 + 0.4 * Math.abs(Math.sin(t * 1.3 + i)); });
  S.bricks.forEach((b, i) => {
    const [hx, hy] = b.userData.home;
    const k = prog(t, 11.55 + (i % 9) * 0.03 + Math.floor(i / 9) * 0.02, 0.9, ease.inCubic);
    b.position.set(hx + (hx > 0 ? 1 : -1) * k * 2.5, hy - k * 6 + Math.sin(k * Math.PI) * 1.2, 0);
    b.rotation.z = k * (i % 2 ? 1.5 : -1.5); b.visible = k < 0.98 && t > 9.0; setOpacity(b, 1 - k);
  });
  const cam = t < 9.1 ? { x: 0, y: 2.0, zoom: 1.5 } : camAt([[9.1, [SX - 1.6, 2.4, 1.45]], [12.6, [SX - 0.5, 2.45, 1.32]], [16.1, [SX - 0.45, 2.45, 1.3]]], t);
  if (t < 9.1) { S.ui.lock(cam); S.B.visible = true; S.B.position.y = 0; }
  else { S.ui.lock(cam); S.B.visible = out < 1; S.B.position.y = out * 21; }
  if (t > 8.9 && t < 9.6) { S.ui.lock({ x: SX - 1.6, y: 2.4, zoom: 1.45 }); }
  return t < 9.1 ? cam : cam;
}
