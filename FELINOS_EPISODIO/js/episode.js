// Episódio completo: cenas em sequência (timeline.js), falas, legendas e onomatopeias globais.
// Contrato: renderFrame(ctx, t) depende só de t. Cada cena registra CENAS[id] = { draw(ctx, lt, E), ui?(ctx, lt, E), sfx?: [...], capY?(lt), blur?(lt) }.
// Zona segura do Reels: nada importante abaixo de y ≈ 1500 nem na coluna de botões à direita (x > 960 entre y 1000 e 1700).
'use strict';
const PLUM = '#3B2A45', CREAM = '#F6EEE4';
const CENAS = {};
let P = {}, SCENE_T0 = 0;                  // eventos da cena atual (tempo local) e seu início global
const SCENE_EV = (id) => TL.scenes.find((s) => s.id === id).ev;
const sceneAtTime = (t) => { const S = TL.scenes; for (let i = S.length - 1; i >= 0; i--) if (t >= S[i].t0) return S[i]; return S[0]; };
/** abertura da boca pelo envelope da voz gravada (lido "em dois", 12 desenhos/s) */
function voiceAt(who, t) { const tt = on2s(t); for (const v of TL.voices) if (v.quem === who && tt >= v.inicio && tt < v.inicio + v.dur) { const i = Math.floor((tt - v.inicio) * 24); return v.boca[i] || 0; } return 0; }
const speaking = (who, t) => TL.voices.some((v) => v.quem === who && t >= v.inicio - 0.1 && t < v.inicio + v.dur + 0.1);
const voiceL = (who, lt) => voiceAt(who, lt + SCENE_T0), speakingL = (who, lt) => speaking(who, lt + SCENE_T0);
const lerpM = (A, B, k) => A.map((a, i) => lerp(a, B[i], k));
/** pose em coordenadas do mundo -> tela, pela transformação atual (os personagens desenham em coordenadas de tela) */
function tp(ctx, p) { const M = ctx.getTransform(); return { ...p, x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f, s: p.s * Math.hypot(M.a, M.b), cutY: p.cutY != null ? M.d * p.cutY + M.f : undefined }; }
/** gestos de fala: piscadas, acenos e sobrancelhas nas palavras longas (tônicas), a partir dos tempos reais */
function talkBeats(who, t) {
  let nod = 0, brow = 0;
  for (const w of TL.words) { if (w[3] !== who || w[2] - w[1] < 0.32) continue; nod = Math.max(nod, bell(t, w[1] + 0.08, 0.12)); brow = Math.max(brow, bell(t, w[1] + 0.05, 0.16) * (w[0].length > 7 ? 1 : 0.5)); }
  return { nod, brow };
}

