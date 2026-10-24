// Deterministic maths helpers: easing, interpolation, keyframe tracks and a
// seeded PRNG. Nothing here reads the wall clock — time is always passed in.
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, x) => clamp((x - a) / (b - a));
export const remap = (x, a, b, c, d) => lerp(c, d, invLerp(a, b, x));
export const TAU = Math.PI * 2;
export const deg = (d) => (d * Math.PI) / 180;

export const ease = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  outBack: (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  inBack: (t, s = 1.70158) => (s + 1) * t * t * t - s * t * t,
  outElastic: (t) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
  smooth: (t) => t * t * (3 - 2 * t),
};

/** progress of t through [a, a+d] with easing */
export function prog(t, a, d, e = ease.inOutCubic) {
  return e(clamp((t - a) / d));
}

/** Keyframe track: keys = [[time, value, easeFn?], ...]; value may be number or array */
export function track(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, v0] = keys[i - 1];
        const [t1, v1, e] = keys[i];
        const k = (e || ease.inOutCubic)((t - t0) / (t1 - t0));
        if (Array.isArray(v0)) return v0.map((x, j) => lerp(x, v1[j], k));
        return lerp(v0, v1, k);
      }
    }
    return keys[keys.length - 1][1];
  };
}

/** Seeded PRNG (mulberry32) — deterministic across runs */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth deterministic 1D noise in [-1,1] */
export function noise1(x, seed = 0) {
  const h = (n) => {
    const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  };
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u);
}

/** Blink amount (0 open .. 1 closed) on a deterministic irregular schedule */
export function blink(t, seed = 0) {
  const r = rng(1000 + seed * 7);
  let tt = r() * 1.5;
  while (tt < t + 1) {
    const d = t - tt;
    if (d >= 0 && d < 0.16) return Math.sin((d / 0.16) * Math.PI);
    tt += 2.2 + r() * 2.6;
  }
  return 0;
}

/** Pulse in [0,1]: rises at a over r, holds, falls at b over f */
export function pulse(t, a, b, r = 0.3, f = 0.3, e = ease.inOutCubic) {
  return Math.min(prog(t, a, r, e), 1 - prog(t, b, f, e));
}
