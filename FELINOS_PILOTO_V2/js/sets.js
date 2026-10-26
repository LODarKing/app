// Cenários pintados em camadas: profundidade de campo (camadas distantes desfocadas), névoa, luz.
// Camadas estáticas são pré-renderizadas uma vez (cache) e movidas pela câmera com paralaxe.
'use strict';
const CACHE = {};
function cached(name, w, h, fn) {
  if (!CACHE[name]) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); CACHE[name] = c; }
  return CACHE[name];
}
/** câmera com paralaxe: profundidade 0 = infinito (parado), 1 = plano do personagem */
function camSet(ctx, cam, depth) {
  const z = 1 + (cam.zoom - 1) * depth, px = cam.x * depth, py = (cam.y || 0) * depth, fx = cam.fx ?? W / 2, fy = cam.fy ?? H / 2;
  ctx.setTransform(z, 0, 0, z, fx - z * (fx + px), fy - z * (fy + py));
}
function drawLayer(ctx, cam, depth, img, ox = 0, oy = 0) { camSet(ctx, cam, depth); ctx.drawImage(img, ox, oy); }

// ---------------------------------------------------------------- árvore/folhagem genérica pintada
function foliageBlob(g, cx, cy, r, base, light, dark, seed) {
  for (let i = 0; i < 26; i++) {
    const a = hash(seed + i) * 6.28, d = r * Math.sqrt(hash(seed * 3 + i)) * 0.8, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.8, rr = r * (0.28 + 0.2 * hash(seed + i * 7));
    const lit = clamp(0.5 - (Math.sin(a) * d) / r * 0.6 - (Math.cos(a) * d) / r * 0.3);
    g.fillStyle = lit > 0.62 ? light : lit < 0.35 ? dark : base; g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.fill();
  }
}

