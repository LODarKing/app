// PILOT — first 10.6 s of scene 1 in the v2 hand-drawn vector style.
// Deterministic: everything is a pure function of t (HyperFrames seeks with the hf-seek event).
import * as THREE from 'three';
import { assignOrder, Part, curve, circle, poly, soft, f, lerp, clamp } from './vec.js';
import { createTheo } from './chars/theo.js';
import { createGabriel } from './chars/gabriel.js';
import { createGirl } from './chars/girl.js';
import { createClubhouse, groundAt, stairsProfile, STEP, PORCH_Y } from './env/clubhouse.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('world');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, stencil: true, preserveDrawingBuffer: true, alpha: false });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor('#CDEFFB');
const scene = new THREE.Scene();
const stage = new THREE.Group(); stage.scale.set(1, -1, 1); scene.add(stage);
const cam = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -100, 100);

// ---------- easing / keys ----------
const ss = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const sm = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
const outBack = (x) => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
/** piecewise smooth keys [[t, v], ...] (holds outside) */
function keys(t, k, ease = sm) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) {
    const [t0, v0] = k[i], [t1, v1] = k[i + 1];
    if (t <= t1) { const e = ease((t - t0) / (t1 - t0)); return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], e)) : lerp(v0, v1, e); }
  }
  return k[k.length - 1][1];
}
const blinkAt = (t, times) => { let b = 0; for (const b0 of times) { const x = (t - b0) / 0.16; if (x > 0 && x < 1) b = Math.max(b, Math.sin(x * Math.PI)); } return b; };

// ---------- set ----------
const set = createClubhouse();
stage.add(set.root);

// ---------- characters ----------
const S = 0.537;                               // world px per "Gabriel sheet unit / 0.78"
const theo = createTheo();
const sT = 0.82 * S, theoG = new THREE.Group(); theoG.add(theo.root); theoG.scale.set(sT, sT, 1);
const gab = createGabriel();
const sG = 0.78 * S, gabG = new THREE.Group(); gabG.add(gab.root); gabG.scale.set(sG, sG, 1);
const girl = createGirl();
const sD = 0.82 * S, girlG = new THREE.Group(); girlG.add(girl.root); girlG.scale.set(sD, sD, 1);
const chars = new THREE.Group(); chars.userData.z = 20; set.root.add(chars);
// order inside the set: girl (back, on porch), Gabriel, Theo (front, on the sidewalk)
girlG.userData.z = 2; gabG.userData.z = 1; theoG.userData.z = 3; chars.add(girlG, gabG, theoG);
// the set layers are Bones with userData.z; characters must sit between the set (z 5) and the foreground (z 50)
chars.userData.z = 20;
// contact shadows
const shTheo = soft(0, 0, 300, 34, '#2A2410', 0.32), shGab = soft(0, 0, 150, 22, '#2A2410', 0.3), shGirl = soft(0, 0, 140, 22, '#2A2410', 0.3);
const shadows = new THREE.Group(); shadows.userData.z = 0.5; shadows.add(shGirl, shGab, shTheo); chars.add(shadows);

// ---------- barrier highlight + question mark ----------
const fx = new THREE.Group(); fx.userData.z = 30; set.root.add(fx);
const glow = soft(410, -122, 640, 380, '#FF6A3D', 0); fx.add(glow); glow.userData.z = 0;
const barrierLine = new Part({ olFree: [[stairsProfile(), '#FF5A3C', 9]] }); barrierLine.userData.z = 1; fx.add(barrierLine);
const qm = new THREE.Group(); qm.userData.z = 2; fx.add(qm);
const qD = curve([[-38, -46], [-34, -86], [0, -104], [36, -88], [40, -52], [12, -28], [0, -4], [0, 16]]);
const qPart = new Part({ olFree: [[qD, '#211C55', 46], [qD, '#FFEB00', 28]], top: [] });
const qDot = new Part({ fill: [[circle(0, 60, 23), '#211C55']], top: [[circle(0, 60, 14), '#FFEB00']] });
qm.add(qPart, qDot);
const qGlow = soft(0, 0, 360, 360, '#FFF3A0', 0); qm.add(qGlow); qGlow.userData.z = -1;

