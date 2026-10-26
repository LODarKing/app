// Cenas 13–16 — Leões nas páginas da Bíblia; Sansão (Jz 14:5–6); Davi (1Sm 17:34–37); Benaia (2Sm 23:20).
// Ritmo mais cinematográfico e reverente. Lutas só sugeridas por silhuetas, sombras e luz (sem violência gráfica).
'use strict';
(() => {
  const GOLD = '#FFE2A8';
  // ---------- miniaturas da Bíblia ilustrada (usadas na cena 13)
  function vignetteArt(g, i, w, h, t) {
    const bg = [['#F2B87A', '#C9785A'], ['#F6C9A0', '#9AB07E'], ['#C8D6E8', '#8A9AB8'], ['#3A2E50', '#1E1830']][i];
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, bg[0]], [1, bg[1]]]); g.fillRect(0, 0, w, h);
    const sc = h / 1000;
    if (i === 0) { robeFigure(g, { x: w * 0.36, y: h * 0.92, s: 0.9 * sc, t, pose: 'stand', hair: 'long', rim: GOLD }); const [c, cg] = layer('vgl'); drawBigCat(cg, 'lioness', { x: w * 0.62, y: h * 0.92, s: 0.55 * sc, flip: true, jaw: 0.6, tail: t }, t, { dark: 'rgba(36,22,42,1)' }); g.drawImage(c, 0, 0); }
    if (i === 1) { sheep(g, w * 0.7, h * 0.92, 0.7 * sc, t); robeFigure(g, { x: w * 0.36, y: h * 0.92, s: 0.9 * sc, t, pose: 'stand', staff: true, rim: GOLD }); }
    if (i === 2) { g.fillStyle = '#F6F8FC'; for (let k = 0; k < 30; k++) { g.beginPath(); g.arc(rnd(201, k) * w, ((rnd(202, k) * h + t * 40) % h), 4 * sc + 2, 0, 6.283); g.fill(); } g.fillStyle = '#6E7480'; g.beginPath(); g.ellipse(w * 0.6, h * 0.86, w * 0.26, h * 0.07, 0, 0, 6.283); g.fill(); g.fillStyle = '#1E1830'; g.beginPath(); g.ellipse(w * 0.6, h * 0.86, w * 0.19, h * 0.045, 0, 0, 6.283); g.fill(); robeFigure(g, { x: w * 0.28, y: h * 0.92, s: 0.9 * sc, t, pose: 'stand', hair: 'helmet', spear: true, cloak: true, rim: '#DDE8FF' }); }
    if (i === 3) { g.fillStyle = 'rgba(255,236,190,0.35)'; g.beginPath(); g.moveTo(w * 0.45, 0); g.lineTo(w * 0.6, 0); g.lineTo(w * 0.8, h); g.lineTo(w * 0.25, h); g.fill(); robeFigure(g, { x: w * 0.5, y: h * 0.92, s: 0.9 * sc, t, pose: 'pray', hair: 'beard', rim: GOLD }); [[0.18, 0], [0.84, 1]].forEach(([fx, fl]) => { const [c, cg] = layer('vgl'); drawBigCat(cg, 'lion', { x: w * fx, y: h * 0.94, s: 0.4 * sc, flip: !!fl, tail: t }, t, { dark: 'rgba(36,22,42,1)' }); g.drawImage(c, 0, 0); }); }
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
  // ======================================================== CENA 14 — Sansão
  const vineyard = () => cachedPainted('s14vine', 1500, 1920, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#E9A06E'], [0.35, '#F6C98E'], [0.5, '#E2B07A'], [1, '#9A7046']]); g.fillRect(0, 0, w, h);
    g.fillStyle = '#B88A6E'; g.beginPath(); trace(g, smooth([[0, 880], [400, 760], [800, 800], [1100, 720], [1500, 820], [1500, 1000], [0, 1000]])); g.fill();
    for (let i = 0; i < 9; i++) { const x = 900 + i * 34, y = 700 - (i % 3) * 18; g.fillStyle = '#C8A08A'; g.fillRect(x, y, 30, 40 + (i % 2) * 14); g.fillStyle = '#9A7A6A'; g.fillRect(x, y, 30, 6); }   // Timna ao longe
    g.fillStyle = '#C8A08A'; g.fillRect(880, 744, 330, 20);
    for (let r = 0; r < 7; r++) { const y = 1000 + r * 140, sc = 0.5 + r * 0.25; g.strokeStyle = '#7A5A3E'; g.lineWidth = 4 * sc; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = -40 + (r % 2) * 60; x < w; x += 140 * sc) { canopy(g, x, y - 20 * sc, 46 * sc, '#7E9A5E', '#5E7A46', 2000 + r * 40 + Math.floor(x), 0.01); g.fillStyle = '#7A4E6A'; g.beginPath(); g.arc(x + 14 * sc, y + 4 * sc, 8 * sc, 0, 6.283); g.fill(); } }
    g.fillStyle = '#C9A47E'; g.beginPath(); g.moveTo(560, 1000); g.lineTo(760, 1000); g.lineTo(1300, h); g.lineTo(100, h); g.fill();
  }, 37, 0.55);
  function s14(ctx, t, E) {
    const td = on2s(t), roar = bell(td, E.lion + 0.3, 0.35), spirit = ss((t - E.spirit) / 0.8), fight = t >= E.fight && t < E.won, won = t >= E.won;
    let shake = 0; { const d = t - E.lion - 0.2; if (d > 0 && d < 0.5) shake = Math.sin(d * 70) * 12 * (1 - d / 0.5); }
    ctx.save(); ctx.translate(-200 - 20 * t + shake, 0); ctx.drawImage(vineyard(), 0, 0); ctx.restore();
    lightBeam(ctx, 520, spirit * (won ? 1 : 0.9), 300);
    const sx = won ? 520 : lerp(220, 480, clamp(t / E.lion)), sy = 1560;
    if (!fight) {
      robeFigure(ctx, { x: sx, y: sy, s: 0.95, t: td, pose: t < E.lion ? 'walk' : 'stand', hair: 'long', rim: spirit > 0.1 ? '#FFF2C8' : GOLD, arms: t >= E.lion && !won ? [[60, -0.3], [40, -0.4]] : won ? [[100, 0], [80, 0]] : null });
      if (!won) { const lk = clamp((td - E.lion) / 0.5), lx = lerp(1350, 1060, easeOut(lk)), ly = 1560 - 160 * Math.sin(Math.PI * Math.min(1, lk)) * (lk < 1 ? 1 : 0); if (td >= E.lion) drawBigCat(ctx, 'lioness', { x: lx, y: ly, s: 0.95, flip: true, jaw: roar, tail: td, headRot: -6 }, td, { dark: 'rgba(36,22,42,1)', rim: GOLD, rimDx: 6, rimDy: -6 }); }
      else { const [c, cg] = layer('s14l'); drawBigCat(cg, 'lioness', { x: 860, y: 1600, s: 0.8, flip: true, tail: 0, headRot: 30 }, 0, { dark: 'rgba(36,22,42,1)' }); ctx.save(); ctx.globalAlpha = 0.85; ctx.drawImage(c, 0, 0); ctx.restore(); }
    } else {   // a luta: silhuetas rápidas sobrepostas, em dois desenhos de impacto
      const f = Math.floor(td * 12), ph = f % 6;
      if (ph < 2) { ctx.fillStyle = '#E2A23A'; ctx.fillRect(0, 0, W, H); }
      const jx = (rnd(f, 1) - 0.5) * 60, jy = (rnd(f, 2) - 0.5) * 40;
      drawBigCat(ctx, 'lioness', { x: 640 + jx, y: 1500 + jy, s: 1.0, flip: true, jaw: 0.6, headRot: -20 + 20 * rnd(f, 3), tail: td }, td, { dark: 'rgba(36,22,42,1)', rim: '#FFF2C8', rimDx: 6, rimDy: -6 });
      robeFigure(ctx, { x: 470 - jx * 0.6, y: 1560 + jy * 0.4, s: 0.95, t: td, pose: 'stand', hair: 'long', rim: '#FFF2C8', arms: [[10 + 30 * rnd(f, 4), -0.5], [-10 + 20 * rnd(f, 5), -0.6]] });
      speedLines(ctx, t, 0.5, 600, 1200, true);
    }
    vignette(ctx, '40,20,30', 0.32);
    if (t > E.page - 0.6) { const k = sm((t - E.page + 0.6) / 1.0); ctx.save(); ctx.fillStyle = '#F3E6CC'; ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(W - W * 1.6 * k, 0); ctx.quadraticCurveTo(W - W * 1.2 * k, H * 0.5, W - W * 1.6 * k + 200, H); ctx.lineTo(W, H); ctx.fill(); ctx.restore(); }
  }
  // ======================================================== CENA 15 — Davi
  const pasture = () => cachedPainted('s15past', 1500, 1920, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#B8A2D0'], [0.32, '#F6B8A0'], [0.45, '#FCE2B0'], [0.5, '#B8C88E'], [1, '#7E9A62']]); g.fillRect(0, 0, w, h);
    g.fillStyle = '#FFF0C8'; g.beginPath(); g.arc(1050, 880, 110, 0, 6.283); g.fill();
    g.fillStyle = '#9AAE7A'; g.beginPath(); trace(g, smooth([[0, 960], [350, 880], [800, 940], [1200, 860], [1500, 920], [1500, 1100], [0, 1100]])); g.fill();
    g.fillStyle = '#8AA06E'; g.beginPath(); trace(g, smooth([[0, 1080], [500, 1010], [1000, 1060], [1500, 1000], [1500, 1920], [0, 1920]])); g.fill();
    g.fillStyle = '#7A7268'; g.beginPath(); trace(g, smooth([[1000, 1200], [1080, 1080], [1260, 1060], [1360, 1200]], true, 4)); g.fill();
  }, 38, 0.55);
  function s15(ctx, t, E) {
    const td = on2s(t), run = t >= E.run && t < E.safe, safe = t >= E.safe;
    ctx.save(); ctx.translate(-200 - 10 * t, 0); ctx.drawImage(pasture(), 0, 0); ctx.restore();
    sunRays(ctx, t, { x: 860, y: 800, ang: -0.9, len: 1600, n: 5, width: 120, color: '255,236,190', alpha: 0.2 });
    // rebanho
    [[160, 1540, 0.62], [340, 1600, 0.7], [520, 1520, 0.58], [260, 1700, 0.8]].forEach(([x, y, s], i) => sheep(ctx, x + 6 * Math.sin(td + i), y, s, td, i % 2 === 1, 0));
    const stray = clamp((td - E.stray) / 3.0); if (!safe) sheep(ctx, lerp(640, 900, stray), 1480 - 30 * stray, 0.55, td, false, td * stray);
    // sombra do leão na colina
    const sh = ss((t - E.shadow) / 0.6) * (safe ? 0 : 1); if (sh > 0) { ctx.save(); ctx.globalAlpha = sh; drawBigCat(ctx, 'lion', { x: 820, y: 1270, s: 0.55, flip: true, tail: td, headRot: -4 }, td, { dark: 'rgba(36,22,42,1)', rim: '#FFE2C0', rimDx: 5, rimDy: -5 }); ctx.restore(); }
    if (run) { const rk = clamp((t - E.run) / 1.4); robeFigure(ctx, { x: lerp(420, 980, rk), y: 1640, s: 0.9, t: td, pose: 'run', staff: false, rim: GOLD }); const dust = clamp((t - E.run - 1.0) / 0.6); if (dust > 0) for (let i = 0; i < 9; i++) { ctx.fillStyle = `rgba(230,214,190,${0.7 * (1 - dust * 0.5)})`; ctx.beginPath(); ctx.arc(900 + rnd(211, i) * 200 - 100, 1300 + rnd(212, i) * 160, 60 + 60 * dust, 0, 6.283); ctx.fill(); } }
    else if (!safe) robeFigure(ctx, { x: 420, y: 1640, s: 0.9, t: td, pose: 'stand', staff: true, rim: GOLD, flip: t > E.shadow });
    else robeFigure(ctx, { x: 540, y: 1660, s: 1.05, t: td, pose: 'stand', lamb: true, rim: '#FFF2C8' });
    vignette(ctx, '50,30,40', 0.28);
    if (t > E.page - 0.6) { const k = sm((t - E.page + 0.6) / 1.0); ctx.save(); ctx.fillStyle = '#F3E6CC'; ctx.globalAlpha = k; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
  // ======================================================== CENA 16 — Benaia
  const snowland = () => cachedPainted('s16snow', 1500, 1920, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#8E9AB8'], [0.45, '#D8E0EC'], [0.5, '#EEF2F8'], [1, '#C8D2E2']]); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 12; i++) { const x = rnd(221, i) * w, y = 860 + rnd(222, i) * 60; g.fillStyle = '#6E7A90'; g.beginPath(); g.moveTo(x, y - 200); g.lineTo(x + 70, y); g.lineTo(x - 70, y); g.fill(); g.fillStyle = '#F6F8FC'; g.beginPath(); g.moveTo(x, y - 200); g.lineTo(x + 30, y - 120); g.lineTo(x - 30, y - 120); g.fill(); }
    g.fillStyle = '#E8EDF5'; g.beginPath(); trace(g, smooth([[0, 960], [500, 900], [1000, 950], [1500, 900], [1500, 1920], [0, 1920]])); g.fill();
  }, 39, 0.5);
  function snowfall(ctx, t, n = 70, gold = 0) { ctx.save(); for (let i = 0; i < n; i++) { const x = (rnd(231, i) * 1200 + Math.sin(t * 0.7 + i) * 30) % 1200 - 60, y = (rnd(232, i) * 2000 + t * (60 + 40 * rnd(233, i))) % 2000 - 40, r = 3 + rnd(234, i) * 6; ctx.fillStyle = gold > 0 ? `rgba(255,${lerp(255, 214, gold) | 0},${lerp(255, 140, gold) | 0},${0.9})` : 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(x, y, r * (1 + gold * 0.6), 0, 6.283); ctx.fill(); } ctx.restore(); }
  function s16(ctx, t, E) {
    const td = on2s(t);
    if (t < E.pit) {
      ctx.save(); ctx.translate(-200, 0); ctx.drawImage(snowland(), 0, 0); ctx.restore();
      ctx.fillStyle = '#7A7E8A'; ctx.beginPath(); ctx.ellipse(700, 1420, 230, 70, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#5E6270'; for (let a = 0; a < 6.28; a += 0.5) { ctx.beginPath(); ctx.ellipse(700 + Math.cos(a) * 210, 1420 + Math.sin(a) * 62, 40, 22, a, 0, 6.283); ctx.fill(); } ctx.fillStyle = '#14101E'; ctx.beginPath(); ctx.ellipse(700, 1420, 170, 44, 0, 0, 6.283); ctx.fill();
      robeFigure(ctx, { x: lerp(160, 420, clamp((t - E.walk) / 3.4)), y: 1500, s: 0.85, t: td, pose: t < E.roar ? 'walk' : 'stand', hair: 'helmet', spear: true, cloak: true, rim: '#E8F0FF', rimDir: [1, -0.4] });
      if (t >= E.roar) { ctx.save(); ctx.strokeStyle = 'rgba(30,24,40,0.7)'; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { const k = ((t - E.roar) * 1.2 + i / 3) % 1; ctx.globalAlpha = 1 - k; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(700, 1400, 200 + 300 * k, 60 + 90 * k, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } ctx.restore(); }
      snowfall(ctx, t);
    } else if (t < E.shadows) {   // olhando para dentro da cisterna: o leão lá embaixo; Benaia desce
      ctx.fillStyle = '#1E1A2A'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#5E6270'; ctx.beginPath(); ctx.arc(540, 960, 760, 0, 6.283); ctx.arc(540, 960, 520, 0, 6.283, true); ctx.fill();
      ctx.fillStyle = 'rgba(200,210,230,0.25)'; ctx.beginPath(); ctx.arc(540, 960, 520, 0, 6.283); ctx.fill();
      drawBigCat(ctx, 'lion', { x: 400, y: 1180, s: 0.6, headRot: -20, jaw: bell(td, E.pit + 0.6, 0.4) * 0.6, tail: td }, td, { dark: 'rgba(30,18,30,1)', rim: '#9AA8C8', rimDx: 5, rimDy: -5 });
      const dk = clamp((t - E.descend) / 0.9); if (dk > 0) robeFigure(ctx, { x: 700, y: lerp(560, 1260, dk), s: 0.55, t: td, pose: 'stand', hair: 'helmet', spear: true, cloak: true, rim: '#E8F0FF' });
      snowfall(ctx, t, 30);
    } else {   // sombras nas paredes de pedra (o combate só sugerido)
      ctx.fillStyle = '#4A4656'; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 40; i++) { ctx.fillStyle = i % 2 ? '#56526A' : '#423E50'; ctx.beginPath(); ctx.ellipse(rnd(241, i) * W, rnd(242, i) * H, 90, 50, 0, 0, 6.283); ctx.fill(); }
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = radial(ctx, 540, 300, 50, 900, [[0, 'rgba(220,230,255,0.45)'], [1, 'rgba(220,230,255,0)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
      const f = Math.floor(td * 12), wob = Math.sin(td * 9), [lc, lg] = layer('s16sh');
      robeFigure(lg, { x: 420 + 60 * wob, y: 1500, s: 1.3, t: td, pose: 'stand', hair: 'helmet', spear: true, cloak: true, color: 'rgba(10,8,16,1)', arms: [[-30 + 40 * wob, -0.4], [-10, -0.6]] });
      drawBigCat(lg, 'lion', { x: 700 - 80 * wob, y: 1500, s: 1.0, flip: true, jaw: 0.4 + 0.3 * rnd(f, 1), headRot: -10 + 20 * wob, tail: td }, td, { dark: 'rgba(10,8,16,1)' });
      ctx.save(); ctx.globalAlpha = 0.75; ctx.filter = 'blur(10px)'; ctx.setTransform(1, 0, -0.18, 1, 160, -80); ctx.drawImage(lc, 0, 0); ctx.restore();
      if (t > E.lights) { snowfall(ctx, t, 60, clamp((t - E.lights) / 0.8)); }
    }
    vignette(ctx, '20,20,40', 0.35);
  }
  CENAS.s13 = { draw: s13, capY: (t) => 1390, sfx: (E) => [] };
  CENAS.s14 = { capY: () => 760, draw: s14, ui: (ctx, t, E) => bibleRef(ctx, t, 1.0, E.page - 0.4, 'Juízes 14:5–6'), sfx: (E) => [['ROAR!', E.lion + 0.2, 0.5, 780, 900, 170, 0.08]], blur: (t, E) => t >= E.fight && t < E.won };
  CENAS.s15 = { capY: () => 760, draw: s15, ui: (ctx, t, E) => bibleRef(ctx, t, 1.0, E.page - 0.4, '1 Samuel 17:34–37'), sfx: (E) => [] };
  CENAS.s16 = { capY: () => 760, draw: s16, ui: (ctx, t, E) => bibleRef(ctx, t, 1.0, 12.6, '2 Samuel 23:20'), sfx: (E) => [['GRRR...', E.roar, 0.7, 760, 1200, 130, 0.06]] };
})();