// ---------------------------------------------------------------- 1. área de estudos (manhã)
function studyBackground() {
  return cached('studyBg', 1400, 1400, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#7FC4E8'], [0.45, '#CDEBF2'], [0.7, '#F4E9C8'], [1, '#C9DDA0']]); g.fillRect(0, 0, w, h);
    g.filter = 'blur(14px)';
    for (let i = 0; i < 9; i++) { const x = -60 + i * 190 + hash(i) * 60, y = 420 + hash(i + 3) * 160, r = 200 + hash(i + 5) * 110; g.fillStyle = '#6E5236'; g.fillRect(x - 16, y + r * 0.4, 32, 700); foliageBlob(g, x, y, r, '#5FA35A', '#9AD07A', '#3F7E44', i * 13); }
    g.fillStyle = '#86BC6A'; g.fillRect(0, 900, w, 500);
    for (let i = 0; i < 8; i++) foliageBlob(g, i * 200 + hash(i + 9) * 80, 930 + hash(i) * 40, 110, '#4F9446', '#7DBF62', '#356E37', i * 7 + 100);
    g.filter = 'none';
    // bokeh: discos de luz
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 40; i++) { const x = hash(i * 3) * w, y = 250 + hash(i * 5) * 700, r = 18 + hash(i * 7) * 46; g.fillStyle = radial(g, x, y, r * 0.6, r, [[0, `rgba(255,248,210,${0.16 + 0.12 * hash(i)})`], [1, 'rgba(255,248,210,0)']]); g.beginPath(); g.arc(x, y, r, 0, 6.28); g.fill(); }
    g.globalCompositeOperation = 'source-over';
  });
}
function studyMid() {
  return cached('studyMid', 1400, 900, (g) => {
    g.filter = 'blur(5px)';
    // banco de madeira, mochila e cantil ao fundo
    g.fillStyle = '#8C5F38'; g.fillRect(760, 470, 380, 34); g.fillStyle = '#6E4626'; g.fillRect(790, 504, 26, 120); g.fillRect(1090, 504, 26, 120);
    g.fillStyle = '#2E6B4C'; tracePoly(g, smooth([[820, 470], [826, 380], [868, 350], [930, 354], [962, 392], [958, 470]])); g.fill();
    g.fillStyle = '#245A40'; tracePoly(g, smooth([[848, 420], [930, 420], [930, 462], [848, 462]])); g.fill();
    g.fillStyle = '#C9A36A'; g.fillRect(880, 360, 10, 70);
    g.filter = 'none';
  });
}
function woodTexture() {
  return cached('wood', 1600, 1000, (g, w, h) => {
    const im = g.createImageData(w, h), d = im.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const plank = Math.floor(x / 230), u = x + plank * 977;
      const grainV = fbm(u * 0.004, y * 0.06 + plank * 7, 4), ring = Math.sin((grainV * 6 + u * 0.002) * Math.PI * 2) * 0.5 + 0.5;
      const k = 0.82 + 0.18 * ring - 0.12 * fbm(u * 0.02, y * 0.005, 2), edge = (x % 230 < 3) ? 0.55 : 1;
      const i = (y * w + x) * 4; d[i] = 188 * k * edge; d[i + 1] = 124 * k * edge; d[i + 2] = 72 * k * edge; d[i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
  });
}
function drawStudySet(ctx, t, cam) {
  ctx.save();
  drawLayer(ctx, cam, 0.2, studyBackground(), -160, -60);
  drawLayer(ctx, cam, 0.55, studyMid(), -160, 560);
  // tampo da mesa em perspectiva (textura mapeada em faixas)
  camSet(ctx, cam, 1);
  const wood = woodTexture(), top = 1120, bot = 2050;
  for (let i = 0; i < 60; i++) {
    const v0 = i / 60, v1 = (i + 1) / 60, y0 = lerp(top, bot, v0 * v0 * 0.4 + v0 * 0.6), y1 = lerp(top, bot, v1 * v1 * 0.4 + v1 * 0.6), sc = lerp(0.55, 1.25, v0);
    const wpx = 1600 * sc; ctx.drawImage(wood, 0, v0 * 1000, 1600, 1000 / 60 + 1, W / 2 - wpx / 2, y0, wpx, y1 - y0 + 1);
  }
  ctx.fillStyle = linear(ctx, 0, top, 0, bot, [[0, 'rgba(255,214,150,0.25)'], [0.3, 'rgba(0,0,0,0)'], [1, 'rgba(40,15,0,0.45)']]); ctx.fillRect(-400, top, 1900, bot - top);
  ctx.fillStyle = '#E9B57A'; ctx.fillRect(-400, top - 6, 1900, 10);
  ctx.fillStyle = 'rgba(60,25,5,0.5)'; ctx.fillRect(-400, top + 4, 1900, 6);
  // objetos
  drawBook(ctx, 815, 1390, -0.18, 0.95, t);
  drawNotebook(ctx, 170, 1330, 0.16);
  drawMagnifier(ctx, 250, 1620, -0.35);
  drawLeafProp(ctx, 760, 1650, -0.5, '#6DBB45', '#4E9A32'); drawLeafProp(ctx, 840, 1720, 0.3, '#E2A13A', '#C27D22');
  drawCanteen(ctx, 70, 1190);
  ctx.restore();
}
function drawBook(g, x, y, rot, s, t, glow = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  softEllipse(g, 6, 92, 170, 26, 'rgba(40,15,0,0.55)', 1);
  g.fillStyle = '#EFE2C4'; g.fillRect(-128, 70, 256, 18);
  g.fillStyle = linear(g, -130, -90, 130, 90, [[0, '#8A4530'], [1, '#5E2A1C']]); tracePoly(g, smooth([[-132, -92, 1], [132, -92, 1], [132, 76, 1], [-132, 76, 1]])); g.fill();
  g.strokeStyle = '#D9A846'; g.lineWidth = 3; g.strokeRect(-116, -78, 232, 140);
  // pegada dourada em relevo
  g.save(); g.translate(0, -6); g.scale(0.62, 0.62);
  if (glow > 0) { g.globalCompositeOperation = 'lighter'; softEllipse(g, 0, 0, 160 * (1 + glow * 0.3), 160 * (1 + glow * 0.3), `rgba(255,210,100,${0.6 * glow})`, 1); g.globalCompositeOperation = 'source-over'; }
  drawPawShape(g, '#E8B84E', '#8A5A14');
  g.restore();
  g.font = '700 18px Poppins'; g.fillStyle = '#E8C46A'; g.textAlign = 'center'; g.fillText('DIÁRIO DA CRIAÇÃO', 0, 56);
  g.fillStyle = linear(g, -130, -92, 40, 40, [[0, 'rgba(255,240,210,0.25)'], [1, 'rgba(255,240,210,0)']]); g.fillRect(-132, -92, 264, 168);
  g.restore();
}
function drawPawShape(g, fill, edge) {
  g.fillStyle = edge; g.save(); g.translate(2, 3);
  tracePoly(g, smooth([[-52, 40], [-40, 0], [0, -14], [40, 0], [52, 40], [30, 66], [0, 58], [-30, 66]])); g.fill();
  [[-66, -22], [-26, -60], [26, -60], [66, -22]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 18, 24, x * 0.006, 0, 6.28); g.fill(); }); g.restore();
  g.fillStyle = fill;
  tracePoly(g, smooth([[-52, 40], [-40, 0], [0, -14], [40, 0], [52, 40], [30, 66], [0, 58], [-30, 66]])); g.fill();
  [[-66, -22], [-26, -60], [26, -60], [66, -22]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 18, 24, x * 0.006, 0, 6.28); g.fill(); });
}
function drawNotebook(g, x, y, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  softEllipse(g, 4, 80, 140, 20, 'rgba(40,15,0,0.45)', 1);
  g.fillStyle = '#FFF8E8'; g.fillRect(-120, -80, 230, 160);
  g.strokeStyle = 'rgba(80,140,200,0.5)'; g.lineWidth = 2; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-104, -50 + i * 24); g.lineTo(96, -50 + i * 24); g.stroke(); }
  g.strokeStyle = 'rgba(70,50,30,0.75)'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(-30, -10, 40, 22, 0, 0, 6.28); g.moveTo(10, -14); g.lineTo(40, -28); g.lineTo(36, -2); g.stroke();   // esboço de um peixe/folha
  g.strokeStyle = '#3A2A20'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(30, 96); g.lineTo(140, -30); g.stroke(); g.strokeStyle = '#F2C230'; g.lineWidth = 11; g.stroke();
  g.restore();
}
function drawMagnifier(g, x, y, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  softEllipse(g, 30, 30, 120, 40, 'rgba(40,15,0,0.45)', 1);
  g.strokeStyle = '#6B4325'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(56, 56); g.lineTo(150, 150); g.stroke();
  g.fillStyle = 'rgba(200,235,255,0.35)'; g.beginPath(); g.arc(0, 0, 72, 0, 6.28); g.fill();
  g.strokeStyle = linear(g, -70, -70, 70, 70, [[0, '#E9EEF2'], [1, '#7C8792']]); g.lineWidth = 13; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 50, 3.6, 4.4); g.stroke();
  g.restore();
}
function drawLeafProp(g, x, y, rot, c1, c2) {
  g.save(); g.translate(x, y); g.rotate(rot); softEllipse(g, 0, 16, 80, 16, 'rgba(40,15,0,0.35)', 1);
  g.fillStyle = linear(g, -70, 0, 70, 0, [[0, c1], [1, c2]]); tracePoly(g, smooth([[-80, 0, 1], [-30, -30], [40, -26], [80, 0, 1], [40, 26], [-30, 30]])); g.fill();
  g.strokeStyle = 'rgba(255,255,230,0.5)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-80, 0); g.lineTo(80, 0); for (let i = -2; i <= 2; i++) { g.moveTo(i * 26, 0); g.lineTo(i * 26 + 18, -18); g.moveTo(i * 26, 0); g.lineTo(i * 26 + 18, 18); } g.stroke();
  g.restore();
}
function drawCanteen(g, x, y) {
  g.save(); g.translate(x, y); softEllipse(g, 0, 40, 70, 16, 'rgba(40,15,0,0.45)', 1);
  g.fillStyle = linear(g, -50, 0, 50, 0, [[0, '#2E6B48'], [0.4, '#4C9468'], [1, '#1E4A32']]); tracePoly(g, smooth([[-50, 40], [-56, -60], [-30, -110], [30, -110], [56, -60], [50, 40]])); g.fill();
  g.fillStyle = '#9AA5B1'; g.fillRect(-18, -140, 36, 34);
  g.restore();
}
function dust(ctx, t, n, area, color, seed = 1) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const x = area[0] + ((hash(i + seed) * area[2] + t * (8 + 14 * hash(i * 3 + seed)) + Math.sin(t * 0.7 + i) * 20) % area[2]), y = area[1] + ((hash(i * 7 + seed) * area[3] - t * (6 + 10 * hash(i + 9)) + area[3] * 10) % area[3]);
    const r = 1.5 + 3 * hash(i * 5 + seed), a = 0.35 + 0.4 * Math.sin(t * 2 + i);
    ctx.fillStyle = color.replace('A', String(clamp(a))); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.fill();
  }
  ctx.restore();
}
function godRays(ctx, x, y, ang, spread, len, n, color, t, seed = 1) {
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.filter = 'blur(18px)';
  for (let i = 0; i < n; i++) {
    const a = ang + (i / (n - 1) - 0.5) * spread + Math.sin(t * 0.4 + i) * 0.01, w = 0.025 + 0.03 * hash(i + seed);
    ctx.fillStyle = linear(ctx, x, y, x + Math.cos(a) * len, y + Math.sin(a) * len, [[0, color.replace('A', String(0.32 + 0.2 * hash(i * 3 + seed)))], [1, color.replace('A', '0')]]);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a - w) * len, y + Math.sin(a - w) * len); ctx.lineTo(x + Math.cos(a + w) * len, y + Math.sin(a + w) * len); ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- 2. floresta tropical (onça-pintada)
