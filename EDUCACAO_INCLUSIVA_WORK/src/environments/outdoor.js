// Outdoor Pathfinder club grounds: sky, clouds, parallax hills, trees,
// clubhouse with an entrance that can be stairs or an accessible ramp.
import * as THREE from 'three';
import { P, shade } from '../core/palette.js';
import { vpart, rrectPts, circlePts, ellipsePts, blobPts, roundPoly, strokePts, trapPts } from '../core/vector.js';
import { rng } from '../core/math.js';

export function sky(top = P.skyTop, bottom = P.sky, w = 60, h = 60, y = 0, z = -40) {
  return vpart({ pts: rrectPts(w, h, 0.01, 0, y), color: top, shade: bottom, mode: 3, p: [y - h * 0.25, y + h * 0.25, 0, 0], outline: 0, z });
}

export function cloud(seed = 1, s = 1) {
  const r = rng(seed); const g = new THREE.Group();
  const n = 4 + Math.floor(r() * 3);
  const ctrl = [];
  for (let i = 0; i < n; i++) { const a = Math.PI * (i / (n - 1)); ctrl.push([Math.cos(a) * (1.1 + r() * 0.3) * s, (0.25 + Math.sin(a) * (0.55 + r() * 0.25)) * s]); }
  ctrl.push([-1.0 * s, -0.05 * s], [0, -0.12 * s], [1.0 * s, -0.05 * s]);
  g.add(vpart({ pts: blobPts(ctrl.reverse(), 80), color: P.cloud, shade: '#DDEFFA', mode: 2, p: [0, -1, -0.02 * s, 0], outline: 0, z: 0 }));
  return g;
}

export function tree(seed = 1, s = 1, z = 0, kind = 'round') {
  const r = rng(seed); const g = new THREE.Group();
  g.add(vpart({ pts: roundPoly([[-0.12 * s, 0], [0.12 * s, 0], [0.09 * s, 1.2 * s], [-0.09 * s, 1.2 * s]], 0.03), color: P.trunk, shade: shade(P.trunk, 0.8), mode: 2, p: [1, 0, 0.02, 0], z }));
  if (kind === 'pine') {
    for (let i = 0; i < 3; i++) g.add(vpart({ pts: roundPoly([[-0.85 * s + i * 0.18 * s, (0.7 + i * 0.55) * s], [0.85 * s - i * 0.18 * s, (0.7 + i * 0.55) * s], [0, (1.7 + i * 0.55) * s]], 0.1 * s), color: P.treeDark, shade: shade(P.treeDark, 0.82), mode: 2, p: [1, 0, 0.1, 0], z: z + 0.01 + i * 0.002 }));
  } else {
    const c = []; const n = 9;
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const rr = (0.95 + r() * 0.25) * s; c.push([Math.cos(a) * rr, 1.75 * s + Math.sin(a) * rr * 0.9]); }
    g.add(vpart({ pts: blobPts(c, 90), color: P.tree, shade: P.treeDark, mode: 1, p: [-0.3 * s, 2.0 * s, 0.95 * s, 0], z: z + 0.01 }));
  }
  return g;
}

export function hills(color, yBase, amp, seed, w = 50, z = -30, n = 7) {
  const r = rng(seed); const pts = [[-w / 2, yBase - 20]];
  for (let i = 0; i <= n * 4; i++) { const x = -w / 2 + (w * i) / (n * 4); pts.push([x, yBase + amp * (0.5 + 0.5 * Math.sin(i * 0.55 + seed)) + r() * amp * 0.25]); }
  pts.push([w / 2, yBase - 20]);
  return vpart({ pts: blobPts(pts, 200), color, outline: 0, z });
}

