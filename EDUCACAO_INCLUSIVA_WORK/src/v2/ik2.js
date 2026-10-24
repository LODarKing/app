// Two-bone IK in sheet coordinates (y down). Returns absolute bone angles (atan2 convention)
// and the joint position. bend = +1 / -1 picks the side the elbow/knee bends to.
export function solve2(sx, sy, tx, ty, L1, L2, bend = 1) {
  const dx = tx - sx, dy = ty - sy;
  const d = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(L1 - L2) + 1e-3), L1 + L2 - 1e-3);
  const base = Math.atan2(dy, dx);
  const cA = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
  const alpha = Math.acos(Math.max(-1, Math.min(1, cA)));
  const a1 = base + bend * alpha;
  const ex = sx + Math.cos(a1) * L1, ey = sy + Math.sin(a1) * L1;
  const a2 = Math.atan2(ty - ey, tx - ex);
  return { a1, a2, ex, ey };
}