function bigLeaf(g, x, y, len, wd, rot, c1, c2, vein = 'rgba(220,255,200,0.35)') {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = linear(g, 0, -wd, 0, wd, [[0, c1], [1, c2]]);
  tracePoly(g, smooth([[0, 0, 1], [len * 0.25, -wd * 0.9], [len * 0.68, -wd * 0.75], [len, 0, 1], [len * 0.68, wd * 0.75], [len * 0.25, wd * 0.9]])); g.fill();
  g.strokeStyle = vein; g.lineWidth = Math.max(1.5, wd * 0.04); g.beginPath(); g.moveTo(0, 0); g.lineTo(len, 0);
  for (let k = 1; k < 7; k++) { const u = k / 7; g.moveTo(len * u, 0); g.quadraticCurveTo(len * (u + 0.05), -wd * 0.4, len * (u + 0.1), -wd * 0.75 * Math.sin(Math.PI * u)); g.moveTo(len * u, 0); g.quadraticCurveTo(len * (u + 0.05), wd * 0.4, len * (u + 0.1), wd * 0.75 * Math.sin(Math.PI * u)); }
  g.stroke(); g.restore();
}
function jungleFar() {
  return cached('jFar', 2600, 1600, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#E6F2C8'], [0.4, '#A9D49A'], [1, '#4E8A5A']]); g.fillRect(0, 0, w, h);
    g.filter = 'blur(10px)';
    for (let i = 0; i < 16; i++) { const x = i * 170 + hash(i) * 80, tw = 30 + hash(i + 1) * 30; g.fillStyle = 'rgba(80,130,90,0.6)'; g.fillRect(x, 200, tw, 1400); foliageBlob(g, x, 260 + hash(i + 2) * 200, 200, 'rgba(96,150,100,0.8)', 'rgba(150,200,140,0.8)', 'rgba(70,120,80,0.8)', i * 5); }
    g.filter = 'none';
  });
}
function jungleMid() {
  return cached('jMid', 2600, 1600, (g) => {
    g.filter = 'blur(3px)';
    for (let i = 0; i < 9; i++) {
      const x = 80 + i * 290 + hash(i + 7) * 90, w = 64 + hash(i + 2) * 46;
      g.fillStyle = linear(g, x, 0, x + w, 0, [[0, '#4A3826'], [0.35, '#6E5638'], [1, '#2E2216']]); g.fillRect(x, 0, w, 1600);
      g.fillStyle = 'rgba(90,140,60,0.7)'; for (let k = 0; k < 7; k++) { g.beginPath(); g.ellipse(x + w * hash(i * 9 + k), 300 + k * 160, w * 0.35, 30, 0, 0, 6.28); g.fill(); }   // musgo
      g.strokeStyle = '#2F5E2A'; g.lineWidth = 8; g.beginPath(); g.moveTo(x + w / 2, 0); g.bezierCurveTo(x + w / 2 + 60, 300, x + w / 2 - 50, 600, x + w / 2 + 20, 900); g.stroke();   // cipó
    }
    for (let i = 0; i < 12; i++) foliageBlob(g, i * 230, 80 + hash(i) * 120, 210, '#2F6E36', '#4E9A48', '#1E4A26', i * 17 + 3);
    g.filter = 'none';
  });
}
function jungleGround() {
  return cached('jGround', 2600, 700, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#4A6E2E'], [0.3, '#36552A'], [1, '#1E3218']]); g.fillRect(0, 40, w, h);
    g.fillStyle = '#5A7E36'; tracePoly(g, smooth([[0, 60], [400, 30], [900, 64], [1400, 36], [2000, 60], [2600, 40], [2600, 120], [0, 120]])); g.fill();
    for (let i = 0; i < 70; i++) { const x = hash(i) * w, y = 60 + hash(i + 3) * 500; g.fillStyle = hash(i + 5) > 0.5 ? 'rgba(150,110,50,0.5)' : 'rgba(120,90,40,0.5)'; g.beginPath(); g.ellipse(x, y, 14, 6, hash(i) * 3, 0, 6.28); g.fill(); }
    for (let i = 0; i < 26; i++) { const x = hash(i * 7) * w, y = 70 + hash(i * 3) * 300; for (let k = 0; k < 7; k++) bigLeaf(g, x, y, 90 + hash(i + k) * 60, 18, -Math.PI / 2 + (k - 3) * 0.32, '#3E8A3A', '#2A6A2C'); }
  });
}
function drawRainforest(ctx, t, cam, catFn) {
  ctx.save();
  drawLayer(ctx, cam, 0.12, jungleFar(), -760, -100);
  godRays(ctx, 820, -200, 2.05, 0.7, 2400, 7, 'rgba(255,250,200,A)', t, 3);
  drawLayer(ctx, cam, 0.45, jungleMid(), -760, -80);
  camSet(ctx, cam, 0.45); ctx.fillStyle = 'rgba(200,230,190,0.18)'; ctx.fillRect(-800, 900, 2800, 600);   // névoa
  drawLayer(ctx, cam, 1, jungleGround(), -760, 1260);
  if (catFn) catFn();
  // folhas desfocadas em primeiro plano (profundidade de campo)
  camSet(ctx, cam, 1.8); ctx.filter = 'blur(12px)';
  for (let i = 0; i < 7; i++) { const x = -400 + i * 520, top = i % 2 === 0; bigLeaf(ctx, x, top ? -80 : 2040, 520, 150, top ? 1.0 + 0.08 * Math.sin(t + i) : -1.2 + 0.06 * Math.sin(t * 1.2 + i), '#1E5A28', '#123E1A', 'rgba(120,180,110,0.3)'); }
  ctx.filter = 'none';
  ctx.restore();
  dust(ctx, t, 40, [0, 200, W, 1400], 'rgba(255,250,210,A)', 7);
}

