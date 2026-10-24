// Procedural motion for the rig. All functions are pure functions of the
// input time / distance so any frame can be evaluated in isolation.
import * as THREE from 'three';
import { clamp, lerp, ease, noise1, blink as blinkF } from '../core/math.js';

const frac = (x) => x - Math.floor(x);
const _v = new THREE.Vector3();
function wpos(obj) { obj.updateWorldMatrix(true, false); obj.getWorldPosition(_v); return [_v.x, _v.y]; }
function rootScale(h) { return Math.abs(h.root.scale.y); }

/** Base relaxed pose (front facing), slight asymmetry */
export function restPose(extra = {}) {
  return { armL: [-0.1, 0.12, 0.05], armR: [0.1, -0.12, -0.05], legL: [0.02, 0, -0.02], legR: [-0.02, 0, 0.02], ...extra };
}

/** Idle breathing and weight shift added to a pose */
export function idle(t, seed = 0, p = restPose()) {
  const b = Math.sin(t * 2.1 + seed) * 0.5 + 0.5;
  const sway = noise1(t * 0.35, seed) * 0.03;
  return {
    ...p,
    hipY: (p.hipY || 0) - b * 0.012, hipX: (p.hipX || 0) + sway * 0.4,
    spine: (p.spine || 0) + sway * 0.4 + Math.sin(t * 2.1 + seed) * 0.008,
    head: (p.head || 0) + noise1(t * 0.5, seed + 3) * 0.05,
    armL: p.armL && [p.armL[0] - b * 0.02, p.armL[1], p.armL[2]],
    armR: p.armR && [p.armR[0] + b * 0.02, p.armR[1], p.armR[2]],
  };
}

/** Face life: blinking (deterministic schedule) + optional talking mouth */
export function faceLife(h, t, { seed = 0, talk = false, smile = 0.6, look = [0, 0], brow = 0, browTilt = 0, mouth = null } = {}) {
  const talking = typeof talk === 'function' ? talk(t) : talk;
  const open = mouth != null ? mouth : talking ? clamp(0.12 + 0.55 * Math.abs(noise1(t * 11, seed + 7)) * (0.6 + 0.4 * Math.abs(noise1(t * 3, seed)))) : 0;
  h.face.set({ blink: blinkF(t, seed), mouthOpen: open, smile, look, brow, browTilt });
}

/**
 * Walk with planted feet (no foot sliding): x = world x of character root.
 * The root is moved to x; legs are solved with IK against the ground.
 */
export function walk(h, x, { dir = 1, groundY = 0, lift = 0.13, armSwing = 0.38, bob = 0.04, lean = 0.05, D = null, base = {}, t = 0, stop = 0, stance = 0.03 } = {}) {
  const A = h.A, s = rootScale(h);
  const Lleg = A.thigh + A.shin;
  D = D || Lleg * 1.5;
  const ph = (x * dir) / (D * s);
  h.root.position.x = x;
  const mid = 0.5 + 0.5 * Math.cos(4 * Math.PI * (ph - 0.25));
  const go = 1 - stop;                 // stop: 0 = walking, 1 = standing still
  const sw = Math.sin(2 * Math.PI * ph) * go;
  armSwing *= go; lean *= go; lift *= go;
  h.setPose({
    ...base,
    hipY: (-0.06 + bob * mid) * go - 0.01 * stop, hipRot: sw * 0.04 * dir,
    spine: (base.spine || 0) - dir * lean + sw * 0.03 * dir, head: (base.head || 0) + dir * lean * 0.6 - sw * 0.02,
    armL: [dir * armSwing * Math.sin(2 * Math.PI * (ph + 0.5)) * (dir > 0 ? 1 : 1), dir * (0.25 + 0.15 * Math.max(0, Math.sin(2 * Math.PI * (ph + 0.5)))), 0],
    armR: [dir * armSwing * Math.sin(2 * Math.PI * ph), dir * (0.25 + 0.15 * Math.max(0, Math.sin(2 * Math.PI * ph))), 0],
    ...(base.armL ? { armL: base.armL } : {}), ...(base.armR ? { armR: base.armR } : {}),
  });
  for (const [side, off] of [['L', 0], ['R', 0.5]]) {
    const p = frac(ph + off);
    let rel, y, pitch = 0;
    if (p < 0.5) { rel = D / 4 - (p / 0.5) * (D / 2); y = 0; }
    else { const q = (p - 0.5) / 0.5; rel = -D / 4 + ease.inOutSine(q) * (D / 2); y = lift * Math.sin(Math.PI * q); pitch = Math.sin(Math.PI * q) * 0.25; }
    const hp = h.J['hip' + side];
    const [hx] = wpos(hp);
    rel = rel * go + (side === 'L' ? -stance : stance) * dir * stop;
    const fx = hx + rel * dir * s;
    const gy = typeof groundY === 'function' ? groundY(fx) : groundY;
    h.plant(side, fx, gy + (A.ankle + y) * s, -dir);
    h.J['ankle' + side].rotation.z = -(hp.rotation.z + h.J['knee' + side].rotation.z + h.J.hips.rotation.z) + pitch * dir;
  }
}