// ---------- Theo motion ----------
const AXLE_STOP = -60, AXLE_START = -600, T_STOP = 4.45;
const RW = theo.R_TIRE * sT;                 // wheel radius in set px
function theoX(t) { const k = clamp(t / T_STOP); return AXLE_START + (AXLE_STOP - AXLE_START) * (1 - Math.pow(1 - k, 2.2)); }
const CONTACT = 0.87, CYCLE = 2.5;
const totalRot = (AXLE_STOP - AXLE_START) / RW;
const PHI = ((0.62 - (totalRot % CYCLE)) % CYCLE + CYCLE) % CYCLE;
const A_GRAB = -110 * Math.PI / 180, R_WR = 191;
const rimPt = (a) => [theo.AXLE[0] + Math.cos(a - 0.14) * R_WR, theo.AXLE[1] + Math.sin(a - 0.14) * R_WR];

function poseTheo(t) {
  const x = theoX(t), rot = (x - AXLE_START) / RW;
  theoG.position.set(x - theo.AXLE[0] * sT, -theo.ground * sT, 0);
  const b = theo.bones;
  b.wheel.rotation.z = rot;
  b.caster.rotation.z = rot * (theo.R_TIRE / theo.R_CASTER);
  // push cycle in rotation space
  const ph = ((rot + PHI) % CYCLE + CYCLE) % CYCLE;
  let target, handA;
  if (ph < CONTACT) { handA = A_GRAB + ph; target = rimPt(handA); }
  else {
    const k = (ph - CONTACT) / (CYCLE - CONTACT), e = ss(k);
    const a0 = A_GRAB + CONTACT, a = lerp(a0, A_GRAB, e);
    const p = rimPt(a), lift = 46 * Math.sin(k * Math.PI);
    target = [p[0] - lift * 0.3, p[1] - lift]; handA = a;
  }
  const moving = t < T_STOP;
  const pushing = moving && ph < CONTACT ? Math.sin((ph / CONTACT) * Math.PI) : 0;
  b.torso.rotation.z = 0.035 + 0.07 * pushing + 0.03 * ss((t - 4.0) / 0.4) * (1 - ss((t - 4.9) / 0.5)) - 0.05 * ss((t - 4.7) / 0.8);
  // wave reply (coasting) 1.9 – 3.1
  const wv = ss((t - 1.95) / 0.3) * (1 - ss((t - 2.85) / 0.3));
  const wave = [668 + 16 * Math.sin(t * 12), 540 + 8 * Math.cos(t * 12)];
  const tx = lerp(target[0], wave[0], wv), ty = lerp(target[1], wave[1], wv);
  theo.handTo(tx, ty, handA - (-68.8 * Math.PI / 180), wv);
  // head + face
  b.head.rotation.z = keys(t, [[0, -0.02], [1.6, -0.05], [2.2, -0.08], [3.2, -0.02], [4.5, 0.02], [5.0, -0.16], [6.4, -0.2], [7.2, -0.22], [8.6, -0.2], [9.2, -0.12], [10.6, -0.1]]) + 0.01 * Math.sin(t * 2.3);
  const st = theo.st;
  st.smile = keys(t, [[0, 0.7], [4.4, 0.75], [5.1, 0.2], [5.8, -0.35], [8.6, -0.4], [9.6, 0.1], [10.4, 0.45]]);
  st.open = keys(t, [[0, 0.55], [2.0, 0.75], [3.0, 0.6], [4.6, 0.5], [5.3, 0.12], [6.0, 0.03], [8.8, 0.03], [10.0, 0.2]]);
  st.worry = keys(t, [[0, 0], [5.0, 0], [5.8, 0.85], [8.6, 0.9], [9.8, 0.3], [10.6, 0.1]]);
  st.browUp = keys(t, [[0, 2], [5.0, 3], [5.8, 8], [8.6, 9], [10.6, 4]]);
  st.look = keys(t, [[0, [1, 0]], [4.6, [2, 0]], [5.2, [3, -6]], [8.7, [3, -7]], [9.3, [4, -9]], [10.6, [4, -8]]]);
  st.blink = blinkAt(t, [1.2, 3.6, 6.3, 8.95]);
  st.wide = 1;
  theo.setExpr();
  shTheo.position.set(x + 70, 6, 0);
}

