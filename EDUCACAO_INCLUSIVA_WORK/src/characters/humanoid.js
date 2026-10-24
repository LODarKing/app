// Procedural, fully-rigged cartoon humanoid built from vector parts.
// Hierarchy: root(feet) > hips > [hipL>kneeL>ankleL, hipR>kneeR>ankleR,
//   spine > [neck > head > face/hair, shL>elL>wrL, shR>elR>wrR]]
// 'L'/'R' always mean SCREEN left/right. Angle 0 = bone pointing down.
import * as THREE from 'three';
import { P, shade } from '../core/palette.js';
import { vpart, vring, vreshape, joint, circlePts, ellipsePts, rrectPts, capsulePts, trapPts, blobPts, roundPoly, strokePts, curvePts, transformPts, OUTLINE } from '../core/vector.js';
import { solve2, toLocal } from '../rigs/ik.js';
import { clamp, lerp } from '../core/math.js';

const KID = { headR: 0.5, neck: 0.17, torso: 0.86, shoulderW: 0.37, hipW: 0.16, thigh: 0.56, shin: 0.52, ankle: 0.1, upperArm: 0.47, forearm: 0.43, hand: 0.17, armR: 0.115, legR: 0.135 };
const ADULT = { headR: 0.45, neck: 0.2, torso: 1.18, shoulderW: 0.47, hipW: 0.19, thigh: 0.8, shin: 0.76, ankle: 0.11, upperArm: 0.64, forearm: 0.58, hand: 0.2, armR: 0.13, legR: 0.16 };

const Z = { hairBack: -0.42, cape: -0.45, pelvis: -0.205, torso: 0, robe: 0.012, belt: 0.02, scarf: 0.035, neck: -0.03, head: 0.1 };
const ARM_NEAR = 0.2, ARM_FAR = -0.31, LEG_NEAR = -0.16, LEG_FAR = -0.19;

function sc(pts, k, dx = 0, dy = 0) { return pts.map(([x, y]) => [x * k + dx, y * k + dy]); }

// ------------------------------------------------------------------ hair
function hairShapes(style, R, f) {
  const out = []; // {pts, layer:'front'|'back', color?}
  const S = (ctrl, layer, n = 90) => out.push({ pts: sc(blobPts(ctrl, n), R), layer });
  const cap = [[-1.06, 0.0], [-1.04, 0.55], [-0.62, 1.05], [0, 1.2], [0.64, 1.06], [1.06, 0.56], [1.06, 0.0], [0.9, 0.34], [0.55, 0.5], [0.12, 0.6], [-0.3, 0.46], [-0.75, 0.42]];
  const sideCap = cap.map(([x, y]) => [x + f * 0.08, y]);
  switch (style) {
    case 'buzz':
      S([[-1.02, 0.25], [-0.95, 0.7], [-0.55, 1.06], [0, 1.12], [0.55, 1.06], [0.95, 0.7], [1.02, 0.25], [0.7, 0.62], [0, 0.72], [-0.7, 0.62]], 'front'); break;
    case 'short':
      S(sideCap, 'front'); break;
    case 'spiky':
      out.push({ pts: sc(roundPoly([[-1.08, 0.05], [-1.1, 0.7], [-0.8, 0.95], [-0.7, 1.3], [-0.35, 1.1], [-0.1, 1.42], [0.2, 1.12], [0.55, 1.35], [0.62, 1.02], [1.0, 1.05], [1.08, 0.6], [1.08, 0.05], [0.8, 0.42], [0.3, 0.52], [-0.2, 0.44], [-0.7, 0.5]], 0.12, 5), R), layer: 'front' });
      break;
    case 'curly': {
      const c = []; for (let i = 0; i < 16; i++) { const a = Math.PI * (i / 15) - 0.02; const r = i % 2 ? 1.18 : 1.3; c.push([Math.cos(Math.PI - a) * r * 1.0 + f * 0.06, Math.sin(Math.PI - a) * r * 0.95 + 0.12]); }
      c.push([1.0, 0.25], [0.6, 0.5], [0.2, 0.42], [-0.2, 0.55], [-0.6, 0.42], [-1.0, 0.25]);
      S(c, 'front', 120); break;
    }
    case 'afro': {
      const c = []; for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2; const r = i % 2 ? 1.42 : 1.55; c.push([Math.cos(a) * r, Math.sin(a) * r * 0.95 + 0.3]); }
      S(c, 'back', 140);
      S([[-1.0, 0.3], [-0.9, 0.85], [-0.4, 1.12], [0.3, 1.14], [0.9, 0.85], [1.0, 0.3], [0.7, 0.55], [0.2, 0.62], [-0.3, 0.6], [-0.75, 0.52]], 'front');
      break;
    }
    case 'ponytail': {
      S(sideCap, 'front');
      const s = f >= 0 ? -1 : 1;
      S([[0.55 * s, 0.85], [1.25 * s, 0.6], [1.55 * s, -0.1], [1.42 * s, -0.95], [1.1 * s, -1.25], [1.05 * s, -0.55], [0.95 * s, 0.1], [0.7 * s, 0.4]], 'back');
      out.push({ pts: sc(ellipsePts(0.16, 0.12, 24, 0.86 * s, 0.62), R), layer: 'back2', color: P.royal });
      break;
    }
    case 'long':
      S(cap.map(([x, y]) => [x * 1.03 + f * 0.05, y]), 'front');
      S([[-1.12, 0.6], [-1.22, -0.4], [-1.12, -1.35], [-0.6, -1.55], [0.0, -1.4], [0.6, -1.55], [1.12, -1.35], [1.22, -0.4], [1.12, 0.6], [0.6, 1.15], [-0.6, 1.15]], 'back');
      break;
    case 'wavyLong': // Helen Keller (child) — long wavy hair with a bow
      S(cap.map(([x, y]) => [x * 1.03 + f * 0.05, y + 0.02]), 'front');
      S([[-1.1, 0.7], [-1.3, 0.0], [-1.18, -0.6], [-1.38, -1.2], [-1.15, -1.75], [-0.55, -1.65], [0, -1.5], [0.55, -1.65], [1.15, -1.75], [1.38, -1.2], [1.18, -0.6], [1.3, 0.0], [1.1, 0.7], [0.6, 1.18], [-0.6, 1.18]], 'back', 140);
      out.push({ pts: sc(roundPoly([[-0.05, 0], [-0.42, 0.22], [-0.42, -0.22]], 0.06), R, 0.55 - f * 0.2, 1.05 * R), layer: 'front2', color: '#8EC5FF', abs: true });
      out.push({ pts: sc(roundPoly([[0.05, 0], [0.42, 0.22], [0.42, -0.22]], 0.06), R, 0.55 - f * 0.2, 1.05 * R), layer: 'front2', color: '#8EC5FF', abs: true });
      break;
    case 'bun':
      S(cap.map(([x, y]) => [x + f * 0.06, y]), 'front');
      out.push({ pts: sc(circlePts(0.4, 32, -f * 0.4, 1.18), R), layer: 'back' });
      break;
    case 'braids': {
      S(sideCap, 'front');
      for (const s of [-1, 1]) {
        const line = [[0.92 * s, 0.1], [1.0 * s, -0.5], [0.95 * s, -1.1], [0.98 * s, -1.6]];
        out.push({ pts: sc(strokePts(curvePts(line, 20), 0.34), R), layer: 'back' });
      }
      break;
    }
    case 'bald':
      break;
    case 'wavyAdult':
      S(cap.map(([x, y]) => [x * 1.04 + f * 0.06, y + 0.02]), 'front');
      S([[-1.1, 0.7], [-1.2, -0.2], [-1.05, -0.7], [-0.5, -0.6], [0.5, -0.6], [1.05, -0.7], [1.2, -0.2], [1.1, 0.7], [0.6, 1.15], [-0.6, 1.15]], 'back');
      break;
    case 'victorianBun': // Anne Sullivan — centre part, hair gathered back
      S([[-1.06, 0.05], [-1.02, 0.6], [-0.6, 1.05], [0, 1.14], [0.6, 1.05], [1.02, 0.6], [1.06, 0.05], [0.85, 0.5], [0.4, 0.78], [0.0, 0.84], [-0.4, 0.78], [-0.85, 0.5]], 'front');
      out.push({ pts: sc(ellipsePts(0.48, 0.4, 32, -0.75 * Math.sign(f || 1), 0.55), R), layer: 'back' });
      break;
  }
  return out;
}

