// Scene toolkit: actors driven by keyframed paths, wheelchair actors, camera tracks.
import * as THREE from 'three';
import { make } from '../characters/cast.js';
import { walk, idle, faceLife, restPose, wheelchairPush, sit, mixPose } from '../animations/cycles.js';
import { manualWheelchair, powerWheelchair } from '../objects/accessibility.js';
import { clamp, lerp, ease } from '../core/math.js';

/** Piecewise path: keys [[t, value], ...] eased per segment (inOutSine). Returns value. */
export function path(keys, t, e = ease.inOutSine) {
  if (typeof keys === 'number') return keys;
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1, ee] = keys[i];
      const k = (ee || e)((t - t0) / (t1 - t0));
      return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], k)) : lerp(v0, v1, k);
    }
  }
  return keys[keys.length - 1][1];
}
export function velocity(keys, t) {
  if (typeof keys === 'number') return 0;
  const d = 1 / 60; return (path(keys, t + d) - path(keys, t - d)) / (2 * d);
}

const _v = new THREE.Vector3();
export function wp(obj) { obj.updateWorldMatrix(true, false); obj.getWorldPosition(_v); return [_v.x, _v.y, _v.z]; }

export class Actor {
  constructor(scene, key, { x = 0, y = 0, z = 0, scale = 1, facing = 0, seed = 1, extra = {} } = {}) {
    this.h = make(key, extra); this.h.root.position.set(x, y, z); this.h.root.scale.setScalar(scale);
    this.seed = seed; this.y = y; this.lastDir = facing >= 0 ? 1 : -1; this.facing = facing; this.h.setFacing(facing);
    scene.add(this.h.root); this.root = this.h.root;
  }
  /**
   * o: { x: number|keys, y, facing, pose: obj|fn(t), talk, smile, look, brow, browTilt, mouth, hide }
   * Walks automatically while x is changing; stands (with idle life) when it stops.
   */
  update(t, o = {}) {
    const h = this.h;
    h.root.visible = o.hide ? false : true;
    if (o.hide) return;
    const x = o.x != null ? path(o.x, t) : h.root.position.x;
    const y = o.ground ? o.ground(x) : o.y != null ? path(o.y, t) : this.y;
    h.root.position.y = y;
    const v = o.x != null ? velocity(o.x, t) : 0;
    if (Math.abs(v) > 0.05) this.lastDir = Math.sign(v);
    const dir = o.dir || this.lastDir;
    const stop = 1 - clamp(Math.abs(v) / 0.55);
    let f = o.facing != null ? path(o.facing, t) : (stop < 0.5 ? dir * 0.5 : this.facing);
    if (Math.abs(f - h.facing) > 0.01) h.setFacing(f);
    let p = typeof o.pose === 'function' ? o.pose(t) : (o.pose || restPose());
    if (o.idle !== false) p = idle(t, this.seed, p);
    walk(h, x, { dir, groundY: o.ground || y, stop: o.walk === false ? 1 : stop, base: p, lift: o.lift ?? 0.13, armSwing: o.armSwing ?? 0.38 });
    // blend arms: walking swing -> requested pose
    if (stop > 0) for (const s of ['L', 'R']) {
      const a = p['arm' + s]; if (!a) continue;
      const J = h.J;
      J['sh' + s].rotation.z = lerp(J['sh' + s].rotation.z, a[0], stop);
      J['el' + s].rotation.z = lerp(J['el' + s].rotation.z, a[1], stop);
      J['wr' + s].rotation.z = lerp(J['wr' + s].rotation.z, a[2] || 0, stop);
    }
    if (p.handL) h.setHand('L', p.handL); else h.setHand('L', 'open');
    if (p.handR) h.setHand('R', p.handR); else h.setHand('R', 'open');
    if (o.after) o.after(t, h);
    faceLife(h, t, { seed: this.seed, talk: o.talk || false, smile: o.smile ?? 0.6, look: o.look || [dir * Math.abs(f) * 0.6, 0], brow: o.brow || 0, browTilt: o.browTilt || 0, mouth: o.mouth ?? null });
  }
}

