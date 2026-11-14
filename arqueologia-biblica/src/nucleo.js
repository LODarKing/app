// Núcleo: canvas, matemática, easing, ruído com semente (mulberry32), texturas de papiro/areia,
// peças de recorte (cut-out) com contorno de tinta, sombra de papel e textura presa à peça.
// Contrato: window.seek(t) desenha o quadro do instante t. Nada passa de um quadro para outro
// (os caches abaixo são só texturas fixas, calculadas uma vez e iguais em todo quadro).
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const { W, H } = CFG, C = CFG.cor;

// ---------------------------------------------------------------- matemática
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const ease = {
  io: (k) => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
  o: (k) => 1 - Math.pow(1 - k, 3),
  o5: (k) => 1 - Math.pow(1 - k, 5),
  i: (k) => k * k * k,
  i2: (k) => k * k,
  back: (k) => { const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
  // mola amortecida (para assentar peças): 0→1 com uma ou duas oscilações
  mola: (k) => k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.exp(-6 * k) * Math.cos(k * 13),
};
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = (seed, i) => mulberry32(seed * 7919 + i * 104729)();
const rs = (seed, i) => rnd(seed, i) * 2 - 1;                      // −1..1
const on2 = (t) => Math.floor(t * 12 + 1e-6) / 12;                  // animação "em dois" (12 desenhos/s)
const on3 = (t) => Math.floor(t * 8 + 1e-6) / 8;                    // stepped mais marcado (8 desenhos/s)
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(a, b, k) { const x = hex2rgb(a), y = hex2rgb(b); return '#' + x.map((v, i) => Math.round(lerp(v, y[i], k)).toString(16).padStart(2, '0')).join(''); }
const shade = (h, k) => k >= 0 ? mix(h, '#FFFFFF', k) : mix(h, '#000000', -k);
function rgba(h, a) { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; }

// ---------------------------------------------------------------- texturas (calculadas uma vez, com semente)
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
// Folha de papiro: tiras horizontais (camada de cima) sobre tiras verticais (de baixo), fibras, grãos de areia.
function pintaPapiro(g, w, h, seed, base = C.papiro) {
  const R = mulberry32(seed);
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  // tiras verticais (aparecem por baixo, bem fracas)
  for (let x = 0; x < w; x += 26 + R() * 30) { g.fillStyle = rgba(R() < 0.5 ? C.fibra : C.papiroClaro, 0.05 + R() * 0.06); g.fillRect(x, 0, 14 + R() * 24, h); }
  // tiras horizontais: faixas de 30–60 px com borda escura fina (junta entre tiras)
  for (let y = 0; y < h;) { const hh = 34 + R() * 34; g.fillStyle = rgba(R() < 0.55 ? C.papiroClaro : C.papiroEsc, 0.10 + R() * 0.10); g.fillRect(0, y, w, hh); g.fillStyle = rgba(C.fibra, 0.16); g.fillRect(0, y + hh - 2, w, 1.5); y += hh; }
  // fibras longas
  g.lineCap = 'round';
  for (let i = 0; i < w * h / 900; i++) {
    const x = R() * w, y = R() * h, l = 30 + R() * 160, hor = R() < 0.7;
    g.strokeStyle = rgba(R() < 0.6 ? C.fibra : '#FFF6DC', 0.07 + R() * 0.12); g.lineWidth = 0.8 + R() * 1.8;
    g.beginPath(); g.moveTo(x, y); if (hor) g.quadraticCurveTo(x + l / 2, y + (R() - 0.5) * 4, x + l, y + (R() - 0.5) * 3); else g.lineTo(x + (R() - 0.5) * 3, y + l); g.stroke();
  }
  // grão: ruído fino + pontinhos de areia
  const im = g.getImageData(0, 0, w, h), d = im.data;
  for (let i = 0; i < d.length; i += 4) { const n = (R() - 0.5) * 16; d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.8; }
  g.putImageData(im, 0, 0);
  for (let i = 0; i < w * h / 1400; i++) { g.fillStyle = rgba(R() < 0.5 ? C.terra : C.areiaEsc, 0.12 + R() * 0.25); g.beginPath(); g.arc(R() * w, R() * h, 0.6 + R() * 1.6, 0, 7); g.fill(); }
}
// Textura de multiplicação para as peças (branco = neutro): fibra e grão, presa à peça (move junto com ela).
let _texPeca = null, _texPedra = null, _fundo = null;
function texPeca() {
  if (_texPeca) return _texPeca;
  const c = canvas(384, 384), g = c.getContext('2d'), R = mulberry32(5);
  g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, 384, 384);
  for (let i = 0; i < 900; i++) { const x = R() * 384, y = R() * 384, l = 10 + R() * 60; g.strokeStyle = `rgba(120,80,40,${0.05 + R() * 0.10})`; g.lineWidth = 0.7 + R() * 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + (R() - 0.5) * 3); g.stroke(); }
  const im = g.getImageData(0, 0, 384, 384), d = im.data;
  for (let i = 0; i < d.length; i += 4) { const n = R() * 26; d[i] -= n; d[i + 1] -= n; d[i + 2] -= n * 1.1; }
  g.putImageData(im, 0, 0);
  _texPeca = ctx.createPattern(c, 'repeat'); return _texPeca;
}
// Basalto: poros (vesículas) e grão mineral
function texPedra() {
  if (_texPedra) return _texPedra;
  const c = canvas(320, 320), g = c.getContext('2d'), R = mulberry32(17);
  g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, 320, 320);
  const im = g.getImageData(0, 0, 320, 320), d = im.data;
  for (let i = 0; i < d.length; i += 4) { const n = R() * 60; d[i] -= n; d[i + 1] -= n; d[i + 2] -= n * 0.9; }
  g.putImageData(im, 0, 0);
  for (let i = 0; i < 260; i++) { const r = 0.8 + R() * R() * 4.5; g.fillStyle = `rgba(20,20,22,${0.35 + R() * 0.4})`; g.beginPath(); g.ellipse(R() * 320, R() * 320, r * 1.3, r, R() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 140; i++) { g.fillStyle = `rgba(255,250,240,${0.15 + R() * 0.25})`; g.fillRect(R() * 320, R() * 320, 1.2, 1.2); }
  _texPedra = ctx.createPattern(c, 'repeat'); return _texPedra;
}
// Parede de papiro do fundo (maior que a tela, para paralaxe)
function fundoPapiro(dx = 0, dy = 0, z = 1) {
  if (!_fundo) { _fundo = canvas(W + 240, H + 240); pintaPapiro(_fundo.getContext('2d'), W + 240, H + 240, 3); }
  ctx.setTransform(z, 0, 0, z, W / 2 - (W / 2) * z, H / 2 - (H / 2) * z);
  ctx.drawImage(_fundo, -120 + clamp(dx, -110, 110), -120 + clamp(dy, -110, 110));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // escurecimento suave nas bordas (papiro envelhecido) — sem moldura
  const v = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.28, W / 2, H * 0.5, H * 0.75);
  v.addColorStop(0, 'rgba(60,30,10,0)'); v.addColorStop(1, 'rgba(60,30,10,0.32)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- peças de recorte
const _p2d = new Map();
const P2 = (d) => { let p = _p2d.get(d); if (!p) { p = new Path2D(d); _p2d.set(d, p); } return p; };
// Desenha uma peça: sombra de papel recortado, cor chapada, textura multiplicada presa à peça, contorno de tinta.
function peca(path, cor, { lw = 4, tex = 0.55, sombra = 1, tinta = C.tinta, pedra = false, semContorno = false } = {}) {
  const p = typeof path === 'string' ? P2(path) : path;
  if (sombra) { ctx.save(); ctx.shadowColor = `rgba(45,22,6,${0.34 * sombra})`; ctx.shadowBlur = 9; ctx.shadowOffsetX = 5; ctx.shadowOffsetY = 8; ctx.fillStyle = cor; ctx.fill(p); ctx.restore(); }
  else { ctx.fillStyle = cor; ctx.fill(p); }
  if (tex) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = tex; ctx.fillStyle = pedra ? texPedra() : texPeca(); ctx.fill(p); ctx.restore(); }
  if (!semContorno && lw) { ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = tinta; ctx.lineWidth = lw; ctx.stroke(p); }
}
// Membro articulado (osso entre dois pivôs), afinando e com leve volume de músculo do lado "de fora"
function membro(ax, ay, bx, by, w1, w2, cor, { bojo = 0.12, lw = 3.6, sombra = 1 } = {}) {
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const p = new Path2D(), mx = (ax + bx) / 2, my = (ay + by) / 2, wm = (w1 + w2) / 2;
  p.moveTo(ax + nx * w1, ay + ny * w1);
  p.quadraticCurveTo(mx + nx * wm * (1 + bojo), my + ny * wm * (1 + bojo), bx + nx * w2, by + ny * w2);
  p.arc(bx, by, w2, Math.atan2(ny, nx), Math.atan2(-ny, -nx), false);
  p.quadraticCurveTo(mx - nx * wm * (1 + bojo * 0.4), my - ny * wm * (1 + bojo * 0.4), ax - nx * w1, ay - ny * w1);
  p.arc(ax, ay, w1, Math.atan2(-ny, -nx), Math.atan2(ny, nx), false);
  p.closePath();
  peca(p, cor, { lw: 0, sombra });
  // contorno sem a tampa do início (o pivô fica escondido pela peça anterior: sem "bolinha" na articulação)
  const q = new Path2D(); q.moveTo(ax + nx * w1, ay + ny * w1);
  q.quadraticCurveTo(mx + nx * wm * (1 + bojo), my + ny * wm * (1 + bojo), bx + nx * w2, by + ny * w2);
  q.arc(bx, by, w2, Math.atan2(ny, nx), Math.atan2(-ny, -nx), false);
  q.quadraticCurveTo(mx - nx * wm * (1 + bojo * 0.4), my - ny * wm * (1 + bojo * 0.4), ax - nx * w1, ay - ny * w1);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = C.tinta; ctx.lineWidth = lw; ctx.stroke(q);
}
// Cinemática inversa de 2 ossos (perna): devolve o joelho
function ik2(rx, ry, tx, ty, a, b, dobraFrente = 1) {
  let dx = tx - rx, dy = ty - ry, d = Math.hypot(dx, dy); d = clamp(d, Math.abs(a - b) + 1, a + b - 0.5);
  const phi = Math.atan2(dy, dx), al = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
  const ang = phi - dobraFrente * al;
  return [rx + Math.cos(ang) * a, ry + Math.sin(ang) * a];
}
// Pivô: aplica translate/rotate/scale em torno de um ponto e executa fn
function pivo(x, y, rot, sx, sy, fn) { ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); if (sx !== 1 || sy !== 1) ctx.scale(sx, sy); fn(); ctx.restore(); }

