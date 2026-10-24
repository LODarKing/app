// Vector icons and emphasis effects (all procedural geometry).
import * as THREE from 'three';
import { P, shade } from '../core/palette.js';
import { vpart, vring, circlePts, rrectPts, strokePts, roundPoly, curvePts, arcPts, blobPts, ellipsePts, setOpacity } from '../core/vector.js';
import { ease, clamp, prog } from '../core/math.js';

export const grp = (...c) => { const g = new THREE.Group(); c.forEach((x) => g.add(x)); return g; };

/** Pop-in scale with overshoot; returns scale value */
export function pop(t, t0, d = 0.45) { const k = clamp((t - t0) / d); return k <= 0 ? 0.0001 : ease.outBack(k, 2.2); }
export function show(obj, t, t0, t1 = 1e9, d = 0.45) {
  const kin = clamp((t - t0) / d), kout = clamp((t - t1) / 0.3);
  const s = kin <= 0 ? 0.0001 : ease.outBack(kin, 2.0) * (1 - ease.inBack(kout) * 0.999);
  obj.visible = kin > 0 && kout < 1; obj.scale.setScalar(Math.max(0.0001, s));
  return obj.visible;
}
export function fade(obj, o) { obj.visible = o > 0.001; setOpacity(obj, clamp(o)); }

