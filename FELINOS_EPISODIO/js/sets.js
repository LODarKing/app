// Cenários pintados na paleta da referência (lilás, malva, pêssego, verde acinzentado), traço de fundo mais suave.
'use strict';
const BGL = '#4A3A52';     // traço dos cenários (mais suave que o dos personagens)
const ACCENT = '#F2B451';  // a única cor de destaque do filme (âmbar)
function camSet(ctx, cam, depth) { const z = 1 + (cam.zoom - 1) * depth, fx = cam.fx ?? W / 2, fy = cam.fy ?? H / 2; ctx.setTransform(z, 0, 0, z, fx - z * (fx + cam.x * depth), fy - z * (fy + (cam.y || 0) * depth)); }
function canopy(g, cx, cy, r, fill, shade, seed, lw = 3) {
  const p = []; const n = 11; for (let i = 0; i < n; i++) { const a = (i / n) * 6.283, rr = r * (0.86 + 0.22 * rnd(seed, i)); p.push([cx + Math.cos(a) * rr * 1.08, cy + Math.sin(a) * rr * 0.86]); }
  inkShape(g, p, { fill, shade, shadeOff: [r * 0.22, r * 0.25], line: BGL, lw, seed, wob: 0 });
}
function leafShape(g, x, y, len, wd, rot, fill, shade, lw = 3, seed = 1) {
  g.save(); g.translate(x, y); g.rotate(rot);
  inkShape(g, [[0, 0, 1], [len * 0.25, -wd * 0.9], [len * 0.68, -wd * 0.75], [len, 0, 1], [len * 0.68, wd * 0.75], [len * 0.25, wd * 0.9]], { fill, shade, shadeOff: [0, wd * 0.5], line: BGL, lw, seed, wob: 0 });
  inkLine(g, [[len * 0.05, 0], [len * 0.5, wd * 0.05], [len * 0.95, 0]], { line: BGL, lw: lw * 0.7, wob: 0, seed });
  g.restore();
}