// ------------------------------------------------------------------ factory
export function createHuman(o = {}) {
  const A = { ...(o.adult ? ADULT : KID), ...(o.dims || {}) };
  const R = A.headR;
  const skin = o.skin || P.skins[1];
  const skinS = shade(skin, 0.86);
  const hairC = o.hairColor || P.hairs[0];
  const outfit = o.outfit || 'pathfinder';
  const fit = {
    shirt: P.shirt, pants: P.pants, scarf: P.scarf, shoe: P.shoe, sock: '#FFFFFF', robe: '#C9B38A', robe2: '#8C6A45', sash: '#7A3B2E', ...(o.colors || {}),
  };
  const hipY = A.thigh + A.shin + A.ankle;
  const root = new THREE.Group(); root.name = o.name || 'human';
  const J = {}; const parts = {};
  J.hips = joint(root, 0, hipY);

  const longSleeves = ['robe', 'royal', 'victorianChild', 'victorianWoman', 'gown', 'edwardian'].includes(outfit);
  const longSkirt = ['robe', 'royal', 'victorianWoman', 'gown', 'edwardian'].includes(outfit);
  const kneeSkirt = outfit === 'victorianChild' || (outfit === 'pathfinder' && o.skirt);
  const legColor = outfit === 'pathfinder' && !o.skirt ? fit.pants : (outfit === 'victorianChild' ? '#3B2F45' : outfit === 'pathfinder' ? skin : fit.robe2);
  const sleeveColor = { pathfinder: fit.shirt, robe: fit.robe, royal: fit.robe, victorianChild: fit.shirt, victorianWoman: fit.robe, gown: '#1E1B26', edwardian: fit.robe }[outfit] || fit.shirt;

  // ---- legs
  for (const s of ['L', 'R']) {
    const sx = s === 'L' ? -A.hipW : A.hipW;
    const hip = J['hip' + s] = joint(J.hips, sx, 0, LEG_FAR);
    const thighC = kneeSkirt ? skin : legColor;
    parts['thigh' + s] = vpart({ pts: capsulePts(A.thigh, A.legR, A.legR * 0.93), color: thighC, shade: shade(thighC, 0.85), mode: 2, p: [1, 0, A.legR * 0.35, 0], z: 0 });
    hip.add(parts['thigh' + s]);
    const knee = J['knee' + s] = joint(hip, 0, -A.thigh, 0.001);
    const shinC = kneeSkirt ? (outfit === 'victorianChild' ? '#3B2F45' : skin) : legColor;
    parts['shin' + s] = vpart({ pts: capsulePts(A.shin, A.legR * 0.93, A.legR * 0.8), color: shinC, shade: shade(shinC, 0.85), mode: 2, p: [1, 0, A.legR * 0.3, 0], z: 0 });
    knee.add(parts['shin' + s]);
    if (outfit === 'pathfinder' && o.skirt) {
      const sock = vpart({ pts: rrectPts(A.legR * 1.75, 0.2, 0.05, 0, -A.shin + 0.06), color: fit.sock, outline: 0.022, z: 0.0005 });
      knee.add(sock);
    }
    const ank = J['ankle' + s] = joint(knee, 0, -A.shin, 0.002);
    const shoeC = longSkirt && outfit === 'robe' ? '#8A5A36' : fit.shoe;
    parts['foot' + s] = vpart({ pts: blobPts([[-0.13, 0.05], [0.0, 0.07], [0.15, 0.03], [0.22, -0.05], [0.18, -0.1], [-0.05, -0.1], [-0.15, -0.07]].map(([x, y]) => [x * (o.adult ? 1.15 : 1), y]), 40), color: shoeC, shade: shade(shoeC, 0.75), mode: 3, p: [-0.1, 0.06, 0, 0], z: 0 });
    ank.add(parts['foot' + s]);
  }
  // pelvis / shorts block (behind both legs, fills the crotch)
  const pelW = 2 * (A.hipW + A.legR) + 0.02;
  parts.pelvis = vpart({ pts: roundPoly([[-pelW / 2, 0.15], [pelW / 2, 0.15], [pelW / 2 - 0.02, -0.16], [0.05, -0.25], [-0.05, -0.25], [-pelW / 2 + 0.02, -0.16]], 0.06), color: kneeSkirt || longSkirt ? fit.pants : legColor, z: Z.pelvis });
  J.hips.add(parts.pelvis);

  // ---- spine & torso
  J.spine = joint(J.hips, 0, 0.02);
  const tTop = 2 * A.shoulderW + A.armR * 1.1, tBot = pelW + 0.04;
  const torsoColor = outfit === 'pathfinder' ? fit.shirt : outfit === 'gown' ? '#1E1B26' : fit.robe;
  parts.torso = vpart({ pts: transformPts(trapPts(tTop, tBot, A.torso + 0.08, 0.14), { y: A.torso + 0.02 }), color: torsoColor, shade: shade(torsoColor, 0.86), mode: 1, p: [-0.25, A.torso * 0.7, A.torso * 0.85, 0], z: Z.torso });
  J.spine.add(parts.torso);
  // long robes / dresses: skirt attached to hips, covering legs
  if (longSkirt || kneeSkirt) {
    const len = longSkirt ? A.thigh + A.shin * 0.92 : (outfit === 'victorianChild' ? A.thigh * 1.15 : A.thigh * 0.78);
    const wb = tBot + (longSkirt ? 0.42 : 0.3);
    const skirtC = outfit === 'pathfinder' ? fit.pants : outfit === 'gown' ? '#1E1B26' : outfit === 'victorianChild' ? fit.shirt : fit.robe;
    const sk = vpart({ pts: transformPts(trapPts(tBot - 0.02, wb, len + 0.08, 0.1), { y: 0.1 }), color: skirtC, shade: shade(skirtC, 0.85), mode: 2, p: [1, -0.2, 0.12, 0], z: Z.robe });
    J.skirt = joint(J.hips, 0, 0, 0); J.skirt.add(sk); parts.skirt = sk;
    if (outfit === 'robe' || outfit === 'royal') {      // hem band
      const hem = vpart({ pts: transformPts(trapPts(wb - 0.06, wb, 0.1, 0.03), { y: -len + 0.08 }), color: outfit === 'royal' ? P.gold : fit.robe2, outline: 0, z: Z.robe + 0.002 });
      J.skirt.add(hem);
    }
  }
  // belt
  if (outfit === 'pathfinder') {
    parts.belt = vpart({ pts: rrectPts(tBot + 0.02, 0.09, 0.03, 0, 0.03), color: P.belt, outline: 0.02, z: Z.belt });
    J.spine.add(parts.belt);
    J.spine.add(vpart({ pts: rrectPts(0.12, 0.08, 0.02, 0, 0.03), color: P.gold, outline: 0.016, z: Z.belt + 0.002 }));
  } else if (outfit === 'robe' || outfit === 'royal' || outfit === 'victorianChild') {
    const bc = outfit === 'royal' ? P.gold : outfit === 'victorianChild' ? '#8EC5FF' : fit.sash;
    parts.belt = vpart({ pts: rrectPts(tBot + 0.04, 0.12, 0.04, 0, 0.06), color: bc, outline: 0.02, z: Z.belt + 0.01 });
    J.spine.add(parts.belt);
  }
  // chest details live in their own group so they can slide with a 3/4 turn
  J.chest = joint(J.spine, 0, 0, 0);
  // pathfinder shirt details: pockets, placket, scarf
  if (outfit === 'pathfinder') {
    const pc = shade(fit.shirt, 0.88);
    for (const s of [-1, 1]) J.chest.add(vpart({ pts: rrectPts(0.2, 0.16, 0.03, s * 0.19, A.torso - 0.38), color: pc, outline: 0.016, z: 0.006 }));
    J.chest.add(vpart({ pts: rrectPts(0.035, A.torso * 0.62, 0.015, 0, A.torso * 0.36), color: pc, outline: 0, z: 0.004 }));
    for (let i = 0; i < 3; i++) J.chest.add(vpart({ pts: circlePts(0.022, 12, 0, A.torso * (0.18 + i * 0.16)), color: '#FFFFFF', outline: 0.012, z: 0.008 }));
    // scarf: triangle on the chest + band around the collar + slide ring
    const sy = A.torso + 0.02;
    parts.scarf = vpart({ pts: roundPoly([[-0.3, sy + 0.02], [0.3, sy + 0.02], [0.03, sy - 0.48], [-0.03, sy - 0.48]], 0.05), color: fit.scarf, shade: shade(fit.scarf, 0.86), mode: 2, p: [1, -0.3, 0.05, 0], z: Z.scarf });
    J.chest.add(parts.scarf);
    J.chest.add(vpart({ pts: rrectPts(0.11, 0.1, 0.035, 0, sy - 0.14), color: '#3A2F5C', outline: 0.016, z: Z.scarf + 0.004 }));
  } else if (outfit === 'robe' && o.mantle) {
    const mc = o.mantle;
    J.chest.add(vpart({ pts: roundPoly([[-tTop / 2 - 0.02, A.torso + 0.06], [-0.05, A.torso + 0.08], [tBot / 2 + 0.06, 0.05], [tBot / 2 - 0.12, -0.1], [-tTop / 2 + 0.05, A.torso * 0.25]], 0.08), color: mc, shade: shade(mc, 0.85), mode: 2, p: [1, -0.4, 0.1, 0], z: Z.scarf }));
  } else if (outfit === 'royal') {
    parts.cape = vpart({ pts: roundPoly([[-tTop / 2 - 0.05, A.torso + 0.05], [tTop / 2 + 0.05, A.torso + 0.05], [tBot / 2 + 0.38, -A.thigh - A.shin * 0.8], [-tBot / 2 - 0.38, -A.thigh - A.shin * 0.8]], 0.1), color: fit.cape || '#B3263A', shade: shade(fit.cape || '#B3263A', 0.8), mode: 2, p: [1, 0, 0.1, 0], z: Z.cape });
    J.spine.add(parts.cape);
    J.chest.add(vpart({ pts: rrectPts(tTop + 0.04, 0.16, 0.07, 0, A.torso - 0.02), color: P.gold, shade: shade(P.gold, 0.8), mode: 2, p: [0, -1, 0.0, 0], z: Z.scarf }));
  } else if (outfit === 'victorianWoman' || outfit === 'edwardian' || outfit === 'victorianChild') {
    J.chest.add(vpart({ pts: rrectPts(0.34, 0.14, 0.05, 0, A.torso + 0.02), color: '#FFFFFF', outline: 0.018, z: Z.scarf }));
    if (outfit === 'victorianChild') J.chest.add(vpart({ pts: roundPoly([[-tTop / 2 + 0.02, A.torso + 0.06], [tTop / 2 - 0.02, A.torso + 0.06], [0.12, A.torso - 0.22], [-0.12, A.torso - 0.22]], 0.08), color: '#FFFFFF', outline: 0.018, z: Z.scarf - 0.002 }));
  } else if (outfit === 'gown') {
    J.chest.add(vpart({ pts: roundPoly([[-0.2, A.torso + 0.05], [0.2, A.torso + 0.05], [0.04, A.torso - 0.45], [-0.04, A.torso - 0.45]], 0.04), color: '#FFFFFF', outline: 0.018, z: Z.scarf }));
  }
  if (o.tallit) { // prayer shawl with blue stripes (religious leaders)
    const ty = A.torso + 0.05;
    J.chest.add(vpart({ pts: roundPoly([[-tTop / 2 - 0.03, ty], [tTop / 2 + 0.03, ty], [tTop / 2 - 0.02, ty - 0.55], [0.12, ty - 0.2], [-0.12, ty - 0.2], [-tTop / 2 + 0.02, ty - 0.55]], 0.06), color: '#F2EDE0', z: Z.scarf }));
    for (const s of [-1, 1]) J.chest.add(vpart({ pts: rrectPts(0.24, 0.05, 0.02, s * (tTop / 2 - 0.08), ty - 0.4, 3), color: '#2F5DA8', outline: 0, z: Z.scarf + 0.002 }));
  }

  if (o.lanyard) {   // sunflower lanyard (Lei 14.624/2023): green strap with yellow flowers + card
    const ly = A.torso + 0.04;
    const strap = curvePts([[-0.17, ly], [-0.1, ly - 0.3], [0, ly - 0.5], [0.1, ly - 0.3], [0.17, ly]], 24);
    J.chest.add(vpart({ pts: strokePts(strap, 0.06, false), color: '#2E8B57', outline: 0.012, z: Z.scarf + 0.01 }));
    for (let i = 2; i < strap.length - 2; i += 4) J.chest.add(vpart({ pts: circlePts(0.022, 10, strap[i][0], strap[i][1]), color: P.yellow, outline: 0, z: Z.scarf + 0.012 }));
    J.chest.add(vpart({ pts: rrectPts(0.2, 0.15, 0.03, 0, ly - 0.6), color: '#2E8B57', outline: 0.014, z: Z.scarf + 0.013 }));
    J.chest.add(vpart({ pts: circlePts(0.045, 14, 0, ly - 0.6), color: P.yellow, outline: 0, z: Z.scarf + 0.015 }));
  }
  // ---- neck & head
  J.neck = joint(J.spine, 0, A.torso, 0);
  parts.neck = vpart({ pts: rrectPts(0.2 * (o.adult ? 1.1 : 1), A.neck + 0.18, 0.08, 0, A.neck / 2), color: skin, shade: skinS, mode: 2, p: [0, -1, -A.neck * 0.1, 0], z: Z.neck });
  J.neck.add(parts.neck);
  J.head = joint(J.neck, 0, A.neck, 0);
  J.face = joint(J.head, 0, R * 0.88, 0);
  const face = buildFace(J.face, { R, skin, skinS, hairC, o });

  // ---- arms
  for (const s of ['L', 'R']) {
    const sx = s === 'L' ? -A.shoulderW : A.shoulderW;
    const sh = J['sh' + s] = joint(J.spine, sx, A.torso - 0.09, ARM_NEAR);
    const upperC = outfit === 'pathfinder' ? skin : sleeveColor;
    parts['upper' + s] = vpart({ pts: capsulePts(A.upperArm, A.armR, A.armR * 0.9), color: upperC, shade: shade(upperC, 0.86), mode: 2, p: [s === 'L' ? -1 : 1, 0, A.armR * 0.35, 0], z: 0 });
    sh.add(parts['upper' + s]);
    if (outfit === 'pathfinder') {   // short sleeve with a plain coloured patch (generic, not an insignia)
      sh.add(vpart({ pts: roundPoly([[-A.armR * 1.25, A.armR * 0.9], [A.armR * 1.25, A.armR * 0.9], [A.armR * 1.3, -A.upperArm * 0.55], [-A.armR * 1.3, -A.upperArm * 0.55]], 0.07), color: fit.shirt, shade: shade(fit.shirt, 0.86), mode: 2, p: [s === 'L' ? -1 : 1, 0, A.armR * 0.5, 0], z: 0.0006 }));
      sh.add(vpart({ pts: circlePts(0.07, 20, 0, -A.upperArm * 0.25), color: o.patch || P.royal, outline: 0.014, z: 0.0008 }));
    }
    const el = J['el' + s] = joint(sh, 0, -A.upperArm, 0.001);
    const foreC = longSleeves ? sleeveColor : skin;
    parts['fore' + s] = vpart({ pts: capsulePts(A.forearm, A.armR * 0.9, A.armR * 0.78), color: foreC, shade: shade(foreC, 0.86), mode: 2, p: [s === 'L' ? -1 : 1, 0, A.armR * 0.3, 0], z: 0 });
    el.add(parts['fore' + s]);
    if (longSleeves) el.add(vpart({ pts: rrectPts(A.armR * 2.1, 0.08, 0.03, 0, -A.forearm + 0.02), color: outfit === 'royal' ? P.gold : '#FFFFFF', outline: 0.016, z: 0.0008 }));
    const wr = J['wr' + s] = joint(el, 0, -A.forearm, 0.002);
    parts['hand' + s] = makeHand(wr, A.hand, skin, s);
  }

  // ---- api
  const h = {
    root, J, parts, face, A, R, hipY, o, facing: 0,
    pose: {}, // last applied pose
    setFacing(f) {
      this.facing = f;
      const nearL = f > 0.12; const nearR = f < -0.12;
      // arms: in 3/4 views the screen-side arm away from the facing direction is nearest the camera
      J.shL.position.z = nearL || (!nearR) ? ARM_NEAR : ARM_FAR;
      J.shR.position.z = nearR || (!nearL) ? ARM_NEAR : ARM_FAR;
      if (Math.abs(f) > 0.12) { J.shL.position.z = f > 0 ? ARM_NEAR : ARM_FAR; J.shR.position.z = f > 0 ? ARM_FAR : ARM_NEAR; }
      J.hipL.position.z = f > 0 ? LEG_NEAR : LEG_FAR; J.hipR.position.z = f > 0 ? LEG_FAR : LEG_NEAR;
      if (Math.abs(f) <= 0.12) { J.hipL.position.z = LEG_FAR; J.hipR.position.z = LEG_NEAR; }
      // narrow the shoulders a little when turned
      // 3/4 cheat: the near shoulder slides toward the torso centre, the far one tucks in slightly
      const af = Math.abs(f);
      const nearK = 1 - af * 0.62, farK = 1 - af * 0.2;
      J.shL.position.x = -A.shoulderW * (f > 0 ? nearK : farK);
      J.shR.position.x = A.shoulderW * (f < 0 ? nearK : farK);
      parts.torso.scale.x = 1 - af * 0.12;
      for (const s of ['L', 'R']) {
        const d = s === 'L' ? -1 : 1;
        const foot = parts['foot' + s];
        foot.scale.x = Math.abs(f) < 0.12 ? (d < 0 ? -0.9 : 0.9) : (f > 0 ? 1 : -1);
      }
      J.chest.position.x = f * 0.1 * (A.torso / 0.86);
      face.setFacing(f);
    },
    /** Apply a pose: angles in radians, missing keys default to 0 */
    setPose(p) {
      this.pose = p;
      J.hips.position.set(p.hipX || 0, hipY + (p.hipY || 0), J.hips.position.z);
      J.hips.rotation.z = p.hipRot || 0;
      J.spine.rotation.z = p.spine || 0;
      J.neck.rotation.z = p.neck || 0;
      J.head.rotation.z = p.head || 0;
      const arm = (s, a) => { J['sh' + s].rotation.z = a?.[0] || 0; J['el' + s].rotation.z = a?.[1] || 0; J['wr' + s].rotation.z = a?.[2] || 0; };
      const leg = (s, a) => { J['hip' + s].rotation.z = a?.[0] || 0; J['knee' + s].rotation.z = a?.[1] || 0; J['ankle' + s].rotation.z = a?.[2] || 0; };
      arm('L', p.armL || [-0.12, 0.08, 0]); arm('R', p.armR || [0.12, -0.08, 0]);
      leg('L', p.legL); leg('R', p.legR);
      if (J.skirt) { J.skirt.rotation.z = -(p.hipRot || 0) * 0.5 + (p.skirtSway || 0); J.skirt.scale.y = 1; }
      if (p.handL) this.setHand('L', p.handL); if (p.handR) this.setHand('R', p.handR);
    },
    setHand(s, kind) { const hd = parts['hand' + s]; if (hd.userData.kind !== kind) hd.userData.set(kind); },
    /** IK: put wrist of arm s at world point (x,y); bend chooses elbow side */
    reach(s, x, y, bend = 1, wrist = 0) {
      const sh = J['sh' + s];
      const [lx, ly] = toLocal(sh.parent, x, y);
      const dx = lx - sh.position.x, dy = ly - sh.position.y;
      const [a, b] = solve2(A.upperArm, A.forearm, dx, dy, bend);
      sh.rotation.z = a; J['el' + s].rotation.z = b; J['wr' + s].rotation.z = wrist;
    },
    /** IK for legs (foot ankle to world point) */
    plant(s, x, y, bend = -1) {
      const hp = J['hip' + s];
      const [lx, ly] = toLocal(hp.parent, x, y);
      const [a, b] = solve2(A.thigh, A.shin, lx - hp.position.x, ly - hp.position.y, bend);
      hp.rotation.z = a; J['knee' + s].rotation.z = b;
    },
  };
  h.setFacing(o.facing || 0);
  h.setPose({});
  return h;
}

