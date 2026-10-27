// Núcleo do motor: tudo é função pura do tempo. Ruído só com semente (mulberry32), nunca Math.random.
'use strict';
const W = 1080, H = 1920;
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
/** número pseudoaleatório estável para (semente, índice) */
const rnd = (seed, i = 0) => mulberry32((Math.imul(seed | 0, 0x9E3779B1) ^ Math.imul((i | 0) + 0x7F4A7C15, 0x85EBCA77)) | 0)();
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const sm = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = (x) => Math.pow(clamp(x), 3);
const outBack = (x, c = 1.6) => { x = clamp(x); return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const bell = (t, c, w) => Math.exp(-Math.pow((t - c) / w, 2));
/** "animação em dois": o desenho do personagem muda 12 vezes por segundo */
const on2s = (t) => Math.floor(t * 12) / 12;
function keys(t, k, ease = sm) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) {
    const [t0, v0] = k[i], [t1, v1] = k[i + 1];
    if (t <= t1) { const e = ease((t - t0) / (t1 - t0)); return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], e)) : lerp(v0, v1, e); }
  }
  return k[k.length - 1][1];
}
const blinkAt = (t, times, d = 0.17) => { let b = 0; for (const b0 of times) { const x = (t - b0) / d; if (x > 0 && x < 1) b = Math.max(b, Math.sin(x * Math.PI)); } return b; };
function vnoise(x, y, seed = 1) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const h = (a, b) => rnd(seed + a * 7919, b);
  return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v);
}
const fbm = (x, y, o = 4, seed = 1) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f, seed + i); a *= 0.5; f *= 2; } return s; };

// ---------- curvas ----------
function smooth(pts, closed = true, n = 8) {
  const out = [], N = pts.length, last = closed ? N : N - 1;
  const P = (i) => closed ? pts[(i + N) % N] : pts[Math.max(0, Math.min(N - 1, i))];
  const tan = (i) => { const p = P(i); if (p[2]) return [0, 0]; const a = P(i - 1), b = P(i + 1); return [(b[0] - a[0]) / 6, (b[1] - a[1]) / 6]; };
  for (let i = 0; i < last; i++) {
    const p1 = P(i), p2 = P(i + 1), t1 = tan(i), t2 = tan(i + 1), c1 = [p1[0] + t1[0], p1[1] + t1[1]], c2 = [p2[0] - t2[0], p2[1] - t2[1]];
    for (let k = 0; k < n; k++) { const u = k / n, a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, c = 3 * (1 - u) * u * u, d = u ** 3; out.push([a * p1[0] + b * c1[0] + c * c2[0] + d * p2[0], a * p1[1] + b * c1[1] + c * c2[1] + d * p2[1]]); }
  }
  if (!closed) out.push(P(N - 1).slice(0, 2));
  return out;
}
function trace(ctx, poly, closed = true) { ctx.moveTo(poly[0][0], poly[0][1]); for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]); if (closed) ctx.closePath(); }
const norm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
const ell = (cx, cy, rx, ry, n = 12, rot = 0) => { const o = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry; o.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); } return o; };
function limb(P, R) {
  const L = [], Rr = [];
  for (let i = 0; i < P.length; i++) { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], d = norm([b[0] - a[0], b[1] - a[1]]); L.push([P[i][0] - d[1] * R[i], P[i][1] + d[0] * R[i]]); Rr.push([P[i][0] + d[1] * R[i], P[i][1] - d[0] * R[i]]); }
  const e = P.length - 1, d0 = norm([P[1][0] - P[0][0], P[1][1] - P[0][1]]), d1 = norm([P[e][0] - P[e - 1][0], P[e][1] - P[e - 1][1]]);
  return [...L, [P[e][0] + d1[0] * R[e] * 0.9, P[e][1] + d1[1] * R[e] * 0.9], ...Rr.reverse(), [P[0][0] - d0[0] * R[0] * 0.9, P[0][1] - d0[1] * R[0] * 0.9]];
}
function ik2(s, t, L1, L2, bend = 1) {
  const dx = t[0] - s[0], dy = t[1] - s[1], d = clamp(Math.hypot(dx, dy), Math.abs(L1 - L2) + 1e-3, L1 + L2 - 1e-3);
  const a1 = Math.atan2(dy, dx) + bend * Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  return [s[0] + Math.cos(a1) * L1, s[1] + Math.sin(a1) * L1];
}
const tf = (pts, tx, ty, rot = 0, sx = 1, sy = sx) => { const c = Math.cos(rot), s = Math.sin(rot); return pts.map((p) => { const x = p[0] * sx, y = p[1] * sy; return [tx + x * c - y * s, ty + x * s + y * c, p[2]]; }); };

