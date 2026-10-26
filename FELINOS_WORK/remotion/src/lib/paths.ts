// SVG path helpers (pure functions; y axis points down).
export const f = (n: number) => (Math.round(n * 100) / 100).toString();
type P = number[];
/** smooth closed curve; points flagged [x, y, 1] become corners */
export function shape(pts: P[]): string {
  const n = pts.length; let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  const tan = (i: number) => {
    const p = pts[(i + n) % n]; if (p[2]) return [0, 0];
    const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
    return [(b[0] - a[0]) / 6, (b[1] - a[1]) / 6];
  };
  for (let i = 0; i < n; i++) {
    const p1 = pts[i], p2 = pts[(i + 1) % n], t1 = tan(i), t2 = tan(i + 1);
    d += ` C${f(p1[0] + t1[0])} ${f(p1[1] + t1[1])} ${f(p2[0] - t2[0])} ${f(p2[1] - t2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + ' Z';
}
export function curve(pts: P[]): string {
  const n = pts.length; let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}
export const poly = (pts: P[], close = false) => 'M' + pts.map((p) => `${f(p[0])} ${f(p[1])}`).join(' L') + (close ? ' Z' : '');
export const rrect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${f(x + r)} ${f(y)} L${f(x + w - r)} ${f(y)} Q${f(x + w)} ${f(y)} ${f(x + w)} ${f(y + r)} L${f(x + w)} ${f(y + h - r)} Q${f(x + w)} ${f(y + h)} ${f(x + w - r)} ${f(y + h)} L${f(x + r)} ${f(y + h)} Q${f(x)} ${f(y + h)} ${f(x)} ${f(y + h - r)} L${f(x)} ${f(y + r)} Q${f(x)} ${f(y)} ${f(x + r)} ${f(y)} Z`;
export function ellipse(cx: number, cy: number, rx: number, ry: number) {
  return `M${f(cx - rx)} ${f(cy)} A${f(rx)} ${f(ry)} 0 1 0 ${f(cx + rx)} ${f(cy)} A${f(rx)} ${f(ry)} 0 1 0 ${f(cx - rx)} ${f(cy)} Z`;
}
export const circle = (cx: number, cy: number, r: number) => ellipse(cx, cy, r, r);
/** wavy/curly closed outline: base polygon resampled into n bumps of height amp */
export function scallop(pts: P[], n: number, amp: number, seed = 1): string {
  const segs: [P, P, number][] = []; let L = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push([a, b, l]); L += l; }
  const at = (s: number): P => { s = ((s % L) + L) % L; for (const [a, b, l] of segs) { if (s <= l) return [a[0] + (b[0] - a[0]) * s / l, a[1] + (b[1] - a[1]) * s / l]; s -= l; } return pts[0]; };
  let area = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const sg = area > 0 ? 1 : -1;
  let r = seed; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
  const v: P[] = []; for (let i = 0; i < n; i++) v.push(at(L * i / n));
  let d = `M${f(v[0][0])} ${f(v[0][1])}`;
  for (let i = 0; i < n; i++) {
    const a = v[i], b = v[(i + 1) % n];
    const t = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(t[0], t[1]) || 1;
    const nn = [t[1] / l * sg, -t[0] / l * sg];
    const h = amp * (0.7 + 0.6 * rnd());
    d += ` C${f(a[0] + nn[0] * h * 1.25 + t[0] * 0.05)} ${f(a[1] + nn[1] * h * 1.25 + t[1] * 0.05)} ${f(b[0] + nn[0] * h * 1.25 - t[0] * 0.05)} ${f(b[1] + nn[1] * h * 1.25 - t[1] * 0.05)} ${f(b[0])} ${f(b[1])}`;
  }
  return d + ' Z';
}
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
