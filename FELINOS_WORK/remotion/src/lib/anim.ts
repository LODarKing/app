import { clamp, lerp } from './paths';
export const ss = (x: number) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const sm = (x: number) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
export const outBack = (x: number) => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
type V = number | number[];
/** piecewise smooth keys [[t, v], ...], held outside the range */
export function keys<T extends V>(t: number, k: [number, T][], ease = sm): T {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) {
    const [t0, v0] = k[i], [t1, v1] = k[i + 1];
    if (t <= t1) {
      const e = ease((t - t0) / (t1 - t0));
      return (Array.isArray(v0) ? (v0 as number[]).map((v, j) => lerp(v, (v1 as number[])[j], e)) : lerp(v0 as number, v1 as number, e)) as T;
    }
  }
  return k[k.length - 1][1];
}
export const blinkAt = (t: number, times: number[]) => { let b = 0; for (const b0 of times) { const x = (t - b0) / 0.17; if (x > 0 && x < 1) b = Math.max(b, Math.sin(x * Math.PI)); } return b; };
/** 2-bone IK in y-down coords: absolute bone angles (radians) */
export function solve2(sx: number, sy: number, tx: number, ty: number, L1: number, L2: number, bend = 1) {
  const dx = tx - sx, dy = ty - sy;
  const d = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(L1 - L2) + 1e-3), L1 + L2 - 1e-3);
  const base = Math.atan2(dy, dx);
  const alpha = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const a1 = base + bend * alpha;
  const ex = sx + Math.cos(a1) * L1, ey = sy + Math.sin(a1) * L1;
  return { a1, a2: Math.atan2(ty - ey, tx - ex), ex, ey };
}
export const deg = (r: number) => r * 180 / Math.PI;
