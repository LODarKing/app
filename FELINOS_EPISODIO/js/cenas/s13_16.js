// Cena 13 — Leões nas páginas da Bíblia: a Lara apresenta, a Bíblia ilustrada mostra as quatro histórias (cenas 14–17 em historias.js).
'use strict';
(() => {
  const GOLD = '#FFE2A8';
  // ---------- miniaturas da Bíblia ilustrada (usadas na cena 13)
  function vignetteArt(g, i, w, h, t) {
    const bg = [['#F2B87A', '#C9785A'], ['#F6C9A0', '#9AB07E'], ['#C8D6E8', '#8A9AB8'], ['#3A2E50', '#1E1830']][i];
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, bg[0]], [1, bg[1]]]); g.fillRect(0, 0, w, h);
    const sc = h / 1000, L = (rim) => ({ dir: [-1, -0.5], key: 'rgba(255,224,170,0.3)', shade: 'rgba(60,30,80,0.4)', rim, rimW: 3, rimA: 0.8 });
    const lionL = { light: { dir: [-1, -0.5], key: 'rgba(255,222,160,0.3)', shade: 'rgba(80,36,60,0.42)', rim: 'rgba(255,230,180,1)', rimW: 3, rimA: 0.8 } };
    if (i === 0) { drawBigCat(g, 'lion', { x: w * 0.7, y: h * 0.93, s: 0.42 * sc, flip: true, jaw: 0.6, tail: t }, t, lionL); bibFigure(g, 'sansao', { x: w * 0.3, y: h * 0.95, s: 0.72 * sc, t, pose: 'brace', tag: 'v', light: L('rgba(255,236,196,1)') }); }
    if (i === 1) { sheep(g, w * 0.74, h * 0.93, 0.62 * sc, t); bibFigure(g, 'davi', { x: w * 0.36, y: h * 0.95, s: 0.72 * sc, t, pose: 'stand', hold: 'staff', tag: 'v', light: L('rgba(255,236,196,1)') }); }
    if (i === 2) { g.fillStyle = '#F6F8FC'; for (let k = 0; k < 30; k++) { g.beginPath(); g.arc(rnd(201, k) * w, ((rnd(202, k) * h + t * 40) % h), 4 * sc + 2, 0, 6.283); g.fill(); } g.fillStyle = '#6E7480'; g.beginPath(); g.ellipse(w * 0.66, h * 0.88, w * 0.26, h * 0.06, 0, 0, 6.283); g.fill(); g.fillStyle = '#1E1830'; g.beginPath(); g.ellipse(w * 0.66, h * 0.88, w * 0.19, h * 0.04, 0, 0, 6.283); g.fill(); bibFigure(g, 'benaia', { x: w * 0.3, y: h * 0.95, s: 0.7 * sc, t, pose: 'stand', hold: 'spear', tag: 'v', light: L('rgba(232,240,255,1)') }); }
    if (i === 3) { g.fillStyle = 'rgba(255,236,190,0.35)'; g.beginPath(); g.moveTo(w * 0.42, 0); g.lineTo(w * 0.6, 0); g.lineTo(w * 0.82, h); g.lineTo(w * 0.22, h); g.fill(); [[0.2, 0], [0.82, 1]].forEach(([fx, fl]) => drawBigCat(g, 'lion', { x: w * fx, y: h * 0.96, s: 0.3 * sc, flip: !!fl, lie: 1, blink: 1, headRot: 16, tail: 0 }, t, lionL)); bibFigure(g, 'daniel', { x: w * 0.5, y: h * 0.95, s: 0.7 * sc, t, pose: 'pray', tag: 'v', light: L('rgba(255,240,206,1)') }); }
  }
  const biblePage = (t) => { const [c, g] = layer('biblePage'); g.fillStyle = '#F3E6CC'; g.fillRect(0, 0, BOOK.PW, BOOK.PH); g.fillStyle = 'rgba(160,110,60,0.15)'; g.fillRect(0, 0, 24, BOOK.PH); return c; };
  // ======================================================== CENA 13
  function s13(ctx, t, E) {
    const td = on2s(t);
    if (t < E.bible) {
      const tb = talkBeats('lara', t + SCENE_T0);
      mesaShot(ctx, t, { cam: { z: 1.45 + 0.04 * t, fx: 420, fy: 1060 }, book: { open: 1, gold: ss((t - 0.4) / 1.2) }, warm: 0.6,
        lara: { x: 282, y: 868, s: 0.74, t: td, mouth: voiceL('lara', t), smile: 1, look: [7, 6], turn: 0.3, tilt: 3 + 3 * tb.nod, brow: tb.brow, blink: blinkAt(td, [1.6]), armR: { a1: 60, a2: 30, open: 1 } },
        miguel: { x: 806, y: 872, s: 0.74, t: td, look: [-8, 6], turn: -0.3, smile: 0.7, blink: blinkAt(td, [2.4]) },
        pingo: { x: 878, y: 1468, s: 0.5, tail: td, look: [-6, 2], dilate: 0.5, blink: blinkAt(td, [3.1]) } });
      return;
    }
    // close na Bíblia ilustrada (vista de cima), com as quatro miniaturas
    const k = sm((t - E.bible) / 0.8), z = lerp(1.55, 1.85, sm((t - E.bible) / 8)), dive = sm((t - E.open) / 1.0);
    ctx.fillStyle = '#4E3A30'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(540, 960); ctx.rotate(Math.PI / 2); ctx.drawImage(wood(), -1000, -700, 2000, 1250); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = radial(ctx, 540, 960, 50, 900, [[0, 'rgba(255,214,140,0.55)'], [1, 'rgba(255,214,140,0)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
    const VZ = [[0.5, 0.25], [0.5, 0.75]], frames = [[60, 120], [60, 430], [60, 740], [250, 430]];
    ctx.save(); ctx.translate(540, 960); const Z = z * lerp(1, 4.2, dive * dive); ctx.scale(Z, Z); ctx.translate(-BOOK.PW / 2 * 0 - 0, 0); ctx.translate(-lerp(BOOK.PW * 0.5, BOOK.PW * 0.27, dive), -lerp(0, -230 + 0, dive));
    ctx.translate(-BOOK.PW / 2 + BOOK.PW / 2 - BOOK.PW * 0, 0);
    const pg = biblePage(t), pgc = pg.getContext('2d');
    pgc.font = '700 64px Caveat'; pgc.fillStyle = '#7A3E52'; pgc.textAlign = 'center'; pgc.fillText('Bíblia', BOOK.PW / 2, 80);
    [[40, 110], [235, 110], [40, 440], [235, 440]].forEach(([x, y], i) => { const kk = clamp((t - E.vignettes[i]) / 0.3); if (kk <= 0) return; const w = 175, h = 300; pgc.save(); pgc.translate(x + w / 2, y + h / 2); pgc.scale(outBack(kk), outBack(kk)); pgc.translate(-w / 2, -h / 2); pgc.fillStyle = '#C9965A'; pgc.fillRect(-8, -8, w + 16, h + 16); const [vc, vg] = layer('vig'); vg.save(); vignetteArt(vg, i, w * 2, h * 2, td); vg.restore(); pgc.drawImage(vc, 0, 0, w * 2, h * 2, 0, 0, w, h); pgc.restore(); });
    ctx.translate(-BOOK.PW * 0.0, 0); BOOK.bookSpread(ctx, t, { open: 1, right: pg }); ctx.restore();
    motes(ctx, t, [0, 300, W, 1300], { n: 20, seed: 79, color: '255,226,160' });
  }
  CENAS.s13 = { draw: s13, capY: (t) => 1390, sfx: (E) => [] };
})();