/** Plant both feet at their current horizontal positions (standing, no slide) */
export function stand(h, { groundY = 0, spread = 0.03 } = {}) {
  const s = rootScale(h);
  for (const side of ['L', 'R']) {
    const hp = h.J['hip' + side];
    const [hx] = wpos(hp);
    const d = side === 'L' ? -1 : 1;
    h.plant(side, hx + d * spread * s, groundY + h.A.ankle * s, d < 0 ? 1 : -1);
    h.J['ankle' + side].rotation.z = -(hp.rotation.z + h.J['knee' + side].rotation.z + h.J.hips.rotation.z);
  }
}

/** Seat the rig on a seat point (world coords), thighs forward, feet on a foot point */
export function sit(h, seatW, footW, { dir = 1, base = {} } = {}) {
  const s = rootScale(h), A = h.A;
  h.root.position.x = seatW[0];
  h.root.position.y = seatW[1] - (h.hipY - 0.0) * s;
  h.setPose({ ...base });
  for (const side of ['L', 'R']) {
    const off = side === 'L' ? -0.03 : 0.03;
    h.plant(side, footW[0] + off * s, footW[1] + A.ankle * s, -dir);
    h.J['ankle' + side].rotation.z = -(h.J['hip' + side].rotation.z + h.J['knee' + side].rotation.z + h.J.hips.rotation.z);
  }
  if (h.J.skirt) {   // long skirts/robes drape over the thighs when seated
    const th = (h.J.hipL.rotation.z + h.J.hipR.rotation.z) / 2;
    h.J.skirt.rotation.z = th * 0.55; h.J.skirt.scale.y = 0.78;
  }
}

/** Manual wheelchair propulsion. dist = distance travelled by the chair (world). */
export function wheelchairPush(h, chair, dist, { dir = 1, period = 1.5, active = 1 } = {}) {
  chair.roll(dist * dir);
  const R = chair.R, rim = chair.rimR;
  const u = frac(Math.max(0, dist) / period);
  const pushFrac = 0.38;
  const thS = deg(118), thE = thS - (pushFrac * period) / R;
  let th, out = 0;
  if (u < pushFrac) { th = thS - (u * period) / R; }
  else { const q = (u - pushFrac) / (1 - pushFrac); th = lerp(thE, thS, ease.inOutSine(q)); out = Math.sin(Math.PI * q) * 0.22; }
  // blend toward resting grip when inactive
  th = lerp(deg(95), th, active); out *= active;
  const hub = new THREE.Vector3(chair.hub[0], chair.hub[1], 0);
  const r = rim + out;
  const pt = new THREE.Vector3(hub.x + Math.cos(th) * r, hub.y + Math.sin(th) * r, 0);
  chair.root.updateWorldMatrix(true, false);
  chair.root.localToWorld(pt);
  const lean = (u < pushFrac ? Math.sin((u / pushFrac) * Math.PI) * 0.1 : 0) * active;
  return { hand: [pt.x, pt.y], lean, phase: u };
}
function deg(d) { return (d * Math.PI) / 180; }

/** Long-cane two-point touch synced to the walk phase. Returns the tip point (world). */
export function caneSweep(h, x, { dir = 1, groundY = 0, D = null, reach = 1.05, t = 0 } = {}) {
  const A = h.A, s = rootScale(h);
  D = D || (A.thigh + A.shin) * 1.5;
  const ph = (x * dir) / (D * s);
  const q = frac(ph * 2);               // one touch per step
  const arc = Math.sin(Math.PI * q);
  const tipX = x + dir * (reach + 0.12 * Math.cos(2 * Math.PI * ph)) * s;
  const tipY = groundY + 0.035 * arc * s;
  return [tipX, tipY];
}

/** Gesture helpers ------------------------------------------------------ */
export function wave(t, side = 'R', amp = 1) {
  const w = Math.sin(t * 9) * 0.35 * amp;
  return side === 'R' ? { armR: [2.5, 0.6 + w, -0.2] } : { armL: [-2.5, -0.6 - w, 0.2] };
}
export function point(dir = 1, side = 'R', high = 0) {
  const a = 1.45 + high * 0.4;
  return side === 'R' ? { armR: [dir * a, dir * 0.12, 0], handR: 'point' } : { armL: [dir * a, dir * 0.12, 0], handL: 'point' };
}
/** explanatory open-hand gesture (both arms), animated with t */
export function explain(t, k = 1, seed = 0) {
  const a = noise1(t * 1.3, seed) * 0.25 * k, b = noise1(t * 1.1, seed + 5) * 0.25 * k;
  return { armL: [-0.55 - a, -1.1 - b, 0.3], armR: [0.55 + b, 1.1 + a, -0.3] };
}
export function mixPose(a, b, k) {
  const out = { ...a };
  for (const key of Object.keys(b)) {
    const va = a[key], vb = b[key];
    if (Array.isArray(vb)) out[key] = (va || [0, 0, 0]).map((v, i) => lerp(v, vb[i] ?? 0, k));
    else if (typeof vb === 'number') out[key] = lerp(va || 0, vb, k);
    else out[key] = k > 0.5 ? vb : va;
  }
  return out;
}
