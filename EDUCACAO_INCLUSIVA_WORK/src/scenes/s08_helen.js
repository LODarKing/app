// CENA 8 — HELEN KELLER (129.87–144.54, local 0–14.67)
// 1880s family home; Anne Sullivan spells W-A-T-E-R into Helen's hand at the pump
// (tactile manual alphabet, as Keller describes in "The Story of My Life", 1903);
// adult Helen writes; graduates from Radcliffe College (1904); speaks for rights.
import * as THREE from 'three';
import { P, shade } from '../core/palette.js';
import { sky, ground, tree, hills, cloud } from '../environments/outdoor.js';
import { room } from '../environments/indoor.js';
import { Actor, camAt, path } from './kit.js';
import { restPose, mixPose, explain, faceLife, sit, idle } from '../animations/cycles.js';
import { pulse, prog, ease, clamp, lerp, rng } from '../core/math.js';
import { show, sparkle, grp, book, gradCap, scales } from '../objects/fx.js';
import { vpart, rrectPts, circlePts, strokePts, roundPoly, blobPts, ellipsePts, curvePts, setOpacity } from '../core/vector.js';

const CX = 30, DX = 52, EX = 74;

function farmhouse() {
  const g = new THREE.Group();
  g.add(vpart({ pts: rrectPts(8, 4.6, 0.05, 0, 2.6), color: '#F4F1EA', shade: '#DDD6C8', mode: 2, p: [1, 0, 2.5, 0], z: 0 }));
  for (let i = 1; i < 9; i++) g.add(vpart({ pts: rrectPts(7.9, 0.03, 0, 0, 0.3 + i * 0.52), color: '#DDD6C8', outline: 0, z: 0.001 }));
  g.add(vpart({ pts: roundPoly([[-4.6, 4.85], [4.6, 4.85], [3.2, 7.0], [-3.2, 7.0]], 0.1), color: '#5E6E7E', shade: '#4A5866', mode: 2, p: [0, -1, -5.6, 0], z: 0.01 }));
  for (const x of [-2.6, 2.6]) { g.add(vpart({ pts: rrectPts(1.2, 1.5, 0.06, x, 3.0), color: '#BFE8F7', z: 0.02 })); g.add(vpart({ pts: rrectPts(0.3, 1.5, 0.04, x - 0.82, 3.0), color: '#3E6B4E', z: 0.021 })); g.add(vpart({ pts: rrectPts(0.3, 1.5, 0.04, x + 0.82, 3.0), color: '#3E6B4E', z: 0.021 })); }
  g.add(vpart({ pts: rrectPts(1.3, 2.4, 0.06, 0, 1.5), color: '#7A4A2A', z: 0.02 }));
  g.add(vpart({ pts: rrectPts(8.6, 0.35, 0.04, 0, 0.18), color: '#C9B79A', z: 0.03 }));
  for (const x of [-3.9, -1.3, 1.3, 3.9]) g.add(vpart({ pts: rrectPts(0.18, 3.6, 0.04, x, 2.1), color: '#FFFFFF', z: 0.04 }));
  g.add(vpart({ pts: rrectPts(8.8, 0.3, 0.04, 0, 3.95), color: '#FFFFFF', z: 0.041 }));
  // honeysuckle vines (the Keller home, Ivy Green, was covered in vines)
  const r = rng(5);
  for (let i = 0; i < 26; i++) g.add(vpart({ pts: circlePts(0.16 + r() * 0.12, 12, -4.2 + r() * 1.6, 0.6 + r() * 3.4), color: i % 4 ? P.treeDark : '#F7E08A', outline: 0, z: 0.05 }));
  return g;
}
function pump() {
  const g = new THREE.Group();
  g.add(vpart({ pts: rrectPts(1.4, 0.3, 0.05, 0, 0.15), color: '#9AA0A8', z: -0.02 }));
  g.add(vpart({ pts: rrectPts(0.36, 2.0, 0.1, 0, 1.2), color: '#2E4A3E', shade: '#22382F', mode: 2, p: [1, 0, 0.05, 0], z: 0 }));
  g.add(vpart({ pts: strokePts([[0.15, 1.7], [0.7, 1.62], [0.78, 1.45]], 0.14), color: '#2E4A3E', z: 0.01 }));
  g.add(vpart({ pts: circlePts(0.22, 20, 0, 2.25), color: '#2E4A3E', z: 0.01 }));
  const handle = vpart({ pts: strokePts([[0, 0], [-1.2, 0.0]], 0.09), color: '#22382F', outline: 0.02, z: 0.02 }); handle.position.set(0, 2.25, 0); g.add(handle);
  const stream = []; for (let i = 0; i < 8; i++) { const d = vpart({ pts: ellipsePts(0.06, 0.12, 12), color: '#7FD3F2', outline: 0.012, z: 0.03 }); g.add(d); stream.push(d); }
  return { g, handle, stream, spout: [0.78, 1.4] };
}
function typewriter() {
  const g = new THREE.Group();
  g.add(vpart({ pts: roundPoly([[-0.9, 0], [0.9, 0], [0.75, 0.55], [-0.75, 0.55]], 0.08), color: '#3A3F4A', shade: '#2A2E36', mode: 2, p: [0, -1, -0.2, 0], z: 0 }));
  for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) g.add(vpart({ pts: circlePts(0.055, 10, -0.6 + i * 0.2 + r * 0.05, 0.12 + r * 0.13), color: '#E8E8E8', outline: 0.01, z: 0.01 }));
  g.add(vpart({ pts: rrectPts(1.5, 0.16, 0.08, 0, 0.66), color: '#2A2E36', z: 0.005 }));
  const paper = vpart({ pts: rrectPts(0.9, 1.0, 0.02, 0, 1.1), color: '#FFFFFF', shade: '#EEF2F8', mode: 2, p: [1, -1, 0.3, 0], z: -0.01 }); g.add(paper);
  const lines = []; for (let i = 0; i < 6; i++) { const l = vpart({ pts: rrectPts(0.65, 0.03, 0.01, 0, 1.45 - i * 0.12), color: '#8C96A8', outline: 0, z: -0.005 }); g.add(l); lines.push(l); }
  return { g, paper, lines };
}
function lectern() {
  const g = new THREE.Group();
  g.add(vpart({ pts: roundPoly([[-0.7, 0], [0.7, 0], [0.55, 1.5], [-0.55, 1.5]], 0.06), color: '#8C5A34', shade: '#6E4426', mode: 2, p: [1, 0, 0.2, 0], z: 0 }));
  g.add(vpart({ pts: roundPoly([[-0.85, 1.45], [0.85, 1.45], [0.75, 1.75], [-0.75, 1.75]], 0.04), color: '#A06A3E', z: 0.01 }));
  g.add(vpart({ pts: rrectPts(0.8, 0.5, 0.06, 0, 0.8), color: P.royal, outline: 0.02, z: 0.012 }));
  return g;
}

