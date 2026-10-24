// Master timeline: picks the active scene for time T (seconds), drives its
// update and composites transitions between consecutive scenes.
// Time comes only from the HyperFrames seek event (t = frame / fps).
import * as THREE from 'three';
import { createStage } from './core/stage.js';
import { ease, clamp } from './core/math.js';
import bounds from '../documentation/scene_bounds.json';
import * as s01 from './scenes/s01_barreira.js';
import * as s02 from './scenes/s02_deficiencia.js';
import * as s03 from './scenes/s03_diferencas.js';
import * as s04 from './scenes/s04_bullying.js';
import * as s05 from './scenes/s05_convencao.js';
import * as s06 from './scenes/s06_joao5.js';
import * as s07 from './scenes/s07_mefibosete.js';
import * as s08 from './scenes/s08_helen.js';
import * as s09 from './scenes/s09_lbi.js';
import * as s10 from './scenes/s10_clube.js';

const MODS = [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10];
// transition INTO scene i: mode 0 dissolve, 1 iris, 2 diagonal wipe, 3 vertical push
const TR = [null, { mode: 0, d: 0.5 }, { mode: 2, d: 0.7 }, { mode: 1, d: 0.8, c: [0.5, 0.55] }, { mode: 3, d: 0.6 },
  { mode: 1, d: 0.9, c: [0.5, 0.45] }, { mode: 0, d: 0.8 }, { mode: 0, d: 0.8 }, { mode: 2, d: 0.7 }, { mode: 1, d: 0.9, c: [0.5, 0.5] }];

const stage = createStage(document.getElementById('world'));
const cams = MODS.map(() => stage.cam.clone());
const SS = MODS.map((m, i) => m.build({ bounds: bounds[i] }));
let override = null;

function run(i, T) {
  const t = T - bounds[i].start;
  const v = MODS[i].update(SS[i], t) || { x: 0, y: 0, zoom: 1 };
  const c = cams[i];
  if (override) stage.view(c, ...override); else stage.view(c, v.x, v.y, v.zoom, v.rot || 0);
  return c;
}

export function draw(T) {
  let i = bounds.findIndex((b) => T >= b.start && T < b.end);
  if (i < 0) i = T < 0 ? 0 : bounds.length - 1;
  if (window.__only != null) i = window.__only;
  const tr = TR[i];
  const tl = T - bounds[i].start;
  if (tr && tl < tr.d && window.__only == null) {
    const cA = run(i - 1, T), cB = run(i, T);
    stage.transition(SS[i - 1].scene, cA, SS[i].scene, cB, ease.inOutCubic(clamp(tl / tr.d)), tr.mode, tr.c || [0.5, 0.5]);
  } else {
    const c = run(i, T);
    stage.render(SS[i].scene, c);
  }
}

window.__draw = draw;
window.__view = (x, y, z) => { override = [x, y, z]; };
window.__bounds = bounds;
window.addEventListener('hf-seek', (e) => draw(e.detail.time));
draw(0);
