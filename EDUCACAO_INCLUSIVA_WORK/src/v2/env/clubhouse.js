// Clubhouse set for scene 1 — fully vector, layered for parallax. Set coordinates: px, y down, sidewalk top = 0.
// Porch is 4 steps high (61 px risers, 100 px treads); there is NO ramp: the stairs are the barrier.
import * as THREE from 'three';
import { Part, Bone, shape, curve, blob, ellipse, circle, rrect, poly, f, lerp, soft, scallop } from '../vec.js';

export const STEP = { rise: 61, tread: 100, x0: 210, top: 610, n: 4 };
export const PORCH_Y = -STEP.rise * STEP.n;      // -244
/** ground height (y, set coords) under x for walking characters */
export function groundAt(x) {
  if (x >= STEP.top) return PORCH_Y;
  if (x < STEP.x0) return 0;
  const i = Math.min(STEP.n, Math.floor((x - STEP.x0) / STEP.tread) + 1);
  return -STEP.rise * i;
}
export const stairsProfile = () => poly([[STEP.x0, 0], [STEP.x0, -61], [310, -61], [310, -122], [410, -122], [410, -183], [510, -183], [510, -244], [STEP.top, -244], [STEP.top, 0]], true);

const K = {
  skyTop: '#4FAEE6', skyBot: '#CDEFFB',
  cloud: '#FFFFFF', cloudShade: '#DCEEF8',
  hillFar: '#A9DD93', hillFarShade: '#97D07F', hillMid: '#7DC566', hillMidShade: '#68B154',
  treeFar: '#5FAE52', treeFarShade: '#4C9844',
  tree: '#4FA24A', treeShade: '#3D8A3C', treeHi: '#73C25E', trunk: '#7A4B2C', trunkShade: '#5E381F', lineTree: '#2F6B30',
  grass: '#79C75A', grass2: '#5EAE46', grassLine: '#4E973B',
  walk: '#ECE4D3', walkEdge: '#CDC2AC', walkLine: '#B9AD95',
  stone: '#D9CDB6', stoneShade: '#C3B59B', stoneLine: '#A99A7F',
  wall: '#EFD3A2', wallShade: '#DDBA84', plank: '#D6B07A', trim: '#8B5A34', trimShade: '#6E4425', lineWood: '#5A3920',
  door: '#2F7050', doorShade: '#245A40', doorLine: '#183D2B', glass: '#BFE6F5', glass2: '#86C9E8',
  roof: '#C9573D', roofShade: '#A8452F', roofHi: '#DE7051', roofLine: '#7E2F1F',
  concrete: '#D7D3CA', concreteSide: '#C5C0B5', concreteDark: '#A9A398', nosing: '#ECE9E2', lineConcrete: '#8E887C',
  rail: '#5F6B78', railHi: '#8C98A5',
  pot: '#C46A3E', potShade: '#A55530', leaf: '#4FA24A', leafShade: '#3D8A3C', flowerY: '#FFD43B', flowerP: '#F27BA8', flowerW: '#FFFFFF',
  sign: '#7A4A2A', signFace: '#F7E8C8', bunting: ['#211C55', '#13B9C5', '#FFEB00', '#70C94A', '#2851D8', '#F28C28'],
  board: '#C99A5E', paper: ['#FFF4C2', '#FFFFFF', '#CDEBFF', '#FFD9C9'],
};

