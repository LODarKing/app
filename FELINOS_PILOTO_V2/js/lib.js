// Biblioteca base do motor de animação: matemática, ruído, curvas, camadas, pelos, luz de contorno.
// Tudo é determinístico: o mesmo t sempre gera o mesmo quadro.
'use strict';
const W = 1080, H = 1920;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const sm = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = (x) => Math.pow(clamp(x), 3);
const outBack = (x, c = 1.7) => { x = clamp(x); return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const bell = (t, c, w) => Math.exp(-Math.pow((t - c) / w, 2));
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** chaves suaves [[t, v], ...] (números ou vetores) */
function keys(t, k, ease = sm) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) {
    const [t0, v0] = k[i], [t1, v1] = k[i + 1];
    if (t <= t1) { const e = ease((t - t0) / (t1 - t0)); return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], e)) : lerp(v0, v1, e); }
  }
  return k[k.length - 1][1];
}
const blinkAt = (t, times, d = 0.17) => { let b = 0; for (const b0 of times) { const x = (t - b0) / d; if (x > 0 && x < 1) b = Math.max(b, Math.sin(x * Math.PI)); } return b; };

// ---------- ruído de valor 2D (texturas) ----------
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const h = (a, b) => hash(a * 57 + b * 131 + 0.5);
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v);
}
const fbm = (x, y, o = 4) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); a *= 0.5; f *= 2; } return s; };

// ---------- curvas ----------
/** curva suave fechada (ou aberta) passando pelos pontos; [x, y, 1] = canto. Retorna polilinha densa. */
function smooth(pts, closed = true, n = 10) {
  const out = [], N = pts.length, last = closed ? N : N - 1;
  const P = (i) => closed ? pts[(i + N) % N] : pts[Math.max(0, Math.min(N - 1, i))];
  const tan = (i) => { const p = P(i); if (p[2]) return [0, 0]; const a = P(i - 1), b = P(i + 1); return [(b[0] - a[0]) / 6, (b[1] - a[1]) / 6]; };
  for (let i = 0; i < last; i++) {
    const p1 = P(i), p2 = P(i + 1), t1 = tan(i), t2 = tan(i + 1);
    const c1 = [p1[0] + t1[0], p1[1] + t1[1]], c2 = [p2[0] - t2[0], p2[1] - t2[1]];
    for (let k = 0; k < n; k++) {
      const u = k / n, a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, c = 3 * (1 - u) * u * u, d = u ** 3;
      out.push([a * p1[0] + b * c1[0] + c * c2[0] + d * p2[0], a * p1[1] + b * c1[1] + c * c2[1] + d * p2[1]]);
    }
  }
  if (!closed) out.push(P(N - 1).slice(0, 2));
  return out;
}
function tracePoly(ctx, poly, closed = true) {
  ctx.beginPath(); ctx.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
  if (closed) ctx.closePath();
}
const xform = (pts, tx, ty, rot = 0, sx = 1, sy = sx) => { const c = Math.cos(rot), s = Math.sin(rot); return pts.map((p) => { const x = p[0] * sx, y = p[1] * sy; return [tx + x * c - y * s, ty + x * s + y * c, p[2]]; }); };
const ellipsePts = (cx, cy, rx, ry, n = 12, rot = 0) => { const o = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const x = Math.cos(a) * rx, y = Math.sin(a) * ry; o.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); } return o; };
/** cápsula entre segmentos com raios por junta (membros) */
function limbPts(P, R) {
  // contorno ao redor de uma cadeia P[0..n] com raios R[0..n]
  const L = [], Rr = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    L.push([P[i][0] - dy * R[i], P[i][1] + dx * R[i]]); Rr.push([P[i][0] + dy * R[i], P[i][1] - dx * R[i]]);
  }
  const e = P.length - 1, d0 = norm([P[1][0] - P[0][0], P[1][1] - P[0][1]]), d1 = norm([P[e][0] - P[e - 1][0], P[e][1] - P[e - 1][1]]);
  const tip = [P[e][0] + d1[0] * R[e] * 0.9, P[e][1] + d1[1] * R[e] * 0.9], back = [P[0][0] - d0[0] * R[0] * 0.9, P[0][1] - d0[1] * R[0] * 0.9];
  return [...L, tip, ...Rr.reverse(), back];
}
const norm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
/** IK de 2 ossos (y para baixo): devolve o cotovelo/joelho */
function ik2(s, t, L1, L2, bend = 1) {
  const dx = t[0] - s[0], dy = t[1] - s[1];
  const d = clamp(Math.hypot(dx, dy), Math.abs(L1 - L2) + 1e-3, L1 + L2 - 1e-3);
  const base = Math.atan2(dy, dx), al = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const a1 = base + bend * al;
  return [s[0] + Math.cos(a1) * L1, s[1] + Math.sin(a1) * L1];
}