// ---------------------------------------------------------------- 3. bambuzal asiático (tigre)
function bambooLayer(name, n, wmin, wmax, c1, c2, blur, seed, alpha = 1) {
  return cached(name, 2600, 1700, (g) => {
    g.filter = blur ? `blur(${blur}px)` : 'none'; g.globalAlpha = alpha;
    for (let i = 0; i < n; i++) {
      const x = hash(i + seed) * 2600, w = lerp(wmin, wmax, hash(i * 3 + seed)), lean = (hash(i * 5 + seed) - 0.5) * 60;
      g.fillStyle = linear(g, x, 0, x + w, 0, [[0, c2], [0.35, c1], [1, c2]]);
      g.beginPath(); g.moveTo(x + lean, 0); g.lineTo(x + lean + w, 0); g.lineTo(x + w, 1700); g.lineTo(x, 1700); g.fill();
      g.fillStyle = 'rgba(0,0,0,0.18)'; for (let k = 0; k < 8; k++) { const y = 80 + k * 210 + hash(i + k) * 40, xx = x + lean * (1 - y / 1700); g.fillRect(xx - 2, y, w + 4, w * 0.12 + 3); }
      for (let k = 0; k < 4; k++) { const y = 200 + k * 360 + hash(i * 7 + k) * 80, xx = x + lean * (1 - y / 1700) + w / 2; for (let q = 0; q < 4; q++) bigLeaf(g, xx, y, 70 + q * 12, 9, (k % 2 ? -0.5 : 3.6) + q * 0.25, c1, c2, 'rgba(0,0,0,0)'); }
    }
  });
}
function drawBamboo(ctx, t, cam, catFn) {
  ctx.save();
  camSet(ctx, cam, 0); ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#F4F2E2'], [0.55, '#D6E4CC'], [1, '#9DB88E']]); ctx.fillRect(0, 0, W, H);
  drawLayer(ctx, cam, 0.12, bambooLayer('bb0', 40, 14, 26, '#B9CDB0', '#A5BC9C', 8, 1, 0.8), -760, -40);
  camSet(ctx, cam, 0); ctx.fillStyle = 'rgba(240,244,230,0.45)'; ctx.fillRect(0, 0, W, H);
  drawLayer(ctx, cam, 0.3, bambooLayer('bb1', 26, 22, 36, '#8FB088', '#77986E', 4, 50), -760, -40);
  camSet(ctx, cam, 0); ctx.fillStyle = 'rgba(235,240,222,0.3)'; ctx.fillRect(0, 0, W, H);
  godRays(ctx, 200, -300, 1.25, 0.8, 2600, 8, 'rgba(255,248,215,A)', t, 9);
  drawLayer(ctx, cam, 0.6, bambooLayer('bb2', 14, 34, 50, '#5E9058', '#3E6E3E', 1.5, 90), -760, -40);
  camSet(ctx, cam, 1); ctx.fillStyle = linear(ctx, 0, 1220, 0, 2000, [[0, '#8A9A5A'], [0.2, '#6E8048'], [1, '#2E3A1E']]); ctx.fillRect(-800, 1230, 2800, 900);
  for (let i = 0; i < 60; i++) { const x = -700 + i * 46 + hash(i) * 30; ctx.strokeStyle = i % 2 ? '#5A7238' : '#738C46'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, 1260 + hash(i + 2) * 40); ctx.quadraticCurveTo(x + 8, 1220, x + 4 + Math.sin(t * 2 + i) * 6, 1180 + hash(i) * 30); ctx.stroke(); }
  if (catFn) catFn();
  // bambus desfocados na frente
  camSet(ctx, cam, 1.9); ctx.filter = 'blur(16px)'; ctx.globalAlpha = 0.75;
  for (let i = 0; i < 2; i++) { const x = -150 + i * 1500; ctx.fillStyle = linear(ctx, x, 0, x + 110, 0, [[0, '#1E3A1E'], [0.4, '#356A34'], [1, '#162C16']]); ctx.fillRect(x, -200, 110, 2400); }
  ctx.filter = 'none'; ctx.globalAlpha = 1;
  ctx.restore();
  dust(ctx, t, 30, [0, 300, W, 1300], 'rgba(255,255,235,A)', 21);
}

