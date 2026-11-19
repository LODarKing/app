// Funções puras do tempo: easing, interpolação, ruído com semente (mulberry32).
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInCubic = (x: number) => x * x * x;
export const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOutQuint = (x: number) => 1 - Math.pow(1 - x, 5);
export const easeInOutQuint = (x: number) => (x < 0.5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2);
export const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
// overshoot elegante (back-out) com amplitude regulável
export const easeOutBack = (x: number, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
// mola amortecida analítica: 0→1 com pequeno overshoot, sem estado entre quadros
export const springish = (x: number, freq = 4.2, damp = 6.5) => (x <= 0 ? 0 : 1 - Math.exp(-damp * x) * Math.cos(freq * Math.PI * x));
// pulso 0→1→0 entre a e b com pico em m
export const bump = (t: number, a: number, m: number, b: number) =>
  t <= a || t >= b ? 0 : t < m ? Math.sin((Math.PI / 2) * ((t - a) / (m - a))) : Math.cos((Math.PI / 2) * ((t - m) / (b - m)));

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type P = [number, number];
export const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// polilinha: comprimento acumulado, ponto e direção num comprimento
export function polyline(pts: P[]) {
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + dist(pts[i - 1], pts[i]));
  const len = acc[acc.length - 1];
  const at = (l: number): { p: P; ang: number } => {
    l = clamp(l, 0, len);
    let lo = 0, hi = acc.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (acc[m] <= l) lo = m; else hi = m; }
    const seg = acc[hi] - acc[lo] || 1, u = (l - acc[lo]) / seg, a = pts[lo], b = pts[hi];
    return { p: [lerp(a[0], b[0], u), lerp(a[1], b[1], u)], ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
  };
  const d = 'M' + pts.map((p) => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join(' L');
  return { pts, acc, len, at, d };
}

// amostra uma cúbica em pontos
export function cubic(p0: P, p1: P, p2: P, p3: P, n = 24): P[] {
  const out: P[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}
