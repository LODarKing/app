// Accessibility equipment modelled in profile for the cartoon world.
import * as THREE from 'three';
import { P, shade } from '../core/palette.js';
import { vpart, vring, circlePts, rrectPts, strokePts, roundPoly, ellipsePts, joint, capsulePts } from '../core/vector.js';

const METAL = '#9AA7B8', METAL_D = '#6E7B8E', TIRE = '#2B2238', SEAT = '#2851D8';

/** Wheel: tyre + rim + spokes (+ optional push handrim). Returns {g, spin(angle)} */
export function wheel({ r = 0.58, rim = true, handrim = true, spokes = 12, z = 0, color = METAL, tire = TIRE, hub = METAL_D } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  g.add(vring({ outer: circlePts(r, 64), inner: circlePts(r * 0.86, 64), color: tire, outline: 0.03, z: 0 }));
  const spin = new THREE.Group(); g.add(spin);
  if (rim) {
    spin.add(vring({ outer: circlePts(r * 0.87, 64), inner: circlePts(r * 0.8, 64), color, outline: 0, z: 0.002 }));
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2;
      spin.add(vpart({ pts: strokePts([[0, 0], [Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82]], 0.018, false), color: '#C9D2DE', outline: 0, z: 0.001 }));
    }
    // a coloured marker so rotation reads clearly
    spin.add(vpart({ pts: rrectPts(0.07, r * 0.07, 0.02, 0, r * 0.835), color: P.turquoise, outline: 0, z: 0.004 }));
  }
  if (handrim) g.add(vring({ outer: circlePts(r * 0.95, 64), inner: circlePts(r * 0.9, 64), color: '#D6DEE8', outline: 0.014, z: 0.03 }));
  spin.add(vpart({ pts: circlePts(r * 0.13, 24), color: hub, outline: 0.02, z: 0.006 }));
  spin.add(vpart({ pts: circlePts(r * 0.05, 12), color: '#E8EEF5', outline: 0, z: 0.008 }));
  return { g, spin, r, setAngle(a) { spin.rotation.z = a; } };
}

/**
 * Manual active wheelchair in profile, facing +x (use root.scale.x=-1 to flip).
 * Origin = ground point below the rear axle. Provides seat & foot anchor points
 * and the near handrim for IK.
 */