// ---------------------------------------------------------------- câmera e texto
function camera(z, fx, fy, sx = W / 2, sy = H / 2) { ctx.setTransform(z, 0, 0, z, sx - fx * z, sy - fy * z); }
const mundoTela = (x, y, z, fx, fy, sx = W / 2, sy = H / 2) => [sx + (x - fx) * z, sy + (y - fy) * z];
function fonte(px, fam = 'ui', peso = 800) { return `${peso} ${px}px ${fam === 'titulo' ? CFG.fonte.titulo : fam === 'fen' ? CFG.fonte.fen : fam === 'hier' ? CFG.fonte.hier : CFG.fonte.ui}`; }
function texto(s, x, y, { px = 48, fam = 'ui', peso = 800, cor = C.tinta, al = 'left', base = 'alphabetic', ls = 0, contorno = 0, corContorno = C.tinta } = {}) {
  ctx.font = fonte(px, fam, peso); ctx.textAlign = al; ctx.textBaseline = base; ctx.letterSpacing = ls + 'px';
  if (contorno) { ctx.lineJoin = 'round'; ctx.lineWidth = contorno; ctx.strokeStyle = corContorno; ctx.strokeText(s, x, y); }
  ctx.fillStyle = cor; ctx.fillText(s, x, y); ctx.letterSpacing = '0px';
}
function largura(s, px, fam = 'ui', peso = 800, ls = 0) { ctx.font = fonte(px, fam, peso); ctx.letterSpacing = ls + 'px'; const w = ctx.measureText(s).width; ctx.letterSpacing = '0px'; return w; }
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
// Traço de tinta revelado ao longo do caminho (pontos), com leve variação de espessura
function tracoTinta(pts, k, cor = C.tinta, lw = 5, tracejado = null) {
  if (k <= 0) return; let L = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
  ctx.save(); ctx.strokeStyle = cor; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (tracejado) ctx.setLineDash(tracejado);
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); let acc = 0, alvo = L * k, fim = pts[0];
  for (let i = 1; i < pts.length; i++) {
    if (acc + seg[i - 1] >= alvo) { const f = (alvo - acc) / seg[i - 1]; fim = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; ctx.lineTo(fim[0], fim[1]); break; }
    acc += seg[i - 1]; ctx.lineTo(pts[i][0], pts[i][1]); fim = pts[i];
  }
  ctx.stroke(); ctx.restore(); return fim;
}
function bezierPts(p0, p1, p2, n = 40) { const o = []; for (let i = 0; i <= n; i++) { const k = i / n, a = (1 - k) * (1 - k), b = 2 * (1 - k) * k, c = k * k; o.push([a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1]]); } return o; }
