// Character test sheet (brief §15): idle, walk, wave, expressions, two-character
// interaction, object interaction, manual wheelchair propulsion, long-cane technique,
// power chair + AAC tablet.
import * as THREE from 'three';
import { P } from '../core/palette.js';
import { make } from '../characters/cast.js';
import { sky, ground } from '../environments/outdoor.js';
import { manualWheelchair, powerWheelchair, longCane, documentSheet } from '../objects/accessibility.js';
import { walk, stand, idle, faceLife, wheelchairPush, caneSweep, sit, wave, point, explain, restPose, mixPose } from '../animations/cycles.js';
import { vpart, rrectPts } from '../core/vector.js';
import { prog, ease, lerp, pulse } from '../core/math.js';

export function build() {
  const scene = new THREE.Scene();
  scene.add(sky(P.skyTop, P.sky, 40, 40, 0, -40));
  const rows = [4.2, -1.2, -6.6];
  rows.forEach((y, i) => scene.add(ground(i === 1 ? '#8FD16F' : P.grass, y, 40, 3.2 - (i === 0 ? 0 : 0), -20 + i)));
  const c = {};
  const add = (k, x, y, z) => { const h = make(k); h.root.position.set(x, y, z); scene.add(h.root); c[k] = h; return h; };
  add('lucas', -4, rows[0], 1); add('ana', 3.3, rows[0], 0.5);
  const pedro = add('pedro', 0, rows[1], 2);
  const chair = manualWheelchair(); chair.root.position.set(-4, rows[1], 2); scene.add(chair.root);
  const clara = add('clara', 4, rows[1], 1);
  const cane = longCane(); scene.add(cane.root);
  add('rafael', -3.6, rows[2], 1); add('bia', -1.2, rows[2], 1.5);
  const theo = add('theo', 0, rows[2], 2);
  const pchair = powerWheelchair(); pchair.root.position.set(1.7, rows[2], 2); pchair.root.scale.set(-1, 1, 1); scene.add(pchair.root);
  add('director', 3.9, rows[2], 0.5);
  const card = documentSheet({ w: 0.5, h: 0.62, lines: 4 }); scene.add(card.root);
  return { scene, c, chair, pchair, cane, card, rows };
}