// ------------------------------------------------ 1. área de estudos ao fim da tarde
function studyBg() {
  return cachedPainted('studyBg', 1500, 1400, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#8F86B8'], [0.35, '#C9A3BE'], [0.62, '#EDC3A4'], [1, '#D9B7A0']]); g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,240,230,0.5)'; [[200, 260, 220], [900, 200, 260], [1300, 330, 200]].forEach(([x, y, r], i) => { g.beginPath(); trace(g, smooth(ell(x, y, r, r * 0.22, 9).map((p, k) => [p[0], p[1] + (rnd(i, k) - 0.5) * 20]))); g.fill(); });
    g.fillStyle = '#9C8FA8'; g.beginPath(); trace(g, smooth([[0, 900], [300, 820], [700, 860], [1100, 800], [1500, 860], [1500, 1400], [0, 1400]])); g.fill();
    for (let i = 0; i < 9; i++) { const x = -40 + i * 190 + rnd(i, 1) * 50, y = 640 + rnd(i, 2) * 120, r = 170 + rnd(i, 3) * 70; g.fillStyle = '#6A5560'; g.fillRect(x - 14, y + r * 0.5, 28, 600); canopy(g, x, y, r, '#7E9C82', '#5F7A6E', 10 + i, 3.5); }
    g.fillStyle = '#8FAA86'; g.fillRect(0, 980, w, 420);
    for (let i = 0; i < 9; i++) canopy(g, i * 180 + rnd(i, 9) * 60, 1000 + rnd(i, 8) * 40, 90, '#6E8F72', '#557264', 30 + i, 3);
  });
}
/** área de estudos viva: céu e morros em cache; nuvens em deriva; árvores balançando; arbustos (coordenadas do fundo 1500x1400) */
function studySky() {
  return cachedPainted('studySky', 1500, 1400, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#8F86B8'], [0.35, '#C9A3BE'], [0.62, '#EDC3A4'], [1, '#D9B7A0']]); g.fillRect(0, 0, w, h);
    g.fillStyle = '#9C8FA8'; g.beginPath(); trace(g, smooth([[0, 900], [300, 820], [700, 860], [1100, 800], [1500, 860], [1500, 1400], [0, 1400]])); g.fill();
  });
}
function studyBushes() {
  return cachedPainted('studyBushes', 1500, 520, (g, w, h) => {
    g.fillStyle = '#8FAA86'; g.fillRect(0, 100, w, 420);
    for (let i = 0; i < 9; i++) canopy(g, i * 180 + rnd(i, 9) * 60, 120 + rnd(i, 8) * 40, 90, '#6E8F72', '#557264', 30 + i, 0.01);
  }, 5, 0.6);
}
function drawStudyBack(ctx, t) {
  ctx.drawImage(studySky(), 0, 0);
  cloudsDrift(ctx, t, { y0: 120, y1: 420, n: 4, speed: 16, wrap: 2100, x0: -500 });
  sunRays(ctx, t, { x: 260, y: -60, ang: -0.32, len: 1500, n: 4, width: 110, alpha: 0.16 });
  for (let i = 0; i < 9; i++) { const x = -40 + i * 190 + rnd(i, 1) * 50, y = 640 + rnd(i, 2) * 120, r = 170 + rnd(i, 3) * 70; swayTree(ctx, t, x, y + r * 2.25, r, { seed: i, amp: 1.2, key: 'study' + i }); }
  ctx.drawImage(studyBushes(), 0, 880);
}
function wood() {   // tábuas pintadas: cor chapada por tábua, alguns veios a pincel e frestas
  return cachedPainted('wood', 1600, 1000, (g, w, h) => {
    const cols = ['#C79A86', '#BE9080', '#C9A08A', '#B98A7C', '#C4968A', '#BC8E80', '#C89C88'];
    for (let p = 0; p < 7; p++) {
      const x0 = p * 230; g.fillStyle = cols[p]; g.fillRect(x0, 0, 230, h);
      g.strokeStyle = 'rgba(120,70,80,0.28)'; g.lineWidth = 3; g.lineCap = 'round';
      for (let k = 0; k < 5; k++) { const xx = x0 + 30 + k * 40 + rnd(p, k) * 20; g.beginPath(); for (let y = 0; y <= h; y += 40) g.lineTo(xx + Math.sin(y * 0.006 + p + k) * 10, y); g.stroke(); }
      g.fillStyle = 'rgba(255,235,220,0.18)'; g.fillRect(x0 + 8, 0, 40, h);
      g.fillStyle = '#6E4A58'; g.fillRect(x0, 0, 5, h);
    }
  });
}
function diaryBook(g, x, y, rot, s, glow = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = 'rgba(60,30,60,0.3)'; g.beginPath(); g.ellipse(8, 92, 160, 22, 0, 0, 6.283); g.fill();
  inkShape(g, [[-128, 70], [128, 70], [128, 88], [-128, 88]], { fill: '#EFE3CF', lw: 3, seed: 1, wob: 0 });
  inkShape(g, [[-132, -92, 1], [132, -92, 1], [132, 76, 1], [-132, 76, 1]], { fill: '#7A3E52', shade: '#5A2C40', shadeOff: [14, 14], lw: 3.2, seed: 2, wob: 0.4 });
  g.strokeStyle = ACCENT; g.lineWidth = 3; g.strokeRect(-114, -76, 228, 136);
  if (glow > 0) glowSpot(g, 0, -8, 120 + 40 * glow, `rgba(242,180,81,${0.55 * glow})`);
  g.save(); g.translate(0, -8); g.scale(0.55, 0.55); pawPrint(g, ACCENT, 4); g.restore();
  g.font = '700 18px InterUI'; g.fillStyle = ACCENT; g.textAlign = 'center'; g.fillText('DIÁRIO DA CRIAÇÃO', 0, 54);
  g.restore();
}
function pawPrint(g, fill, lw = 4, seed = 5) {
  inkShape(g, [[-52, 40], [-40, 0], [0, -14], [40, 0], [52, 40], [30, 66], [0, 58], [-30, 66]], { fill, lw, seed, wob: 0.6 });
  [[-66, -22], [-26, -60], [26, -60], [66, -22]].forEach(([x, y], i) => inkShape(g, ell(x, y, 18, 24, 10, x * 0.006), { fill, lw, seed: seed + i + 1, wob: 0.6 }));
}
function drawStudySet(ctx, t, cam) {
  camSet(ctx, cam, 0.25); ctx.drawImage(studyBg(), -210, -40);
  camSet(ctx, cam, 1);
  const top = 1120, bot = 2050, wd = wood();
  for (let i = 0; i < 60; i++) { const v0 = i / 60, v1 = (i + 1) / 60, y0 = lerp(top, bot, v0 * v0 * 0.4 + v0 * 0.6), y1 = lerp(top, bot, v1 * v1 * 0.4 + v1 * 0.6), sc = lerp(0.55, 1.25, v0), wp = 1600 * sc; ctx.drawImage(wd, 0, v0 * 1000, 1600, 1000 / 60 + 1, W / 2 - wp / 2, y0, wp, y1 - y0 + 1); }
  ctx.fillStyle = 'rgba(120,70,110,0.18)'; ctx.fillRect(-400, top, 1900, bot - top);
  inkLine(ctx, [[-400, top], [1500, top]], { line: BGL, lw: 4, wob: 0 });
  diaryBook(ctx, 812, 1392, -0.16, 0.95);
  // caderno, lápis, lupa, folhas, cantil (desenhados à tinta)
  ctx.save(); ctx.translate(170, 1330); ctx.rotate(0.14);
  inkShape(ctx, [[-120, -80, 1], [110, -80, 1], [110, 80, 1], [-120, 80, 1]], { fill: '#F6EEE4', shade: '#D9C9CF', shadeOff: [10, 10], line: BGL, lw: 3, wob: 0 });
  for (let i = 0; i < 5; i++) inkLine(ctx, [[-100, -48 + i * 26], [92, -48 + i * 26]], { line: '#B6A7C4', lw: 2, wob: 0 });
  inkShape(ctx, [[20, 96], [30, 106], [140, -30], [130, -40]], { fill: ACCENT, line: BGL, lw: 3, wob: 0 });
  ctx.restore();
  ctx.save(); ctx.translate(250, 1620); ctx.rotate(-0.35);
  inkShape(ctx, limb([[52, 52], [150, 150]], [13, 13]), { fill: '#7A5248', line: BGL, lw: 3, wob: 0 });
  inkShape(ctx, ell(0, 0, 72, 72, 16), { fill: 'rgba(205,228,240,0.55)', line: BGL, lw: 10, wob: 0 });
  inkLine(ctx, [[-44, -30], [-24, -48], [4, -52]], { line: '#FFFFFF', lw: 6, wob: 0 });
  ctx.restore();
  leafShape(ctx, 760, 1650, 150, 34, -0.5, '#8DB07A', '#6D9064');
  leafShape(ctx, 850, 1720, 130, 30, 0.3, '#E2A86A', '#C2865A');
  ctx.save(); ctx.translate(70, 1190);
  inkShape(ctx, [[-50, 40], [-56, -60], [-30, -110], [30, -110], [56, -60], [50, 40]], { fill: '#6E8F7E', shade: '#506E64', shadeOff: [16, 10], line: BGL, lw: 3, wob: 0 });
  inkShape(ctx, [[-18, -140, 1], [18, -140, 1], [18, -106, 1], [-18, -106, 1]], { fill: '#B9AFC3', line: BGL, lw: 3, wob: 0 });
  ctx.restore();
}

