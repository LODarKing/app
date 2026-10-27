// Piloto v4 — FELINOS, cena 02 "O Diário da Criação" (0–21,5 s, 120 bpm): narrador, Lara, Miguel e Pingo.
// Contrato: renderFrame(ctx, t) depende só de t. Personagens animados "em dois" (12 desenhos/s); câmera a 60 fps.
'use strict';
const PLUM = '#3B2A45', CREAM = '#F6EEE4';
const P = TL;
/** abertura da boca a partir do envelope da voz gravada (24 valores/s, lidos em dois) */
const voiceAt = (who, t) => { const m = P.mouth[who]; if (!m) return 0; const i = Math.floor((on2s(t) - m.t0) * m.fps); return i >= 0 && i < m.v.length ? m.v[i] : 0; };
const speaking = (who, t) => P.voices.some((v) => v.quem === who && t >= v.inicio - 0.1 && t < v.inicio + v.dur + 0.1);
const lerpM = (A, B, k) => A.map((a, i) => lerp(a, B[i], k));

// ============================================================ o Diário da Criação visto de cima (coordenadas do livro: lombada em x = 0)
const PW = 450, PH = 800;   // página na proporção da tela (9:16): a página da direita vira a próxima cena
function coverFace() {
  return cachedPainted('cover', PW, PH, (g, w, h) => {
    g.fillStyle = '#7A3E52'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(40,15,30,0.35)'; g.fillRect(0, 0, 26, h);                                // dobra da lombada
    g.strokeStyle = ACCENT; g.lineWidth = 5; g.strokeRect(46, 46, w - 92, h - 92); g.lineWidth = 2; g.strokeRect(60, 60, w - 120, h - 120);
    g.font = '700 74px Caveat'; g.fillStyle = '#F3D9A8'; g.textAlign = 'center'; g.fillText('Diário da', w / 2, 610); g.fillText('Criação', w / 2, 680);
  }, 21, 0.6);
}
function endpaper() {
  return cachedPainted('endpaper', PW, PH, (g, w, h) => {
    g.fillStyle = '#E7C49C'; g.fillRect(0, 0, w, h);
    for (let y = 40; y < h; y += 110) for (let x = 40 + ((y / 110) % 2) * 55; x < w; x += 110) { g.save(); g.translate(x, y); g.rotate(0.3); g.scale(0.22, 0.22); g.globalAlpha = 0.22; pawPrint(g, '#7A3E52', 0, 3); g.restore(); }
  }, 22, 0.5);
}
function pageNotes() {   // página da esquerda: anotações de campo à mão
  return cachedPainted('notes', PW, PH, (g, w, h) => {
    g.fillStyle = '#F3E8D8'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(120,80,90,0.12)'; g.fillRect(w - 30, 0, 30, h);
    g.strokeStyle = 'rgba(150,130,170,0.35)'; g.lineWidth = 2; for (let y = 120; y < h - 40; y += 46) { g.beginPath(); g.moveTo(36, y); g.lineTo(w - 46, y); g.stroke(); }
    g.font = '700 70px Caveat'; g.fillStyle = PLUM; g.textAlign = 'left'; g.fillText('Família', 40, 100); g.fillStyle = '#7A3E52'; g.fillText('Felidae', 150, 168);
    g.strokeStyle = 'rgba(59,42,69,0.7)'; g.lineWidth = 3; g.lineCap = 'round';
    for (let i = 0; i < 6; i++) { const y = 250 + i * 46; g.beginPath(); for (let x = 46; x < 380 - rnd(i, 1) * 160; x += 14) g.lineTo(x, y + Math.sin(x * 0.25 + i) * 3); g.stroke(); }
    g.save(); g.translate(130, 640); g.rotate(-0.2); g.scale(0.7, 0.7); pawPrint(g, '#C98A6A', 0, 6); g.restore();
    g.save(); g.translate(300, 600); g.strokeStyle = PLUM; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, 60, 40, 0, 0, 6.283); g.stroke(); g.beginPath(); g.ellipse(0, 0, 10, 36, 0, 0, 6.283); g.stroke(); g.restore();   // olho de gato (pupila em fenda)
    [[-1, 0], [-1, 1], [1, 0], [1, 1]].forEach(([sd, k]) => { g.beginPath(); g.moveTo(300 + sd * 70, 690 + k * 18); g.quadraticCurveTo(300 + sd * 120, 680 + k * 22, 300 + sd * 160, 700 + k * 30); g.stroke(); });
  }, 23, 0.55);
}
/** ilustrações das páginas que correm (recortes pintados dos cenários) */
function pageArt(i) {
  return cached('pageArt' + i, PW, PH, (g, w, h) => {
    const src = [jungleBg(), bambooBg(), savannaBg()][i % 3], sx = [700, 900, 200][i % 3];
    g.fillStyle = '#F3E8D8'; g.fillRect(0, 0, w, h);
    g.save(); g.beginPath(); g.rect(34, 34, w - 68, h - 68); g.clip(); g.drawImage(src, sx, 200, 900, 1600, 34, 34, w - 68, h - 68); g.restore();
  });
}
/** folha virando em torno da lombada: theta 0 = deitada à direita, PI = deitada à esquerda (encurtamento em x, sobe em direção à câmera) */
function sheet(g, theta, front, back) {
  const c = Math.cos(theta), lift = 1 + 0.07 * Math.sin(theta);
  g.save(); g.scale(c, lift);
  if (c >= 0) g.drawImage(front, 0, -PH / 2);
  else { g.save(); g.translate(PW, 0); g.scale(-1, 1); g.drawImage(back, 0, -PH / 2); g.restore(); }
  g.fillStyle = `rgba(40,20,40,${0.35 * (1 - Math.abs(c))})`; g.fillRect(0, -PH / 2, PW, PH);
  g.restore();
}
/** livro inteiro. o: {open 0..1 (capa), riffle 0..1, ignite, right (canvas da página da direita), splash} */
function bookSpread(g, t, o) {
  const open = clamp(o.open || 0), cov = open * Math.PI, rf = o.riffle || 0;
  g.fillStyle = 'rgba(40,20,40,0.3)'; g.beginPath(); g.ellipse(open > 0.5 ? 0 : PW / 2, 26, open > 0.5 ? PW + 40 : PW / 2 + 40, PH / 2 + 30, 0, 0, 6.283); g.fill();
  // contracapa e miolo à direita
  g.fillStyle = '#5A2C40'; g.fillRect(-8, -PH / 2 - 14, PW + 22, PH + 28);
  g.fillStyle = '#EADCC6'; g.fillRect(0, -PH / 2 - 4, PW + 8, PH + 8);
  g.drawImage(o.right || pageArt(0), 0, -PH / 2);
  if (o.splash) o.splash(g);
  // lado esquerdo (aparece quando a capa passa da vertical)
  if (cov > Math.PI / 2) {
    g.fillStyle = '#5A2C40'; g.fillRect(-PW - 14, -PH / 2 - 14, PW + 22, PH + 28);
    g.drawImage(rf > 0.25 ? pageNotes() : endpaper(), -PW, -PH / 2);
  }
  // páginas correndo sozinhas (cada uma vira em 0,22 s, escalonadas)
  if (rf > 0 && rf < 1) for (let i = 0; i < 6; i++) { const k = clamp((rf - i * 0.12) / 0.4); if (k > 0 && k < 1) sheet(g, sm(k) * Math.PI, pageArt(i + 1), pageNotes()); }
  // capa
  if (open < 1) sheet(g, Math.max(cov, 0.22 * (o.lift || 0)), coverFace(), endpaper());
  // pegada da capa (acende com o toque do Pingo)
  if (open < 0.5) {
    const c = Math.cos(cov), ig = o.ignite || 0;
    g.save(); g.scale(c, 1); g.translate(PW / 2, -110); g.scale(1.25, 1.25);
    pawPrint(g, ig > 0 ? `rgb(${lerp(242, 255, ig) | 0},${lerp(180, 236, ig) | 0},${lerp(81, 170, ig) | 0})` : ACCENT, 0, 4);
    g.restore();
  }
}

