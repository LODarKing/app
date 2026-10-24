// Screen-space layer: a group locked to the camera so infographics can be laid
// out in "screen units" (1 unit = 100 px, x in [-5.4, 5.4], y in [-9.6, 9.6]).
import * as THREE from 'three';
import { P, shade } from '../core/palette.js';
import { vpart, rrectPts, circlePts } from '../core/vector.js';
import { rng } from '../core/math.js';

export function screenLayer(scene, z = 20) {
  const g = new THREE.Group(); g.position.z = z; scene.add(g);
  return { g, lock(cam) { g.position.set(cam.x, cam.y, z); g.scale.setScalar(1 / cam.zoom); g.rotation.z = cam.rot || 0; } };
}

/** Full-screen board background with soft dot pattern */
export function board(color = P.navy, accent = P.royal, seed = 4) {
  const g = new THREE.Group();
  g.add(vpart({ pts: rrectPts(11.6, 20.4, 0.01), color: shade(color, 1.18), shade: color, mode: 3, p: [-10, 10, 0, 0], outline: 0, z: -1 }));
  const r = rng(seed);
  for (let i = 0; i < 46; i++) {
    const x = -5.2 + r() * 10.4, y = -9.4 + r() * 18.8, s = 0.05 + r() * 0.14;
    g.add(vpart({ pts: circlePts(s, 14, x, y), color: i % 3 ? accent : P.turquoise, outline: 0, z: -0.99, opacity: 0.35 }));
  }
  return g;
}
