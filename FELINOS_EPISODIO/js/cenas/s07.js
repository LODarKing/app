// Cena 07 — Bigodes que sentem o mundo (requisito 5: função dos bigodes).
// Passagem estreita entre caixas -> os bigodes tocam as bordas (ondas gráficas = só recurso visual de toque, não sonar)
// -> raiz da vibrissa (folículo cheio de nervos) -> o Pingo atravessa -> Miguel -> o Pingo olha para ele.
'use strict';
(() => {
  const room = () => cachedPainted('s07room', 1080, 1920, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#C9A9C2'], [0.55, '#E2C2B0'], [0.56, '#B88A76'], [1, '#9A6E5E']]); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#A87E6C' : '#B08672'; g.fillRect(0, 1060 + i * 110, w, 104); }
    g.fillStyle = 'rgba(255,240,220,0.4)'; g.fillRect(620, 160, 300, 420); g.fillStyle = '#8A6A6E'; g.fillRect(764, 160, 12, 420); g.fillRect(620, 364, 300, 12);
  }, 23, 0.55);
  function box(ctx, x, y, w, h, side) {
    ctx.fillStyle = '#C8955E'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#B07E4A'; ctx.fillRect(side > 0 ? x : x + w - w * 0.22, y, w * 0.22, h);
    ctx.fillStyle = '#D9A86E'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - 30, y - 70); ctx.lineTo(x + 30, y - 70); ctx.fill();
    ctx.fillStyle = 'rgba(240,230,200,0.75)'; ctx.fillRect(x + w * 0.42, y - 10, w * 0.16, h * 0.5);
    ctx.strokeStyle = 'rgba(120,80,50,0.5)'; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
  }
  // ondas de toque nas pontas dos bigodes
  function ripple(ctx, x, y, t, t0, col = ACCENT) {
    const k = ((t - t0) % 0.9) / 0.9; if (t < t0) return;
    ctx.save(); ctx.strokeStyle = col; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { const kk = (k + i / 3) % 1; ctx.globalAlpha = 1 - kk; ctx.lineWidth = 7 * (1 - kk) + 2; ctx.beginPath(); ctx.arc(x, y, 14 + 70 * kk, 0, 6.283); ctx.stroke(); } ctx.restore();
  }
  function shotGap(ctx, t) {
    const td = on2s(t), app = sm(t / P.touch), z = lerp(1.0, 1.55, app);
    ctx.drawImage(room(), 0, 0);
    sunRays(ctx, t, { x: 700, y: 120, ang: -0.45, len: 1500, n: 3, width: 90, alpha: 0.18 });
    ctx.save(); ctx.translate(540, 1300); ctx.scale(z, z); ctx.translate(-540, -1300);
    box(ctx, -140, 800, 520, 700, 1); box(ctx, 700, 760, 540, 740, -1);
    ctx.fillStyle = 'rgba(40,20,30,0.35)'; ctx.fillRect(380, 820, 320, 680);
    const touch = ss((td - P.touch) / 0.3);
    drawPingo(ctx, tp(ctx, { x: 540, y: 1560, s: lerp(0.5, 0.62, app), dilate: 0.6, look: [0, 0], tail: td, earL: -6, earR: -6, whiskBend: touch * (0.6 + 0.2 * Math.sin(td * 6)), blink: blinkAt(td, [2.2, 6.0]), tilt: 3 * Math.sin(td * 0.9) }));
    ctx.restore();
    if (t >= P.touch) { const sc = z * 0.62; [-1, 1].forEach((sd) => ripple(ctx, 540 + sd * (380 - 540 + 540) * 0 + sd * 150 * sc / 0.62 * 0.62 + (sd < 0 ? -0 : 0), 1300 + (1560 - 0.62 * 430 + 60 - 1300) * z, t, P.touch)); }
    leafShadows(ctx, t, [0, 0, W, H], { alpha: 0.08, seed: 19 });
  }
  // folículo: corte da pele com a raiz funda do bigode, seio de sangue e nervos
  function shotFollicle(ctx, t) {
    const td = on2s(t), k = sm((t - P.follicle) / 0.6), wig = Math.sin(td * 5) * 0.06 * ss((t - P.follicle - 3.2) / 0.5);
    ctx.fillStyle = '#3A2E46'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#E8975A'; ctx.fillRect(0, 0, W, 520); for (let i = 0; i < 60; i++) { ctx.strokeStyle = i % 2 ? '#C2703F' : '#F2B07A'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(rnd(111, i) * W, 500); ctx.lineTo(rnd(111, i) * W - 40, 380 + rnd(112, i) * 60); ctx.stroke(); }
    ctx.fillStyle = '#F2C4B4'; ctx.fillRect(0, 520, W, 1400);                           // pele (corte)
    ctx.fillStyle = '#E8A898'; for (let y = 600; y < 1800; y += 90) ctx.fillRect(0, y, W, 8);
    const fx = 540;
    // seio sanguíneo e cápsula do folículo
    ctx.fillStyle = '#C24E68'; ctx.beginPath(); ctx.ellipse(fx, 1080, 120 * k, 340 * k, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#F6DCD2'; ctx.beginPath(); ctx.ellipse(fx, 1080, 64 * k, 300 * k, 0, 0, 6.283); ctx.fill();
    // nervos (fios âmbar até a borda do quadro)
    for (let i = 0; i < 7; i++) { const kk = clamp((t - P.follicle - 1.0 - i * 0.12) / 0.6); if (kk <= 0) continue; ctx.strokeStyle = ACCENT; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(fx + (i - 3) * 14, 1380); const ex = fx + (i - 3) * 120 + 60, ey = 1880; ctx.quadraticCurveTo(fx + (i - 3) * 60, 1600, lerp(fx + (i - 3) * 14, ex, kk), lerp(1380, ey, kk)); ctx.stroke(); }
    // a vibrissa: grossa, entra fundo na pele e sai acima do pelo
    ctx.save(); ctx.translate(fx, 1300); ctx.rotate(wig); ctx.fillStyle = '#F8F4EE'; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.lineTo(4, -1300); ctx.lineTo(-4, -1300); ctx.fill(); ctx.strokeStyle = '#8A7A80'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#E8E0D8'; ctx.beginPath(); ctx.ellipse(0, 0, 28, 40, 0, 0, 6.283); ctx.fill(); ctx.restore();
    // vento/movimento do ar: linhas que balançam o bigode
    if (t > P.follicle + 3.2) { ctx.save(); ctx.strokeStyle = 'rgba(246,238,228,0.7)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let i = 0; i < 4; i++) { const x = ((td * 300 + i * 260) % 1300) - 160, y = 140 + i * 70; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 80, y - 20, x + 160, y); ctx.stroke(); } ctx.restore(); }
  }
  function shotThrough(ctx, t) {
    const td = on2s(t), k = clamp((td - P.through) / 3.2), z = lerp(1.3, 1.0, k);
    ctx.drawImage(room(), 0, 0);
    ctx.save(); ctx.translate(540, 1300); ctx.scale(z, z); ctx.translate(-540, -1300);
    box(ctx, -140, 800, 520, 700, 1); box(ctx, 700, 760, 540, 740, -1);
    ctx.restore();
    drawPingo(ctx, { x: 540, y: lerp(1500, 1840, k), s: lerp(0.62, 1.05, k), dilate: 0.5, tail: td, look: [0, 2], wiggle: 0.15 * Math.sin(td * 8), whiskBend: 0.4 * (1 - k), headDy: 10 * Math.abs(Math.sin(td * 6)) });
  }
  function shotMiguel(ctx, t) {
    const td = on2s(t), tb = talkBeats('miguel', t + SCENE_T0);
    ctx.save(); ctx.translate(-160, -160); ctx.scale(1.15, 1.15); ctx.drawImage(room(), 0, 0); ctx.restore();
    drawPerson(ctx, 'miguel', { x: 520, y: 1060, s: 0.98, t: td, mouth: voiceL('miguel', t), smile: 1, look: [6, 8], turn: 0.25, tilt: 4 + 3 * tb.nod, brow: 0.3 + 0.5 * tb.brow, blink: blinkAt(td, [P.miguel + 1.3]), armR: { a1: lerp(84, 50, ss((td - P.miguel - 0.8) / 0.3)), a2: lerp(100, 40, ss((td - P.miguel - 0.8) / 0.3)), point: 1 } });
    leafShadows(ctx, t, [0, 0, W, H], { alpha: 0.07, seed: 20 });
  }
  function shotLook(ctx, t) {
    const td = on2s(t);
    ctx.drawImage(room(), 0, 0);
    drawPingo(ctx, { x: 540, y: 1700, s: 1.1, dilate: 0.35, look: [-8, -2], tilt: -10, tail: td, blink: keys(td, [[P.look + 0.4, 0], [P.look + 0.6, 0.85], [P.look + 1.1, 0.85], [P.look + 1.3, 0]]), whiskFwd: 0.4 });
  }
  function draw(ctx, t) {
    if (t < P.follicle) shotGap(ctx, t);
    else if (t < P.through) shotFollicle(ctx, t);
    else if (t < P.miguel) shotThrough(ctx, t);
    else if (t < P.look) shotMiguel(ctx, t);
    else shotLook(ctx, t);
    vignette(ctx, '50,25,50', 0.28);
  }
  function ui(ctx, t) {
    if (t < P.follicle) uiCard(ctx, t, 2.0, P.follicle - 0.1, 'VIBRISSAS', 540, 330, { size: 70, accent: true });
    if (t >= P.follicle && t < P.through) { uiCard(ctx, t, P.follicle + 0.6, P.through - 0.1, 'raiz funda, cheia de nervos', 540, 640, { size: 44, accent: true }); uiCard(ctx, t, P.follicle + 3.3, P.through - 0.1, 'sentem contatos e o movimento do ar', 540, 300, { size: 38 }); }
    if (t >= P.through && t < P.miguel) uiCard(ctx, t, P.through + 0.4, P.miguel - 0.1, 'ajudam a explorar espaços próximos', 540, 330, { size: 40, accent: true });
  }
  const sfx = (E) => [['tic', E.touch, 0.4, 230, 980, 110, -0.1], ['tic', E.touch + 0.5, 0.4, 860, 960, 110, 0.1]];
  CENAS.s07 = { draw, ui, sfx, capY: (t) => (t < P.follicle || (t >= P.through && t < P.miguel) ? 1000 : 1390) };   // nas caixas, a legenda sobe para não cobrir o Pingo
})();
