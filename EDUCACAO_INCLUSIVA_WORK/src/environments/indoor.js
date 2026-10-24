// Interior sets: club activity room, table, bulletin board, classroom bits.
import * as THREE from 'three';
import { P, shade } from '../core/palette.js';
import { vpart, rrectPts, circlePts, strokePts, roundPoly } from '../core/vector.js';
import { rng } from '../core/math.js';

export function room(scene, { x0 = -14, x1 = 14, wall = '#DCE8F2', floor = '#C9A27A', floorY = 0, h = 14, seed = 5, windows = [], boards = [] } = {}) {
  const g = new THREE.Group(); scene.add(g);
  const w = x1 - x0, cx = (x0 + x1) / 2;
  g.add(vpart({ pts: rrectPts(w, h, 0.01, cx, floorY + h / 2), color: wall, shade: shade(wall, 0.9), mode: 3, p: [floorY, floorY + h, 0, 0], outline: 0, z: -30 }));
  g.add(vpart({ pts: rrectPts(w, 0.35, 0.01, cx, floorY + 0.17), color: shade(wall, 0.75), outline: 0, z: -29.9 }));
  g.add(vpart({ pts: rrectPts(w, 12, 0.01, cx, floorY - 6), color: floor, shade: shade(floor, 0.78), mode: 3, p: [floorY - 6, floorY, 0, 0], outline: 0, z: -29.8 }));
  const r = rng(seed);
  for (let i = 0; i < 14; i++) g.add(vpart({ pts: rrectPts(w, 0.025, 0.0, cx, floorY - 0.4 - i * 0.55 - r() * 0.05), color: shade(floor, 0.88), outline: 0, z: -29.7 }));
  for (const wx of windows) {
    g.add(vpart({ pts: rrectPts(2.2, 2.0, 0.12, wx, floorY + 4.6), color: '#BFE8F7', shade: '#8FD0EA', mode: 2, p: [1, -1, 0.3, 0], z: -29 }));
    g.add(vpart({ pts: rrectPts(0.07, 2.0, 0, wx, floorY + 4.6), color: '#FFFFFF', outline: 0, z: -28.99 }));
    g.add(vpart({ pts: rrectPts(2.2, 0.07, 0, wx, floorY + 4.6), color: '#FFFFFF', outline: 0, z: -28.99 }));
  }
  for (const bx of boards) {
    g.add(vpart({ pts: rrectPts(2.8, 1.9, 0.08, bx, floorY + 4.5), color: '#C98B4E', z: -29 }));
    g.add(vpart({ pts: rrectPts(2.55, 1.65, 0.04, bx, floorY + 4.5), color: '#E8C99B', outline: 0, z: -28.99 }));
    const cols = [P.yellow, '#FFFFFF', P.turquoise, P.pink, '#FFFFFF'];
    for (let i = 0; i < 5; i++) {
      const px = bx - 0.9 + (i % 3) * 0.85 + r() * 0.1, py = floorY + 4.85 - Math.floor(i / 3) * 0.75;
      g.add(vpart({ pts: rrectPts(0.6, 0.55, 0.03, px, py), color: cols[i], outline: 0.015, z: -28.98 }));
      g.add(vpart({ pts: circlePts(0.05, 10, px, py + 0.22), color: P.red, outline: 0, z: -28.97 }));
    }
  }
  return g;
}

export function table(w = 3, h = 1.25, color = P.wood) {
  const g = new THREE.Group();
  g.add(vpart({ pts: rrectPts(w, 0.16, 0.06, 0, h), color, shade: shade(color, 0.8), mode: 2, p: [0, -1, 0, 0], z: 0 }));
  for (const s of [-1, 1]) g.add(vpart({ pts: rrectPts(0.12, h, 0.04, s * (w / 2 - 0.25), h / 2), color: shade(color, 0.75), z: -0.01 }));
  return g;
}

/** Big banquet table seen from the front with a cloth */
export function banquetTable(w = 6, h = 1.3) {
  const g = new THREE.Group();
  g.add(vpart({ pts: rrectPts(w, 0.2, 0.06, 0, h), color: '#8C5A34', z: 0 }));
  g.add(vpart({ pts: roundPoly([[-w / 2, h + 0.05], [w / 2, h + 0.05], [w / 2 - 0.1, h - 0.9], [-w / 2 + 0.1, h - 0.9]], 0.06), color: '#F3EAD6', shade: '#E0D2B4', mode: 2, p: [0, -1, -h + 0.5, 0], z: 0.01 }));
  g.add(vpart({ pts: rrectPts(w - 0.4, 0.12, 0.04, 0, h - 0.82), color: P.gold, outline: 0, z: 0.012 }));
  return g;
}