export function questionMark(color = P.yellow, s = 1) {
  const line = curvePts([[-0.32, 0.55], [-0.2, 0.85], [0.15, 0.9], [0.36, 0.62], [0.2, 0.3], [0.0, 0.12], [0, -0.12]].map(([x, y]) => [x * s, y * s]), 30);
  return grp(vpart({ pts: strokePts(line, 0.2 * s), color, outline: 0.05 * s, z: 0 }), vpart({ pts: circlePts(0.13 * s, 20, 0, -0.45 * s), color, outline: 0.05 * s, z: 0 }));
}
export function exclamation(color = P.red, s = 1) {
  return grp(vpart({ pts: roundPoly([[-0.13, 0.85], [0.13, 0.85], [0.07, -0.12], [-0.07, -0.12]].map(([x, y]) => [x * s, y * s]), 0.05 * s), color, outline: 0.05 * s }), vpart({ pts: circlePts(0.12 * s, 20, 0, -0.42 * s), color, outline: 0.05 * s }));
}
export function check(color = P.green, s = 1) { return vpart({ pts: strokePts([[-0.45 * s, 0.0], [-0.12 * s, -0.33 * s], [0.5 * s, 0.4 * s]], 0.2 * s), color, outline: 0.05 * s }); }
export function cross(color = P.red, s = 1) {
  return grp(vpart({ pts: strokePts([[-0.4 * s, -0.4 * s], [0.4 * s, 0.4 * s]], 0.2 * s), color, outline: 0.05 * s }), vpart({ pts: strokePts([[-0.4 * s, 0.4 * s], [0.4 * s, -0.4 * s]], 0.2 * s), color, outline: 0.05 * s, z: 0.001 }));
}
export function badge(color, s = 1, ring = '#FFFFFF') {
  return grp(vpart({ pts: circlePts(0.62 * s, 48), color: ring, outline: 0.05 * s, z: -0.01 }), vpart({ pts: circlePts(0.52 * s, 48), color, outline: 0, z: 0 }));
}
export function warningSign(s = 1) {
  const tri = roundPoly([[-0.7, -0.55], [0.7, -0.55], [0, 0.68]].map(([x, y]) => [x * s, y * s]), 0.12 * s);
  return grp(vpart({ pts: tri, color: P.yellow, outline: 0.06 * s }), (() => { const e = exclamation(P.ink, 0.45 * s); e.position.set(0, -0.03 * s, 0.01); return e; })());
}
export function heart(color = P.red, s = 1) {
  const pts = []; for (let i = 0; i < 64; i++) { const a = (i / 64) * Math.PI * 2; const x = 16 * Math.pow(Math.sin(a), 3), y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a); pts.push([x * 0.032 * s, y * 0.032 * s]); }
  return vpart({ pts, color, shade: shade(color, 0.82), mode: 1, p: [-0.15 * s, 0.15 * s, 0.5 * s, 0], outline: 0.05 * s });
}
export function equals(color = P.turquoise, s = 1) {
  return grp(vpart({ pts: rrectPts(1.0 * s, 0.22 * s, 0.1 * s, 0, 0.2 * s), color, outline: 0.05 * s }), vpart({ pts: rrectPts(1.0 * s, 0.22 * s, 0.1 * s, 0, -0.2 * s), color, outline: 0.05 * s }));
}
export function person(color = P.royal, s = 1) {
  return grp(vpart({ pts: circlePts(0.22 * s, 24, 0, 0.42 * s), color, outline: 0.04 * s }), vpart({ pts: roundPoly([[-0.38, -0.5], [0.38, -0.5], [0.3, 0.12], [-0.3, 0.12]].map(([x, y]) => [x * s, y * s]), 0.15 * s), color, outline: 0.04 * s, z: -0.001 }));
}
export function people(s = 1, colors = [P.royal, P.turquoise, P.yellow]) {
  const g = new THREE.Group();
  colors.forEach((c, i) => { const p = person(c, s * (i === 1 ? 1.15 : 0.95)); p.position.set((i - 1) * 0.62 * s, i === 1 ? 0.05 * s : -0.05 * s, i === 1 ? 0.02 : 0); g.add(p); });
  return g;
}
export function scales(color = P.gold, s = 1) {
  const g = new THREE.Group();
  g.add(vpart({ pts: rrectPts(0.1 * s, 1.2 * s, 0.04 * s, 0, 0), color, outline: 0.04 * s }));
  g.add(vpart({ pts: rrectPts(0.7 * s, 0.12 * s, 0.05 * s, 0, -0.62 * s), color, outline: 0.04 * s }));
  const beam = vpart({ pts: rrectPts(1.5 * s, 0.09 * s, 0.04 * s, 0, 0.5 * s), color, outline: 0.04 * s, z: 0.01 }); g.add(beam);
  for (const sx of [-1, 1]) {
    g.add(vpart({ pts: strokePts([[sx * 0.7 * s, 0.5 * s], [sx * 0.7 * s, 0.05 * s]], 0.04 * s), color: shade(color, 0.8), outline: 0, z: 0.005 }));
    g.add(vpart({ pts: [...arcPts(sx * 0.7 * s, 0.05 * s, 0.32 * s, Math.PI, Math.PI * 2, 16)], color, outline: 0.04 * s, z: 0.02 }));
  }
  g.add(vpart({ pts: circlePts(0.1 * s, 16, 0, 0.62 * s), color, outline: 0.04 * s, z: 0.02 }));
  return g;
}
export function book(color = P.royal, s = 1) {
  const g = new THREE.Group();
  for (const sx of [-1, 1]) g.add(vpart({ pts: roundPoly([[0, -0.4], [sx * 0.62, -0.3], [sx * 0.62, 0.45], [0, 0.35]].map(([x, y]) => [x * s, y * s]), 0.04 * s), color: '#FFFFFF', shade: '#E6ECF5', mode: 2, p: [-sx, 0, -0.45 * s, 0], outline: 0.04 * s }));
  g.add(vpart({ pts: roundPoly([[-0.7, -0.46], [0, -0.52], [0.7, -0.46], [0.7, -0.36], [0, -0.44], [-0.7, -0.36]].map(([x, y]) => [x * s, y * s]), 0.03 * s), color, outline: 0.04 * s, z: -0.01 }));
  return g;
}
export function gradCap(s = 1) {
  return grp(vpart({ pts: roundPoly([[-0.8, 0.2], [0, 0.55], [0.8, 0.2], [0, -0.12]].map(([x, y]) => [x * s, y * s]), 0.04 * s), color: P.navy, outline: 0.04 * s, z: 0.01 }),
    vpart({ pts: roundPoly([[-0.45, 0.05], [0.45, 0.05], [0.42, -0.42], [-0.42, -0.42]].map(([x, y]) => [x * s, y * s]), 0.12 * s), color: P.navy, outline: 0.04 * s, z: 0 }),
    vpart({ pts: strokePts([[0.0, 0.2 * s], [0.62 * s, 0.05 * s], [0.62 * s, -0.4 * s]], 0.06 * s), color: P.yellow, outline: 0.02 * s, z: 0.02 }));
}
export function ramp(s = 1) {
  return grp(vpart({ pts: [[-0.8 * s, -0.45 * s], [0.8 * s, 0.2 * s], [0.8 * s, -0.45 * s]], color: P.concrete, outline: 0.04 * s }), vpart({ pts: strokePts([[-0.85 * s, -0.05 * s], [0.8 * s, 0.6 * s]], 0.08 * s), color: P.yellow, outline: 0.03 * s, z: 0.01 }));
}
export function speechBubble(w = 1.6, h = 0.9, color = '#FFFFFF', tail = -1, spiky = false) {
  let pts;
  if (spiky) { pts = []; const n = 22; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, r = i % 2 ? 1 : 1.18; pts.push([Math.cos(a) * w / 2 * r, Math.sin(a) * h / 2 * r]); } }
  else pts = rrectPts(w, h, h * 0.45);
  const tl = vpart({ pts: roundPoly([[tail * w * 0.15, -h * 0.35], [tail * w * 0.38, -h * 0.35], [tail * w * 0.42, -h * 0.85]], 0.03), color, outline: 0.04, z: -0.002 });
  return grp(vpart({ pts, color, outline: 0.045, z: 0 }), tl);
}
/** scribble "symbols" standing in for an insult — never real words */
export function grawlix(s = 1) {
  const g = new THREE.Group();
  g.add(vpart({ pts: strokePts([[-0.5, 0], [-0.35, 0.18], [-0.2, -0.15], [-0.05, 0.16], [0.1, -0.12]].map(([x, y]) => [x * s, y * s]), 0.07 * s), color: P.ink, outline: 0 }));
  const st = []; for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, r = i % 2 ? 0.08 : 0.18; st.push([0.35 * s + Math.cos(a) * r * s, Math.sin(a) * r * s]); }
  g.add(vpart({ pts: st, color: P.red, outline: 0 }));
  g.add(vpart({ pts: circlePts(0.05 * s, 12, 0.62 * s, -0.1 * s), color: P.ink, outline: 0 }));
  return g;
}
export function sparkle(color = P.yellow, s = 1) {
  const pts = []; for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 2, r = i % 2 ? 0.12 : 0.5; pts.push([Math.cos(a) * r * s, Math.sin(a) * r * s]); }
  return vpart({ pts: roundPoly(pts, 0.03 * s), color, outline: 0.03 * s });
}
export function arrow(len = 1.5, color = P.yellow, w = 0.18) {
  return grp(vpart({ pts: strokePts([[0, 0], [len - 0.25, 0]], w), color, outline: 0.04 }), vpart({ pts: roundPoly([[len - 0.35, 0.28], [len + 0.05, 0], [len - 0.35, -0.28]], 0.05), color, outline: 0.04, z: 0.001 }));
}
export function brick(w = 0.8, h = 0.4, color = '#C8553D') {
  return vpart({ pts: rrectPts(w, h, 0.06), color, shade: shade(color, 0.8), mode: 2, p: [0, -1, h * 0.15, 0], outline: 0.04 });
}
/** Pulsing highlight outline around a rectangle region (world units) */
export function highlightRect(w, h, color = P.red, thick = 0.08) {
  return vring({ outer: rrectPts(w + thick * 2, h + thick * 2, 0.22), inner: rrectPts(w, h, 0.16), color, outline: 0.03 });
}
export function magnifier(s = 1) {
  return grp(vring({ outer: circlePts(0.4 * s, 40), inner: circlePts(0.3 * s, 40), color: P.navy, outline: 0.03 * s }), vpart({ pts: circlePts(0.3 * s, 40), color: '#DDF3FF', outline: 0, z: -0.002, opacity: 0.6 }), vpart({ pts: strokePts([[0.3 * s, -0.3 * s], [0.62 * s, -0.62 * s]], 0.14 * s), color: P.navy, outline: 0.03 * s }));
}