// ------------------------------------------------------------------ hands
function makeHand(wr, L, skin, side) {
  const g = new THREE.Group(); wr.add(g);
  const d = side === 'L' ? -1 : 1;
  const palm = vpart({ pts: blobPts([[-0.075, 0.02], [0.075, 0.02], [0.085, -0.08], [0.05, -0.15], [-0.05, -0.15], [-0.085, -0.08]].map(([x, y]) => [x * L / 0.17, y * L / 0.17]), 40), color: skin, shade: shade(skin, 0.86), mode: 2, p: [d, 0, 0.03, 0], z: 0 });
  const thumb = vpart({ pts: capsulePts(0.08 * L / 0.17, 0.028 * L / 0.17, 0.024 * L / 0.17), color: skin, z: 0.0004 });
  thumb.position.set(-d * 0.06 * L / 0.17, -0.03 * L / 0.17, 0); thumb.rotation.z = -d * 0.7;
  const finger = vpart({ pts: capsulePts(0.12 * L / 0.17, 0.026 * L / 0.17, 0.022 * L / 0.17), color: skin, z: 0.0005 });
  finger.position.set(0.035 * d * L / 0.17, -0.12 * L / 0.17, 0); finger.visible = false;
  g.add(palm, thumb, finger);
  g.userData.kind = 'open';
  g.userData.set = (kind) => {
    g.userData.kind = kind;
    finger.visible = kind === 'point';
    palm.scale.set(1, kind === 'fist' || kind === 'point' || kind === 'hold' ? 0.72 : 1, 1);
    thumb.rotation.z = kind === 'fist' || kind === 'hold' ? -d * 1.4 : -d * 0.7;
    thumb.position.y = kind === 'fist' || kind === 'hold' ? -0.06 * L / 0.17 : -0.03 * L / 0.17;
  };
  return g;
}

