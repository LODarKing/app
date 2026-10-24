// CENA 1 — E SE FOSSE VOCÊ? (0.00–13.07)
// Pedro rolls into the club full of energy; the steps (the barrier, not the person)
// block the entrance; Ana notices, time slows; she comes down to stand with him.
import * as THREE from 'three';
import { P } from '../core/palette.js';
import { clubhouseSide, backdrop, flag } from '../environments/outdoor.js';
import { Actor, ChairActor, camAt, path } from './kit.js';
import { restPose, wave, point, mixPose } from '../animations/cycles.js';
import { pulse, prog, ease, clamp, lerp } from '../core/math.js';
import { questionMark, highlightRect, warningSign, show, fade, cross } from '../objects/fx.js';
import { setOpacity } from '../core/vector.js';

export function build() {
  const scene = new THREE.Scene();
  const bd = backdrop(scene, { seed: 11, trees: [[-10.5, 1.2, 'round'], [-7.4, 1.0, 'pine', -14], [10.2, 1.25, 'round'], [12.6, 0.9, 'pine']] });
  const club = clubhouseSide({ x0: 0, w: 7.5 });
  scene.add(club.g);
  const fl = flag(4.6); fl.g.position.set(8.6, 0, -4); scene.add(fl.g);
  const S = { scene, bd, club, fl };
  S.pedro = new ChairActor(scene, 'pedro', { kind: 'manual', x: -10, y: 0, z: 2, dir: 1, seed: 3 });
  S.lucas = new Actor(scene, 'lucas', { x: -6, z: 1, facing: 0.5, seed: 1 });
  S.joao = new Actor(scene, 'joao', { x: 3.6, y: club.H, z: -1.5, facing: -0.4, seed: 9 });
  S.ana = new Actor(scene, 'ana', { x: 1.0, y: club.H, z: -1.0, facing: 0.3, seed: 2 });
  // barrier highlight (around the steps) + warning + question mark
  S.hl = highlightRect(club.stepX1 - club.stepX0 + 0.1, club.H + 0.1, P.red, 0.07);
  S.hl.position.set((club.stepX0 + club.stepX1) / 2, club.H / 2, 0.5); scene.add(S.hl);
  S.warn = warningSign(0.55); S.warn.position.set((club.stepX0 + club.stepX1) / 2, club.H + 0.85, 0.6); scene.add(S.warn);
  S.q = questionMark(P.yellow, 0.75); S.q.position.set(-1.1, 4.3, 3); scene.add(S.q);
  return S;
}

// time remap: action slows down around "Será que isso é inclusão?"
function slow(t) {
  const a = 7.0, b = 8.7, k = 0.35;
  if (t < a) return t;
  if (t < b) return a + (t - a) * k;
  return a + (b - a) * k + (t - b);
}