export function build() {
  const scene = new THREE.Scene();
  const S = { scene };
  // A/B: home & pump (outdoor, 1880s)
  scene.add(sky('#8ECFEA', '#E8F6FB', 200, 40, 8, -40));
  for (let i = 0; i < 4; i++) { const c = cloud(50 + i, 1.0); c.position.set(-10 + i * 7, 9 + (i % 2), -38); scene.add(c); }
  scene.add(hills('#A8D88E', 1.0, 1.4, 4, 60, -30));
  scene.add(ground('#7CC35A', 0, 60, 20, -20));
  const fh = farmhouse(); fh.position.set(-5.5, 0, -10); scene.add(fh);
  const tr = tree(9, 1.3, -9); tr.position.set(5.2, 0, 0); scene.add(tr);
  for (let i = 0; i < 9; i++) { const f = vpart({ pts: circlePts(0.12, 12), color: [P.pink, P.yellow, '#FFFFFF'][i % 3], outline: 0.02, z: -1 }); f.position.set(-3.6 + i * 0.45, 0.35 + (i % 2) * 0.12, -1); scene.add(f); }
  S.pump = pump(); S.pump.g.position.set(0, 0, -0.5); S.pump.g.scale.x = -1; scene.add(S.pump.g);   // spout left, handle right
  S.helen = new Actor(scene, 'helenChild', { x: -2.2, z: 1.0, facing: 0.4, seed: 50 });
  S.anne = new Actor(scene, 'anne', { x: -0.4, z: 0.4, facing: 0.35, seed: 51 });
  S.letters = [...Array(5)].map((_, i) => { const s = sparkle(P.yellow, 0.18); scene.add(s); return s; });
  // C: study (indoor) — writer
  const st = new THREE.Group(); st.position.x = CX; scene.add(st);
  room(st, { x0: -10, x1: 10, wall: '#EFE3D0', floor: '#9C6E48', windows: [-4], boards: [] });
  for (let i = 0; i < 5; i++) st.add(vpart({ pts: rrectPts(0.3, 0.9 + (i % 2) * 0.2, 0.04, 3.2 + i * 0.34, 4.55), color: [P.royal, P.red, P.green, P.navy, P.orange][i], z: -28 }));
  st.add(vpart({ pts: rrectPts(2.2, 0.1, 0.03, 3.9, 4.05), color: '#7A4A2A', z: -27.9 }));
  S.desk = vpart({ pts: rrectPts(3.0, 0.14, 0.05, CX + 0.9, 1.25), color: '#7A4A2A', z: 1.6 }); scene.add(S.desk);
  for (const s of [-1, 1]) scene.add(vpart({ pts: rrectPts(0.12, 1.2, 0.03, CX + 0.9 + s * 1.3, 0.6), color: '#5E3A22', z: 1.55 }));
  S.tw = typewriter(); S.tw.g.position.set(CX + 0.75, 1.33, 1.7); scene.add(S.tw.g);
  S.stack = vpart({ pts: rrectPts(0.7, 0.2, 0.02, CX + 2.0, 1.43), color: '#FFFFFF', z: 1.7 }); scene.add(S.stack);
  S.helenW = new Actor(scene, 'helenAdult', { x: CX - 0.45, z: 0.6, facing: 0.35, seed: 52 });
  S.chair = grp(vpart({ pts: rrectPts(0.9, 0.12, 0.04, 0, 0.92), color: '#5E3A22', z: 0 }), vpart({ pts: rrectPts(0.12, 1.9, 0.04, -0.42, 1.0), color: '#5E3A22', z: -0.01 }), vpart({ pts: rrectPts(0.1, 0.9, 0.03, 0.35, 0.45), color: '#5E3A22', z: -0.01 }));
  S.chair.position.set(CX - 1.0, 0, 0.3); scene.add(S.chair);
  // D: graduation (Radcliffe College, 1904)
  const gr = new THREE.Group(); gr.position.x = DX; scene.add(gr);
  gr.add(vpart({ pts: rrectPts(30, 14, 0.01, 0, 7), color: '#B5523B', shade: '#94402D', mode: 3, p: [0, 10, 0, 0], outline: 0, z: -30 }));
  for (let r = 0; r < 18; r++) gr.add(vpart({ pts: rrectPts(30, 0.03, 0, 0, 0.4 + r * 0.55), color: '#94402D', outline: 0, z: -29.9 }));
  for (const x of [-3.2, 3.2]) gr.add(vpart({ pts: roundPoly([[x - 1.0, 2.0], [x + 1.0, 2.0], [x + 1.0, 5.4], [x, 6.3], [x - 1.0, 5.4]], 0.1), color: '#F4F1EA', z: -29 }));
  gr.add(vpart({ pts: rrectPts(30, 12, 0.01, 0, -6), color: '#8C6E52', shade: '#6E543E', mode: 3, p: [-8, 0, 0, 0], outline: 0, z: -29.5 }));
  gr.add(vpart({ pts: rrectPts(4.4, 0.8, 0.12, 0, 6.7), color: P.navy, z: -28.5 }));
  S.helenG = new Actor(scene, 'helenGrad', { x: DX - 0.6, z: 0.8, facing: 0.25, seed: 53 });
  S.anneG = new Actor(scene, 'anne', { x: DX + 1.5, z: 0.4, facing: -0.3, seed: 54 });
  S.diploma = grp(vpart({ pts: rrectPts(0.9, 0.24, 0.12), color: '#FFFDF4', z: 0 }), vpart({ pts: rrectPts(0.12, 0.28, 0.03), color: P.red, outline: 0, z: 0.01 })); scene.add(S.diploma);
  S.caps = [0, 1, 2].map((i) => { const c = gradCap(0.5); scene.add(c); return c; });
  // E: speaking for rights
  const sp = new THREE.Group(); sp.position.x = EX; scene.add(sp);
  room(sp, { x0: -12, x1: 12, wall: '#E3D9F0', floor: '#7A5A44', windows: [], boards: [] });
  sp.add(vpart({ pts: rrectPts(5.0, 2.4, 0.12, -0.5, 5.0), color: P.royal, z: -28 }));
  const sc = scales(P.gold, 1.1); sc.position.set(-0.5, 5.0, -27.9); sp.add(sc);
  S.lect = lectern(); S.lect.position.set(EX + 0.3, 0, 1.6); scene.add(S.lect);
  S.helenS = new Actor(scene, 'helenAdult', { x: EX - 0.2, z: 0.6, facing: 0.15, seed: 55 });
  S.anneS = new Actor(scene, 'anne', { x: EX - 1.9, z: 0.4, facing: 0.4, seed: 56 });
  S.crowd = []; const r = rng(8);
  for (let i = 0; i < 9; i++) { const g = grp(vpart({ pts: circlePts(0.42, 24, 0, 0), color: ['#4A3A30', '#2A1C16', '#7A5230', '#3A2418'][i % 4], outline: 0.03 }), vpart({ pts: rrectPts(1.1, 1.0, 0.4, 0, -0.75), color: ['#3E3550', '#5E6E7E', '#6E4E3A', '#2E4A3E'][i % 4], outline: 0.03, z: -0.01 })); g.position.set(EX - 4.5 + i * 1.12, -1.5 - (i % 2) * 0.25 + r() * 0.1, 3.0 + (i % 2) * 0.1); scene.add(g); S.crowd.push(g); }
  return S;
}

