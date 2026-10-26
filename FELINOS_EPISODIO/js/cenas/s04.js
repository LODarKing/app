// Cena 04 — Passos de um caçador (requisito 2: estrutura das patas).
// Ponte (Pingo silencioso, Miguel pisa no galho) -> cochicho -> imagem congela -> página científica: dedos, coxins, garras retráteis,
// 5 dedos na frente / 4 atrás -> Lara -> guepardo (garras pouco retráteis, tração) -> pegada vira pupila.
'use strict';
(() => {
  const PAD = '#E58C9C', PADS = '#C96A7E', FUR = '#F2E6DC', FURS = '#D8C4BC', CLAW = '#F8F1E2', INKC = '#4A2E3E';
  // ---------- cenário: riacho com pontezinha de madeira (vista lateral), em camadas
  const brookBack = () => cachedPainted('s04back', 1400, 1920, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#A9C2A8'], [0.45, '#8DAA8E'], [1, '#5E7E68']]); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 10; i++) { const x = i * 150 + rnd(41, i) * 60; g.fillStyle = '#6E8A76'; g.fillRect(x, 300, 30, 1300); canopy(g, x + 15, 360 + rnd(42, i) * 160, 170, '#93AE92', '#7A9880', 400 + i, 0.01); }
    for (let i = 0; i < 9; i++) canopy(g, i * 170 + rnd(43, i) * 50, 1060 + rnd(44, i) * 40, 110, '#6E9070', '#587A5E', 420 + i, 0.01);
  }, 16, 0.6);
  function water(ctx, t, y0) {
    ctx.fillStyle = linear(ctx, 0, y0, 0, H, [[0, '#7FA9B8'], [1, '#4E7A8E']]); ctx.fillRect(0, y0, W, H - y0);
    ctx.strokeStyle = 'rgba(235,248,255,0.55)'; ctx.lineCap = 'round';
    for (let i = 0; i < 26; i++) { const y = y0 + 30 + (i * 37) % (H - y0 - 40), x = ((rnd(51, i) * 1300 + t * (40 + 30 * rnd(52, i))) % 1300) - 110, L = 40 + rnd(53, i) * 90; ctx.lineWidth = 4 + rnd(54, i) * 4; ctx.globalAlpha = 0.4 + 0.4 * Math.sin(t * 2 + i); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + L / 2, y - 4, x + L, y); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  function bridge(ctx) {
    ctx.fillStyle = '#6E4A40'; ctx.fillRect(-20, 1196, W + 40, 34); ctx.fillStyle = '#8A6250'; ctx.fillRect(-20, 1170, W + 40, 30);
    for (let x = -20; x < W + 40; x += 64) { ctx.fillStyle = (x / 64) % 2 ? '#9A7058' : '#8C6450'; ctx.fillRect(x, 1166, 60, 12); }
    [[90, 1230], [540, 1230], [990, 1230]].forEach(([x, y]) => { ctx.fillStyle = '#5A3A34'; ctx.fillRect(x - 16, y, 32, 400); });
    ctx.strokeStyle = '#7A5444'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-20, 1060); ctx.lineTo(W + 20, 1060); ctx.stroke();
    for (let x = 40; x < W; x += 180) { ctx.fillStyle = '#6E4A40'; ctx.fillRect(x - 8, 1056, 16, 120); }
  }
  function shotBridge(ctx, t) {
    const td = on2s(t), camx = 30 * Math.sin(t * 0.4);
    ctx.save(); ctx.translate(-160 - camx * 0.3, 0); ctx.drawImage(brookBack(), 0, 0); ctx.restore();
    sunRays(ctx, t, { x: 260, y: -80, ang: -0.28, len: 1500, n: 4, width: 110, alpha: 0.18 });
    // Miguel vindo pela trilha ao fundo, na ponta dos pés
    const tip = ss((td - 0.6) / 0.4);
    ctx.fillStyle = '#9A8A66'; ctx.beginPath(); trace(ctx, smooth([[-20, 1000], [400, 980], [800, 1000], [1100, 990], [1100, 1070], [-20, 1080]])); ctx.fill();
    drawPerson(ctx, 'miguel', { x: 760, y: 1030 - 0.32 * 1070 - 8 * Math.abs(Math.sin(td * 3)), s: 0.32, t: td, legs: true, walk: td * 0.8, look: [-6, 6], tilt: -4, armL: { a1: lerp(100, 150, tip), a2: lerp(80, -60, tip), open: 1 }, armR: { a1: lerp(84, 30, tip), a2: lerp(100, -60, tip), open: 1 }, smile: 0.3, brow: 0.4 });
    water(ctx, t, 1260);
    bridge(ctx);
    // Pingo atravessando sem barulho (perfil)
    const px = lerp(120, 760, clamp(td / 2.6)), stop = td > 2.6;
    if (td < 3.0) drawBigCat(ctx, 'pingo', { x: px, y: 1170, s: 0.9, walk: td * 1.2, moving: stop ? 0 : 1, tail: td, headRot: stop ? -8 : 0 }, td, { light: { dir: [-1, -0.6], rim: 'rgba(255,236,196,1)', rimW: 4, rimA: 0.7 } });
    leafShadows(ctx, t, [0, 1000, W, 400], { alpha: 0.12, seed: 6 });
    foliageFG(ctx, t, { x: -60, y: 120, s: 1.2, side: 1, seed: 650, blur: 6 });
    motes(ctx, t, [0, 300, W, 900], { n: 18, seed: 17 });
  }
  /** close: o tênis do Miguel pisa no galho seco */
  function shotCrec(ctx, t) {
    const k = clamp((t - P.crec + 0.25) / 0.25), shake = bell(t, P.crec + 0.03, 0.06) * 14 * Math.sin(t * 90);
    ctx.fillStyle = '#7A6448'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(shake, 0);
    const gd = cachedPainted('s04dirt', 1080, 1920, (g, w, h) => { g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#8A7052'], [1, '#5E4A36']]); g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = i % 2 ? '#9A8060' : '#6E5640'; g.beginPath(); g.ellipse(rnd(61, i) * w, rnd(62, i) * h, 20 + rnd(63, i) * 40, 10 + rnd(64, i) * 14, rnd(65, i), 0, 6.283); g.fill(); } for (let i = 0; i < 14; i++) leafShape(g, rnd(66, i) * w, rnd(67, i) * h, 120, 34, rnd(68, i) * 6, i % 2 ? '#C9965A' : '#B07A44', '#8A5E38', 0.01, 70 + i); }, 17, 0.6);
    ctx.drawImage(gd, 0, 0);
    const snap = t >= P.crec;
    [[-1, 0.25], [1, -0.18]].forEach(([sd, r]) => { ctx.save(); ctx.translate(540 + sd * (snap ? 150 : 2), 1220 + (snap ? 20 : 0)); ctx.rotate(snap ? r : 0); ctx.fillStyle = '#7A5A3E'; ctx.beginPath(); ctx.roundRect(sd > 0 ? 0 : -460, -18, 460, 36, 18); ctx.fill(); ctx.fillStyle = '#9A7A56'; ctx.fillRect(sd > 0 ? 10 : -450, -14, 440, 8); ctx.restore(); });
    // tênis (sapato preto do uniforme) e barra da calça verde
    const fy = lerp(700, 1150, easeIn(k));
    ctx.fillStyle = UNI.green; ctx.fillRect(400, fy - 900, 280, 820); ctx.fillStyle = UNI.greenS; ctx.fillRect(560, fy - 900, 120, 820);
    ctx.fillStyle = UNI.shoe; ctx.beginPath(); trace(ctx, smooth([[360, fy - 100], [700, fy - 110], [780, fy - 30], [770, fy + 40], [380, fy + 50], [330, fy - 20]], true, 4)); ctx.fill();
    ctx.fillStyle = UNI.shoeL; ctx.beginPath(); ctx.ellipse(600, fy - 60, 110, 22, 0, 0, 6.283); ctx.fill();
    if (snap) for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.32, r = 180 + 160 * clamp((t - P.crec) / 0.3); ctx.fillStyle = '#7A5A3E'; ctx.save(); ctx.translate(540 + Math.cos(a) * r, 1200 + Math.sin(a) * r * 0.6); ctx.rotate(a); ctx.fillRect(-16, -4, 32, 8); ctx.restore(); }
    ctx.restore();
  }
  /** Pingo para e olha para trás (de frente, surpreso) */
  function shotLook(ctx, t) {
    const td = on2s(t);
    ctx.save(); ctx.translate(-160, 0); ctx.drawImage(brookBack(), 0, 0); ctx.restore(); water(ctx, t, 1260); bridge(ctx);
    drawPingo(ctx, { x: 640, y: 1176, s: 0.62, dilate: 1, earL: -12, earR: -16, tilt: -10, look: [-8, 0], tail: td, headDy: -8 });
  }
  /** Miguel cochichando (meio corpo, mão na boca) */
  function shotWhisper(ctx, t) {
    const td = on2s(t), talk = voiceL('miguel', t), tb = talkBeats('miguel', t + SCENE_T0);
    ctx.save(); ctx.translate(-260, -200); ctx.scale(1.25, 1.25); ctx.drawImage(brookBack(), 0, 0); ctx.restore();
    ctx.save(); ctx.filter = 'blur(6px)'; ctx.globalAlpha = 0.9; ctx.drawImage(brookBack(), 300, 900, 600, 900, 0, 1000, 1080, 1100); ctx.restore();
    drawPerson(ctx, 'miguel', { x: 520, y: 1100, s: 0.98, t: td, lean: -4, tilt: -6 + 2 * tb.nod, look: [8, 4], mouth: talk * 0.7, smile: 0.3, brow: 0.6 + 0.3 * tb.brow, blink: blinkAt(td, [P.whisper + 1.6]), armL: { a1: 115, a2: -40, open: 1 }, armR: { a1: 95, a2: 70 } });
    leafShadows(ctx, t, [0, 0, W, H], { alpha: 0.1, seed: 12 });
  }
  // ---------- página científica (papel com grade, tinta ameixa, destaques âmbar)
  const sciPaper = () => cachedPainted('s04paper', 1080, 1920, (g, w, h) => {
    g.fillStyle = '#F1E6D6'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(150,120,160,0.22)'; g.lineWidth = 2;
    for (let x = 0; x < w; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  }, 18, 0.5);
  /** sola da pata vista de baixo: coxim principal + dedos (+ esporão na dianteira); squash = amortecimento; claws 0..1 */
  function pawSole(ctx, x, y, s, o = {}) {
    const { squash = 0, glow = 0, claws = 0, front = true, label = null } = o;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 + 0.08 * squash), s * (1 - 0.1 * squash));
    flat(ctx, [[-170, 60], [-180, -60], [-140, -170], [-60, -230], [60, -230], [140, -170], [180, -60], [170, 60], [100, 170], [0, 200], [-100, 170]], FUR, 6);
    ctx.fillStyle = FURS; ctx.beginPath(); ctx.ellipse(40, 40, 150, 150, 0, 0, 6.283); ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1;
    const pad = (pts, c) => flat(ctx, pts, c, 5);
    pad([[-90, 40], [-60, -10], [0, 0], [60, -10], [90, 40], [70, 110], [30, 130], [0, 110], [-30, 130], [-70, 110]], PAD);
    [[-110, -80], [-42, -140], [42, -140], [110, -80]].forEach(([px, py], i) => { pad(ell(px, py, 34, 42, 10, (i - 1.5) * 0.25), PAD); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(px - 8, py - 12, 10, 14, 0, 0, 6.283); ctx.fill();
      if (claws > 0) { ctx.save(); ctx.translate(px * 1.05, py - 44); ctx.rotate((i - 1.5) * 0.25); ctx.fillStyle = CLAW; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.quadraticCurveTo(-4, -50 * claws, 6, -62 * claws); ctx.quadraticCurveTo(8, -30 * claws, 9, 0); ctx.fill(); ctx.restore(); } });
    if (front) pad(ell(-176, 40, 22, 28, 8, 0.3), PAD);   // esporão (5º dedo da pata dianteira)
    if (glow > 0) { ctx.save(); ctx.strokeStyle = ACCENT; ctx.lineWidth = 10; ctx.globalAlpha = glow; [[0, 60, 110, 90], [-110, -80, 50, 56], [-42, -140, 50, 56], [42, -140, 50, 56], [110, -80, 50, 56]].forEach(([px, py, rx, ry]) => { ctx.beginPath(); ctx.ellipse(px, py, rx, ry, 0, 0, 6.283); ctx.stroke(); }); ctx.restore(); }
    ctx.restore();
  }
  /** dedo em corte lateral: ossos, pele/pelo e a garra que recolhe (ext 0) e estende (ext 1) */
  function toeSection(ctx, x, y, s, ext) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.globalAlpha = 0.45; flat(ctx, [[-360, -120], [100, -150], [250, -110], [330, -20], [320, 60], [200, 110], [-360, 110]], '#E8975A', 6); ctx.globalAlpha = 1;
    ctx.strokeStyle = '#BC6A50'; ctx.lineWidth = 6; ctx.setLineDash([16, 10]); ctx.beginPath(); trace(ctx, smooth([[-360, -120], [100, -150], [250, -110], [330, -20], [320, 60], [200, 110], [-360, 110]], true, 6), false); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(188,106,80,0.25)'; ctx.beginPath(); trace(ctx, smooth([[-360, 40], [200, 30], [300, 70], [200, 110], [-360, 110]], true, 4)); ctx.fill();
    flat(ctx, [[150, 90], [260, 70], [320, 80], [300, 120], [160, 120]], PAD, 4);
    ctx.fillStyle = '#F4EADA'; ctx.strokeStyle = '#9A8670'; ctx.lineWidth = 4; const bone = (x0, y0, x1, y1, r) => { ctx.beginPath(); trace(ctx, smooth(limb([[x0, y0], [x1, y1]], [r, r * 0.8]), true, 3)); ctx.fill(); ctx.stroke(); };
    bone(-340, 0, -80, -10, 30); bone(-70, -10, 110, -20, 26);
    const a = lerp(-1.05, 0.25, ext), j = [124, -22], tip = [j[0] + Math.cos(a) * 120, j[1] + Math.sin(a) * 120];
    bone(j[0], j[1], j[0] + Math.cos(a) * 70, j[1] + Math.sin(a) * 70, 22);
    ctx.save(); ctx.translate(j[0] + Math.cos(a) * 60, j[1] + Math.sin(a) * 60); ctx.rotate(a); ctx.fillStyle = CLAW; ctx.beginPath(); ctx.moveTo(0, -24); ctx.quadraticCurveTo(90, -30, 130, 30); ctx.quadraticCurveTo(70, 0, 0, 22); ctx.fill(); ctx.strokeStyle = INKC; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
    // tendão/ligamento (linha âmbar) que puxa a garra
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-300, 40); ctx.quadraticCurveTo(0, 50, j[0] + Math.cos(a + 1.2) * 40, j[1] + Math.sin(a + 1.2) * 40); ctx.stroke();
    ctx.restore();
  }
  function shotScience(ctx, t) {
    const td = on2s(t);
    ctx.drawImage(sciPaper(), 0, 0);
    if (t < P.pads) {   // apoiados sobre os dedos: Pingo de perfil andando devagar, pontos de apoio marcados
      const k = clamp((t - P.digi) / 0.5);
      drawBigCat(ctx, 'pingo', { x: 430, y: 1180, s: 1.25, walk: (td - P.digi) * 0.5, moving: 0.8, tail: td }, td);
      [[575, 1172], [620, 1172], [270, 1172], [305, 1172]].forEach(([x, y], i) => { const kk = clamp((t - P.digi - 0.8 - i * 0.2) / 0.3); if (kk > 0) { ctx.save(); ctx.strokeStyle = ACCENT; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(x, y - 4, 34 * outBack(kk), 0, 6.283); ctx.stroke(); ctx.restore(); } });
      ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = INKC; ctx.lineWidth = 4; ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.moveTo(0, 1186); ctx.lineTo(W, 1186); ctx.stroke(); ctx.restore();
    } else if (t < P.claws) {   // coxins: a sola gira para a câmera e amortece o passo
      const k = sm((t - P.pads) / 0.5), sq = Math.max(0, Math.sin((td - P.pads - 4.4) * Math.PI * 1.6)) * ss((td - P.pads - 4.2) / 0.3);
      pawSole(ctx, 540, 960, 2.1 * k, { squash: sq, glow: bell(t, P.pads + 2.9, 0.5) + 0.5 * ss((t - P.pads - 2.6) / 0.3) });
      if (sq > 0.02) { ctx.save(); ctx.strokeStyle = 'rgba(74,46,62,0.5)'; ctx.lineWidth = 5; for (let i = 0; i < 3; i++) { const r = 470 + i * 50 + sq * 40; ctx.beginPath(); ctx.ellipse(540, 980, r, r * 0.9, 0, 0, 6.283); ctx.globalAlpha = sq * (1 - i * 0.3); ctx.stroke(); } ctx.restore(); }
    } else if (t < P.count) {   // garras: recolhe e estende (duas vezes, no ritmo)
      const ext = keys(td, [[P.claws, 0], [P.claws + 0.8, 1], [P.retract - 0.6, 1], [P.retract, 0], [P.extend - 0.1, 0], [P.extend + 0.3, 1]]);
      toeSection(ctx, 500, 980, 1.35, ext);
      pawSole(ctx, 800, 600, 0.5, { claws: ext });
    } else {   // dianteira x traseira
      pawSole(ctx, 290, 800, 1.15, { front: true, glow: 0.7 * ss((t - P.count) / 0.3) });
      pawSole(ctx, 790, 800, 1.05, { front: false, glow: 0.7 * ss((t - P.count - 0.6) / 0.3) });
    }
  }
  function shotLara(ctx, t) {
    const td = on2s(t), tb = talkBeats('lara', t + SCENE_T0);
    ctx.save(); ctx.translate(-120, -100); ctx.scale(1.1, 1.1); ctx.drawImage(brookBack(), 0, 0); ctx.restore();
    sunRays(ctx, t, { x: 200, y: -100, ang: -0.3, len: 1600, n: 4, alpha: 0.16 });
    drawPerson(ctx, 'lara', { x: 430, y: 1080, s: 0.98, t: td, mouth: voiceL('lara', t), smile: 1, look: [6, 5], turn: 0.25, tilt: 3 + 3 * tb.nod, brow: tb.brow, blink: blinkAt(td, [P.lara + 1.8]), armR: { a1: lerp(84, 50, ss((td - P.lara - 1.2) / 0.4)), a2: lerp(100, -30, ss((td - P.lara - 1.2) / 0.4)), open: 1 } });
    // o Pingo passa em primeiro plano, em silêncio
    const px = lerp(-300, 1300, clamp((td - P.lara - 0.3) / 3.4));
    drawBigCat(ctx, 'pingo', { x: px, y: 1700, s: 1.0, walk: td * 1.2, moving: 1, tail: td }, td, { light: { dir: [-1, -0.6], rim: 'rgba(255,236,196,1)', rimW: 4, rimA: 0.6 } });
    leafShadows(ctx, t, [0, 900, W, 1020], { alpha: 0.12, seed: 14 });
  }
  // ---------- o guepardo
  function shotCheetah(ctx, t) {
    const td = on2s(t), page = 1 - sm((t - P.cheetah - 0.6) / 0.8);
    const sav = cachedPainted('s04sav', 2400, 1920, (g, w, h) => {
      g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#F2C9A0'], [0.45, '#F6DDB6'], [0.55, '#D8B67E'], [1, '#B8925E']]); g.fillRect(0, 0, w, h);
      for (let i = 0; i < 6; i++) { const x = rnd(71, i) * w, y = 860 + rnd(72, i) * 40; g.fillStyle = '#8A6A56'; g.fillRect(x - 6, y - 110, 12, 110); g.beginPath(); trace(g, smooth([[x - 140, y - 110], [x - 80, y - 140], [x + 80, y - 146], [x + 140, y - 112], [x, y - 96]], true, 4)); g.fill(); }
      for (let i = 0; i < 60; i++) { g.fillStyle = i % 2 ? '#C9A46E' : '#A88452'; g.fillRect(rnd(73, i) * w, 1050 + rnd(74, i) * 860, 60 + rnd(75, i) * 120, 6); }
    }, 19, 0.6);
    const cam = (td - P.cheetah) * 900;
    ctx.save(); ctx.translate(-((cam * 0.6) % 1200), 0); ctx.drawImage(sav, 0, 0); ctx.drawImage(sav, 2400, 0); ctx.restore();
    drawBigCat(ctx, 'cheetah', { x: 470, y: 1300, s: 1.05, walk: (td - P.cheetah) * 2.6, moving: 1, gait: 'gallop', tail: td * 3 }, td, { light: { dir: [-1, -0.7], rim: 'rgba(255,240,200,1)', rimW: 5, rimA: 0.7 } });
    for (let i = 0; i < 6; i++) { const f = Math.floor(t * 12) + i; ctx.fillStyle = 'rgba(200,170,120,0.5)'; ctx.beginPath(); ctx.ellipse(280 - ((f * 50) % 400), 1290 - rnd(f, 1) * 40, 30 + rnd(f, 2) * 40, 14, 0, 0, 6.283); ctx.fill(); }
    speedLines(ctx, t, 0.28, 540, 900, false);
    if (page > 0.01) {   // começa como uma ilustração pequena na página do Diário e cresce até a tela cheia
      const [lc2] = [ctx.canvas]; const [pc, pg] = layer('chPage'); pg.drawImage(lc2, 0, 0);
      ctx.drawImage(sciPaper(), 0, 0);
      const s = lerp(1, 0.46, page), w = W * s, h = H * s * 0.62, x = 540 - w / 2, y = 960 - h / 2;
      ctx.save(); ctx.fillStyle = 'rgba(59,42,69,0.25)'; ctx.fillRect(x + 12, y + 14, w, h); ctx.drawImage(pc, 0, (H - H * 0.62) / 2, W, H * 0.62, x, y, w, h); ctx.strokeStyle = PLUM; ctx.lineWidth = 6; ctx.strokeRect(x, y, w, h); ctx.restore();
    }
  }
  function shotGrip(ctx, t) {
    const td = on2s(t), push = Math.max(0, Math.sin((td - P.grip) * Math.PI * 1.4));
    ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#F2D2A8'], [0.6, '#D8B67E'], [1, '#A8844E']]); ctx.fillRect(0, 0, W, H);
    // pata do guepardo em close (lateral): perna vem na diagonal, dedos abertos, garras escuras cravadas no chão
    ctx.fillStyle = '#B8925E'; ctx.fillRect(0, 1230, W, 700);
    ctx.save(); ctx.translate(560, 1150); ctx.scale(0.85, 0.85); ctx.rotate(-0.18);
    const legP = smooth([[-420, -1000], [-150, -1000], [40, -330], [230, -150], [330, -40], [300, 20], [-260, 30], [-300, -150], [-350, -500]], true, 5);
    ctx.fillStyle = '#E6B864'; ctx.beginPath(); trace(ctx, legP); ctx.fill();
    clipTo(ctx, legP, () => { ctx.fillStyle = '#C8954A'; ctx.beginPath(); trace(ctx, smooth([[-60, -1000], [-150, -1000], [80, -300], [330, -40], [300, 30], [120, 30]], true, 4)); ctx.fill(); ctx.fillStyle = '#2A1E18'; for (let i = 0; i < 22; i++) blobAt(ctx, -360 + rnd(81, i) * 420 + (rnd(85, i) * 0.6) * 300, -960 + rnd(82, i) * 900, 14 + rnd(83, i) * 6, 90 + i, 6, 0.95); });
    [[-200, 8], [-80, 22], [40, 26], [160, 18]].forEach(([x, y], i) => {
      ctx.fillStyle = i % 2 ? '#D9A858' : '#E2B262'; ctx.beginPath(); ctx.ellipse(x, y - 34, 70, 58, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#26201C'; ctx.beginPath(); ctx.moveTo(x + 34, y - 8); ctx.quadraticCurveTo(x + 96, y + 20 + 26 * push, x + 70, y + 96 + 30 * push); ctx.quadraticCurveTo(x + 50, y + 40, x + 6, y + 14); ctx.fill();
    });
    ctx.restore();
    ctx.fillStyle = 'rgba(160,124,80,0.9)'; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.ellipse(300 + rnd(86, i) * 520, 1236 + rnd(87, i) * 16, 30 + rnd(88, i) * 30, 10, 0, 0, 6.283); ctx.fill(); }
    for (let i = 0; i < 12; i++) { const k = clamp((td - P.grip - 0.2 - (i % 4) * 0.4) % 1.6); ctx.fillStyle = `rgba(200,170,120,${0.7 * (1 - k)})`; ctx.beginPath(); ctx.ellipse(300 + i * 50 + k * 200, 1230 - k * 260 * (0.5 + rnd(84, i)), 20 + k * 30, 16 + k * 20, 0, 0, 6.283); ctx.fill(); }
    // marcas das garras no chão
    ctx.strokeStyle = '#7A5A36'; ctx.lineWidth = 8; ctx.lineCap = 'round'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(440 + i * 100, 1270); ctx.lineTo(380 + i * 100 - 40 * push, 1330); ctx.stroke(); }
  }
  /** a pegada enche a tela; o centro vira pupila (passa para a cena 5) */
  function shotPawFill(ctx, t) {
    const k = sm((t - P.pawFill) / 1.2);
    ctx.fillStyle = '#E6CDA6'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(540, 980); ctx.scale(lerp(1.2, 9, k), lerp(1.2, 9, k)); pawPrint(ctx, '#3B2A45', 0, 7); ctx.restore();
    const pk = clamp((t - P.pawFill - 0.7) / 0.6); if (pk > 0) { ctx.fillStyle = `rgba(140,193,82,${pk})`; ctx.beginPath(); ctx.ellipse(540, 960, 900 * pk, 1100 * pk, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#1C1420'; ctx.beginPath(); ctx.ellipse(540, 960, 110 + 80 * pk, 700, 0, 0, 6.283); ctx.fill(); }
  }
  function draw(ctx, t) {
    if (t < P.crec - 0.25) shotBridge(ctx, t);
    else if (t < P.crec + 0.4) shotCrec(ctx, t);
    else if (t < P.whisper) shotLook(ctx, t);
    else if (t < P.freeze) shotWhisper(ctx, t);
    else if (t < P.digi) { shotWhisper(ctx, t); const k = clamp((t - P.freeze) / 0.25); ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${k})`; ctx.fillRect(0, 0, W, H); ctx.restore(); ctx.save(); ctx.strokeStyle = CREAM; ctx.lineWidth = 40 * k; ctx.strokeRect(0, 0, W, H); ctx.restore(); }
    else if (t < P.lara) shotScience(ctx, t);
    else if (t < P.cheetah) shotLara(ctx, t);
    else if (t < P.grip) shotCheetah(ctx, t);
    else if (t < P.pawFill) shotGrip(ctx, t);
    else shotPawFill(ctx, t);
    if (t < P.digi || (t >= P.lara && t < P.pawFill)) vignette(ctx, '40,30,50', 0.28);
  }
  function ui(ctx, t) {
    if (t >= P.digi && t < P.pads) uiCard(ctx, t, P.digi + 0.6, P.pads - 0.1, 'apoiados sobre os dedos', 540, 520, { size: 52, accent: true });
    if (t >= P.pads && t < P.claws) { uiCard(ctx, t, P.pads + 2.6, P.claws - 0.1, 'COXINS', 540, 320, { size: 70, accent: true }); uiCard(ctx, t, P.pads + 4.2, P.claws - 0.1, 'amortecem os passos', 540, 1560 - 240, { size: 46 }); }
    if (t >= P.claws && t < P.count) { const ext = keys(t, [[P.claws, 0], [P.claws + 0.8, 1], [P.retract - 0.6, 1], [P.retract, 0], [P.extend - 0.1, 0], [P.extend + 0.3, 1]]) > 0.5; uiCard(ctx, t, P.claws + 0.4, P.count - 0.1, ext ? 'garra estendida' : 'garra recolhida', 330, 380, { size: 54, accent: ext }); }
    if (t >= P.count && t < P.lara) { uiCard(ctx, t, P.count + 0.2, P.lara - 0.1, 'garras guardadas, protegidas', 540, 360, { size: 46, accent: true }); uiCard(ctx, t, P.count + 1.2, P.lara - 0.1, 'dianteira: 5 dedos', 290, 1100, { size: 42 }); uiCard(ctx, t, P.count + 1.8, P.lara - 0.1, 'traseira: 4 dedos', 790, 1100, { size: 42, accent: true }); }
    if (t >= P.cheetah && t < P.grip) speciesTag(ctx, t, P.cheetah + 1.2, P.grip, 'GUEPARDO', 'Acinonyx jubatus', 600, 600, 0);
    if (t >= P.grip && t < P.pawFill) uiCard(ctx, t, P.grip + 1.6, P.pawFill - 0.1, 'garras pouco retráteis = tração', 540, 420, { size: 44, accent: true });
  }
  const sfx = (E) => [['CREC!', E.crec, 0.5, 560, 760, 220, -0.1], ['psiu...', E.whisper - 0.05, 0.6, 820, 520, 110, 0.12], ['VUUSH!', E.cheetah + 0.8, 0.5, 300, 700, 170, -0.12]];
  CENAS.s04 = { draw, ui, sfx, capY: (t) => (t >= P.pads && t < P.claws ? 1450 : 1390) };
})();
