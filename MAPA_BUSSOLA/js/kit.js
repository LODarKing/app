// Kit comum das cenas: âncoras nas palavras faladas, acertos (som + imagem) na grade de batidas, textos e chamadas.
'use strict';
const BPM = 96, BEAT = 60 / BPM, COLCHEIA = BEAT / 2;
const CENAS = Object.fromEntries(TL.scenes.map((s, i) => [s.id, { ...s, n: i + 1 }]));
const normW = (w) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

// tempo local (s, desde o início da cena) da n-ésima ocorrência da palavra na fala da cena
function F(id, palavra, occ = 0, campo = 't0') {
  const sc = CENAS[id], alvo = normW(palavra); let k = -1;
  for (const p of TL.palavras) if (p.s === sc.n && normW(p.w) === alvo && ++k === occ) return p[campo] - sc.t0;
  throw new Error(`palavra não encontrada: ${id} "${palavra}" #${occ}`);
}
// grade de batidas: medida na trilha (audio/beats.js); antes da medição, grade nominal
const grade = (T) => {
  if (typeof BEATS !== 'undefined' && BEATS.length > 2 && T < BEATS[BEATS.length - 1]) {
    let i = 0; while (i < BEATS.length - 2 && BEATS[i + 1] < T) i++;
    const a = BEATS[i], b = BEATS[i + 1], m = (a + b) / 2;
    return [a, m, b].reduce((x, y) => (Math.abs(y - T) < Math.abs(x - T) ? y : x));
  }
  return Math.round(T / COLCHEIA) * COLCHEIA;
};
// acerto: registra o evento sonoro e devolve o tempo local já na grade (o desenho usa o mesmo tempo)
const ACERTOS = [];
function hit(id, tLocal, tipo, ganho = 1) {
  const sc = CENAS[id], T = grade(sc.t0 + tLocal);
  if (tipo) ACERTOS.push({ t: +T.toFixed(4), tipo, ganho, cena: id });
  return T - sc.t0;
}

// marca-texto amarelo correndo por trás de uma palavra em caixa alta (fonte de título)
function marca(ctx, t, txt, x, y, px, tw, { cor = PAL.preto, fundo = PAL.amarelo, out = null, align = 'left' } = {}) {
  const kw = eo5(prog(t, tw - 0.12, tw + 0.3)); if (kw <= 0) return 0;
  let ko = 0; if (out !== null) ko = ei3(prog(t, out, out + 0.3)); if (ko >= 1) return 0;
  font(ctx, 800, px, FONT_T); const w = ctx.measureText(txt).width, x0 = align === 'left' ? x : align === 'center' ? x - w / 2 : x - w;
  ctx.fillStyle = fundo; ctx.fillRect(x0 - 18 + (w + 36) * ko, y - px * 0.74, (w + 36) * (kw - ko), px * 0.86);
  maskWord(ctx, txt, x, y, px, t, tw, { color: cor, align, out });
  return w;
}
// texto de interface simples, com contorno opcional para ler sobre qualquer fundo
function txt(ctx, s, x, y, px, { peso = 700, cor = PAL.branco, align = 'left', contorno = null, fam = FONT_I, base = 'alphabetic' } = {}) {
  font(ctx, peso, px, fam); ctx.textAlign = align; ctx.textBaseline = base;
  if (contorno) { ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(6, px * 0.18); ctx.strokeStyle = contorno; ctx.strokeText(s, x, y); }
  ctx.fillStyle = cor; ctx.fillText(s, x, y);
}
// texto que sobe por máscara (sem fade), para rótulos de interface
function sobe(ctx, t, t0, s, x, y, px, o = {}) {
  const k = eo5(prog(t, t0, t0 + 0.35)); if (k <= 0) return;
  let ko = 0; if (o.out != null) ko = ei3(prog(t, o.out, o.out + 0.25)); if (ko >= 1) return;
  font(ctx, o.peso || 700, px, o.fam || FONT_I); const w = ctx.measureText(s).width, al = o.align || 'left';
  const x0 = al === 'left' ? x : al === 'center' ? x - w / 2 : x - w;
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 14, y - px * 1.05, w + 28, px * 1.38); ctx.clip();
  txt(ctx, s, x, y + (1 - k) * px * 1.2 - ko * px * 1.2, px, o); ctx.restore();
}
// chamada com linha: do ponto (ax, ay) até o texto em (tx, ty)
function chamada(ctx, t, t0, ax, ay, tx, ty, s, { px = 38, cor = PAL.preto, linha = null, align = 'left', contorno = null, out = null, peso = 800 } = {}) {
  const k = eo5(prog(t, t0, t0 + 0.4)); if (k <= 0) return;
  let ko = 0; if (out != null) ko = ei3(prog(t, out, out + 0.25)); if (ko >= 1) return;
  const ex = lerp(ax, tx, k), ey = lerp(ay, ty, k);
  ctx.strokeStyle = linha || cor; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.beginPath(); ctx.arc(ax, ay, 7, 0, 7); ctx.fillStyle = linha || cor; ctx.fill();
  sobe(ctx, t, t0 + 0.15, s, tx + (align === 'left' ? 12 : align === 'right' ? -12 : 0), ty + px * 0.35, px, { peso, cor, align, contorno, out });
}
// seta reta
function seta(ctx, x0, y0, x1, y1, { cor = PAL.preto, larg = 6, ponta = 22 } = {}) {
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.strokeStyle = cor; ctx.fillStyle = cor; ctx.lineWidth = larg; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * ponta * 0.7, y1 - Math.sin(a) * ponta * 0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.45) * ponta, y1 - Math.sin(a - 0.45) * ponta); ctx.lineTo(x1 - Math.cos(a + 0.45) * ponta, y1 - Math.sin(a + 0.45) * ponta); ctx.closePath(); ctx.fill();
}
// ponto de azimute θ (graus, a partir do Norte, horário) num círculo de centro (cx, cy) e raio r
const azPt = (cx, cy, r, gr) => [cx + r * Math.sin((gr * Math.PI) / 180), cy - r * Math.cos((gr * Math.PI) / 180)];
// pop com mola (escala)
const pop = (t, t0, d = 0.35) => (t < t0 ? 0 : eback(prog(t, t0, t0 + d), 1.7));
// fundo de papel com curvas de nível bem suaves (o mesmo terreno), opcionalmente escuro (mata)
function fundo(ctx, escuro, cam = { cx: 0, cy: -500, z: 0.62, r: 0 }, deriva = 0) {
  ctx.fillStyle = escuro ? PAL.mata : PAL.areia; ctx.fillRect(0, 0, W, H);
  ctx.save(); MUNDO.applyCam(ctx, { ...cam, cy: cam.cy - deriva });
  ctx.strokeStyle = escuro ? 'rgba(233,223,198,0.07)' : 'rgba(63,106,74,0.16)'; ctx.lineWidth = 2 / cam.z;
  ctx.beginPath(); for (const c of MUNDO.curvas) { if (c.lv % 20) continue; c.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); } ctx.stroke();
  ctx.restore();
}