export function update(S, t) {
  // ---- A: Helen as a little girl explores the garden by touch
  const inA = t < 5.45;
  S.helen.update(t, { x: [[0, -3.4], [2.2, -2.2], [3.4, -1.05]], facing: 0.4, pose: t < 3.4 ? mixPose(restPose(), { armR: [1.0, 0.4, 0], armL: [-0.3, 0.6, 0] }, pulse(t, 0.4, 3.0, 0.4, 0.5)) : { ...restPose(), armL: [0.7, 0.5, 0], armR: [1.2, 0.5, 0] }, smile: t < 4 ? 0.4 : 0.6 + 0.3 * pulse(t, 4.6, 6, 0.3, 0.3), look: [0.1, -0.25], brow: t > 4.7 ? 0.7 : 0 });
  S.anne.update(t, { x: [[0, 4.6], [2.6, 4.6], [3.8, 0.85]], facing: -0.35, pose: t < 3.8 ? restPose() : { ...restPose(), armL: [-1.1, -0.6, 0], handL: 'point', armR: [1.3, -1.2, 0], handR: 'hold' }, smile: 0.7, look: [-0.7, -0.4] });
  // tactile spelling: Anne's fingers on Helen's palm, water on her other hand
  if (t > 3.8) {
    const hw = new THREE.Vector3(); S.helen.h.J.wrR.getWorldPosition(hw);
    S.anne.h.reach('L', hw.x + 0.06 + Math.sin(t * 9) * 0.03, hw.y + 0.07 + Math.cos(t * 7) * 0.02, 1); S.anne.h.setHand('L', 'point');
    const he = S.pump.handle.localToWorld(new THREE.Vector3(-1.1, 0, 0));
    S.anne.h.reach('R', he.x, he.y, -1); S.anne.h.setHand('R', 'hold');
    const sp = S.pump.g.localToWorld(new THREE.Vector3(0.78, 1.15, 0));
    S.helen.h.reach('L', sp.x + 0.05, sp.y - 0.15, 1);
  }
  S.pump.handle.rotation.z = t > 3.8 ? Math.sin(t * 4.5) * 0.22 : 0.2;
  S.pump.stream.forEach((d, i) => { const ph = (t * 1.8 + i / 8) % 1; d.position.set(0.78 + Math.sin(i) * 0.03, 1.36 - ph * 1.25, 0.03); d.visible = t > 3.7 && inA; });
  S.letters.forEach((s, i) => { s.position.set(-0.75 + i * 0.32, 3.95 + Math.sin(t * 3 + i) * 0.05, 3); show(s, t, 3.95 + i * 0.25, 5.4, 0.25); });
  // ---- C: writer at the typewriter
  S.helenW.h.setFacing(0.35); sit(S.helenW.h, [CX - 0.95, 1.05], [CX - 0.05, 0.02], { dir: 1, base: idle(t, 52, { spine: -0.06, head: -0.05 }) });
  faceLife(S.helenW.h, t, { seed: 52, smile: 0.65, look: [0.2, -0.3] });
  const typing = (t * 12) % 1 < 0.5 ? 1 : 0;
  S.helenW.h.reach('L', CX + 0.25 + typing * 0.1, 1.5, 1); S.helenW.h.reach('R', CX + 0.75 - typing * 0.1, 1.48, 1);
  S.tw.lines.forEach((l, i) => { const v = clamp(prog(t, 5.5, 1.7, ease.linear) * 6 - i); l.scale.x = Math.max(0.001, v); l.position.x = -0.32 * (1 - v); });
  S.stack.scale.y = 1 + prog(t, 5.6, 1.6) * 2.5;
  // ---- D: graduation
  S.helenG.update(t, { x: DX - 0.6, facing: 0.25, pose: mixPose(restPose(), { armR: [1.9, -0.3, 0], handR: 'hold' }, pulse(t, 7.5, 9.3, 0.4, 0.3)), smile: 0.95, look: [0.2, 0.1] });
  S.anneG.update(t, { x: DX + 1.5, facing: -0.3, pose: mixPose(restPose(), { armL: [-2.4, -0.4, 0], armR: [2.4, 0.4, 0] }, pulse(t, 8.0, 9.3, 0.3, 0.3)), smile: 0.9, mouth: t > 8.0 && t < 9.2 ? 0.35 : null });
  const dw = new THREE.Vector3(); S.helenG.h.J.wrR.getWorldPosition(dw); S.diploma.position.set(dw.x + 0.1, dw.y + 0.05, 2.0); S.diploma.rotation.z = 0.5;
  S.caps.forEach((c, i) => { c.position.set(DX - 1.6 + i * 1.6, 2.6 + ((t - 8.0) * 3.2) - (t - 8.0) ** 2 * 2.6 + i * 0.2, 3); c.rotation.z = (t - 8) * (i - 1) * 2; c.visible = t > 8.0 && t < 9.25; });
  // ---- E: speaking for rights (Anne beside her)
  S.helenS.update(t, { x: EX - 0.2, facing: 0.15, pose: mixPose(restPose(), explain(t, 1.0, 9), 0.85), smile: 0.75, talk: (tt) => tt > 9.3 && tt < 14.2, look: [0, 0.1] });
  S.anneS.update(t, { x: EX - 1.9, facing: 0.4, pose: { ...restPose(), armR: [1.0, 0.6, 0] }, smile: 0.8, look: [0.7, 0.1] });
  S.crowd.forEach((g, i) => { g.position.y = -1.5 - (i % 2) * 0.25 + Math.abs(Math.sin(t * 2 + i)) * 0.04; });
  // camera: A(0–5.45) C(5.45–7.25) D(7.25–9.25) E(9.25–)
  if (t < 5.45) return camAt([[0, [-2.4, 2.6, 1.5]], [3.4, [-0.2, 2.15, 1.95]], [5.45, [-0.1, 2.1, 2.2]]], t);
  if (t < 7.25) return camAt([[5.45, [CX + 0.1, 1.85, 2.3]], [7.25, [CX + 0.15, 1.8, 2.45]]], t);
  if (t < 9.25) return camAt([[7.25, [DX + 0.4, 2.4, 1.9]], [9.25, [DX + 0.4, 2.45, 1.75]]], t);
  return camAt([[9.25, [EX - 0.3, 2.2, 1.95]], [11.0, [EX - 0.3, 2.2, 1.85]], [14.7, [EX - 0.3, 1.9, 1.5]]], t);
}
