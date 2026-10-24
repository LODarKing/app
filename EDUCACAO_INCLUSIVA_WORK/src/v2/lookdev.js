// Look-development page: draw a puppet over its reference sheet (onion skin) at sheet coordinates.
import * as THREE from 'three';
import { assignOrder } from './vec.js';
import { createTheo } from './chars/theo.js';
import { createGabriel } from './chars/gabriel.js';
import { createGirl } from './chars/girl.js';

const q = new URLSearchParams(location.search);
const SIZE = Number(q.get('size') || 1254), VIEW = (q.get('view') || '0,0,1254,1254').split(',').map(Number);
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, stencil: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(SIZE * VIEW[2] / VIEW[3], SIZE, false);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor(0x000000, 0);
const scene = new THREE.Scene();
const cam = new THREE.OrthographicCamera(VIEW[0], VIEW[0] + VIEW[2], -VIEW[1], -(VIEW[1] + VIEW[3]), -100, 100);
const world = new THREE.Group(); world.scale.set(1, -1, 1); scene.add(world);
const who = q.get('char') || 'theo';
const P = who === 'gabriel' ? createGabriel() : who === 'girl' ? createGirl() : createTheo();
world.add(P.root);
window.P = P;
window.__draw = (t) => {
  const b = P.bones;
  const k = Number(q.get('pose') || 0);
  if (who !== 'theo') {
    const p = P.pose, fc = P.face;
    if (k === 1) { // wave + breathe + expressions
      p.breath = Math.sin(t * 2);
      p.arms.near.a1 = -0.45; p.arms.near.bend = -1.25 + 0.35 * Math.sin(t * 8); p.arms.near.kind = 'wave'; p.arms.near.wrist = 0.2 * Math.sin(t * 8);
      fc.st.smile = Math.cos(t); fc.st.open = 0.4 + 0.4 * Math.sin(t * 2); fc.st.worry = Math.max(0, -Math.cos(t)); fc.setExpr();
      p.headTilt = 0.08 * Math.sin(t);
    } else if (k === 2) { // step
      p.hipY = 25; p.hipX = -30; p.feet.far = [P.art.legs.far.ankle[0] - 90, P.art.legs.far.ankle[1] - 60]; p.footRot.far = 0.2; p.lean = -0.05;
      p.arms.far.a1 += 0.3; p.arms.near.a1 -= 0.3; p.arms.near.bend = -0.4;
    }
    P.apply();
    assignOrder(scene); renderer.render(scene, cam); return;
  }
  if (k === 1) { // push test
    b.torso.rotation.z = 0.08 * Math.sin(t * 3);
    const a = -2.0 + 1.2 * (0.5 + 0.5 * Math.sin(t * 3));
    P.handTo(P.AXLE[0] + Math.cos(a) * (P.R_RIM - 26), P.AXLE[1] + Math.sin(a) * (P.R_RIM - 26));
    b.wheel.rotation.z = t; P.st.smile = Math.sin(t); P.st.open = 0.5 + 0.5 * Math.sin(t * 2); P.st.worry = Math.max(0, -Math.sin(t)); P.st.blink = t % 2 < 0.1 ? 1 : 0; P.setExpr();
    b.head.rotation.z = -0.15 * Math.sin(t);
  }
  assignOrder(scene);
  renderer.render(scene, cam);
};
window.__draw(0);
