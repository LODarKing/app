// Shared standing-character rig (3/4 view facing screen-left), sheet coordinates (y down).
// Legs: 2-bone IK to foot targets. Arms: FK angles. Limbs are drawn as ONE continuous outline per chain
// (hip-knee-ankle / shoulder-elbow-wrist) so bent joints never show a seam.
import { Part, Bone, f, ellipse } from './vec.js';
import { solve2 } from './ik2.js';

const dir = (a) => [Math.cos(a), Math.sin(a)];

/** closed outline around the chain P0-P1-P2 with radii r0,r1,r2 (rounded ends, rounded outer joint, creased inner joint) */
export function limbD(P0, P1, P2, r0, r1, r2, capStart = true) {
  const da = norm([P1[0] - P0[0], P1[1] - P0[1]]), db = norm([P2[0] - P1[0], P2[1] - P1[1]]);
  const na = [-da[1], da[0]], nb = [-db[1], db[0]];
  const side = (s) => {
    const a = [na[0] * s, na[1] * s], b = [nb[0] * s, nb[1] * s];
    const inner = (a[0] * db[0] + a[1] * db[1]) > 0.02;
    const m = norm([a[0] + b[0], a[1] + b[1]]);
    const cosH = Math.max(0.35, m[0] * a[0] + m[1] * a[1]);
    const J = [P1[0] + m[0] * r1 / cosH, P1[1] + m[1] * r1 / cosH];
    return { s0: [P0[0] + a[0] * r0, P0[1] + a[1] * r0], ja: [P1[0] + a[0] * r1, P1[1] + a[1] * r1], jb: [P1[0] + b[0] * r1, P1[1] + b[1] * r1], J, inner, s2: [P2[0] + b[0] * r2, P2[1] + b[1] * r2] };
  };
  const L = side(1), R = side(-1);
  const P = (p) => `${f(p[0])} ${f(p[1])}`;
  const k = 0.5523;
  const run = (S, rev) => {
    // returns path segment from s0 to s2 (or reverse)
    const pts = S.inner ? [S.s0, S.J, S.s2] : null;
    if (!rev) return S.inner ? ` L${P(S.J)} L${P(S.s2)}` : ` L${P(S.ja)} Q${P(S.J)} ${P(S.jb)} L${P(S.s2)}`;
    return S.inner ? ` L${P(S.J)} L${P(S.s0)}` : ` L${P(S.jb)} Q${P(S.J)} ${P(S.ja)} L${P(S.s0)}`;
  };
  // end cap around P2 from L.s2 to R.s2 (through the tip)
  const tip2 = [P2[0] + db[0] * r2, P2[1] + db[1] * r2];
  const tip0 = [P0[0] - da[0] * r0, P0[1] - da[1] * r0];
  let d = `M${P(L.s0)}` + run(L, false);
  d += ` C${P([L.s2[0] + db[0] * r2 * k, L.s2[1] + db[1] * r2 * k])} ${P([tip2[0] + nb[0] * r2 * k, tip2[1] + nb[1] * r2 * k])} ${P(tip2)}`;
  d += ` C${P([tip2[0] - nb[0] * r2 * k, tip2[1] - nb[1] * r2 * k])} ${P([R.s2[0] + db[0] * r2 * k, R.s2[1] + db[1] * r2 * k])} ${P(R.s2)}`;
  d += run(R, true);
  if (capStart) {
    d += ` C${P([R.s0[0] - da[0] * r0 * k, R.s0[1] - da[1] * r0 * k])} ${P([tip0[0] - na[0] * r0 * k, tip0[1] - na[1] * r0 * k])} ${P(tip0)}`;
    d += ` C${P([tip0[0] + na[0] * r0 * k, tip0[1] + na[1] * r0 * k])} ${P([L.s0[0] - da[0] * r0 * k, L.s0[1] - da[1] * r0 * k])} ${P(L.s0)}`;
  }
  return d + ' Z';
}
function norm(v) { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }

/** point at fraction t along the chain (for socks, cuffs) */
export function along(P0, P1, P2, t) {
  const l1 = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]), l2 = Math.hypot(P2[0] - P1[0], P2[1] - P1[1]);
  let s = t * (l1 + l2);
  if (s <= l1) return [P0[0] + (P1[0] - P0[0]) * s / l1, P0[1] + (P1[1] - P0[1]) * s / l1];
  s -= l1; return [P1[0] + (P2[0] - P1[0]) * s / l2, P1[1] + (P2[1] - P1[1]) * s / l2];
}

/**
 * Build a kid from an art description:
 * art = { ground, rootX, hip:[x,y], neck:[x,y], legs:{far:{hip,knee,ankle,r:[..]}, near:{...}},
 *         arms:{far:{sh,el,wr,r}, near:{...}}, colors:{skin, line, leg, legLine, legShade},
 *         drawTorso(torsoBone), drawHead(headBone)->{setExpr}, drawSleeve(side, bone), drawHand(side, bone, kind),
 *         drawShoe(side, bone), drawHairBack?(headBone|torsoBone), legStyle(side, P0,P1,P2)->Part spec, armStyle... }
 */
