// Cena 08 — Ouvidos sempre alertas (requisito 6: proteção dos ouvidos).
// Folha seca cai atrás -> uma orelha gira antes da cabeça -> sons de várias direções (orelhas independentes) -> pavilhão:
// formato, dobras e pelos na entrada do canal -> partículas desviadas -> era só uma folha -> a folha cai sobre o Diário, que se abre.
'use strict';
(() => {
  const porch = () => cachedPainted('s08porch', 1080, 1920, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#B8A2C8'], [0.5, '#E6C2A8'], [0.62, '#C8A07A'], [1, '#9A7656']]); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) canopy(g, i * 220 + rnd(121, i) * 80, 560 + rnd(122, i) * 100, 200, '#9AB08E', '#7E987A', 1100 + i, 0.01);
    g.fillStyle = '#8A6A56'; g.fillRect(0, 1190, w, 30); for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#B08A6A' : '#A6805E'; g.fillRect(0, 1220 + i * 80, w, 76); }
    for (let x = 30; x < w; x += 110) { g.fillStyle = '#9A7A62'; g.fillRect(x, 960, 22, 230); } g.fillStyle = '#8A6A56'; g.fillRect(0, 950, w, 22);
  }, 24, 0.55);
  function fallingLeaf(ctx, t, t0, x0, y0, y1, s = 1) {
    const k = clamp((t - t0) / 1.4); if (t < t0) return; const y = lerp(y0, y1, k), x = x0 + 50 * Math.sin((t - t0) * 4);
    leafShape(ctx, x, y, 130 * s, 40 * s, Math.sin((t - t0) * 3) * 1.2 + (k >= 1 ? 0.3 : 0), '#C9965A', '#A87444', 0.01, 1201);
  }
  function shotLeaf(ctx, t) {
    const td = on2s(t), earR = -30 * ss((td - P.earTurn) / 0.15) * (1 - ss((td - P.headTurn - 0.6) / 0.3)), turn = ss((td - P.headTurn) / 0.25);
    ctx.drawImage(porch(), 0, 0);
    sunRays(ctx, t, { x: 300, y: -60, ang: -0.3, len: 1700, n: 4, width: 110, alpha: 0.18 });
    fallingLeaf(ctx, t, P.leaf, 860, 600, 1200, 0.9);
    drawPingo(ctx, { x: 470, y: 1640, s: 0.95, tail: td, earR: earR + 8 * Math.sin(td * 2), earL: 4 * Math.sin(td * 2.3), tilt: 14 * turn, look: [9 * turn, -2 * turn], dilate: 0.5 + 0.4 * turn, blink: blinkAt(td, [3.2]) });
    leafShadows(ctx, t, [0, 1100, W, 820], { alpha: 0.12, seed: 22 });
    motes(ctx, t, [0, 300, W, 1100], { n: 16, seed: 29 });
  }
  /** ondas de som chegando (arcos) de uma direção */
  function soundArcs(ctx, x, y, ang, t, t0, col = ACCENT) {
    if (t < t0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.strokeStyle = col; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const k = ((t - t0) * 0.9 + i / 4) % 1, r = lerp(520, 140, k); ctx.globalAlpha = Math.sin(Math.PI * k); ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, r, -0.45, 0.45); ctx.stroke(); }
    ctx.restore();
  }
  function shotWaves(ctx, t) {
    const td = on2s(t), seq = Math.floor((td - P.waves) / 1.2) % 3;
    ctx.drawImage(porch(), -70, -150, W + 140, H + 250);   // um pouco ampliado: sobe sem deixar faixa vazia embaixo
    const src = [[Math.PI, -40, 0], [0, 40, 1], [-Math.PI / 2, 0, 2]][seq];
    drawPingo(ctx, { x: 540, y: 1760, s: 1.25, tail: td, earL: seq === 0 ? -34 : seq === 2 ? -10 : 6, earR: seq === 1 ? -34 : seq === 2 ? -10 : 6, look: seq === 0 ? [-7, 0] : seq === 1 ? [7, 0] : [0, -6], dilate: 0.7, tilt: seq === 0 ? -5 : seq === 1 ? 5 : 0 });
    soundArcs(ctx, 540, 820, src[0], t, P.waves + seq * 1.2);
  }
  // pavilhão auditivo (orelha de frente, grande): formato, dobras, pelos protetores na entrada do canal
  function shotAnatomy(ctx, t) {
    const td = on2s(t), k = sm((t - P.anatomy) / 0.6), hairs = ss((t - P.hairs) / 0.5), parts = t >= P.particles;
    ctx.fillStyle = '#3A3150'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(540, 880); ctx.scale(lerp(0.6, 0.95, k), lerp(0.6, 0.95, k));
    flat(ctx, [[-430, 520], [-330, 0], [-120, -560], [0, -700], [120, -560], [330, 0], [430, 520]], PG.fur, 6);
    flat(ctx, [[-330, 470], [-250, 20], [-90, -470], [0, -590], [90, -470], [250, 20], [330, 470]], '#F2A8A8', 6);
    flat(ctx, [[-260, 450], [-190, 60], [-60, -360], [0, -450], [60, -360], [190, 60], [260, 450]], '#E58C9C', 6);
    // dobras (cristas curvas)
    ctx.strokeStyle = '#C96A7E'; ctx.lineWidth = 16; ctx.lineCap = 'round'; const fk = clamp((t - P.anatomy - 0.9) / 0.6);
    [[-180, 260, -70, 120, 40], [180, 260, 70, 120, -40], [-120, 380, 0, 300, 0]].forEach(([x0, y0, cx, cy, x1], i) => { if (fk <= 0) return; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, lerp(x0, x1, fk), lerp(y0, 40, fk)); ctx.stroke(); });
    // canal auditivo
    ctx.fillStyle = '#4A2A3A'; ctx.beginPath(); ctx.ellipse(0, 420, 110, 80, 0, 0, 6.283); ctx.fill();
    // pelos na entrada (tufos brancos que balançam)
    ctx.strokeStyle = '#FFF6EE'; ctx.lineWidth = 7; for (let i = 0; i < 18; i++) { const sd = i % 2 ? 1 : -1, x0 = sd * (120 + (i % 5) * 26), y0 = 470 - (i % 4) * 60, L = 190 * hairs, a = sd > 0 ? Math.PI + 0.35 : -0.35; const sw = 0.12 * Math.sin(td * 3 + i); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + Math.cos(a + sw) * L * 0.5, y0 + Math.sin(a + sw) * L * 0.5 - 30, x0 + Math.cos(a + sw * 2) * L, y0 + Math.sin(a + sw * 2) * L - 60); ctx.stroke(); }
    ctx.restore();
    // partículas de poeira: vêm em direção ao canal e são desviadas pelos pelos
    if (parts) for (let i = 0; i < 18; i++) { const ph = ((td - P.particles) * 0.6 + rnd(131, i)) % 1, x0 = 540 + (rnd(132, i) - 0.5) * 900, y0 = 160, x1 = 540 + (rnd(133, i) - 0.5) * 120, y1 = 1360; let x = lerp(x0, x1, ph), y = lerp(y0, y1, ph); if (ph > 0.72) { const b = (ph - 0.72) / 0.28; x += (x0 < 540 ? -1 : 1) * 420 * b; y -= 260 * b * (1 - b) * 2; } ctx.fillStyle = 'rgba(200,190,170,0.9)'; ctx.beginPath(); ctx.arc(x, y, 7 + rnd(134, i) * 5, 0, 6.283); ctx.fill(); }
  }
  function shotRelax(ctx, t) {
    const td = on2s(t), k = ss((td - P.relax - 0.3) / 0.5);
    ctx.drawImage(porch(), 0, 0);
    leafShape(ctx, 860, 1250, 120, 36, 0.3, '#C9965A', '#A87444', 0.01, 1201);
    drawPingo(ctx, { x: 470, y: 1640, s: 0.95, tail: td * 0.6, tilt: 10 * (1 - k), look: [6 * (1 - k), 0], crouch: 0.85 * k, blink: lerp(0, 0.8, k), dilate: 0.3, earL: 4, earR: 4 });
    leafShadows(ctx, t, [0, 1100, W, 820], { alpha: 0.12, seed: 22 });
  }
  /** a folha cai sobre o Diário (visto de cima) e uma página nova se abre */
  function shotBook(ctx, t) {
    const td = on2s(t), k = clamp((t - P.leafBook) / 1.2);
    ctx.fillStyle = '#5E4636'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(540, 960); ctx.rotate(Math.PI / 2); ctx.drawImage(wood(), -1000, -700, 2000, 1250); ctx.restore();
    ctx.save(); ctx.translate(540, 960); ctx.scale(1.05, 1.05); ctx.translate(-BOOK.PW / 2, 0);
    BOOK.bookSpread(ctx, t, { open: ss((t - P.leafBook - 0.5) / 0.6), riffle: 0, ignite: 0 });
    ctx.restore();
    const lk = clamp((t - P.leafBook) / 0.6); leafShape(ctx, lerp(760, 600, lk) + 40 * Math.sin(t * 5) * (1 - lk), lerp(-100, 760, lk), 140, 42, 0.6 + Math.sin(t * 4) * (1 - lk), '#C9965A', '#A87444', 0.01, 1201);
    leafShadows(ctx, t, [0, 0, W, H], { alpha: 0.12, seed: 25 });
  }
  function draw(ctx, t) {
    if (t < P.waves) shotLeaf(ctx, t);
    else if (t < P.anatomy) shotWaves(ctx, t);
    else if (t < P.relax) shotAnatomy(ctx, t);
    else if (t < P.leafBook) shotRelax(ctx, t);
    else shotBook(ctx, t);
    vignette(ctx, '50,25,50', 0.26);
  }
  function ui(ctx, t) {
    if (t >= P.waves && t < P.anatomy) uiCard(ctx, t, P.waves + 0.4, P.anatomy - 0.1, 'sons de várias direções', 540, 300, { size: 48, accent: true });
    if (t >= P.anatomy && t < P.relax) {
      uiCard(ctx, t, P.anatomy + 1.0, P.relax - 0.1, 'dobras da orelha', 250, 360, { size: 42 });
      uiCard(ctx, t, P.hairs + 0.2, P.relax - 0.1, 'pelos na entrada do canal', 760, 470, { size: 40, accent: true });
      uiCard(ctx, t, P.particles + 2.2, P.relax - 0.1, 'protegem de sujeira e partículas', 540, 250, { size: 40, accent: true });
    }
  }
  const sfx = (E) => [['crrsh', E.leaf + 0.9, 0.45, 860, 1100, 110, 0.1], ['?', E.headTurn, 0.6, 700, 900, 170, 0.1], ['ronrom...', E.relax + 0.6, 0.8, 760, 1000, 110, -0.08]];
  CENAS.s08 = { draw, ui, sfx, capY: (t) => (t >= P.anatomy && t < P.relax ? 1480 : 1000) };   // no quintal a legenda fica acima do Pingo
})();