/** Flag on a pole: generic pennant in palette colours (not an official flag) */
export function flag(h = 4.2) {
  const g = new THREE.Group();
  g.add(vpart({ pts: rrectPts(0.09, h, 0.04, 0, h / 2), color: '#E8EEF5', outline: 0.022, z: 0 }));
  g.add(vpart({ pts: circlePts(0.09, 16, 0, h + 0.04), color: P.gold, outline: 0.018, z: 0.001 }));
  const cloth = new THREE.Group(); cloth.position.set(0.05, h - 0.12, 0); g.add(cloth);
  const segs = [];
  for (let i = 0; i < 6; i++) {
    const sgm = vpart({ pts: rrectPts(0.3, 0.9, 0.0, 0.15, -0.45), color: i % 2 ? P.yellow : P.royal, outline: 0, z: 0.002 });
    sgm.position.x = i * 0.29; cloth.add(sgm); segs.push(sgm);
  }
  return { g, wave(t) { segs.forEach((s, i) => { s.position.y = Math.sin(t * 3 - i * 0.7) * 0.06 * i; s.rotation.z = Math.cos(t * 3 - i * 0.7) * 0.04 * i; }); } };
}

/**
 * Clubhouse with a raised doorway. entrance(k): 0 = three steps, 1 = ramp with handrails.
 * Ground level y=0; door threshold at y = 0.66. Building centred at x=0.
 */
