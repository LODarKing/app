// Utilidades das cenas: tempo das palavras, acertos na grade, rótulos, selos e ícones simples.
window.CENAS = window.CENAS || {};
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]/g, '');
// tempo local (início) da n-ésima palavra que começa com `p` (sem acento/pontuação); `fim` = tempo final
function tp(sc, p, n = 0, fim = false) {
  const alvo = norm(p); let k = 0;
  for (const w of sc.palavras) if (norm(w[0]).startsWith(alvo)) { if (k++ === n) return fim ? w[2] : w[1]; }
  console.error('palavra não encontrada', sc.id, p, n); return 0;
}
// acerto na grade: semicolcheia da batida (100 bpm) mais próxima, em tempo local
const GRADE = 60 / CFG.bpm / 4;
const G = (sc, t) => Math.round((sc.t0 + t) / GRADE) * GRADE - sc.t0;
// rótulo de termo: nome em Zilla subindo de trás de uma linha + fio-guia até o objeto; sub-texto opcional
function termo(nome, x, y, k, { sub = null, alvo = null, cor = C.texto, px = 64, al = 'left', subCor = C.textoSuave, subPx = 38 } = {}) {
  if (k <= 0) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (alvo) {
    ctx.strokeStyle = rgba(cor, 0.9); ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); const ax = x + (al === 'center' ? 0 : al === 'right' ? -10 : 10), ay = y + 16;
    ctx.moveTo(ax, ay); ctx.lineTo(lerp(ax, alvo[0], ease.o(k)), lerp(ay, alvo[1], ease.o(k))); ctx.stroke();
    ctx.fillStyle = cor; ctx.beginPath(); ctx.arc(lerp(ax, alvo[0], ease.o(k)), lerp(ay, alvo[1], ease.o(k)), 7, 0, 7); ctx.fill();
  }
  ctx.save(); ctx.beginPath(); ctx.rect(0, y - px * 1.1, W, px * 1.3); ctx.clip();
  texto(nome, x, y + (1 - ease.o(k)) * px * 1.2, { px, fam: 'titulo', peso: 700, cor, al });
  ctx.restore();
  if (sub) { const ks = ease.o(clamp(k * 1.4 - 0.4)); ctx.save(); ctx.beginPath(); ctx.rect(0, y + 8, W, subPx * 1.5); ctx.clip(); texto(sub, x, y + subPx * 1.25 + (1 - ks) * subPx * 1.3, { px: subPx, peso: 700, cor: subCor, al }); ctx.restore(); }
}
// selo pequeno (pílula) com texto — usado para "sem cruzar", "não corre", "nome técnico"…
function selo(txt, x, y, k, { cor = C.destaque, fg = C.contorno, px = 36, al = 'center' } = {}) {
  if (k <= 0) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = font(px, 'ui', 800); const w = ctx.measureText(txt).width + px * 1.1, h = px * 1.55, s = ease.back(clamp(k));
  const x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x;
  ctx.save(); ctx.translate(x0 + w / 2, y); ctx.scale(s, s); ctx.fillStyle = cor; rr(-w / 2, -h / 2, w, h, h / 2); ctx.fill();
  texto(txt, 0, px * 0.36, { px, peso: 800, cor: fg, al: 'center' }); ctx.restore();
}
// anel de destaque (marca um cruzamento ou região) — traço amarelo desenhado, sem brilho
function anel(x, y, r, k, cor = C.destaque) {
  if (k <= 0) return; ctx.strokeStyle = cor; ctx.lineWidth = Math.max(4, r * 0.07); ctx.lineCap = 'round'; ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ease.io(clamp(k))); ctx.stroke();
}
// morfose entre duas listas de pontos (mesma quantidade após reamostrar), sem mudar a topologia
function reamostraPts(pts, n) {
  const d = catmull(pts, 8), cum = [0]; for (let i = 1; i < d.length; i++) cum.push(cum[i - 1] + Math.hypot(d[i][0] - d[i - 1][0], d[i][1] - d[i - 1][1]));
  const L = cum[cum.length - 1], out = []; let j = 0;
  for (let i = 0; i < n; i++) { const s = L * i / (n - 1); while (j < d.length - 2 && cum[j + 1] < s) j++; const k = (s - cum[j]) / ((cum[j + 1] - cum[j]) || 1); out.push(d[j].map((v, q) => lerp(v, d[j + 1][q], k))); }
  return out;
}
function morfa(a, b, k) { return a.map((p, i) => p.map((v, q) => lerp(v, b[i][q], k))); }
