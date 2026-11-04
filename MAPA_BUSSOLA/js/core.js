// Núcleo: aleatório com semente, ruído, curvas de animação, paleta e utilidades de desenho.
// Tudo aqui é puro: nada guarda estado entre quadros (as tabelas são derivadas só das sementes).
'use strict';
const W = 1080, H = 1920;

const PAL = {
  mata: '#173022',      // chão da floresta / tinta escura verde
  mata2: '#21412D',
  folha: ['#24472F', '#2D5A3B', '#386B45', '#477A4C', '#56875A'],
  folhaLuz: '#7FA36F',
  areia: '#E9DFC6',     // papel do mapa
  areia2: '#D8C9A3',    // trilha / sombra do papel
  areia3: '#B9A67A',
  curva: '#3F6A4A',     // curvas de nível
  amarelo: '#F2C230',   // destaque único
  branco: '#FFFFFF',
  preto: '#111312',
};

// mulberry32: único gerador de ruído permitido
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// hash determinístico de inteiros -> [0,1)
function hash2(x, y, s) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, s, oct = 4) {
  let f = 0, amp = 0.5, fr = 1, n = 0;
  for (let i = 0; i < oct; i++) { f += amp * vnoise(x * fr, y * fr, s + i * 17); n += amp; amp *= 0.5; fr *= 2.03; }
  return f / n;
}

// curvas
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eo3 = (k) => 1 - Math.pow(1 - k, 3);
const eo5 = (k) => 1 - Math.pow(1 - k, 5);
const ei3 = (k) => k * k * k;
const eio = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const eback = (k, s = 1.4) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
// mola amortecida (função pura do tempo desde o início)
const spring = (dt, w = 14, z = 0.28) => (dt <= 0 ? 0 : 1 - Math.exp(-z * w * dt) * Math.cos(w * Math.sqrt(1 - z * z) * dt));

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function mixHex(h1, h2, k) {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const r = Math.round(lerp((a >> 16) & 255, (b >> 16) & 255, k)), g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, k)), bl = Math.round(lerp(a & 255, b & 255, k));
  return `rgb(${r},${g},${bl})`;
}

const FONT_T = 'BarlowC';  // fonte de título
const FONT_I = 'InterUI';  // fonte de interface
function font(ctx, w, px, fam = FONT_I) { ctx.font = `${w} ${px}px ${fam}`; }

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// palavra-chave em caixa alta que sobe por uma máscara (sem fade)
function maskWord(ctx, txt, x, y, px, t, t0, { color = PAL.branco, align = 'left', stroke = null, dur = 0.38, out = null } = {}) {
  const k = eo5(prog(t, t0, t0 + dur));
  if (k <= 0) return;
  let ko = 0; if (out !== null) ko = ei3(prog(t, out, out + 0.3));
  ctx.save();
  font(ctx, 800, px, FONT_T); ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText(txt).width, x0 = align === 'left' ? x : align === 'center' ? x - w / 2 : x - w;
  ctx.beginPath(); ctx.rect(x0 - 20, y - px * 1.0, w + 40, px * 1.18); ctx.clip();
  const dy = (1 - k) * px * 1.05 - ko * px * 1.05;
  if (stroke) { ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.strokeStyle = stroke; ctx.strokeText(txt, x, y + dy); }
  ctx.fillStyle = color; ctx.fillText(txt, x, y + dy);
  ctx.restore();
  return w;
}