// ============================================================ A. gancho: close do Diário visto de cima (0–1,75 s)
/** pata do Pingo entrando no quadro e pousando na capa */
function pingoPaw(g, x, y, s, ang) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  const arm = flat(g, limb([[0, -1000], [6, -480], [0, -60]], [118, 104, 92]), PG.fur, 4);
  clipTo(g, arm, () => { g.fillStyle = PG.stripe; for (let k = 0; k < 6; k++) { g.beginPath(); trace(g, smooth([[-140, -880 + k * 130], [20, -850 + k * 130, 1], [-140, -836 + k * 130]], true, 4)); g.fill(); } g.fillStyle = 'rgba(120,50,40,0.3)'; g.beginPath(); g.ellipse(80, -500, 50, 600, 0, 0, 6.283); g.fill(); });
  // mão: almofada branca com os quatro dedos marcados (vista de cima)
  const hand = flat(g, smooth([[-104, -40], [-96, 30], [-60, 74], [0, 86], [60, 74], [96, 30], [104, -40], [0, -70]], true, 4), PG.white);
  clipTo(g, hand, () => { g.fillStyle = PG.whiteShade; g.globalAlpha = 0.55; g.beginPath(); g.ellipse(30, 30, 90, 60, 0, 0, 6.283); g.fill(); g.globalAlpha = 1; });
  g.strokeStyle = PG.whiteShade; g.lineWidth = 7; g.lineCap = 'round'; [-48, 0, 48].forEach((x) => { g.beginPath(); g.moveTo(x, 84); g.lineTo(x * 0.9, 40); g.stroke(); });
  g.restore();
}
function shotBookTop(ctx, t) {
  const td = on2s(t), open = sm((td - P.coverOpen) / 0.35), rf = clamp((td - P.riffle) / 0.75);
  const pawK = clamp((td - (P.paw - 0.33)) / 0.33), up = clamp((td - P.paw - 0.25) / 0.3), ig = ss((t - P.paw) / 0.12) * (1 - 0.4 * ss((t - P.coverOpen) / 0.2));
  // mesa (tábuas pintadas vistas de cima) e câmera que desliza para centralizar o livro aberto
  const z = lerp(1.75, 1.12, sm((t - P.coverOpen + 0.1) / 0.6)) + 0.04 * t + 0.07 * bell(t, P.paw + 0.05, 0.08);
  const pre = 1 - ss((t - P.paw) / 0.1), shake = pre * (0.012 * Math.sin(td * 47) + 0.008 * Math.sin(td * 31));
  ctx.save(); ctx.translate(540 + pre * 10 * Math.sin(td * 39), 960); ctx.scale(z, z); ctx.rotate(-0.05);
  ctx.save(); ctx.rotate(Math.PI / 2); ctx.drawImage(wood(), -1000, -700, 2000, 1250); ctx.restore();
  ctx.fillStyle = 'rgba(70,40,70,0.25)'; ctx.fillRect(-1200, -1200, 2400, 2400);
  // objetos na mesa (cantos): lápis e folhas
  leafShape(ctx, -520, -760, 220, 50, 0.6, '#8DB07A', '#6D9064'); leafShape(ctx, 420, 760, 200, 46, -2.4, '#E2A86A', '#C2865A');
  const slide = lerp(-PW / 2, 0, sm((t - P.coverOpen) / 0.5));
  ctx.save(); ctx.translate(slide, 0);
  ctx.save(); ctx.translate(PW / 2, 0); ctx.rotate(shake); ctx.translate(-PW / 2, 0);
  const leak = pre * (0.55 + 0.45 * Math.max(...[0, 0.25].map((h) => bell(td, h + 0.04, 0.08))));
  if (leak > 0.02) { ctx.save(); ctx.lineCap = 'round'; const f = Math.floor(t * 12);
    for (let i = 0; i < 26; i++) { const side = i % 3, u = rnd(f + 3, i), len = (60 + 160 * rnd(f + 7, i)) * leak, w = 6 + 12 * rnd(f + 9, i);
      const [x0, y0, dx, dy] = side === 0 ? [PW + 6, -PH / 2 + u * PH, 1, (u - 0.5) * 0.6] : side === 1 ? [u * PW, -PH / 2 - 8, (u - 0.5) * 0.6, -1] : [u * PW, PH / 2 + 8, (u - 0.5) * 0.6, 1];
      ctx.strokeStyle = i % 2 ? 'rgba(242,180,81,0.75)' : 'rgba(255,226,160,0.6)'; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + dx * len, y0 + dy * len); ctx.stroke(); }
    ctx.restore(); }
  const pulse = Math.max(...[0, 0.25].map((h) => bell(td, h + 0.04, 0.07))) * pre * 0.6;
  bookSpread(ctx, t, { open, riffle: rf, ignite: Math.max(ig, pulse), lift: pre * (0.5 + 0.5 * Math.sin(td * 20)) });
  ctx.restore();
  // pata: desce, pousa na pegada (na batida), sobe e sai
  if (pawK > 0 && up < 1) { const y = lerp(-1500, -110, easeOut(pawK)) - 1400 * easeIn(up); pingoPaw(ctx, PW / 2 + 40 + 0.35 * (y + 110) * -1 * 0, y + 40, 0.95, -0.45); }
  ctx.restore();
  ctx.restore();
  // luz quente da pegada acesa (luz no mundo, pintada; sem brilho de interface)
  const L = ig * (1 - ss((t - P.cutB + 0.3) / 0.3));
  if (L > 0) { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = radial(ctx, 540, 860, 40, 900, [[0, `rgba(255,220,140,${0.9 * L})`], [1, 'rgba(255,220,140,0)']]); ctx.fillRect(0, 0, W, H); ctx.restore(); }
  inkBurst(ctx, 540, 960 - 110 * z, t, P.paw + 0.04, ACCENT, 1.9);
}

