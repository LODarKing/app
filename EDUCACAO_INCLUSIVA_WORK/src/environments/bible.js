// Historical settings for the biblical scenes (plausible 1st-century / Iron Age look).
import * as THREE from 'three';
import { P, shade } from '../core/palette.js';
import { vpart, rrectPts, circlePts, strokePts, roundPoly, blobPts, arcPts, ellipsePts, curvePts } from '../core/vector.js';
import { sky } from './outdoor.js';
import { rng } from '../core/math.js';

const STONE = '#E6D2AA', STONE_D = '#C9B184', STONE_L = '#F2E4C4';

export function warmSky(scene, y = 8, w = 80) { scene.add(sky('#F6C88A', '#FBE7C0', w, 40, y, -40)); }

export function cityWall(scene, { y = 0, x0 = -30, x1 = 30, z = -34, color = '#D8BE90' } = {}) {
  const g = new THREE.Group(); scene.add(g);
  g.add(vpart({ pts: rrectPts(x1 - x0, 2.2, 0.02, (x0 + x1) / 2, y + 1.1), color, outline: 0, z }));
  for (let x = x0; x < x1; x += 0.7) g.add(vpart({ pts: rrectPts(0.4, 0.4, 0.02, x, y + 2.35), color, outline: 0, z }));
  const r = rng(7);
  for (let i = 0; i < 6; i++) { const tx = x0 + 4 + i * ((x1 - x0) / 6); g.add(vpart({ pts: rrectPts(1.4, 3.6 + r() * 1.5, 0.04, tx, y + 1.8), color: shade(color, 0.95), outline: 0, z: z + 0.01 })); }
  return g;
}

export function column(h = 4.2, w = 0.45, color = STONE) {
  const g = new THREE.Group();
  g.add(vpart({ pts: rrectPts(w * 1.5, 0.22, 0.04, 0, 0.11), color: STONE_D, z: 0 }));
  g.add(vpart({ pts: rrectPts(w, h - 0.5, 0.02, 0, h / 2), color, shade: STONE_D, mode: 2, p: [1, 0, w * 0.15, 0], z: -0.01 }));
  for (const fx of [-0.12, 0.0, 0.12]) g.add(vpart({ pts: rrectPts(0.03, h - 0.7, 0.01, fx * w * 2, h / 2), color: STONE_D, outline: 0, z: -0.005 }));
  g.add(vpart({ pts: rrectPts(w * 1.6, 0.3, 0.06, 0, h - 0.2), color: STONE_L, z: 0 }));
  return g;
}

/** Colonnade (porticoes) with entablature and shaded interior */
export function colonnade(scene, { x0 = -12, n = 9, gap = 2.6, y = 0, h = 4.4, z = -12 } = {}) {
  const g = new THREE.Group(); scene.add(g);
  const x1 = x0 + gap * (n - 1);
  g.add(vpart({ pts: rrectPts(x1 - x0 + 1.2, h, 0.02, (x0 + x1) / 2, y + h / 2), color: '#B8955F', shade: '#9A7A4A', mode: 3, p: [y, y + h, 0, 0], outline: 0, z: z - 0.5 }));
  for (let i = 0; i < n; i++) { const c = column(h, 0.48); c.position.set(x0 + i * gap, y, z); g.add(c); }
  g.add(vpart({ pts: rrectPts(x1 - x0 + 1.6, 0.55, 0.04, (x0 + x1) / 2, y + h + 0.2), color: STONE_L, shade: STONE_D, mode: 2, p: [0, -1, 0.05, 0], z: z + 0.02 }));
  g.add(vpart({ pts: rrectPts(x1 - x0 + 1.9, 0.25, 0.04, (x0 + x1) / 2, y + h + 0.58), color: STONE_D, z: z + 0.021 }));
  return g;
}