// ---------------------------------------------------------------- 4. savana ao pôr do sol (leão, contraluz)
function savannaSky() {
  return cached('svSky', 1500, 2100, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#3A2A5C'], [0.25, '#B2475A'], [0.45, '#F07A3A'], [0.6, '#FFB65A'], [0.7, '#FFD98A'], [1, '#E7953E']]); g.fillRect(0, 0, w, h);
    g.filter = 'blur(20px)'; g.fillStyle = 'rgba(255,170,120,0.35)';
    for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(hash(i) * w, 300 + i * 120, 400, 26, 0, 0, 6.28); g.fill(); }
    g.filter = 'none';
  });
}
function drawSavanna(ctx, t, cam, catFn, sun = [330, 1060]) {
  ctx.save();
  drawLayer(ctx, cam, 0.05, savannaSky(), -210, -90);
  camSet(ctx, cam, 0.08);
  ctx.globalCompositeOperation = 'lighter';
  softEllipse(ctx, sun[0], sun[1], 900, 900, 'rgba(255,170,80,0.45)', 1);
  softEllipse(ctx, sun[0], sun[1], 300, 300, 'rgba(255,230,160,0.9)', 1);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#FFF4D6'; ctx.beginPath(); ctx.arc(sun[0], sun[1], 120, 0, 6.28); ctx.fill();
  // horizonte distante com acácias
  camSet(ctx, cam, 0.2); ctx.filter = 'blur(2px)';
  ctx.fillStyle = '#B5603A'; tracePoly(ctx, smooth([[-400, 1180], [0, 1150], [500, 1170], [1000, 1140], [1500, 1160], [1500, 1400], [-400, 1400]], true)); ctx.fill();
  [[60, 1160, 0.8], [760, 1145, 1.0], [980, 1158, 0.6]].forEach(([x, y, s]) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#5A2A22'; ctx.fillRect(-6, -160, 12, 160); ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(-70, -175); ctx.lineTo(-60, -180); ctx.lineTo(0, -135); ctx.lineTo(55, -185); ctx.lineTo(64, -178); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, -190, 190, 36, 0, Math.PI, 0); ctx.fill(); ctx.restore(); });
  ctx.filter = 'none';
  godRays(ctx, sun[0], sun[1], -0.6, 5.5, 1800, 16, 'rgba(255,200,120,A)', t, 31);
  camSet(ctx, cam, 0.5); ctx.fillStyle = linear(ctx, 0, 1220, 0, 1700, [[0, '#9A4A2C'], [1, '#5A2616']]); tracePoly(ctx, smooth([[-500, 1260], [200, 1220], [800, 1250], [1600, 1230], [1600, 2100], [-500, 2100]], true)); ctx.fill();
  if (catFn) catFn();
  // capim em contraluz na frente
  camSet(ctx, cam, 1.4);
  for (let i = 0; i < 90; i++) { const x = -300 + i * 20 + hash(i) * 14, h = 120 + hash(i + 2) * 200, sw = 14 * Math.sin(t * 1.6 + i * 0.4); ctx.strokeStyle = i % 3 ? '#3A160C' : '#52200F'; ctx.lineWidth = 5 + hash(i) * 4; ctx.beginPath(); ctx.moveTo(x, 2000); ctx.quadraticCurveTo(x + sw * 0.4, 2000 - h * 0.55, x + sw + (hash(i) - 0.5) * 40, 2000 - h); ctx.stroke(); }
  ctx.restore();
  dust(ctx, t, 60, [0, 400, W, 1300], 'rgba(255,210,140,A)', 41);
}
function drawRock(ctx) {
  ctx.fillStyle = linear(ctx, 0, 1320, 0, 1700, [[0, '#4A2416'], [1, '#22100A']]);
  tracePoly(ctx, smooth([[40, 1520], [130, 1390], [300, 1340], [560, 1330], [820, 1350], [960, 1420], [1060, 1540], [1060, 2100], [40, 2100]])); ctx.fill();
  ctx.strokeStyle = 'rgba(255,170,90,0.6)'; ctx.lineWidth = 4; ctx.filter = 'blur(2px)'; tracePoly(ctx, smooth([[130, 1390], [300, 1340], [560, 1330], [820, 1350], [960, 1420]], false)); ctx.stroke(); ctx.filter = 'none';
}
