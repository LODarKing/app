// Closed outline around a two-segment chain P0-P1-P2 (radii r0, r1, r2): rounded ends,
// rounded outer joint, creased inner joint — one silhouette, no seam at the elbow/knee.
import { f } from './paths';
type V = number[];
const norm = (v: V) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
export function limbD(P0: V, P1: V, P2: V, r0: number, r1: number, r2: number): string {
  const da = norm([P1[0] - P0[0], P1[1] - P0[1]]), db = norm([P2[0] - P1[0], P2[1] - P1[1]]);
  const na = [-da[1], da[0]], nb = [-db[1], db[0]];
  const side = (s: number) => {
    const a = [na[0] * s, na[1] * s], b = [nb[0] * s, nb[1] * s];
    const inner = a[0] * db[0] + a[1] * db[1] > 0.02;
    const m = norm([a[0] + b[0], a[1] + b[1]]);
    const cosH = Math.max(0.35, m[0] * a[0] + m[1] * a[1]);
    return { s0: [P0[0] + a[0] * r0, P0[1] + a[1] * r0], ja: [P1[0] + a[0] * r1, P1[1] + a[1] * r1], jb: [P1[0] + b[0] * r1, P1[1] + b[1] * r1], J: [P1[0] + m[0] * r1 / cosH, P1[1] + m[1] * r1 / cosH], inner, s2: [P2[0] + b[0] * r2, P2[1] + b[1] * r2] };
  };
  const L = side(1), R = side(-1), P = (p: V) => `${f(p[0])} ${f(p[1])}`, k = 0.5523;
  const run = (S: ReturnType<typeof side>, rev: boolean) => !rev
    ? (S.inner ? ` L${P(S.J)} L${P(S.s2)}` : ` L${P(S.ja)} Q${P(S.J)} ${P(S.jb)} L${P(S.s2)}`)
    : (S.inner ? ` L${P(S.J)} L${P(S.s0)}` : ` L${P(S.jb)} Q${P(S.J)} ${P(S.ja)} L${P(S.s0)}`);
  const tip2 = [P2[0] + db[0] * r2, P2[1] + db[1] * r2], tip0 = [P0[0] - da[0] * r0, P0[1] - da[1] * r0];
  let d = `M${P(L.s0)}` + run(L, false);
  d += ` C${P([L.s2[0] + db[0] * r2 * k, L.s2[1] + db[1] * r2 * k])} ${P([tip2[0] + nb[0] * r2 * k, tip2[1] + nb[1] * r2 * k])} ${P(tip2)}`;
  d += ` C${P([tip2[0] - nb[0] * r2 * k, tip2[1] - nb[1] * r2 * k])} ${P([R.s2[0] + db[0] * r2 * k, R.s2[1] + db[1] * r2 * k])} ${P(R.s2)}`;
  d += run(R, true);
  d += ` C${P([R.s0[0] - da[0] * r0 * k, R.s0[1] - da[1] * r0 * k])} ${P([tip0[0] - na[0] * r0 * k, tip0[1] - na[1] * r0 * k])} ${P(tip0)}`;
  d += ` C${P([tip0[0] + na[0] * r0 * k, tip0[1] + na[1] * r0 * k])} ${P([L.s0[0] - da[0] * r0 * k, L.s0[1] - da[1] * r0 * k])} ${P(L.s0)}`;
  return d + ' Z';
}
/** capsule between two points */
export const capsuleD = (A: V, B: V, ra: number, rb: number) => limbD(A, [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], B, ra, (ra + rb) / 2, rb);