function cloud(cx, cy, s, seed) {
  const pts = [[-120, 20], [-90, -20], [-40, -45], [10, -60], [60, -40], [110, -25], [130, 15], [70, 30], [-20, 34]].map(([x, y]) => [cx + x * s, cy + y * s]);
  return new Part({ fill: [[scallop(pts, 9, 26 * s, seed), K.cloud]], shade: [[shape([[cx - 140 * s, cy + 6 * s], [cx + 140 * s, cy + 6 * s], [cx + 140 * s, cy + 60 * s], [cx - 140 * s, cy + 60 * s]]), K.cloudShade, 0.9]] });
}
function treeCanopy(cx, cy, r, c, seed, line = true) {
  const pts = []; const n = 10;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; pts.push([cx + Math.cos(a) * r * 1.05, cy + Math.sin(a) * r * 0.85]); }
  return new Part({
    fill: [[scallop(pts, 13, r * 0.16, seed), c.base]],
    shade: [[scallop(pts.map(([x, y]) => [x + r * 0.18, y + r * 0.22]), 13, r * 0.14, seed + 3), c.shade], [ellipse(cx - r * 0.35, cy - r * 0.38, r * 0.42, r * 0.26, -0.3), c.hi || c.base, 0.7]],
    line: c.detail ? [[curve([[cx - r * 0.5, cy + r * 0.1], [cx - r * 0.3, cy + r * 0.2], [cx - r * 0.1, cy + r * 0.12]]), c.shade, 4], [curve([[cx + r * 0.1, cy - r * 0.3], [cx + r * 0.3, cy - r * 0.2], [cx + r * 0.45, cy - r * 0.28]]), c.shade, 4]] : [],
    ol: line ? [c.line, 3.5] : null,
  });
}