// ---------- walking (feet planted, swing arcs, stairs aware) ----------
function footAt(plants, t, swing = 0.34, lift = 34) {
  // plants: [[t, x]] sorted; foot sits at plant i until (plant i+1 time - swing)
  let i = 0; while (i < plants.length - 1 && t >= plants[i + 1][0]) i++;
  const [t0, x0] = plants[i];
  if (i === plants.length - 1 || t < t0) return { x: x0, y: groundAt(x0), roll: 0, lifting: 0 };
  const [t1, x1] = plants[i + 1];
  const ts = t1 - swing;
  if (t < ts) return { x: x0, y: groundAt(x0), roll: 0, lifting: 0 };
  const k = (t - ts) / swing, e = sm(k);
  const y0 = groundAt(x0), y1 = groundAt(x1);
  const x = lerp(x0, x1, e);
  const y = lerp(y0, y1, sm(clamp((k - 0.25) / 0.75))) - lift * Math.sin(k * Math.PI) - Math.max(0, y0 - y1) * 0;
  return { x, y: Math.min(y, Math.min(y0, y1) - lift * Math.sin(k * Math.PI) * 0.6), roll: -0.25 * Math.sin(k * Math.PI), lifting: Math.sin(k * Math.PI) };
}
function poseKid(kid, G, sc, base, plans, t, ankleLift) {
  const art = kid.art, p = kid.pose;
  const far = footAt(plans.far, t), near = footAt(plans.near, t);
  // convert set -> sheet
  const toSheet = (sx, sy) => [art.rootX + (sx - base[0]) / sc, art.ground + (sy - base[1]) / sc];
  const fA = toSheet(far.x, far.y), nA = toSheet(near.x, near.y);
  p.feet.far = [fA[0] + (art.legs.far.ankle[0] - art.rootX), fA[1] - ankleLift];
  p.feet.near = [nA[0] + (art.legs.near.ankle[0] - art.rootX), nA[1] - ankleLift];
  p.footRot.far = far.roll; p.footRot.near = near.roll;
  // pelvis follows the feet (centre of support) and the lower foot on stairs
  const midX = (far.x + near.x) / 2;
  const supportY = Math.max(far.y, near.y) * 0.35 + Math.min(far.y, near.y) * 0.65;
  const moving = Math.max(far.lifting, near.lifting);
  const bob = -9 * moving;
  const hs = toSheet(midX - 10 * moving, supportY);
  p.hipX = hs[0] - art.rootX;
  p.hipY = (hs[1] - art.ground) + bob / sc + 6 * moving / sc;
  G.position.set(base[0] - art.rootX * sc, base[1] - art.ground * sc, 0);
  return { far, near, moving, midX, supportY };
}

// Gabriel on the porch, then starts down the stairs on "Hoje, vamos descobrir"
const GAB0 = [835, PORCH_Y];
const gabPlans = {
  far: [[0, GAB0[0] - 22], [9.75, GAB0[0] - 22 - 90], [10.3, GAB0[0] - 22 - 200]],
  near: [[0, GAB0[0] + 44], [10.02, GAB0[0] + 44 - 150], [10.58, GAB0[0] + 44 - 260]],
};
const GIRL0 = [655, PORCH_Y];
const girlPlans = {
  far: [[0, GIRL0[0] - 26], [9.2, GIRL0[0] - 26 - 95], [9.75, GIRL0[0] - 26 - 205], [10.3, GIRL0[0] - 26 - 310]],
  near: [[0, GIRL0[0] + 22], [9.48, GIRL0[0] + 22 - 160], [10.02, GIRL0[0] + 22 - 265], [10.58, GIRL0[0] + 22 - 370]],
};

function armWave(p, t, t0, t1, speed = 12, phase = 0) {
  const w = ss((t - t0) / 0.35) * (1 - ss((t - (t1 - 0.35)) / 0.35));
  const a = p.arms.near;
  a.a1 = lerp(a.a1, -0.78, w);
  a.bend = lerp(a.bend, -0.82 + 0.3 * Math.sin(t * speed + phase), w);
  a.wrist = lerp(a.wrist, 0.18 * Math.sin(t * speed + phase - 0.6), w);
  a.kind = w > 0.35 ? 'wave' : 'rest';
  return w;
}
function restArms(kid, t, ph) {
  const p = kid.pose, A = kid.arms;
  p.arms.far.a1 = A.far.rest1 + 0.03 * Math.sin(t * 1.9 + ph); p.arms.far.bend = A.far.rest2 + 0.05 * Math.sin(t * 1.9 + ph + 0.5); p.arms.far.wrist = 0; p.arms.far.kind = 'rest';
  p.arms.near.a1 = A.near.rest1 - 0.03 * Math.sin(t * 1.9 + ph); p.arms.near.bend = A.near.rest2 - 0.05 * Math.sin(t * 1.9 + ph + 0.5); p.arms.near.wrist = 0; p.arms.near.kind = 'rest';
}