// ------------------------------------------------------------------ face
function buildFace(F, { R, skin, skinS, hairC, o }) {
  const head = vpart({ pts: headPts(R, 0, o.adult, o.jaw), color: skin, shade: skinS, mode: 1, p: [-R * 0.14, R * 0.16, R * 1.0, 0], z: Z.head });
  F.add(head);
  const ears = [];
  for (const s of [-1, 1]) {
    const e = vpart({ pts: ellipsePts(R * 0.16, R * 0.21, 24), color: skin, shade: skinS, mode: 1, p: [s * R * 0.05, 0, R * 0.12, 0], z: Z.head - 0.004 });
    e.position.set(s * R * 0.97, -R * 0.05, 0); F.add(e); ears.push(e);
  }
  // hearing aid (behind-the-ear) on the visible ear(s)
  const aids = [];
  if (o.hearingAid) for (const e of ears) {
    const a = vpart({ pts: roundPoly([[-0.02, 0.2], [0.07, 0.17], [0.08, -0.05], [0.01, -0.12], [-0.04, 0.0]].map(([x, y]) => [x * R * 1.2, y * R * 1.2]), 0.03), color: o.hearingAid, shade: shade(o.hearingAid, 0.8), mode: 2, p: [1, 0, 0.0, 0], outline: 0.018, z: 0.003 });
    a.position.set(Math.sign(e.position.x) * R * 0.06, 0.02 * R, 0); e.add(a); aids.push(a);
  }
  // hair
  const hairParts = { front: [], back: [] };
  const hp = (h) => {
    const layer = h.layer.startsWith('front') ? 'front' : 'back';
    const z = layer === 'front' ? Z.head + 0.05 + (h.layer === 'front2' ? 0.005 : 0) : Z.hairBack + (h.layer === 'back2' ? 0.005 : 0);
    const c = h.color || hairC;
    const part = vpart({ pts: h.pts, color: c, shade: shade(c, 0.8), mode: 1, p: [-R * 0.25, R * 0.45, R * 1.25, 0], z });
    F.add(part); hairParts[layer].push(part);
  };
  let hairList = hairShapes(o.hair || 'short', R, 0);
  hairList.forEach(hp);
  // eyes
  const eyes = [];
  for (const s of [-1, 1]) {
    const eg = new THREE.Group(); F.add(eg);
    const white = vpart({ pts: ellipsePts(R * 0.155, R * 0.2, 32), color: '#FFFFFF', outline: 0.022, z: Z.head + 0.012 });
    const pupilG = new THREE.Group(); pupilG.position.z = Z.head + 0.014;
    const pupil = vpart({ pts: circlePts(R * 0.105, 28), color: o.eyeColor || '#2A1B14', outline: 0, z: 0 });
    const glint = vpart({ pts: circlePts(R * 0.035, 16, R * 0.035, R * 0.04), color: '#FFFFFF', outline: 0, z: 0.001 });
    pupilG.add(pupil, glint);
    const lid = vpart({ pts: ellipsePts(R * 0.17, R * 0.215, 32), color: skin, outline: 0, z: Z.head + 0.016 });
    lid.visible = false;
    eg.add(white, pupilG, lid);
    eyes.push({ g: eg, pupilG, lid, s });
  }
  const brows = [];
  for (const s of [-1, 1]) {
    const b = vpart({ pts: rrectPts(R * 0.3, R * 0.075, R * 0.035), color: shade(hairC, 0.9), outline: 0, z: Z.head + 0.06 });
    F.add(b); brows.push({ b, s });
  }
  const nose = vpart({ pts: ellipsePts(R * 0.085, R * 0.065, 20), color: shade(skin, 0.86), outline: 0, z: Z.head + 0.01 });
  F.add(nose);
  const cheeks = [];
  for (const s of [-1, 1]) {
    const c = vpart({ pts: ellipsePts(R * 0.13, R * 0.08, 20), color: '#F08A8A', outline: 0, z: Z.head + 0.009, opacity: 0.35 });
    F.add(c); cheeks.push({ c, s });
  }
  const mouthG = new THREE.Group(); F.add(mouthG);
  const mouth = vpart({ pts: mouthPts(R, 0, 0.6, 1), color: '#E46A7C', shade: '#5B1B2E', mode: 1, p: [0, -R * 0.62, R * 0.2, 0], outline: 0.018, z: Z.head + 0.02 });
  mouthG.add(mouth);
  // optional accessories
  let glasses = null;
  if (o.glasses) {
    glasses = new THREE.Group(); F.add(glasses);
    for (const sd of [-1, 1]) {
      const ring = vring({ outer: rrectPts(R * 0.44, R * 0.38, R * 0.13, sd * R * 0.36, 0), inner: rrectPts(R * 0.34, R * 0.28, R * 0.09, sd * R * 0.36, 0), color: o.glasses, z: Z.head + 0.03 });
      glasses.add(ring);
    }
    glasses.add(vpart({ pts: rrectPts(R * 0.16, R * 0.05, R * 0.02, 0, R * 0.04), color: o.glasses, outline: 0, z: Z.head + 0.03 }));
  }
  let beard = null;
  if (o.beard) {
    beard = vpart({ pts: blobPts([[-0.95, 0.05], [-0.7, -0.6], [-0.3, -1.08], [0.3, -1.08], [0.7, -0.6], [0.95, 0.05], [0.6, -0.25], [0.25, -0.38], [0, -0.32], [-0.25, -0.38], [-0.6, -0.25]].map(([x, y]) => [x * R, y * R]), 90), color: o.beardColor || hairC, shade: shade(o.beardColor || hairC, 0.8), mode: 1, p: [-R * 0.2, 0, R * 0.9, 0], z: Z.head + 0.018 });
    F.add(beard);
    mouth.position.z = 0.01;
  }
  const hat = [];
  if (o.crown) {
    const c = vpart({ pts: roundPoly([[-0.62, 0.0], [0.62, 0.0], [0.66, 0.42], [0.42, 0.22], [0.22, 0.5], [0.0, 0.25], [-0.22, 0.5], [-0.42, 0.22], [-0.66, 0.42]].map(([x, y]) => [x * R, y * R + R * 0.9]), 0.03), color: P.gold, shade: shade(P.gold, 0.8), mode: 2, p: [1, 0, 0.1 * R, 0], z: Z.head + 0.07 });
    F.add(c); hat.push(c);
    for (const x of [-0.3, 0, 0.3]) { const j = vpart({ pts: circlePts(R * 0.06, 12, x * R, R * 1.0), color: x === 0 ? P.red : P.turquoise, outline: 0.012, z: Z.head + 0.075 }); F.add(j); hat.push(j); }
  }
  if (o.headcloth) {
    const hc = o.headcloth;
    const back = vpart({ pts: blobPts([[-1.15, 0.3], [-1.3, -0.6], [-1.25, -1.5], [-0.6, -1.65], [0.6, -1.65], [1.25, -1.5], [1.3, -0.6], [1.15, 0.3], [0.85, 1.05], [0, 1.28], [-0.85, 1.05]].map(([x, y]) => [x * R, y * R]), 90), color: hc, shade: shade(hc, 0.82), mode: 1, p: [-R * 0.3, R * 0.2, R * 1.3, 0], z: Z.hairBack + 0.01 });
    const front = vpart({ pts: blobPts([[-1.12, 0.1], [-1.05, 0.7], [-0.6, 1.12], [0, 1.25], [0.6, 1.12], [1.05, 0.7], [1.12, 0.1], [0.85, 0.55], [0, 0.7], [-0.85, 0.55]].map(([x, y]) => [x * R, y * R]), 70), color: hc, shade: shade(hc, 0.82), mode: 1, p: [-R * 0.3, R * 0.5, R * 1.2, 0], z: Z.head + 0.06 });
    F.add(back, front); hat.push(back, front);
    if (o.headband) { const hb = vpart({ pts: strokePts(curvePts([[-1.08, 0.38], [0, 0.66], [1.08, 0.38]].map(([x, y]) => [x * R, y * R]), 20), R * 0.12), color: o.headband, outline: 0.016, z: Z.head + 0.065 }); F.add(hb); hat.push(hb); }
  }
  if (o.mortarboard) {
    const cap = vpart({ pts: rrectPts(R * 1.5, R * 0.42, R * 0.12, 0, R * 0.92), color: '#1E1B26', z: Z.head + 0.07 });
    const board = vpart({ pts: roundPoly([[-1.25, 1.25], [0, 1.45], [1.25, 1.25], [0, 1.05]].map(([x, y]) => [x * R, y * R]), 0.02), color: '#2A2633', z: Z.head + 0.072 });
    const tassel = vpart({ pts: strokePts([[R * 0.05, R * 1.25], [R * 0.8, R * 1.1], [R * 0.85, R * 0.65]], R * 0.06), color: P.gold, outline: 0.01, z: Z.head + 0.074 });
    F.add(cap, board, tassel); hat.push(cap, board, tassel);
  }

  const st = { mouthOpen: 0, smile: 0.6, width: 1, brow: 0, browTilt: 0, look: [0, 0], blink: 0, facing: 0 };
  const api = {
    head, ears, eyes, brows, mouth, nose, hair: hairParts, glasses, beard, hat,
    setFacing(f) {
      st.facing = f;
      vreshape(head, headPts(R, f, o.adult, o.jaw));
      const ex = R * 0.34, sh = f * R * 0.24;
      eyes.forEach(({ g, s }) => { g.position.set(s * ex * (1 - Math.abs(f) * 0.12) + sh, R * 0.02, 0); g.scale.x = 1 - (s * f < 0 ? Math.abs(f) * 0.28 : 0); });
      brows.forEach(({ b, s }) => { b.position.x = s * ex * (1 - Math.abs(f) * 0.12) + sh; });
      nose.position.set(f * R * 0.42, -R * 0.2, 0);
      cheeks.forEach(({ c, s }) => { c.position.set(s * R * 0.55 + f * R * 0.15, -R * 0.3, 0); c.visible = !(s * f < -0.5); });
      mouthG.position.set(f * R * 0.3, 0, 0);
      ears.forEach((e, i) => { const s = i ? 1 : -1; e.position.x = s * R * 0.97 + f * R * 0.2; e.visible = !(s * f > 0.55); });
      if (glasses) glasses.position.x = sh;
      if (beard) beard.position.x = f * R * 0.15;
      // re-place hair for side-dependent styles
      for (const L of ['front', 'back']) { hairParts[L].forEach((p) => { F.remove(p); }); hairParts[L] = []; }
      hairShapes(o.hair || 'short', R, f).forEach(hp);
      this.apply();
    },
    set(v) { Object.assign(st, v); this.apply(); },
    apply() {
      vreshape(mouth, mouthPts(R, st.mouthOpen, st.smile, st.width), 0.018);
      eyes.forEach(({ g, pupilG, lid, s }) => {
        const bl = clamp(st.blink); g.scale.y = 1 - bl * 0.92;
        pupilG.position.set(st.look[0] * R * 0.06, st.look[1] * R * 0.07, pupilG.position.z);
      });
      brows.forEach(({ b, s }) => { b.position.y = R * (0.4 + st.brow * 0.1); b.rotation.z = -s * st.browTilt * 0.35; });
    },
  };
  api.setFacing(0);
  return api;
}