export function manualWheelchair({ frame = P.turquoise, kid = true } = {}) {
  const root = new THREE.Group(); root.name = 'wheelchair';
  const R = kid ? 0.66 : 0.74;
  const seatY = kid ? 0.72 : 0.82, seatX0 = -0.2, seatX1 = kid ? 0.52 : 0.62;
  const far = wheel({ r: R, z: -0.5 }); far.g.position.set(-0.04, R, -0.5); root.add(far.g);
  // frame (behind body)
  const F = (pts, w = 0.06, z = -0.24, c = frame) => root.add(vpart({ pts: strokePts(pts, w), color: c, outline: 0.02, z }));
  F([[seatX0 - 0.08, seatY + 0.66], [seatX0 - 0.02, seatY], [seatX1 + 0.12, seatY - 0.02], [seatX1 + 0.26, 0.24], [seatX1 + 0.22, 0.2]]);
  F([[seatX1 + 0.12, seatY - 0.02], [seatX1 + 0.12, 0.24]], 0.05);
  F([[0, R], [seatX1 * 0.6, seatY - 0.02]], 0.05);
  // push handles
  root.add(vpart({ pts: strokePts([[seatX0 - 0.08, seatY + 0.66], [seatX0 - 0.26, seatY + 0.68]], 0.07), color: '#2B2238', outline: 0.018, z: -0.235 }));
  // backrest (upholstery)
  root.add(vpart({ pts: roundPoly([[seatX0 - 0.1, seatY + 0.02], [seatX0 + 0.04, seatY + 0.02], [seatX0 + 0.0, seatY + 0.62], [seatX0 - 0.14, seatY + 0.62]], 0.04), color: SEAT, shade: shade(SEAT, 0.8), mode: 2, p: [-1, 0, 0.0, 0], z: -0.23 }));
  // seat cushion
  root.add(vpart({ pts: rrectPts(seatX1 - seatX0 + 0.06, 0.1, 0.04, (seatX0 + seatX1) / 2, seatY + 0.03), color: SEAT, shade: shade(SEAT, 0.8), mode: 2, p: [0, -1, 0, 0], z: -0.22 }));
  // footplate
  const footY = 0.2;
  root.add(vpart({ pts: rrectPts(0.28, 0.06, 0.02, seatX1 + 0.18, footY), color: '#2B2238', outline: 0.02, z: -0.215 }));
  // front caster with fork
  const caster = wheel({ r: 0.13, rim: true, handrim: false, spokes: 5 });
  caster.g.position.set(seatX1 + 0.3, 0.13, -0.2); root.add(caster.g);
  root.add(vpart({ pts: strokePts([[seatX1 + 0.26, 0.3], [seatX1 + 0.3, 0.13]], 0.04), color: METAL_D, outline: 0.016, z: -0.19 }));
  // near rear wheel (in front of the body, behind the near arm)
  const near = wheel({ r: R }); near.g.position.set(0, R, 0.15); root.add(near.g);
  const api = {
    root, R, near, far, caster,
    seat: [seatX0 + 0.22, seatY + 0.08], foot: [seatX1 + 0.2, footY + 0.05],
    hub: [0, R], rimR: R * 0.925,
    /** Roll: distance travelled -> wheel angles (no slip) */
    roll(dist) { const a = -dist / R; near.setAngle(a); far.setAngle(a); caster.setAngle(-dist / 0.13); },
  };
  return api;
}

/** Power wheelchair with joystick and a mounted AAC tablet; faces +x */
export function powerWheelchair({ frame = '#3A3F55', kid = true, tablet = true } = {}) {
  const root = new THREE.Group(); root.name = 'powerchair';
  const seatY = 0.78;
  const add = (o) => (root.add(o), o);
  const far = wheel({ r: 0.36, handrim: false, spokes: 6, color: '#7E8AA0' }); far.g.position.set(-0.1, 0.36, -0.5); root.add(far.g);
  add(vpart({ pts: rrectPts(1.1, 0.34, 0.1, 0.05, 0.45), color: frame, shade: shade(frame, 0.8), mode: 2, p: [0, -1, -0.02, 0], z: -0.26 }));
  add(vpart({ pts: rrectPts(0.8, 0.14, 0.06, 0.12, seatY), color: '#2851D8', shade: shade('#2851D8', 0.8), mode: 2, p: [0, -1, 0, 0], z: -0.22 }));
  add(vpart({ pts: roundPoly([[-0.38, seatY], [-0.2, seatY], [-0.24, seatY + 0.95], [-0.44, seatY + 0.95]], 0.07), color: '#2851D8', shade: shade('#2851D8', 0.8), mode: 2, p: [-1, 0, -0.33, 0], z: -0.23 }));
  // headrest
  add(vpart({ pts: rrectPts(0.18, 0.32, 0.08, -0.35, seatY + 1.15), color: '#2851D8', z: -0.235 }));
  add(vpart({ pts: strokePts([[-0.34, seatY + 0.95], [-0.34, seatY + 1.02]], 0.05), color: '#2B2238', outline: 0.012, z: -0.24 }));
  // armrest + joystick (near side, in front of the body)
  add(vpart({ pts: rrectPts(0.6, 0.08, 0.04, 0.2, seatY + 0.42), color: '#2B2238', outline: 0.02, z: 0.16 }));
  add(vpart({ pts: strokePts([[0.36, seatY + 0.42], [0.36, seatY + 0.13]], 0.05), color: '#2B2238', outline: 0.016, z: 0.159 }));
  add(vpart({ pts: rrectPts(0.16, 0.08, 0.03, 0.44, seatY + 0.48), color: '#4A4F66', outline: 0.016, z: 0.162 }));
  const stick = vpart({ pts: strokePts([[0, 0], [0, 0.12]], 0.035), color: '#1A1033', outline: 0.01, z: 0.164 });
  stick.position.set(0.46, seatY + 0.5, 0); add(stick);
  add(vpart({ pts: circlePts(0.04, 14, 0.46, seatY + 0.64), color: P.red, outline: 0.01, z: 0.165 }));
  // footrest
  add(vpart({ pts: rrectPts(0.3, 0.06, 0.02, 0.62, 0.24), color: '#2B2238', outline: 0.02, z: -0.2 }));
  add(vpart({ pts: strokePts([[0.5, 0.5], [0.6, 0.26]], 0.05), color: '#4A4F66', outline: 0.016, z: -0.205 }));
  const near = wheel({ r: 0.36, handrim: false, spokes: 6, color: '#AEB9CB' }); near.g.position.set(-0.1, 0.36, 0.15); root.add(near.g);
  const caster = wheel({ r: 0.12, handrim: false, spokes: 4 }); caster.g.position.set(0.5, 0.12, 0.14); root.add(caster.g);
  let tab = null;
  if (tablet) {
    tab = aacTablet(); tab.root.position.set(0.86, seatY + 0.86, 0.3); tab.root.rotation.z = 0.12; root.add(tab.root);
    add(vpart({ pts: strokePts([[0.5, seatY + 0.42], [0.72, seatY + 0.6], [0.8, seatY + 0.66]], 0.035), color: '#4A4F66', outline: 0.012, z: 0.29 }));
  }
  return {
    root, tablet: tab, stick, seat: [0.0, seatY + 0.1], foot: [0.62, 0.3],
    roll(dist) { near.setAngle(-dist / 0.36); far.setAngle(-dist / 0.36); caster.setAngle(-dist / 0.12); },
    steer(x) { stick.rotation.z = -x * 0.35; },
  };
}