// ---------- tinta: contorno fino + uma sombra de célula, com tremor de traço à mão ----------
const INK = '#2B2030';
let BOIL = 0;
let OUTLINE = false;     // estilo atual: formas sem contorno (só as linhas de expressão ficam)            // quadro do desenho (12 por segundo): define o tremor do traço
function boil(pts, amp = 0.9, seed = 1) { if (!amp) return pts; return pts.map((p, i) => [p[0] + (rnd(seed * 131 + BOIL, i) - 0.5) * amp * 2, p[1] + (rnd(seed * 173 + BOIL, i + 999) - 0.5) * amp * 2]); }
/** desenha uma forma: preenchimento, sombra de célula (forma menos ela mesma deslocada para a luz) e contorno */
function inkShape(ctx, pts, o) {
  const { fill, shade, shadeOff = [14, 12], line = INK, lw = 3.2, closed = true, n = 8, seed = 1, wob = 0.9, alpha = 1, noLine = false } = o;
  const poly = boil(smooth(pts, closed, n), wob, seed);
  ctx.save(); ctx.globalAlpha = alpha;
  if (fill) { ctx.beginPath(); trace(ctx, poly, closed); ctx.fillStyle = fill; ctx.fill(); }
  if (shade && fill) {
    ctx.save(); ctx.beginPath(); trace(ctx, poly); ctx.clip();
    ctx.beginPath(); ctx.rect(-5000, -5000, 10000, 10000); trace(ctx, poly.map((p) => [p[0] - shadeOff[0], p[1] - shadeOff[1]]));
    ctx.fillStyle = shade; ctx.fill('evenodd'); ctx.restore();
  }
  if (!noLine && line && (OUTLINE || o.feature)) { ctx.beginPath(); trace(ctx, poly, closed); ctx.strokeStyle = line; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
  ctx.restore();
  return poly;
}
/** traço aberto (linhas internas, listras, bigodes) */
function inkLine(ctx, pts, { line = INK, lw = 3, n = 6, seed = 2, wob = 0.7, alpha = 1 } = {}) {
  const poly = boil(smooth(pts, false, n), wob, seed);
  ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath(); trace(ctx, poly, false); ctx.strokeStyle = line; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
}
/** área com preenchimento só dentro de outra forma (manchas de pelagem, barriga) */
function clipTo(ctx, poly, fn) { ctx.save(); ctx.beginPath(); trace(ctx, poly); ctx.clip(); fn(); ctx.restore(); }

// ---------- utilidades de tela ----------
function radial(ctx, x, y, r0, r1, stops) { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
function linear(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
function glowSpot(ctx, x, y, r, color, a = 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.fillStyle = radial(ctx, x, y, 0, r, [[0, color], [1, 'rgba(0,0,0,0)']]); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
const CACHE = {};
function cached(name, w, h, fn) { if (!CACHE[name]) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); CACHE[name] = c; } return CACHE[name]; }
const LAYERS = {};
function layer(name) { let c = LAYERS[name]; if (!c) { c = document.createElement('canvas'); c.width = W; c.height = H; LAYERS[name] = c; } const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.clearRect(0, 0, W, H); return [c, g]; }
/** textura de papel pintado (estável): dá o acabamento de cenário pintado à mão */
function paper(ctx, a = 0.08) {
  const c = cached('paper', 540, 960, (g, w, h) => { const im = g.createImageData(w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = 128 + (fbm(x * 0.03, y * 0.03, 3, 5) - 0.5) * 120 + (rnd(9, y * w + x) - 0.5) * 50, i = (y * w + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay'; ctx.drawImage(c, 0, 0, W, H); ctx.restore();
}

/** pinceladas por cima de uma forma já pintada (source-atop): textura de pintura à mão que "ferve" a cada desenho.
 *  box = [x0, y0, x1, y1] em coordenadas locais; ang = direção do pelo; cores claras e escuras alternadas */
function brushStrokes(g, box, o = {}) {
  const { seed = 1, n = 160, len = 26, w = 5, ang = 0.15, light = 'rgba(255,240,215,0.22)', dark = 'rgba(90,40,30,0.16)', jitter = 1 } = o;
  g.save(); g.globalCompositeOperation = 'source-atop'; g.lineCap = 'round';
  const [x0, y0, x1, y1] = box, f = jitter ? BOIL % 2 : 0;
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, rnd(seed + f * 7, i)), y = lerp(y0, y1, rnd(seed + 31 + f * 7, i)), l = len * (0.5 + rnd(seed + 5, i)), a = ang + (rnd(seed + 9, i) - 0.5) * 0.6;
    g.strokeStyle = rnd(seed + 13, i) > 0.5 ? light : dark; g.lineWidth = w * (0.6 + 0.8 * rnd(seed + 17, i));
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.5 + 2, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  g.restore();
}

// ---------- acabamento pintado (piloto v4): textura de pincel presa à forma, bordas mescladas, sombras pintadas ----------
/** mapa de pinceladas em cinza médio (128 = neutro), seguindo um campo de fluxo; usado em modo "luz suave" */
function brushTex(seed = 1, size = 1024, n = 2600) {
  return cached('brushTex' + seed, size, size, (g, w, h) => {
    g.fillStyle = 'rgb(128,128,128)'; g.fillRect(0, 0, w, h); g.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = rnd(seed, i) * w, y = rnd(seed + 1, i) * h, a = (vnoise(x * 0.004, y * 0.004, seed) - 0.5) * 3.2 + 0.3, l = 18 + rnd(seed + 2, i) * 46, v = 70 + rnd(seed + 3, i) * 120;
      g.strokeStyle = `rgba(${v},${v},${v},0.55)`; g.lineWidth = 3 + rnd(seed + 4, i) * 9;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + Math.sin(a) * 4, y + Math.sin(a) * l * 0.5 - Math.cos(a) * 4, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
  });
}
/** acabamento pintado numa camada (canvas com alfa) já desenhada.
 *  M = matriz local -> tela [a,b,c,d,e,f] (a textura acompanha o corpo); box = [x0,y0,x1,y1] local da textura */
function painterize(layerCanvas, M, box, o = {}) {
  const { seed = 1, tex = 0.85, edge = 0.65, edgeBlur = 3.5, light = 'rgba(255,236,200,0.28)', shadow = 'rgba(70,30,60,0.32)' } = o;
  const g = layerCanvas.getContext('2d');
  // retângulo na tela que contém a caixa (o trabalho fica restrito a ele)
  const cs = [[box[0], box[1]], [box[2], box[1]], [box[0], box[3]], [box[2], box[3]]].map(([x, y]) => [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]]);
  const pad = edgeBlur * 3 + 4, x0 = Math.max(0, Math.floor(Math.min(...cs.map((c) => c[0])) - pad)), y0 = Math.max(0, Math.floor(Math.min(...cs.map((c) => c[1])) - pad));
  const x1 = Math.min(W, Math.ceil(Math.max(...cs.map((c) => c[0])) + pad)), y1 = Math.min(H, Math.ceil(Math.max(...cs.map((c) => c[1])) + pad)), bw = x1 - x0, bh = y1 - y0;
  if (bw <= 0 || bh <= 0) return [0, 0, 0, 0];
  const [tc, tg] = layer('pzTex');
  tg.imageSmoothingQuality = 'low'; tg.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]); tg.drawImage(brushTex(seed), box[0], box[1], box[2] - box[0], box[3] - box[1]);
  tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalCompositeOperation = 'destination-in'; tg.drawImage(layerCanvas, x0, y0, bw, bh, x0, y0, bw, bh);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'soft-light'; g.globalAlpha = tex; g.drawImage(tc, x0, y0, bw, bh, x0, y0, bw, bh); g.restore();
  g.save(); g.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]); g.globalCompositeOperation = 'source-atop';
  g.fillStyle = linear(g, 0, box[1], 0, box[3], [[0, light], [0.45, 'rgba(0,0,0,0)'], [0.7, 'rgba(0,0,0,0)'], [1, shadow]]); g.fillRect(box[0], box[1], box[2] - box[0], box[3] - box[1]);
  g.restore();
  if (edge > 0) { const [ec, eg] = layer('pzEdge'); eg.filter = `blur(${edgeBlur}px)`; eg.drawImage(layerCanvas, x0, y0, bw, bh, x0, y0, bw, bh); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'destination-over'; g.globalAlpha = edge; g.drawImage(ec, x0, y0, bw, bh, x0, y0, bw, bh); g.restore(); }
  return [x0, y0, bw, bh];
}
/** lavagens de cor e textura de pincel para cenários pré-renderizados (cache) */
function paintBackground(g, w, h, seed = 3, strength = 0.7) {
  g.save(); g.globalCompositeOperation = 'soft-light'; g.globalAlpha = strength;
  const bt = brushTex(seed + 40); for (let y = 0; y < h; y += 1024) for (let x = 0; x < w; x += 1024) g.drawImage(bt, x, y);
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.35;
  for (let i = 0; i < 26; i++) { const x = rnd(seed, i) * w, y = rnd(seed + 9, i) * h, r = 120 + rnd(seed + 3, i) * 320, v = rnd(seed + 5, i) > 0.5 ? 'rgba(255,235,210,0.5)' : 'rgba(80,40,90,0.45)'; g.fillStyle = radial(g, x, y, 0, r, [[0, v], [1, 'rgba(128,128,128,0)']]); g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
  g.restore();
}
/** cenário em cache já com o acabamento pintado (textura de pincel + lavagens de cor) */
function cachedPainted(name, w, h, fn, seed = 3, strength = 0.75) {
  return cached(name, w, h, (g, ww, hh) => {
    fn(g, ww, hh);
    const m = document.createElement('canvas'); m.width = ww; m.height = hh; m.getContext('2d').drawImage(g.canvas, 0, 0);   // máscara: a textura só fica onde já há tinta
    paintBackground(g, ww, hh, seed, strength);
    g.save(); g.globalCompositeOperation = 'destination-in'; g.drawImage(m, 0, 0); g.restore();
  });
}

/** luz da cena num personagem já desenhado (camada com alfa): lado da sombra, luz quente do lado da fonte e luz de recorte na borda.
 *  L = {dir: [dx, dy] de onde vem a luz, key, shade, rim, rimW, rimA}; rect = [x, y, w, h] na tela */
function lightRig(lc, rect, L) {
  if (!L || !rect || rect[2] <= 0) return;
  const g = lc.getContext('2d'), [x, y, w, h] = rect, [dx, dy] = norm(L.dir || [-1, -0.5]), cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h) / 2;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop';
  g.fillStyle = linear(g, cx + dx * R, cy + dy * R, cx - dx * R, cy - dy * R, [[0, L.key || 'rgba(255,226,180,0.22)'], [0.45, 'rgba(0,0,0,0)'], [0.62, 'rgba(0,0,0,0)'], [1, L.shade || 'rgba(60,30,90,0.34)']]);
  g.fillRect(x, y, w, h); g.restore();
  if (L.rim) {
    const rw = L.rimW || 5, [rc, rg] = layer('rimLight');
    rg.drawImage(lc, x, y, w, h, x, y, w, h); rg.globalCompositeOperation = 'destination-out'; rg.drawImage(lc, x, y, w, h, x - dx * rw, y - dy * rw, w, h);
    rg.globalCompositeOperation = 'source-in'; rg.fillStyle = L.rim; rg.fillRect(x, y, w, h);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = L.rimA ?? 0.75; g.drawImage(rc, x, y, w, h, x, y, w, h); g.restore();
  }
}