// ------------------------------------------------ 2. floresta tropical (onça)
function jungleBg() {
  return cachedPainted('jungle', 2600, 1700, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#C9D8B4'], [0.45, '#8FAF92'], [1, '#4E6E62']]); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 14; i++) { const x = i * 190 + rnd(i, 1) * 80; g.fillStyle = '#7E9C8A'; g.fillRect(x, 260, 34, 1400); canopy(g, x + 17, 300 + rnd(i, 2) * 180, 190, '#94B094', '#7E9C8A', 300 + i, 0.01); }
    for (let i = 0; i < 9; i++) { const x = 60 + i * 290 + rnd(i, 7) * 90, tw = 66 + rnd(i, 2) * 40; inkShape(g, [[x, -20, 1], [x + tw, -20, 1], [x + tw + 14, 1500, 1], [x - 14, 1500, 1]], { fill: '#5E4A52', shade: '#46363E', shadeOff: [-tw * 0.4, 0], line: BGL, lw: 4, wob: 0 }); inkLine(g, [[x + tw / 2, 0], [x + tw / 2 + 50, 320], [x + tw / 2 - 40, 640], [x + tw / 2 + 10, 900]], { line: '#3E5A44', lw: 9, wob: 0 }); }
    for (let i = 0; i < 12; i++) canopy(g, i * 230, 90 + rnd(i, 3) * 120, 210, '#4F7A5E', '#3A604C', 330 + i, 4);
  });
}
function jungleGround() {
  return cachedPainted('jground', 2600, 760, (g, w, h) => {
    inkShape(g, [[0, 70], [500, 40], [1000, 74], [1500, 44], [2000, 70], [2600, 50], [2600, 760, 1], [0, 760, 1]], { fill: '#5C7A4E', shade: '#4A6442', shadeOff: [0, -60], line: BGL, lw: 4, wob: 0 });
    for (let i = 0; i < 26; i++) { const x = rnd(i, 1) * w, y = 80 + rnd(i, 2) * 300; for (let k = 0; k < 6; k++) leafShape(g, x, y, 80 + rnd(i, k) * 50, 15, -Math.PI / 2 + (k - 2.5) * 0.36, '#6E9A5E', '#557E4C', 3, i * 9 + k); }
  });
}
function drawJungle(ctx, t, cam, inner) {
  camSet(ctx, cam, 0.15); ctx.drawImage(jungleBg(), -760, -60);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.save(); ctx.globalCompositeOperation = 'screen';
  [0, 1, 2].forEach((i) => { ctx.fillStyle = linear(ctx, 0, 0, 0, 1500, [[0, 'rgba(255,236,200,0.35)'], [1, 'rgba(255,236,200,0)']]); ctx.beginPath(); ctx.moveTo(240 + i * 300 - cam.x * 0.1, 0); ctx.lineTo(330 + i * 300 - cam.x * 0.1, 0); ctx.lineTo(560 + i * 300 - cam.x * 0.1, 1500); ctx.lineTo(420 + i * 300 - cam.x * 0.1, 1500); ctx.fill(); });
  ctx.restore();
  camSet(ctx, cam, 1); ctx.drawImage(jungleGround(), -760, 1250);
  inner();
  camSet(ctx, cam, 1.7);
  for (let i = 0; i < 7; i++) { const x = -400 + i * 520, up = i % 2 === 0; leafShape(ctx, x, up ? -60 : 2010, 500, 140, up ? 1.0 + 0.06 * Math.sin(t + i) : -1.25 + 0.05 * Math.sin(t * 1.2 + i), '#3E6A4C', '#2E5440', 5, 500 + i); }
}