/** AAC communication board on a tablet: grid of pictogram buttons */
export function aacTablet({ w = 0.62, h = 0.46 } = {}) {
  const root = new THREE.Group();
  root.add(vpart({ pts: rrectPts(w, h, 0.06), color: '#2B2238', outline: 0.022, z: 0 }));
  root.add(vpart({ pts: rrectPts(w - 0.07, h - 0.07, 0.03), color: '#F4FBFF', outline: 0, z: 0.002 }));
  const cells = [];
  const icons = [P.yellow, P.green, P.turquoise, P.pink, P.orange, P.royal];
  for (let i = 0; i < 6; i++) {
    const cx = -w / 2 + 0.07 + 0.085 + (i % 3) * ((w - 0.14) / 3), cy = h / 2 - 0.065 - 0.075 - Math.floor(i / 3) * ((h - 0.12) / 2);
    const c = vpart({ pts: rrectPts((w - 0.18) / 3, (h - 0.16) / 2, 0.025, cx, cy), color: '#FFFFFF', outline: 0.012, z: 0.004 });
    const ic = vpart({ pts: i % 2 ? circlePts(0.035, 14, cx, cy + 0.01) : roundPoly([[cx - 0.04, cy - 0.03], [cx + 0.04, cy - 0.03], [cx, cy + 0.04]], 0.01), color: icons[i], outline: 0.008, z: 0.006 });
    root.add(c, ic); cells.push(c);
  }
  return { root, cells, press(i, k) { cells.forEach((c, j) => { c.userData.fill.material.uniforms.uColor.value.set(j === i && k > 0 ? '#FFF6A8' : '#FFFFFF'); c.scale.setScalar(j === i ? 1 - k * 0.08 : 1); }); } };
}