export function clubhouse({ w = 6.5, h = 4.2 } = {}) {
  const g = new THREE.Group();
  const floorY = 0.66;
  // body
  g.add(vpart({ pts: rrectPts(w, h, 0.06, 0, floorY + h / 2), color: P.wall, shade: shade(P.wall, 0.9), mode: 2, p: [1, 0, w * 0.3, 0], z: -6 }));
  g.add(vpart({ pts: roundPoly([[-w / 2 - 0.45, floorY + h - 0.05], [w / 2 + 0.45, floorY + h - 0.05], [0, floorY + h + 2.1]], 0.12), color: P.roof, shade: shade(P.roof, 0.82), mode: 2, p: [1, 0, 0.3, 0], z: -5.98 }));
  g.add(vpart({ pts: rrectPts(w + 0.3, floorY + 0.02, 0.03, 0, (floorY) / 2), color: P.stone, shade: P.stoneDark, mode: 2, p: [0, -1, -0.1, 0], z: -5.97 }));
  // sign board (generic text drawn as overlay elsewhere)
  g.add(vpart({ pts: rrectPts(3.0, 0.75, 0.12, 0, floorY + h + 0.55), color: P.navy, z: -5.9 }));
  // windows
  for (const sx of [-1, 1]) {
    const wx = sx * w * 0.32;
    g.add(vpart({ pts: rrectPts(1.25, 1.15, 0.12, wx, floorY + h * 0.58), color: '#BFE8F7', shade: '#8FD0EA', mode: 2, p: [1, -1, 0.2, 0], z: -5.95 }));
    g.add(vpart({ pts: rrectPts(0.06, 1.15, 0.0, wx, floorY + h * 0.58), color: P.wood, outline: 0, z: -5.94 }));
    g.add(vpart({ pts: rrectPts(1.25, 0.06, 0.0, wx, floorY + h * 0.58), color: P.wood, outline: 0, z: -5.94 }));
  }
  // door (wide accessible doorway)
  const door = vpart({ pts: rrectPts(1.5, 2.55, 0.14, 0, floorY + 1.28), color: P.royal, shade: shade(P.royal, 0.8), mode: 2, p: [1, 0, 0.35, 0], z: -5.93 });
  g.add(door);
  g.add(vpart({ pts: circlePts(0.07, 12, 0.5, floorY + 1.2), color: P.gold, outline: 0.015, z: -5.92 }));
  // entrance: steps & ramp, both built, blended by entrance(k)
  const steps = new THREE.Group(); g.add(steps);
  const sw = 2.1;
  for (let i = 0; i < 3; i++) {
    const top = floorY * (3 - i) / 3;
    steps.add(vpart({ pts: rrectPts(sw + i * 0.3, top, 0.03, 0, top / 2), color: i % 2 ? '#D3D8E2' : P.concrete, shade: P.concreteDark, mode: 2, p: [0, -1, top / 2 - 0.08 - top + 0.16, 0], z: -5.6 + i * 0.05 }));
  }
  const ramp = new THREE.Group(); g.add(ramp);
  const rampLen = 4.4;   // gentle slope (~8%)
  ramp.add(vpart({ pts: [[w / 2 - 0.2, floorY], [w / 2 - 0.2, 0], [w / 2 + rampLen, 0], [w / 2 + rampLen, 0.03]], color: P.concrete, shade: P.concreteDark, mode: 2, p: [0, -1, -0.3, 0], z: -5.4 }));
  ramp.add(vpart({ pts: rrectPts(1.2, floorY, 0.02, w / 2 - 0.75, floorY / 2), color: P.concrete, z: -5.41 }));
  for (const yy of [0.62, 0.32]) ramp.add(vpart({ pts: strokePts([[w / 2 - 1.1, floorY + 0.9 - (0.62 - yy)], [w / 2 + rampLen - 0.15, 0.9 - (0.62 - yy) + 0.03]], 0.06), color: P.yellow, outline: 0.018, z: -5.35 }));
  for (const x of [w / 2 - 1.1, w / 2 + 1.3, w / 2 + rampLen - 0.15]) {
    const yTop = x < w / 2 ? floorY + 0.9 : 0.9 + floorY * (1 - (x - (w / 2 - 0.2)) / (rampLen + 0.2));
    ramp.add(vpart({ pts: strokePts([[x, yTop], [x, x < w / 2 ? floorY : floorY * (1 - (x - (w / 2 - 0.2)) / (rampLen + 0.2))]], 0.07), color: '#7E8AA0', outline: 0.016, z: -5.36 }));
  }
  // accessibility marker: a plain blue tile with a wheelchair pictogram is a standard
  // public sign (ISO 7001 / ISA). Drawn as simple geometry.
  const isa = new THREE.Group(); isa.position.set(w / 2 + 0.6, floorY + 2.2, -5.3); ramp.add(isa);
  isa.add(vpart({ pts: rrectPts(0.75, 0.75, 0.08), color: '#1F5FBF', outline: 0.02, z: 0 }));
  isa.add(vpart({ pts: circlePts(0.065, 14, -0.02, 0.24), color: '#FFFFFF', outline: 0, z: 0.002 }));
  isa.add(vpart({ pts: strokePts([[-0.06, 0.14], [-0.06, -0.02], [0.12, -0.02], [0.17, -0.2]], 0.07), color: '#FFFFFF', outline: 0, z: 0.002 }));
  isa.add(vpart({ pts: strokePts([[-0.06, 0.08], [0.1, 0.08]], 0.05), color: '#FFFFFF', outline: 0, z: 0.002 }));
  const wh = []; for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 1.55 + 1.2; wh.push([-0.04 + Math.cos(a) * 0.19, -0.1 + Math.sin(a) * 0.19]); }
  isa.add(vpart({ pts: strokePts(wh, 0.055, true), color: '#FFFFFF', outline: 0, z: 0.002 }));
  return {
    g, floorY, door, steps, ramp, rampStart: w / 2 + rampLen, rampTop: w / 2 - 0.2, rampLen,
    entrance(k) {
      ramp.visible = k > 0.001; ramp.scale.set(1, Math.max(0.001, k), 1);
    },
    /** height of the walkable surface at x (ramp side) */
    rampY(x) { const t = (x - (w / 2 - 0.2)) / (rampLen); return x < w / 2 - 0.2 ? floorY : Math.max(0, floorY * (1 - t)); },
  };
}

/** Ground strip */
export function ground(color = P.grass, y = 0, w = 80, depth = 30, z = -20) {
  return vpart({ pts: rrectPts(w, depth, 0.01, 0, y - depth / 2), color, shade: P.grassDark, mode: 3, p: [y - depth, y, 0, 0], outline: 0, z });
}

/**
 * Side-staged clubhouse: front facade with a raised porch; the porch is reached
 * from the left by 3 steps or (when entrance(k)=1) by a gentle ramp with handrails.
 * Porch top at y = H. Facade spans x in [x0, x0 + w].
 */
