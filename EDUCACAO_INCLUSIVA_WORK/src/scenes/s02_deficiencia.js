// CENA 2 — O QUE É DEFICIÊNCIA? (13.07–33.70, local 0–20.64)
// Steps give way to a ramp; Pedro enters with autonomy (Ana walks beside, does not push).
// Board infographic: pessoa -> barreira -> acessibilidade -> participação; CIF (OMS); CDPD (ONU).
import * as THREE from 'three';
import { P, shade } from '../core/palette.js';
import { clubhouseSide, backdrop, flag } from '../environments/outdoor.js';
import { Actor, ChairActor, camAt, path } from './kit.js';
import { restPose, mixPose, wave } from '../animations/cycles.js';
import { pulse, prog, ease, clamp, lerp } from '../core/math.js';
import { show, sparkle, person, people, brick, cross, heart, scales, arrow, badge, check, ramp as rampIcon, grp } from '../objects/fx.js';
import { vpart, rrectPts, circlePts, strokePts, roundPoly, setOpacity } from '../core/vector.js';
import { tree } from '../environments/outdoor.js';
import { documentSheet } from '../objects/accessibility.js';
import { screenLayer, board } from './ui.js';

export function build() {
  const scene = new THREE.Scene();
  const S = { scene };
  S.bd = backdrop(scene, { seed: 11, trees: [[-10.5, 1.2, 'round'], [-7.4, 1.0, 'pine', -14], [10.2, 1.25, 'round'], [12.6, 0.9, 'pine']] });
  S.club = clubhouseSide({ x0: 0, w: 7.5 }); scene.add(S.club.g);
  S.fl = flag(4.6); S.fl.g.position.set(8.6, 0, -4); scene.add(S.fl.g);
  S.pedro = new ChairActor(scene, 'pedro', { kind: 'manual', x: -8.4, z: 2, dir: 1, seed: 3 });
  S.ana = new Actor(scene, 'ana', { x: -6.2, z: 1.0, facing: 0.45, seed: 2 });
  S.sparks = [];
  for (let i = 0; i < 6; i++) { const s = sparkle(i % 2 ? P.yellow : '#FFFFFF', 0.5); scene.add(s); S.sparks.push(s); }

  // ---- board (screen space)
  const ui = S.ui = screenLayer(scene, 20);
  const B = S.B = new THREE.Group(); ui.g.add(B);
  B.add(board(P.navy, P.royal, 7));
  // part 1: person -> barrier -> accessibility -> participation
  const p1 = S.p1 = new THREE.Group(); p1.scale.setScalar(1.6); p1.position.y = 0.6; B.add(p1);
  p1.add(vpart({ pts: rrectPts(10.0, 0.16, 0.08, 0, -2.15), color: P.turquoise, outline: 0, z: 0 }));
  S.who = person(P.yellow, 1.25); p1.add(S.who);
  S.goal = new THREE.Group(); S.goal.position.set(2.45, -1.0, 0); p1.add(S.goal);
  S.goal.add(people(0.95, [P.green, P.turquoise, P.pink]));
  S.goalStar = sparkle(P.yellow, 1.0); S.goalStar.position.set(0, 1.5, 0.1); S.goal.add(S.goalStar);
  S.wall = new THREE.Group(); S.wall.position.set(0.2, -2.05, 0.05); p1.add(S.wall);
  S.bricks = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 2; c++) {
    const b = brick(0.66, 0.42); b.userData.home = [(c - 0.5) * 0.68 + (r % 2 ? 0.17 : -0.17), 0.24 + r * 0.44]; S.wall.add(b); S.bricks.push(b);
  }
  S.x1 = cross(P.red, 0.8); S.x1.position.set(-1.2, 1.4, 0.2); p1.add(S.x1);
  S.bridge = new THREE.Group(); S.bridge.position.set(0.2, -2.1, 0.04); p1.add(S.bridge);
  S.bridge.add(vpart({ pts: [[-2.0, 0], [0, 1.0], [2.0, 0]], color: '#C9D2DE', shade: '#A3AAB8', mode: 2, p: [0, -1, -0.3, 0], z: 0 }));
  S.bridge.add(vpart({ pts: strokePts([[-2.2, 0.55], [0, 1.6], [2.2, 0.55]], 0.09), color: P.yellow, outline: 0.03, z: 0.01 }));
  // part 2: CIF triangle
  const p2 = S.p2 = new THREE.Group(); p2.userData.base = 1.6; B.add(p2);
  const N = S.nodes = [[0, 2.15], [-2.1, -1.55], [2.1, -1.55]];
  S.links = [];
  for (let i = 0; i < 3; i++) {
    const a = N[i], b = N[(i + 1) % 3];
    const l = vpart({ pts: strokePts([[0, 0], [Math.hypot(b[0] - a[0], b[1] - a[1]), 0]], 0.14), color: P.turquoise, outline: 0, z: -0.1 });
    l.position.set(a[0], a[1], 0); l.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]); p2.add(l); S.links.push(l);
  }
  const icons = [heart(P.red, 0.9), grp(tree(3, 0.42, 0.02), (() => { const h = vpart({ pts: roundPoly([[-0.35, 0], [0.35, 0], [0.35, 0.45], [0, 0.75], [-0.35, 0.45]], 0.05), color: P.wall, outline: 0.04, z: 0.03 }); h.position.set(0.45, -0.1, 0); return h; })()), people(0.55, [P.green, P.yellow, P.pink])];
  icons[1].position.set(-0.25, -0.45, 0);
  S.nodeG = N.map(([x, y], i) => { const g = new THREE.Group(); g.position.set(x, y, 0.1); g.add(badge(['#FFE3E6', '#E3F7D9', '#DDF5F7'][i], 1.75, '#FFFFFF')); icons[i].position.z = 0.05; g.add(icons[i]); p2.add(g); return g; });
  S.center = badge(P.yellow, 1.05, P.navy); S.center.position.set(0, -0.55, 0.12); p2.add(S.center);
  // part 3: UN Convention card (generic document + rosette, no emblem)
  const p3 = S.p3 = new THREE.Group(); p3.scale.setScalar(1.55); p3.position.y = 0.4; B.add(p3);
  S.doc = documentSheet({ w: 3.0, h: 3.5, lines: 8 }); S.doc.root.position.set(0, 1.25, 0); p3.add(S.doc.root);
  const ros = new THREE.Group(); ros.position.set(1.05, -0.55, 0.1); p3.add(ros);
  ros.add(vpart({ pts: roundPoly([[-0.25, 0], [-0.45, -0.95], [-0.1, -0.75], [0.1, -0.75], [0.45, -0.95], [0.25, 0]], 0.04), color: P.royal, outline: 0.03, z: -0.01 }));
  const rp = []; for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 0.5 : 0.58; rp.push([Math.cos(a) * r, Math.sin(a) * r]); }
  ros.add(vpart({ pts: rp, color: P.turquoise, outline: 0.03 }));
  ros.add(vpart({ pts: circlePts(0.36, 30), color: '#FFFFFF', outline: 0, z: 0.01 }));
  ros.add((() => { const c = check(P.royal, 0.45); c.position.z = 0.02; return c; })());
  S.icD = [scales(P.gold, 0.8), (() => { const g = new THREE.Group(); g.add(vpart({ pts: rrectPts(0.9, 1.3, 0.08), color: P.wood, outline: 0.04 })); g.add(vpart({ pts: rrectPts(0.62, 1.1, 0.06, 0.06, -0.06), color: '#FFD98A', outline: 0, z: 0.01 })); const a = arrow(0.9, P.green, 0.16); a.rotation.z = Math.PI / 2; a.position.set(0.05, -0.35, 0.02); g.add(a); return g; })(), people(0.55)];
  S.icD.forEach((g, i) => { g.position.set(-2.4 + i * 2.4, -2.45, 0.2); p3.add(g); });
  return S;
}