export function update(S, t) {
  const { c, chair, pchair, cane, card, rows } = S;
  // Row 1: Lucas walks in and greets Ana; Ana waves back (two-character interaction)
  const lx = lerp(-4.2, 1.6, prog(t, 0, 4.2, ease.linear));
  c.lucas.setFacing(t < 4.2 ? 0.55 : 0.35);
  if (t < 4.2) walk(c.lucas, lx, { dir: 1, groundY: rows[0], t });
  else { c.lucas.root.position.x = 1.6; c.lucas.setPose(idle(t, 1, mixPose(restPose(), wave(t, 'R'), pulse(t, 5.0, 7.2, 0.4, 0.4)))); stand(c.lucas, { groundY: rows[0] }); }
  faceLife(c.lucas, t, { seed: 1, talk: (tt) => tt > 5 && tt < 7, smile: 0.7, look: [0.6, 0] });
  c.ana.setFacing(-0.45);
  const aw = pulse(t, 3.6, 6.4, 0.4, 0.5);
  c.ana.setPose(idle(t, 2, mixPose(restPose(), wave(t + 0.4, 'L'), aw))); stand(c.ana, { groundY: rows[0] });
  faceLife(c.ana, t, { seed: 2, smile: 0.4 + aw * 0.5, mouth: aw > 0.5 ? 0.35 : null, brow: aw * 0.6, look: [-0.7, 0] });

  // Row 2: Pedro propels his manual wheelchair; Clara walks with a long cane
  const pd = lerp(0, 6.2, prog(t, 0.3, 7.5, ease.inOutSine));
  chair.root.position.x = -4.2 + pd;
  const push = wheelchairPush(c.pedro, chair, pd, { dir: 1, period: 1.4, active: pulse(t, 0.2, 7.6, 0.4, 0.5) });
  c.pedro.setFacing(0.6);
  chair.root.updateWorldMatrix(true, true);
  const seat = chair.root.localToWorld(new THREE.Vector3(...chair.seat, 0)), foot = chair.root.localToWorld(new THREE.Vector3(...chair.foot, 0));
  sit(c.pedro, [seat.x, seat.y], [foot.x, foot.y], { dir: 1, base: { spine: -push.lean - 0.05, head: 0.08, armL: [0.3, 0.6, 0], armR: [0.3, 0.6, 0] } });
  c.pedro.root.position.z = 2; c.pedro.reach('L', push.hand[0], push.hand[1], 1); c.pedro.reach('R', push.hand[0] - 0.05, push.hand[1] + 0.02, 1);
  c.pedro.setHand('L', 'hold'); c.pedro.setHand('R', 'hold');
  faceLife(c.pedro, t, { seed: 3, smile: 0.8, look: [0.7, 0.1] });

  c.clara.setFacing(-0.55);
  const cx = lerp(4.6, 0.8, prog(t, 0.5, 8, ease.linear));
  walk(c.clara, cx, { dir: -1, groundY: rows[1], armSwing: 0.2, base: { armR: [-0.7, -0.5, 0] } });
  const tip = caneSweep(c.clara, cx, { dir: -1, groundY: rows[1] });
  const hp = new THREE.Vector3(); c.clara.root.updateWorldMatrix(true, true); c.clara.J.spine.getWorldPosition(hp);
  const hx = hp.x - 0.42, hy = hp.y + 0.12 + Math.sin(t * 2) * 0.01;
  c.clara.reach('R', hx, hy, -1); c.clara.setHand('R', 'hold');
  cane.root.position.z = c.clara.root.position.z + 0.24; cane.span(hx, hy - 0.03, tip[0], tip[1]);
  faceLife(c.clara, t, { seed: 4, smile: 0.5, look: [0, -0.1] });

  // Row 3: expressions (Rafael), adapted picture instructions (Bia), AAC (Theo), director pointing
  const ex = Math.floor(t / 2) % 4;
  const presets = [{ smile: 0.7 }, { smile: 0.3, mouth: 0.55, brow: 0.9 }, { smile: -0.4, brow: -0.2, browTilt: 0.8 }, { smile: 0.9, mouth: 0.25, brow: 0.4 }];
  c.rafael.setFacing(Math.sin(t * 0.8) * 0.5);
  c.rafael.setPose(idle(t, 5, mixPose(restPose(), explain(t, 1, 5), pulse(t, 1, 9, 0.6, 0.6)))); stand(c.rafael, { groundY: rows[2] });
  faceLife(c.rafael, t, { seed: 5, talk: (tt) => ex === 0 && tt % 2 > 0.4, ...presets[ex] });

  c.bia.setFacing(0.25);
  c.bia.setPose(idle(t, 6, { ...restPose(), armL: [-0.25, -1.35, 0.1], armR: [0.25, 1.35, -0.1] })); stand(c.bia, { groundY: rows[2] });
  const wl = new THREE.Vector3(), wr = new THREE.Vector3(); c.bia.J.wrL.getWorldPosition(wl); c.bia.J.wrR.getWorldPosition(wr);
  card.root.position.set((wl.x + wr.x) / 2, (wl.y + wr.y) / 2 + 0.22, c.bia.root.position.z + 0.15);
  card.write(prog(t, 1, 5, ease.linear));
  faceLife(c.bia, t, { seed: 6, smile: 0.6, look: [0, -0.8] });

  pchair.roll(Math.sin(t * 0.7) * 0.4); pchair.steer(Math.sin(t * 0.7));
  c.theo.setFacing(-0.6);
  pchair.root.updateWorldMatrix(true, true);
  const s2 = pchair.root.localToWorld(new THREE.Vector3(...pchair.seat, 0)), f2 = pchair.root.localToWorld(new THREE.Vector3(...pchair.foot, 0));
  sit(c.theo, [s2.x, s2.y], [f2.x, f2.y], { dir: -1, base: { spine: 0.04, armL: [-0.2, -0.5, 0], armR: [-0.3, -0.9, 0] } });
  const press = Math.floor(t / 1.5) % 6, pk = Math.sin(((t % 1.5) / 1.5) * Math.PI);
  const cell = pchair.tablet.cells[press]; const cp = new THREE.Vector3(); cell.getWorldPosition(cp);
  c.theo.reach('L', cp.x + 0.02, cp.y + 0.05 + (1 - pk) * 0.25, -1); c.theo.setHand('L', 'point');
  pchair.tablet.press(press, pk);
  faceLife(c.theo, t, { seed: 7, smile: 0.5 + pk * 0.4, look: [-0.6, -0.3] });

  c.director.setFacing(-0.3);
  const pt = pulse(t, 2, 8, 0.5, 0.5);
  c.director.setPose(idle(t, 8, mixPose(restPose(), point(-1, 'L', 0.2), pt))); stand(c.director, { groundY: rows[2] });
  faceLife(c.director, t, { seed: 8, talk: (tt) => tt > 2.5 && tt < 7, smile: 0.5, look: [-0.8, 0] });
}