// ---------- camadas (canvases fora da tela) ----------
const LAYERS = {};
function layer(name, w = W, h = H) {
  let c = LAYERS[name];
  if (!c) { c = document.createElement('canvas'); c.width = w; c.height = h; LAYERS[name] = c; }
  const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.filter = 'none'; g.clearRect(0, 0, c.width, c.height);
  return [c, g];
}

// ---------- pelo: fios curtos saindo do contorno ----------
/** poly em coordenadas atuais do ctx. dir: ângulo extra; len, width, cor; seed estável por índice */
function fur(ctx, poly, o) {
  const { color = '#000', len = 10, width = 2.2, step = 5, seed = 1, alpha = 1, bias = 0, inset = 2, skip } = o;
  let area = 0; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const sg = area > 0 ? 1 : -1;
  ctx.save(); ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.globalAlpha = alpha; ctx.lineWidth = width;
  ctx.beginPath();
  let acc = 0, k = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let s = acc ? step - acc : 0;
    while (s < seg) {
      const u = s / seg, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u);
      const tx = (b[0] - a[0]) / seg, ty = (b[1] - a[1]) / seg, nx = ty * sg, ny = -tx * sg;
      if (!skip || !skip(x, y, nx, ny)) {
        const r = hash(seed * 101 + k), l = len * (0.55 + 0.7 * r), ang = (hash(seed * 7 + k * 3) - 0.5) * 0.9 + bias;
        const c = Math.cos(ang), sn = Math.sin(ang), dx = nx * c - ny * sn, dy = nx * sn + ny * c;
        const x0 = x - nx * inset, y0 = y - ny * inset;
        ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + dx * l * 0.6 + tx * l * 0.15, y0 + dy * l * 0.6 + ty * l * 0.15, x0 + dx * l, y0 + dy * l);
      }
      k++; s += step;
    }
    acc = (acc + seg) % step;
  }
  ctx.stroke(); ctx.restore();
}

/** luz de contorno: a silhueta (canvas src) menos ela mesma deslocada para o lado da luz */
function rimLight(dst, src, dx, dy, color, blur = 2, alpha = 1, op = 'source-over') {
  const [c, g] = layer('rim');
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'destination-out'; g.drawImage(src, -dx, -dy);
  g.globalCompositeOperation = 'source-in'; g.fillStyle = color; g.fillRect(0, 0, W, H);
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.globalAlpha = alpha; dst.globalCompositeOperation = op; if (blur) dst.filter = `blur(${blur}px)`;
  dst.drawImage(c, 0, 0); dst.restore();
}
/** escurece/clareia uma camada inteira por cima (mantendo o alfa) */
function tintLayer(g, color, op = 'source-atop') { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = op; g.fillStyle = color; g.fillRect(0, 0, W, H); g.restore(); }

// ---------- utilidades de desenho ----------
function radial(ctx, x, y, r0, r1, stops) { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
function linear(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
function softEllipse(ctx, x, y, rx, ry, color, alpha = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, ry / rx);
  ctx.fillStyle = radial(ctx, 0, 0, 0, rx, [[0, color], [1, 'rgba(0,0,0,0)']]); ctx.globalAlpha = alpha;
  ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function strokePoly(ctx, pts, color, w, closed = false, smoothN = 10) { ctx.save(); tracePoly(ctx, smooth(pts, closed, smoothN), closed); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore(); }
function fillPoly(ctx, pts, fill, smoothN = 10) { ctx.save(); tracePoly(ctx, smooth(pts, true, smoothN)); ctx.fillStyle = fill; ctx.fill(); ctx.restore(); }
/** grão de filme estável por quadro */
let GRAIN = null;
function grain(ctx, t, amount = 0.06) {
  if (!GRAIN) {
    GRAIN = [];
    for (let k = 0; k < 4; k++) {
      const c = document.createElement('canvas'); c.width = 270; c.height = 480; const g = c.getContext('2d'), im = g.createImageData(270, 480);
      for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (hash(i * 0.25 + k * 9999) - 0.5) * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
      g.putImageData(im, 0, 0); GRAIN.push(c);
    }
  }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = amount; ctx.globalCompositeOperation = 'overlay'; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(GRAIN[Math.floor(t * 24) % 4], 0, 0, W, H); ctx.restore();
}
function vignette(ctx, amount = 0.55, cy = 0.45) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = radial(ctx, W / 2, H * cy, H * 0.28, H * 0.78, [[0, 'rgba(0,0,0,0)'], [1, `rgba(8,4,0,${amount})`]]);
  ctx.fillRect(0, 0, W, H); ctx.restore();
}