function poseGabriel(t) {
  const r = poseKid(gab, gabG, sG, GAB0, gabPlans, t, 80);
  const p = gab.pose; restArms(gab, t, 0);
  p.breath = Math.sin(t * 2.2);
  armWave(p, t, 1.15, 2.9, 12);
  // walking arm swing (opposite to the legs)
  const walk = ss((t - 9.5) / 0.3);
  if (walk > 0) {
    const sw = Math.sin((t - 9.55) * Math.PI / 0.55) * 0.32 * walk;
    p.arms.far.a1 += sw; p.arms.near.a1 -= sw;
    p.arms.far.bend += 0.15 * walk; p.arms.near.bend -= 0.12 * walk;
  }
  // concern: near hand to the chin while thinking (7.2 – 8.7)
  const think = ss((t - 7.15) / 0.4) * (1 - ss((t - 8.55) / 0.35));
  p.arms.far.a1 = lerp(p.arms.far.a1, -1.05, think * 0); // (far arm stays down)
  p.arms.near.a1 = lerp(p.arms.near.a1, 1.75, think); p.arms.near.bend = lerp(p.arms.near.bend, -2.55, think);
  p.lean = -0.03 * walk + 0.02 * Math.sin(t * 1.1) - 0.04 * ss((t - 5.0) / 0.6) * (1 - ss((t - 8.8) / 0.4));
  p.headTilt = keys(t, [[0, 0.02], [1.1, -0.06], [2.9, -0.04], [4.6, 0.02], [5.2, 0.1], [7.0, 0.12], [7.6, 0.06], [8.7, 0.08], [9.2, 0.12], [10.6, 0.1]]) + 0.015 * Math.sin(t * 1.7);
  const st = gab.face.st;
  st.smile = keys(t, [[0, 0.75], [4.8, 0.7], [5.6, -0.25], [8.6, -0.3], [9.0, 0.35], [10.6, 0.55]]);
  st.open = keys(t, [[0, 0.35], [1.2, 0.8], [2.9, 0.55], [4.8, 0.3], [5.6, 0.05], [8.7, 0.05], [9.1, 0.3], [10.6, 0.25]]);
  st.worry = keys(t, [[0, 0], [5.0, 0], [5.7, 0.8], [8.6, 0.75], [9.1, 0.1]]);
  st.browUp = keys(t, [[0, 0], [1.2, 6], [2.8, 2], [5.0, 2], [5.7, 7], [8.6, 7], [9.2, 3]]);
  st.look = keys(t, [[0, [-5, 0]], [4.0, [-6, 3]], [5.2, [-5, 10]], [8.6, [-6, 10]], [9.1, [-7, 12]]]);
  st.blink = blinkAt(t, [0.7, 3.3, 5.45, 7.9, 10.2]);
  gab.face.setExpr(); gab.apply();
  shGab.position.set(r.midX + 10, r.supportY + 4, 0);
}
function poseGirl(t) {
  const r = poseKid(girl, girlG, sD, GIRL0, girlPlans, t, 52);
  const p = girl.pose; restArms(girl, t, 1.3);
  p.breath = Math.sin(t * 2.0 + 1);
  armWave(p, t, 1.45, 3.05, 11, 1.1);
  const walk = ss((t - 8.95) / 0.3);
  if (walk > 0) { const sw = Math.sin((t - 9.0) * Math.PI / 0.55) * 0.28 * walk; p.arms.far.a1 += sw; p.arms.near.a1 -= sw; }
  // looks at Gabriel (turn toward him) 7.2–8.6 : slight tilt and pupils left
  p.lean = 0.02 * Math.sin(t * 1.3 + 0.7) - 0.035 * ss((t - 5.0) / 0.6) * (1 - ss((t - 9.4) / 0.4));
  p.headTilt = keys(t, [[0, 0.04], [1.4, -0.06], [3.0, -0.02], [5.0, 0.08], [7.1, 0.1], [7.6, -0.08], [8.6, -0.06], [9.4, 0.1], [10.6, 0.08]]) + 0.015 * Math.sin(t * 1.5 + 1);
  p.skirtSway = 0.5 * Math.sin(t * 2.2) * 0.2 + (r.moving ? 0.6 * Math.sin((t - 9.0) * Math.PI / 0.55) : 0);
  const st = girl.face.st;
  st.smile = keys(t, [[0, 0.8], [4.9, 0.75], [5.7, -0.2], [8.7, -0.25], [9.3, 0.4], [10.6, 0.6]]);
  st.open = keys(t, [[0, 0.45], [1.5, 0.85], [3.0, 0.6], [4.9, 0.4], [5.7, 0.06], [7.4, 0.25], [8.0, 0.06], [9.2, 0.3], [10.6, 0.3]]);
  st.worry = keys(t, [[0, 0], [5.1, 0], [5.8, 0.85], [8.7, 0.8], [9.3, 0.1]]);
  st.browUp = keys(t, [[0, 0], [1.5, 6], [3.0, 2], [5.1, 2], [5.8, 8], [8.7, 8], [9.3, 3]]);
  st.look = keys(t, [[0, [-5, 0]], [4.0, [-6, 3]], [5.3, [-5, 10]], [7.3, [-6, 10]], [7.6, [-10, 2]], [8.5, [-10, 2]], [8.9, [-6, 10]]]);
  st.blink = blinkAt(t, [1.0, 4.1, 6.0, 8.4, 10.4]);
  girl.face.setExpr(); girl.apply();
  shGirl.position.set(r.midX, r.supportY + 4, 0);
}

