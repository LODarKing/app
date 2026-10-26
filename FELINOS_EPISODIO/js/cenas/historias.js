// Cenas 14–16 (refeitas) — Sansão (Jz 14:5–6), Davi (1Sm 17:34–37), Benaia (2Sm 23:20).
// Cenários pintados em camadas com parallax, personagens pintados (figuras.js), leões pintados com luz da cena,
// câmera que acompanha e aproxima, poeira, luz e partículas. Confrontos heroicos e sem violência gráfica.
'use strict';
(() => {
  const GOLD = '#FFE2A8';
  // ---------------------------------------------------------------- utilidades
  /** câmera: desenha a cena numa camada e aplica zoom em torno de (fx, fy) — o enquadramento muda sem refazer a arte */
  function camera(ctx, z, fx, fy, draw, shake = [0, 0]) {
    if (Math.abs(z - 1) < 1e-3 && !shake[0] && !shake[1]) { draw(ctx); return; }
    const [c, g] = layer('histCam'); draw(g);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(fx + shake[0], fy + shake[1]); ctx.scale(z, z); ctx.translate(-fx, -fy); ctx.drawImage(c, 0, 0); ctx.restore();
  }
  /** nuvens de poeira que se abrem e somem (determinístico) */
  function dust(ctx, t, t0, x, y, o = {}) {
    const { n = 10, seed = 1, spread = 220, rise = 120, dur = 1.4, col = '214,190,150', a = 0.65, size = 60 } = o, k = (t - t0) / dur; if (k <= 0 || k >= 1) return;
    ctx.save();
    for (let i = 0; i < n; i++) { const ang = rnd(seed, i) * Math.PI - Math.PI, sp = 0.4 + 0.6 * rnd(seed + 1, i), e = easeOut(k);
      const px = x + Math.cos(ang) * spread * sp * e, py = y + Math.sin(ang) * rise * sp * e * 0.6 - rise * 0.4 * e, r = size * (0.5 + rnd(seed + 2, i)) * (0.6 + e);
      ctx.fillStyle = radial(ctx, px, py, 0, r, [[0, `rgba(${col},${a * (1 - k)})`], [1, `rgba(${col},0)`]]); ctx.beginPath(); ctx.arc(px, py, r, 0, 6.283); ctx.fill(); }
    ctx.restore();
  }
  /** leão desenhado numa camada e girado (empinado, saltando) */
  function lionRot(ctx, kind, pose, t, look, ang, px, py) {
    const [c, g] = layer('histLion'); drawBigCat(g, kind, pose, t, look);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(px, py); ctx.rotate(ang); ctx.translate(-px, -py); ctx.drawImage(c, 0, 0); ctx.restore();
  }
  /** virada de página: a folha atual se curva da direita para a esquerda e mostra o verso (papel) */
  function pageTurn(ctx, k) {
    if (k <= 0) return; k = Math.min(1, k);
    const x = lerp(W + 40, -W * 0.9, sm(k)), curl = 180 + 220 * Math.sin(Math.PI * k);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    // a parte já virada (verso da página) cobre o quadro da direita para a esquerda
    ctx.fillStyle = '#F3E6CC'; ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(x, 0); ctx.quadraticCurveTo(x - curl * 0.4, H * 0.5, x + 120, H); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.clip(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(cachedPainted('papelVerso', 1080, 1920, (g, w, h) => { g.fillStyle = '#F3E6CC'; g.fillRect(0, 0, w, h); }, 61, 0.7), 0, 0);
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = linear(ctx, x - 40, 0, x + curl, 0, [[0, 'rgba(120,80,40,0.35)'], [0.3, 'rgba(255,250,236,0.4)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
    // sombra projetada pela curva na página de baixo
    ctx.fillStyle = linear(ctx, x - 160, 0, x, 0, [[0, 'rgba(40,20,20,0)'], [1, 'rgba(40,20,20,0.35)']]); ctx.beginPath(); ctx.moveTo(x - 160, 0); ctx.lineTo(x, 0); ctx.quadraticCurveTo(x - curl * 0.4, H * 0.5, x + 120, H); ctx.lineTo(x - 40, H); ctx.fill();
    ctx.restore();
  }
  window.pageTurn = pageTurn;
  const lionLook = (rim = 'rgba(255,230,180,1)', dark = null) => ({ dark, light: { dir: [-1, -0.55], key: 'rgba(255,222,160,0.3)', shade: 'rgba(80,36,60,0.42)', rim, rimW: 5, rimA: 0.85 } });
  const figLight = (rim = 'rgba(255,232,190,1)', dir = [-1, -0.5], key = 'rgba(255,224,170,0.32)', shade = 'rgba(60,30,80,0.42)') => ({ dir, key, shade, rim, rimW: 6, rimA: 0.9 });

  // ================================================================ CENA 14 — Sansão e o leão nas vinhas de Timna
  const vFar = () => cachedPainted('h14far', 1800, 700, (g, w, h) => {
    g.fillStyle = '#C98E78'; g.beginPath(); trace(g, smooth([[0, 300], [300, 200], [600, 260], [900, 170], [1250, 240], [1550, 180], [1800, 250], [1800, 700], [0, 700]])); g.fill();
    g.fillStyle = '#B07A6A'; g.beginPath(); trace(g, smooth([[0, 420], [400, 330], [800, 380], [1200, 320], [1800, 380], [1800, 700], [0, 700]])); g.fill();
    // Timna: muralha e casas de pedra na colina
    g.fillStyle = '#D9B49A'; g.fillRect(980, 250, 420, 90); for (let i = 0; i < 12; i++) { const x = 990 + i * 34, hh = 40 + rnd(301, i) * 50; g.fillStyle = i % 2 ? '#E2C2A6' : '#CFA88E'; g.fillRect(x, 250 - hh, 32, hh); g.fillStyle = '#9E7A68'; g.fillRect(x + 10, 250 - hh + 14, 10, 12); }
    g.fillStyle = '#B88E78'; g.fillRect(970, 240, 440, 14);
    for (let i = 0; i < 26; i++) { const x = rnd(302, i) * w, y = 360 + rnd(303, i) * 200; g.fillStyle = i % 3 ? '#8E8A5E' : '#7A7650'; g.beginPath(); g.ellipse(x, y, 34, 24, 0, 0, 6.283); g.fill(); g.fillStyle = '#6A5244'; g.fillRect(x - 3, y + 14, 6, 22); }   // oliveiras
  }, 41, 0.6);
  const vRows = () => cachedPainted('h14rows', 2600, 520, (g, w, h) => {
    g.fillStyle = '#B68A5E'; g.fillRect(0, 60, w, h);
    for (let r = 0; r < 5; r++) { const y = 80 + r * 92, sc = 0.55 + r * 0.22;
      g.fillStyle = '#8A6640'; g.fillRect(0, y + 30 * sc, w, 7 * sc);
      for (let x = (r % 2) * 40; x < w; x += 70 * sc) { g.fillStyle = r % 2 ? '#6E8A4E' : '#7E9A5A'; g.beginPath(); g.ellipse(x, y, 34 * sc, 26 * sc, 0, 0, 6.283); g.fill(); g.fillStyle = '#5E7A42'; g.beginPath(); g.ellipse(x + 8 * sc, y + 8 * sc, 22 * sc, 14 * sc, 0, 0, 6.283); g.fill(); if (rnd(310 + r, Math.floor(x)) > 0.6) { g.fillStyle = '#6E3E5E'; g.beginPath(); g.arc(x + 10 * sc, y + 16 * sc, 7 * sc, 0, 6.283); g.fill(); } } }
  }, 42, 0.6);
  const vGround = () => cachedPainted('h14ground', 2600, 560, (g, w, h) => {
    g.fillStyle = '#C8A276'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#D8B88A'; g.beginPath(); trace(g, smooth([[0, 120], [w, 100], [w, 330], [0, 360]])); g.fill();   // caminho
    for (let i = 0; i < 90; i++) { const x = rnd(320, i) * w, y = rnd(321, i) * h; g.fillStyle = i % 3 ? 'rgba(150,110,70,0.5)' : 'rgba(240,220,180,0.5)'; g.beginPath(); g.ellipse(x, y, 6 + rnd(322, i) * 14, 4 + rnd(323, i) * 6, 0, 0, 6.283); g.fill(); }
    for (let i = 0; i < 160; i++) { const x = rnd(324, i) * w, y = (rnd(325, i) > 0.5 ? 20 + rnd(326, i) * 80 : 380 + rnd(327, i) * 160); g.strokeStyle = i % 2 ? '#8E9A5A' : '#A8A866'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y + 30); g.quadraticCurveTo(x + 4, y + 10, x + (rnd(328, i) - 0.5) * 20, y - 10 - rnd(329, i) * 20); g.stroke(); }
  }, 43, 0.55);
  const vFG = () => cachedPainted('h14fg', 2600, 420, (g, w, h) => {
    for (let i = 0; i < 40; i++) { const x = i * 68 + rnd(330, i) * 30, y = 120 + rnd(331, i) * 200; leafShape(g, x, y, 150 + rnd(332, i) * 60, 60, -1.2 - rnd(333, i) * 0.8, i % 2 ? '#5E7A42' : '#6E8A4E', '#4A6234', 0.01, 3300 + i); if (rnd(334, i) > 0.7) { g.fillStyle = '#5E3454'; for (let k = 0; k < 7; k++) { g.beginPath(); g.arc(x + 20 + (k % 3) * 14, y + 40 + Math.floor(k / 3) * 14, 9, 0, 6.283); g.fill(); } } }
  }, 44, 0.6);
  function vineyardSet(ctx, t, scroll) {
    ctx.fillStyle = linear(ctx, 0, 0, 0, 1100, [[0, '#7E6A9E'], [0.4, '#E8A47E'], [0.75, '#F8D29A'], [1, '#F2C48E']]); ctx.fillRect(0, 0, W, 1200);
    ctx.fillStyle = radial(ctx, 860, 860, 20, 420, [[0, 'rgba(255,246,214,0.95)'], [0.25, 'rgba(255,226,170,0.55)'], [1, 'rgba(255,210,150,0)']]); ctx.fillRect(0, 300, W, 900);
    ctx.fillStyle = '#FFF2D0'; ctx.beginPath(); ctx.arc(860, 880, 70, 0, 6.283); ctx.fill();
    cloudsDrift(ctx, t, { y0: 120, y1: 520, n: 4, speed: 10, wrap: 1900, x0: -500, alpha: 0.75 });
    ctx.drawImage(vFar(), -200 - scroll * 0.15, 720);
    ctx.drawImage(vRows(), -300 - scroll * 0.45, 1060);
    ctx.drawImage(vGround(), -300 - scroll, 1440);
    sunRays(ctx, t, { x: 860, y: 860, ang: -1.25, len: 1500, n: 5, width: 110, alpha: 0.16 });
  }
  function s14(ctx, t, E) {
    const td = on2s(t), S = 0.6, v = 210 * S / (0.6 / 0.9);   // velocidade do corpo que casa com a passada (sem patinar)
    const walking = t < E.lion, wt = Math.min(t, E.lion), sx = 300 + 32 * wt, scroll = v * wt - 32 * wt;   // Sansão na tela; o chão rola o resto
    const spirit = ss((t - E.spirit) / 0.9), won = t >= E.won, fightK = clamp((t - E.fight) / (E.won - E.fight));
    let shake = [0, 0]; const sh = (t0, a) => { const d = t - t0; if (d > 0 && d < 0.5) { shake[0] += Math.sin(d * 80) * a * (1 - d / 0.5); shake[1] += Math.cos(d * 67) * a * 0.6 * (1 - d / 0.5); } };
    sh(E.lion + 0.6, 14); sh(E.fight + 0.8, 18); sh(E.fight + 2.4, 12);
    // enquadramento: plano aberto acompanhando; aproxima no rugido; close no Espírito; abre na vitória
    const z = t < E.lion ? 1 : t < E.spirit ? lerp(1, 1.12, ss((t - E.lion) / 1.5)) : t < E.fight ? lerp(1.12, 1.3, ss((t - E.spirit) / 1.4)) : t < E.won ? 1.18 : lerp(1.2, 1.04, ss((t - E.won) / 2.5));
    const fx = t < E.spirit ? 560 : t < E.fight ? 420 : 520, fy = 1300;
    camera(ctx, z, fx, fy, (g) => {
      vineyardSet(g, t, scroll);
      // a luz do Espírito: raios dourados do alto e partículas subindo em volta de Sansão
      if (spirit > 0) { lightBeam(g, sx + 20, spirit * (won ? 0.9 : 1), 260); sunRays(g, t, { x: sx + 20, y: -200, ang: 0.02, len: 2000, n: 4, width: 90, alpha: 0.22 * spirit }); motes(g, t, [sx - 260, 900, 520, 700], { n: 28, seed: 141, color: '255,236,180', size: 4, alpha: 0.85 * spirit, drift: [2, -60] }); }
      const lionX = walking ? 1400 : t < E.lion + 0.6 ? lerp(1300, 800, easeOut((t - E.lion) / 0.6)) : t < E.fight ? 800 : 800;
      const lionY = t < E.lion + 0.6 && !walking ? 1590 - 240 * Math.sin(Math.PI * clamp((t - E.lion) / 0.6)) : 1590;
      const roar = bell(td, E.lion + 0.75, 0.45) + 0.6 * bell(td, E.spirit - 0.6, 0.3);
      // leão (antes da luta)
      if (!walking && t < E.fight) {
        if (t < E.lion + 0.6) lionRot(g, 'lion', { x: lionX, y: lionY, s: 0.62, flip: true, walk: 0.3, moving: 1, gait: 'gallop', jaw: 0.7, tail: td }, td, lionLook(), -0.18, lionX, lionY);
        else drawBigCat(g, 'lion', { x: lionX + 10 * Math.sin(td * 1.3), y: lionY, s: 0.62, flip: true, lie: 0.25 + 0.15 * spirit, jaw: roar, headRot: -8 + 10 * spirit, tail: td * 1.6, blink: 0 }, td, lionLook());
        dust(g, t, E.lion + 0.55, 820, 1590, { seed: 142, n: 9 });
      }
      // a luta (sem violência gráfica): o leão salta, Sansão o segura no alto, contraluz dourado e poeira
      if (t >= E.fight && t < E.won) {
        const backlit = 'rgba(40,18,24,0.5)';
        g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = radial(g, 470, 1200, 40, 900, [[0, `rgba(255,236,190,${0.55 * ss(fightK * 3)})`], [1, 'rgba(255,236,190,0)']]); g.fillRect(0, 0, W, H); g.restore();
        if (t < E.fight + 0.8) { const k = (t - E.fight) / 0.8; lionRot(g, 'lion', { x: lerp(800, 560, k), y: 1590 - 260 * Math.sin(Math.PI * k), s: 0.62, flip: true, walk: 0.3, moving: 1, gait: 'gallop', jaw: 0.8, tail: td }, td, lionLook('rgba(255,240,200,1)', backlit), -0.35 * Math.sin(Math.PI * k), lerp(800, 560, k), 1500); }
        else if (t < E.won - 0.8) { const w = Math.sin(td * 7) * 0.05; lionRot(g, 'lion', { x: 640, y: 1590, s: 0.62, flip: true, walk: 0.15, moving: 0.4, jaw: 0.5, headRot: -10, tail: td * 2 }, td, lionLook('rgba(255,240,200,1)', backlit), 0.95 + w, 770, 1590); }
        dust(g, t, E.fight + 0.75, 520, 1600, { seed: 143, n: 12, spread: 320, a: 0.7 }); dust(g, t, E.fight + 2.2, 520, 1580, { seed: 144, n: 14, spread: 380, a: 0.8, dur: 1.6, size: 90 });
      }
      // Sansão
      const pose = walking ? 'walk' : t < E.fight ? (t < E.spirit ? 'brace' : 'stand') : t < E.fight + 0.8 ? 'brace' : t < E.won ? 'lift' : 'stand';
      bibFigure(g, 'sansao', { x: walking ? sx : t < E.fight ? sx : t < E.won ? sx + 60 : sx + 40, y: 1610, s: S, t: td, pose, ph: wt * 0.9, wind: 0.25 + 1.3 * spirit * (won ? 0.4 : 1), look: won ? 8 : t >= E.spirit ? -6 : 0,
        light: figLight(spirit > 0.2 ? 'rgba(255,244,214,1)' : 'rgba(255,226,180,1)', [-0.8, -0.6], spirit > 0.2 ? 'rgba(255,230,180,0.4)' : 'rgba(255,224,170,0.3)', t >= E.fight && t < E.won ? 'rgba(40,18,30,0.55)' : 'rgba(60,30,80,0.42)'), arms: won ? [[100, 95], [80, 70]] : null });
      // depois: poeira assentando; o leão vencido fica deitado, quieto, atrás do capim
      if (won) { drawBigCat(g, 'lion', { x: 860, y: 1640, s: 0.58, flip: true, lie: 1, blink: 1, headRot: 18, tail: 0 }, 0, lionLook('rgba(255,236,200,1)', 'rgba(60,40,40,0.25)')); dust(g, t, E.won - 0.3, 600, 1600, { seed: 145, n: 12, spread: 420, a: 0.55, dur: 2.2, size: 110 }); }
      g.drawImage(vFG(), -300 - scroll * 1.35, 1740);
      vignette(g, '50,24,30', 0.32);
    }, shake);
    if (t >= E.fight + 2.25 && t < E.fight + 3.0) { const k = clamp((t - E.fight - 2.25) / 0.2) * (1 - clamp((t - E.fight - 2.45) / 0.5)); ctx.fillStyle = `rgba(255,246,222,${0.55 * k})`; ctx.fillRect(0, 0, W, H); }   // clarão da vitória
    pageTurn(ctx, (t - E.page) / 1.0);
  }

  // ================================================================ CENA 15 — Davi, o pastor
  const pFar = () => cachedPainted('h15far', 1800, 760, (g, w, h) => {
    g.fillStyle = '#A99AC0'; g.beginPath(); trace(g, smooth([[0, 260], [300, 160], [700, 220], [1100, 140], [1500, 210], [1800, 170], [1800, 760], [0, 760]])); g.fill();
    g.fillStyle = '#9CB088'; g.beginPath(); trace(g, smooth([[0, 420], [500, 330], [900, 400], [1300, 320], [1800, 380], [1800, 760], [0, 760]])); g.fill();
    g.fillStyle = '#C9C2A6'; for (let i = 0; i < 9; i++) { const x = 1150 + i * 26, hh = 18 + rnd(351, i) * 24; g.fillRect(x, 300 - hh, 22, hh); }   // Belém ao longe
    for (let i = 0; i < 18; i++) { const x = rnd(352, i) * w, y = 420 + rnd(353, i) * 260; g.fillStyle = '#7E9468'; g.beginPath(); g.ellipse(x, y, 30, 22, 0, 0, 6.283); g.fill(); }
  }, 45, 0.6);
  const pGround = () => cachedPainted('h15ground', 2200, 900, (g, w, h) => {
    g.fillStyle = '#8EA66E'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#9EB47A'; g.beginPath(); trace(g, smooth([[0, 60], [700, 20], [1500, 70], [2200, 30], [2200, 300], [0, 340]])); g.fill();
    // rochedo (onde o leão se esconde)
    for (let i = 0; i < 260; i++) { const x = rnd(354, i) * w, y = 60 + rnd(355, i) * (h - 60); g.strokeStyle = i % 2 ? '#7A9460' : '#A8BC80'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y + 26); g.quadraticCurveTo(x + 3, y + 8, x + (rnd(356, i) - 0.5) * 18, y - 8 - rnd(357, i) * 18); g.stroke(); }
    for (let i = 0; i < 30; i++) { g.fillStyle = ['#F2E2A6', '#E8B8C8', '#F6F0E2'][i % 3]; g.beginPath(); g.arc(rnd(358, i) * w, 100 + rnd(359, i) * (h - 120), 5, 0, 6.283); g.fill(); }
  }, 46, 0.55);
  const rock = () => cachedPainted('h15rock', 700, 360, (g) => { g.fillStyle = '#8A8274'; g.beginPath(); trace(g, smooth([[30, 350], [90, 170], [260, 60], [470, 90], [620, 200], [690, 350]], true, 5)); g.fill(); g.fillStyle = '#6E685E'; g.beginPath(); trace(g, smooth([[80, 350], [180, 210], [330, 190], [420, 300], [400, 350]], true, 4)); g.fill(); g.fillStyle = '#A29A8A'; g.beginPath(); trace(g, smooth([[260, 80], [420, 96], [520, 170], [380, 150]], true, 4)); g.fill(); for (let i = 0; i < 40; i++) { g.strokeStyle = i % 2 ? '#7A9460' : '#A8BC80'; g.lineWidth = 4; const x = 40 + rnd(381, i) * 640; g.beginPath(); g.moveTo(x, 360); g.quadraticCurveTo(x + 3, 340, x + (rnd(382, i) - 0.5) * 16, 316 - rnd(383, i) * 20); g.stroke(); } }, 49, 0.55);
  function sheepW(ctx, x, y, s, t, flip, walkPh, graze) {   // ovelha que pasta (cabeça desce) ou anda
    sheep(ctx, x, y + (graze ? 0 : 0), s, t, flip, walkPh);
    if (graze) { ctx.save(); ctx.translate(x + (flip ? -1 : 1) * 96 * s, y - 100 * s); ctx.fillStyle = '#8EA66E'; ctx.globalAlpha = 0.0; ctx.restore(); }
  }
  function s15(ctx, t, E) {
    const td = on2s(t), run = t >= E.run && t < E.safe, safe = t >= E.safe, threat = ss((t - E.shadow) / 0.6) * (1 - ss((t - E.safe) / 1.2));
    const z = t < E.shadow ? lerp(1.0, 1.06, t / E.shadow) : t < E.run ? lerp(1.06, 1.2, ss((t - E.shadow) / 1.0)) : t < E.safe ? 1.08 : lerp(1.1, 1.22, ss((t - E.safe) / 4));
    const fx = t < E.shadow ? 540 : t < E.run ? 360 : t < E.safe ? 480 : 380, fy = 1350;
    camera(ctx, z, fx, fy, (g) => {
      g.fillStyle = linear(g, 0, 0, 0, 1150, [[0, '#9E8EC4'], [0.45, '#F6B8A0'], [0.8, '#FCE2B0'], [1, '#FFF0C8']]); g.fillRect(0, 0, W, 1200);
      const sunY = lerp(1000, 900, clamp(t / 13)); g.fillStyle = radial(g, 820, sunY, 10, 380, [[0, 'rgba(255,248,220,1)'], [0.2, 'rgba(255,236,190,0.6)'], [1, 'rgba(255,220,170,0)']]); g.fillRect(0, 400, W, 900);
      cloudsDrift(g, t, { y0: 140, y1: 560, n: 4, speed: 8, wrap: 1900, x0: -500, alpha: 0.7 });
      g.drawImage(pFar(), -250 - t * 4, 820);
      // névoa da manhã
      g.fillStyle = linear(g, 0, 1080, 0, 1260, [[0, 'rgba(255,240,230,0)'], [0.5, 'rgba(255,240,230,0.45)'], [1, 'rgba(255,240,230,0)']]); g.fillRect(0, 1080, W, 180);
      g.drawImage(pGround(), -300 - t * 8, 1180);
      sunRays(g, t, { x: 820, y: sunY, ang: -1.2, len: 1500, n: 5, width: 110, alpha: 0.18 });
      // nuvem passa e escurece o pasto quando o leão aparece
      if (threat > 0) { g.fillStyle = `rgba(60,50,90,${0.28 * threat})`; g.fillRect(0, 0, W, H); }
      // o leão espreita atrás do rochedo (à esquerda) e depois recua
      if (t < E.shadow - 0.2) g.drawImage(rock(), -90 - t * 8, 1210);
      if (t >= E.shadow - 0.2) {
        const back = ss((t - E.safe - 0.4) / 1.6), peek = ss((t - E.shadow) / 0.8);
        drawBigCat(g, 'lion', { x: lerp(-60, 250, peek) - 300 * back, y: 1400, s: 0.52, flip: back > 0.05 ? true : false, lie: 0.3 * (1 - back), walk: td * 0.8, moving: back > 0.05 ? 1 : 0.15, headRot: 6, jaw: 0.25 * bell(td, E.shadow + 1.0, 0.4), tail: td * 1.5 }, td, lionLook('rgba(255,226,200,1)'));
        g.drawImage(rock(), -90 - t * 8, 1210);   // o rochedo na frente do leão
      }
      // rebanho pastando (à direita); um cordeiro se afasta para a esquerda
      [[640, 1500, 0.5, 1], [780, 1560, 0.56, 0], [900, 1500, 0.48, 1], [700, 1640, 0.62, 0], [960, 1640, 0.6, 1]].forEach(([x, y, s, f], i) => sheep(g, x + 5 * Math.sin(td * 0.7 + i), y, s, td, !!f, 0));
      const stray = clamp((t - E.stray) / 2.6), lambX = safe ? null : lerp(560, 300, sm(stray)); if (lambX != null) sheep(g, lambX, 1560 - 30 * stray, 0.4, td, true, stray > 0 && stray < 1 ? td : 0);
      // Davi: observa o rebanho, vira, corre até o cordeiro e o pega no colo
      const rk = clamp((t - E.run) / (E.safe - E.run)), dx = !run && !safe ? 820 : run ? lerp(820, 370, sm(rk)) : 360;
      if (safe) bibFigure(g, 'davi', { x: dx, y: 1690, s: 0.62, t: td, pose: 'stand', hold: 'lamb', face: 1, look: 10, light: figLight('rgba(255,240,206,1)') });
      else bibFigure(g, 'davi', { x: dx, y: 1690, s: 0.62, t: td, pose: run ? 'run' : 'stand', ph: run ? (t - E.run) * 1.6 : 0, hold: run ? null : 'staff', face: t > E.shadow - 0.3 ? -1 : 1, wind: run ? 0.8 : 0.25, look: t > E.stray && t < E.shadow ? 6 : 0, light: figLight() });
      if (run) dust(g, t, E.run + 0.2, 720, 1690, { seed: 151, n: 8, spread: 160, a: 0.45, col: '200,190,150' });
      if (safe) { motes(g, t, [180, 1000, 520, 700], { n: 20, seed: 152, color: '255,240,200', alpha: 0.7, drift: [4, -30] }); lightBeam(g, 380, 0.5 * ss((t - E.safe) / 1.2), 240); }
      vignette(g, '50,30,50', 0.3);
    });
    pageTurn(ctx, (t - E.page) / 1.0);
  }

  // ================================================================ CENA 16 — Benaia na cisterna, num dia de neve
  const sFar = () => cachedPainted('h16far', 1800, 760, (g, w, h) => {
    g.fillStyle = '#9AA6C0'; g.beginPath(); trace(g, smooth([[0, 300], [260, 120], [520, 260], [800, 90], [1100, 240], [1400, 110], [1800, 260], [1800, 760], [0, 760]])); g.fill();
    g.fillStyle = '#F2F5FA'; [[260, 120], [800, 90], [1400, 110]].forEach(([x, y]) => { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 90, y + 90); g.lineTo(x + 40, y + 80); g.lineTo(x, y + 110); g.lineTo(x - 50, y + 84); g.lineTo(x - 100, y + 96); g.fill(); });
    g.fillStyle = '#C8D2E2'; g.beginPath(); trace(g, smooth([[0, 440], [500, 380], [1000, 430], [1800, 370], [1800, 760], [0, 760]])); g.fill();
    for (let i = 0; i < 30; i++) { const x = rnd(361, i) * w, y = 400 + rnd(362, i) * 120; g.fillStyle = '#7A8698'; g.beginPath(); g.moveTo(x, y - 70); g.lineTo(x + 26, y); g.lineTo(x - 26, y); g.fill(); g.fillStyle = '#F2F5FA'; g.beginPath(); g.moveTo(x, y - 70); g.lineTo(x + 12, y - 40); g.lineTo(x - 12, y - 40); g.fill(); }
  }, 47, 0.5);
  const sGround = () => cachedPainted('h16ground', 2400, 800, (g, w, h) => {
    g.fillStyle = '#E8EDF5'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { const x = rnd(363, i) * w, y = rnd(364, i) * h; g.fillStyle = i % 2 ? 'rgba(170,186,214,0.35)' : 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(x, y, 30 + rnd(365, i) * 90, 8 + rnd(366, i) * 16, 0, 0, 6.283); g.fill(); }
  }, 48, 0.4);
  function snowfall(ctx, t, n = 80, gold = 0, rect = [0, 0, W, H], a = 0.9) { ctx.save(); const [X, Y, Wd, Hd] = rect; for (let i = 0; i < n; i++) { const x = X + ((rnd(231, i) * Wd + Math.sin(t * 0.7 + i) * 30 + t * 18) % Wd), y = Y + ((rnd(232, i) * Hd + t * (70 + 50 * rnd(233, i))) % Hd), r = 3 + rnd(234, i) * 6; ctx.fillStyle = gold > 0 ? `rgba(255,${lerp(255, 222, gold) | 0},${lerp(255, 150, gold) | 0},${a})` : `rgba(255,255,255,${a})`; ctx.beginPath(); ctx.arc(x, y, r * (1 + gold * 0.5), 0, 6.283); ctx.fill(); } ctx.restore(); }
  const cistern = (g, cx, cy, sc) => { g.fillStyle = '#7A7E8C'; g.beginPath(); g.ellipse(cx, cy, 250 * sc, 74 * sc, 0, 0, 6.283); g.fill(); for (let a = 0; a < 6.28; a += 0.42) { g.fillStyle = a % 0.84 < 0.42 ? '#8A8E9C' : '#6A6E7C'; g.beginPath(); g.ellipse(cx + Math.cos(a) * 228 * sc, cy + Math.sin(a) * 66 * sc, 44 * sc, 24 * sc, a, 0, 6.283); g.fill(); g.fillStyle = '#F2F5FA'; g.beginPath(); g.ellipse(cx + Math.cos(a) * 228 * sc, cy + Math.sin(a) * 66 * sc - 14 * sc, 34 * sc, 10 * sc, a, 0, 6.283); g.fill(); } g.fillStyle = '#16121E'; g.beginPath(); g.ellipse(cx, cy, 180 * sc, 46 * sc, 0, 0, 6.283); g.fill(); };
  function s16(ctx, t, E) {
    const td = on2s(t), S = 0.6, v = 210 * S / (0.6 / 0.9);
    if (t < E.pit) {   // caminhada na neve; o rugido vem da cisterna
      const wk = clamp((t - E.walk) / (E.roar - E.walk)), walking = t >= E.walk && t < E.roar, wt = clamp(t - E.walk, 0, E.roar - E.walk), bx = 180 + 28 * wt, scroll = (v - 28) * wt;
      camera(ctx, lerp(1.0, 1.1, ss((t - E.roar) / 1.4)), 640, 1400, (g) => {
        g.fillStyle = linear(g, 0, 0, 0, 1200, [[0, '#7E8AA8'], [0.6, '#C8D0E0'], [1, '#E2E8F2']]); g.fillRect(0, 0, W, 1250);
        g.drawImage(sFar(), -300 - scroll * 0.15, 760);
        g.drawImage(sGround(), -300 - scroll, 1240);
        cistern(g, 1400 - scroll, 1540, 1);
        // pegadas na neve atrás de Benaia (presas ao chão: rolam junto com ele)
        for (let i = 0; i < 16; i++) { const ws = 120 + i * 63 - scroll; if (ws < bx - 50 && ws > -40) { g.fillStyle = 'rgba(150,164,196,0.55)'; g.beginPath(); g.ellipse(ws, 1694 + (i % 2) * 14, 22, 8, 0, 0, 6.283); g.fill(); } }
        bibFigure(g, 'benaia', { x: bx, y: 1700, s: S, t: td, pose: walking ? 'walk' : 'stand', ph: wt * 0.9, hold: 'spear', wind: 0.7, look: t >= E.roar ? 8 : 0, light: figLight('rgba(232,240,255,1)', [1, -0.5], 'rgba(230,236,255,0.28)', 'rgba(40,40,90,0.45)') });
        // respiração no frio
        for (let i = 0; i < 3; i++) { const k = ((t * 0.8 + i / 3) % 1); g.fillStyle = `rgba(255,255,255,${0.35 * (1 - k)})`; g.beginPath(); g.arc(bx + 70 + 60 * k, 1700 - 0.6 * 870 + 20 - 30 * k, 16 + 30 * k, 0, 6.283); g.fill(); }
        if (t >= E.roar) { g.save(); g.strokeStyle = 'rgba(40,36,60,0.6)'; g.lineCap = 'round'; for (let i = 0; i < 3; i++) { const k = ((t - E.roar) * 1.1 + i / 3) % 1; g.globalAlpha = 1 - k; g.lineWidth = 9; g.beginPath(); g.ellipse(1400 - scroll, 1520, 200 + 280 * k, 50 + 80 * k, 0, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); } g.restore(); }
        snowfall(g, t, 90); vignette(g, '30,30,60', 0.3);
      });
    } else if (t < E.shadows) {   // olhando para dentro da cisterna: o leão lá embaixo; Benaia desce pela parede
      camera(ctx, lerp(1.0, 1.12, ss((t - E.pit) / 2.5)), 540, 960, (g) => {
        g.fillStyle = '#E8EDF5'; g.fillRect(0, 0, W, H);
        g.fillStyle = '#6E7280'; g.beginPath(); g.arc(540, 960, 700, 0, 6.283); g.fill();
        for (let a = 0; a < 6.28; a += 0.3) { g.fillStyle = a % 0.6 < 0.3 ? '#7E8290' : '#5E6270'; g.beginPath(); g.ellipse(540 + Math.cos(a) * 610, 960 + Math.sin(a) * 610, 110, 70, a, 0, 6.283); g.fill(); g.fillStyle = '#F2F5FA'; g.beginPath(); g.ellipse(540 + Math.cos(a) * 640, 960 + Math.sin(a) * 640, 90, 26, a + Math.PI / 2, 0, 6.283); g.fill(); }
        g.fillStyle = radial(g, 540, 960, 100, 520, [[0, '#4A4E66'], [1, '#22202E']]); g.beginPath(); g.arc(540, 960, 520, 0, 6.283); g.fill();
        g.fillStyle = 'rgba(220,230,255,0.18)'; g.beginPath(); g.arc(540, 960, 330, 0, 6.283); g.fill();
        drawBigCat(g, 'lion', { x: 420 + 60 * Math.sin(td * 0.9), y: 1130, s: 0.5, flip: Math.cos(td * 0.9) < 0, walk: td * 0.7, moving: 1, headRot: -18, jaw: bell(td, E.pit + 0.5, 0.4) * 0.7, tail: td * 1.4 }, td, lionLook('rgba(200,212,240,1)', 'rgba(30,30,60,0.35)'));
        const dk = clamp((t - E.descend) / 1.0); if (dk > 0) bibFigure(g, 'benaia', { x: 760, y: lerp(560, 1240, sm(dk)), s: 0.42, t: td, pose: dk < 1 ? 'brace' : 'stand', hold: 'spear', face: -1, wind: 0.6, light: figLight('rgba(232,240,255,1)', [0.4, -1], 'rgba(230,236,255,0.3)', 'rgba(30,30,70,0.5)') });
        snowfall(g, t, 50, 0, [0, 0, W, H], 0.85); vignette(g, '20,20,40', 0.4);
      });
    } else {   // dentro da cisterna: sombras nítidas na parede curva de pedra, luz de neve caindo pela abertura
      const lights = ss((t - E.lights) / 1.0);
      camera(ctx, lerp(1.04, 1.12, ss((t - E.shadows) / 4)), 540, 1100, (g) => {
        g.fillStyle = linear(g, 0, 0, 0, H, [[0, '#5A5670'], [0.5, '#4A4660'], [1, '#2E2A3E']]); g.fillRect(0, 0, W, H);
        for (let i = 0; i < 46; i++) { const x = rnd(371, i) * W, y = rnd(372, i) * 1500; g.fillStyle = i % 2 ? 'rgba(110,106,140,0.5)' : 'rgba(40,36,56,0.4)'; g.beginPath(); g.ellipse(x, y, 90 + rnd(373, i) * 60, 46 + rnd(374, i) * 30, 0, 0, 6.283); g.fill(); }
        g.fillStyle = '#3A364C'; g.fillRect(0, 1500, W, 420); g.fillStyle = '#E8EDF5'; g.beginPath(); trace(g, smooth([[0, 1520], [400, 1490], [800, 1530], [1080, 1500], [1080, 1560], [0, 1570]])); g.fill();
        // feixe de luz da abertura (neve caindo nele; fica dourado no fim)
        lightBeam(g, 540, 0.55 + 0.45 * lights, 300);
        // sombras na parede: Benaia firme com a lança, o leão avança e recua; batidas marcadas por pequenos saltos de câmera
        const ph = (t - E.shadows) / (E.lights - E.shadows), beat = Math.floor((t - E.shadows) * 2), lean = Math.sin(beat * 2.1) * 0.6;
        const [sc, sg] = layer('h16sh');
        bibFigure(sg, 'benaia', { x: 360 + 30 * lean, y: 1480, s: 0.95, t: td, pose: lights > 0 ? 'stand' : 'brace', hold: 'spear', wind: 0.8, tag: 'sh', light: { dir: [0, -1], key: 'rgba(0,0,0,0)', shade: 'rgba(0,0,0,0)' } });
        if (lights < 0.9) drawBigCat(sg, 'lion', { x: 790 - 60 * lean, y: 1480, s: 0.82, flip: true, lie: lights * 0.9, jaw: lights > 0 ? 0 : 0.6, headRot: -14 + 10 * lean, tail: td * 2 }, td, {});
        sg.globalCompositeOperation = 'source-in'; sg.fillStyle = 'rgba(16,12,26,1)'; sg.fillRect(0, 0, W, H);
        g.save(); g.globalAlpha = 0.82 * (1 - 0.5 * lights); g.setTransform(1.05, 0, -0.12, 1.02, 120, -60); g.drawImage(sc, 0, 0); g.restore();
        // na luz: Benaia de pé, olhando para o alto; a neve fica dourada
        if (lights > 0) { g.save(); g.globalAlpha = lights; bibFigure(g, 'benaia', { x: 540, y: 1600, s: 0.62, t: td, pose: 'stand', hold: 'spear', look: -14, wind: 0.4, tag: 'luz', light: figLight('rgba(255,236,190,1)', [0, -1], 'rgba(255,230,180,0.4)', 'rgba(40,30,70,0.45)') }); g.restore(); }
        snowfall(g, t, 70, lights, [300, 0, 480, 1600], 0.9);
        vignette(g, '20,16,36', 0.42);
      }, [Math.sin(Math.floor((t - E.shadows) * 2) * 3.1) * 6 * (t < E.lights ? 1 : 0), 0]);
    }
  }

  // ================================================================ CENA 17 — Daniel na cova dos leões (Dn 6:16–23)
  const babylon = () => cachedPainted('h17city', 1500, 900, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#4A3A6E'], [0.45, '#B86E7E'], [0.75, '#F2A878'], [1, '#F6C28E']]); g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,236,190,0.9)'; g.beginPath(); g.arc(980, 640, 70, 0, 6.283); g.fill();
    // zigurate em degraus, muralha, palmeiras
    g.fillStyle = '#6E4A62'; [[700, 640, 520], [760, 560, 400], [820, 480, 280], [880, 400, 160]].forEach(([x, y, ww]) => g.fillRect(x, y, ww, 900));
    g.fillStyle = '#5E3E56'; g.fillRect(0, 700, w, 300); for (let x = 0; x < w; x += 40) g.fillRect(x, 684, 22, 20);
    for (let i = 0; i < 9; i++) { const x = 60 + i * 170 + rnd(391, i) * 40, y = 720; g.strokeStyle = '#4A2E46'; g.lineWidth = 12; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y - 90, x + 4, y - 170); g.stroke(); g.fillStyle = '#4A2E46'; for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.45; g.beginPath(); g.ellipse(x + 4 + Math.cos(a) * 46, y - 170 + Math.sin(a) * 30 + 20, 50, 12, a, 0, 6.283); g.fill(); } }
    for (let i = 0; i < 20; i++) { g.fillStyle = 'rgba(255,214,140,0.85)'; g.fillRect(rnd(392, i) * w, 740 + rnd(393, i) * 120, 10, 14); }
  }, 51, 0.5);
  const denWall = () => cachedPainted('h17den', 1080, 1920, (g, w, h) => {
    g.fillStyle = '#2A2638'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { const x = rnd(394, i) * w, y = 260 + rnd(395, i) * 1400, rw = 70 + rnd(396, i) * 90; g.fillStyle = i % 3 ? 'rgba(70,66,92,0.75)' : 'rgba(40,36,56,0.7)'; g.beginPath(); g.ellipse(x, y, rw, rw * 0.55, 0, 0, 6.283); g.fill(); g.fillStyle = 'rgba(120,116,150,0.25)'; g.beginPath(); g.ellipse(x - rw * 0.2, y - rw * 0.2, rw * 0.6, rw * 0.22, 0, 0, 6.283); g.fill(); }
    g.fillStyle = '#3A3448'; g.fillRect(0, 1640, w, 280); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(90,80,100,0.6)'; g.beginPath(); g.ellipse(rnd(397, i) * w, 1660 + rnd(398, i) * 240, 30, 10, 0, 0, 6.283); g.fill(); }
  }, 52, 0.5);
  function denSet(g, t, sky, stone) {   // cova: abertura no alto com o céu (noite → manhã) e a pedra sendo removida
    g.drawImage(denWall(), 0, 0);
    g.save(); g.beginPath(); g.ellipse(540, 150, 330, 120, 0, 0, 6.283); g.clip();
    g.fillStyle = sky; g.fillRect(0, 0, W, 300);
    g.restore();
    if (stone < 1) { g.fillStyle = '#4E4A5C'; g.beginPath(); g.ellipse(540 + 640 * sm(stone), 150, 340, 128, 0, 0, 6.283); g.fill(); g.fillStyle = 'rgba(120,116,140,0.5)'; g.beginPath(); g.ellipse(500 + 640 * sm(stone), 120, 220, 50, 0, 0, 6.283); g.fill(); }
  }
  function danielStory(ctx, t, E) {
    const td = on2s(t);
    if (t < E.soldiers) {   // oração diante da janela aberta (Dn 6:10), ao entardecer
      camera(ctx, lerp(1.0, 1.1, t / E.soldiers), 600, 1200, (g) => {
        g.fillStyle = '#5A3A52'; g.fillRect(0, 0, W, H);
        g.drawImage(babylon(), -260, 260, 1500, 900);
        // parede com a janela em arco e treliça
        g.fillStyle = '#7A5468'; g.beginPath(); g.rect(0, 0, W, H); g.moveTo(210, 1180); g.lineTo(210, 520); g.quadraticCurveTo(210, 300, 560, 300); g.quadraticCurveTo(910, 300, 910, 520); g.lineTo(910, 1180); g.closePath(); g.fill('evenodd');
        g.strokeStyle = '#5A3A4E'; g.lineWidth = 14; g.beginPath(); g.moveTo(560, 310); g.lineTo(560, 1180); g.moveTo(220, 760); g.lineTo(900, 760); g.stroke();
        g.fillStyle = '#6A4458'; g.fillRect(170, 1180, 780, 40);
        g.fillStyle = '#4A3040'; g.fillRect(0, 1700, W, 220);
        g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = linear(g, 560, 900, 300, 1900, [[0, 'rgba(255,200,140,0.45)'], [1, 'rgba(255,200,140,0)']]); g.beginPath(); g.moveTo(210, 1180); g.lineTo(910, 1180); g.lineTo(1080, 1920); g.lineTo(100, 1920); g.fill(); g.restore();
        bibFigure(g, 'daniel', { x: 470, y: 1760, s: 0.62, t: td, pose: 'pray', face: 1, look: -8, wind: 0.1, light: figLight('rgba(255,214,160,1)', [1, -0.6], 'rgba(255,200,150,0.4)', 'rgba(50,24,60,0.5)') });
        motes(g, t, [210, 400, 700, 1300], { n: 18, seed: 171, color: '255,226,170' });
        vignette(g, '30,14,30', 0.38);
      });
    } else if (t < E.den) {   // os soldados conduzem Daniel pela colunata, à noite, com tochas
      const k = t - E.soldiers, S = 0.56, v = 210 * S / (0.6 / 0.9), scroll = (v - 20) * k;
      ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#1E1A34'], [0.6, '#3A2E4E'], [1, '#2A2236']]); ctx.fillRect(0, 0, W, H);
      ctx.drawImage(babylon(), -300 - scroll * 0.1, 200, 1500, 900); ctx.fillStyle = 'rgba(20,16,40,0.55)'; ctx.fillRect(0, 0, W, 1100);
      for (let i = -1; i < 7; i++) { const x = ((i * 300 - scroll * 1.0) % 2100 + 2100) % 2100 - 300; ctx.fillStyle = '#4A3E56'; ctx.fillRect(x, 300, 110, 1500); ctx.fillStyle = '#5A4C66'; ctx.fillRect(x - 20, 300, 150, 50); ctx.fillRect(x - 20, 1750, 150, 50);
        const fl = 0.85 + 0.15 * Math.sin(t * 13 + i * 2.1); glowSpot(ctx, x + 55, 900, 260 * fl, 'rgba(255,170,90,0.45)'); ctx.fillStyle = '#FFC070'; ctx.beginPath(); ctx.ellipse(x + 55, 880 - 6 * fl, 14, 26 * fl, 0, 0, 6.283); ctx.fill(); }
      ctx.fillStyle = '#2E2638'; ctx.fillRect(0, 1760, W, 160);
      const L = figLight('rgba(255,180,110,1)', [1, -0.4], 'rgba(255,170,100,0.35)', 'rgba(30,20,50,0.5)');
      bibFigure(ctx, 'soldado', { x: 180 + 20 * k, y: 1780, s: S, t: td, pose: 'walk', ph: k * 0.9, hold: 'spear', light: L, tag: 'a' });
      bibFigure(ctx, 'daniel', { x: 470 + 20 * k, y: 1780, s: S, t: td, pose: 'walk', ph: k * 0.9 + 0.33, light: L });
      bibFigure(ctx, 'soldado', { x: 760 + 20 * k, y: 1780, s: S, t: td, pose: 'walk', ph: k * 0.9 + 0.66, hold: 'spear', light: L, tag: 'b' });
      vignette(ctx, '14,10,24', 0.42);
    } else if (t < E.morning) {   // dentro da cova
      const beam = ss((t - E.beam) / 0.9), ang = ss((t - E.angel) / 1.2) * (1 - 0.7 * ss((t - E.night) / 1.6)), calm = ss((t - E.calm) / 1.2), night = ss((t - E.night) / 0.8);
      const z = t < E.beam ? lerp(1.0, 1.08, (t - E.den) / 2.3) : t < E.night ? lerp(1.08, 1.0, ss((t - E.beam) / 2)) : lerp(1.0, 1.1, (t - E.night) / 2.1);
      camera(ctx, z, 540, 1300, (g) => {
        const nk = clamp((t - E.night) / (E.morning - E.night));
        denSet(g, t, linear(g, 0, 0, 0, 300, [[0, '#141A3A'], [1, '#2A3466']]), 0);
        // estrelas e lua na abertura (a lua atravessa durante a noite)
        g.save(); g.beginPath(); g.ellipse(540, 150, 330, 120, 0, 0, 6.283); g.clip(); for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(255,255,240,${0.5 + 0.5 * Math.sin(t * 3 + i)})`; g.beginPath(); g.arc(230 + rnd(401, i) * 620, 50 + rnd(402, i) * 200, 2.5, 0, 6.283); g.fill(); } g.fillStyle = '#F2EAD8'; g.beginPath(); g.arc(320 + 420 * nk, 150 - 40 * Math.sin(Math.PI * nk), 36, 0, 6.283); g.fill(); g.restore();
        // luar azul descendo pela abertura; depois o feixe de luz quente
        g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = linear(g, 540, 150, 540, 1800, [[0, 'rgba(150,170,230,0.35)'], [1, 'rgba(150,170,230,0)']]); g.beginPath(); g.moveTo(260, 150); g.lineTo(820, 150); g.lineTo(1000, 1800); g.lineTo(80, 1800); g.fill(); g.restore();
        lightBeam(g, 540, beam * (1 - 0.5 * night), 260);
        // leões: rondam; depois deitam, de boca fechada, e dormem
        const lions = [['lion', 200, 1640, 0.5, false, 0], ['lioness', 860, 1610, 0.5, true, 1], ['lion', 900, 1800, 0.56, true, 2], ['lioness', 150, 1820, 0.52, false, 3]];
        lions.forEach(([kind, x, y, s, fl, i]) => {
          const pace = (1 - calm) * 70 * Math.sin(td * 0.8 + i * 1.7), facing = calm > 0.5 ? fl : (Math.cos(td * 0.8 + i * 1.7) > 0 ? fl : !fl);
          drawBigCat(g, kind, { x: x + pace, y, s, flip: facing, walk: td * 0.6 + i, moving: (1 - calm) * 0.9, lie: calm, headRot: calm * (14 + night * 10), jaw: (1 - calm) * 0.4 * bell(td, E.den + 0.6 + i * 0.4, 0.4), blink: Math.max(night, calm * 0.5), tail: td * (1 - calm) * 1.4 }, td,
            { dark: `rgba(20,20,50,${0.35 - 0.2 * beam})`, light: { dir: [0, -1], key: beam > 0.2 ? 'rgba(255,230,180,0.3)' : 'rgba(170,190,240,0.25)', shade: 'rgba(20,16,40,0.45)', rim: beam > 0.2 ? 'rgba(255,236,200,1)' : 'rgba(190,206,250,1)', rimW: 5, rimA: 0.8 } });
          if (calm < 0.6) [-1, 1].forEach((sd) => { g.fillStyle = `rgba(230,220,150,${0.6 * (1 - calm / 0.6)})`; g.beginPath(); g.arc(x + pace + (facing ? -1 : 1) * 175 * s * 2 + sd * 6, y - 330 * s, 4, 0, 6.283); g.fill(); });
        });
        // Daniel: de pé, sereno; à noite senta-se e descansa entre os leões
        const dl = figLight(beam > 0.2 ? 'rgba(255,240,206,1)' : 'rgba(190,206,250,1)', [0, -1], beam > 0.2 ? 'rgba(255,230,180,0.35)' : 'rgba(170,190,240,0.25)', 'rgba(20,16,40,0.5)');
        if (t < E.night) bibFigure(g, 'daniel', { x: 520, y: 1720, s: 0.6, t: td, pose: t > E.angel ? 'pray' : 'stand', look: t > E.beam ? -16 : 0, wind: 0.1, light: dl });
        else bibFigure(g, 'daniel', { x: 520, y: 1720, s: 0.6, t: td, pose: 'sit', look: 10, wind: 0.05, light: dl });
        // o anjo: figura de luz serena no feixe (sem asas, sem efeitos fantasiosos)
        if (ang > 0) { holyGlow(g, 760, 1200, 560, ang); bibFigure(g, 'anjo', { x: 760, y: 1700, s: 0.66, t: td, pose: 'float', face: -1, alpha: 0.9 * ang, wind: 0.2, light: { dir: [0, -1], key: 'rgba(255,250,236,0.4)', shade: 'rgba(255,230,190,0.15)', rim: 'rgba(255,255,255,1)', rimW: 8, rimA: 1 } }); motes(g, t, [560, 900, 420, 800], { n: 22, seed: 172, color: '255,244,214', alpha: 0.8 * ang, drift: [2, -24] }); }
        g.fillStyle = `rgba(10,10,30,${0.25 * night * (1 - nk * 0.5)})`; g.fillRect(0, 0, W, H);
        vignette(g, '10,8,24', 0.45);
      });
    } else {   // manhã: a pedra é removida, a luz do sol entra; Daniel ileso, de braços erguidos (Dn 6:19–23)
      const k = (t - E.morning), st = ss(k / 1.4), lit = ss((k - 0.6) / 1.2);
      camera(ctx, lerp(1.06, 1.0, ss(k / 3)), 540, 1200, (g) => {
        denSet(g, t, linear(g, 0, 0, 0, 300, [[0, '#9EC0EE'], [1, '#FCE2B0']]), st);
        g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = `rgba(255,214,150,${0.25 * lit})`; g.fillRect(0, 0, W, H); g.restore();
        lightBeam(g, 540, lit, 330); sunRays(g, t, { x: 540, y: 120, ang: 0, len: 1900, n: 5, width: 120, alpha: 0.2 * lit });
        [['lion', 200, 1660, 0.5, false], ['lioness', 860, 1630, 0.5, true], ['lion', 900, 1810, 0.56, true], ['lioness', 150, 1830, 0.52, false]].forEach(([kind, x, y, s, fl], i) => drawBigCat(g, kind, { x, y, s, flip: fl, lie: 1, headRot: 18, blink: 1, tail: 0 }, 0, { light: { dir: [0, -1], key: 'rgba(255,230,180,0.3)', shade: 'rgba(40,24,40,0.4)', rim: 'rgba(255,236,200,1)', rimW: 5, rimA: 0.7 } }));
        bibFigure(g, 'daniel', { x: 520, y: 1720, s: 0.6, t: td, pose: lit > 0.5 ? 'raise' : 'stand', look: -18, wind: 0.15, light: figLight('rgba(255,246,214,1)', [0, -1], 'rgba(255,236,190,0.45)', 'rgba(40,24,50,0.4)') });
        motes(g, t, [200, 300, 680, 1400], { n: 30, seed: 173, color: '255,240,200', alpha: 0.8 * lit, drift: [3, -18] });
        vignette(g, '40,24,30', 0.3);
      });
    }
  }
  window.danielStory = danielStory;
  CENAS.s14 = { capY: () => 700, draw: s14, ui: (ctx, t, E) => bibleRef(ctx, t, 1.0, E.page - 0.4, 'Juízes 14:5–6'), sfx: (E) => [['ROAR!', E.lion + 0.7, 0.5, 780, 980, 170, 0.08]] };
  CENAS.s15 = { capY: () => 700, draw: s15, ui: (ctx, t, E) => bibleRef(ctx, t, 1.0, E.page - 0.4, '1 Samuel 17:34–37'), sfx: (E) => [] };
  CENAS.s16 = { capY: () => 700, draw: s16, ui: (ctx, t, E) => bibleRef(ctx, t, 1.0, 12.6, '2 Samuel 23:20'), sfx: (E) => [['GRRR...', E.roar, 0.7, 760, 1260, 130, 0.06]] };
})();
