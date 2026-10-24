// 2D two-bone IK. Joint angle convention for the whole rig: angle 0 means the
// bone points straight down (-y); positive angles rotate counter-clockwise, so
// a positive shoulder angle swings the hand toward +x.
import * as THREE from 'three';

/** Returns [rootAngle, midAngle] so that a chain of lengths a,b reaches (dx,dy).
 *  bend = +1 or -1 chooses the elbow/knee side. */
export function solve2(a, b, dx, dy, bend = 1) {
  const d = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(a - b) + 1e-4), a + b - 1e-4);
  const phi = Math.atan2(dx, -dy);
  const cA = (a * a + d * d - b * b) / (2 * a * d);
  const alpha = Math.acos(Math.max(-1, Math.min(1, cA)));
  const cB = (a * a + b * b - d * d) / (2 * a * b);
  const beta = Math.acos(Math.max(-1, Math.min(1, cB)));
  return [phi - bend * alpha, bend * (Math.PI - beta)];
}

const _v = new THREE.Vector3();
/** Express a world-space point in the local frame of `obj` (its own frame). */
export function toLocal(obj, x, y) {
  obj.updateWorldMatrix(true, false);
  _v.set(x, y, 0);
  obj.worldToLocal(_v);
  return [_v.x, _v.y];
}
export function worldPos(obj) {
  obj.updateWorldMatrix(true, false);
  const v = new THREE.Vector3(); obj.getWorldPosition(v); return [v.x, v.y];
}