// ============================================================ utilitários visuais compartilhados
function speedLines(ctx, t, a, cx = 540, cy = 900, radial = true) {
  if (a <= 0.01) return;
  const f = Math.floor(t * 12); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.fillStyle = CREAM;
  for (let i = 0; i < 34; i++) {
    const ang = rnd(f, i) * 6.283, r0 = 380 + rnd(f + 1, i) * 420, len = 160 + rnd(f + 2, i) * 340, w = 3 + rnd(f + 3, i) * 7;
    const p0 = radial ? [cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0] : [rnd(f, i) * W * 1.4 - 200, rnd(f + 4, i) * H];
    const dir = radial ? [Math.cos(ang), Math.sin(ang)] : [1, 0];
    const p1 = [p0[0] + dir[0] * len, p0[1] + dir[1] * len], nx = -dir[1] * w, ny = dir[0] * w;
    ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo((p0[0] + p1[0]) / 2 + nx, (p0[1] + p1[1]) / 2 + ny); ctx.lineTo(p1[0], p1[1]); ctx.lineTo((p0[0] + p1[0]) / 2 - nx, (p0[1] + p1[1]) / 2 - ny); ctx.fill();
  }
  ctx.restore();
}
function inkBurst(ctx, x, y, t, t0, color, sc = 1) {
  const k = (t - t0) / 0.25; if (k <= 0 || k >= 1) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineWidth = 12 * sc * (1 - k);
  for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.283 + 0.3, r0 = (110 + 40 * k) * sc, r1 = r0 + 50 * sc * (1 - k * 0.5); ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); ctx.stroke(); }
  ctx.restore();
}
function halftoneBox(ctx, x, y, w, h) {
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fillStyle = ACCENT; ctx.fill();
  ctx.clip(); ctx.fillStyle = 'rgba(180,90,40,0.35)'; for (let yy = y; yy < y + h; yy += 10) for (let xx = x + ((yy / 10) % 2) * 5; xx < x + w; xx += 10) { ctx.beginPath(); ctx.arc(xx, yy, 2.2, 0, 6.283); ctx.fill(); }
  ctx.restore(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.strokeStyle = PLUM; ctx.lineWidth = 7; ctx.stroke();
}
/** etiqueta de espécie: nome datilografado + nome científico + fio até o animal */
function speciesTag(ctx, t, t0, t1, name, sci, ax, ay, L = 220) {
  if (t < t0 || t > t1) return;
  const k = clamp((t - t0) / 0.22), nChars = Math.ceil(k * name.length), kk = clamp((t - t0 - 0.12) / 0.2), out = clamp((t - t1 + 0.15) / 0.15);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - out;
  if (L) { ctx.strokeStyle = CREAM; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ax, ay + 20); ctx.lineTo(ax, ay + 20 + L * easeOut(k)); ctx.stroke(); ctx.fillStyle = CREAM; ctx.beginPath(); ctx.arc(ax, ay + 20 + L * easeOut(k), 7, 0, 6.283); ctx.fill(); }
  ctx.font = '900 76px InterUI'; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  const txt = name.slice(0, nChars); ctx.strokeStyle = PLUM; ctx.lineWidth = 12; ctx.strokeText(txt, ax, ay); ctx.fillStyle = CREAM; ctx.fillText(txt, ax, ay);
  if (kk > 0 && sci) { ctx.font = 'italic 700 46px InterUI'; const st = sci.slice(0, Math.ceil(kk * sci.length)); ctx.lineWidth = 10; ctx.strokeText(st, ax, ay - 80); ctx.fillStyle = ACCENT; ctx.fillText(st, ax, ay - 80); }
  ctx.restore();
}
/** cartão de texto da interface (fundo creme, borda ameixa, sombra impressa); entra com salto e sai encolhendo */
function uiCard(ctx, t, t0, t1, txt, x, y, o = {}) {
  const { size = 56, align = 'center', rot = 0, accent = false, sub = null, w = null } = o;
  const k = (t - t0) / 0.2, out = (t - t1) / 0.18; if (k <= 0 || out >= 1) return;
  const s = (k < 1 ? outBack(k, 2.2) : 1) * (out > 0 ? 1 - easeIn(out) : 1);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `700 ${size * 0.62}px InterUI`; const sw = sub ? ctx.measureText(sub).width : 0; ctx.font = `900 ${size}px InterUI`; const tw = w || Math.max(ctx.measureText(txt).width, sw) + size * 0.9, th = size * 1.45 + (sub ? size * 0.85 : 0);
  const bx = align === 'center' ? -tw / 2 : 0;
  ctx.fillStyle = PLUM; ctx.beginPath(); ctx.roundRect(bx + 8, -th / 2 + 9, tw, th, 16); ctx.fill();
  ctx.fillStyle = accent ? ACCENT : CREAM; ctx.beginPath(); ctx.roundRect(bx, -th / 2, tw, th, 16); ctx.fill(); ctx.strokeStyle = PLUM; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = PLUM; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, bx + tw / 2, sub ? -size * 0.38 : 2);
  if (sub) { ctx.font = `700 ${size * 0.62}px InterUI`; ctx.fillStyle = '#7A3E52'; ctx.fillText(sub, bx + tw / 2, size * 0.62); }
  ctx.restore();
}
/** referência bíblica / título escrito à mão (fonte de título), revelado da esquerda para a direita */
function handTitle(ctx, t, t0, txt, x, y, o = {}) {
  const { size = 110, color = CREAM, dur = 0.7, t1 = 1e9, rot = -0.04, align = 'left', stroke = PLUM } = o;
  const wk = clamp((t - t0) / dur), out = clamp((t - t1) / 0.3); if (wk <= 0 || out >= 1) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - out; ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = `700 ${size}px Caveat`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round'; const tw = ctx.measureText(txt).width, x0 = align === 'center' ? -tw / 2 : 0;
  ctx.beginPath(); ctx.rect(x0 - 20, -size * 1.2, (tw + 40) * wk, size * 1.6); ctx.clip();
  ctx.strokeStyle = stroke; ctx.lineWidth = size * 0.11; ctx.strokeText(txt, x0, 0); ctx.fillStyle = color; ctx.fillText(txt, x0, 0);
  ctx.restore();
}