export function createClubhouse() {
  const root = new THREE.Group();
  const layers = {};
  const L = (name, p, z) => { const g = new Bone(0, 0); g.userData.z = z; g.userData.parallax = p; root.add(g); layers[name] = g; return g; };

  // ---- sky (fixed to the camera) ----
  const sky = L('sky', 0, 0);
  sky.draw(new Part({ fill: [[rrect(-1600, -2600, 3200, 5200, 0), { g: [K.skyTop, K.skyBot], y: [-1300, 500] }]] }));
  sky.draw(soft(560, -900, 1400, 1400, '#FFF6C9', 0.85), 1);
  sky.draw(soft(560, -900, 420, 420, '#FFFFFF', 0.9), 1);
  // ---- clouds ----
  const clouds = L('clouds', 0.12, 1);
  [[-700, -1500, 1.2, 3], [-120, -1720, 0.8, 5], [520, -1380, 1.0, 9], [1150, -1620, 1.3, 13], [1800, -1450, 0.9, 17], [-1300, -1300, 0.9, 21]].forEach(([x, y, s, sd]) => clouds.draw(cloud(x, y, s, sd)));
  // ---- far hills ----
  const hillsFar = L('hillsFar', 0.3, 2);
  hillsFar.draw(new Part({ fill: [[curve([[-2600, -380], [-1800, -720], [-1100, -560], [-300, -800], [500, -600], [1200, -820], [2000, -620], [2900, -760]]) + ' L2900 600 L-2600 600 Z', K.hillFar]], shade: [[curve([[-2600, -300], [-1600, -420], [-600, -380], [400, -460], [1400, -400], [2900, -480]]) + ' L2900 600 L-2600 600 Z', K.hillFarShade, 0.8]] }));
  // distant tree line
  const treesFar = L('treesFar', 0.45, 3);
  for (let i = 0; i < 26; i++) {
    const x = -2400 + i * 200 + ((i * 73) % 60), r = 70 + ((i * 37) % 50), y = -420 - ((i * 53) % 70);
    treesFar.draw(treeCanopy(x, y, r, { base: K.treeFar, shade: K.treeFarShade }, i * 7 + 1, false));
  }
  treesFar.draw(new Part({ fill: [[rrect(-2600, -430, 5600, 1100, 0), K.hillMid]], shade: [[rrect(-2600, -430, 5600, 40, 0), K.hillMidShade, 0.8]] }));

  // ---- mid trees (parallax 0.8) ----
  const treesMid = L('treesMid', 0.8, 4);
  const bigTree = (x, base, s, seed) => {
    const g = new Bone(x, base); treesMid.add(g); g.userData.z = 0;
    g.draw(new Part({ fill: [[shape([[x - 34 * s, base], [x - 22 * s, base - 260 * s], [x - 60 * s, base - 420 * s], [x - 10 * s, base - 380 * s], [x + 10 * s, base - 460 * s], [x + 26 * s, base - 300 * s], [x + 34 * s, base]]), K.trunk]], shade: [[shape([[x + 4 * s, base], [x + 10 * s, base - 300 * s], [x + 26 * s, base - 300 * s], [x + 34 * s, base]]), K.trunkShade]], ol: [K.lineWood, 3] }));
    const crown = new Bone(x, base - 420 * s); g.add(crown); crown.userData.z = 1; crown.position.set(0, -420 * s, 0);
    crown.draw(treeCanopy(x - 120 * s, base - 560 * s, 190 * s, { base: K.tree, shade: K.treeShade, hi: K.treeHi, line: K.lineTree, detail: 1 }, seed));
    crown.draw(treeCanopy(x + 130 * s, base - 600 * s, 200 * s, { base: K.tree, shade: K.treeShade, hi: K.treeHi, line: K.lineTree, detail: 1 }, seed + 1));
    crown.draw(treeCanopy(x, base - 760 * s, 230 * s, { base: K.tree, shade: K.treeShade, hi: K.treeHi, line: K.lineTree, detail: 1 }, seed + 2));
    return crown;
  };
  const crowns = [bigTree(-640, -60, 1.15, 31), bigTree(-1500, -60, 0.95, 41), bigTree(2350, -60, 1.1, 51), bigTree(60, -90, 0.8, 61)];
  // picket fence + hedge behind the sidewalk (parallax 0.92)
  const fence = L('fence', 0.92, 4.5);
  const pickets = [];
  for (let x = -2600; x < 2600; x += 46) pickets.push([shape([[x, -6, 1], [x, -118], [x + 15, -134, 1], [x + 30, -118], [x + 30, -6, 1]]), '#F7F1E4']);
  fence.draw(new Part({ fill: [[rrect(-2600, -96, 5200, 16, 3), '#E6DCC6'], [rrect(-2600, -46, 5200, 16, 3), '#E6DCC6']] , ol: ['#B9AC92', 2.5] }), 0);
  fence.draw(new Part({ fill: pickets, shade: pickets.map(([d]) => [d, '#000000', 0]), ol: ['#B9AC92', 2.5] }), 1);
  for (let i = 0; i < 18; i++) fence.draw(treeCanopy(-2400 + i * 290 + ((i * 59) % 80), -60, 70 + (i % 3) * 18, { base: '#5DAE4F', shade: '#4C9844', hi: '#73C25E', line: '#3B7A36' }, 300 + i), 0.5);

  // ---- the clubhouse (parallax 1) ----
  const set = L('set', 1, 5);
  // grass behind the building line + sidewalk
  set.draw(new Part({ fill: [[rrect(-3000, -40, 6000, 60, 0), K.grass2]] }), -1);
  // roof
  set.draw(new Part({
    fill: [[shape([[450, -1236, 1], [2400, -1236, 1], [2160, -1540, 1], [700, -1540, 1]]), { g: [K.roofHi, K.roof], y: [-1540, -1236] }]],
    shade: [[shape([[450, -1236], [2400, -1236], [2380, -1262], [470, -1262]]), K.roofShade], ...[0, 1, 2, 3, 4].map((i) => [poly([[480 + i * 26, -1290 - i * 52], [2360 - i * 26, -1290 - i * 52], [2360 - i * 26, -1284 - i * 52], [480 + i * 26, -1284 - i * 52]], true), K.roofShade, 0.8])],
    ol: [K.roofLine, 3.5],
  }), 0);
  set.draw(new Part({ fill: [[rrect(430, -1240, 2000, 52, 6), K.trim]], shade: [[rrect(430, -1212, 2000, 24, 4), K.trimShade]], ol: [K.lineWood, 3] }), 1);
  // facade wall with siding
  const planks = []; for (let y = -1150; y < -280; y += 38) planks.push([poly([[566, y], [2400, y]]), K.plank, 3]);
  set.draw(new Part({
    fill: [[rrect(560, -1190, 1900, 930, 0), { g: [K.wallShade, K.wall], y: [-1190, -900] }]],
    line: planks,
    ol: [K.lineWood, 3],
  }), 2);
  set.draw(new Part({ fill: [[rrect(560, -1190, 1900, 60, 0), '#000000']] , fill2: [] }), 2.1).items.forEach((m) => { m.material.opacity = 0.08; m.material.userData.baseOpacity = 0.08; });
  set.draw(new Part({ fill: [[rrect(548, -1190, 40, 930, 4), K.trim]], shade: [[rrect(572, -1190, 16, 930, 4), K.trimShade]], ol: [K.lineWood, 3] }), 3);
  // notice board
  set.draw(new Part({ fill: [[rrect(640, -700, 150, 210, 8), K.trim]], shade: [[rrect(652, -688, 126, 186, 4), K.board]], ol: [K.lineWood, 3] }), 3);
  set.draw(new Part({ fill: [[shape([[662, -676, 1], [714, -680, 1], [716, -612, 1], [664, -608, 1]]), K.paper[0]], [shape([[722, -672, 1], [768, -668, 1], [764, -616, 1], [720, -620, 1]]), K.paper[2]], [shape([[668, -596, 1], [736, -598, 1], [734, -520, 1], [670, -518, 1]]), K.paper[1]], [shape([[742, -600, 1], [770, -598, 1], [770, -540, 1], [744, -540, 1]]), K.paper[3]]],
    line: [[poly([[674, -660], [702, -660]]), '#B8A98A', 3], [poly([[674, -646], [706, -646]]), '#B8A98A', 3], [poly([[680, -578], [722, -578]]), '#B8A98A', 3], [poly([[680, -562], [716, -562]]), '#B8A98A', 3]],
    top: [[circle(688, -676, 5), '#D6382B'], [circle(744, -668, 5), '#2E5FB8'], [circle(700, -594, 5), '#E9B23A'], [circle(756, -598, 5), '#58B04A']] }), 4);
  // door
  set.draw(new Part({ fill: [[rrect(842, -722, 236, 466, 6), K.trim]], shade: [[rrect(1056, -722, 22, 466, 4), K.trimShade]], ol: [K.lineWood, 3] }), 3);
  set.draw(new Part({
    fill: [[rrect(866, -700, 188, 440, 4), K.door]],
    shade: [[rrect(1010, -700, 44, 440, 2), K.doorShade]],
    line: [[rrect(892, -540, 136, 120, 6), K.doorLine, 4], [rrect(892, -396, 136, 110, 6), K.doorLine, 4]],
    ol: [K.doorLine, 3],
  }), 4);
  set.draw(new Part({ fill: [[rrect(892, -676, 136, 112, 10), { g: [K.glass, K.glass2], y: [-676, -564] }]], shade: [[shape([[900, -600], [960, -676], [990, -676], [920, -580]]), '#FFFFFF', 0.45]], line: [[poly([[960, -676], [960, -564]]), K.doorLine, 5]], ol: [K.doorLine, 3] }), 5);
  set.draw(new Part({ fill: [[circle(1030, -470, 10), '#E9B23A']], ol: ['#9C6B10', 2] }), 5);
  // welcome sign
  set.draw(new Part({ fill: [[rrect(800, -940, 320, 150, 14), K.sign]], shade: [[rrect(818, -924, 284, 118, 8), K.signFace]], ol: [K.lineWood, 3] }), 3);
  const signText = textPlane('BEM-VINDOS!', 280, 70, '#5A3920'); signText.position.set(960, -866, 0); set.art.add(signText); signText.userData.z = 4;
  // windows
  for (const wx of [1250, 1700]) {
    set.draw(new Part({ fill: [[rrect(wx - 20, -780, 330, 360, 8), K.trim]], ol: [K.lineWood, 3] }), 3);
    set.draw(new Part({
      fill: [[rrect(wx, -760, 290, 320, 4), { g: [K.glass, K.glass2], y: [-760, -440] }]],
      shade: [[shape([[wx + 20, -500], [wx + 150, -760], [wx + 200, -760], [wx + 60, -470]]), '#FFFFFF', 0.4], [shape([[wx + 170, -480], [wx + 260, -760], [wx + 280, -760], [wx + 190, -470]]), '#FFFFFF', 0.3]],
      line: [[poly([[wx + 145, -760], [wx + 145, -440]]), K.trim, 10], [poly([[wx, -600], [wx + 290, -600]]), K.trim, 10]],
      ol: [K.lineWood, 3],
    }), 4);
    set.draw(new Part({ fill: [[rrect(wx - 34, -430, 358, 26, 6), K.trim]], shade: [[rrect(wx - 34, -416, 358, 12, 4), K.trimShade]], ol: [K.lineWood, 3] }), 5);
    // flower box
    set.draw(new Part({ fill: [[rrect(wx - 10, -404, 310, 56, 8), K.pot]], shade: [[rrect(wx - 10, -372, 310, 24, 6), K.potShade]], ol: [K.lineWood, 3] }), 5);
    const fl = [];
    for (let i = 0; i < 9; i++) fl.push([circle(wx + 14 + i * 34, -420 - (i % 3) * 10, 13), [K.flowerY, K.flowerP, K.flowerW][i % 3]]);
    set.draw(new Part({ fill: [[scallop([[wx, -404], [wx + 290, -404], [wx + 280, -440], [wx + 10, -440]], 12, 12, wx), K.leaf]], top: fl }), 4.9);
  }
  // wall lamp
  set.draw(new Part({ fill: [[rrect(1102, -820, 40, 70, 10), '#3B3F45']], shade: [[rrect(1108, -812, 28, 50, 6), '#FFE8A3']], ol: ['#1E2024', 2.5] }), 5);
  // porch base (stone plinth) + floor lip
  const stones = [];
  for (let r = 0; r < 4; r++) for (let x = 600 + (r % 2) * 60; x < 2460; x += 120) stones.push([rrect(x + 4, -240 + r * 60 + 4, 112, 52, 10), K.stoneShade, 0.55]);
  set.draw(new Part({ fill: [[rrect(600, -262, 1860, 262, 0), K.stone]], shade: stones, ol: [K.stoneLine, 3] }), 6);
  set.draw(new Part({ fill: [[rrect(590, -276, 1870, 26, 4), K.trim]], shade: [[rrect(590, -262, 1870, 12, 2), K.trimShade]], ol: [K.lineWood, 3] }), 7);
  set.draw(soft(1500, -250, 1900, 70, '#3A2A10', 0.25), 7.5);
  // porch posts + bunting
  for (const px of [612, 1560, 2420]) set.draw(new Part({ fill: [[rrect(px - 18, -1190, 36, 930, 4), K.trim]], shade: [[rrect(px + 2, -1190, 16, 930, 3), K.trimShade]], ol: [K.lineWood, 3] }), 7.6);
  const bunting = new Bone(0, 0); set.art.add(bunting); bunting.userData.z = 7.7;
  const buntParts = [];
  for (const [a, b] of [[612, 1560], [1560, 2420]]) {
    const n = 11; const flags = [];
    const sag = (k) => -1150 + 90 * 4 * k * (1 - k);
    for (let i = 0; i < n; i++) {
      const k0 = (i + 0.15) / n, k1 = (i + 0.85) / n, km = (i + 0.5) / n;
      const x0 = lerp(a, b, k0), x1 = lerp(a, b, k1), xm = lerp(a, b, km);
      flags.push([shape([[x0, sag(k0), 1], [x1, sag(k1), 1], [xm, sag(km) + 74, 1]]), K.bunting[i % K.bunting.length]]);
    }
    const p = new Part({ fill: flags, olFree: [[curve(Array.from({ length: 12 }, (_, i) => [lerp(a, b, i / 11), sag(i / 11)])), '#5A3920', 3]] });
    bunting.draw(p); buntParts.push(p);
  }
  // potted plant on the porch
  set.draw(new Part({ fill: [[shape([[1170, -376], [1270, -376], [1258, -276, 1], [1182, -276, 1]]), K.pot]], shade: [[shape([[1230, -376], [1270, -376], [1258, -276], [1236, -276]]), K.potShade]], ol: [K.lineWood, 3] }), 6.5);
  set.draw(treeCanopy(1220, -440, 90, { base: K.leaf, shade: K.leafShade, hi: K.treeHi, line: K.lineTree }, 77), 6.4);
  // handrail on the wall side of the stairs (behind the kids)
  const railPts = [[250, -150], [612, -360]];
  set.draw(new Part({ olFree: [[poly([[262, -60], [262, -152]]), K.rail, 12], [poly([[440, -170], [440, -256]]), K.rail, 12], [poly(railPts), K.rail, 14], [poly([[railPts[0][0] + 2, railPts[0][1] - 4], [railPts[1][0] + 2, railPts[1][1] - 4]]), K.railHi, 4]] }), 7.9);
  // stairs (the barrier)
  const prof = stairsProfile();
  const nos = [], risers = [];
  for (let i = 1; i <= 4; i++) {
    const x = STEP.x0 + (i - 1) * STEP.tread, y = -STEP.rise * i;
    nos.push([rrect(x - 4, y - 2, STEP.top - x + 4, 12, 3), K.nosing]);
    risers.push([poly([[x, y + 10], [x + 26, y + 10], [x + 26, y + STEP.rise], [x, y + STEP.rise]], true), K.concreteSide, 0.9]);
  }
  const stairs = set.draw(new Part({
    fill: [[prof, { g: [K.concrete, K.concreteSide], y: [-244, 0] }]],
    shade: [...risers, ...nos, [rrect(STEP.x0, -14, 400, 14, 0), K.concreteDark, 0.5]],
    ol: [K.lineConcrete, 3.5],
  }), 8);
  set.draw(soft(400, -2, 520, 40, '#3A2A10', 0.22), 8.1);
  // sidewalk
  set.draw(new Part({
    fill: [[rrect(-3000, 0, 6000, 46, 0), K.walk]],
    shade: [[rrect(-3000, 30, 6000, 16, 0), K.walkEdge]],
    line: Array.from({ length: 40 }, (_, i) => [poly([[-3000 + i * 160, 2], [-3000 + i * 160, 30]]), K.walkLine, 3]),
  }), 9);
  // foreground lawn
  set.draw(new Part({ fill: [[rrect(-3000, 46, 6000, 2400, 0), { g: [K.grass, K.grass2], y: [46, 900] }]],
    shade: Array.from({ length: 22 }, (_, i) => [shape([[-3000 + i * 280, 46, 1], [-2860 + i * 280, 46, 1], [-2660 + i * 280, 1400, 1], [-2800 + i * 280, 1400, 1]]), '#FFFFFF', 0.05]) }), 9.1);
  const tufts = [];
  for (let i = 0; i < 70; i++) { const x = -2600 + i * 77 + ((i * 37) % 30), y = 62 + ((i * 53) % 260); tufts.push([poly([[x - 8, y], [x, y - 18], [x + 4, y], [x + 10, y - 14], [x + 14, y]]), K.grassLine, 3]); }
  set.draw(new Part({ olFree: tufts }), 9.2);
  // bushes along the plinth
  for (const [x, r, sd] of [[700, 70, 101], [1420, 84, 103], [2000, 76, 105]]) set.draw(treeCanopy(x, -46, r, { base: K.leaf, shade: K.leafShade, hi: K.treeHi, line: K.lineTree }, sd), 8.5);
  // flowers in the lawn
  const flowers = [];
  for (let i = 0; i < 40; i++) {
    const x = -2500 + i * 131 + ((i * 41) % 70), y = 90 + ((i * 97) % 380);
    const c = [K.flowerY, K.flowerP, K.flowerW][i % 3];
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; flowers.push([circle(x + Math.cos(a) * 8, y + Math.sin(a) * 8, 6.5), c]); }
    flowers.push([circle(x, y, 5), '#F28C28']);
  }
  set.draw(new Part({ fill: flowers }), 9.3);

  // ---- foreground (parallax > 1), drawn after characters ----
  const fg = L('fg', 1.25, 50);
  fg.draw(treeCanopy(-760, 760, 230, { base: '#3F8E3E', shade: '#2F7432', hi: '#5DAA4F', line: '#245A28', detail: 1 }, 201));
  fg.draw(treeCanopy(1350, 820, 260, { base: '#3F8E3E', shade: '#2F7432', hi: '#5DAA4F', line: '#245A28', detail: 1 }, 203));

  // light shafts + floating dust in the sun
  const light = L('light', 1, 60);
  const beams = [];
  for (const [x, w, o] of [[200, 260, 0.1], [700, 180, 0.08], [1100, 320, 0.07]]) {
    const b = soft(x, -900, w, 2400, '#FFF3C4', o, 'beam', THREE.AdditiveBlending); b.rotation.z = -0.42; light.art.add(b); beams.push(b);
  }
  const motes = [];
  for (let i = 0; i < 26; i++) { const m = soft(0, 0, 10, 10, '#FFF8D8', 0.55, 'radial', THREE.AdditiveBlending); light.art.add(m); motes.push({ m, x0: -400 + ((i * 197) % 1300), y0: -1200 + ((i * 331) % 1300), s: 6 + (i % 4) * 3, ph: i * 1.7 }); }

  function update(t, cam) {
    for (const g of Object.values(layers)) {
      const p = g.userData.parallax;
      g.position.set(cam.x * (1 - p), cam.y * (1 - p), 0);
    }
    clouds.art.position.x = t * 9;
    crowns.forEach((c, i) => { c.rotation.z = 0.012 * Math.sin(t * 1.3 + i * 2); });
    bunting.position.y = 2 * Math.sin(t * 2.1);
    bunting.rotation.z = 0.002 * Math.sin(t * 1.7);
    beams.forEach((b, i) => { b.material.userData.baseOpacity = [0.1, 0.08, 0.07][i] * (0.75 + 0.25 * Math.sin(t * 0.8 + i * 2)); });
    motes.forEach((d) => { d.m.position.set(d.x0 + 30 * Math.sin(t * 0.5 + d.ph) + t * 6, d.y0 + 24 * Math.sin(t * 0.37 + d.ph * 1.3) - t * 4, 0); d.m.scale.set(d.s, d.s, 1); d.m.material.userData.baseOpacity = 0.35 + 0.3 * Math.sin(t * 1.5 + d.ph); });
  }
  return { root, layers, update, stairs };
}

/** text drawn to a canvas texture (Poppins Bold when available), placed in a y-down parent */
export function textPlane(text, w, h, color = '#000000', font = 'PoppinsB, Poppins, Arial, sans-serif', weight = '800') {
  const S = 4, cv = document.createElement('canvas'); cv.width = w * S; cv.height = h * S;
  const g = cv.getContext('2d');
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  let size = h * S * 0.8; g.font = `${weight} ${size}px ${font}`;
  while (g.measureText(text).width > w * S * 0.96 && size > 8) { size -= 4; g.font = `${weight} ${size}px ${font}`; }
  g.fillText(text, w * S / 2, h * S / 2 + size * 0.04);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
  m.material.userData.baseOpacity = 1; m.scale.y = -1;   // parent is y-down
  return m;
}