export function clubhouseSide({ x0 = 0, w = 7.5, h = 4.4, H = 0.92, z = -6 } = {}) {
  const g = new THREE.Group();
  const add = (o) => (g.add(o), o);
  const doorX = x0 + 1.9;
  add(vpart({ pts: rrectPts(w, h, 0.06, x0 + w / 2, H + h / 2), color: P.wall, shade: shade(P.wall, 0.9), mode: 2, p: [1, 0, w * 0.3, 0], z }));
  // wooden siding lines
  for (let i = 1; i < 7; i++) add(vpart({ pts: rrectPts(w - 0.1, 0.03, 0.0, x0 + w / 2, H + i * h / 7), color: shade(P.wall, 0.93), outline: 0, z: z + 0.001 }));
  add(vpart({ pts: roundPoly([[x0 - 0.5, H + h - 0.05], [x0 + w + 0.5, H + h - 0.05], [x0 + w + 0.1, H + h + 1.6], [x0 - 0.1, H + h + 1.6]], 0.1), color: P.roof, shade: shade(P.roof, 0.82), mode: 2, p: [0, -1, -(H + h + 0.3), 0], z: z + 0.01 }));
  add(vpart({ pts: rrectPts(w + 1.0, 0.18, 0.06, x0 + w / 2, H + h), color: shade(P.roof, 0.7), z: z + 0.012 }));
  // sign plate with a generic tent + tree pictogram (no text, no logo)
  const sx = x0 + w * 0.62, sy = H + h * 0.8;
  add(vpart({ pts: rrectPts(2.6, 0.8, 0.14, sx, sy), color: P.navy, z: z + 0.02 }));
  add(vpart({ pts: roundPoly([[sx - 0.95, sy - 0.25], [sx - 0.35, sy - 0.25], [sx - 0.65, sy + 0.25]], 0.03), color: P.yellow, outline: 0, z: z + 0.022 }));
  add(vpart({ pts: circlePts(0.2, 20, sx + 0.05, sy + 0.08), color: P.green, outline: 0, z: z + 0.022 }));
  add(vpart({ pts: rrectPts(0.06, 0.2, 0.02, sx + 0.05, sy - 0.17), color: P.wood, outline: 0, z: z + 0.021 }));
  add(vpart({ pts: rrectPts(0.75, 0.1, 0.04, sx + 0.6, sy + 0.12), color: P.turquoise, outline: 0, z: z + 0.022 }));
  add(vpart({ pts: rrectPts(0.55, 0.1, 0.04, sx + 0.5, sy - 0.08), color: '#FFFFFF', outline: 0, z: z + 0.022 }));
  // windows
  for (const wx of [x0 + w * 0.5, x0 + w * 0.8]) {
    add(vpart({ pts: rrectPts(1.2, 1.15, 0.12, wx, H + h * 0.45), color: '#BFE8F7', shade: '#8FD0EA', mode: 2, p: [1, -1, 0.2, 0], z: z + 0.02 }));
    add(vpart({ pts: rrectPts(0.06, 1.15, 0.0, wx, H + h * 0.45), color: P.wood, outline: 0, z: z + 0.021 }));
    add(vpart({ pts: rrectPts(1.2, 0.06, 0.0, wx, H + h * 0.45), color: P.wood, outline: 0, z: z + 0.021 }));
  }
  // wide doorway (open, warm interior)
  add(vpart({ pts: rrectPts(1.7, 2.7, 0.12, doorX, H + 1.35), color: '#FFD98A', shade: '#F2B65A', mode: 3, p: [H, H + 2.7, 0, 0], z: z + 0.02 }));
  const doorLeaf = add(vpart({ pts: rrectPts(0.5, 2.6, 0.08, doorX + 1.05, H + 1.3), color: P.royal, shade: shade(P.royal, 0.8), mode: 2, p: [1, 0, 0.1, 0], z: z + 0.025 }));
  // porch deck (front band) + posts
  add(vpart({ pts: rrectPts(w + 0.4, H, 0.03, x0 + w / 2, H / 2), color: P.wood, shade: P.woodDark, mode: 2, p: [0, -1, -H / 2 + 0.12, 0], z: z + 3 }));
  add(vpart({ pts: rrectPts(w + 0.5, 0.1, 0.03, x0 + w / 2, H - 0.02), color: shade(P.wood, 1.08), z: z + 3.01 }));
  // steps (side profile, rising to the right)
  const steps = new THREE.Group(); g.add(steps);
  const n = 4, rise = H / n, run = 0.3;
  for (let i = 0; i < n; i++) {
    const top = rise * (i + 1);
    steps.add(vpart({ pts: rrectPts(run * (n - i), top, 0.02, x0 - 0.2 - (run * (n - i)) / 2, top / 2), color: i % 2 ? '#D3D8E2' : P.concrete, shade: P.concreteDark, mode: 2, p: [0, -1, -top / 2 + 0.08, 0], z: z + 3.05 + (n - i) * 0.01 }));
  }
  // ramp (1:8 slope look) with handrails, built from the porch edge leftward
  const ramp = new THREE.Group(); g.add(ramp);
  const L = 6.4, rx1 = x0 - 0.2, rx0 = rx1 - L;
  ramp.add(vpart({ pts: [[rx0, 0], [rx1, H], [rx1, 0]], color: P.concrete, shade: P.concreteDark, mode: 2, p: [0, -1, -0.15, 0], z: z + 3.2 }));
  ramp.add(vpart({ pts: strokePts([[rx0, 0.0], [rx1, H]], 0.07), color: shade(P.concrete, 1.06), outline: 0.016, z: z + 3.21 }));
  for (const yy of [0.95, 0.6]) ramp.add(vpart({ pts: strokePts([[rx0 - 0.3, yy], [rx0, yy], [rx1, H + yy], [rx1 + 0.4, H + yy]], 0.06), color: P.yellow, outline: 0.016, z: z + 3.6 }));
  for (let i = 0; i <= 5; i++) { const x = rx0 + (L * i) / 5, gy = (H * i) / 5; ramp.add(vpart({ pts: strokePts([[x, gy], [x, gy + 0.95]], 0.06), color: '#7E8AA0', outline: 0.014, z: z + 3.59 })); }
  const api = {
    g, H, doorX, doorLeaf, steps, ramp, rampX0: rx0, rampX1: rx1, stepX0: x0 - 0.2 - run * n, stepX1: x0 - 0.2, porchZ: z + 3,
    k: 0,
    entrance(k) { this.k = k; ramp.visible = k > 0.001; ramp.scale.set(1, Math.max(0.001, k), 1); steps.visible = k < 0.999; steps.position.y = -k * H * 1.05; },
    /** walkable surface height at x */
    ground(x) {
      if (x >= rx1) return H;
      if (this.k > 0.5) return x <= rx0 ? 0 : (H * (x - rx0)) / L;
      const sx0 = x0 - 0.2 - run * n; if (x <= sx0) return 0;
      const i = Math.min(n - 1, Math.floor((x - sx0) / run)); return rise * (i + 1);
    },
  };
  api.entrance(0);
  return api;
}

/** A layered outdoor backdrop: sky, clouds, far hills, near hills, ground and trees */
export function backdrop(scene, { seed = 3, groundY = 0, w = 70, trees = [] } = {}) {
  scene.add(sky(P.skyTop, '#BDEBFA', w, 40, groundY + 8, -40));
  const clouds = [];
  for (let i = 0; i < 5; i++) { const c = cloud(seed + i, 0.9 + (i % 3) * 0.3); c.position.set(-14 + i * 7, groundY + 8.5 + (i % 2) * 1.6, -38); scene.add(c); clouds.push(c); }
  scene.add(hills(P.hillFar, groundY + 1.2, 1.6, seed, w, -30));
  scene.add(hills(P.hill, groundY + 0.2, 1.1, seed + 2, w, -25));
  scene.add(ground(P.grass, groundY + 0.02, w, 20, -20));
  for (const [x, s, kind, z] of trees) { const tr = tree(seed + Math.round(x * 10), s, z ?? -15, kind); tr.position.set(x, groundY, 0); scene.add(tr); }
  return { clouds, drift(t) { clouds.forEach((c, i) => { c.position.x = -14 + i * 7 + ((t * 0.15 * (1 + i * 0.1)) % 6); }); } };
}