export function createKid(art) {
  const root = new Bone(art.rootX, art.ground);
  const pelvis = root.bone(art.hip[0], art.hip[1], 0);
  const torso = pelvis.bone(art.hip[0], art.hip[1], 5);
  const head = torso.bone(art.neck[0], art.neck[1], 10);
  const legs = {}, arms = {};
  // legs (drawn in root space with dynamic geometry so the outline is continuous)
  for (const side of ['far', 'near']) {
    const L = art.legs[side];
    const g = root.bone(art.rootX, art.ground, side === 'far' ? -2 : -1);
    const part = g.draw(new Part({}, true), 0);
    const extra = g.draw(new Part({}, true), 1);
    const ankle = g.bone(L.ankle[0], L.ankle[1], 2);
    art.drawShoe(side, ankle);
    legs[side] = { g, part, extra, ankle, L1: Math.hypot(L.knee[0] - L.hip[0], L.knee[1] - L.hip[1]), L2: Math.hypot(L.ankle[0] - L.knee[0], L.ankle[1] - L.knee[1]), foot: [...L.ankle], footRot: 0, bend: L.bend ?? -1 };
  }
  // arms
  for (const side of ['far', 'near']) {
    const A = art.arms[side];
    const z = side === 'far' ? -2 : 20;
    const g = torso.bone(art.hip[0], art.hip[1], z);   // limb skin, torso space
    const part = g.draw(new Part({}, true), 0);
    const sh = torso.bone(A.sh[0], A.sh[1], z + 1);    // sleeve follows the upper arm
    art.drawSleeve(side, sh);
    const hand = g.bone(A.wr[0], A.wr[1], 2);
    const handKinds = art.drawHand(side, hand);
    const L1 = Math.hypot(A.el[0] - A.sh[0], A.el[1] - A.sh[1]), L2 = Math.hypot(A.wr[0] - A.el[0], A.wr[1] - A.el[1]);
    const a1 = Math.atan2(A.el[1] - A.sh[1], A.el[0] - A.sh[0]), a2 = Math.atan2(A.wr[1] - A.el[1], A.wr[0] - A.el[0]);
    arms[side] = { g, part, sh, hand, handKinds, L1, L2, rest1: a1, rest2: a2 - a1, a1, bend: a2 - a1, wrist: 0, kind: 'rest' };
  }
  art.drawTorso(torso, pelvis);
  const face = art.drawHead(head, torso);

  const pose = {
    hipX: 0, hipY: 0, lean: 0, headTilt: 0, breath: 0,
    feet: { far: [...art.legs.far.ankle], near: [...art.legs.near.ankle] }, footRot: { far: 0, near: 0 },
    arms: { far: { a1: arms.far.rest1, bend: arms.far.rest2, wrist: 0, kind: 'rest' }, near: { a1: arms.near.rest1, bend: arms.near.rest2, wrist: 0, kind: 'rest' } },
  };

  function apply() {
    pelvis.position.set(art.hip[0] - art.rootX + pose.hipX, art.hip[1] - art.ground + pose.hipY, 0);
    torso.rotation.z = pose.lean;
    torso.scale.set(1, 1 + pose.breath * 0.012, 1);
    head.rotation.z = pose.headTilt;
    // legs: hip in root space = rest hip + pelvis offset
    for (const side of ['far', 'near']) {
      const L = art.legs[side], lg = legs[side];
      const H = [L.hip[0] + pose.hipX, L.hip[1] + pose.hipY], T = pose.feet[side];
      const sol = solve2(H[0], H[1], T[0], T[1], lg.L1, lg.L2, lg.bend);
      const K = [sol.ex, sol.ey], A = [H[0] + Math.cos(sol.a1) * lg.L1 + Math.cos(sol.a2) * lg.L2, H[1] + Math.sin(sol.a1) * lg.L1 + Math.sin(sol.a2) * lg.L2];
      const st = art.legStyle(side, H, K, A);
      lg.part.set(st.main); lg.extra.set(st.extra || {});
      lg.ankle.position.set(A[0] - art.rootX, A[1] - art.ground, 0);
      lg.ankle.rotation.z = pose.footRot[side];
    }
    // arms (torso space)
    for (const side of ['far', 'near']) {
      const A = art.arms[side], ar = arms[side], p = pose.arms[side];
      const E = [A.sh[0] + Math.cos(p.a1) * ar.L1, A.sh[1] + Math.sin(p.a1) * ar.L1];
      const W = [E[0] + Math.cos(p.a1 + p.bend) * ar.L2, E[1] + Math.sin(p.a1 + p.bend) * ar.L2];
      ar.part.set(art.armStyle(side, A.sh, E, W));
      ar.sh.rotation.z = (p.a1 - ar.rest1) * 0.85;
      ar.hand.position.set(W[0] - art.hip[0], W[1] - art.hip[1], 0);
      ar.hand.rotation.z = (p.a1 + p.bend) - (ar.rest1 + ar.rest2) + p.wrist;
      for (const [k, obj] of Object.entries(ar.handKinds)) obj.visible = k === p.kind;
    }
  }
  apply();
  return { root, bones: { pelvis, torso, head }, legs, arms, pose, face, apply, art };
}

export const eyeParts = (cx, cy, rx, ry, px, py, prx, pry, C) => ({ cx, cy, rx, ry, px, py, prx, pry });