export class ChairActor {
  constructor(scene, key, { kind = 'manual', x = 0, y = 0, z = 0, scale = 1, dir = 1, seed = 1, facing } = {}) {
    this.kind = kind;
    this.chair = kind === 'manual' ? manualWheelchair() : powerWheelchair();
    this.chair.root.position.set(x, y, z); this.chair.root.scale.set(scale * dir, scale, scale);
    scene.add(this.chair.root);
    this.h = make(key); this.h.root.scale.setScalar(scale); scene.add(this.h.root);
    this.dir = dir; this.seed = seed; this.x0 = x; this.y = y; this.z = z;
    this.h.setFacing(facing ?? dir * 0.6); this.root = this.chair.root;
  }
  /** o: { x, y, dir, pose, hands: 'push'|'rest'|fn(t,h), face opts... } */
  update(t, o = {}) {
    const { chair, h } = this;
    const hide = !!o.hide; chair.root.visible = !hide; h.root.visible = !hide; if (hide) return;
    const x = o.x != null ? path(o.x, t) : chair.root.position.x;
    const v = o.x != null ? velocity(o.x, t) : 0;
    const dir = o.dir || this.dir;
    const y = o.ground ? o.ground(x) : o.y != null ? path(o.y, t) : this.y;
    const sc = Math.abs(chair.root.scale.y);
    if (o.ground) { const d = 0.3; chair.root.rotation.z = Math.atan2(o.ground(x + d) - o.ground(x - d), 2 * d) * (dir > 0 ? 1 : 1); }
    chair.root.scale.x = sc * dir;
    chair.root.position.set(x, y, this.z);
    if (o.tilt != null) chair.root.rotation.z = path(o.tilt, t);
    const f = o.facing != null ? path(o.facing, t) : dir * 0.6;
    if (Math.abs(f - h.facing) > 0.01) h.setFacing(f);
    chair.root.updateWorldMatrix(true, true);
    const seat = chair.root.localToWorld(new THREE.Vector3(...chair.seat, 0));
    const foot = chair.root.localToWorld(new THREE.Vector3(...chair.foot, 0));
    const dist = (x - this.x0) * dir;
    const moving = clamp(Math.abs(v) / 0.4);
    let lean = 0, hand = null;
    if (this.kind === 'manual') {
      const push = wheelchairPush(h, chair, Math.abs(x - this.x0), { dir: 1, period: 1.45, active: o.hands === 'rest' ? 0 : moving });
      chair.roll(dist); lean = push.lean; hand = push.hand;
    } else { chair.roll(dist); chair.steer(clamp(v * 0.8, -1, 1) * dir); }
    let p = typeof o.pose === 'function' ? o.pose(t) : (o.pose || {});
    p = idle(t, this.seed, { spine: -dir * (lean + 0.04), head: dir * 0.06, ...p, legL: undefined, legR: undefined });
    h.root.position.z = this.z + 0.0;
    sit(h, [seat.x, seat.y], [foot.x, foot.y], { dir, base: p });
    h.root.position.z = this.z;
    if (this.kind === 'manual' && (o.hands === undefined || o.hands === 'push') && hand) {
      // near hand on the near handrim; far hand mirrors slightly behind
      const nearS = h.facing > 0 ? 'L' : 'R', farS = nearS === 'L' ? 'R' : 'L';
      const k = o.pushK != null ? path(o.pushK, t) : 1;
      if (k > 0) {
        h.reach(nearS, hand[0], hand[1], dir);
        h.reach(farS, hand[0] - dir * 0.04 * sc, hand[1] + 0.03 * sc, dir);
        if (k < 1) for (const s of ['L', 'R']) { const a = p['arm' + s]; if (a) { h.J['sh' + s].rotation.z = lerp(a[0], h.J['sh' + s].rotation.z, k); h.J['el' + s].rotation.z = lerp(a[1], h.J['el' + s].rotation.z, k); } }
        h.setHand('L', 'hold'); h.setHand('R', 'hold');
      }
    } else if (typeof o.hands === 'function') o.hands(t, h, chair);
    if (p.handL) h.setHand('L', p.handL); if (p.handR) h.setHand('R', p.handR);
    faceLife(h, t, { seed: this.seed, talk: o.talk || false, smile: o.smile ?? 0.7, look: o.look || [dir * 0.6, 0.05], brow: o.brow || 0, browTilt: o.browTilt || 0, mouth: o.mouth ?? null });
  }
}

/** Camera track: keys [[t, [x, y, zoom]], ...] -> view on the stage camera */
export function camAt(keys, t, e) { const v = path(keys, t, e); return { x: v[0], y: v[1], zoom: v[2], rot: v[3] || 0 }; }

/** One-knee kneel at x facing dir (k 0..1 blends from standing). */
export function kneelAt(h, x, groundY, k, dir, t, seed, extra = {}) {
  const A = h.A;
  const kk = ease.inOutCubic(clamp(k));
  h.root.position.set(x, groundY - kk * A.thigh * 1.08, h.root.position.z);
  h.root.visible = true;
  h.setPose(idle(t, seed, { spine: dir * 0.1 * kk, head: -dir * 0.08 * kk, armL: [-0.2, -0.3, 0], armR: [0.3, 0.3, 0], ...extra }));
  if (h.J.skirt) h.J.skirt.scale.y = 1 - 0.42 * kk;
  const front = dir < 0 ? 'R' : 'L', back = dir < 0 ? 'L' : 'R';
  h.plant(front, x + dir * 0.45, groundY + A.ankle, -dir);
  h.plant(back, x - dir * 0.55, groundY + A.ankle + 0.02 * kk, -dir);
  for (const s of ['L', 'R']) h.J['ankle' + s].rotation.z = -(h.J['hip' + s].rotation.z + h.J['knee' + s].rotation.z + h.J.hips.rotation.z);
}