// ------------------------------------------------ 3. bambuzal com neblina (tigre)
function bambooBg() {
  return cachedPainted('bamboo', 2600, 1700, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#E9E2EA'], [0.6, '#C9D2C2'], [1, '#93A88C']]); g.fillRect(0, 0, w, h);
    const stalks = (n, wmin, wmax, fill, shade, seed, lw, alpha) => { g.globalAlpha = alpha; for (let i = 0; i < n; i++) { const x = rnd(seed, i) * w, sw = lerp(wmin, wmax, rnd(seed, i + 50)), lean = (rnd(seed, i + 90) - 0.5) * 60; inkShape(g, [[x + lean, -20, 1], [x + lean + sw, -20, 1], [x + sw, 1700, 1], [x, 1700, 1]], { fill, shade, shadeOff: [-sw * 0.45, 0], line: lw ? BGL : null, lw, wob: 0 }); for (let k = 0; k < 8; k++) { const y = 80 + k * 210 + rnd(seed + i, k) * 40, xx = x + lean * (1 - y / 1700); if (lw) inkLine(g, [[xx - 2, y], [xx + sw + 2, y]], { line: BGL, lw: lw * 0.8, wob: 0 }); } for (let k = 0; k < 3; k++) { const y = 240 + k * 420 + rnd(seed * 7 + i, k) * 80, xx = x + lean * (1 - y / 1700) + sw / 2; for (let q = 0; q < 3; q++) leafShape(g, xx, y, 70 + q * 12, 10, (k % 2 ? -0.5 : 3.6) + q * 0.28, fill, shade, lw || 0.01, seed + q); } } g.globalAlpha = 1; };
    stalks(36, 14, 24, '#C2CDBE', '#B2BEAE', 1, 0, 0.9);
    g.fillStyle = 'rgba(236,232,240,0.5)'; g.fillRect(0, 0, w, h);
    stalks(22, 22, 34, '#9DB494', '#86A07E', 50, 2.5, 1);
    g.fillStyle = 'rgba(232,228,236,0.3)'; g.fillRect(0, 0, w, h);
    stalks(12, 36, 50, '#6E9466', '#567A52', 90, 4, 1);
    inkShape(g, [[0, 1330, 1], [2600, 1330, 1], [2600, 1700, 1], [0, 1700, 1]], { fill: '#8FA068', shade: '#7A8C5A', shadeOff: [0, -50], line: BGL, lw: 4, wob: 0 });
  });
}
function drawBamboo(ctx, t, cam, inner) {
  camSet(ctx, cam, 0.5); ctx.drawImage(bambooBg(), -760, -40);
  camSet(ctx, cam, 1); ctx.fillStyle = '#8FA068'; ctx.fillRect(-900, 1290, 2900, 1200); inkLine(ctx, [[-900, 1290], [2000, 1290]], { line: BGL, lw: 4, wob: 0 });
  for (let i = 0; i < 40; i++) { const x = -700 + i * 70 + rnd(i, 1) * 30; inkLine(ctx, [[x, 1300], [x + 6, 1262], [x + 4 + Math.sin(t * 2 + i) * 6, 1226]], { line: '#5E7A44', lw: 4, wob: 0 }); }
  inner();
  camSet(ctx, cam, 1.8); inkShape(ctx, [[-120, -200, 1], [-20, -200, 1], [-20, 2200, 1], [-120, 2200, 1]], { fill: '#3E5E3E', shade: '#2E4A30', shadeOff: [-40, 0], line: BGL, lw: 5, wob: 0 });
}

