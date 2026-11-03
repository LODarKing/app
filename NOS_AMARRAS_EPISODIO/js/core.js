// Núcleo: canvas, matemática, easing, ruído com semente (mulberry32), texto e legendas.
// Contrato: window.seek(t) desenha o quadro do instante t. Nenhum estado passa de um quadro para outro.
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const { W, H } = CFG, C = CFG.cor;

// ---------------------------------------------------------------- matemática
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));                       // 0→1 entre a e b
const ease = {
  io: (k) => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,   // cúbica entra-sai
  o: (k) => 1 - Math.pow(1 - k, 3),
  i: (k) => k * k * k,
  o5: (k) => 1 - Math.pow(1 - k, 5),
  back: (k) => { const c = 1.4; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
};
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = (seed, i) => mulberry32(seed * 7919 + i * 104729)();
function hex2rgb(h) { if (h[0] !== '#') return h.match(/[\d.]+/g).slice(0, 3).map(Number); const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(a, b, k) { const x = hex2rgb(a), y = hex2rgb(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], k))).join(',')})`; }
function shade(h, k) { return k >= 0 ? mix(h, '#FFFFFF', k) : mix(h, '#000000', -k); }
function rgba(h, a) { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; }

// ---------------------------------------------------------------- fundo (feltro verde da insígnia + grão, calculado uma vez)
let _grao = null;
function fundo() {
  if (!_grao) {
    _grao = document.createElement('canvas'); _grao.width = W; _grao.height = H; const g = _grao.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, C.fundoClaro); gr.addColorStop(0.55, C.fundo); gr.addColorStop(1, C.fundoEsc);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const im = g.getImageData(0, 0, W, H), d = im.data, R = mulberry32(11);
    for (let i = 0; i < d.length; i += 4) { const n = (R() - 0.5) * 9; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    g.putImageData(im, 0, 0);
    // fibras de papel bem discretas
    g.globalAlpha = 0.05; g.strokeStyle = '#FFFFFF'; g.lineWidth = 1;
    for (let i = 0; i < 260; i++) { const x = R() * W, y = R() * H, a = R() * Math.PI, l = 8 + R() * 22; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 3, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    g.globalAlpha = 1;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(_grao, 0, 0);
}

// ---------------------------------------------------------------- câmera (mundo 1080×1920; zoom em torno de um ponto)
function camera(z, fx, fy, sx = W / 2, sy = H / 2) { ctx.setTransform(z, 0, 0, z, sx - fx * z, sy - fy * z); }

// ---------------------------------------------------------------- texto
function font(px, fam = 'ui', peso = 800) { return `${peso} ${px}px ${fam === 'titulo' ? CFG.fonte.titulo : CFG.fonte.ui}`; }
function texto(s, x, y, { px = 48, fam = 'ui', peso = 800, cor = C.texto, al = 'left', base = 'alphabetic', ls = 0 } = {}) {
  ctx.font = font(px, fam, peso); ctx.textAlign = al; ctx.textBaseline = base; ctx.fillStyle = cor;
  if (ls) { ctx.letterSpacing = ls + 'px'; }
  ctx.fillText(s, x, y); ctx.letterSpacing = '0px';
}
function quebra(s, maxW, px, fam = 'ui', peso = 800) {
  ctx.font = font(px, fam, peso); const ws = s.split(' '), ls = []; let cur = '';
  for (const w of ws) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { ls.push(cur); cur = w; } else cur = t; }
  if (cur) ls.push(cur);
  // equilibra duas linhas (quebra natural, sem palavra órfã)
  if (ls.length === 2) {
    const all = s.split(' '); let best = null;
    for (let i = 1; i < all.length; i++) { const a = all.slice(0, i).join(' '), b = all.slice(i).join(' '), wa = ctx.measureText(a).width, wb = ctx.measureText(b).width; if (wa > maxW || wb > maxW) continue; const sc = Math.abs(wa - wb) + (/[,.:;!?]$/.test(a) ? -120 : 0); if (!best || sc < best[0]) best = [sc, [a, b]]; }
    if (best) return best[1];
  }
  return ls;
}

// ---------------------------------------------------------------- legenda (faixa fixa acima da área de botões; até 2 linhas)
function legenda(lista, t) {
  const L = CFG.legenda, it = lista.find(([a, b]) => t >= a && t < b); if (!it) return;
  const [a, b, s] = it, ls = quebra(s, L.larguraMax, L.tamanho, 'ui', 800), lh = L.tamanho * 1.22;
  const k = ease.o(prog(t, a, a + 0.18)), y0 = L.yTopo + (1 - k) * 14;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = font(L.tamanho, 'ui', 800); const wmax = Math.max(...ls.map((l) => ctx.measureText(l).width));
  const padX = 30, padY = 20, bw = wmax + padX * 2, bh = ls.length * lh + padY * 2 - (lh - L.tamanho) , bx = W / 2 - bw / 2;
  ctx.globalAlpha = k; ctx.fillStyle = rgba(C.fundoEsc, 0.86); rr(bx, y0, bw, bh, 22); ctx.fill();
  ls.forEach((l, i) => texto(l, W / 2, y0 + padY + L.tamanho * 0.86 + i * lh, { px: L.tamanho, al: 'center', cor: C.texto }));
  ctx.globalAlpha = 1;
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

// seta curva de giro (torção), em coordenadas do mundo
function setaGiro(cx, cy, r, horario, cor, lw = 6, k = 1, asp = 0.42) {
  const a0 = horario ? -2.4 : -0.74, a1 = a0 + (horario ? 1 : -1) * 1.65 * Math.PI * k;
  ctx.strokeStyle = cor; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(cx, cy, r, r * asp, 0, a0, a1, !horario); ctx.stroke();
  if (k < 0.98) return;
  const ex = cx + r * Math.cos(a1), ey = cy + r * asp * Math.sin(a1), tx = -Math.sin(a1) * (horario ? 1 : -1), ty = Math.cos(a1) * asp * (horario ? 1 : -1), n = Math.hypot(tx, ty), ux = tx / n, uy = ty / n, s = lw * 2.6;
  ctx.fillStyle = cor; ctx.beginPath(); ctx.moveTo(ex + ux * s, ey + uy * s); ctx.lineTo(ex - uy * s * 0.75 - ux * s * 0.2, ey + ux * s * 0.75 - uy * s * 0.2); ctx.lineTo(ex + uy * s * 0.75 - ux * s * 0.2, ey - ux * s * 0.75 - uy * s * 0.2); ctx.closePath(); ctx.fill();
}