// ============================================================ onomatopeias desenhadas (de todas as cenas, em tempo global)
const SFXW = [];
function collectSfx() { if (SFXW.length) return; TL.scenes.forEach((sc) => { const C = CENAS[sc.id]; if (C && C.sfx) C.sfx(sc.ev).forEach(([txt, lt, d, x, y, size, rot]) => SFXW.push([txt, sc.t0 + lt, d, x, y, size, rot])); }); }
function sfxWords(ctx, t) {
  SFXW.forEach(([txt, t0, d, x, y, size, rot], i) => {
    const k = (t - t0) / 0.14, o = (t - t0 - d) / 0.1; if (k <= 0 || o >= 1) return;
    const s = (k < 1 ? outBack(k, 2.6) : 1) * (o > 0 ? 1 - easeIn(o) : 1), jit = [(rnd(i * 31, BOIL) - 0.5) * 6, (rnd(i * 37, BOIL) - 0.5) * 6];
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x + jit[0], y + jit[1]); ctx.rotate(rot); ctx.scale(s, s);
    ctx.font = `700 ${size}px Caveat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.fillStyle = ACCENT; ctx.fillText(txt, 7, 7);
    ctx.strokeStyle = PLUM; ctx.lineWidth = size * 0.11; ctx.strokeText(txt, 0, 0); ctx.fillStyle = CREAM; ctx.fillText(txt, 0, 0);
    ctx.restore();
  });
}

// ============================================================ legendas palavra por palavra (tempos reais das gravações)
const KEYWORDS = new Set(['livro', 'mostrar', 'aventura', 'fascinantes', 'família', 'felinos', 'felidae', 'carnivora', 'predadores', 'parente', 'tigre', 'caçador', 'silenciosamente', 'coxins', 'garras', 'dedos', 'guepardo',
  'escuro', 'pupilas', 'refletora', 'profundidade', 'magia', 'adaptação', 'carnívoros', 'obrigatórios', 'caninos', 'tesouras', 'carne', 'vibrissas', 'bigodes', 'enfeites', 'ouvidos', 'sujeira',
  'persa', 'tranquilo', 'siamês', 'comunicativo', 'enorme', 'maine', 'coon', 'angorá', 'personalidade', 'roedores', 'responsabilidade', 'veterinário', 'amar', 'fauna', 'silvestre', 'sete', 'ásia', 'áfrica', 'índia',
  'onçapintada', 'américas', 'amazônia', 'pantanal', 'irã', 'leopardo', 'escalador', 'suçuarana', 'puma', 'onçaparda', 'jaguatirica', 'maior', 'veloz', 'rei', 'social', 'cooperação', 'bíblia', 'quatro',
  'leões', 'sansão', 'juízes', 'espírito', 'davi', 'golias', 'ovelhas', 'benaia', 'cisterna', 'neve', 'daniel', 'anjo', 'fiel', 'fidelidade', 'confiança', 'deus', 'criação', 'natureza', 'protegendo', 'vida', 'leão', 'gatinho']);
const bare = (w) => w.toLowerCase().replace(/[^a-zà-ú]/g, '');
const PHRASES = (() => {
  const out = []; let cur = [];
  TL.words.forEach((w, i) => {
    const next = TL.words[i + 1]; cur.push(i);
    if (!next || next[3] !== w[3] || next[1] - w[2] > 0.7 || /[.?!]$/.test(w[0]) || cur.length >= 6 || (/[,]$/.test(w[0]) && cur.length >= 3)) { out.push(cur); cur = []; }
  });
  return out;
})();
const CAP_MAXW = 840;
function phraseLines(ctx, ph) {
  const lines = [[]]; let wsum = 0;
  ph.forEach((i) => { const w = ctx.measureText(TL.words[i][0]).width + (KEYWORDS.has(bare(TL.words[i][0])) ? 36 : 0) + 34; if (wsum + w > CAP_MAXW && lines[lines.length - 1].length) { lines.push([]); wsum = 0; } lines[lines.length - 1].push(i); wsum += w; });
  return lines;
}
function captions(ctx, t, capY) {
  const Wd = TL.words; let pi = -1;
  for (let i = 0; i < PHRASES.length; i++) { if (t >= Wd[PHRASES[i][0]][1] - 0.05) pi = i; else break; }
  if (pi < 0) return;
  const ph = PHRASES[pi], last = Wd[ph[ph.length - 1]], next = pi + 1 < PHRASES.length ? Wd[PHRASES[pi + 1][0]][1] - 0.05 : 1e9, end = Math.min(next, last[2] + 0.6);
  if (t > end) return;
  const out = clamp((t - end + 0.1) / 0.1);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = '900 66px InterUI'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const lines = phraseLines(ctx, ph);
  let kick = 0; ph.forEach((i) => { kick = Math.max(kick, bell(t, Wd[i][1] + 0.05, 0.06)); });
  const gap = 34, lh = 98, y0 = capY - (lines.length - 1) * lh / 2 - 10 * kick;
  lines.forEach((line, li) => {
    const ws = line.map((i) => ctx.measureText(Wd[i][0]).width + (KEYWORDS.has(bare(Wd[i][0])) ? 36 : 0)), tw = ws.reduce((a, b) => a + b, 0) + gap * (line.length - 1); let x = 530 - tw / 2;
    line.forEach((i, j) => {
      const [w, s, e] = Wd[i], k = (t - s + 0.03) / 0.18, active = t >= s - 0.02 && t < e + 0.06, key = KEYWORDS.has(bare(w));
      if (k > 0) {
        const sc = Math.max(0.01, outBack(k, 2.4)) * (active ? 1.12 : 1) * (1 - easeIn(out)), r = (i % 2 ? 1 : -1) * (key ? 0.06 : 0.025) * (1 - clamp(k - 1)) + (key ? (i % 2 ? 0.04 : -0.04) : 0);
        ctx.save(); ctx.translate(x + ws[j] / 2, y0 + li * lh + (1 - clamp(k)) * 30); ctx.rotate(r); ctx.scale(sc, sc); ctx.textAlign = 'center';
        if (key) { const bw = ws[j], bh = 88; halftoneBox(ctx, -bw / 2, -bh / 2, bw, bh); ctx.fillStyle = PLUM; ctx.fillText(w, 0, 4); }
        else { ctx.fillStyle = PLUM; ctx.fillText(w, 5, 6); ctx.strokeStyle = PLUM; ctx.lineWidth = 14; ctx.strokeText(w, 0, 0); ctx.fillStyle = active ? ACCENT : CREAM; ctx.fillText(w, 0, 0); }
        ctx.restore();
      }
      x += ws[j] + gap;
    });
  });
  ctx.restore();
}

// ============================================================ composição do quadro
function sceneDraw(ctx, t) {
  const sc = sceneAtTime(t), C = CENAS[sc.id]; P = sc.ev; SCENE_T0 = sc.t0; BOIL = Math.floor(t * 12);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#2A1E30'; ctx.fillRect(0, 0, W, H);   // sem estado entre quadros
  if (C) C.draw(ctx, t - sc.t0, sc.ev); else { ctx.fillStyle = '#5A4A60'; ctx.fillRect(0, 0, W, H); ctx.font = '900 80px InterUI'; ctx.fillStyle = CREAM; ctx.textAlign = 'center'; ctx.fillText(sc.id, 540, 960); }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
}
function renderFrame(ctx, t) {
  collectSfx();
  const sc = sceneAtTime(t), C = CENAS[sc.id] || {}, lt = t - sc.t0;
  if (C.blur && C.blur(lt, sc.ev)) {
    const [ac, ag] = layer('acc'); const n = 4, span = (1 / TL.fps) * 0.7;
    for (let i = 0; i < n; i++) { const [fc, fg] = layer('sub'); sceneDraw(fg, t + (i / (n - 1) - 0.5) * span); ag.globalAlpha = 1 / (i + 1); ag.drawImage(fc, 0, 0); }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(ac, 0, 0);
  } else sceneDraw(ctx, t);
  P = sc.ev; SCENE_T0 = sc.t0; BOIL = Math.floor(t * 12);
  sfxWords(ctx, t);
  POST(ctx, 1);             // pinceladas + retícula + hachura + registro de cor + papel (estilo aprovado)
  if (C.ui) { ctx.save(); C.ui(ctx, lt, sc.ev); ctx.restore(); }
  captions(ctx, t, C.capY ? C.capY(lt, sc.ev) : 1390);
}