// ------------------------------------------------ 4. savana ao entardecer (leão em contraluz)
function savannaBg() {
  return cachedPainted('savanna', 1500, 2100, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#5E4A86'], [0.3, '#B678A2'], [0.5, '#EE9F8E'], [0.62, '#F6C9A0'], [1, '#C98A7A']]); g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(250,210,200,0.55)'; for (let i = 0; i < 6; i++) { g.beginPath(); trace(g, smooth(ell(rnd(i, 1) * w, 260 + i * 110, 300 + rnd(i, 2) * 200, 26, 9))); g.fill(); }
    g.fillStyle = '#FFF0D2'; g.beginPath(); g.arc(470, 1130, 120, 0, 6.283); g.fill();
    g.fillStyle = '#9A5E7A'; g.beginPath(); trace(g, smooth([[0, 1230], [400, 1190], [800, 1215], [1200, 1185], [1500, 1210], [1500, 1500], [0, 1500]])); g.fill();
    [[180, 1205, 0.8], [960, 1192, 1.0], [1200, 1200, 0.6]].forEach(([x, y, s], i) => { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#5A3A5A'; g.fillRect(-6, -160, 12, 160); g.beginPath(); g.moveTo(0, -120); g.lineTo(-70, -175); g.lineTo(-60, -180); g.lineTo(0, -135); g.lineTo(55, -185); g.lineTo(64, -178); g.fill(); g.beginPath(); trace(g, smooth([[-190, -190], [-120, -228], [0, -236], [120, -230], [190, -192], [0, -170]])); g.fill(); g.restore(); });
    g.fillStyle = '#7A4A66'; g.beginPath(); trace(g, smooth([[0, 1300], [500, 1260], [1000, 1290], [1500, 1270], [1500, 2100], [0, 2100]])); g.fill();
  });
}
function drawSavanna(ctx, t, cam, inner) {
  camSet(ctx, cam, 0.1); ctx.drawImage(savannaBg(), -210, -90);
  ctx.setTransform(1, 0, 0, 1, 0, 0); glowSpot(ctx, 470 - cam.x * 0.1, 1040, 560, 'rgba(255,200,150,0.5)');
  camSet(ctx, cam, 1);
  inkShape(ctx, [[40, 1520], [130, 1390], [300, 1340], [560, 1330], [820, 1350], [960, 1420], [1060, 1540], [1060, 2100, 1], [40, 2100, 1]], { fill: '#4A3044', shade: '#3A2436', shadeOff: [-60, -40], line: BGL, lw: 4, wob: 0 });
  inkLine(ctx, [[130, 1392], [300, 1342], [560, 1332], [820, 1352], [960, 1422]], { line: '#F6C9A0', lw: 4, wob: 0, alpha: 0.8 });
  inner();
  camSet(ctx, cam, 1.4);
  for (let i = 0; i < 70; i++) { const x = -200 + i * 22 + rnd(i, 1) * 14, hh = 120 + rnd(i, 2) * 200, sw = 14 * Math.sin(t * 1.6 + i * 0.4); inkLine(ctx, [[x, 2000], [x + sw * 0.4, 2000 - hh * 0.55], [x + sw + (rnd(i, 3) - 0.5) * 40, 2000 - hh]], { line: i % 3 ? '#3E2438' : '#5A3450', lw: 7 + rnd(i, 4) * 4, wob: 0 }); }
}

// ------------------------------------------------ 5. páginas abertas do Diário da Criação (título)
function diaryPages() {
  return cachedPainted('pages', 1300, 2100, (g, w, h) => {
    g.fillStyle = '#3B2A45'; g.fillRect(0, 0, w, h);
    inkShape(g, [[70, 120, 1], [1230, 120, 1], [1230, 1980, 1], [70, 1980, 1]], { fill: '#7A3E52', line: BGL, lw: 5, wob: 0 });
    inkShape(g, [[110, 150, 1], [1190, 150, 1], [1190, 1950, 1], [110, 1950, 1]], { fill: '#F3E8D8', shade: '#E2D2C6', shadeOff: [30, 0], line: BGL, lw: 4, wob: 0 });
    g.strokeStyle = 'rgba(150,130,170,0.35)'; g.lineWidth = 2; for (let y = 260; y < 1900; y += 64) { g.beginPath(); g.moveTo(170, y); g.lineTo(1130, y); g.stroke(); }
    // rabiscos de estudo nas margens (tinta clara)
    g.strokeStyle = 'rgba(122,62,82,0.35)'; g.lineWidth = 3; g.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const y = 1500 + i * 64; g.beginPath(); for (let x = 180; x < 560 - rnd(i, 1) * 200; x += 18) g.lineTo(x, y + Math.sin(x * 0.2 + i) * 3); g.stroke(); }
  });
}