// ---------- camera ----------
function camAt(t) {
  const c = keys(t, [
    [0, [350, -430, 0.93]],
    [3.6, [330, -405, 0.98]],
    [4.6, [290, -380, 1.1]],
    [6.7, [300, -370, 1.14]],
    [7.2, [110, -330, 1.55]],
    [8.65, [105, -335, 1.6]],
    [9.45, [360, -440, 1.08]],
    [10.6, [380, -450, 1.04]],
  ]);
  // breathing hand-held drift (very subtle)
  c[0] += 5 * Math.sin(t * 0.7) + 2 * Math.sin(t * 1.9);
  c[1] += 4 * Math.sin(t * 0.9 + 1) + 2 * Math.sin(t * 2.3);
  return { x: c[0], y: c[1], zoom: c[2] };
}

function draw(t) {
  t = Math.max(0, t);
  const c = camAt(t);
  set.update(t, c);
  poseTheo(t); poseGabriel(t); poseGirl(t);
  // barrier highlight: on "barreira" (5.04) and "impede" (5.72), off by 7.0
  const bar = ss((t - 5.0) / 0.25) * (1 - ss((t - 6.85) / 0.35));
  const pulse = 0.55 + 0.45 * Math.max(Math.exp(-Math.pow((t - 5.1) / 0.25, 2)), Math.exp(-Math.pow((t - 5.78) / 0.25, 2)));
  glow.material.userData.baseOpacity = 0.32 * bar * pulse;
  barrierLine.userData.alpha = bar * (0.6 + 0.4 * pulse);
  barrierLine.visible = bar > 0.001;
  // question mark (7.14 – 8.7)
  const q = outBack((t - 7.14) / 0.45) * (1 - ss((t - 8.55) / 0.3));
  qm.visible = q > 0.001;
  qm.position.set(250 + 6 * Math.sin(t * 2), -560 - 10 * Math.sin(t * 2.6), 0);
  qm.scale.set(0.9 * q, 0.9 * q, 1); qm.rotation.z = 0.12 * Math.sin(t * 3.1) * q;
  qGlow.material.userData.baseOpacity = 0.55 * clamp(q);
  // camera
  cam.left = c.x - W / 2 / c.zoom; cam.right = c.x + W / 2 / c.zoom;
  cam.top = -(c.y - H / 2 / c.zoom); cam.bottom = -(c.y + H / 2 / c.zoom);
  cam.updateProjectionMatrix();
  assignOrder(scene);
  renderer.render(scene, cam);
}
window.__draw = draw;
window.addEventListener('hf-seek', (e) => draw(e.detail.time));
draw(0);