/** Pool with steps and moving ripples. Water surface top at y. */
export function pool(scene, { x = 0, y = 0, w = 9, d = 2.2, z = -2 } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, 0); scene.add(g);
  g.add(vpart({ pts: rrectPts(w + 0.6, d + 0.4, 0.1, 0, y - d / 2), color: STONE_D, z }));
  g.add(vpart({ pts: rrectPts(w, d, 0.06, 0, y - d / 2 - 0.1), color: P.water, shade: P.waterDark, mode: 3, p: [y - d, y, 0, 0], outline: 0.03, z: z + 0.01 }));
  for (let i = 0; i < 3; i++) g.add(vpart({ pts: rrectPts(1.4 - i * 0.3, 0.18, 0.03, -w / 2 + 0.7 - i * 0.15 + 0.9, y - 0.2 - i * 0.3), color: STONE_L, outline: 0.02, z: z + 0.02 + i * 0.001 }));
  const rip = [];
  for (let i = 0; i < 7; i++) { const r = vpart({ pts: strokePts([[-0.5, 0], [0.5, 0]], 0.05), color: '#DDF6FF', outline: 0, z: z + 0.03, opacity: 0.8 }); g.add(r); rip.push(r); }
  return { g, animate(t) { rip.forEach((r, i) => { const ph = (t * 0.35 + i * 0.37) % 1; r.position.set(-w / 2 + 1 + ((i * 1.37) % 1) * (w - 2) + Math.sin(t + i) * 0.3, y - 0.3 - (i % 3) * 0.55, 0); r.scale.set(0.6 + ph * 1.2, 1, 1); r.userData.fill.material.uniforms.uOpacity.value = Math.sin(ph * Math.PI) * 0.8; }); } };
}

export function pavement(scene, { y = 0, w = 80, z = -20, color = '#D9C49A' } = {}) {
  const g = new THREE.Group(); scene.add(g);
  g.add(vpart({ pts: rrectPts(w, 14, 0.01, 0, y - 7), color, shade: shade(color, 0.8), mode: 3, p: [y - 10, y, 0, 0], outline: 0, z }));
  for (let i = 0; i < 6; i++) g.add(vpart({ pts: rrectPts(w, 0.03, 0, 0, y - 0.5 - i * 0.9 - i * i * 0.08), color: shade(color, 0.85), outline: 0, z: z + 0.01 }));
  return g;
}

/** Background seated figures (simple silhouettes) resting under the porticoes */
export function restingFigures(scene, xs, { y = 0, z = -11.5, seed = 3 } = {}) {
  const r = rng(seed); const cols = ['#9C8B6E', '#7E8C9A', '#A07A5C', '#8C7AA0', '#6E8C74'];
  for (const x of xs) {
    const c = cols[Math.floor(r() * cols.length)];
    scene.add(vpart({ pts: blobPts([[-0.45, 0], [0.55, 0], [0.4, 0.75], [0.1, 1.05], [-0.3, 0.9]].map(([a, b]) => [x + a, y + b]), 40), color: c, outline: 0.025, z }));
    scene.add(vpart({ pts: circlePts(0.24, 20, x + 0.05, y + 1.25), color: '#B98A62', outline: 0.025, z: z + 0.01 }));
    scene.add(vpart({ pts: blobPts([[-0.28, 1.2], [0.0, 1.55], [0.3, 1.25], [0.28, 0.95], [-0.3, 0.95]].map(([a, b]) => [x + a, y + b]), 30), color: shade(c, 1.2), outline: 0.02, z: z + 0.02 }));
  }
}

export function mat(color = '#C79B5B') {
  const g = new THREE.Group();
  g.add(vpart({ pts: rrectPts(2.2, 0.16, 0.05), color, shade: shade(color, 0.8), mode: 2, p: [0, -1, 0, 0], z: 0 }));
  for (let i = 0; i < 6; i++) g.add(vpart({ pts: rrectPts(0.05, 0.14, 0, -0.9 + i * 0.36, 0), color: shade(color, 0.75), outline: 0, z: 0.002 }));
  return g;
}
export function rolledMat(color = '#C79B5B') {
  const g = new THREE.Group();
  g.add(vpart({ pts: rrectPts(0.9, 0.3, 0.15), color, shade: shade(color, 0.8), mode: 2, p: [0, -1, 0, 0], z: 0 }));
  g.add(vpart({ pts: circlePts(0.15, 16, 0.45, 0), color: shade(color, 0.9), outline: 0.02, z: 0.002 }));
  g.add(vpart({ pts: rrectPts(0.06, 0.32, 0.02, 0.1, 0), color: '#7A4A2A', outline: 0, z: 0.004 }));
  return g;
}