export function update(S, t) {
  const { club, pedro, ana } = S;
  S.bd.drift(t + 13); S.fl.wave(t + 13);
  // steps give way to the ramp
  const k = prog(t, 0.15, 1.3, ease.inOutCubic);
  club.entrance(k);
  S.sparks.forEach((s, i) => { const a = 0.4 + i * 0.12; const on = show(s, t, a, a + 0.9, 0.3); s.position.set(club.rampX0 + 1.0 + i * 1.0, 0.25 + (i * 0.17) + Math.sin(t * 4 + i) * 0.1, 3); s.rotation.z = t * 2 + i; });
  // Pedro rolls up the ramp and in through the door (autonomy)
  pedro.update(t, { x: [[0, -8.4], [1.3, -8.2], [4.6, club.doorX - 0.6], [5.6, club.doorX + 0.2]], ground: (x) => club.ground(x), smile: 0.9, look: [0.7, 0.15] });
  const inside = prog(t, 4.8, 0.5);
  setOpacity(pedro.chair.root, 1 - inside); setOpacity(pedro.h.root, 1 - inside);
  pedro.chair.root.position.z = pedro.h.root.position.z = pedro.chair.root.position.x > club.rampX1 ? -1.4 : 2;
  // Ana walks beside him (slightly behind, never pushing)
  ana.update(t, { x: [[0, -6.2], [1.0, -6.1], [4.2, club.doorX + 0.4], [5.0, club.doorX + 0.9]], ground: (x) => club.ground(x), smile: 0.85, look: [-0.7, -0.15], facing: [[0, 0.45], [1.1, 0.25]], pose: { ...restPose(), armL: [-0.9, -0.4, 0.2], handL: 'open' } });
  setOpacity(ana.root, 1 - prog(t, 4.6, 0.5));
  ana.root.position.z = ana.root.position.x > club.rampX1 ? -1.6 : 1.0;

  // ---- camera: follow along the ramp, then the board slides in
  const px = pedro.chair.root.position.x;
  const cam = t < 3.4 ? { x: lerp(-6.0, px + 1.2, prog(t, 0.6, 1.4)), y: 2.2, zoom: lerp(1.6, 1.9, prog(t, 0, 2)) } : { x: clamp(px + 1.2, -9, 1.2), y: 2.2, zoom: 1.9 };
  if (t >= 3.4) { const c0 = { x: clamp(path([[0, -8.4], [1.3, -8.2], [4.6, club.doorX - 0.6]], 3.4) + 1.2, -9, 1.2) }; cam.x = lerp(c0.x, 1.0, prog(t, 3.4, 1.2)); }
  S.ui.lock(cam);
  // board slides up over the scene at "Muitas dificuldades..."
  const bIn = prog(t, 3.35, 0.55, ease.outCubic);
  S.B.visible = bIn > 0; S.B.position.y = (1 - bIn) * -20.5;

  // part 1 (3.6–9.6)
  const p1o = 1 - prog(t, 9.4, 0.4);
  S.p1.visible = p1o > 0.01; S.p1.scale.setScalar(1.6 * (0.85 + 0.15 * p1o));
  const wx = t < 6.65 ? lerp(-2.95, -1.25, prog(t, 4.0, 2.6, ease.inOutSine)) : t < 7.7 ? -1.25 + Math.sin(prog(t, 6.65, 0.3) * Math.PI) * -0.15 : lerp(-1.25, 1.3, prog(t, 7.7, 1.5, ease.inOutSine));
  const onBridge = clamp((wx + 1.8) / 3.6);
  S.who.position.set(wx, -1.25 + Math.sin(onBridge * Math.PI) * 0.95 * (t > 7.7 ? 1 : 0) + Math.abs(Math.sin(t * 9)) * 0.06 * (t > 4 && t < 9.2 ? 1 : 0), 0.1);
  S.bricks.forEach((b, i) => {
    const drop = prog(t, 6.45 + i * 0.025, 0.35, ease.outBack);
    const blast = prog(t, 7.25, 0.6, ease.outCubic);
    const [hx, hy] = b.userData.home;
    const dirx = (i % 2 ? 1 : -1) * (1 + (i % 3)), diry = 1.5 + (i % 4);
    b.position.set(hx + dirx * blast * 2.2, hy + (1 - drop) * 7 + diry * blast * 1.5 - blast * blast * 6, 0);
    b.rotation.z = blast * dirx * 1.4; b.visible = drop > 0.001 && blast < 0.98; setOpacity(b, 1 - blast);
  });
  show(S.x1, t, 6.75, 7.3, 0.3);
  const bk = prog(t, 7.35, 0.5, ease.outBack); S.bridge.visible = bk > 0.01; S.bridge.scale.set(1, Math.max(0.01, bk), 1);
  S.goalStar.rotation.z = t; S.goalStar.scale.setScalar(t > 8.9 ? 1 + 0.25 * Math.sin(t * 8) : 0.0001);
  // part 2 (9.7–15.4): CIF triangle
  const p2in = prog(t, 9.6, 0.5, ease.outBack), p2out = prog(t, 15.3, 0.45);
  S.p2.visible = p2in > 0.01 && p2out < 0.99; S.p2.scale.setScalar(1.6 * Math.max(0.01, p2in * (1 - p2out * 0.3))); S.p2.position.y = 1.3 + p2out * 8;
  S.links.forEach((l, i) => { const kk = prog(t, 12.0 + i * 0.25, 0.55); l.scale.x = Math.max(0.001, kk); });
  [12.85, 13.75, 14.65].forEach((ta, i) => { const n = S.nodeG[i]; const s = t < ta ? 0.55 : 0.55 + 0.45 * ease.outBack(clamp((t - ta) / 0.4)); n.scale.setScalar(s); n.children[1].visible = t > ta - 0.05; n.rotation.z = Math.sin(t * 2 + i) * 0.03; });
  show(S.center, t, 10.4, 15.4);
  // part 3 (15.4–20.6): UN convention card + rights / opportunities / everyone
  const p3in = prog(t, 15.4, 0.5, ease.outCubic);
  S.p3.visible = p3in > 0.01; S.p3.position.y = (1 - p3in) * -12;
  S.doc.write(prog(t, 15.8, 1.8, ease.linear));
  [17.6, 18.45, 19.6].forEach((ta, i) => show(S.icD[i], t, ta));
  return cam;
}