/** Long white cane: grip + shaft + tip, drawn between a hand point and a tip point */
export function longCane({ color = '#FFFFFF' } = {}) {
  const root = new THREE.Group(); root.name = 'cane';
  const shaft = vpart({ pts: rrectPts(0.045, 1, 0.02, 0, -0.5), color, outline: 0.016, z: 0 });
  const grip = vpart({ pts: rrectPts(0.07, 0.2, 0.03, 0, -0.04), color: '#2B2238', outline: 0.016, z: 0.002 });
  const tip = vpart({ pts: circlePts(0.04, 14), color: '#2B2238', outline: 0.012, z: 0.002 });
  root.add(shaft, grip, tip);
  return {
    root,
    /** place the cane so its top is at (hx,hy) and tip at (tx,ty) in the parent frame */
    span(hx, hy, tx, ty) {
      const L = Math.hypot(tx - hx, ty - hy);
      root.position.set(hx, hy, root.position.z);
      root.rotation.z = Math.atan2(tx - hx, -(ty - hy));
      shaft.scale.y = L; tip.position.y = -L;
    },
  };
}

export function phone({ w = 0.42, h = 0.78 } = {}) {
  const root = new THREE.Group();
  root.add(vpart({ pts: rrectPts(w, h, 0.07), color: '#2B2238', outline: 0.022, z: 0 }));
  const screen = vpart({ pts: rrectPts(w - 0.06, h - 0.12, 0.04), color: '#EAF4FF', outline: 0, z: 0.002 });
  root.add(screen);
  return { root, screen, w, h };
}

export function bible({ open = 0 } = {}) {
  const root = new THREE.Group();
  const cover = '#5A2E2A';
  root.add(vpart({ pts: rrectPts(0.5, 0.66, 0.05), color: cover, shade: shade(cover, 0.8), mode: 2, p: [1, 0, 0.12, 0], z: 0 }));
  root.add(vpart({ pts: rrectPts(0.06, 0.66, 0.02, -0.22, 0), color: shade(cover, 0.75), outline: 0, z: 0.002 }));
  root.add(vpart({ pts: rrectPts(0.05, 0.26, 0.01, 0.03, 0.06), color: P.gold, outline: 0, z: 0.004 }));
  root.add(vpart({ pts: rrectPts(0.18, 0.05, 0.01, 0.03, 0.12), color: P.gold, outline: 0, z: 0.004 }));
  return { root };
}

export function documentSheet({ w = 0.62, h = 0.82, lines = 6, title = true } = {}) {
  const root = new THREE.Group();
  root.add(vpart({ pts: rrectPts(w, h, 0.03), color: '#FFFFFF', shade: '#E9EEF6', mode: 2, p: [1, -1, 0.15, 0], z: 0 }));
  const ls = [];
  if (title) root.add(vpart({ pts: rrectPts(w * 0.5, 0.05, 0.02, -w * 0.12, h / 2 - 0.12), color: P.royal, outline: 0, z: 0.002 }));
  for (let i = 0; i < lines; i++) {
    const l = vpart({ pts: rrectPts(w * 0.72, 0.028, 0.012, 0, h / 2 - 0.24 - i * (h - 0.36) / lines), color: '#B8C2D6', outline: 0, z: 0.002 });
    l.position.x = 0; root.add(l); ls.push(l);
  }
  return { root, lines: ls, w, h, write(k) { ls.forEach((l, i) => { const v = Math.max(0, Math.min(1, k * ls.length - i)); l.scale.x = Math.max(0.001, v); l.position.x = -(w * 0.72) * (1 - v) / 2; }); } };
}

export function pencil() {
  const root = new THREE.Group();
  root.add(vpart({ pts: rrectPts(0.05, 0.36, 0.015, 0, 0.18), color: P.yellow, outline: 0.014, z: 0 }));
  root.add(vpart({ pts: roundPoly([[-0.025, 0], [0.025, 0], [0, -0.07]], 0.005), color: '#F2D3A6', outline: 0.012, z: 0.001 }));
  root.add(vpart({ pts: rrectPts(0.05, 0.05, 0.015, 0, 0.37), color: P.pink, outline: 0.012, z: 0.001 }));
  return { root };
}