export function update(S, t) {
  const { club, pedro, lucas, joao, ana } = S;
  const ts = slow(t);
  S.bd.drift(t); S.fl.wave(ts);
  club.entrance(0);
  // Pedro: rolls in fast, brakes at the foot of the steps
  pedro.update(ts, {
    x: [[0, -10.2], [4.4, -3.3, ease.outCubic]],
    look: t < 4.6 ? [0.7, 0.05] : [0.5, 0.75],
    smile: lerp(0.95, 0.05, prog(t, 5.2, 1.0)), brow: lerp(0.2, -0.1, prog(t, 5.2, 1.0)), browTilt: lerp(0, 0.75, prog(t, 5.3, 1.0)),
    pose: t > 9.6 ? { head: 0.05 } : undefined,
    pushK: [[0, 1], [4.2, 1], [4.8, 0]],
  });
  if (t > 4.6) { const tt = t; const p = prog(tt, 4.6, 0.6); pedro.h.J.head.rotation.z = lerp(0, 0.18, p) * (t < 9.5 ? 1 : 1 - prog(t, 9.5, 0.8)); }
  if (t > 10.2) pedro.h.face.set({ smile: lerp(0.05, 0.75, prog(t, 10.2, 0.8)), browTilt: lerp(0.75, 0, prog(t, 10.2, 0.8)), brow: 0.2, look: [-0.2, 0.1] });

  // Lucas: jogs in, climbs the steps and goes inside (fades at the doorway)
  const lx = [[0, -6.4], [3.8, club.doorX - 0.1, ease.inOutSine]];
  lucas.update(ts, { x: lx, ground: (x) => club.ground(x), armSwing: 0.45, smile: 0.8 });
  setOpacity(lucas.root, 1 - prog(ts, 3.5, 0.45)); lucas.root.visible = ts < 3.95;
  lucas.root.position.z = 1 - prog(ts, 2.6, 0.6) * 3;   // behind the porch band while on the porch

  // João carries a pennant into the door and disappears inside
  joao.update(ts, { x: [[0, 4.2], [0.6, 4.2], [2.8, club.doorX + 0.2]], ground: () => club.H, pose: { ...restPose(), armR: [0.1, -1.6, 0.1], handR: 'hold' }, smile: 0.7 });
  setOpacity(joao.root, 1 - prog(ts, 2.6, 0.4)); joao.root.visible = ts < 3.05;

  // Ana: greets from the porch, notices the problem, comes down the steps to Pedro
  const anaX = [[0, 1.2], [8.6, 1.2], [11.4, -1.75, ease.inOutSine]];
  const greet = pulse(ts, 0.8, 3.4, 0.4, 0.5);
  ana.update(t < 8.7 ? ts : t, {
    x: anaX, ground: (x) => club.ground(x),
    facing: t < 6.9 ? -0.3 : t < 11.4 ? -0.5 : -0.35,
    pose: mixPose(mixPose(restPose(), wave(ts, 'L'), greet), { armL: [-0.2, -0.9, 0.2], armR: [0.25, 1.0, -0.2] }, pulse(t, 7.0, 8.6, 0.3, 0.5) * 0.8),
    smile: t < 6.8 ? 0.8 : lerp(0.1, 0.7, prog(t, 10.8, 0.8)), brow: t > 6.9 && t < 10.5 ? 0.7 : 0.2,
    look: t < 6.8 ? [-0.6, -0.2] : [-0.8, -0.5], mouth: t > 11.6 && t < 12.6 ? 0.25 + 0.2 * Math.sin(t * 14) : null,
  });
  ana.root.position.z = ana.root.position.x > club.stepX1 + 0.1 ? -1.0 : 1.2;   // in front of the porch band on the steps/ground

  // emphasis: the barrier is the problem
  const hk = pulse(t, 5.0, 12.4, 0.25, 0.4);
  S.hl.visible = hk > 0.01; setOpacity(S.hl, hk * (0.65 + 0.35 * Math.sin(t * 7)));
  show(S.warn, t, 5.15, 12.3);
  S.warn.rotation.z = Math.sin(t * 5) * 0.05;
  show(S.q, t, 7.15, 9.4);
  S.q.position.y = 4.3 + Math.sin(t * 3) * 0.08;

  // camera
  const pedPath = [[0, -10.2], [4.4, -3.3, ease.outCubic]];
  const pedX = path(pedPath, ts), c36 = Math.max(-9.0, path(pedPath, 3.6) + 1.6);
  const cam = t < 3.6 ? { x: Math.max(pedX + 1.5, -8.6), y: 1.95, zoom: 2.0 }
    : camAt([[3.6, [Math.max(-8.6, path(pedPath, 3.6) + 1.5), 1.95, 2.0]], [5.0, [-2.1, 1.85, 2.1]], [6.8, [-2.0, 1.6, 2.4]], [8.4, [-0.6, 2.2, 1.9]],
      [9.6, [-1.2, 2.6, 1.45]], [11.2, [-2.4, 1.95, 2.0]], [13.2, [-2.5, 1.9, 2.1]]], t);
  return cam;
}