// ============================================================ B–C. a mesa de estudos (plano médio) e o mergulho na página
const TABLE = 1180, BOOK = { x: 470, y: 1420, s: 0.62, sq: 0.45 }, PINGO2 = { x: 878, y: 1468, s: 0.5 };
const KIDS = { lara: { x: 282, y: 868, s: 0.74 }, miguel: { x: 806, y: 872, s: 0.74 } };
/** câmera do plano médio: z (zoom) e o ponto do mundo (fx, fy) que fica em (sx, sy) na tela */
function midCam(t) {
  const k1 = sm((t - P.cutB2) / 0.6), k2 = sm((t - (P.cutC - 0.6)) / 0.7);
  let z = lerp(lerp(1.22 + 0.06 * clamp((t - P.cutB) / 3), 1.6, k1), 2.15, k2), fx = lerp(lerp(548, 400, k1), 720, k2), fy = lerp(lerp(1075, 1010, k1), 1360, k2);
  return { z, fx, fy, sx: 540, sy: 960 };
}
/** matriz do livro na tela; na entrada do portal ela vira a página da direita em tela cheia */
function bookMatrix(cam, t) {
  const A = [BOOK.s * cam.z, 0, 0, BOOK.s * BOOK.sq * cam.z, cam.sx + (BOOK.x - cam.fx) * cam.z, cam.sy + (BOOK.y - cam.fy) * cam.z];
  const k = sm((t - P.splash - 0.1) / (P.portal - P.splash - 0.1)), sc = W / PW;
  const B = [sc, 0, 0, sc, 540 - sc * PW / 2, 960];
  return lerpM(A, B, k);
}
function photo(g, x, y, r, kind) {
  g.save(); g.translate(x, y); g.rotate(r); g.fillStyle = 'rgba(40,20,40,0.25)'; g.fillRect(-58, -66, 128, 150);
  g.fillStyle = '#F6EEE4'; g.fillRect(-64, -74, 128, 150); g.drawImage(pageArt(kind), 60, 100, 330, 330, -54, -64, 108, 108); g.restore();
}
function laraPose(t) {
  const td = on2s(t), talk = speaking('lara', t), react = bell(td, P.miguelLook + 0.25, 0.3), point = ss((td - P.laraPoint) / 0.25) * (1 - ss((td - P.cutC + 0.1) / 0.3));
  return {
    ...KIDS.lara, t: td, mouth: voiceAt('lara', t) * 0.9, smile: talk ? 1 : 0.8, surprise: react * 0.8,
    tilt: keys(td, [[0, -3], [P.miguelLook + 0.3, 5], [P.cutB2, 2], [P.laraPoint, -4], [P.cutC, 0]]), headDy: -6 * react,
    look: keys(td, [[0, [2, 7]], [P.miguelLook, [2, 7]], [P.miguelLook + 0.2, [7, 0]], [P.cutB2 + 0.4, [4, 1]], [P.laraPoint, [9, 3]]]),
    blink: blinkAt(td, [1.0, 3.6, 5.6]),
    armL: { a1: 96, a2: lerp(62, 70, react), open: 0.2 },
    armR: { a1: lerp(lerp(84, 30, react), 20, point), a2: lerp(lerp(30, -50, react), -8, point), open: lerp(0.4, 1, Math.max(react, point)) },
  };
}
function miguelPose(t) {
  const td = on2s(t), sur = ss((td - P.miguelLook) / 0.16) * (1 - ss((td - P.miguelLook - 1.6) / 0.6)), lookB = ss((td - P.cutB2) / 0.3);
  return {
    ...KIDS.miguel, t: td, mouth: voiceAt('miguel', t), surprise: 0.6 * sur, smile: lerp(1, 0.4, sur), brow: Math.max(sur, 0.3 * speaking('miguel', t)),
    tilt: keys(td, [[0, 4], [P.miguelLook, 4], [P.miguelLook + 0.2, -3], [P.cutB2, -5], [P.laraPoint + 0.3, 3]]), headDy: -10 * sur,
    look: keys(td, [[0, [-3, 9]], [P.miguelLook, [-3, 9]], [P.miguelLook + 0.15, [-6, -2]], [P.cutB2, [-9, 2]], [P.laraPoint + 0.3, [6, 6]]]),
    blink: blinkAt(td, [2.9, 4.8, 6.9]),
    armL: { a1: lerp(100, 160, sur), a2: lerp(58, -125, sur), open: sur },
    armR: { a1: lerp(84, 20, sur), a2: lerp(118, -55, sur), open: sur },
  };
}
function pingoMid(t) {
  const td = on2s(t), cr = ss((td - P.crouch) / 0.2);
  return {
    dilate: keys(td, [[0, 0.3], [P.miguelLook, 0.8], [P.laraPoint, 0.4], [P.crouch, 1]]), tail: td * (1 + 2 * cr),
    tilt: keys(td, [[0, 0], [P.miguelLook + 0.3, -14], [P.cutB2, -6], [P.laraPoint + 0.2, 12], [P.cutC, 0]], outBack),
    look: keys(td, [[0, [0, 0]], [P.miguelLook + 0.3, [6, -4]], [P.cutB2, [-7, -2]], [P.laraPoint + 0.3, [0, 0]], [P.crouch, [-6, 5]]]),
    blink: Math.max(blinkAt(td, [2.6, 4.4]), keys(td, [[P.laraPoint + 0.5, 0], [P.laraPoint + 0.7, 1], [P.laraPoint + 0.85, 1], [P.laraPoint + 1.05, 0]])),
    meow: bell(td, P.meow + 0.12, 0.12) * 0.9, earR: -20 * bell(td, P.meow + 0.08, 0.1), earL: -10 * bell(td, P.miguelLook + 0.1, 0.1) + 8 * cr, crouch: cr,
    wiggle: cr * Math.sin((td - P.crouch) * 30),
  };
}
/** cartões ilustrados que saem do livro e voam em volta das crianças (cada um com um felino andando) */
const CARDS = [['jaguar', 140, 520, -0.12, 0], ['tiger', 545, 470, 0.06, 1], ['lion', 950, 520, 0.1, 2]];
function cardsLayer(ctx, t, cam) {
  CARDS.forEach(([kind, tx, ty, rot, i]) => {
    const t0 = P.cards[i], k = clamp((t - t0) / 0.5); if (k <= 0) return;
    const e = easeOut(k), bx = BOOK.x + 60, by = BOOK.y - 30, cx = lerp(bx, tx, e), cy = lerp(by, ty, e) - 260 * Math.sin(Math.PI * e) * (1 - e * 0.3);
    const bob = 14 * Math.sin((t - t0) * 2.4 + i * 2), sc = lerp(0.15, 1, easeOut(k)) * cam.z, r = rot + (1 - e) * (i - 1) * 1.6 + 0.04 * Math.sin(t * 1.7 + i);
    const X = cam.sx + (cx - cam.fx) * cam.z, Y = cam.sy + (cy + bob - cam.fy) * cam.z;
    // rastro de tinta âmbar durante o voo (pinceladas, sem brilho)
    if (k < 1) { ctx.save(); ctx.strokeStyle = ACCENT; ctx.lineCap = 'round'; for (let j = 1; j < 7; j++) { const ee = easeOut(clamp(k - j * 0.06)); const px = lerp(bx, tx, ee), py = lerp(by, ty, ee) - 260 * Math.sin(Math.PI * ee) * (1 - ee * 0.3); ctx.globalAlpha = 0.5 * (1 - j / 7); ctx.lineWidth = (14 - j * 1.6) * cam.z; ctx.beginPath(); ctx.arc(cam.sx + (px - cam.fx) * cam.z, cam.sy + (py - cam.fy) * cam.z, 2, 0, 6.283); ctx.stroke(); } ctx.restore(); }
    const [lc, g] = layer('card');
    g.translate(X, Y); g.rotate(r); g.scale(sc, sc);
    const edge = []; for (let q = 0; q < 16; q++) { const a = q / 16 * 6.283, rx = 170, ry = 124; edge.push([Math.max(-rx, Math.min(rx, Math.cos(a) * rx * 1.5)) + (rnd(i, q) - 0.5) * 8, Math.max(-ry, Math.min(ry, Math.sin(a) * ry * 1.5)) + (rnd(i + 9, q) - 0.5) * 8]); }
    g.fillStyle = 'rgba(40,20,40,0.28)'; g.beginPath(); trace(g, smooth(edge.map(([x, y]) => [x + 12, y + 16]), true, 3)); g.fill();
    g.fillStyle = '#F3E8D8'; g.beginPath(); trace(g, smooth(edge, true, 3)); g.fill();
    g.save(); g.beginPath(); g.rect(-150, -104, 300, 208); g.clip(); g.drawImage(pageArt(i), 40, 300, 450, 312, -150, -104, 300, 208);
    const M = g.getTransform(); g.setTransform(1, 0, 0, 1, 0, 0);
    const fl = i === 2, cx0 = M.a * (fl ? 70 : -60) + M.c * 70 + M.e, cy0 = M.b * (fl ? 70 : -60) + M.d * 70 + M.f;
    drawBigCat(g, kind, { x: cx0, y: cy0, s: 0.21 * sc, flip: fl, walk: (t - t0) * 1.1, moving: 1, tail: t, headRot: 0 }, t);
    g.restore();
    ctx.drawImage(lc, 0, 0);
  });
}
function splashRings(t) {
  return (g) => {
    const k = (t - P.splash) / 0.6; if (k <= 0 || k > 1) return;
    g.save(); g.translate(PW / 2, 60); g.lineCap = 'round';
    for (let i = 0; i < 3; i++) { const kk = clamp(k * 1.3 - i * 0.18); if (kk <= 0) continue; g.strokeStyle = i % 2 ? PLUM : ACCENT; g.globalAlpha = 1 - kk; g.lineWidth = 16 * (1 - kk) + 2; g.beginPath(); g.ellipse(0, 0, 40 + 230 * kk, 30 + 170 * kk, 0, 0, 6.283); g.stroke(); }
    g.restore();
  };
}
function shotTable(ctx, t) {
  const td = on2s(t), cam = midCam(t), bm = bookMatrix(cam, t), wz = bm[0] / BOOK.s;
  // a câmera do mundo acompanha o livro no mergulho
  const c = { z: wz, fx: cam.fx, fy: cam.fy, sx: bm[4] - wz * (BOOK.x - cam.fx), sy: bm[5] - wz * (BOOK.y - cam.fy) };
  const toS = (x, y) => [c.sx + (x - c.fx) * c.z, c.sy + (y - c.fy) * c.z];
  // fundo pintado (paralaxe leve)
  const bz = 1 + (c.z - 1) * 0.3; ctx.save(); ctx.setTransform(bz, 0, 0, bz, c.sx + (-210 - c.fx) * bz, c.sy + (-40 - c.fy) * bz); drawStudyBack(ctx, t); ctx.restore();
  // crianças (o tronco some atrás do tampo; os braços ficam na frente)
  const kidAt = (name, pose) => { const [x, y] = toS(pose.x, pose.y + 40 * pose.s); return drawPerson(ctx, name, { ...pose, x, y, s: pose.s * c.z, cutY: toS(0, TABLE + 6)[1] }); };
  const nod = (who, p) => ({ ...p, headDy: (p.headDy || 0) - 7 * voiceAt(who, t), tilt: (p.tilt || 0) + 2.5 * voiceAt(who, t) * Math.sin(on2s(t) * 9) });
  const lp = nod('lara', laraPose(t)), mp = nod('miguel', miguelPose(t));
  const tableTop = toS(0, TABLE)[1];
  // tampo da mesa em perspectiva (tábuas pintadas)
  ctx.save(); ctx.setTransform(c.z, 0, 0, c.z, c.sx - c.fx * c.z, c.sy - c.fy * c.z);
  const bot = 2050, wd = wood();
  ctx.fillStyle = '#B98A7C'; ctx.fillRect(-600, TABLE, 2300, 1400);
  for (let i = 0; i < 60; i++) { const v0 = i / 60, v1 = (i + 1) / 60, y0 = lerp(TABLE, bot, v0 * v0 * 0.4 + v0 * 0.6), y1 = lerp(TABLE, bot, v1 * v1 * 0.4 + v1 * 0.6), scl = lerp(0.7, 1.4, v0), wp = 1600 * scl; ctx.drawImage(wd, 0, v0 * 1000, 1600, 1000 / 60 + 1, W / 2 - wp / 2, y0, wp, y1 - y0 + 1); }
  ctx.fillStyle = 'rgba(70,40,60,0.28)'; ctx.fillRect(-600, TABLE, 2300, 26);
  // objetos: fotografias de animais (Miguel), caderno e lápis, lupa, cantil
  photo(ctx, 760, 1290, 0.18, 1); photo(ctx, 640, 1720, -0.12, 2);
  ctx.save(); ctx.translate(120, 1330); ctx.rotate(0.14); ctx.fillStyle = 'rgba(40,20,40,0.25)'; ctx.fillRect(-110, -70, 230, 160); ctx.fillStyle = CREAM; ctx.fillRect(-120, -80, 230, 160);
  ctx.strokeStyle = '#B6A7C4'; ctx.lineWidth = 2; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-100, -48 + i * 26); ctx.lineTo(92, -48 + i * 26); ctx.stroke(); } ctx.fillStyle = ACCENT; ctx.beginPath(); trace(ctx, [[20, 96], [30, 106], [140, -30], [130, -40]]); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(980, 1250); ctx.fillStyle = '#6E8F7E'; ctx.beginPath(); trace(ctx, smooth([[-50, 40], [-56, -60], [-30, -110], [30, -110], [56, -60], [50, 40]])); ctx.fill(); ctx.fillStyle = '#506E64'; ctx.fillRect(10, -100, 40, 140); ctx.fillStyle = '#B9AFC3'; ctx.fillRect(-18, -140, 36, 34); ctx.restore();
  ctx.restore();
  const dof = 7 * ss((t - (P.cutC - 0.5)) / 0.6);
  if (dof > 0.2) { const [kc, kg] = layer('kidsDof'); [['lara', lp], ['miguel', mp]].forEach(([n, q]) => { const [x, y] = toS(q.x, q.y + 40 * q.s); drawPerson(kg, n, { ...q, x, y, s: q.s * c.z, cutY: toS(0, TABLE + 6)[1] }); });
    ctx.save(); ctx.filter = `blur(${dof.toFixed(1)}px)`; ctx.drawImage(kc, 0, 0); ctx.restore(); }
  else { kidAt('lara', lp); kidAt('miguel', mp); }
  // o Diário aberto, páginas ainda correndo no começo do plano
  const rf = clamp((td - P.riffle) / 0.75);
  const portal = t > P.splash - 0.3 ? portalPage(t) : null;
  ctx.save(); ctx.setTransform(bm[0], bm[1], bm[2], bm[3], bm[4], bm[5]);
  bookSpread(ctx, t, { open: 1, riffle: rf, ignite: 0, right: portal, splash: splashRings(t) });
  ctx.restore();
  // Pingo: sentado ao lado do livro -> mia -> agacha -> salta e mergulha na página da direita
  const pp = pingoMid(t), lk = clamp((td - P.leap) / (P.splash - P.leap));
  if (td < P.leap) { const [x, y] = toS(PINGO2.x, PINGO2.y); drawPingo(ctx, { ...pp, x, y, s: PINGO2.s * c.z }); }
  else if (lk < 1) {
    const e = lk, wx = lerp(PINGO2.x, BOOK.x + BOOK.s * PW / 2, e), wy = lerp(PINGO2.y - 120, BOOK.y - 10, e) - 300 * Math.sin(Math.PI * Math.min(1, e * 1.2)), [x, y] = toS(wx, wy);
    const [lc, g] = layer('dive'); drawPingoLeap(g, { x: 540, y: 960, s: PINGO2.s * c.z * lerp(0.95, 0.35, e * e), dilate: 1 });
    ctx.save(); ctx.translate(x, y); ctx.rotate(lerp(-0.2, -1.0, e)); ctx.drawImage(lc, -540, -960); ctx.restore();
  }
  cardsLayer(ctx, t, c);
  // sombras de folhas passeando por tudo (mesa, livro, crianças) + poeira na luz + folhagem de primeiro plano
  leafShadows(ctx, t, [0, Math.max(0, tableTop - 520 * c.z), W, H], { alpha: 0.15, scale: c.z, seed: 3 });
  motes(ctx, t, [0, 200, W, 1300], { n: 22, seed: 9 });
  foliageFG(ctx, t, { x: -40, y: 80, s: 1.1, side: 1, seed: 610, blur: 5 }); foliageFG(ctx, t, { x: W + 40, y: 30, s: 0.9, side: -1, seed: 640, blur: 5, n: 5 });
  vignette(ctx, '50,25,60', 0.3);
  // luz de fim de tarde
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = linear(ctx, 0, 0, W, H, [[0, 'rgba(255,214,170,0.5)'], [1, 'rgba(120,80,140,0.3)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
}
/** a página da direita mostra a cena seguinte, ao vivo (vira o portal) */
function portalPage(t) {
  const [c, g] = layer('portal'); shotJaguar(g, Math.max(t, P.splash));
  const [pc, pg] = layer('portalPage'); pg.drawImage(c, 0, 0, W, H, 0, 0, PW, PH);
  return pc;
}

// ============================================================ D. dentro do Diário: os grandes felinos (narrador)
const CAT_S = 1.3, GROUND = 1330;
const walkX = (t, t0, x0, Tc, stride, dir = 1) => x0 + dir * (stride / (0.6 * Tc)) * CAT_S * (t - t0);
function shotJaguar(ctx, t) {
  const td = on2s(t), t0 = P.portal - 0.4, Tc = 0.92, wx = walkX(td, t0, 300, Tc, 140), pan = 0.55 * (walkX(t, t0, 300, Tc, 140) - 300);
  const cam = { x: pan, y: 0, zoom: 1 + 0.03 * (t - P.portal) };
  ctx.fillStyle = '#4E6E62'; ctx.fillRect(0, 0, W, H);
  drawJungle(ctx, t, cam, () => { camSet(ctx, cam, 1); const M = ctx.getTransform(); ctx.setTransform(1, 0, 0, 1, 0, 0); drawBigCat(ctx, 'jaguar', { x: M.a * wx + M.e, y: M.d * GROUND + M.f, s: CAT_S * M.a, walk: (td - t0) / Tc, moving: 1, headRot: 3 + 3 * Math.sin(td * 3), tail: td }, td, { tint: '#3E6A5A', tintA: 0.14 }); });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function shotTiger(ctx, t) {
  const td = on2s(t), t0 = P.whip - 0.25, Tc = 0.96, wx = walkX(td, t0, 820, Tc, 160, -1), pan = 0.85 * (walkX(t, t0, 820, Tc, 160, -1) - 820);
  const cam = { x: pan, y: 0, zoom: 1 };
  drawBamboo(ctx, t, cam, () => { camSet(ctx, cam, 1); const M = ctx.getTransform(); ctx.setTransform(1, 0, 0, 1, 0, 0); drawBigCat(ctx, 'tiger', { x: M.a * wx + M.e, y: M.d * GROUND + M.f, s: CAT_S * M.a, flip: true, walk: (td - t0) / Tc, moving: 1, headRot: 2 + 2 * Math.sin(td * 2.6) - 8 * bell(td, P.whip + 1.4, 0.4), tail: td }, td, { tint: '#B8C8B0', tintA: 0.12 }); });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function shotLion(ctx, t) {
  const td = on2s(t), k = clamp((t - P.cutLion) / (P.cutFam - P.cutLion)), zoom = 1.04 + 0.3 * sm(k);
  const raise = sm((td - P.cutLion - 0.75) / 0.4), jaw = 0.35 * bell(td, P.cutLion + 1.5, 0.25);
  const cam = { x: -60 * sm(k), y: 0, zoom, fx: 640, fy: 990 };
  drawSavanna(ctx, t, cam, () => { camSet(ctx, cam, 1); const M = ctx.getTransform(); ctx.setTransform(1, 0, 0, 1, 0, 0); drawBigCat(ctx, 'lion', { x: M.a * 300 + M.e, y: M.d * 1356 + M.f, s: 1.3 * M.a, headRot: lerp(22, -10, raise), jaw, tail: td }, td, { dark: 'rgba(70,30,60,0.42)', rim: '#FFD7A6', rimDx: -9, rimDy: -7 }); });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
/** a família reunida: tigre, onça e leão entram na batida; o Pingo cai na frente deles */
function shotFamily(ctx, t) {
  const td = on2s(t), cam = { x: 0, y: 0, zoom: 1.0 + 0.02 * (t - P.cutFam), fx: 540, fy: 1200 };
  drawSavanna(ctx, t, cam, () => {
    camSet(ctx, cam, 1); const M = ctx.getTransform(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const at = (x, y) => [M.a * x + M.e, M.d * y + M.f];
    // leão no alto da pedra (à direita, olhando para a esquerda); tigre à esquerda; onça embaixo à direita: todos olham para o Pingo
    { const k = clamp((td - P.fam[2]) / 0.6), [x, y] = at(lerp(1500, 880, easeOut(k)), 1350); if (k > 0) drawBigCat(ctx, 'lion', { x, y, s: 0.78 * M.a, flip: true, walk: (td - P.fam[2]) * 1.1, moving: 1 - k, headRot: 8 + 3 * Math.sin(td), tail: td }, td, { dark: 'rgba(70,30,60,0.35)', rim: '#FFD7A6', rimDx: 7, rimDy: -6 }); }
    { const k = clamp((td - P.fam[0]) / 0.6), [x, y] = at(lerp(-450, 190, easeOut(k)), 1570); if (k > 0) drawBigCat(ctx, 'tiger', { x, y, s: 0.72 * M.a, walk: (td - P.fam[0]) * 1.1, moving: 1 - k, headRot: 10, tail: td }, td, { dark: 'rgba(70,30,60,0.2)' }); }
    { const k = clamp((td - P.fam[1]) / 0.6), [x, y] = at(lerp(1550, 930, easeOut(k)), 1730); if (k > 0) drawBigCat(ctx, 'jaguar', { x, y, s: 0.7 * M.a, flip: true, walk: (td - P.fam[1]) * 1.1, moving: 1 - k, headRot: 10, tail: td }, td, { dark: 'rgba(70,30,60,0.2)' }); }
    // Pingo cai do alto e assenta na frente da família
    const k = clamp((td - (P.pingoLand - 0.25)) / 0.25);
    if (k > 0) { const sq = bell(td, P.pingoLand + 0.06, 0.07), [x, y] = at(560, lerp(700, 1860, easeIn(k))); drawPingo(ctx, { x, y, s: 0.62 * M.a, crouch: 0.6 * sq, dilate: 0.6, tilt: keys(td, [[P.pingoLand + 0.3, 0], [P.pingoLand + 0.6, 10]], outBack), blink: blinkAt(td, [20.3]), tail: td, earL: -12 * sq, earR: -12 * sq }); }
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function inkBurst(ctx, x, y, t, t0, color, sc = 1) {
  const k = (t - t0) / 0.25; if (k <= 0 || k >= 1) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineWidth = 12 * sc * (1 - k);
  for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.283 + 0.3, r0 = (110 + 40 * k) * sc, r1 = r0 + 50 * sc * (1 - k * 0.5); ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); ctx.stroke(); }
  ctx.restore();
}
function speedLines(ctx, t, a, cx = 540, cy = 900, radial = true) {
  if (a <= 0.01) return;
  const f = Math.floor(t * 12); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = CREAM;
  for (let i = 0; i < 34; i++) {
    const ang = rnd(f, i) * 6.283, r0 = 380 + rnd(f + 1, i) * 420, len = 160 + rnd(f + 2, i) * 340, w = 3 + rnd(f + 3, i) * 7;
    const p0 = radial ? [cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0] : [rnd(f, i) * W * 1.4 - 200, rnd(f + 4, i) * H];
    const dir = radial ? [Math.cos(ang), Math.sin(ang)] : [1, 0];
    const p1 = [p0[0] + dir[0] * len, p0[1] + dir[1] * len], nx = -dir[1] * w, ny = dir[0] * w;
    ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo((p0[0] + p1[0]) / 2 + nx, (p0[1] + p1[1]) / 2 + ny); ctx.lineTo(p1[0], p1[1]); ctx.lineTo((p0[0] + p1[0]) / 2 - nx, (p0[1] + p1[1]) / 2 - ny); ctx.fill();
  }
  ctx.restore();
}

// ============================================================ interface (depois do filtro: nítida no celular)
function speciesTag(ctx, t, t0, t1, name, sci, ax, ay, L = 220) {
  if (t < t0 || t > t1) return;
  const k = clamp((t - t0) / 0.22), nChars = Math.ceil(k * name.length), kk = clamp((t - t0 - 0.12) / 0.2);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.strokeStyle = CREAM; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ax, ay + 20); ctx.lineTo(ax, ay + 20 + L * easeOut(k)); ctx.stroke();
  ctx.fillStyle = CREAM; ctx.beginPath(); ctx.arc(ax, ay + 20 + L * easeOut(k), 7, 0, 6.283); ctx.fill();
  ctx.font = '900 76px InterUI'; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  const txt = name.slice(0, nChars); ctx.strokeStyle = PLUM; ctx.lineWidth = 12; ctx.strokeText(txt, ax, ay); ctx.fillStyle = CREAM; ctx.fillText(txt, ax, ay);
  if (kk > 0) { ctx.font = 'italic 700 46px InterUI'; const st = sci.slice(0, Math.ceil(kk * sci.length)); ctx.lineWidth = 10; ctx.strokeText(st, ax, ay - 80); ctx.fillStyle = ACCENT; ctx.fillText(st, ax, ay - 80); }
  ctx.restore();
}
/** "Família Felidae" escrito à mão no céu do entardecer, quando a narração termina */
function familyTitle(ctx, t) {
  const wk = clamp((t - P.write) / 0.8); if (wk <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(90, 470); ctx.rotate(-0.05);
  ctx.font = '700 150px Caveat'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  const l1 = 'Família', l2 = 'Felidae', w1 = ctx.measureText(l1).width, w2 = ctx.measureText(l2).width;
  const k1 = clamp(wk / 0.5), k2 = clamp((wk - 0.5) / 0.5);
  [[l1, 0, 0, k1, w1, CREAM], [l2, 120, 140, k2, w2, ACCENT]].forEach(([s, x, y, k, w, col]) => {
    if (k <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(x - 20, y - 170, (w + 40) * k, 230); ctx.clip();
    ctx.strokeStyle = PLUM; ctx.lineWidth = 16; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore();
  });
  const uk = clamp((t - P.write - 0.8) / 0.2);
  if (uk > 0) { ctx.strokeStyle = CREAM; ctx.lineWidth = 10; ctx.lineCap = 'round'; const u = smooth([[130, 180], [120 + w2 * 0.5, 196], [120 + w2, 170]], false, 12); ctx.beginPath(); trace(ctx, u.slice(0, Math.max(2, Math.floor(u.length * uk))), false); ctx.stroke(); }
  ctx.restore();
}
function uiLayer(ctx, t) {
  speciesTag(ctx, t, P.portal + 0.35, P.whip, 'ONÇA-PINTADA', 'Panthera onca', 600, 560, 260);
  speciesTag(ctx, t, P.whip + 0.25, P.cutLion, 'TIGRE', 'Panthera tigris', 470, 560, 260);
  speciesTag(ctx, t, P.cutLion + 0.2, P.cutFam, 'LEÃO', 'Panthera leo', 360, 520, 300);
  familyTitle(ctx, t);
}

// ============================================================ onomatopeias desenhadas (entram na batida)
const SFXW = [
  // [texto, início, duração, x, y, tamanho, rotação]
  ['TAP!', P.paw, 0.45, 780, 470, 180, 0.12], ['FRRRT!', P.riffle, 0.5, 300, 1500, 150, -0.12],
  ['miau!', P.meow, 0.55, 300, 560, 150, -0.1], ['PLOFT!', P.splash, 0.45, 760, 660, 170, 0.1],
  ['TUM!', P.pingoLand, 0.4, 820, 1380, 150, 0.12],
];
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
const KEYWORDS = new Set(['livro', 'mostrar', 'aventura', 'fascinantes', 'família', 'felinos']);
const bare = (w) => w.toLowerCase().replace(/[^a-zà-ú]/g, '');
/** frases: por fala, quebradas na pontuação forte ou a cada 7 palavras; linhas de até ~880 px */
const PHRASES = (() => {
  const out = []; let cur = [];
  P.words.forEach((w, i) => {
    const next = P.words[i + 1]; cur.push(i);
    if (!next || next[3] !== w[3] || /[.?!]$/.test(w[0]) || cur.length >= 7 || (/[,]$/.test(w[0]) && cur.length >= 4)) { out.push(cur); cur = []; }
  });
  return out;
})();
function phraseLines(ctx, ph) {
  const lines = [[]]; let wsum = 0;
  ph.forEach((i) => { const w = ctx.measureText(P.words[i][0]).width + (KEYWORDS.has(bare(P.words[i][0])) ? 36 : 0) + 24; if (wsum + w > 900 && lines[lines.length - 1].length) { lines.push([]); wsum = 0; } lines[lines.length - 1].push(i); wsum += w; });
  return lines;
}
function halftoneBox(ctx, x, y, w, h) {
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fillStyle = ACCENT; ctx.fill();
  ctx.clip(); ctx.fillStyle = 'rgba(180,90,40,0.35)'; for (let yy = y; yy < y + h; yy += 10) for (let xx = x + ((yy / 10) % 2) * 5; xx < x + w; xx += 10) { ctx.beginPath(); ctx.arc(xx, yy, 2.2, 0, 6.283); ctx.fill(); }
  ctx.restore(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.strokeStyle = PLUM; ctx.lineWidth = 7; ctx.stroke();
}
function captionY(t) { return t >= P.cutFam ? 300 : t >= P.portal ? 1560 : 1690; }
function captions(ctx, t) {
  const Wd = P.words; let pi = -1; PHRASES.forEach((ph, i) => { if (t >= Wd[ph[0]][1] - 0.05) pi = i; });
  if (pi < 0) return;
  const ph = PHRASES[pi], last = Wd[ph[ph.length - 1]], next = pi + 1 < PHRASES.length ? Wd[PHRASES[pi + 1][0]][1] - 0.05 : 1e9, end = Math.min(next, last[2] + 0.6);
  if (t > end) return;
  const out = clamp((t - end + 0.1) / 0.1);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = '900 70px InterUI'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const lines = phraseLines(ctx, ph);
  let kick = 0; ph.forEach((i) => { kick = Math.max(kick, bell(t, Wd[i][1] + 0.05, 0.06)); });
  const gap = 34, lh = 104, y0 = captionY(t) - (lines.length - 1) * lh / 2 - 10 * kick;
  lines.forEach((line, li) => {
    const ws = line.map((i) => ctx.measureText(Wd[i][0]).width + (KEYWORDS.has(bare(Wd[i][0])) ? 36 : 0)), tw = ws.reduce((a, b) => a + b, 0) + gap * (line.length - 1); let x = 540 - tw / 2;
    line.forEach((i, j) => {
      const [w, s, e] = Wd[i], k = (t - s + 0.03) / 0.18, active = t >= s - 0.02 && t < e + 0.06, key = KEYWORDS.has(bare(w));
      if (k > 0) {
        const sc = Math.max(0.01, outBack(k, 2.4)) * (active ? 1.14 : 1) * (1 - easeIn(out)), r = (i % 2 ? 1 : -1) * (key ? 0.06 : 0.025) * (1 - clamp(k - 1)) + (key ? (i % 2 ? 0.04 : -0.04) : 0);
        ctx.save(); ctx.translate(x + ws[j] / 2, y0 + li * lh + (1 - clamp(k)) * 30); ctx.rotate(r); ctx.scale(sc, sc); ctx.textAlign = 'center';
        if (key) { const bw = ws[j], bh = 92; halftoneBox(ctx, -bw / 2, -bh / 2, bw, bh); ctx.fillStyle = PLUM; ctx.fillText(w, 0, 4); }
        else { ctx.fillStyle = PLUM; ctx.fillText(w, 5, 6); ctx.strokeStyle = PLUM; ctx.lineWidth = 14; ctx.strokeText(w, 0, 0); ctx.fillStyle = active ? ACCENT : CREAM; ctx.fillText(w, 0, 0); }
        ctx.restore();
      }
      x += ws[j] + gap;
    });
  });
  ctx.restore();
}

// ============================================================ composição do quadro
function sceneAt(ctx, t) {
  BOIL = Math.floor(t * 12);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#2A1E30'; ctx.fillRect(0, 0, W, H);   // sem estado entre quadros
  if (t < P.cutB) shotBookTop(ctx, t);
  else if (t < P.portal) shotTable(ctx, t);
  else if (t < P.cutLion) {
    const wk = clamp((t - P.whip) / 0.16), e = sm(wk);
    if (t < P.whip + 0.16) { const [c, g] = layer('jag'); shotJaguar(g, t); ctx.save(); ctx.setTransform(1, 0, 0, 1, -1080 * e, 0); ctx.drawImage(c, 0, 0); ctx.restore(); }
    if (t >= P.whip) { const [c, g] = layer('tig'); g.fillStyle = '#8FA068'; g.fillRect(0, 0, W, H); shotTiger(g, t); ctx.save(); ctx.setTransform(1, 0, 0, 1, 1080 * (1 - e), 0); ctx.drawImage(c, 0, 0); ctx.restore(); }
    speedLines(ctx, t, bell(t, P.whip + 0.06, 0.08), 540, 900, false);
  } else if (t < P.cutFam) shotLion(ctx, t);
  else shotFamily(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  speedLines(ctx, t, bell(t, P.splash + 0.3, 0.2) * 0.8);
}
function renderFrame(ctx, t) {
  const blur = (t > P.whip - 0.04 && t < P.whip + 0.2) || (t > P.splash + 0.2 && t < P.portal);
  if (blur) {
    const [ac, ag] = layer('acc'); const n = 4, span = (1 / 60) * 0.85;
    for (let i = 0; i < n; i++) { const [fc, fg] = layer('sub'); sceneAt(fg, t + (i / (n - 1) - 0.5) * span); ag.globalAlpha = 1 / (i + 1); ag.drawImage(fc, 0, 0); }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(ac, 0, 0);
  } else sceneAt(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  BOIL = Math.floor(t * 12);
  sfxWords(ctx, t);
  POST(ctx, 1, 0);          // pinceladas + retícula + hachura + registro de cor + papel (estilo Aranhaverso)
  uiLayer(ctx, t);
  captions(ctx, t);
}