function headPts(R, f, adult, jaw = 0) {
  const k = adult ? 1.06 : 1.0;
  const ctrl = [[0, 1.02], [0.74, 0.8], [1.0, 0.1], [0.9, -0.45 * k], [0.52 + jaw * 0.1, -0.86 * k], [0, -0.98 * k], [-0.52 - jaw * 0.1, -0.86 * k], [-0.9, -0.45 * k], [-1.0, 0.1], [-0.74, 0.8]];
  return blobPts(ctrl.map(([x, y]) => [(x + (y < 0 ? f * 0.1 * -y : 0)) * R, y * R]), 72);
}

function mouthPts(R, o, s, w = 1) {
  const hw = R * (0.2 + 0.06 * Math.max(0, s) + 0.04 * o) * w, cy = -R * 0.5;
  const pts = [];
  const N = 16;
  for (let i = 0; i <= N; i++) { const u = -1 + 2 * i / N; pts.push([u * hw, cy + s * R * 0.08 * u * u + o * R * 0.04 * (1 - u * u)]); }
  for (let i = N; i >= 0; i--) { const u = -1 + 2 * i / N; pts.push([u * hw, cy + s * R * 0.08 * u * u - (R * 0.035 + o * R * 0.3 + Math.max(0, s) * R * 0.07) * (1 - u * u)]); }
  return pts;
}