/** Palace interior: columns, drapes, dais with throne */
export function palace(scene, { y = 0 } = {}) {
  const g = new THREE.Group(); scene.add(g);
  g.add(vpart({ pts: rrectPts(60, 14, 0.01, 0, y + 7), color: '#E9D9B8', shade: '#D2BC92', mode: 3, p: [y, y + 10, 0, 0], outline: 0, z: -30 }));
  g.add(vpart({ pts: rrectPts(60, 12, 0.01, 0, y - 6), color: '#B58A5A', shade: '#8C6440', mode: 3, p: [y - 8, y, 0, 0], outline: 0, z: -29 }));
  for (let i = 0; i < 12; i++) g.add(vpart({ pts: rrectPts(60, 0.03, 0, 0, y - 0.6 - i * 0.7 - i * i * 0.05), color: '#9A7148', outline: 0, z: -28.9 }));
  for (let i = -4; i <= 4; i++) { const c = column(6.4, 0.6, '#EFE0C0'); c.position.set(i * 4.2, y, -20); g.add(c); }
  for (let i = -4; i < 4; i++) {
    const x = i * 4.2 + 2.1;
    g.add(vpart({ pts: blobPts([[-1.7, 6.2], [1.7, 6.2], [1.5, 4.0], [0.8, 2.0], [0.0, 3.2], [-0.8, 2.0], [-1.5, 4.0]].map(([a, b]) => [x + a, y + b]), 60), color: '#7E3A7E', shade: '#5E2A5E', mode: 2, p: [1, 0, 0.3, 0], z: -21 }));
    g.add(vpart({ pts: rrectPts(3.6, 0.25, 0.06, x, y + 6.15), color: P.gold, z: -20.9 }));
  }
  return g;
}
export function throne() {
  const g = new THREE.Group();
  g.add(vpart({ pts: rrectPts(3.8, 0.5, 0.06, 0, 0.25), color: '#C9A36A', shade: '#A07E4A', mode: 2, p: [0, -1, 0, 0], z: -0.5 }));
  g.add(vpart({ pts: roundPoly([[-0.85, 0.5], [0.85, 0.5], [0.85, 3.0], [0.5, 3.4], [-0.5, 3.4], [-0.85, 3.0]], 0.12), color: P.gold, shade: shade(P.gold, 0.8), mode: 2, p: [1, 0, 0.3, 0], z: -0.45 }));
  g.add(vpart({ pts: rrectPts(1.3, 2.2, 0.15, 0, 2.0), color: '#A3263A', outline: 0, z: -0.44 }));
  g.add(vpart({ pts: rrectPts(1.9, 0.3, 0.08, 0, 1.25), color: P.gold, z: -0.1 }));
  return g;
}
/** Humble house in Lo-Debar */
export function humbleHouse(scene, { x = 0, y = 0, z = -8 } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
  g.add(vpart({ pts: rrectPts(6.5, 3.6, 0.1, 0, 1.8), color: '#D9B98A', shade: '#BF9D6C', mode: 2, p: [1, 0, 1.5, 0], z: 0 }));
  g.add(vpart({ pts: rrectPts(7.0, 0.3, 0.05, 0, 3.65), color: '#8C6440', z: 0.01 }));
  g.add(vpart({ pts: roundPoly([[-0.7, 0], [0.7, 0], [0.7, 2.1], [0, 2.5], [-0.7, 2.1]], 0.08), color: '#5A3A22', z: 0.02 }));
  g.add(vpart({ pts: rrectPts(0.9, 0.8, 0.08, 2.0, 2.2), color: '#5A3A22', z: 0.02 }));
  return g;
}
export function palm(s = 1) {
  const g = new THREE.Group();
  g.add(vpart({ pts: strokePts(curvePts([[0, 0], [0.15 * s, 1.6 * s], [0.05 * s, 3.2 * s]], 20), 0.28 * s), color: '#9A6B3E', z: 0 }));
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; g.add(vpart({ pts: blobPts([[0, 0], [Math.cos(a) * 0.9 * s, Math.sin(a) * 0.35 * s + 0.15 * s], [Math.cos(a) * 1.7 * s, Math.sin(a) * 0.5 * s - 0.25 * s], [Math.cos(a) * 0.9 * s, Math.sin(a) * 0.25 * s - 0.05 * s]].map(([a2, b]) => [a2 + 0.05 * s, b + 3.2 * s]), 30), color: P.treeDark, z: 0.01 })); }
  return g;
}
